import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { PartialWithdrawDto } from '../../types/investments.types'
import { ValidationService } from '../../services/investments/validation.service'
import { CalculationsService } from '../../services/investments/calculations.service'
import { notifyPartialWithdrawal } from '../../bot/telegram-bot'

const prisma = new PrismaClient()

export class WithdrawalController {
  static async earlyWithdrawInvestment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.currentUser!.id
      const { id: investmentId } = request.params as { id: string }
      const { trc20Address } = request.body as { trc20Address?: string }
  
      console.log('Early withdrawal request:', { investmentId, userId, trc20Address })
  
      if (trc20Address) {
        if (!ValidationService.validateTRC20Address(trc20Address.trim())) {
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
  
      const currentDate = (investment.simulatedCurrentDate && investment.simulatedCurrentDate instanceof Date)
        ? investment.simulatedCurrentDate
        : new Date()
      
      const daysPassed = CalculationsService.calculateDaysPassedServer(investment.startDate!, null, currentDate)
  
      console.log('📅 Early withdrawal date calculation:', {
        startDate: investment.startDate?.toISOString(),
        currentDate: currentDate.toISOString(),
        daysPassed,
        isSimulated: !!(investment.simulatedCurrentDate)
      })
  
      if (daysPassed > 30) {
        return reply.code(400).send({
          success: false,
          error: 'Early withdrawal is only available within the first 30 days'
        })
      }
  
      const existingWithdrawal = await prisma.earlyWithdrawal.findFirst({
        where: {
          investmentId,
          status: 'PENDING'
        }
      })
  
      if (existingWithdrawal) {
        return reply.code(400).send({
          success: false,
          error: 'You already have a pending early withdrawal request for this investment'
        })
      }
  
      const withdrawnProfits = Number(investment.withdrawnProfits) || 0
      const accumulatedInterest = Number(investment.accumulatedInterest) || 0
      
      const { earnedInterest, totalAmount } = CalculationsService.calculateEarlyWithdraw(
        Number(investment.amount),
        Number(investment.effectiveROI),
        daysPassed,
        accumulatedInterest,
        withdrawnProfits
      )
  
      console.log('📊 Early withdrawal calculation:', {
        principal: Number(investment.amount),
        earnedInterest: earnedInterest + ' (FORFEITED)',
        withdrawnProfits,
        totalAmount: totalAmount + ' (principal - withdrawn)',
        daysPassed
      })
  
      const withdrawal = await prisma.earlyWithdrawal.create({
        data: {
          investmentId,
          userId,
          investmentAmount: Number(investment.amount),
          daysInvested: daysPassed,
          earnedInterest: earnedInterest,
          withdrawnProfits: withdrawnProfits,
          totalAmount: totalAmount,
          trc20Address: trc20Address?.trim() || null,
          status: 'PENDING'
        }
      })
  
      console.log('✅ Early withdrawal request created:', withdrawal.id)
  
      try {
        const { notifyEarlyWithdrawal } = await import('../../bot/telegram-bot')
      
        await notifyEarlyWithdrawal({
          withdrawalId: withdrawal.id,
          investmentId: investment.id,
          userId: userId,
          userEmail: investment.user.email || 'N/A',
          planName: investment.plan.name,
          amount: totalAmount,                    // ✅ ДОБАВЛЕНО
          invested: Number(investment.amount),    // ✅ ДОБАВЛЕНО
          profit: earnedInterest,                 // ✅ ДОБАВЛЕНО
          investmentAmount: Number(investment.amount),
          daysInvested: daysPassed,
          earnedInterest: earnedInterest,
          withdrawnProfits: withdrawnProfits,
          totalAmount: totalAmount,
          trc20Address: trc20Address?.trim() || 'Not provided',
          language: investment.language || 'en'
        })
      
        console.log('✅ Telegram notification sent successfully')
      } catch (telegramError) {
        console.error('⚠️ Failed to send Telegram notification:', telegramError)
      }
  
      return reply.send({
        success: true,
        message: 'Early withdrawal request submitted successfully. Admin will review your request.',
        data: {
          withdrawalId: withdrawal.id,
          investmentAmount: Number(investment.amount),
          daysInvested: daysPassed,
          earnedInterest: earnedInterest,
          withdrawnProfits: withdrawnProfits,
          totalAmount: totalAmount,
          trc20Address: trc20Address?.trim() || null,
          status: 'PENDING',
          note: 'Earned interest is forfeited as penalty. Only principal minus withdrawn profits will be returned.'
        }
      })
  
    } catch (error: any) {
      console.error('❌ Error processing early withdrawal:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to process early withdrawal'
      })
    }
  }

  static async partialWithdrawInvestment(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.currentUser!.id
    const { id } = request.params as { id: string }
    const { amount, trc20Address, withdrawType } = request.body as {
      amount?: number
      trc20Address: string
      withdrawType?: 'profit' | 'bonus'
    }

    console.log('🚀 partialWithdrawInvestment called:', {
      userId,
      investmentId: id,
      requestedAmount: amount,
      trc20Address,
      withdrawType
    })

    try {
      const requestedAmount = amount ? Number(amount) : 0

      console.log('💰 Requested amount from body:', requestedAmount)

      if (!trc20Address || !trc20Address.trim()) {
        return reply.code(400).send({
          success: false,
          error: 'TRC-20 address is required'
        })
      }

      if (!ValidationService.validateTRC20Address(trc20Address.trim())) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid TRC-20 address format'
        })
      }

      if (withdrawType === 'profit') {
        if (!requestedAmount || requestedAmount <= 0) {
          return reply.code(400).send({
            success: false,
            error: 'Amount must be greater than 0'
          })
        }
      }

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
              id: true,
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

      if (investment.withdrawalRequested) {
        return reply.code(400).send({
          success: false,
          error: 'You already have a pending withdrawal request for this investment'
        })
      }

      const investmentAmount = Number(investment.amount)
      const accumulatedInterest = Number(investment.accumulatedInterest) || 0
      const withdrawnProfits = Number(investment.withdrawnProfits) || 0

      const currentDate = investment.simulatedCurrentDate || new Date()
      const baseDate = investment.lastUpgradeDate || investment.startDate
      
      const daysPassed = baseDate 
        ? Math.floor((currentDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0

      const dailyRate = Number(investment.effectiveROI) / 30
      const newPeriodProfit = (investmentAmount * dailyRate * daysPassed) / 100
      const totalProfit = accumulatedInterest + newPeriodProfit
      const availableProfit = Math.max(0, totalProfit - withdrawnProfits)

      console.log('📊 Profit calculation:', {
        investmentAmount,
        accumulatedInterest,
        withdrawnProfits,
        daysPassed,
        dailyRate,
        newPeriodProfit,
        totalProfit,
        availableProfit,
        requestedAmount
      })

      if (withdrawType === 'profit') {
        if (requestedAmount > availableProfit) {
          return reply.code(400).send({
            success: false,
            error: `Insufficient profit. Available: $${availableProfit.toFixed(2)}, Requested: $${requestedAmount.toFixed(2)}`
          })
        }
      }

      let finalAmount = requestedAmount
      let finalWithdrawType: 'PROFIT' | 'BONUS' = 'PROFIT'

      if (withdrawType === 'bonus') {
        const duration = investment.duration
        let calculatedBonus = 0

        if (duration !== 3 && investmentAmount >= 500) {
          if (investmentAmount >= 1000) {
            calculatedBonus = duration === 6 || duration === 12 ? 500 : 0
          } else {
            calculatedBonus = duration === 6 || duration === 12 ? 200 : 0
          }
        }

        console.log('🎁 Bonus calculation:', {
          duration,
          investmentAmount,
          calculatedBonus
        })

        if (calculatedBonus <= 0) {
          return reply.code(400).send({
            success: false,
            error: 'No bonus available for this investment'
          })
        }

        finalAmount = calculatedBonus
        finalWithdrawType = 'BONUS'
      }

      console.log('💵 Final withdrawal amount:', finalAmount)
      console.log('📝 Final withdrawal type:', finalWithdrawType)

      const partialWithdrawal = await prisma.partialWithdrawal.create({
        data: {
          investmentId: investment.id,
          userId: userId,
          amount: finalAmount,
          type: finalWithdrawType,
          trc20Address: trc20Address.trim(),
          status: 'PENDING'
        }
      })

      console.log('✅ Partial withdrawal created:', partialWithdrawal)

      try {
        await notifyPartialWithdrawal({
          withdrawalId: partialWithdrawal.id,
          investmentId: investment.id,
          userId: investment.userId,
          userEmail: investment.user.email || '',
          planName: investment.plan.name,
          amount: finalAmount,
          invested: investmentAmount,             // ✅ ДОБАВЛЕНО
          profit: availableProfit,                // ✅ ДОБАВЛЕНО
          investmentAmount: investmentAmount,
          totalWithdrawn: withdrawnProfits,
          trc20Address: trc20Address.trim(),
          language: (request.body as any).language || 'en'
        })

        console.log('✅ Telegram notification sent')
      } catch (telegramError) {
        console.error('❌ Failed to send Telegram notification:', telegramError)
      }

      const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'dxcapital_bot'
      const botLink = `https://t.me/${botUsername}?start=partial_${partialWithdrawal.id}`

      return reply.code(200).send({
        success: true,
        message: `${finalWithdrawType === 'BONUS' ? 'Bonus' : 'Profit'} withdrawal request created. Admin will review your request shortly.`,
        botLink: botLink,
        withdrawalId: partialWithdrawal.id,
        data: {
          withdrawalId: partialWithdrawal.id,
          type: finalWithdrawType,
          amount: finalAmount,
          trc20Address: trc20Address.trim(),
          status: 'PENDING'
        }
      })

    } catch (error) {
      console.error('❌ Partial withdraw error:', error)
      return reply.code(500).send({
        success: false,
        error: 'An error occurred while processing your withdrawal request'
      })
    }
  }

  static async requestWithdrawal(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.currentUser!.id
      const { id: investmentId } = request.params as { id: string }
      const { trc20Address } = request.body as { trc20Address: string }

      console.log('Withdrawal request:', { investmentId, userId, trc20Address })

      if (!ValidationService.validateTRC20Address(trc20Address.trim())) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid TRC-20 address format'
        })
      }

      const investment = await prisma.investment.findFirst({
        where: {
          id: investmentId,
          userId
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
          error: 'Investment not found'
        })
      }

      if (investment.status !== 'COMPLETED' && investment.status !== 'ACTIVE') {
        return reply.code(400).send({
          success: false,
          error: 'Investment is not ready for withdrawal'
        })
      }

      if (investment.withdrawalRequested) {
        return reply.code(400).send({
          success: false,
          error: 'Withdrawal already requested for this investment'
        })
      }

      const expectedReturnNum = Number(investment.expectedReturn)
      const amountNum = Number(investment.amount)
      const profitNum = expectedReturnNum - amountNum

      console.log('💰 Withdrawal calculation:', {
        invested: amountNum,
        expectedReturn: expectedReturnNum,
        profit: profitNum,
        oldTotalReturn: Number(investment.totalReturn)
      })

      const withdrawal = await prisma.withdrawalRequest.create({
        data: {
          investmentId,
          userId,
          amount: expectedReturnNum,
          trc20Address: trc20Address.trim(),
          status: 'PENDING'
        }
      })

      await prisma.investment.update({
        where: { id: investmentId },
        data: { withdrawalRequested: true }
      })

      try {
        const { notifyWithdrawalRequest } = await import('../../bot/telegram-bot')
      
        await notifyWithdrawalRequest({
          withdrawalId: withdrawal.id,
          investmentId: investment.id,
          userId: userId,
          userEmail: investment.user.email || 'N/A',
          planName: investment.plan.name,
          amount: expectedReturnNum,
          invested: amountNum,
          profit: profitNum,
          trc20Address: trc20Address.trim(),
          language: investment.language || 'en'
        })
      
        console.log('✅ Withdrawal notification sent to Telegram with expectedReturn:', expectedReturnNum)
      } catch (telegramError) {
        console.error('❌ Failed to send Telegram notification:', telegramError)
      }

      return reply.send({
        success: true,
        message: 'Withdrawal request submitted successfully',
        data: {
          withdrawalId: withdrawal.id,
          amount: expectedReturnNum,
          trc20Address: trc20Address.trim(),
          status: 'PENDING'
        }
      })

    } catch (error: any) {
      console.error('❌ Error requesting withdrawal:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to request withdrawal'
      })
    }
  }
}
