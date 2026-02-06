import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { notifyWithdrawalRequest, notifyUpgradeRequest, notifyEarlyWithdrawal } from '../bot/telegram-bot'

const prisma = new PrismaClient()

interface InvestmentIdParams {
  id: string
}

interface ApproveInvestmentBody {
  supportUserId: string
}

interface ApproveWithdrawalBody {
  supportUserId: string
  txHash?: string
}

interface RejectWithdrawalBody {
  supportUserId: string
  reason?: string
}

interface NotifyWithdrawalBody {
  investmentId: string
  userId: string
  username?: string
  userEmail: string
  planName: string
  amount: number
  invested: number
  profit: number
  trc20Address: string
}

interface ApproveUpgradeBody {
  supportUserId: string
}

interface RejectUpgradeBody {
  supportUserId: string
  reason?: string
}

interface ApproveEarlyWithdrawalBody {
  supportUserId: string
}

interface RejectEarlyWithdrawalBody {
  supportUserId: string
  reason?: string
}

interface ApprovePartialWithdrawalBody {
  supportUserId: string
  txHash?: string
}

interface RejectPartialWithdrawalBody {
  supportUserId: string
  reason?: string
}

// ✅ Функция расчёта бонуса
function getDurationBonus(duration: number, amount: number): number {
  if (duration === 3) return 0
  if (duration === 6 || duration === 12) {
    if (amount >= 1000) return 500
    if (amount >= 500) return 200
  }
  return 0
}

// ✅ КОНСТАНТЫ БОНУСОВ
const DURATION_BONUSES: Record<number, { months: number; rateBonus: number; cashBonus: number; label: string }> = {
  3: {
    months: 3,
    rateBonus: 0,
    cashBonus: 0,
    label: '3 месяца'
  },
  6: {
    months: 6,
    rateBonus: 1.5,
    cashBonus: 200,
    label: '6 месяцев'
  },
  12: {
    months: 12,
    rateBonus: 3,
    cashBonus: 500,
    label: '12 месяцев'
  }
}

