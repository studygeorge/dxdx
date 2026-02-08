import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { WithdrawBonusBody, BulkWithdrawBody, WithdrawalStatusParams, ApproveRejectBody } from '../types/referral.types'
import { CommissionService } from '../services/commission.service'
import { ReferralTreeService } from '../services/referral-tree.service'
import { WithdrawalService } from '../services/withdrawal.service'
import { ValidationUtils } from '../utils/validation.utils'

const prisma = new PrismaClient()

export async function withdrawBonusHandler(
  request: FastifyRequest<{ Body: WithdrawBonusBody }>,
  reply: FastifyReply
) {
  try {
    console.log('🎯 POST /withdraw-bonus called')
    console.log('📦 Request body:', JSON.stringify(request.body, null, 2))

    const userId = request.currentUser!.id
    const { referralUserId, investmentId, trc20Address } = request.body

    if (!referralUserId || !investmentId || !trc20Address) {
      return reply.code(400).send({
        success: false,
        error: 'Referral user ID, investment ID and TRC-20 address are required'
      })
    }

    ValidationUtils.validateTRC20AddressWithError(trc20Address)

    const level = await ReferralTreeService.getReferralLevel(userId, referralUserId)

    if (!level) {
      return reply.code(404).send({
        success: false,
        error: 'Referral not found in your referral tree'
      })
    }

    const investment = await prisma.investment.findFirst({
      where: {
        id: investmentId,
        userId: referralUserId,
        status: { in: ['ACTIVE', 'COMPLETED'] }
      }
    })

    if (!investment) {
      return reply.code(404).send({
        success: false,
        error: 'Investment not found'
      })
    }

    console.log(`📊 Investment found: id=${investment.id}, amount=$${Number(investment.amount).toFixed(2)}`)

    // ✅ Проверяем что инвестиция ещё активна (не выведена)
    if (investment.status !== 'ACTIVE') {
      return reply.code(400).send({
        success: false,
        error: 'Investment is not active anymore',
        investmentStatus: investment.status
      })
    }

    const daysRemaining = ValidationUtils.getDaysRemaining(investment.createdAt, 31)

    if (daysRemaining > 0) {
      return reply.code(400).send({
        success: false,
        error: `Bonus withdrawal available in ${daysRemaining} days`,
        daysRemaining
      })
    }

    let commissionPercent: number

    if (level === 1) {
      const allLevel1Referrals = await ReferralTreeService.getLevel1Referrals(userId)
      const level1Count = allLevel1Referrals.length
      commissionPercent = CommissionService.calculateTierPercent(level1Count)
      console.log(`💰 Level 1 withdrawal: ${level1Count} referrals → ${(commissionPercent * 100).toFixed(0)}%`)
    } else {
      commissionPercent = 0.03
      console.log(`💰 Level 2 withdrawal: 3%`)
    }

    const commissionAmount = CommissionService.calculateCommission(Number(investment.amount), commissionPercent)

    console.log(`💵 CALCULATED COMMISSION: $${commissionAmount.toFixed(2)} = ${(commissionPercent * 100).toFixed(0)}% × $${Number(investment.amount).toFixed(2)}`)

    // ✅ Find existing earning (no force updates!)
    const referralEarning = await prisma.referralEarning.findFirst({
      where: {
        referrerId: userId,
        userId: referralUserId,
        investmentId,
        status: 'COMPLETED'  // Only completed earnings can be withdrawn
      }
    })

    if (!referralEarning) {
      return reply.code(404).send({
        success: false,
        error: 'Referral earning not found'
      })
    }

    console.log(`💾 ReferralEarning in DB: id=${referralEarning.id}, amount=$${Number(referralEarning.amount).toFixed(2)}`)

    // ✅ Если бонус уже выведен - возвращаем success с информацией о выводе
    if (referralEarning.withdrawn) {
      const existingRequest = await prisma.referralWithdrawalRequest.findFirst({
        where: {
          userId,
          referralUserId,
          investmentId,
          status: { in: ['COMPLETED'] }
        }
      })

      return reply.send({
        success: true,
        message: 'Bonus already withdrawn',
        data: {
          withdrawalId: existingRequest?.id || null,
          amount: parseFloat(Number(referralEarning.amount).toFixed(2)),
          status: 'COMPLETED',
          withdrawnAt: referralEarning.withdrawnAt,
          alreadyWithdrawn: true  // ✅ Флаг для фронтенда
        }
      })
    }

    // ✅ CRITICAL: Use transaction for atomic operations
    const withdrawalRequest = await prisma.$transaction(async (tx) => {
      // Update earning as withdrawn
      await tx.referralEarning.update({
        where: { id: referralEarning.id },
        data: {
          withdrawn: true,
          withdrawnAt: new Date(),
          status: 'COMPLETED'
        }
      })

      // Create withdrawal request
      const withdrawal = await tx.referralWithdrawalRequest.create({
        data: {
          userId,
          referralUserId,
          investmentId,
          referralEarningId: referralEarning.id,
          amount: Number(referralEarning.amount),  // ✅ Use existing amount, no recalculation
          trc20Address: trc20Address.trim(),
          status: 'COMPLETED'  // ✅ Withdrawal completed, admin notified
        }
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'REFERRAL_BONUS_WITHDRAWAL_REQUESTED',
          resource: 'REFERRAL',
          details: JSON.stringify({
            withdrawalRequestId: withdrawal.id,
            referralUserId,
            investmentId,
            amount: withdrawal.amount.toString(),
            commissionRate: `${Math.round(commissionPercent * 100)}%`,
            level,
            trc20Address
          }),
          ipAddress: request.ip,
          success: true
        }
      })

      return withdrawal
    })

    console.log(`✅ Withdrawal request created: id=${withdrawalRequest.id}, amount=$${Number(withdrawalRequest.amount).toFixed(2)}`)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    })

    const commissionRate = Math.round(commissionPercent * 100)
    const finalAmount = Number(withdrawalRequest.amount)

    console.log(`📤 SENDING TO TELEGRAM: amount=$${finalAmount.toFixed(2)}`)

    try {
      const { notifyReferralBonusWithdrawal } = await import('../../../bot/telegram-bot')
      
      await notifyReferralBonusWithdrawal(
        withdrawalRequest.id,
        userId,
        user?.email || 'Unknown',
        finalAmount,
        trc20Address,
        level
      )
      
      console.log('✅ Telegram notification sent successfully')
    } catch (telegramError: any) {
      console.error('❌ Failed to send Telegram notification:', telegramError)
      // Don't fail the request if notification fails
    }

    return reply.send({
      success: true,
      message: 'Referral bonus withdrawal completed successfully',
      data: {
        withdrawalId: withdrawalRequest.id,
        amount: parseFloat(finalAmount.toFixed(2)),
        commissionRate: `${commissionRate}%`,
        level,
        status: 'COMPLETED'  // ✅ Вывод завершён
      }
    })

  } catch (error: any) {
    console.error('❌ Error withdrawing referral bonus:', error)
    return reply.code(500).send({
      success: false,
      error: 'Failed to withdraw referral bonus'
    })
  }
}

