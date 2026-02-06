// backend/src/controllers/admin-investments.controller.ts

import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface SimulateTimeBody {
  days: number
}

interface SimulateActionBody {
  action: 'partial_withdraw' | 'upgrade' | 'reset'
  amount?: number
  newPackage?: string
  additionalAmount?: number
}

const PACKAGES: Record<string, { name: string; monthlyRate: number; min: number; max: number }> = {
  starter: { name: 'Starter', monthlyRate: 14, min: 100, max: 999 },
  advanced: { name: 'Advanced', monthlyRate: 17, min: 1000, max: 2999 },
  pro: { name: 'Pro', monthlyRate: 22, min: 3000, max: 4999 },
  elite: { name: 'Elite', monthlyRate: 28, min: 6000, max: 100000 }
}

const calculateDaysPassedServer = (startDate: Date, currentDate: Date): number => {
  const diffTime = currentDate.getTime() - startDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return diffDays >= 0 ? diffDays : 0
}

const calculateCurrentReturnServer = (
  amount: number,
  effectiveROI: number,
  daysPassed: number,
  accumulatedInterest: number
): number => {
  const dailyRate = effectiveROI / 30
  const currentReturn = (amount * dailyRate * daysPassed) / 100
  return currentReturn + accumulatedInterest
}

