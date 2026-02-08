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

    // ✅ Find all non-withdrawn earnings (like bulk withdraw)
    const earnings = await prisma.referralEarning.findMany({
      where: {
        referrerId: userId,
        withdrawn: false,
        status: 'COMPLETED'
      },
      include: {
        investment: true
      }
    })

    if (earnings.length === 0) {
      return reply.code(400).send({
        success: false,
        error: 'No available referral earnings to reinvest'
      })
    }

    const now = new Date()
    
    // ✅ Filter by 31-day rule and ACTIVE investment status
    const availableEarnings = earnings.filter(earning => {
      if (!earning.investment?.createdAt) return false
      if (earning.investment.status !== 'ACTIVE') return false
      const investmentDate = new Date(earning.investment.createdAt)
      const daysPassed = Math.floor((now.getTime() - investmentDate.getTime()) / (1000 * 60 * 60 * 24))
      return daysPassed >= 31
    })

    if (availableEarnings.length === 0) {
      return reply.code(400).send({
        success: false,
        error: 'No bonuses available yet (31 days required or investment withdrawn)'
      })
    }

    const availableAmount = availableEarnings.reduce((sum, e) => sum + Number(e.amount), 0)

    const currentAmount = Number(investment.amount)
    const newTotalAmount = currentAmount + availableAmount

    const { package: newPackage, roi: newROI } = CommissionService.determineNewPackage(newTotalAmount)
    const upgraded = CommissionService.isUpgraded(investment.plan.name, newPackage)

    let activationDate: Date | null = null

    if (upgraded) {
      const { CalculationsService } = await import('../../../services/investments/calculations.service')
      activationDate = CalculationsService.getNextActivationDate(now)
    }

    // ✅ CRITICAL: Use transaction for atomic operations
    await prisma.$transaction(async (tx) => {
      // Mark all earnings as withdrawn
      await tx.referralEarning.updateMany({
        where: {
          id: { in: availableEarnings.map(e => e.id) }
        },
        data: {
          withdrawn: true,
          withdrawnAt: now,
          status: 'COMPLETED'
        }
      })

      // Update investment
      await tx.investment.update({
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

      // Create reinvest record
      await tx.investmentReinvest.create({
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
