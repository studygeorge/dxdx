// dxcapai-backend/src/controllers/investments/read.controller.ts

import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { CalculationsService } from '../../services/investments/calculations.service'

const prisma = new PrismaClient()

export class ReadInvestmentsController {
  static async getMyInvestments(request: FastifyRequest, reply: FastifyReply) {
    console.log('📋 getMyInvestments called for user:', request.currentUser?.email)
    
    try {
      const userId = request.currentUser!.id

      const investments = await prisma.investment.findMany({
        where: { userId },
        include: {
          plan: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          upgrades: {
            where: {
              status: 'PENDING'
            },
            orderBy: { requestDate: 'desc' },
            take: 1
          },
          earlyWithdrawals: {
            orderBy: { requestDate: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      console.log('✅ Found investments:', investments.length)

      // 🔥 АВТОАКТИВАЦИЯ PENDING АПГРЕЙДОВ
      const now = new Date()
      for (const inv of investments) {
        if (inv.upgradeActivationDate && inv.pendingUpgradeROI) {
          const activationDate = new Date(inv.upgradeActivationDate)
          
          if (now >= activationDate) {
            console.log(`🔥 Auto-activating pending upgrade for investment ${inv.id}`)
            
            await prisma.investment.update({
              where: { id: inv.id },
              data: {
                roi: inv.pendingUpgradeROI,
                effectiveROI: inv.pendingUpgradeROI,
                plan: inv.pendingUpgradePlan ? { connect: { name: inv.pendingUpgradePlan } } : undefined,
                pendingUpgradeROI: null,
                pendingUpgradePlan: null,
                upgradeActivationDate: null,
                lastUpgradeDate: activationDate
              }
            })
            
            // Обновляем локальный объект
            inv.roi = inv.pendingUpgradeROI
            inv.effectiveROI = inv.pendingUpgradeROI
            inv.lastUpgradeDate = activationDate
            inv.pendingUpgradeROI = null
            inv.pendingUpgradePlan = null
            inv.upgradeActivationDate = null
          }
        }
      }

      return reply.code(200).send({
        success: true,
        data: investments.map(inv => {
          const pendingUpgrade = inv.upgrades.length > 0 ? inv.upgrades[0] : null
          
          const currentDate = (inv.simulatedCurrentDate && inv.simulatedCurrentDate instanceof Date)
            ? inv.simulatedCurrentDate
            : new Date()
          
          let daysPassed = 0
          let daysRemaining = 0
          let currentReturn = Number(inv.accumulatedInterest || 0)
          let isCompleted = inv.status === 'COMPLETED'
          
          if (inv.status === 'ACTIVE' || inv.status === 'COMPLETED') {
            if (inv.startDate) {
              const startDate = new Date(inv.startDate)
              const baseDate = inv.lastUpgradeDate || startDate
              daysPassed = CalculationsService.calculateDaysPassedServer(baseDate, null, currentDate)
              
              // 🆕 РАСЧЁТ С УЧЁТОМ PENDING АПГРЕЙДА
              if (inv.status === 'ACTIVE') {
                if (inv.upgradeActivationDate && inv.pendingUpgradeROI) {
                  const activationDate = new Date(inv.upgradeActivationDate)
                  
                  // ✅ КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: новый ROI применяется ТОЛЬКО после activationDate
                  if (currentDate < activationDate) {
                    // До активации → весь период по старому ROI
                    console.log(`[CURRENT RETURN] Before activation (${activationDate.toISOString().split('T')[0]}): using old ROI ${inv.roi}%`)
                    const daysFromStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                    currentReturn = (Number(inv.amount) * Number(inv.roi) * daysFromStart) / (365 * 100)

                  } else {
                    // После activationDate → split calculation
                    console.log(`[CURRENT RETURN] Split: old ROI until ${activationDate.toISOString().split('T')[0]}, new ROI ${inv.pendingUpgradeROI}% after`)
                    
                    const daysBeforeActivation = Math.floor((activationDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                    const daysAfterActivation = Math.floor((currentDate.getTime() - activationDate.getTime()) / (1000 * 60 * 60 * 24))

                    const oldROI = Number(inv.roi)
                    const newROI = Number(inv.pendingUpgradeROI)
                    const amount = Number(inv.amount)
                    
                    const profitBefore = (amount * oldROI * daysBeforeActivation) / (365 * 100)
                    const profitAfter = (amount * newROI * daysAfterActivation) / (365 * 100)
                    
                    currentReturn = profitBefore + profitAfter
                    
                    console.log(`📊 Split calculation for ${inv.id.substring(0, 8)}:`, {
                      daysBeforeActivation,
                      daysAfterActivation,
                      oldROI: `${oldROI}%`,
                      newROI: `${newROI}%`,
                      profitBefore: profitBefore.toFixed(2),
                      profitAfter: profitAfter.toFixed(2),
                      currentReturn: currentReturn.toFixed(2)
                    })
                  }
                } else {
                  // Стандартный расчёт без pending апгрейда
                  currentReturn = CalculationsService.calculateCurrentReturnServer(
                    Number(inv.amount),
                    Number(inv.effectiveROI),
                    daysPassed,
                    Number(inv.accumulatedInterest || 0)
                  )
                }
              }
            }
            
            if (inv.endDate) {
              daysRemaining = CalculationsService.calculateDaysRemainingServer(inv.endDate, currentDate)
              
              if (daysRemaining <= 0 && inv.status === 'ACTIVE') {
                isCompleted = true
              }
            }
          }
          
          const withdrawnProfits = Number(inv.withdrawnProfits || 0)
          const totalProfit = currentReturn
          const availableProfit = Math.max(0, totalProfit - withdrawnProfits)
          
          // ✅ ДИНАМИЧЕСКИЙ ПЕРЕСЧЁТ expectedReturn
          let dynamicExpectedReturn = Number(inv.expectedReturn)
          
          if (inv.status === 'ACTIVE' && daysRemaining > 0) {
            const futureROI = inv.pendingUpgradeROI || inv.effectiveROI
            const futureProfit = (Number(inv.amount) * Number(futureROI) / 30 * daysRemaining) / 100
            dynamicExpectedReturn = currentReturn + Number(inv.amount) + futureProfit
          } else if (inv.status === 'COMPLETED') {
            dynamicExpectedReturn = Number(inv.amount) + currentReturn
          }
          
          const bonusAmount = Number(inv.bonusAmount || 0)
          const createdAt = new Date(inv.createdAt)
          const totalDaysPassed = Math.floor((currentDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
          const halfDurationDays = (inv.duration / 2) * 30
          const isBonusUnlocked = totalDaysPassed >= halfDurationDays
          const bonusWithdrawn = inv.bonusWithdrawn || false
          
          console.log(`💰 Investment ${inv.id.substring(0, 8)}... (${inv.plan.name}):`, {
            status: inv.status,
            amount: Number(inv.amount),
            effectiveROI: Number(inv.effectiveROI),
            daysPassed,
            daysRemaining,
            currentReturn: currentReturn.toFixed(2),
            withdrawnProfits: withdrawnProfits.toFixed(2),
            availableProfit: availableProfit.toFixed(2),
            dynamicExpectedReturn: dynamicExpectedReturn.toFixed(2),
            hasPendingUpgrade: !!(inv.pendingUpgradeROI),
            activationDate: inv.upgradeActivationDate?.toISOString() || 'N/A'
          })
          
          return {
            id: inv.id,
            userId: inv.userId,
            planId: inv.planId,
            amount: inv.amount,
            currency: inv.currency,
            planName: inv.plan.name,
            roi: inv.roi,
            duration: inv.duration,
            durationBonus: inv.durationBonus,
            bonusAmount: inv.bonusAmount,
            bonusUnlockedAt: inv.bonusUnlockedAt,
            bonusWithdrawn: inv.bonusWithdrawn,
            isBonusUnlocked,
            effectiveROI: inv.effectiveROI,
            status: inv.status,
            startDate: inv.startDate,
            endDate: inv.endDate,
            expectedReturn: parseFloat(dynamicExpectedReturn.toFixed(2)),
            totalReturn: inv.totalReturn,
            transactionHash: inv.transactionHash,
            withdrawalRequested: inv.withdrawalRequested,
            accumulatedInterest: inv.accumulatedInterest || 0,
            withdrawnProfits: inv.withdrawnProfits || 0,
            lastUpgradeDate: inv.lastUpgradeDate,
            language: inv.language,
            createdAt: inv.createdAt,
            updatedAt: inv.updatedAt,
            daysPassed: daysPassed,
            daysRemaining: daysRemaining,
            currentReturn: parseFloat(currentReturn.toFixed(2)),
            availableProfit: parseFloat(availableProfit.toFixed(2)),
            isCompleted: isCompleted,
            isSimulated: !!(inv.simulatedCurrentDate),
            simulatedDate: inv.simulatedCurrentDate,
            plan: inv.plan,
            // 🆕 Pending upgrade info
            pendingUpgrade: inv.pendingUpgradePlan ? {
              newPlan: inv.pendingUpgradePlan,
              newROI: Number(inv.pendingUpgradeROI),
              activationDate: inv.upgradeActivationDate?.toISOString(),
              requestDate: inv.upgradeRequestDate?.toISOString()
            } : (pendingUpgrade ? {
              id: pendingUpgrade.id,
              targetPackage: pendingUpgrade.newPackage,
              newAmount: Number(inv.amount) + Number(pendingUpgrade.additionalAmount),
              additionalAmount: pendingUpgrade.additionalAmount,
              status: pendingUpgrade.status,
              requestDate: pendingUpgrade.requestDate
            } : null),
            earlyWithdrawals: inv.earlyWithdrawals
          }
        })
      })

    } catch (error: any) {
      console.error('❌ Error in getMyInvestments:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch investments'
      })
    }
  }

  static async getInvestment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.currentUser!.id
      const { id } = request.params as { id: string }

      const investment = await prisma.investment.findFirst({
        where: {
          id,
          userId
        },
        include: {
          plan: true,
          user: {
            select: {
              id: true,
              email: true,
              username: true
            }
          },
          upgrades: {
            orderBy: { requestDate: 'desc' }
          },
          earlyWithdrawals: {
            orderBy: { requestDate: 'desc' }
          }
        }
      })

      if (!investment) {
        return reply.code(404).send({
          success: false,
          error: 'Investment not found'
        })
      }

      // 🔥 АВТОАКТИВАЦИЯ при GET запросе
      const now = new Date()
      if (investment.upgradeActivationDate && investment.pendingUpgradeROI) {
        const activationDate = new Date(investment.upgradeActivationDate)
        
        if (now >= activationDate) {
          console.log(`🔥 Auto-activating pending upgrade for investment ${id}`)
          
          const updated = await prisma.investment.update({
            where: { id },
            data: {
              roi: investment.pendingUpgradeROI,
              effectiveROI: investment.pendingUpgradeROI,
              plan: investment.pendingUpgradePlan ? { connect: { name: investment.pendingUpgradePlan } } : undefined,
              pendingUpgradeROI: null,
              pendingUpgradePlan: null,
              upgradeActivationDate: null,
              lastUpgradeDate: activationDate
            },
            include: {
              plan: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  username: true
                }
              },
              upgrades: {
                orderBy: { requestDate: 'desc' }
              },
              earlyWithdrawals: {
                orderBy: { requestDate: 'desc' }
              }
            }
          })
          
          return reply.code(200).send({
            success: true,
            data: updated
          })
        }
      }

      return reply.code(200).send({
        success: true,
        data: investment
      })

    } catch (error: any) {
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch investment'
      })
    }
  }
}