export class TelegramController {
  /**
   * ✅ Получение инвестиции для бота
   */
  static async getInvestmentForBot(request: FastifyRequest<{ Params: InvestmentIdParams }>, reply: FastifyReply) {
    try {
      const { id } = request.params
  
      console.log('Telegram bot requesting investment:', id)
  
      const investment = await prisma.investment.findUnique({
        where: { id },
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
          error: 'Investment not found'
        })
      }
  
      if (investment.status !== 'PENDING') {
        return reply.code(400).send({
          success: false,
          error: 'Investment already processed',
          data: null
        })
      }
  
      const roi = Number(investment.roi || 0)
      const durationBonus = Number(investment.durationBonus || 0)
      const bonusAmount = Number(investment.bonusAmount || 0)
      const effectiveROI = roi + durationBonus
  
      return reply.code(200).send({
        success: true,
        data: {
          investmentId: investment.id,
          amount: Number(investment.amount),
          currency: investment.currency,
          planName: investment.plan.name,
          duration: investment.duration,
          roi: roi,
          durationBonus: durationBonus,
          bonusAmount: bonusAmount,
          effectiveROI: effectiveROI,
          expectedReturn: Number(investment.expectedReturn),
          totalReturn: Number(investment.totalReturn),
          adminWallet: investment.adminWalletAddress,
          senderWallet: investment.userWalletAddress,
          userId: investment.userId,
          userEmail: investment.user.email,
          language: investment.language || 'en'
        }
      })
  
    } catch (error: any) {
      console.error('Error in getInvestmentForBot:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch investment'
      })
    }
  }

  static async approveInvestment(
    request: FastifyRequest<{ Params: InvestmentIdParams; Body: ApproveInvestmentBody }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const { supportUserId } = request.body

      console.log('Support approving investment:', id, 'by:', supportUserId)

      const supportTelegramId = process.env.SUPPORT_TELEGRAM_ID
      if (supportUserId !== supportTelegramId) {
        return reply.code(403).send({
          success: false,
          error: 'Only support can approve investments'
        })
      }

      const investment = await prisma.investment.findUnique({
        where: { id }
      })

      if (!investment) {
        return reply.code(404).send({
          success: false,
          error: 'Investment not found'
        })
      }

      if (investment.status !== 'PENDING') {
        return reply.code(400).send({
          success: false,
          error: 'Investment already processed'
        })
      }

      const now = new Date()
      const endDate = new Date(now)
      const durationInDays = investment.duration * 30
      endDate.setDate(endDate.getDate() + durationInDays)

      const updatedInvestment = await prisma.investment.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          startDate: now,
          endDate: endDate,
          transactionHash: `TELEGRAM_APPROVED_${Date.now()}`
        }
      })

      await prisma.auditLog.create({
        data: {
          userId: investment.userId,
          action: 'APPROVE_TELEGRAM_INVESTMENT',
          resource: 'INVESTMENT',
          details: `Investment ${id} approved by support ${supportUserId} via Telegram`,
          ipAddress: request.ip,
          userAgent: 'TelegramBot',
          success: true
        }
      })

      console.log('Investment approved successfully:', id)

      return reply.code(200).send({
        success: true,
        message: 'Investment approved successfully',
        data: {
          investmentId: updatedInvestment.id,
          status: updatedInvestment.status,
          startDate: updatedInvestment.startDate,
          endDate: updatedInvestment.endDate
        }
      })

    } catch (error: any) {
      console.error('Error in approveInvestment:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to approve investment'
      })
    }
  }

  static async cancelInvestmentFromBot(
    request: FastifyRequest<{ Params: InvestmentIdParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params

      console.log('Cancelling investment from Telegram:', id)

      const investment = await prisma.investment.findUnique({
        where: { id }
      })

      if (!investment) {
        return reply.code(404).send({
          success: false,
          error: 'Investment not found'
        })
      }

      if (investment.status !== 'PENDING') {
        return reply.code(400).send({
          success: false,
          error: 'Can only cancel pending investments'
        })
      }

      await prisma.investment.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          completedAt: new Date()
        }
      })

      console.log('Investment cancelled successfully:', id)

      return reply.code(200).send({
        success: true,
        message: 'Investment cancelled successfully'
      })

    } catch (error: any) {
      console.error('Error in cancelInvestmentFromBot:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to cancel investment'
      })
    }
  }

  /**
   * ✅ Уведомление о выводе средств
   */
  static async notifyWithdrawal(
    request: FastifyRequest<{ Body: NotifyWithdrawalBody }>,
    reply: FastifyReply
  ) {
    try {
      const {
        investmentId,
        userId,
        username,
        userEmail,
        planName,
        amount,
        invested,
        profit,
        trc20Address
      } = request.body

      console.log('Notifying withdrawal request:', investmentId)

      if (!investmentId || !userId || !amount || !trc20Address) {
        return reply.code(400).send({
          success: false,
          error: 'Missing required fields: investmentId, userId, amount, trc20Address'
        })
      }

      const investment = await prisma.investment.findUnique({
        where: { id: investmentId }
      })

      if (!investment) {
        return reply.code(404).send({
          success: false,
          error: 'Investment not found'
        })
      }

      let withdrawalRequest = await prisma.withdrawalRequest.findFirst({
        where: { investmentId }
      })

      if (!withdrawalRequest) {
        withdrawalRequest = await prisma.withdrawalRequest.create({
          data: {
            investmentId,
            userId,
            amount: parseFloat(amount.toString()),
            trc20Address,
            status: 'PENDING'
          }
        })
      }

      console.log('Withdrawal request created/found:', withdrawalRequest.id)

      const result = await notifyWithdrawalRequest({
        withdrawalId: withdrawalRequest.id,
        investmentId,
        userId: userId.toString(),
        userEmail,
        planName,
        amount: parseFloat(amount.toString()),
        invested: parseFloat(invested?.toString() || '0'),
        profit: parseFloat(profit?.toString() || '0'),
        trc20Address,
        language: investment.language || 'en'
      })
      

      if (result.success) {
        await prisma.auditLog.create({
          data: {
            userId,
            action: 'WITHDRAWAL_NOTIFICATION_SENT',
            resource: 'WITHDRAWAL',
            details: `Withdrawal notification sent to Telegram for investment ${investmentId}`,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'] || 'Unknown',
            success: true
          }
        })

        return reply.code(200).send({
          success: true,
          message: 'Notification sent to support',
          data: {
            withdrawalId: withdrawalRequest.id
          }
        })
      } else {
        return reply.code(500).send({
          success: false,
          error: result.error || 'Failed to send notification'
        })
      }

    } catch (error: any) {
      console.error('Error in notifyWithdrawal:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: error.message || 'Failed to notify withdrawal'
      })
    }
  }

  static async getWithdrawalRequest(
    request: FastifyRequest<{ Params: InvestmentIdParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params

      console.log('Telegram bot requesting withdrawal:', id)

      const withdrawal = await prisma.withdrawalRequest.findUnique({
        where: { id },
        include: {
          investment: {
            include: {
              plan: true
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              username: true
            }
          }
        }
      })

      if (!withdrawal) {
        return reply.code(404).send({
          success: false,
          error: 'Withdrawal request not found'
        })
      }

      return reply.code(200).send({
        success: true,
        data: {
          withdrawalId: withdrawal.id,
          amount: Number(withdrawal.amount),
          trc20Address: withdrawal.trc20Address,
          status: withdrawal.status,
          createdAt: withdrawal.createdAt,
          investment: {
            id: withdrawal.investment.id,
            planName: withdrawal.investment.plan.name,
            amount: Number(withdrawal.investment.amount),
            totalReturn: Number(withdrawal.investment.totalReturn),
            language: withdrawal.investment.language || 'en'
          },
          user: {
            id: withdrawal.user.id,
            email: withdrawal.user.email,
            username: withdrawal.user.username
          }
        }
      })

    } catch (error: any) {
      console.error('Error in getWithdrawalRequest:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch withdrawal request'
      })
    }
  }

  static async approveWithdrawal(
    request: FastifyRequest<{ Params: InvestmentIdParams; Body: ApproveWithdrawalBody }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const { supportUserId, txHash } = request.body

      console.log('Support approving withdrawal:', id, 'by:', supportUserId)

      const supportTelegramId = process.env.SUPPORT_TELEGRAM_ID
      if (supportUserId !== supportTelegramId) {
        return reply.code(403).send({
          success: false,
          error: 'Only support can approve withdrawals'
        })
      }

      const withdrawal = await prisma.withdrawalRequest.findUnique({
        where: { id }
      })

      if (!withdrawal) {
        return reply.code(404).send({
          success: false,
          error: 'Withdrawal request not found'
        })
      }

      if (withdrawal.status !== 'PENDING') {
        return reply.code(400).send({
          success: false,
          error: 'Withdrawal already processed'
        })
      }

      const updatedWithdrawal = await prisma.withdrawalRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          processedAt: new Date(),
          txHash: txHash || `TELEGRAM_WITHDRAWAL_${Date.now()}`
        }
      })

      await prisma.investment.update({
        where: { id: withdrawal.investmentId },
        data: {
          status: 'WITHDRAWN',
          completedAt: new Date()
        }
      })

      await prisma.auditLog.create({
        data: {
          userId: withdrawal.userId,
          action: 'APPROVE_WITHDRAWAL',
          resource: 'WITHDRAWAL',
          details: `Withdrawal ${id} approved by support ${supportUserId} via Telegram`,
          ipAddress: request.ip,
          userAgent: 'TelegramBot',
          success: true
        }
      })

      console.log('Withdrawal approved successfully:', id)

      return reply.code(200).send({
        success: true,
        message: 'Withdrawal approved successfully',
        data: {
          withdrawalId: updatedWithdrawal.id,
          status: updatedWithdrawal.status,
          processedAt: updatedWithdrawal.processedAt
        }
      })

    } catch (error: any) {
      console.error('Error in approveWithdrawal:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to approve withdrawal'
      })
    }
  }

  static async rejectWithdrawal(
    request: FastifyRequest<{ Params: InvestmentIdParams; Body: RejectWithdrawalBody }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const { supportUserId, reason } = request.body

      console.log('Support rejecting withdrawal:', id, 'by:', supportUserId)

      const supportTelegramId = process.env.SUPPORT_TELEGRAM_ID
      if (supportUserId !== supportTelegramId) {
        return reply.code(403).send({
          success: false,
          error: 'Only support can reject withdrawals'
        })
      }

      const withdrawal = await prisma.withdrawalRequest.findUnique({
        where: { id }
      })

      if (!withdrawal) {
        return reply.code(404).send({
          success: false,
          error: 'Withdrawal request not found'
        })
      }

      if (withdrawal.status !== 'PENDING') {
        return reply.code(400).send({
          success: false,
          error: 'Withdrawal already processed'
        })
      }

      const updatedWithdrawal = await prisma.withdrawalRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          processedAt: new Date(),
          rejectionReason: reason || 'Rejected by admin'
        }
      })

      await prisma.investment.update({
        where: { id: withdrawal.investmentId },
        data: {
          withdrawalRequested: false
        }
      })

      await prisma.auditLog.create({
        data: {
          userId: withdrawal.userId,
          action: 'REJECT_WITHDRAWAL',
          resource: 'WITHDRAWAL',
          details: `Withdrawal ${id} rejected by support ${supportUserId}. Reason: ${reason || 'No reason'}`,
          ipAddress: request.ip,
          userAgent: 'TelegramBot',
          success: true
        }
      })

      console.log('Withdrawal rejected successfully:', id)

      return reply.code(200).send({
        success: true,
        message: 'Withdrawal rejected successfully',
        data: {
          withdrawalId: updatedWithdrawal.id,
          status: updatedWithdrawal.status,
          processedAt: updatedWithdrawal.processedAt
        }
      })

    } catch (error: any) {
      console.error('Error in rejectWithdrawal:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to reject withdrawal'
      })
    }
  }

  /**
   * ✅ ПОЛУЧЕНИЕ ЧАСТИЧНОГО ВЫВОДА (БОНУС/ПРИБЫЛЬ)
   */
  static async getPartialWithdrawal(
    request: FastifyRequest<{ Params: InvestmentIdParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params

      console.log('🔍 Telegram bot requesting partial withdrawal:', id)

      const withdrawal = await prisma.partialWithdrawal.findUnique({
        where: { id },
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

      // ✅ ПРАВИЛЬНОЕ ОПРЕДЕЛЕНИЕ БОНУСА
      const investmentAmount = Number(withdrawal.investment.amount)
      const duration = withdrawal.investment.duration
      
      // Вычисляем бонус по тем же правилам что и при создании
      let calculatedBonus = 0
      if (investmentAmount >= 500 && duration !== 3) {
        if (investmentAmount >= 1000) {
          calculatedBonus = duration === 6 ? 500 : duration === 12 ? 500 : 0
        } else {
          calculatedBonus = duration === 6 ? 200 : duration === 12 ? 200 : 0
        }
      }

      const withdrawalAmount = Number(withdrawal.amount)
      
      // ✅ ТОЧНОЕ СРАВНЕНИЕ: это бонус если сумма совпадает с вычисленным бонусом
      const isBonus = calculatedBonus > 0 && Math.abs(withdrawalAmount - calculatedBonus) < 0.01

      console.log('🔍 Withdrawal type detection:', {
        withdrawalAmount,
        calculatedBonus,
        duration,
        investmentAmount,
        isBonus,
        withdrawType: isBonus ? 'bonus' : 'profit',
        bonusWithdrawn: withdrawal.investment.bonusWithdrawn
      })

      // ✅ Расчет доступной прибыли для frontend
      const currentDate = (withdrawal.investment.simulatedCurrentDate && withdrawal.investment.simulatedCurrentDate instanceof Date)
        ? withdrawal.investment.simulatedCurrentDate
        : new Date()

      const baseDate = withdrawal.investment.lastUpgradeDate || withdrawal.investment.startDate
      const daysPassed = baseDate 
        ? Math.floor((currentDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0

      const effectiveROI = Number(withdrawal.investment.effectiveROI)
      const accumulatedInterest = Number(withdrawal.investment.accumulatedInterest || 0)
      const dailyRate = effectiveROI / 30
      const newPeriodProfit = (investmentAmount * dailyRate * daysPassed) / 100
      const totalProfit = accumulatedInterest + newPeriodProfit
      
      const withdrawnProfits = Number(withdrawal.investment.withdrawnProfits || 0)
      const availableProfit = Math.max(0, totalProfit - withdrawnProfits)

      console.log('💰 Available profit calculation:', {
        totalProfit: totalProfit.toFixed(2),
        withdrawnProfits: withdrawnProfits.toFixed(2),
        availableProfit: availableProfit.toFixed(2)
      })

      return reply.code(200).send({
        success: true,
        data: {
          withdrawalId: withdrawal.id,
          investmentId: withdrawal.investmentId,
          userId: withdrawal.userId,
          userEmail: withdrawal.investment.user.email,
          planName: withdrawal.investment.plan.name,
          investmentAmount: investmentAmount,
          duration: duration,
          amount: withdrawalAmount, // ✅ ЗАПРОШЕННАЯ ЮЗЕРОМ СУММА
          totalWithdrawn: withdrawnProfits,  // ✅ ДОБАВЬ ЭТУ СТРОКУ!!!
          withdrawType: isBonus ? 'bonus' : 'profit',
          bonusAmount: isBonus ? calculatedBonus : 0,
          availableProfit: availableProfit, // ✅ Для информации
          trc20Address: withdrawal.trc20Address,
          createdAt: withdrawal.createdAt,
          language: withdrawal.investment.language || 'en'
        }
      })

    } catch (error: any) {
      console.error('❌ Error in getPartialWithdrawal:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch partial withdrawal'
      })
    }
  }


  /**
   * ✅ ПОДТВЕРЖДЕНИЕ ЧАСТИЧНОГО ВЫВОДА (БОНУС/ПРИБЫЛЬ)
   */
  static async approvePartialWithdrawal(
    request: FastifyRequest<{ Params: InvestmentIdParams; Body: ApprovePartialWithdrawalBody }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const { supportUserId, txHash } = request.body

      console.log('✅ Support approving partial withdrawal:', id, 'by:', supportUserId)

      const supportTelegramId = process.env.SUPPORT_TELEGRAM_ID
      if (supportUserId !== supportTelegramId) {
        return reply.code(403).send({
          success: false,
          error: 'Only support can approve partial withdrawals'
        })
      }

      const withdrawal = await prisma.partialWithdrawal.findUnique({
        where: { id },
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

      const calculatedBonus = getDurationBonus(
        withdrawal.investment.duration,
        Number(withdrawal.investment.amount)
      )
      const withdrawalAmount = Number(withdrawal.amount)
      const isBonus = calculatedBonus > 0 && Math.abs(withdrawalAmount - calculatedBonus) < 0.01

      console.log('🔍 Processing withdrawal type:', {
        withdrawalAmount,
        calculatedBonus,
        isBonus,
        withdrawType: isBonus ? 'bonus' : 'profit'
      })

      const updatedWithdrawal = await prisma.partialWithdrawal.update({
        where: { id },
        data: {
          status: 'APPROVED',
          processedDate: new Date(),
          txHash: txHash || `TELEGRAM_PARTIAL_${Date.now()}`
        }
      })

      const updateData: any = {}

      if (isBonus) {
        updateData.bonusWithdrawn = true
        console.log('✅ Marking bonusWithdrawn = true for investment:', withdrawal.investmentId)
      } else {
        const currentWithdrawn = Number(withdrawal.investment.withdrawnProfits || 0)
        updateData.withdrawnProfits = currentWithdrawn + withdrawalAmount
        console.log('✅ Updating withdrawnProfits:', {
          previous: currentWithdrawn,
          added: withdrawalAmount,
          new: currentWithdrawn + withdrawalAmount
        })
      }

      await prisma.investment.update({
        where: { id: withdrawal.investmentId },
        data: updateData
      })

      await prisma.auditLog.create({
        data: {
          userId: withdrawal.userId,
          action: isBonus ? 'APPROVE_BONUS_WITHDRAWAL' : 'APPROVE_PROFIT_WITHDRAWAL',
          resource: 'PARTIAL_WITHDRAWAL',
          details: `${isBonus ? 'Bonus' : 'Profit'} withdrawal ${id} ($${withdrawalAmount}) approved by support ${supportUserId} via Telegram`,
          ipAddress: request.ip,
          userAgent: 'TelegramBot',
          success: true
        }
      })

      console.log('✅ Partial withdrawal approved successfully:', id)

      return reply.code(200).send({
        success: true,
        message: `${isBonus ? 'Bonus' : 'Profit'} withdrawal approved successfully`,
        data: {
          withdrawalId: updatedWithdrawal.id,
          withdrawType: isBonus ? 'bonus' : 'profit',
          status: updatedWithdrawal.status,
          processedDate: updatedWithdrawal.processedDate
        }
      })

    } catch (error: any) {
      console.error('❌ Error in approvePartialWithdrawal:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to approve partial withdrawal'
      })
    }
  }

  /**
   * ✅ ОТКЛОНЕНИЕ ЧАСТИЧНОГО ВЫВОДА (БОНУС/ПРИБЫЛЬ)
   */
  static async rejectPartialWithdrawal(
    request: FastifyRequest<{ Params: InvestmentIdParams; Body: RejectPartialWithdrawalBody }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const { supportUserId, reason } = request.body

      console.log('❌ Support rejecting partial withdrawal:', id, 'by:', supportUserId)

      const supportTelegramId = process.env.SUPPORT_TELEGRAM_ID
      if (supportUserId !== supportTelegramId) {
        return reply.code(403).send({
          success: false,
          error: 'Only support can reject partial withdrawals'
        })
      }

      const withdrawal = await prisma.partialWithdrawal.findUnique({
        where: { id },
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

      const calculatedBonus = getDurationBonus(
        withdrawal.investment.duration,
        Number(withdrawal.investment.amount)
      )
      const withdrawalAmount = Number(withdrawal.amount)
      const isBonus = calculatedBonus > 0 && Math.abs(withdrawalAmount - calculatedBonus) < 0.01

      const updatedWithdrawal = await prisma.partialWithdrawal.update({
        where: { id },
        data: {
          status: 'REJECTED',
          processedDate: new Date()
        }
      })

      await prisma.auditLog.create({
        data: {
          userId: withdrawal.userId,
          action: isBonus ? 'REJECT_BONUS_WITHDRAWAL' : 'REJECT_PROFIT_WITHDRAWAL',
          resource: 'PARTIAL_WITHDRAWAL',
          details: `${isBonus ? 'Bonus' : 'Profit'} withdrawal ${id} rejected by support ${supportUserId}. Reason: ${reason || 'No reason'}`,
          ipAddress: request.ip,
          userAgent: 'TelegramBot',
          success: true
        }
      })

      console.log('❌ Partial withdrawal rejected successfully:', id)

      return reply.code(200).send({
        success: true,
        message: `${isBonus ? 'Bonus' : 'Profit'} withdrawal rejected successfully`,
        data: {
          withdrawalId: updatedWithdrawal.id,
          withdrawType: isBonus ? 'bonus' : 'profit',
          status: updatedWithdrawal.status,
          processedDate: updatedWithdrawal.processedDate
        }
      })

    } catch (error: any) {
      console.error('❌ Error in rejectPartialWithdrawal:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to reject partial withdrawal'
      })
    }
  }

  /**
   * ✅ Получение данных апгрейда для бота
   */
  static async getUpgradeForBot(
    request: FastifyRequest<{ Params: InvestmentIdParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params

      console.log('Telegram bot requesting upgrade:', id)

      const upgrade = await prisma.investmentUpgrade.findUnique({
        where: { id },
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
          userId: upgrade.userId,
          userEmail: upgrade.investment.user.email,
          oldPackage: upgrade.oldPackage,
          newPackage: upgrade.newPackage,
          oldAPY: Number(upgrade.oldAPY),
          newAPY: Number(upgrade.newAPY),
          oldAmount: Number(upgrade.investment.amount),
          additionalAmount: Number(upgrade.additionalAmount),
          totalAmount: Number(upgrade.investment.amount) + Number(upgrade.additionalAmount),
          adminWallet: upgrade.adminWalletAddress,
          senderWallet: upgrade.senderWalletAddress,
          language: upgrade.investment.language || 'en'
        }
      })

    } catch (error: any) {
      console.error('Error in getUpgradeForBot:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch upgrade'
      })
    }
  }

  /**
   * ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Подтверждение апгрейда БЕЗ СБРОСА СРОКОВ
   */
  static async approveUpgrade(
    request: FastifyRequest<{ Params: InvestmentIdParams; Body: ApproveUpgradeBody }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const { supportUserId } = request.body

      console.log('🔄 Support approving upgrade:', id, 'by:', supportUserId)

      const supportTelegramId = process.env.SUPPORT_TELEGRAM_ID
      if (supportUserId !== supportTelegramId) {
        return reply.code(403).send({
          success: false,
          error: 'Only support can approve upgrades'
        })
      }

      const upgrade = await prisma.investmentUpgrade.findUnique({
        where: { id },
        include: {
          investment: {
            include: {
              plan: true,
              user: true
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

      const investment = upgrade.investment

      const oldAmount = Number(investment.amount)
      const additionalAmount = Number(upgrade.additionalAmount)
      const newTotalAmount = oldAmount + additionalAmount

      const durationBonus = DURATION_BONUSES[investment.duration]
      const newBaseAPY = Number(upgrade.newAPY)
      const effectiveRate = newBaseAPY + (durationBonus?.rateBonus || 0)
      const cashBonus = durationBonus?.cashBonus || 0

      const originalStartDate = new Date(investment.startDate!)
      const originalEndDate = new Date(investment.endDate!)
      const now = new Date()
      
      const totalDays = Math.floor((originalEndDate.getTime() - originalStartDate.getTime()) / (1000 * 60 * 60 * 24))
      const daysPassed = Math.floor((now.getTime() - originalStartDate.getTime()) / (1000 * 60 * 60 * 24))
      const daysRemaining = Math.max(0, totalDays - daysPassed)

      console.log('📅 Date preservation:', {
        originalStartDate,
        originalEndDate,
        totalDays,
        daysPassed,
        daysRemaining,
        willNotChange: 'startDate and endDate remain unchanged'
      })

      const remainingMonths = daysRemaining / 30
      const newExpectedReturn = (newTotalAmount * effectiveRate * remainingMonths) / 100
      
      const accumulatedInterest = Number(upgrade.accumulatedInterest || 0)
      const totalExpectedReturn = newExpectedReturn + accumulatedInterest
      
      const newTotalReturn = newTotalAmount + totalExpectedReturn + cashBonus

      console.log('💰 Financial calculation:', {
        oldAmount,
        additionalAmount,
        newTotalAmount,
        newBaseAPY,
        durationBonus: durationBonus?.rateBonus,
        effectiveRate,
        remainingMonths: remainingMonths.toFixed(2),
        newExpectedReturn: newExpectedReturn.toFixed(2),
        accumulatedInterest: accumulatedInterest.toFixed(2),
        totalExpectedReturn: totalExpectedReturn.toFixed(2),
        cashBonus,
        newTotalReturn: newTotalReturn.toFixed(2)
      })

      const newPlan = await prisma.stakingPlan.findFirst({
        where: { name: upgrade.newPackage }
      })

      if (!newPlan) {
        return reply.code(404).send({
          success: false,
          error: 'Target plan not found'
        })
      }

      await prisma.investment.update({
        where: { id: investment.id },
        data: {
          amount: newTotalAmount,
          roi: newBaseAPY,
          durationBonus: durationBonus?.rateBonus || 0,
          effectiveROI: effectiveRate,
          expectedReturn: totalExpectedReturn,
          totalReturn: newTotalReturn,
          bonusAmount: cashBonus,
          accumulatedInterest: accumulatedInterest,
          lastUpgradeDate: new Date(),
          planId: newPlan.id
        }
      })

      console.log('✅ Investment updated WITHOUT changing dates')

      await prisma.investmentUpgrade.update({
        where: { id },
        data: {
          status: 'APPROVED',
          processedDate: new Date()
        }
      })

      await prisma.auditLog.create({
        data: {
          userId: investment.userId,
          action: 'APPROVE_UPGRADE',
          resource: 'UPGRADE',
          details: JSON.stringify({
            upgradeId: id,
            investmentId: investment.id,
            oldPackage: upgrade.oldPackage,
            newPackage: upgrade.newPackage,
            oldAmount,
            additionalAmount,
            newTotalAmount,
            oldAPY: Number(upgrade.oldAPY),
            newAPY: newBaseAPY,
            effectiveRate,
            originalStartDate,
            originalEndDate,
            daysRemaining,
            accumulatedInterest,
            totalExpectedReturn,
            newTotalReturn,
            datesUnchanged: true
          }),
          ipAddress: request.ip,
          userAgent: 'TelegramBot',
          success: true
        }
      })

      console.log('✅ Upgrade approved successfully with preserved dates')

      return reply.code(200).send({
        success: true,
        message: 'Upgrade approved successfully. Investment dates remain unchanged.',
        data: {
          upgradeId: id,
          investmentId: investment.id,
          status: 'APPROVED',
          processedDate: new Date(),
          newAmount: newTotalAmount,
          newPackage: upgrade.newPackage,
          newAPY: newBaseAPY,
          effectiveRate,
          originalStartDate,
          originalEndDate,
          daysRemaining,
          totalReturn: newTotalReturn
        }
      })

    } catch (error: any) {
      console.error('❌ Error in approveUpgrade:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to approve upgrade'
      })
    }
  }

  /**
   * ✅ Отклонение апгрейда
   */
  static async rejectUpgrade(
    request: FastifyRequest<{ Params: InvestmentIdParams; Body: RejectUpgradeBody }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const { supportUserId, reason } = request.body

      console.log('Support rejecting upgrade:', id, 'by:', supportUserId)

      const supportTelegramId = process.env.SUPPORT_TELEGRAM_ID
      if (supportUserId !== supportTelegramId) {
        return reply.code(403).send({
          success: false,
          error: 'Only support can reject upgrades'
        })
      }

      const upgrade = await prisma.investmentUpgrade.findUnique({
        where: { id }
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

      const updatedUpgrade = await prisma.investmentUpgrade.update({
        where: { id },
        data: {
          status: 'REJECTED',
          processedDate: new Date()
        }
      })

      await prisma.auditLog.create({
        data: {
          userId: upgrade.userId,
          action: 'REJECT_UPGRADE',
          resource: 'UPGRADE',
          details: `Upgrade ${id} rejected by support ${supportUserId}. Reason: ${reason || 'No reason'}`,
          ipAddress: request.ip,
          userAgent: 'TelegramBot',
          success: true
        }
      })

      console.log('Upgrade rejected successfully:', id)

      return reply.code(200).send({
        success: true,
        message: 'Upgrade rejected successfully',
        data: {
          upgradeId: updatedUpgrade.id,
          status: updatedUpgrade.status,
          processedDate: updatedUpgrade.processedDate
        }
      })

    } catch (error: any) {
      console.error('Error in rejectUpgrade:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to reject upgrade'
      })
    }
  }

  /**
   * ✅ Получение данных досрочного вывода для бота
   */
  static async getEarlyWithdrawalForBot(
    request: FastifyRequest<{ Params: InvestmentIdParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params

      console.log('Telegram bot requesting early withdrawal:', id)

      const withdrawal = await prisma.earlyWithdrawal.findUnique({
        where: { id },
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
          withdrawalId: withdrawal.id,
          investmentId: withdrawal.investmentId,
          userId: withdrawal.userId,
          userEmail: withdrawal.investment.user.email,
          planName: withdrawal.investment.plan.name,
          investmentAmount: Number(withdrawal.investmentAmount),
          daysInvested: withdrawal.daysInvested,
          earnedInterest: Number(withdrawal.earnedInterest),
          withdrawnProfits: Number(withdrawal.withdrawnProfits || 0),
          totalAmount: Number(withdrawal.totalAmount),
          trc20Address: withdrawal.trc20Address,
          language: withdrawal.investment.language || 'en'
        }
      })

    } catch (error: any) {
      console.error('Error in getEarlyWithdrawalForBot:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch early withdrawal'
      })
    }
  }

  /**
   * ✅ Подтверждение досрочного вывода
   */
  static async approveEarlyWithdrawal(
    request: FastifyRequest<{ Params: InvestmentIdParams; Body: ApproveEarlyWithdrawalBody }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const { supportUserId } = request.body
  
      console.log('Support approving early withdrawal:', id, 'by:', supportUserId)
  
      const supportTelegramId = process.env.SUPPORT_TELEGRAM_ID
      if (supportUserId !== supportTelegramId) {
        return reply.code(403).send({
          success: false,
          error: 'Only support can approve early withdrawals'
        })
      }
  
      const withdrawal = await prisma.earlyWithdrawal.findUnique({
        where: { id }
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
  
      const updatedWithdrawal = await prisma.earlyWithdrawal.update({
        where: { id },
        data: {
          status: 'APPROVED',
          processedDate: new Date()
        }
      })
  
      await prisma.investment.update({
        where: { id: withdrawal.investmentId },
        data: {
          status: 'EARLY_WITHDRAWN',
          completedAt: new Date()
        }
      })
  
      await prisma.auditLog.create({
        data: {
          userId: withdrawal.userId,
          action: 'APPROVE_EARLY_WITHDRAWAL',
          resource: 'EARLY_WITHDRAWAL',
          details: `Early withdrawal ${id} approved by support ${supportUserId} via Telegram`,
          ipAddress: request.ip,
          userAgent: 'TelegramBot',
          success: true
        }
      })
  
      console.log('Early withdrawal approved successfully:', id)
  
      return reply.code(200).send({
        success: true,
        message: 'Early withdrawal approved successfully',
        data: {
          withdrawalId: updatedWithdrawal.id,
          status: updatedWithdrawal.status,
          processedDate: updatedWithdrawal.processedDate
        }
      })
  
    } catch (error: any) {
      console.error('Error in approveEarlyWithdrawal:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to approve early withdrawal'
      })
    }
  }

  /**
   * ✅ Отклонение досрочного вывода
   */
  static async rejectEarlyWithdrawal(
    request: FastifyRequest<{ Params: InvestmentIdParams; Body: RejectEarlyWithdrawalBody }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const { supportUserId, reason } = request.body

      console.log('Support rejecting early withdrawal:', id, 'by:', supportUserId)

      const supportTelegramId = process.env.SUPPORT_TELEGRAM_ID
      if (supportUserId !== supportTelegramId) {
        return reply.code(403).send({
          success: false,
          error: 'Only support can reject early withdrawals'
        })
      }

      const withdrawal = await prisma.earlyWithdrawal.findUnique({
        where: { id }
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

      const updatedWithdrawal = await prisma.earlyWithdrawal.update({
        where: { id },
        data: {
          status: 'REJECTED',
          processedDate: new Date()
        }
      })

      await prisma.auditLog.create({
        data: {
          userId: withdrawal.userId,
          action: 'REJECT_EARLY_WITHDRAWAL',
          resource: 'EARLY_WITHDRAWAL',
          details: `Early withdrawal ${id} rejected by support ${supportUserId}. Reason: ${reason || 'No reason'}`,
          ipAddress: request.ip,
          userAgent: 'TelegramBot',
          success: true
        }
      })

      console.log('Early withdrawal rejected successfully:', id)

      return reply.code(200).send({
        success: true,
        message: 'Early withdrawal rejected successfully',
        data: {
          withdrawalId: updatedWithdrawal.id,
          status: updatedWithdrawal.status,
          processedDate: updatedWithdrawal.processedDate
        }
      })

    } catch (error: any) {
      console.error('Error in rejectEarlyWithdrawal:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to reject early withdrawal'
      })
    }
  }
}