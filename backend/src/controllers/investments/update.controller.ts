// dxcapai-backend/src/controllers/investments/update.controller.ts

import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { ConfirmPaymentBody, UpgradeInvestmentBody } from '../../types/investments.types'
import { PACKAGES } from '../../constants/investments.constants'
import { ValidationService } from '../../services/investments/validation.service'
import { CalculationsService } from '../../services/investments/calculations.service'

const prisma = new PrismaClient()

export class UpdateInvestmentsController {
  static async confirmPayment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.currentUser!.id
      const { id } = request.params as { id: string }
      const { txHash } = request.body as ConfirmPaymentBody

      const isEthTx = txHash.startsWith('0x') && txHash.length === 66
      const isTronTx = txHash.length === 64 && /^[a-f0-9]+$/i.test(txHash)

      if (!txHash || (!isEthTx && !isTronTx)) {
        return reply.code(400).send({
          success: false,
          error: 'Valid transaction hash is required'
        })
      }

      const investment = await prisma.investment.findFirst({
        where: {
          id,
          userId,
          status: 'PENDING'
        }
      })

      if (!investment) {
        return reply.code(404).send({
          success: false,
          error: 'Investment not found or already confirmed'
        })
      }

      const existingTx = await prisma.investment.findFirst({
        where: {
          transactionHash: txHash,
          id: { not: id }
        }
      })

      if (existingTx) {
        return reply.code(400).send({
          success: false,
          error: 'This transaction hash is already used'
        })
      }

      const now = new Date()
      const endDate = new Date(now)
      endDate.setMonth(endDate.getMonth() + investment.duration)