const calculateDaysRemainingServer = (endDate: Date, currentDate: Date): number => {
  const diffTime = endDate.getTime() - currentDate.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

export class AdminInvestmentsController {
  static async getInvestmentsStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log('📊 Fetching investments stats...')

      const [
        totalInvestments,
        activeInvestments,
        completedInvestments,
        pendingInvestments,
        totalInvestedAmount,
        totalReturnAmount
      ] = await Promise.all([
        prisma.investment.count(),
        prisma.investment.count({ where: { status: 'ACTIVE' } }),
        prisma.investment.count({ where: { status: 'COMPLETED' } }),
        prisma.investment.count({ where: { status: 'PENDING' } }),
        prisma.investment.aggregate({
          _sum: { amount: true },
          where: { status: { in: ['ACTIVE', 'COMPLETED'] } }
        }),
        prisma.investment.aggregate({
          _sum: { totalReturn: true },
          where: { status: 'COMPLETED' }
        })
      ])

      return reply.send({
        success: true,
        data: {
          total: totalInvestments,
          active: activeInvestments,
          completed: completedInvestments,
          pending: pendingInvestments,
          totalInvested: Number(totalInvestedAmount._sum.amount || 0),
          totalReturned: Number(totalReturnAmount._sum.totalReturn || 0)
        }
      })

    } catch (error: any) {
      console.error('❌ Error fetching investments stats:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch investments stats'
      })
    }
  }

  static async getUserInvestments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.params as { userId: string }

      console.log('📊 Admin fetching investments for user:', userId)

      const investments = await prisma.investment.findMany({
        where: { userId },
        include: {
          plan: true,
          upgrades: {
            orderBy: { requestDate: 'desc' }
          },
          partialWithdrawals: {
            orderBy: { requestDate: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      console.log(`Found ${investments.length} investments`)

      const investmentsWithCalcs = investments.map(inv => {
        const currentDate = new Date()

        let daysPassed = 0
        let daysRemaining = 0
        let accumulatedProfit = Number(inv.accumulatedInterest || 0)
        let isCompleted = inv.status === 'COMPLETED'

        if (inv.status === 'ACTIVE' && inv.startDate) {
          const baseDate = inv.lastUpgradeDate || inv.startDate
          daysPassed = calculateDaysPassedServer(baseDate, currentDate)

          accumulatedProfit = calculateCurrentReturnServer(
            Number(inv.amount),
            Number(inv.effectiveROI),
            daysPassed,
            Number(inv.accumulatedInterest || 0)
          )

          if (inv.endDate) {
            daysRemaining = calculateDaysRemainingServer(inv.endDate, currentDate)
            if (daysRemaining <= 0) {
              isCompleted = true
            }
          }
        }

        const withdrawnProfits = Number(inv.withdrawnProfits || 0)
        const availableProfit = Math.max(0, accumulatedProfit - withdrawnProfits)

        return {
          ...inv,
          amount: Number(inv.amount),
          roi: Number(inv.roi),
          effectiveROI: Number(inv.effectiveROI),
          expectedReturn: Number(inv.expectedReturn),
          totalReturn: Number(inv.totalReturn),
          accumulatedInterest: Number(inv.accumulatedInterest || 0),
          withdrawnProfits: withdrawnProfits,
          durationBonus: Number(inv.durationBonus || 0),
          bonusAmount: Number(inv.bonusAmount || 0),
          calculatedData: {
            daysPassed,
            daysRemaining,
            accumulatedProfit,
            availableProfit,
            isCompleted,
            currentDate: currentDate.toISOString(),
            isSimulated: !!(inv.simulatedCurrentDate),
            canPartialWithdraw: availableProfit > 0,
            canUpgrade: inv.status === 'ACTIVE' && !isCompleted,
            canEarlyWithdraw: daysPassed <= 30 && inv.status === 'ACTIVE'
          }
        }
      })

      return reply.send({
        success: true,
        data: investmentsWithCalcs
      })

    } catch (error: any) {
      console.error('❌ Error fetching user investments:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch user investments'
      })
    }
  }

  // ✅ ИСПРАВЛЕННАЯ СИМУЛЯЦИЯ ВРЕМЕНИ - СДВИГАЕМ ВСЕ ДАТЫ НАЗАД
  static async simulateTime(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id: investmentId } = request.params as { id: string }
      const { days } = request.body as SimulateTimeBody

      console.log(`⏰ Simulating +${days} days for investment:`, investmentId)

      const investment = await prisma.investment.findUnique({
        where: { id: investmentId }
      })

      if (!investment) {
        return reply.code(404).send({
          success: false,
          error: 'Investment not found'
        })
      }

      // ✅ СДВИГАЕМ ВСЕ ДАТЫ НАЗАД НА {days} ДНЕЙ
      const updateData: any = {}

      // Сдвигаем startDate
      if (investment.startDate) {
        const newStartDate = new Date(investment.startDate)
        newStartDate.setDate(newStartDate.getDate() - days)
        updateData.startDate = newStartDate
        console.log(`📅 startDate: ${investment.startDate.toISOString()} → ${newStartDate.toISOString()}`)
      }

      // Сдвигаем lastUpgradeDate (если есть)
      if (investment.lastUpgradeDate) {
        const newLastUpgradeDate = new Date(investment.lastUpgradeDate)
        newLastUpgradeDate.setDate(newLastUpgradeDate.getDate() - days)
        updateData.lastUpgradeDate = newLastUpgradeDate
        console.log(`📅 lastUpgradeDate: ${investment.lastUpgradeDate.toISOString()} → ${newLastUpgradeDate.toISOString()}`)
      }

      // Сдвигаем endDate (если есть)
      if (investment.endDate) {
        const newEndDate = new Date(investment.endDate)
        newEndDate.setDate(newEndDate.getDate() - days)
        updateData.endDate = newEndDate
        console.log(`📅 endDate: ${investment.endDate.toISOString()} → ${newEndDate.toISOString()}`)
      }

      // Сдвигаем createdAt
      if (investment.createdAt) {
        const newCreatedAt = new Date(investment.createdAt)
        newCreatedAt.setDate(newCreatedAt.getDate() - days)
        updateData.createdAt = newCreatedAt
        console.log(`📅 createdAt: ${investment.createdAt.toISOString()} → ${newCreatedAt.toISOString()}`)
      }

      // ✅ ПОМЕЧАЕМ ЧТО ЭТО СИМУЛЯЦИЯ
      updateData.simulatedCurrentDate = new Date()

      await prisma.investment.update({
        where: { id: investmentId },
        data: updateData
      })

      console.log(`✅ All dates shifted -${days} days (simulating +${days} days passed)`)

      return reply.send({
        success: true,
        message: `Simulated +${days} days successfully`,
        data: {
          investmentId,
          daysAdded: days,
          updatedFields: Object.keys(updateData)
        }
      })

    } catch (error: any) {
      console.error('❌ Error simulating time:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to simulate time'
      })
    }
  }

  static async simulateAction(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id: investmentId } = request.params as { id: string }
      const { action, amount, newPackage, additionalAmount } = request.body as SimulateActionBody

      console.log(`🎬 Simulating action "${action}" for investment:`, investmentId)

      const investment = await prisma.investment.findUnique({
        where: { id: investmentId },
        include: { plan: true }
      })

      if (!investment) {
        return reply.code(404).send({
          success: false,
          error: 'Investment not found'
        })
      }

      if (action === 'partial_withdraw') {
        if (!amount || amount <= 0) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid withdrawal amount'
          })
        }

        const currentDate = new Date()
        const baseDate = investment.lastUpgradeDate || investment.startDate!
        const daysPassed = calculateDaysPassedServer(baseDate, currentDate)
        const currentReturn = calculateCurrentReturnServer(
          Number(investment.amount),
          Number(investment.effectiveROI),
          daysPassed,
          Number(investment.accumulatedInterest || 0)
        )

        const withdrawnProfits = Number(investment.withdrawnProfits || 0)
        const availableProfit = currentReturn - withdrawnProfits

        if (amount > availableProfit) {
          return reply.code(400).send({
            success: false,
            error: `Amount exceeds available profit: $${availableProfit.toFixed(2)}`
          })
        }

        await prisma.investment.update({
          where: { id: investmentId },
          data: {
            withdrawnProfits: withdrawnProfits + amount
          }
        })

        console.log(`✅ Partial withdrawal simulated: $${amount}`)

        return reply.send({
          success: true,
          message: `Simulated partial withdrawal of $${amount}`,
          data: {
            investmentId,
            action: 'partial_withdraw',
            amount,
            newWithdrawnProfits: withdrawnProfits + amount,
            newAvailableProfit: availableProfit - amount
          }
        })
      }

      if (action === 'upgrade') {
        if (!newPackage || !additionalAmount) {
          return reply.code(400).send({
            success: false,
            error: 'Missing newPackage or additionalAmount'
          })
        }

        const packageInfo = PACKAGES[newPackage.toLowerCase() as keyof typeof PACKAGES]
        if (!packageInfo) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid package'
          })
        }

        const currentDate = new Date()
        const baseDate = investment.lastUpgradeDate || investment.startDate!
        const daysPassed = calculateDaysPassedServer(baseDate, currentDate)
        const currentReturn = calculateCurrentReturnServer(
          Number(investment.amount),
          Number(investment.effectiveROI),
          daysPassed,
          Number(investment.accumulatedInterest || 0)
        )

        const newAmount = Number(investment.amount) + additionalAmount
        const newROI = packageInfo.monthlyRate

        await prisma.investment.update({
          where: { id: investmentId },
          data: {
            amount: newAmount,
            roi: newROI,
            effectiveROI: newROI + Number(investment.durationBonus || 0),
            accumulatedInterest: currentReturn,
            lastUpgradeDate: currentDate,
            withdrawnProfits: 0
          }
        })

        console.log(`✅ Upgrade simulated:`, {
          package: packageInfo.name,
          additionalAmount,
          newAmount,
          accumulatedInterest: currentReturn,
          lastUpgradeDate: currentDate.toISOString(),
          withdrawnProfitsReset: true
        })

        return reply.send({
          success: true,
          message: `Simulated upgrade to ${packageInfo.name}`,
          data: {
            investmentId,
            action: 'upgrade',
            oldPackage: investment.plan.name,
            newPackage: packageInfo.name,
            oldAmount: Number(investment.amount),
            additionalAmount,
            newAmount,
            accumulatedInterest: currentReturn,
            lastUpgradeDate: currentDate.toISOString(),
            withdrawnProfitsReset: true
          }
        })
      }

      if (action === 'reset') {
        const resetData: any = {
          simulatedCurrentDate: null,
          withdrawnProfits: 0,
          accumulatedInterest: 0,
          lastUpgradeDate: null
        }

        if (investment.simulatedCurrentDate) {
          resetData.startDate = investment.createdAt
        }

        await prisma.investment.update({
          where: { id: investmentId },
          data: resetData
        })

        console.log(`✅ Investment fully reset`)

        return reply.send({
          success: true,
          message: 'Investment reset to initial state',
          data: {
            investmentId,
            action: 'reset'
          }
        })
      }

      return reply.code(400).send({
        success: false,
        error: 'Invalid action'
      })

    } catch (error: any) {
      console.error('❌ Error simulating action:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to simulate action'
      })
    }
  }

  static async resetInvestment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id: investmentId } = request.params as { id: string }

      console.log(`🔄 Resetting investment:`, investmentId)

      const investment = await prisma.investment.findUnique({
        where: { id: investmentId }
      })

      if (!investment) {
        return reply.code(404).send({
          success: false,
          error: 'Investment not found'
        })
      }

      const resetData: any = {
        simulatedCurrentDate: null,
        withdrawnProfits: 0,
        accumulatedInterest: 0,
        lastUpgradeDate: null
      }

      if (investment.simulatedCurrentDate) {
        resetData.startDate = investment.createdAt
        
        if (investment.duration) {
          const newEndDate = new Date(investment.createdAt)
          newEndDate.setDate(newEndDate.getDate() + (investment.duration * 30))
          resetData.endDate = newEndDate
        }
      }

      await prisma.investment.update({
        where: { id: investmentId },
        data: resetData
      })

      console.log(`✅ Investment reset successfully`)

      return reply.send({
        success: true,
        message: 'Investment reset to initial state',
        data: {
          investmentId
        }
      })

    } catch (error: any) {
      console.error('❌ Error resetting investment:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to reset investment'
      })
    }
  }
}