export async function bulkWithdrawHandler(
  request: FastifyRequest<{ Body: BulkWithdrawBody }>,
  reply: FastifyReply
) {
  try {
    const userId = request.currentUser!.id
    const { trc20Address } = request.body

    console.log('💰 Bulk withdrawal request:', { userId, trc20Address })

    if (!trc20Address || !trc20Address.trim()) {
      return reply.code(400).send({
        success: false,
        error: 'TRC-20 address is required'
      })
    }

    ValidationUtils.validateTRC20AddressWithError(trc20Address)

    // ✅ Find all non-withdrawn earnings (no force updates!)
    const earnings = await prisma.referralEarning.findMany({
      where: {
        referrerId: userId,
        withdrawn: false,
        status: 'COMPLETED'  // Only completed earnings can be withdrawn
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
    
    // ✅ Filter by 31-day rule and ACTIVE investment status
    const availableEarnings = earnings.filter(earning => {
      if (!earning.investment?.createdAt) return false
      // ✅ Check investment is still active (not withdrawn early)
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

    const totalAmount = availableEarnings.reduce((sum, e) => sum + Number(e.amount), 0)

    // ✅ CRITICAL: Use transaction for atomic operations
    const withdrawalRequests = await prisma.$transaction(async (tx) => {
      // Update all earnings as withdrawn
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

      // Create one withdrawal_request per earning
      const withdrawals = await Promise.all(
        availableEarnings.map(earning => 
          tx.referralWithdrawalRequest.create({
            data: {
              userId,
              referralUserId: earning.userId,
              investmentId: earning.investmentId,
              referralEarningId: earning.id,
              amount: Number(earning.amount),  // ✅ Use existing amount, no recalculation
              trc20Address: trc20Address.trim(),
              status: 'COMPLETED'  // ✅ Withdrawal completed, admin notified
            }
          })
        )
      )

      // Create audit log
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

    console.log(`💵 Bulk withdrawal completed: $${totalAmount.toFixed(2)}, ${withdrawalRequests.length} bonuses`)

    // ✅ Send Telegram notification AFTER successful transaction
    try {
      const { notifyBulkReferralWithdrawal } = await import('../../../bot/telegram-bot')
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      })

      console.log(`📤 Sending bulk Telegram notification: $${totalAmount.toFixed(2)}`)

      await notifyBulkReferralWithdrawal(
        userId,
        user?.email || 'Unknown',
        totalAmount,
        trc20Address,
        withdrawalRequests.length
      )

      console.log('✅ Telegram notification sent successfully')
    } catch (telegramError: any) {
      console.error('❌ Failed to send Telegram notification:', telegramError)
      // Don't fail the request if notification fails
    }

    return reply.send({
      success: true,
      message: `Bulk withdrawal completed for ${withdrawalRequests.length} referral bonuses`,
      data: {
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        count: withdrawalRequests.length,
        withdrawalIds: withdrawalRequests.map(w => w.id),
        status: 'COMPLETED'
      }
    })

  } catch (error: any) {
    console.error('❌ Error processing bulk withdrawal:', error)
    return reply.code(500).send({
      success: false,
      error: 'Failed to process bulk withdrawal'
    })
  }
}

export async function getWithdrawalStatusHandler(
  request: FastifyRequest<{ Params: WithdrawalStatusParams }>,
  reply: FastifyReply
) {
  try {
    const userId = request.currentUser!.id
    const { withdrawalId } = request.params

    const withdrawal = await prisma.referralWithdrawalRequest.findUnique({
      where: { id: withdrawalId },
      select: {
        id: true,
        status: true,
        amount: true,
        trc20Address: true,
        createdAt: true,
        userId: true
      }
    })

    if (!withdrawal) {
      return reply.code(404).send({
        success: false,
        error: 'Withdrawal request not found'
      })
    }

    if (withdrawal.userId !== userId) {
      return reply.code(403).send({
        success: false,
        error: 'Access denied'
      })
    }

    return reply.send({
      success: true,
      data: withdrawal
    })

  } catch (error: any) {
    console.error('❌ Error checking withdrawal status:', error)
    return reply.code(500).send({
      success: false,
      error: 'Failed to check withdrawal status'
    })
  }
}

export async function approveWithdrawalHandler(
  request: FastifyRequest<{ Params: WithdrawalStatusParams; Body: ApproveRejectBody }>,
  reply: FastifyReply
) {
  try {
    const { withdrawalId } = request.params
    const { supportUserId } = request.body

    const withdrawal = await prisma.referralWithdrawalRequest.findUnique({
      where: { id: withdrawalId }
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
        error: `Withdrawal request already ${withdrawal.status.toLowerCase()}`
      })
    }

    await prisma.referralWithdrawalRequest.update({
      where: { id: withdrawalId },
      data: {
        status: 'APPROVED',
        processedAt: new Date()
      }
    })

    if (withdrawal.referralEarningId) {
      await prisma.referralEarning.update({
        where: { id: withdrawal.referralEarningId },
        data: {
          withdrawn: true,
          withdrawnAt: new Date(),
          status: 'COMPLETED'
        }
      })
    }

    await prisma.auditLog.create({
      data: {
        userId: withdrawal.userId,
        action: 'REFERRAL_BONUS_WITHDRAWAL_APPROVED',
        resource: 'REFERRAL',
        details: JSON.stringify({
          withdrawalId,
          amount: withdrawal.amount.toString(),
          approvedBy: supportUserId || 'TELEGRAM_ADMIN'
        }),
        ipAddress: request.ip,
        success: true
      }
    })

    console.log('✅ Withdrawal approved:', withdrawalId)

    return reply.send({
      success: true,
      message: 'Withdrawal approved successfully',
      data: {
        withdrawalId,
        status: 'APPROVED'
      }
    })

  } catch (error: any) {
    console.error('❌ Error approving withdrawal:', error)
    return reply.code(500).send({
      success: false,
      error: 'Failed to approve withdrawal'
    })
  }
}

export async function rejectWithdrawalHandler(
  request: FastifyRequest<{ Params: WithdrawalStatusParams; Body: ApproveRejectBody }>,
  reply: FastifyReply
) {
  try {
    const { withdrawalId } = request.params
    const { supportUserId, reason } = request.body

    const withdrawal = await prisma.referralWithdrawalRequest.findUnique({
      where: { id: withdrawalId }
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
        error: `Withdrawal request already ${withdrawal.status.toLowerCase()}`
      })
    }

    await prisma.referralWithdrawalRequest.update({
      where: { id: withdrawalId },
      data: {
        status: 'REJECTED',
        processedAt: new Date(),
        rejectionReason: reason || 'Rejected by admin'
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: withdrawal.userId,
        action: 'REFERRAL_BONUS_WITHDRAWAL_REJECTED',
        resource: 'REFERRAL',
        details: JSON.stringify({
          withdrawalId,
          amount: withdrawal.amount.toString(),
          rejectedBy: supportUserId || 'TELEGRAM_ADMIN',
          reason: reason || 'Rejected by admin'
        }),
        ipAddress: request.ip,
        success: true
      }
    })

    console.log('❌ Withdrawal rejected:', withdrawalId)

    return reply.send({
      success: true,
      message: 'Withdrawal rejected',
      data: {
        withdrawalId,
        status: 'REJECTED'
      }
    })

  } catch (error: any) {
    console.error('❌ Error rejecting withdrawal:', error)
    return reply.code(500).send({
      success: false,
      error: 'Failed to reject withdrawal'
    })
  }
}
