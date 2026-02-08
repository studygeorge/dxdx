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

    // ✅ Создаём или обновляем earning с ПРАВИЛЬНОЙ суммой
    const referralEarning = await WithdrawalService.getOrCreateEarning(
      userId,
      referralUserId,
      investmentId,
      commissionAmount,
      commissionPercent,
      level
    )

    console.log(`💾 ReferralEarning in DB: id=${referralEarning.id}, amount=$${Number(referralEarning.amount).toFixed(2)}`)

    if (referralEarning.withdrawn) {
      return reply.code(400).send({
        success: false,
        error: 'Bonus already withdrawn',
        withdrawnAt: referralEarning.withdrawnAt
      })
    }

    const existingRequest = await prisma.referralWithdrawalRequest.findFirst({
      where: {
        userId,
        referralUserId,
        investmentId,
        status: { in: ['PENDING', 'COMPLETED'] }  // ✅ Проверяем и PENDING и COMPLETED
      }
    })

    if (existingRequest) {
      return reply.code(400).send({
        success: false,
        error: 'Withdrawal request already pending',
        data: { withdrawalId: existingRequest.id }
      })
    }

    // ✅ ИСПРАВЛЕНО: 5 параметров (без amount)
    const withdrawalRequest = await WithdrawalService.createWithdrawalRequest(
      userId,
      referralUserId,
      investmentId,
      referralEarning.id,
      trc20Address // ✅ 5-й параметр
    )

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
    }

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'REFERRAL_BONUS_WITHDRAWAL_REQUESTED',
        resource: 'REFERRAL',
        details: JSON.stringify({
          withdrawalRequestId: withdrawalRequest.id,
          referralUserId,
          investmentId,
          amount: withdrawalRequest.amount.toString(),
          commissionRate: `${commissionRate}%`,
          level,
          trc20Address
        }),
        ipAddress: request.ip,
        success: true
      }
    })

    return reply.send({
      success: true,
      message: 'Referral bonus withdrawal request submitted successfully',
      data: {
        withdrawalId: withdrawalRequest.id,
        amount: parseFloat(finalAmount.toFixed(2)),
        commissionRate: `${commissionRate}%`,
        level,
        status: 'PENDING'
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

    ValidationUtils.validateTRC20AddressWithError(trc20Address)

    const availableItems = await WithdrawalService.collectAvailableEarnings(userId)

    if (availableItems.length === 0) {
      return reply.code(400).send({
        success: false,
        error: 'No available referral earnings to withdraw'
      })
    }

    let totalAmount = 0
    const withdrawalIds: string[] = []

    for (const item of availableItems) {
      const earning = await WithdrawalService.getOrCreateEarning(
        userId,
        item.referralUserId,
        item.investmentId,
        item.amount,
        item.percentage,
        item.level
      )

      // ✅ ИСПРАВЛЕНО: 5 параметров (без amount)
      const withdrawal = await WithdrawalService.createWithdrawalRequest(
        userId,
        item.referralUserId,
        item.investmentId,
        earning.id,
        trc20Address // ✅ 5-й параметр
      )

      withdrawalIds.push(withdrawal.id)
      totalAmount += Number(withdrawal.amount)
    }

    console.log(`💵 Bulk withdrawal total: $${totalAmount.toFixed(2)}`)

    try {
      const { notifyBulkReferralWithdrawal } = await import('../../../bot/telegram-bot')
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      })

      console.log(`📤 Sending bulk Telegram notification with total: $${totalAmount.toFixed(2)}`)

      await notifyBulkReferralWithdrawal(
        userId,
        user?.email || 'Unknown',
        totalAmount,
        trc20Address,
        withdrawalIds.length
      )

      console.log('✅ Bulk Telegram notification sent successfully')
    } catch (telegramError: any) {
      console.error('❌ Failed to send Telegram notification:', telegramError)
    }

    return reply.send({
      success: true,
      message: `Bulk withdrawal request submitted for ${withdrawalIds.length} referral earnings`,
      data: {
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        count: withdrawalIds.length,
        withdrawalIds
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
