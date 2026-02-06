import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { notifyUpgradeRequest } from './helpers/notifications.helper'

const prisma = new PrismaClient()

const PACKAGES: Record<string, { name: string; monthlyRate: number }> = {
  'Starter': { name: 'Starter', monthlyRate: 14 },
  'Advanced': { name: 'Advanced', monthlyRate: 17 },
  'Pro': { name: 'Pro', monthlyRate: 20 },
  'Elite': { name: 'Elite', monthlyRate: 22 }
}

const DURATION_BONUSES: Record<number, number> = {
  3: 0,
  6: 1.5,
  12: 3
}

export async function upgradeRoutes(app: FastifyInstance) {
  app.post('/:id/upgrade', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const { 
        upgradeType,
        additionalAmount, 
        newPackage, 
        newDuration,
        paymentMethod, 
        senderWalletAddress 
      } = request.body as {
        upgradeType: 'amount' | 'duration'
        additionalAmount?: number
        newPackage?: string
        newDuration?: number
        paymentMethod: string
        senderWalletAddress: string
      }
      
      const userId = request.currentUser!.id

      console.log('📈 Upgrade request:', { 
        investmentId: id, 
        userId, 
        upgradeType, 
        additionalAmount, 
        newPackage,
        newDuration 
      })

      const investment = await prisma.investment.findFirst({
        where: {
          id,
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

      const existingPendingUpgrade = await prisma.investmentUpgrade.findFirst({
        where: {
          investmentId: id,
          status: 'PENDING'
        }
      })

      if (existingPendingUpgrade) {
        return reply.code(400).send({
          success: false,
          error: 'Pending upgrade already exists'
        })
      }

      if (upgradeType === 'amount' && investment.lastUpgradeDate) {
        const lastUpgrade = new Date(investment.lastUpgradeDate)
        const today = new Date()
        const isSameDay = 
          lastUpgrade.getFullYear() === today.getFullYear() &&
          lastUpgrade.getMonth() === today.getMonth() &&
          lastUpgrade.getDate() === today.getDate()
        
        if (isSameDay) {
          return reply.code(400).send({
            success: false,
            error: 'Cannot upgrade twice in the same day'
          })
        }
      }

      if (upgradeType === 'amount') {
        const trc20Regex = /^T[A-Za-z1-9]{33}$/
        if (!senderWalletAddress || !trc20Regex.test(senderWalletAddress)) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid TRC-20 address format'
          })
        }
      }

      const now = new Date()
      let baseDate = investment.lastUpgradeDate || investment.startDate!
      const daysPassed = Math.floor((now.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
      const monthlyRate = Number(investment.effectiveROI)
      const dailyRate = monthlyRate / 30
      const currentReturn = (Number(investment.amount) * dailyRate * daysPassed) / 100
      const accumulatedInterest = Number(investment.accumulatedInterest || 0)
      const totalAccumulated = currentReturn + accumulatedInterest

      const adminWalletConfig = await prisma.systemConfig.findUnique({
        where: { key: 'STAKING_WALLET_USDT_TRC20' }
      })

      const adminWallet = adminWalletConfig?.value || process.env.ADMIN_WALLET_ADDRESS || ''

      if (!adminWallet) {
        console.error('Admin wallet not configured for upgrade')
        return reply.code(500).send({
          success: false,
          error: 'Admin wallet configuration missing'
        })
      }

      console.log('💳 Admin wallet retrieved:', adminWallet)

      if (upgradeType === 'amount') {
        if (!additionalAmount || !newPackage) {
          return reply.code(400).send({
            success: false,
            error: 'Missing additionalAmount or newPackage for amount upgrade'
          })
        }

        const targetPkg = PACKAGES[newPackage]
        if (!targetPkg) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid package'
          })
        }

        const newAmount = Number(investment.amount) + additionalAmount
        const newDurationBonus = DURATION_BONUSES[investment.duration] || 0
        const newEffectiveROI = targetPkg.monthlyRate + newDurationBonus

        const upgradeCost = additionalAmount

        console.log('💰 Amount upgrade:', {
          oldAmount: Number(investment.amount),
          additionalAmount,
          newAmount,
          oldROI: Number(investment.effectiveROI),
          newROI: newEffectiveROI,
          baseRate: targetPkg.monthlyRate,
          durationBonus: newDurationBonus
        })

        const upgradeData = {
          investmentId: id,
          userId,
          upgradeType: 'amount',
          oldPackage: investment.plan.name,
          newPackage: newPackage,
          oldAPY: investment.effectiveROI,
          newAPY: newEffectiveROI,
          additionalAmount: additionalAmount,
          oldDuration: investment.duration,
          newDuration: investment.duration,
          oldEndDate: investment.endDate!,
          newEndDate: investment.endDate!,
          accumulatedInterest: totalAccumulated,
          adminWalletAddress: adminWallet,
          senderWalletAddress: senderWalletAddress.trim(),
          status: 'PENDING',
          requestDate: now
        }

        const upgrade = await prisma.investmentUpgrade.create({
          data: upgradeData
        })

        await prisma.auditLog.create({
          data: {
            userId,
            action: 'UPGRADE_REQUEST',
            resource: 'INVESTMENT',
            details: JSON.stringify({
              investmentId: id,
              upgradeId: upgrade.id,
              upgradeType: 'amount',
              oldPackage: upgrade.oldPackage,
              newPackage: upgrade.newPackage,
              oldAPY: upgrade.oldAPY.toString(),
              newAPY: upgrade.newAPY.toString(),
              additionalAmount: upgrade.additionalAmount?.toString() || '0',
              accumulatedInterest: totalAccumulated,
              newAmount,
              newDurationBonus,
              adminWallet,
              senderWalletAddress
            }),
            ipAddress: request.ip,
            success: true
          }
        })

        const responseData = {
          success: true,
          message: 'Upgrade request created successfully',
          data: {
            upgradeId: upgrade.id,
            upgradeType: 'amount',
            oldPackage: upgrade.oldPackage,
            newPackage: upgrade.newPackage,
            oldAPY: Number(upgrade.oldAPY),
            newAPY: Number(upgrade.newAPY),
            additionalAmount: Number(upgrade.additionalAmount || 0),
            upgradeCost: upgradeCost,
            newAmount: newAmount,
            accumulatedInterest: totalAccumulated,
            rateBonus: newDurationBonus,
            adminWallet: adminWallet,
            senderWallet: senderWalletAddress.trim(),
            status: 'PENDING'
          }
        }

        console.log('📤 RESPONSE TO FRONTEND (amount):', JSON.stringify(responseData, null, 2))
        return reply.send(responseData)
      } 
      else if (upgradeType === 'duration') {
        if (!newDuration) {
          return reply.code(400).send({
            success: false,
            error: 'Missing newDuration for duration upgrade'
          })
        }

        if (newDuration <= investment.duration) {
          return reply.code(400).send({
            success: false,
            error: 'New duration must be greater than current duration'
          })
        }

        const currentAmount = Number(investment.amount)
        const newDurationBonus = DURATION_BONUSES[newDuration] || 0
        const baseROI = Number(investment.roi)
        const newEffectiveROI = baseROI + newDurationBonus

        const oldEndDate = new Date(investment.endDate!)
        const additionalMonths = newDuration - investment.duration
        const newEndDate = new Date(oldEndDate)
        newEndDate.setMonth(newEndDate.getMonth() + additionalMonths)

        console.log('⏰ Duration upgrade:', {
          oldDuration: investment.duration,
          newDuration,
          baseROI,
          oldDurationBonus: Number(investment.durationBonus),
          newDurationBonus,
          oldEffectiveROI: Number(investment.effectiveROI),
          newEffectiveROI,
          oldEndDate: investment.endDate,
          newEndDate
        })

        try {
          await prisma.investment.update({
            where: { id },
            data: {
              duration: newDuration,
              durationBonus: newDurationBonus,
              effectiveROI: newEffectiveROI,
              endDate: newEndDate,
              lastUpgradeDate: now,
              accumulatedInterest: totalAccumulated
            }
          })

          const upgradeRecord = await prisma.investmentUpgrade.create({
            data: {
              investmentId: id,
              userId,
              upgradeType: 'duration',
              oldPackage: investment.plan.name,
              newPackage: investment.plan.name,
              oldAPY: investment.effectiveROI,
              newAPY: newEffectiveROI,
              additionalAmount: null,
              oldDuration: investment.duration,
              newDuration: newDuration,
              oldEndDate: investment.endDate!,
              newEndDate: newEndDate,
              accumulatedInterest: totalAccumulated,
              status: 'COMPLETED',
              requestDate: now,
              processedDate: now
            }
          })

          await prisma.auditLog.create({
            data: {
              userId,
              action: 'DURATION_UPGRADE_COMPLETED',
              resource: 'INVESTMENT',
              details: JSON.stringify({
                investmentId: id,
                upgradeId: upgradeRecord.id,
                upgradeType: 'duration',
                oldDuration: investment.duration,
                newDuration,
                oldAPY: Number(investment.effectiveROI),
                newAPY: newEffectiveROI,
                oldDurationBonus: Number(investment.durationBonus),
                newDurationBonus,
                accumulatedInterest: totalAccumulated,
                autoApplied: true
              }),
              ipAddress: request.ip,
              success: true
            }
          })

          console.log('✅ Duration upgrade applied successfully:', {
            upgradeId: upgradeRecord.id,
            newDuration,
            baseROI,
            newDurationBonus: `+${newDurationBonus}%`,
            oldEffectiveROI: Number(investment.effectiveROI),
            newEffectiveROI,
            effectiveROI_updated: true
          })

          const responseData = {
            success: true,
            message: 'Duration upgrade completed successfully',
            data: {
              upgradeId: upgradeRecord.id,
              upgradeType: 'duration',
              oldDuration: investment.duration,
              newDuration,
              oldAPY: Number(investment.effectiveROI),
              newAPY: newEffectiveROI,
              rateBonus: newDurationBonus,
              newEndDate: newEndDate.toISOString(),
              accumulatedInterest: totalAccumulated,
              adminWallet: adminWallet,
              senderWallet: senderWalletAddress || '',
              status: 'COMPLETED',
              appliedImmediately: true
            }
          }

          console.log('📤 RESPONSE TO FRONTEND (duration):', JSON.stringify(responseData, null, 2))
          return reply.send(responseData)

        } catch (upgradeError: any) {
          console.error('❌ Duration upgrade error:', upgradeError)
          return reply.code(500).send({
            success: false,
            error: 'Failed to apply duration upgrade'
          })
        }

      } else {
        return reply.code(400).send({
          success: false,
          error: 'Invalid upgradeType. Must be "amount" or "duration"'
        })
      }

    } catch (error: any) {
      console.error('❌ Upgrade error:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to process upgrade request'
      })
    }
  })

  app.post('/upgrade/:upgradeId/confirm-payment', async (request, reply) => {
    try {
      const { upgradeId } = request.params as { upgradeId: string }
      const userId = request.currentUser!.id

      console.log('🔔 Upgrade payment confirmation request:', { upgradeId, userId })

      const upgrade = await prisma.investmentUpgrade.findUnique({
        where: { id: upgradeId },
        include: {
          investment: {
            include: {
              plan: true,
              user: {
                select: {
                  email: true,
                  username: true
                }
              }
            }
          }
        }
      })

      if (!upgrade) {
        return reply.status(404).send({
          success: false,
          error: 'Upgrade not found'
        })
      }

      if (upgrade.userId !== userId) {
        return reply.status(403).send({
          success: false,
          error: 'Access denied'
        })
      }

      if (upgrade.status !== 'PENDING') {
        return reply.status(400).send({
          success: false,
          error: 'Upgrade is not in pending status'
        })
      }

      if (upgrade.upgradeType !== 'amount') {
        return reply.status(400).send({
          success: false,
          error: 'Only amount upgrades require payment confirmation'
        })
      }

      const oldAmount = Number(upgrade.investment.amount)
      const additionalAmount = Number(upgrade.additionalAmount || 0)
      const totalAmount = oldAmount + additionalAmount

      console.log('💰 Upgrade payment details:', {
        upgradeId: upgrade.id,
        oldPackage: upgrade.oldPackage,
        newPackage: upgrade.newPackage,
        oldAmount,
        additionalAmount,
        totalAmount,
        adminWallet: upgrade.adminWalletAddress,
        senderWallet: upgrade.senderWalletAddress
      })

      try {
        await notifyUpgradeRequest({
          upgradeId: upgrade.id,
          investmentId: upgrade.investmentId,
          userId: userId,
          userEmail: upgrade.investment.user.email || 'N/A',
          oldPackage: upgrade.oldPackage,
          newPackage: upgrade.newPackage,
          oldAPY: Number(upgrade.oldAPY),
          newAPY: Number(upgrade.newAPY),
          oldAmount: oldAmount,
          additionalAmount: additionalAmount,
          totalAmount: totalAmount,
          adminWallet: upgrade.adminWalletAddress || '',
          senderWallet: upgrade.senderWalletAddress || '',
          language: upgrade.investment.language || 'ru'
        })

        console.log('✅ Upgrade Telegram notification sent to admin:', upgrade.id)
      } catch (telegramError) {
        console.error('⚠️ Failed to send Telegram notification for upgrade:', telegramError)
        return reply.status(500).send({
          success: false,
          error: 'Failed to notify administrator'
        })
      }

      await prisma.auditLog.create({
        data: {
          userId,
          action: 'UPGRADE_PAYMENT_CONFIRMATION_SENT',
          resource: 'INVESTMENT',
          details: JSON.stringify({
            upgradeId: upgrade.id,
            investmentId: upgrade.investmentId,
            upgradeType: upgrade.upgradeType,
            oldPackage: upgrade.oldPackage,
            newPackage: upgrade.newPackage,
            additionalAmount: additionalAmount.toString(),
            totalAmount: totalAmount.toString(),
            adminWalletAddress: upgrade.adminWalletAddress,
            senderWalletAddress: upgrade.senderWalletAddress
          }),
          ipAddress: request.ip,
          success: true
        }
      })

      return reply.send({
        success: true,
        message: 'Payment confirmation sent to administrator. You will be notified within 30 minutes.',
        data: {
          upgradeId: upgrade.id,
          status: 'PENDING',
          expectedResponseTime: '30 minutes'
        }
      })

    } catch (error: any) {
      console.error('❌ Upgrade confirm payment error:', error)
      request.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to process upgrade payment confirmation'
      })
    }
  })
}
