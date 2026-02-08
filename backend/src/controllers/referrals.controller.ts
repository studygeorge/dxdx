import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { notifyBulkReferralWithdrawal } from '../bot/telegram-bot'

const prisma = new PrismaClient()

// Функция расчёта tiered-комиссии для первого уровня
function calculateTierPercent(level1Count: number): number {
  if (level1Count >= 10) return 0.07
  if (level1Count >= 6) return 0.06
  if (level1Count >= 4) return 0.05
  if (level1Count >= 2) return 0.04
  return 0.03
}

export class ReferralsController {
  // ✅ GET /my-referrals - С ПРАВИЛЬНОЙ TIERED-КОМИССИЕЙ ПО ПОРЯДКОВОМУ НОМЕРУ
  static async getMyReferrals(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.currentUser!.id

      console.log('📊 Fetching referrals for user:', userId)

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          referralCode: true,
          email: true
        }
      })

      if (!user) {
        return reply.code(404).send({
          success: false,
          error: 'User not found'
        })
      }

      // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Сортируем рефералов по дате регистрации
      const level1Referrals = await prisma.user.findMany({
        where: {
          referredBy: userId
        },
        include: {
          investments: {
            where: {
              status: { in: ['ACTIVE', 'COMPLETED'] }
            },
            orderBy: { createdAt: 'desc' }
          },
          referralEarnings: {
            where: {
              referrerId: userId,
              level: 1
            }
          }
        },
        orderBy: {
          createdAt: 'asc'  // ✅ Сортируем по дате регистрации (первый = реферал #1)
        }
      })

      const level1Count = level1Referrals.length

      console.log(`📊 Level 1 referrals: ${level1Count}`)

      // Получить всех рефералов 2-го уровня
      const level1UserIds = level1Referrals.map(r => r.id)
      const level2Referrals = level1UserIds.length > 0
        ? await prisma.user.findMany({
            where: {
              referredBy: { in: level1UserIds }
            },
            include: {
              investments: {
                where: {
                  status: { in: ['ACTIVE', 'COMPLETED'] }
                },
                orderBy: { createdAt: 'desc' }
              },
              referralEarnings: {
                where: {
                  referrerId: userId,
                  level: 2
                }
              }
            }
          })
        : []

      let totalEarningsLevel1 = 0
      let totalEarningsLevel2 = 0

      // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Применяем процент ПО ПОРЯДКОВОМУ НОМЕРУ
      const level1Data = level1Referrals.flatMap((ref, referralIndex) => {
        const referralNumber = referralIndex + 1  // ← Порядковый номер: 1, 2, 3, 4...
        const individualPercent = calculateTierPercent(referralNumber)  // ← Индивидуальный процент

        console.log(`👤 Referral #${referralNumber}: ${ref.email} → ${(individualPercent * 100).toFixed(0)}%`)

        return ref.investments.map(investment => {
          const commission = Number(investment.amount) * individualPercent  // ← Правильный расчет
          totalEarningsLevel1 += commission

          const earning = ref.referralEarnings.find(e => e.investmentId === investment.id)

          return {
            fullUserId: ref.id,
            userIdShort: ref.id.substring(0, 8),
            email: ref.email,
            investmentId: investment.id,
            investmentAmount: Number(investment.amount),
            investmentDate: investment.createdAt,
            commission: parseFloat(commission.toFixed(2)),
            joinedAt: ref.createdAt,
            bonusWithdrawn: earning?.withdrawn || false,
            withdrawnAt: earning?.withdrawnAt || null,
            referralNumber: referralNumber,  // ✅ Добавляем номер для фронта
            individualPercent: individualPercent  // ✅ Добавляем процент для фронта
          }
        })
      })

      // Форматировать данные рефералов 2-го уровня (фиксированный 3%)
      const level2Data = level2Referrals.flatMap(ref => {
        return ref.investments.map(investment => {
          const commission = Number(investment.amount) * 0.03
          totalEarningsLevel2 += commission

          const earning = ref.referralEarnings.find(e => e.investmentId === investment.id)

          return {
            fullUserId: ref.id,
            userIdShort: ref.id.substring(0, 8),
            email: ref.email,
            investmentId: investment.id,
            investmentAmount: Number(investment.amount),
            investmentDate: investment.createdAt,
            commission: parseFloat(commission.toFixed(2)),
            joinedAt: ref.createdAt,
            bonusWithdrawn: earning?.withdrawn || false,
            withdrawnAt: earning?.withdrawnAt || null
          }
        })
      })

      const totalEarnings = totalEarningsLevel1 + totalEarningsLevel2

      // Текущий tier процент (для НОВОГО реферала)
      const currentTierPercent = calculateTierPercent(level1Count)

      console.log('✅ Referral data fetched:', {
        level1Count,
        level2Count: level2Referrals.length,
        level1Investments: level1Data.length,
        level2Investments: level2Data.length,
        totalEarnings: totalEarnings.toFixed(2)
      })

      return reply.send({
        success: true,
        data: {
          referralCode: user.referralCode,
          totalReferrals: level1Count + level2Referrals.length,
          totalEarnings: parseFloat(totalEarnings.toFixed(2)),
          level1: level1Data,
          level2: level2Data,
          tierPercent: currentTierPercent,  // ✅ Процент для НОВОГО реферала
          level1Count
        }
      })

    } catch (error: any) {
      console.error('❌ Error fetching referrals:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch referral data'
      })
    }
  }

  // ✅ POST /withdraw-bonus - С TIERED-ЛОГИКОЙ
  static async withdrawReferralBonus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.currentUser!.id
      const { referralId, amount } = request.body as { referralId: string; amount: number }

      console.log('💰 Referral bonus withdrawal request:', { userId, referralId, amount })

      // Найти реферальный доход
      const earning = await prisma.referralEarning.findFirst({
        where: {
          referrerId: userId,
          userId: referralId,
          withdrawn: false
        },
        include: {
          investment: true,
          user: true
        }
      })

      if (!earning) {
        return reply.code(404).send({
          success: false,
          error: 'Referral earning not found or already withdrawn'
        })
      }

      // Проверка: прошло ли 31 день с момента инвестиции реферала
      if (!earning.investment || !earning.investment.createdAt) {
        return reply.code(400).send({
          success: false,
          error: 'Investment date not available'
        })
      }

      const investmentDate = new Date(earning.investment.createdAt)
      const now = new Date()
      const daysPassed = Math.floor((now.getTime() - investmentDate.getTime()) / (1000 * 60 * 60 * 24))

      console.log('📅 Withdrawal check:', {
        investmentDate: investmentDate.toISOString(),
        daysPassed,
        required: 31
      })

      if (daysPassed < 31) {
        return reply.code(400).send({
          success: false,
          error: `Bonus available in ${31 - daysPassed} days`,
          daysRemaining: 31 - daysPassed
        })
      }

      // Проверка суммы
      if (Number(earning.amount) !== amount) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid withdrawal amount'
        })
      }

      // Обновить статус бонуса
      await prisma.referralEarning.update({
        where: { id: earning.id },
        data: {
          withdrawn: true,
          withdrawnAt: now,
          status: 'COMPLETED'
        }
      })

      // Создать запись в истории аудита
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'REFERRAL_BONUS_WITHDRAWN',
          resource: 'REFERRAL',
          details: JSON.stringify({
            earningId: earning.id,
            amount: earning.amount.toString(),
            level: earning.level,
            referredUserId: earning.userId,
            referredUserEmail: earning.user.email
          }),
          ipAddress: request.ip,
          success: true
        }
      })

      console.log('✅ Referral bonus withdrawn:', {
        earningId: earning.id,
        amount: Number(earning.amount),
        referrer: userId,
        referredUser: earning.userId
      })

      return reply.send({
        success: true,
        message: 'Referral bonus withdrawn successfully',
        data: {
          amount: Number(earning.amount),
          level: earning.level,
          withdrawnAt: now
        }
      })

    } catch (error: any) {
      console.error('❌ Error withdrawing referral bonus:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to withdraw referral bonus'
      })
    }
  }

  // ✅ POST /bulk-withdraw - Массовый вывод всех доступных бонусов
  static async bulkWithdraw(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.currentUser!.id
      const { trc20Address } = request.body as { trc20Address: string }

      console.log('💰 Bulk withdrawal request:', { userId, trc20Address })

      if (!trc20Address || !trc20Address.trim()) {
        return reply.code(400).send({
          success: false,
          error: 'TRC-20 address is required'
        })
      }

      // Найти все доступные бонусы (не выведенные + прошло 31 день)
      const earnings = await prisma.referralEarning.findMany({
        where: {
          referrerId: userId,
          withdrawn: false
        },
        include: {
          investment: true,
          user: true
        }
      })

      if (earnings.length === 0) {
        return reply.code(400).send({
          success: false,
          error: 'No available bonuses to withdraw'
        })
      }

      const now = new Date()
      const availableEarnings = earnings.filter(earning => {
        if (!earning.investment?.createdAt) return false
        const investmentDate = new Date(earning.investment.createdAt)
        const daysPassed = Math.floor((now.getTime() - investmentDate.getTime()) / (1000 * 60 * 60 * 24))
        return daysPassed >= 31
      })

      if (availableEarnings.length === 0) {
        return reply.code(400).send({
          success: false,
          error: 'No bonuses available yet (31 days required)'
        })
      }

      const totalAmount = availableEarnings.reduce((sum, e) => sum + Number(e.amount), 0)

      // ✅ КРИТИЧНО: Используем транзакцию для атомарности операций
      const withdrawalRequests = await prisma.$transaction(async (tx) => {
        // Обновить все записи
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

        // Создать запросы на вывод для каждого earning
        const withdrawals = await Promise.all(
          availableEarnings.map(earning => 
            tx.referralWithdrawalRequest.create({
              data: {
                userId,
                referralUserId: earning.userId,
                investmentId: earning.investmentId,
                referralEarningId: earning.id,
                amount: Number(earning.amount),
                trc20Address: trc20Address.trim(),
                status: 'APPROVAL'  // ✅ Ждёт выплаты от админа
              }
            })
          )
        )

        // Создать запись в истории аудита
        await tx.auditLog.create({
          data: {
            userId,
            action: 'REFERRAL_BULK_WITHDRAWAL',
            resource: 'REFERRAL',
            details: JSON.stringify({
              withdrawalIds: withdrawals.map(w => w.id),
              totalAmount,
              count: availableEarnings.length,
              trc20Address: trc20Address.trim()
            }),
            ipAddress: request.ip,
            success: true
          }
        })

        return withdrawals
      })

      // ✅ КРИТИЧНО: Отправить Telegram уведомление ПОСЛЕ успешной транзакции
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true }
        })

        await notifyBulkReferralWithdrawal(
          userId,
          user?.email || 'unknown',
          totalAmount,
          trc20Address.trim(),
          availableEarnings.length
        )
      } catch (notificationError: any) {
        // Логируем ошибку, но не фейлим запрос - бонусы уже помечены withdrawn
        console.error('⚠️ Failed to send Telegram notification (withdrawal successful):', notificationError)
      }

      console.log('✅ Bulk withdrawal processed:', {
        userId,
        count: availableEarnings.length,
        totalAmount,
        withdrawalIds: withdrawalRequests.map(w => w.id)
      })

      return reply.send({
        success: true,
        message: 'Bulk withdrawal request submitted',
        data: {
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          count: availableEarnings.length,
          withdrawalIds: withdrawalRequests.map(w => w.id),
          status: 'PENDING'
        }
      })

    } catch (error: any) {
      console.error('❌ Error processing bulk withdrawal:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to process bulk withdrawal'
      })
    }
  }

  // ✅ POST /reinvest - Реинвестирование всех доступных бонусов
  static async reinvest(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.currentUser!.id
      const { amount } = request.body as { amount: number }

      console.log('🔄 Reinvest request:', { userId, amount })

      // Найти все доступные бонусы
      const earnings = await prisma.referralEarning.findMany({
        where: {
          referrerId: userId,
          withdrawn: false
        },
        include: {
          investment: true
        }
      })

      if (earnings.length === 0) {
        return reply.code(400).send({
          success: false,
          error: 'No available bonuses to reinvest'
        })
      }

      const now = new Date()
      const availableEarnings = earnings.filter(earning => {
        if (!earning.investment?.createdAt) return false
        const investmentDate = new Date(earning.investment.createdAt)
        const daysPassed = Math.floor((now.getTime() - investmentDate.getTime()) / (1000 * 60 * 60 * 24))
        return daysPassed >= 31
      })

      if (availableEarnings.length === 0) {
        return reply.code(400).send({
          success: false,
          error: 'No bonuses available yet (31 days required)'
        })
      }

      const totalAmount = availableEarnings.reduce((sum, e) => sum + Number(e.amount), 0)

      if (Math.abs(totalAmount - amount) > 0.01) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid reinvestment amount'
        })
      }

      // Найти подходящий план для реинвестирования
      const plans = await prisma.stakingPlan.findMany({
        orderBy: { minAmount: 'asc' }
      })

      const plan = plans.find(p => 
        Number(p.minAmount) <= totalAmount && 
        (!p.maxAmount || Number(p.maxAmount) >= totalAmount)
      )

      if (!plan) {
        return reply.code(400).send({
          success: false,
          error: 'No suitable plan found for this amount'
        })
      }

      // Создать новую инвестицию
      const expectedReturn = totalAmount * (1 + Number(plan.apy) / 100)
      const newInvestment = await prisma.investment.create({
        data: {
          userId,
          amount: totalAmount,
          planId: plan.id,
          duration: 12, // По умолчанию 12 месяцев
          status: 'ACTIVE',
          paymentMethod: 'REINVESTMENT',
          roi: plan.apy,
          expectedReturn,
          totalReturn: expectedReturn,
          userWalletAddress: 'REINVESTMENT',
          adminWalletAddress: 'REINVESTMENT',
          startDate: now,
          endDate: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
        }
      })

      // Обновить все бонусы
      await prisma.referralEarning.updateMany({
        where: {
          id: { in: availableEarnings.map(e => e.id) }
        },
        data: {
          withdrawn: true,
          withdrawnAt: now,
          status: 'COMPLETED'
        }
      })

      // Создать запись в истории аудита
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'REFERRAL_BONUS_REINVESTED',
          resource: 'INVESTMENT',
          details: JSON.stringify({
            investmentId: newInvestment.id,
            amount: totalAmount,
            planId: plan.id,
            planName: plan.name,
            count: availableEarnings.length
          }),
          ipAddress: request.ip,
          success: true
        }
      })

      console.log('✅ Referral bonuses reinvested:', {
        userId,
        amount: totalAmount,
        investmentId: newInvestment.id,
        count: availableEarnings.length
      })

      return reply.send({
        success: true,
        message: 'Bonuses reinvested successfully',
        data: {
          investment: {
            id: newInvestment.id,
            amount: Number(newInvestment.amount),
            plan: plan.name,
            roi: Number(plan.apy),
            duration: newInvestment.duration,
            startDate: newInvestment.startDate
          },
          bonusesUsed: availableEarnings.length,
          totalAmount: parseFloat(totalAmount.toFixed(2))
        }
      })

    } catch (error: any) {
      console.error('❌ Error processing reinvestment:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to process reinvestment'
      })
    }
  }

  // ✅ GET /stats - С ПРАВИЛЬНОЙ TIERED-КОМИССИЕЙ ПО ПОРЯДКОВОМУ НОМЕРУ
  static async getReferralStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.currentUser!.id

      // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Сортируем рефералов по дате
      const level1Referrals = await prisma.user.findMany({
        where: { referredBy: userId },
        include: {
          investments: {
            where: { status: { in: ['ACTIVE', 'COMPLETED'] } }
          }
        },
        orderBy: {
          createdAt: 'asc'  // ✅ Сортируем по дате регистрации
        }
      })

      const level1Count = level1Referrals.length

      // ✅ Считаем доход Level 1 с правильными процентами
      let totalLevel1Earned = 0
      level1Referrals.forEach((ref, index) => {
        const referralNumber = index + 1
        const individualPercent = calculateTierPercent(referralNumber)
        
        const totalInvested = ref.investments.reduce((sum, inv) => sum + Number(inv.amount), 0)
        totalLevel1Earned += totalInvested * individualPercent
      })

      // Получаем рефералов Level 2
      const level1Ids = level1Referrals.map(r => r.id)
      const level2Referrals = await prisma.user.findMany({
        where: { referredBy: { in: level1Ids } },
        include: {
          investments: {
            where: { status: { in: ['ACTIVE', 'COMPLETED'] } }
          }
        }
      })

      const level2Count = level2Referrals.length

      // Считаем доход Level 2 (фиксированный 3%)
      let totalLevel2Earned = 0
      for (const ref of level2Referrals) {
        const totalInvested = ref.investments.reduce((sum, inv) => sum + Number(inv.amount), 0)
        totalLevel2Earned += totalInvested * 0.03
      }

      const totalEarnings = totalLevel1Earned + totalLevel2Earned

      // Получаем фактические earnings для подсчёта выведенного
      const earnings = await prisma.referralEarning.findMany({
        where: { referrerId: userId }
      })

      const withdrawnEarnings = earnings
        .filter(e => e.withdrawn)
        .reduce((sum, e) => sum + Number(e.amount), 0)

      const pendingEarnings = totalEarnings - withdrawnEarnings

      // Текущий tier процент (для нового реферала)
      const currentTierPercent = calculateTierPercent(level1Count)

      return reply.send({
        success: true,
        data: {
          totalEarnings: parseFloat(totalEarnings.toFixed(2)),
          withdrawnEarnings: parseFloat(withdrawnEarnings.toFixed(2)),
          pendingEarnings: parseFloat(pendingEarnings.toFixed(2)),
          totalReferrals: level1Count + level2Count,
          level1Referrals: level1Count,
          level2Referrals: level2Count,
          tierPercent: currentTierPercent,
          currentTier: `${(currentTierPercent * 100).toFixed(0)}%`
        }
      })

    } catch (error: any) {
      console.error('❌ Error fetching referral stats:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch referral statistics'
      })
    }
  }
}
