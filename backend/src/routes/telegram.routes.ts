import { FastifyInstance } from 'fastify'
import { TelegramController } from '../controllers/telegram.controller'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const PACKAGES: Record<string, { name: string; apy: number; min: number; max: number }> = {
  starter: { name: 'Starter', apy: 14, min: 100, max: 999 },
  advanced: { name: 'Advanced', apy: 17, min: 1000, max: 2999 },
  pro: { name: 'Pro', apy: 20, min: 3000, max: 4999 },
  elite: { name: 'Elite', apy: 22, min: 6000, max: 100000 }
}

const DURATION_BONUSES: Record<number, { durationBonus: number; bonusAmount: number }> = {
  3: { durationBonus: 0, bonusAmount: 0 },
  6: { durationBonus: 1.5, bonusAmount: 200 },
  12: { durationBonus: 3, bonusAmount: 500 }
}

// ✅ ФУНКЦИЯ ДИНАМИЧЕСКОГО РАСЧЕТА БОНУСА (согласована с investments.routes.ts)
function getDurationBonus(duration: number, amount: number): number {
  if (duration === 3) return 0
  if (duration === 6 || duration === 12) {
    if (amount >= 1000) return 500
    if (amount >= 500) return 200
  }
  return 0
}

export async function telegramRoutes(app: FastifyInstance) {
  // ===== INVESTMENT ROUTES =====
  app.get('/investment/:id', TelegramController.getInvestmentForBot)
  app.post('/investment/:id/approve', TelegramController.approveInvestment)
  app.delete('/investment/:id', TelegramController.cancelInvestmentFromBot)

  // ===== WITHDRAWAL NOTIFICATION =====
  app.post('/notify-withdrawal', TelegramController.notifyWithdrawal)

  // ===== EARLY WITHDRAWAL ROUTES =====
  
  app.get('/early-withdrawal/:withdrawalId', async (request, reply) => {
    try {
      const { withdrawalId } = request.params as { withdrawalId: string }

      console.log('Telegram bot requesting early withdrawal:', withdrawalId)

      const withdrawal = await prisma.earlyWithdrawal.findUnique({
        where: { id: withdrawalId },
        include: {
          investment: {
            include: {
              plan: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  username: true
                }
              }
            }
          }
        }
      })

      if (!withdrawal) {
        return reply.code(404).send({
          success: false,
          error: 'Early withdrawal not found'
        })
      }

      if (withdrawal.status !== 'PENDING') {
        return reply.code(400).send({
          success: false,
          error: 'Early withdrawal already processed',
          data: null
        })
      }

      return reply.code(200).send({
        success: true,
        data: {
          id: withdrawal.id,
          investmentId: withdrawal.investmentId,
          userId: withdrawal.userId,
          userEmail: withdrawal.investment.user.email,
          username: withdrawal.investment.user.username || 'N/A',
          planName: withdrawal.investment.plan.name,
          investmentAmount: Number(withdrawal.investmentAmount),
          daysInvested: withdrawal.daysInvested,
          earnedInterest: Number(withdrawal.earnedInterest),
          withdrawnProfits: Number(withdrawal.withdrawnProfits || 0),
          totalAmount: Number(withdrawal.totalAmount),
          trc20Address: withdrawal.trc20Address,
          requestDate: withdrawal.requestDate,
          status: withdrawal.status,
          language: withdrawal.investment.language || 'en'
        }
      })

    } catch (error: any) {
      console.error('Error fetching early withdrawal:', error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch early withdrawal data'
      })
    }
  })

  app.post('/early-withdrawal/:withdrawalId/approve', async (request, reply) => {
    try {
      const { withdrawalId } = request.params as { withdrawalId: string }
      const { supportUserId } = request.body as { supportUserId: string }

      console.log('Approving early withdrawal:', withdrawalId, 'by support:', supportUserId)

      const withdrawal = await prisma.earlyWithdrawal.findUnique({
        where: { id: withdrawalId },
        include: {
          investment: true
        }
      })

      if (!withdrawal) {
        return reply.code(404).send({
          success: false,
          error: 'Early withdrawal not found'
        })
      }

      if (withdrawal.status !== 'PENDING') {
        return reply.code(400).send({
          success: false,
          error: 'Early withdrawal already processed'
        })
      }

      await prisma.earlyWithdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: 'APPROVED',
          processedDate: new Date()
        }
      })

      await prisma.investment.update({
        where: { id: withdrawal.investmentId },
        data: {
          status: 'EARLY_WITHDRAWN',
          withdrawalRequested: true,
          completedAt: new Date()
        }
      })

      console.log('✅ Early withdrawal approved:', withdrawalId)
      console.log('Amount withdrawn:', withdrawal.totalAmount)

      return reply.send({
        success: true,
        message: 'Early withdrawal approved successfully',
        data: {
          withdrawalId,
          investmentId: withdrawal.investmentId,
          totalAmount: withdrawal.totalAmount,
          trc20Address: withdrawal.trc20Address
        }
      })

    } catch (error: any) {
      console.error('Error approving early withdrawal:', error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to approve early withdrawal'
      })
    }
  })

  app.post('/early-withdrawal/:withdrawalId/reject', async (request, reply) => {
    try {
      const { withdrawalId } = request.params as { withdrawalId: string }
      const { supportUserId, reason } = request.body as { supportUserId: string; reason?: string }

      console.log('Rejecting early withdrawal:', withdrawalId, 'by support:', supportUserId)

      const withdrawal = await prisma.earlyWithdrawal.findUnique({
        where: { id: withdrawalId },
        include: {
          investment: true
        }
      })

      if (!withdrawal) {
        return reply.code(404).send({
          success: false,
          error: 'Early withdrawal not found'
        })
      }

      if (withdrawal.status !== 'PENDING') {
        return reply.code(400).send({
          success: false,
          error: 'Early withdrawal already processed'
        })
      }

      await prisma.earlyWithdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: 'REJECTED',
          processedDate: new Date()
        }
      })

      await prisma.investment.update({
        where: { id: withdrawal.investmentId },
        data: {
          status: 'ACTIVE',
          withdrawalRequested: false
        }
      })

      console.log('✅ Early withdrawal rejected:', withdrawalId)

      return reply.send({
        success: true,
        message: 'Early withdrawal rejected successfully',
        data: {
          withdrawalId,
          investmentId: withdrawal.investmentId,
          reason: reason || 'Rejected by admin'
        }
      })

    } catch (error: any) {
      console.error('Error rejecting early withdrawal:', error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to reject early withdrawal'
      })
    }
  })

  // ===== PARTIAL WITHDRAWAL ROUTES =====
  
  app.get('/partial-withdrawal/:withdrawalId', async (request, reply) => {
    try {
      const { withdrawalId } = request.params as { withdrawalId: string }

      console.log('Telegram bot requesting partial withdrawal:', withdrawalId)

      const withdrawal = await prisma.partialWithdrawal.findUnique({
        where: { id: withdrawalId },
        include: {
          investment: {
            include: {
              plan: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  username: true
                }
              }
            }
          }
        }
      })

      if (!withdrawal) {
        return reply.code(404).send({
          success: false,
          error: 'Partial withdrawal not found'
        })
      }

      if (withdrawal.status !== 'PENDING') {
        return reply.code(400).send({
          success: false,
          error: 'Partial withdrawal already processed',
          data: null
        })
      }

      const totalWithdrawn = withdrawal.investment.withdrawnProfits.toNumber()

      // ✅ ИСПОЛЬЗУЕМ ДИНАМИЧЕСКИЙ РАСЧЕТ БОНУСА
      const calculatedBonus = getDurationBonus(
        withdrawal.investment.duration,
        Number(withdrawal.investment.amount)
      )
      const withdrawalAmount = Number(withdrawal.amount)
      const isBonus = calculatedBonus > 0 && Math.abs(withdrawalAmount - calculatedBonus) < 0.01

      console.log('🔍 Withdrawal type detection:', {
        withdrawalAmount,
        calculatedBonus,
        duration: withdrawal.investment.duration,
        investmentAmount: Number(withdrawal.investment.amount),
        isBonus,
        withdrawType: isBonus ? 'bonus' : 'profit'
      })

      return reply.code(200).send({
        success: true,
        data: {
          id: withdrawal.id,
          investmentId: withdrawal.investmentId,
          userId: withdrawal.userId,
          userEmail: withdrawal.investment.user.email,
          username: withdrawal.investment.user.username || 'N/A',
          planName: withdrawal.investment.plan.name,
          investmentAmount: Number(withdrawal.investment.amount),
          amount: withdrawalAmount,
          bonusAmount: calculatedBonus,
          totalWithdrawn: totalWithdrawn,
          trc20Address: withdrawal.trc20Address,
          requestDate: withdrawal.requestDate,
          status: withdrawal.status,
          language: withdrawal.investment.language || 'en',
          withdrawType: isBonus ? 'bonus' : 'profit'
        }
      })

    } catch (error: any) {
      console.error('Error fetching partial withdrawal:', error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch partial withdrawal data'
      })
    }
  })

  app.post('/partial-withdrawal/:withdrawalId/approve', async (request, reply) => {
    try {
      const { withdrawalId } = request.params as { withdrawalId: string }
      const { supportUserId, txHash } = request.body as { supportUserId: string; txHash?: string }

      console.log('🟢 Approving partial withdrawal:', withdrawalId, 'by support:', supportUserId)

      const withdrawal = await prisma.partialWithdrawal.findUnique({
        where: { id: withdrawalId },
        include: {
          investment: true
        }
      })

      if (!withdrawal) {
        return reply.code(404).send({
          success: false,
          error: 'Partial withdrawal not found'
        })
      }

      if (withdrawal.status !== 'PENDING') {
        return reply.code(400).send({
          success: false,
          error: 'Partial withdrawal already processed'
        })
      }

      // ✅ ИСПОЛЬЗУЕМ ДИНАМИЧЕСКИЙ РАСЧЕТ БОНУСА
      const calculatedBonus = getDurationBonus(
        withdrawal.investment.duration,
        Number(withdrawal.investment.amount)
      )
      const withdrawalAmount = Number(withdrawal.amount)
      const isBonus = calculatedBonus > 0 && Math.abs(withdrawalAmount - calculatedBonus) < 0.01

      console.log('📊 Withdrawal type detection:', {
        withdrawalAmount,
        calculatedBonus,
        duration: withdrawal.investment.duration,
        investmentAmount: Number(withdrawal.investment.amount),
        isBonus,
        withdrawType: isBonus ? 'bonus' : 'profit'
      })

      await prisma.partialWithdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: 'APPROVED',
          processedDate: new Date(),
          completedDate: new Date(),
          txHash: txHash || `PARTIAL_WITHDRAWAL_${Date.now()}`
        }
      })

      if (isBonus) {
        console.log('🎁 Processing BONUS withdrawal')
        
        await prisma.investment.update({
          where: { id: withdrawal.investmentId },
          data: {
            bonusWithdrawn: true
          }
        })
        
        console.log('✅ Bonus marked as withdrawn in Investment')
      } else {
        console.log('💰 Processing PROFIT withdrawal')
        
        const currentWithdrawn = Number(withdrawal.investment.withdrawnProfits || 0)
        const newWithdrawn = currentWithdrawn + withdrawalAmount
        
        await prisma.investment.update({
          where: { id: withdrawal.investmentId },
          data: {
            withdrawnProfits: newWithdrawn
          }
        })
        
        console.log('✅ Withdrawn profits updated:', {
          previous: currentWithdrawn,
          added: withdrawalAmount,
          new: newWithdrawn
        })
      }

      console.log('✅ Partial withdrawal approved:', withdrawalId)
      console.log('Amount withdrawn:', withdrawalAmount)

      return reply.send({
        success: true,
        message: 'Partial withdrawal approved successfully',
        data: {
          withdrawalId,
          investmentId: withdrawal.investmentId,
          amount: withdrawalAmount,
          trc20Address: withdrawal.trc20Address,
          withdrawType: isBonus ? 'bonus' : 'profit'
        }
      })

    } catch (error: any) {
      console.error('Error approving partial withdrawal:', error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to approve partial withdrawal'
      })
    }
  })

  app.post('/partial-withdrawal/:withdrawalId/reject', async (request, reply) => {
    try {
      const { withdrawalId } = request.params as { withdrawalId: string }
      const { supportUserId, reason } = request.body as { supportUserId: string; reason?: string }

      console.log('🔴 Rejecting partial withdrawal:', withdrawalId, 'by support:', supportUserId)

      const withdrawal = await prisma.partialWithdrawal.findUnique({
        where: { id: withdrawalId },
        include: {
          investment: true
        }
      })

      if (!withdrawal) {
        return reply.code(404).send({
          success: false,
          error: 'Partial withdrawal not found'
        })
      }

      if (withdrawal.status !== 'PENDING') {
        return reply.code(400).send({
          success: false,
          error: 'Partial withdrawal already processed'
        })
      }

      await prisma.partialWithdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: 'REJECTED',
          processedDate: new Date(),
          rejectionReason: reason || 'Rejected by admin'
        }
      })

      console.log('✅ Partial withdrawal rejected:', withdrawalId)
      console.log('Investment fields remain unchanged (no rollback needed)')

      return reply.send({
        success: true,
        message: 'Partial withdrawal rejected successfully',
        data: {
          withdrawalId,
          investmentId: withdrawal.investmentId,
          reason: reason || 'Rejected by admin'
        }
      })

    } catch (error: any) {
      console.error('Error rejecting partial withdrawal:', error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to reject partial withdrawal'
      })
    }
  })

  // ===== FULL WITHDRAWAL ROUTES (используют префикс /full-withdrawal) =====
  
  app.get('/full-withdrawal/:withdrawalId', async (request, reply) => {
    try {
      const { withdrawalId } = request.params as { withdrawalId: string }

      console.log('📥 Telegram bot requesting FULL withdrawal:', withdrawalId)

      const withdrawal = await prisma.withdrawalRequest.findUnique({
        where: { id: withdrawalId },
        include: {
          investment: {
            include: {
              plan: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  username: true
                }
              }
            }
          }
        }
      })

      if (!withdrawal) {
        return reply.code(404).send({
          success: false,
          error: 'Full withdrawal not found'
        })
      }

      if (withdrawal.status !== 'PENDING') {
        return reply.code(400).send({
          success: false,
          error: 'Full withdrawal already processed',
          data: null
        })
      }

      const investedAmount = Number(withdrawal.investment.amount)
      const totalReturn = Number(withdrawal.investment.totalReturn || 0)
      const withdrawnProfits = Number(withdrawal.investment.withdrawnProfits || 0)
      const bonusAmount = Number(withdrawal.investment.bonusAmount || 0)
      
      const totalProfit = totalReturn - investedAmount
      const availableProfit = totalProfit - withdrawnProfits
      const totalWithdrawalAmount = investedAmount + availableProfit + bonusAmount

      console.log('📊 Full withdrawal calculation:', {
        investedAmount,
        totalProfit,
        withdrawnProfits,
        availableProfit,
        bonusAmount,
        totalWithdrawalAmount
      })

      return reply.code(200).send({
        success: true,
        data: {
          id: withdrawal.id,
          investmentId: withdrawal.investmentId,
          userId: withdrawal.investment.userId,
          userEmail: withdrawal.investment.user.email,
          username: withdrawal.investment.user.username || 'N/A',
          planName: withdrawal.investment.plan.name,
          investedAmount: investedAmount,
          totalProfit: totalProfit,
          withdrawnProfits: withdrawnProfits,
          availableProfit: availableProfit,
          bonusAmount: bonusAmount,
          totalAmount: totalWithdrawalAmount,
          trc20Address: withdrawal.trc20Address,
          requestDate: withdrawal.createdAt,
          status: withdrawal.status,
          language: withdrawal.investment.language || 'en'
        }
      })

    } catch (error: any) {
      console.error('❌ Error fetching full withdrawal:', error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch full withdrawal data'
      })
    }
  })

  app.post('/full-withdrawal/:withdrawalId/approve', async (request, reply) => {
    try {
      const { withdrawalId } = request.params as { withdrawalId: string }
      const { supportUserId, txHash } = request.body as { supportUserId: string; txHash?: string }

      console.log('🟢 Approving FULL withdrawal:', withdrawalId, 'by support:', supportUserId)

      const withdrawal = await prisma.withdrawalRequest.findUnique({
        where: { id: withdrawalId },
        include: {
          investment: true
        }
      })

      if (!withdrawal) {
        return reply.code(404).send({
          success: false,
          error: 'Full withdrawal not found'
        })
      }

      if (withdrawal.status !== 'PENDING') {
        return reply.code(400).send({
          success: false,
          error: 'Full withdrawal already processed'
        })
      }

      await prisma.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
          status: 'COMPLETED',
          processedAt: new Date(),
          txHash: txHash || `FULL_WITHDRAWAL_${Date.now()}`
        }
      })

      await prisma.investment.update({
        where: { id: withdrawal.investmentId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          withdrawalRequested: true
        }
      })

      const totalAmount = Number(withdrawal.investment.amount) + 
                         Number(withdrawal.investment.totalReturn || 0) - 
                         Number(withdrawal.investment.amount) -
                         Number(withdrawal.investment.withdrawnProfits || 0) +
                         Number(withdrawal.investment.bonusAmount || 0)

      console.log('✅ Full withdrawal approved:', withdrawalId)
      console.log('💰 Total amount withdrawn:', totalAmount.toFixed(2))

      return reply.send({
        success: true,
        message: 'Full withdrawal approved successfully',
        data: {
          withdrawalId,
          investmentId: withdrawal.investmentId,
          amount: totalAmount,
          trc20Address: withdrawal.trc20Address
        }
      })

    } catch (error: any) {
      console.error('❌ Error approving full withdrawal:', error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to approve full withdrawal'
      })
    }
  })

  app.post('/full-withdrawal/:withdrawalId/reject', async (request, reply) => {
    try {
      const { withdrawalId } = request.params as { withdrawalId: string }
      const { supportUserId, reason } = request.body as { supportUserId: string; reason?: string }

      console.log('🔴 Rejecting FULL withdrawal:', withdrawalId, 'by support:', supportUserId)

      const withdrawal = await prisma.withdrawalRequest.findUnique({
        where: { id: withdrawalId },
        include: {
          investment: true
        }
      })

      if (!withdrawal) {
        return reply.code(404).send({
          success: false,
          error: 'Full withdrawal not found'
        })
      }

      if (withdrawal.status !== 'PENDING') {
        return reply.code(400).send({
          success: false,
          error: 'Full withdrawal already processed'
        })
      }

      await prisma.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
          status: 'REJECTED',
          processedAt: new Date()
        }
      })

      await prisma.investment.update({
        where: { id: withdrawal.investmentId },
        data: {
          withdrawalRequested: false
        }
      })

      console.log('✅ Full withdrawal rejected:', withdrawalId)

      return reply.send({
        success: true,
        message: 'Full withdrawal rejected successfully',
        data: {
          withdrawalId,
          investmentId: withdrawal.investmentId,
          reason: reason || 'Rejected by admin'
        }
      })

    } catch (error: any) {
      console.error('❌ Error rejecting full withdrawal:', error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to reject full withdrawal'
      })
    }
  })

  // ===== LEGACY WITHDRAWAL ROUTES (оставлены для старых ссылок, используют /withdrawal/:id) =====
  app.get('/withdrawal/:id', TelegramController.getWithdrawalRequest)
  app.post('/withdrawal/:id/approve', TelegramController.approveWithdrawal)
  app.post('/withdrawal/:id/reject', TelegramController.rejectWithdrawal)

  // ===== UPGRADE ROUTES =====
  app.get('/upgrade/:upgradeId', async (request, reply) => {
    try {
      const { upgradeId } = request.params as { upgradeId: string }

      console.log('Telegram bot requesting upgrade:', upgradeId)

      const upgrade = await prisma.investmentUpgrade.findUnique({
        where: { id: upgradeId },
        include: {
          investment: {
            include: {
              plan: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  username: true
                }
              }
            }
          }
        }
      })

      if (!upgrade) {
        return reply.code(404).send({
          success: false,
          error: 'Upgrade not found'
        })
      }

      if (upgrade.status !== 'PENDING') {
        return reply.code(400).send({
          success: false,
          error: 'Upgrade already processed',
          data: null
        })
      }

      return reply.code(200).send({
        success: true,
        data: {
          upgradeId: upgrade.id,
          investmentId: upgrade.investmentId,
          userId: upgrade.investment.userId,
          userEmail: upgrade.investment.user.email,
          oldPackage: upgrade.oldPackage,
          newPackage: upgrade.newPackage,
          oldAPY: upgrade.oldAPY,
          newAPY: upgrade.newAPY,
          oldAmount: upgrade.investment.amount,
          additionalAmount: upgrade.additionalAmount,
          totalAmount: Number(upgrade.investment.amount) + Number(upgrade.additionalAmount),
          adminWallet: upgrade.adminWalletAddress || process.env.ADMIN_TRON_WALLET_ADDRESS,
          senderWallet: upgrade.senderWalletAddress,
          accumulatedInterest: upgrade.accumulatedInterest || 0,
          createdAt: upgrade.createdDate,
          language: upgrade.investment.language || 'en'
        }
      })

    } catch (error: any) {
      console.error('Error fetching upgrade:', error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch upgrade data'
      })
    }
  })

  app.post('/upgrade/:upgradeId/approve', async (request, reply) => {
    try {
      const { upgradeId } = request.params as { upgradeId: string }
      const { supportUserId } = request.body as { supportUserId: string }
  
      console.log('Approving upgrade:', upgradeId, 'by support:', supportUserId)
  
      const upgrade = await prisma.investmentUpgrade.findUnique({
        where: { id: upgradeId },
        include: {
          investment: {
            include: {
              plan: true
            }
          }
        }
      })
  
      if (!upgrade) {
        return reply.code(404).send({
          success: false,
          error: 'Upgrade not found'
        })
      }
  
      if (upgrade.status !== 'PENDING') {
        return reply.code(400).send({
          success: false,
          error: 'Upgrade already processed'
        })
      }
  
      const newPackageKey = upgrade.newPackage.toLowerCase()
      const newPackageInfo = PACKAGES[newPackageKey as keyof typeof PACKAGES]
      
      if (!newPackageInfo) {
        console.error('Invalid package key:', newPackageKey, 'Available:', Object.keys(PACKAGES))
        return reply.code(400).send({
          success: false,
          error: `Invalid package name: ${upgrade.newPackage}`
        })
      }
  
      const newPlan = await prisma.stakingPlan.findFirst({
        where: {
          name: {
            equals: newPackageInfo.name,
            mode: 'insensitive'
          }
        }
      })
  
      if (!newPlan) {
        console.error('StakingPlan not found for:', newPackageInfo.name)
        return reply.code(500).send({
          success: false,
          error: `Staking plan "${newPackageInfo.name}" not found in database`
        })
      }
  
      const investmentStartDate = upgrade.investment.startDate
      const investmentEndDate = upgrade.investment.endDate
      
      if (!investmentStartDate || !investmentEndDate) {
        console.error('Investment dates are missing:', {
          investmentId: upgrade.investmentId,
          startDate: investmentStartDate,
          endDate: investmentEndDate
        })
        return reply.code(500).send({
          success: false,
          error: 'Investment dates are missing. Cannot process upgrade.'
        })
      }
      
      const originalStartDate = new Date(investmentStartDate)
      const originalEndDate = new Date(investmentEndDate)
      const now = new Date()
      
      const daysRemaining = Math.max(0, Math.floor((originalEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      const remainingMonths = daysRemaining / 30
      
      const newAmount = Number(upgrade.investment.amount) + Number(upgrade.additionalAmount)
      const monthlyRate = newPackageInfo.apy
      const duration = upgrade.investment.duration
      
      const durationBonusInfo = DURATION_BONUSES[duration] || { durationBonus: 0, bonusAmount: 0 }
      const effectiveROI = monthlyRate + durationBonusInfo.durationBonus
      
      const newExpectedReturn = (newAmount * effectiveROI * remainingMonths) / 100
      
      const accumulatedInterest = Number(upgrade.accumulatedInterest || 0)
      const totalExpectedReturn = accumulatedInterest + newExpectedReturn
      const newTotalReturn = newAmount + totalExpectedReturn + durationBonusInfo.bonusAmount

      const currentInvestment = await prisma.investment.findUnique({
        where: { id: upgrade.investmentId },
        select: {
          bonusAmount: true,
          bonusUnlockedAt: true,
          bonusWithdrawn: true
        }
      })

      if (!currentInvestment) {
        console.error('Investment not found for bonus preservation:', upgrade.investmentId)
        return reply.code(404).send({
          success: false,
          error: 'Investment not found'
        })
      }

      console.log('💾 Preserving original bonus fields:', {
        bonusAmount: currentInvestment.bonusAmount ? Number(currentInvestment.bonusAmount) : null,
        bonusUnlockedAt: currentInvestment.bonusUnlockedAt,
        bonusWithdrawn: currentInvestment.bonusWithdrawn
      })
  
      console.log('Upgrade calculations:', {
        upgradeId,
        investmentId: upgrade.investmentId,
        oldPackage: upgrade.oldPackage,
        newPackage: upgrade.newPackage,
        oldPlanId: upgrade.investment.planId,
        newPlanId: newPlan.id,
        oldAmount: Number(upgrade.investment.amount).toFixed(2),
        additionalAmount: Number(upgrade.additionalAmount).toFixed(2),
        newAmount: newAmount.toFixed(2),
        monthlyRate: monthlyRate + '%',
        duration: duration + ' months',
        durationBonus: durationBonusInfo.durationBonus + '%',
        bonusAmount: durationBonusInfo.bonusAmount,
        effectiveROI: effectiveROI + '%',
        daysRemaining: daysRemaining,
        remainingMonths: remainingMonths.toFixed(2),
        newExpectedReturn: newExpectedReturn.toFixed(2),
        accumulatedInterest: accumulatedInterest.toFixed(2),
        totalExpectedReturn: totalExpectedReturn.toFixed(2),
        newTotalReturn: newTotalReturn.toFixed(2),
        originalStartDate: originalStartDate.toISOString(),
        originalEndDate: originalEndDate.toISOString(),
        keepingOriginalDates: true
      })
  
      const updatedInvestment = await prisma.investment.update({
        where: { id: upgrade.investmentId },
        data: {
          planId: newPlan.id,
          amount: newAmount,
          roi: monthlyRate,
          durationBonus: durationBonusInfo.durationBonus,
          bonusAmount: currentInvestment.bonusAmount,
          bonusUnlockedAt: currentInvestment.bonusUnlockedAt,
          bonusWithdrawn: currentInvestment.bonusWithdrawn,
          effectiveROI: effectiveROI,
          expectedReturn: newExpectedReturn,
          totalReturn: newTotalReturn,
          accumulatedInterest: accumulatedInterest,
          lastUpgradeDate: new Date()
        }
      })
  
      await prisma.investmentUpgrade.update({
        where: { id: upgradeId },
        data: {
          status: 'APPROVED',
          processedDate: new Date()
        }
      })
  
      console.log('✅ Upgrade approved and applied:', upgradeId)
      console.log('✅ Dates PRESERVED - startDate and endDate NOT changed!')
      console.log('✅ Bonus fields PRESERVED:', {
        bonusAmount: updatedInvestment.bonusAmount ? Number(updatedInvestment.bonusAmount) : null,
        bonusUnlockedAt: updatedInvestment.bonusUnlockedAt,
        bonusWithdrawn: updatedInvestment.bonusWithdrawn
      })
      console.log('New investment state:', {
        planId: updatedInvestment.planId,
        amount: updatedInvestment.amount,
        roi: updatedInvestment.roi,
        durationBonus: updatedInvestment.durationBonus,
        bonusAmount: updatedInvestment.bonusAmount,
        effectiveROI: updatedInvestment.effectiveROI,
        duration: updatedInvestment.duration,
        startDate: updatedInvestment.startDate,
        endDate: updatedInvestment.endDate,
        expectedReturn: updatedInvestment.expectedReturn,
        totalReturn: updatedInvestment.totalReturn,
        accumulatedInterest: updatedInvestment.accumulatedInterest,
        lastUpgradeDate: updatedInvestment.lastUpgradeDate
      })
  
      return reply.send({
        success: true,
        message: 'Upgrade approved and applied successfully',
        data: {
          investmentId: upgrade.investmentId,
          upgradeId: upgradeId,
          newPlanId: newPlan.id,
          newPlanName: newPlan.name,
          newAmount: newAmount,
          newAPY: monthlyRate,
          durationBonus: durationBonusInfo.durationBonus,
          bonusAmount: updatedInvestment.bonusAmount ? Number(updatedInvestment.bonusAmount) : null,
          effectiveROI: effectiveROI,
          newDuration: duration,
          originalStartDate: originalStartDate,
          originalEndDate: originalEndDate,
          daysRemaining: daysRemaining,
          newExpectedReturn: newExpectedReturn,
          accumulatedInterest: accumulatedInterest,
          totalReturn: newTotalReturn,
          lastUpgradeDate: updatedInvestment.lastUpgradeDate
        }
      })
  
    } catch (error: any) {
      console.error('Error approving upgrade:', error)
      console.error('Stack:', error.stack)
      return reply.code(500).send({
        success: false,
        error: 'Failed to approve upgrade',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  })

  app.post('/upgrade/:upgradeId/reject', async (request, reply) => {
    try {
      const { upgradeId } = request.params as { upgradeId: string }
      const { supportUserId, reason } = request.body as { supportUserId: string; reason?: string }

      console.log('Rejecting upgrade:', upgradeId, 'by support:', supportUserId)

      const upgrade = await prisma.investmentUpgrade.findUnique({
        where: { id: upgradeId }
      })

      if (!upgrade) {
        return reply.code(404).send({
          success: false,
          error: 'Upgrade not found'
        })
      }

      if (upgrade.status !== 'PENDING') {
        return reply.code(400).send({
          success: false,
          error: 'Upgrade already processed'
        })
      }

      await prisma.investmentUpgrade.update({
        where: { id: upgradeId },
        data: {
          status: 'REJECTED',
          processedDate: new Date()
        }
      })

      console.log('Upgrade rejected:', upgradeId)

      return reply.send({
        success: true,
        message: 'Upgrade rejected successfully',
        data: {
          upgradeId,
          investmentId: upgrade.investmentId,
          reason: reason || 'Rejected by admin'
        }
      })

    } catch (error: any) {
      console.error('Error rejecting upgrade:', error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to reject upgrade'
      })
    }
  })

  // ===== REFERRAL BONUS WITHDRAWAL ROUTE =====
  app.get('/referral-bonus-withdrawal/:shortId', async (request, reply) => {
    try {
      const { shortId } = request.params as { shortId: string }

      console.log('🔍 Telegram bot requesting referral bonus withdrawal by short ID:', shortId)

      const withdrawal = await prisma.referralWithdrawalRequest.findFirst({
        where: {
          id: { startsWith: shortId }
        },
        include: {
          user: {
            select: { 
              id: true,
              email: true 
            }
          },
          referralUser: {
            select: {
              email: true
            }
          },
          investment: {
            select: {
              amount: true,
              createdAt: true
            }
          },
          referralEarning: {
            select: {
              level: true
            }
          }
        }
      })

      if (!withdrawal) {
        console.log('❌ Referral bonus withdrawal not found for short ID:', shortId)
        return reply.code(404).send({
          success: false,
          error: 'Referral bonus withdrawal request not found'
        })
      }

      console.log('✅ Found referral bonus withdrawal:', withdrawal.id)

      const commissionRate = withdrawal.referralEarning?.level === 1 ? 7 : 3

      return reply.code(200).send({
        id: withdrawal.id,
        userId: withdrawal.userId,
        userEmail: withdrawal.user.email,
        referralUserId: withdrawal.referralUserId,
        referralEmail: withdrawal.referralUser?.email || 'N/A',
        investmentId: withdrawal.investmentId,
        investmentAmount: Number(withdrawal.investment?.amount || 0),
        investmentDate: withdrawal.investment?.createdAt || new Date(),
        commissionRate: commissionRate,
        amount: Number(withdrawal.amount),
        trc20Address: withdrawal.trc20Address,
        status: withdrawal.status,
        createdAt: withdrawal.createdAt
      })

    } catch (error: any) {
      console.error('❌ Error fetching referral bonus withdrawal by short ID:', error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch referral bonus withdrawal data'
      })
    }
  })
}