      const updatedInvestment = await prisma.investment.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          transactionHash: txHash,
          startDate: now,
          endDate
        }
      })

      await prisma.auditLog.create({
        data: {
          userId,
          action: 'CONFIRM_INVESTMENT',
          resource: 'INVESTMENT',
          details: `Confirmed investment ${id} with tx ${txHash}`,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          success: true
        }
      })

      return reply.code(200).send({
        success: true,
        message: 'Investment confirmed successfully',
        data: updatedInvestment
      })

    } catch (error: any) {
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to confirm payment'
      })
    }
  }

  static async upgradeInvestment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.currentUser!.id
      const { id: investmentId } = request.params as { id: string }
      const { 
        additionalAmount, 
        newPackage, 
        paymentMethod, 
        senderWalletAddress,
        accumulatedInterest 
      } = request.body as UpgradeInvestmentBody

      console.log('🔄 Upgrade request:', { 
        investmentId, 
        userId, 
        additionalAmount, 
        newPackage, 
        paymentMethod, 
        senderWalletAddress,
        accumulatedInterest 
      })

      if (paymentMethod === 'telegram') {
        if (!senderWalletAddress || senderWalletAddress.trim() === '') {
          return reply.code(400).send({
            success: false,
            error: 'Sender wallet address is required for Telegram payment'
          })
        }

        if (!ValidationService.validateTRC20Address(senderWalletAddress.trim())) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid TRC-20 address format'
          })
        }
      }

      const investment = await prisma.investment.findFirst({
        where: {
          id: investmentId,
          userId,
          status: 'ACTIVE'
        },
        include: {
          plan: true,
          user: {
            select: {
              email: true,
              username: true
            }
          }
        }
      })

      if (!investment) {
        return reply.code(404).send({
          success: false,
          error: 'Investment not found or not active'
        })
      }

      const baseDate = investment.lastUpgradeDate || investment.startDate || investment.createdAt
      const currentDate = (investment.simulatedCurrentDate && investment.simulatedCurrentDate instanceof Date)
        ? investment.simulatedCurrentDate
        : new Date()
      
      const daysPassed = CalculationsService.calculateDaysPassedServer(baseDate, null, currentDate)

      console.log('📅 Date calculation for upgrade:', {
        baseDate: baseDate.toISOString(),
        currentDate: currentDate.toISOString(),
        daysPassed,
        isSimulated: !!(investment.simulatedCurrentDate)
      })

      if (daysPassed === 0) {
        return reply.code(400).send({
          success: false,
          error: 'Cannot upgrade investment on the same day it was created'
        })
      }

      const existingPendingUpgrade = await prisma.investmentUpgrade.findFirst({
        where: {
          investmentId,
          status: 'PENDING'
        }
      })

      if (existingPendingUpgrade) {
        return reply.code(400).send({
          success: false,
          error: 'You already have a pending upgrade request for this investment'
        })
      }

      if (investment.lastUpgradeDate) {
        const lastUpgrade = new Date(investment.lastUpgradeDate)
        const today = currentDate
        const isSameDay = 
          lastUpgrade.getFullYear() === today.getFullYear() &&
          lastUpgrade.getMonth() === today.getMonth() &&
          lastUpgrade.getDate() === today.getDate()

        if (isSameDay) {
          return reply.code(400).send({
            success: false,
            error: 'Cannot upgrade twice in one day. Please wait until tomorrow.'
          })
        }
      }

      const packageKey = newPackage.toLowerCase()
      const newPackageInfo = PACKAGES[packageKey as keyof typeof PACKAGES]
      
      if (!newPackageInfo) {
        console.log('❌ Invalid package key:', packageKey, 'Available:', Object.keys(PACKAGES))
        return reply.code(400).send({
          success: false,
          error: `Invalid package. Available packages: ${Object.keys(PACKAGES).join(', ')}`
        })
      }

      const currentAmount = Number(investment.amount)
      const totalAmount = currentAmount + additionalAmount
      
      if (totalAmount < newPackageInfo.min) {
        return reply.code(400).send({
          success: false,
          error: `Total amount must be at least $${newPackageInfo.min} for ${newPackageInfo.name} package`
        })
      }

      if (totalAmount > newPackageInfo.max) {
        return reply.code(400).send({
          success: false,
          error: `Total amount must not exceed $${newPackageInfo.max} for ${newPackageInfo.name} package`
        })
      }

      const adminWalletConfig = await prisma.systemConfig.findUnique({
        where: { key: 'STAKING_WALLET_USDT_TRC20' }
      })

      const adminWallet = adminWalletConfig?.value || process.env.ADMIN_TRON_WALLET_ADDRESS

      if (!adminWallet) {
        return reply.code(503).send({
          success: false,
          error: 'Admin wallet not configured. Please contact support.'
        })
      }

      const newEndDate = new Date(investment.endDate!)

      const currentAccumulated = accumulatedInterest !== undefined 
        ? accumulatedInterest 
        : CalculationsService.calculateCurrentReturn(currentAmount, Number(investment.effectiveROI), investment.duration * 30, daysPassed)

      // 🆕 ОТЛОЖЕННАЯ АКТИВАЦИЯ: используем CalculationsService
      const upgradeRequestDate = currentDate
      const activationDate = CalculationsService.getNextActivationDate(upgradeRequestDate)
      
      const oldROI = Number(investment.roi)
      const newROI = newPackageInfo.monthlyRate
      const upgraded = newPackageInfo.name !== investment.plan.name

      console.log('🔥 DEFERRED UPGRADE:', {
        upgraded,
        oldPlan: investment.plan.name,
        newPlan: newPackageInfo.name,
        oldROI: `${oldROI}%`,
        newROI: `${newROI}%`,
        upgradeRequestDate: upgradeRequestDate.toISOString(),
        activationDate: activationDate.toISOString(),
        daysUntilActivation: Math.ceil((activationDate.getTime() - upgradeRequestDate.getTime()) / (1000 * 60 * 60 * 24))
      })

      // 🆕 Обновляем инвестицию с pending полями
      await prisma.investment.update({
        where: { id: investmentId },
        data: {
          amount: totalAmount,
          accumulatedInterest: currentAccumulated,
          // Если апгрейд — сохраняем в pending, иначе применяем сразу
          ...(upgraded ? {
            pendingUpgradeROI: newROI,
            pendingUpgradePlan: newPackageInfo.name,
            upgradeActivationDate: activationDate,
            upgradeRequestDate: upgradeRequestDate
          } : {
            roi: newROI,
            effectiveROI: newROI,
            lastUpgradeDate: upgradeRequestDate
          })
        }
      })

      // Создаём запись апгрейда
      const upgrade = await prisma.investmentUpgrade.create({
        data: {
          investmentId,
          userId,
          oldPackage: investment.plan.name,
          newPackage: newPackageInfo.name,
          oldAPY: oldROI,
          newAPY: newROI,
          additionalAmount,
          oldEndDate: investment.endDate!,
          newEndDate,
          adminWalletAddress: adminWallet,
          senderWalletAddress: senderWalletAddress?.trim() || null,
          accumulatedInterest: currentAccumulated,
          status: 'PENDING',
          upgradeType: upgraded ? 'PACKAGE_CHANGE' : 'AMOUNT_INCREASE'
        }
      })

      console.log('✅ Upgrade request created:', upgrade.id)
      console.log('💰 Accumulated interest saved:', currentAccumulated)

      return reply.send({
        success: true,
        message: upgraded 
          ? `Upgrade scheduled for ${activationDate.toLocaleDateString('ru-RU')}. New ${newROI}% ROI will be active from that date.`
          : 'Amount increased successfully',
        data: {
          upgradeId: upgrade.id,
          investmentId: investment.id,
          oldPackage: investment.plan.name,
          newPackage: newPackageInfo.name,
          oldROI: oldROI,
          newROI: newROI,
          oldAmount: currentAmount,
          additionalAmount,
          totalAmount,
          upgraded,
          activationDate: upgraded ? activationDate.toISOString() : null,
          newEndDate: newEndDate.toISOString(),
          adminWallet: adminWallet,
          senderWallet: senderWalletAddress?.trim() || null,
          accumulatedInterest: currentAccumulated,
          status: 'PENDING',
          message: paymentMethod === 'telegram' 
            ? `Please send ${additionalAmount} USDT (TRC-20) to the admin wallet`
            : upgraded
              ? `After admin approval, your new ${newROI}% rate will activate on ${activationDate.toLocaleDateString('ru-RU')}`
              : `After admin approval, your balance will be $${totalAmount.toFixed(2)}`
        }
      })

    } catch (error: any) {
      console.error('❌ Error upgrading investment:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to upgrade investment'
      })
    }
  }

  static async cancelInvestment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.currentUser!.id
      const { id } = request.params as { id: string }

      const investment = await prisma.investment.findFirst({
        where: {
          id,
          userId,
          status: 'PENDING'
        }
      })

      if (!investment) {
        return reply.code(404).send({
          success: false,
          error: 'Investment not found or cannot be cancelled'
        })
      }

      await prisma.investment.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          completedAt: new Date()
        }
      })

      return reply.code(200).send({
        success: true,
        message: 'Investment cancelled successfully'
      })

    } catch (error: any) {
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to cancel investment'
      })
    }
  }
}
