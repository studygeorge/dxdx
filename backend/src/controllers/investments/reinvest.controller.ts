import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { ReinvestDto } from '../../types/investments.types'
import { ReinvestService } from '../../services/investments/reinvest.service'
import { DURATION_BONUSES } from '../../constants/investments.constants'

const prisma = new PrismaClient()

export class ReinvestController {
  static async reinvestProfit(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.currentUser!.id
    const { id: investmentId } = request.params as { id: string }
    const { amount: reinvestAmount } = request.body as ReinvestDto

    console.log('💰 Reinvest request:', {
      userId,
      investmentId,
      reinvestAmount
    })

    try {
      // Валидация суммы
      if (!reinvestAmount || reinvestAmount <= 0) {
        return reply.code(400).send({
          success: false,
          error: 'Reinvest amount must be greater than 0'
        })
      }

      // Получаем инвестицию
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

      // Расчёт доступной прибыли
      const availableProfit = await ReinvestService.calculateAvailableProfit(investmentId)

      // ✅ ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ ДЛЯ ДИАГНОСТИКИ
      const investmentDebug = await prisma.investment.findUnique({
        where: { id: investmentId },
        select: {
          amount: true,
          effectiveROI: true,
          startDate: true,
          lastUpgradeDate: true,
          accumulatedInterest: true,
          withdrawnProfits: true,
          simulatedCurrentDate: true
        }
      })

      const currentDate = investmentDebug!.simulatedCurrentDate || new Date()
      const debugBaseDate = investmentDebug!.lastUpgradeDate || investmentDebug!.startDate!
      const debugDaysPassed = Math.floor((currentDate.getTime() - debugBaseDate.getTime()) / (1000 * 60 * 60 * 24))
      const debugDailyRate = Number(investmentDebug!.effectiveROI) / 30
      const currentProfit = (Number(investmentDebug!.amount) * debugDailyRate * debugDaysPassed) / 100
      const totalProfit = currentProfit + Number(investmentDebug!.accumulatedInterest || 0)
      const calculatedAvailable = Math.max(0, totalProfit - Number(investmentDebug!.withdrawnProfits || 0))

      console.log('💰💰💰 FULL DEBUG - Available Profit Calculation:', {
        investmentId: investmentId.substring(0, 8),
        amount: Number(investmentDebug!.amount),
        effectiveROI: Number(investmentDebug!.effectiveROI),
        baseDate: debugBaseDate.toISOString(),
        currentDate: currentDate.toISOString(),
        daysPassed: debugDaysPassed,
        dailyRate: debugDailyRate.toFixed(4),
        currentProfit: currentProfit.toFixed(2),
        accumulatedInterest: Number(investmentDebug!.accumulatedInterest || 0).toFixed(2),
        totalProfit: totalProfit.toFixed(2),
        withdrawnProfits: Number(investmentDebug!.withdrawnProfits || 0).toFixed(2),
        calculatedAvailable: calculatedAvailable.toFixed(2),
        returnedAvailable: availableProfit.toFixed(2),
        requestedReinvest: reinvestAmount.toFixed(2),
        MATCH: Math.abs(calculatedAvailable - availableProfit) < 0.01 ? '✅ YES' : '❌ NO - MISMATCH!'
      })

      // Проверка достаточности прибыли
      if (reinvestAmount > availableProfit) {
        return reply.code(400).send({
          success: false,
          error: `Insufficient profit. Available: $${availableProfit.toFixed(2)}, Requested: $${reinvestAmount.toFixed(2)}`
        })
      }

      // Текущие параметры
      const currentAmount = Number(investment.amount)
      const oldPackage = ReinvestService.getCurrentPackageName(currentAmount)
      const oldROI = Number(investment.effectiveROI)

      // Новая сумма после реинвестирования
      const newTotalAmount = currentAmount + reinvestAmount

      // Проверка возможности апгрейда
      const upgradeCheck = ReinvestService.canUpgradeToNextPlan(currentAmount, reinvestAmount)

      let newPackage = oldPackage
      let newROI = oldROI
      let upgraded = false

      if (upgradeCheck.canUpgrade && upgradeCheck.targetPackage) {
        newPackage = upgradeCheck.targetPackage
        
        // Рассчитываем новый effectiveROI с учётом duration bonus
        const durationBonus = DURATION_BONUSES[investment.duration]?.rateBonus || 0
        newROI = (upgradeCheck.targetROI || 0) + durationBonus
        upgraded = true

        console.log('✅ Upgrade triggered:', {
          oldPackage,
          newPackage,
          oldROI,
          newROI: `${upgradeCheck.targetROI}% + ${durationBonus}% = ${newROI}%`,
          newAmount: newTotalAmount
        })
      } else {
        console.log('⚠️ No upgrade: amount not sufficient for next tier')
      }

      // Создаём запись реинвеста
      const reinvest = await prisma.investmentReinvest.create({
        data: {
          investmentId: investment.id,
          userId: userId,
          reinvestedAmount: reinvestAmount,
          fromProfit: availableProfit,
          oldPackage: oldPackage,
          newPackage: newPackage,
          oldROI: oldROI,
          newROI: newROI,
          oldAmount: currentAmount,
          newAmount: newTotalAmount,
          upgraded: upgraded,
          status: 'COMPLETED',
          requestDate: new Date(),
          processedDate: new Date()
        }
      })

      // ✅ ВСЕГДА сохраняем прибыль при реинвесте (и при апгрейде, и без)
      console.log(upgraded ? '🔼 UPGRADING package' : '➡️ SAME package', ': saving current profit to accumulatedInterest')
      
      const now = new Date()
      const baseDate = investment.lastUpgradeDate || investment.startDate!
      const daysPassed = Math.floor((now.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
      const dailyRate = oldROI / 30
      const currentReturn = (currentAmount * dailyRate * daysPassed) / 100
      const accumulatedInterest = Number(investment.accumulatedInterest || 0)
      const newAccumulatedInterest = currentReturn + accumulatedInterest

      // ✅ ПРАВИЛЬНАЯ ФОРМУЛА Expected Return с учётом множественных реинвестов:
      // Expected Return = накопленная прибыль + новое тело + будущая прибыль на оставшиеся дни
      const endDate = new Date(investment.endDate!)
      const daysRemaining = Math.max(0, Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      
      const finalROI = upgraded ? newROI : oldROI
      const futureProfit = (newTotalAmount * finalROI / 30 * daysRemaining) / 100
      const newExpectedReturn = newAccumulatedInterest + newTotalAmount + futureProfit

      console.log('💰 Expected Return Calculation:', {
        upgraded,
        daysPassed,
        daysRemaining,
        currentReturn: currentReturn.toFixed(2),
        oldAccumulatedInterest: accumulatedInterest.toFixed(2),
        newAccumulatedInterest: newAccumulatedInterest.toFixed(2),
        newAmount: newTotalAmount.toFixed(2),
        finalROI,
        futureProfit: futureProfit.toFixed(2),
        oldExpectedReturn: Number(investment.expectedReturn).toFixed(2),
        newExpectedReturn: newExpectedReturn.toFixed(2),
        formula: `${newAccumulatedInterest.toFixed(2)} (accumulated) + ${newTotalAmount.toFixed(2)} (new amount) + ${futureProfit.toFixed(2)} (future profit) = ${newExpectedReturn.toFixed(2)}`
      })

      await prisma.investment.update({
        where: { id: investmentId },
        data: {
          amount: newTotalAmount,
          effectiveROI: finalROI,
          withdrawnProfits: Number(investment.withdrawnProfits || 0) + reinvestAmount,
          accumulatedInterest: newAccumulatedInterest,
          lastUpgradeDate: now,
          expectedReturn: newExpectedReturn,  // ✅ ПРАВИЛЬНАЯ ФОРМУЛА!
          totalReturn: newExpectedReturn      // ✅ ДОБАВЛЕНО!
        }
      })

      console.log('✅ Investment updated:', {
        upgraded,
        newAmount: newTotalAmount,
        newROI: finalROI,
        newAccumulatedInterest: newAccumulatedInterest.toFixed(2),
        newWithdrawnProfits: (Number(investment.withdrawnProfits || 0) + reinvestAmount).toFixed(2),
        newExpectedReturn: newExpectedReturn.toFixed(2),
        lastUpgradeDate: now.toISOString()
      })

      // Audit log
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'REINVEST_PROFIT',
          resource: 'INVESTMENT',
          details: JSON.stringify({
            reinvestId: reinvest.id,
            investmentId: investment.id,
            reinvestedAmount: reinvestAmount,
            oldAmount: currentAmount,
            newAmount: newTotalAmount,
            oldPackage,
            newPackage,
            oldROI,
            newROI: finalROI,
            upgraded,
            oldExpectedReturn: Number(investment.expectedReturn),
            newExpectedReturn: newExpectedReturn,
            daysRemaining,
            futureProfit
          }),
          ipAddress: request.ip,
          success: true
        }
      })

      console.log('✅ Reinvest completed:', {
        reinvestId: reinvest.id,
        upgraded,
        newPackage,
        newROI: finalROI,
        newExpectedReturn: newExpectedReturn.toFixed(2)
      })

      return reply.send({
        success: true,
        message: upgraded 
          ? `Profit reinvested successfully! Upgraded to ${newPackage} with ${finalROI}% ROI`
          : `Profit reinvested successfully! Current package: ${newPackage} with ${finalROI}% ROI`,
        data: {
          reinvestId: reinvest.id,
          investmentId: investment.id,
          reinvestedAmount: reinvestAmount,
          newTotalAmount: newTotalAmount,
          oldPackage,
          newPackage,
          oldROI,
          newROI: finalROI,
          upgraded,
          status: 'COMPLETED',
          newExpectedReturn: parseFloat(newExpectedReturn.toFixed(2))
        }
      })

    } catch (error: any) {
      console.error('❌ Reinvest error:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to process reinvestment'
      })
    }
  }

  static async getReinvestHistory(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.currentUser!.id
    const { id: investmentId } = request.params as { id: string }

    try {
      const reinvests = await prisma.investmentReinvest.findMany({
        where: {
          investmentId,
          userId
        },
        orderBy: {
          requestDate: 'desc'
        }
      })

      return reply.send({
        success: true,
        data: reinvests
      })

    } catch (error: any) {
      console.error('❌ Get reinvest history error:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch reinvest history'
      })
    }
  }
}
