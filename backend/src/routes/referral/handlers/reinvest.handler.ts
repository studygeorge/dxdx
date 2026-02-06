import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { ReinvestBody } from '../types/referral.types'
import { CommissionService } from '../services/commission.service'
import { WithdrawalService } from '../services/withdrawal.service'

const prisma = new PrismaClient()

export async function reinvestToInvestmentHandler(
  request: FastifyRequest<{ Body: ReinvestBody }>,
  reply: FastifyReply
) {
  try {
    const userId = request.currentUser!.id
    const { investmentId } = request.body

    if (!investmentId) {
      return reply.code(400).send({
        success: false,
        error: 'Investment ID is required'
      })
    }

    const investment = await prisma.investment.findFirst({
      where: {
        id: investmentId,
        userId,
        status: 'ACTIVE'
      },
      include: { plan: true }
    })

    if (!investment) {
      return reply.code(404).send({
        success: false,
        error: 'Investment not found or not active'
      })
    }

    const availableItems = await WithdrawalService.collectAvailableEarnings(userId)

    if (availableItems.length === 0) {
      return reply.code(400).send({
        success: false,
        error: 'No available referral earnings to reinvest'
      })
    }

    const availableAmount = availableItems.reduce((sum, item) => sum + item.amount, 0)

    await WithdrawalService.markEarningsAsWithdrawn(availableItems, userId)

    const currentAmount = Number(investment.amount)
    const newTotalAmount = currentAmount + availableAmount

    const { package: newPackage, roi: newROI } = CommissionService.determineNewPackage(newTotalAmount)
    const upgraded = CommissionService.isUpgraded(investment.plan.name, newPackage)

    const now = new Date()
    let activationDate: Date | null = null

    if (upgraded) {
      const { CalculationsService } = await import('../../../services/investments/calculations.service')
      activationDate = CalculationsService.getNextActivationDate(now)
    }

    await prisma.investment.update({
      where: { id: investmentId },
      data: {
        amount: newTotalAmount,
        ...(upgraded ? {
          pendingUpgradeROI: newROI,
          pendingUpgradePlan: newPackage,
          upgradeActivationDate: activationDate,
          upgradeRequestDate: now
        } : {
          roi: newROI,
          effectiveROI: newROI
        })
      }
    })

    await prisma.investmentReinvest.create({
      data: {
        investmentId,
        userId,
        reinvestedAmount: availableAmount,
        fromProfit: availableAmount,
        oldPackage: investment.plan.name,
        newPackage,
        oldROI: Number(investment.roi),
        newROI,
        oldAmount: currentAmount,
        newAmount: newTotalAmount,
        upgraded,
        status: 'COMPLETED',
        requestDate: now,
        processedDate: now
      }
    })

    return reply.send({
      success: true,
      message: upgraded 
        ? `Referral profit reinvested! New ${newROI}% ROI will activate on ${activationDate?.toLocaleDateString('ru-RU')}`
        : 'Referral profit reinvested successfully',
      data: {
        oldAmount: currentAmount,
        reinvestedAmount: availableAmount,
        newAmount: newTotalAmount,
        oldPackage: investment.plan.name,
        newPackage,
        oldROI: Number(investment.roi),
        newROI,
        upgraded,
        activationDate: activationDate ? activationDate.toISOString() : null
      }
    })

  } catch (error: any) {
    console.error('❌ Error reinvesting referral profit:', error)
    return reply.code(500).send({
      success: false,
      error: 'Failed to reinvest referral profit'
    })
  }
}
