import { FastifyRequest, FastifyReply } from 'fastify'
import { REQUIRED_DAYS } from '../types/referral.types'
import { CommissionService } from '../services/commission.service'
import { ReferralTreeService } from '../services/referral-tree.service'
import { ValidationUtils } from '../utils/validation.utils'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getAvailableActionsHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.currentUser!.id

    const level1Referrals = await ReferralTreeService.getLevel1Referrals(userId)
    const level1Count = level1Referrals.length
    const tierPercent = CommissionService.calculateTierPercent(level1Count)

    const level1Ids = level1Referrals.map(r => r.id)
    const level2Referrals = await ReferralTreeService.getLevel2Referrals(level1Ids)

    let availableAmount = 0
    let lockedAmount = 0
    const availableItems: any[] = []

    for (const ref of level1Referrals) {
      for (const investment of ref.investments) {
        const commission = CommissionService.calculateCommission(Number(investment.amount), tierPercent)
        const daysPassed = ValidationUtils.calculateDaysPassed(investment.createdAt)

        const earning = await prisma.referralEarning.findFirst({
          where: {
            referrerId: userId,
            userId: ref.id,
            investmentId: investment.id
          }
        })

        if (earning?.withdrawn) continue

        if (daysPassed >= REQUIRED_DAYS) {
          availableAmount += commission
          availableItems.push({
            referralUserId: ref.id,
            investmentId: investment.id,
            amount: commission,
            level: 1
          })
        } else {
          lockedAmount += commission
        }
      }
    }

    for (const ref of level2Referrals) {
      for (const investment of ref.investments) {
        const commission = CommissionService.calculateCommission(Number(investment.amount), 0.03)
        const daysPassed = ValidationUtils.calculateDaysPassed(investment.createdAt)

        const earning = await prisma.referralEarning.findFirst({
          where: {
            referrerId: userId,
            userId: ref.id,
            investmentId: investment.id
          }
        })

        if (earning?.withdrawn) continue

        if (daysPassed >= REQUIRED_DAYS) {
          availableAmount += commission
          availableItems.push({
            referralUserId: ref.id,
            investmentId: investment.id,
            amount: commission,
            level: 2
          })
        } else {
          lockedAmount += commission
        }
      }
    }

    return reply.send({
      success: true,
      data: {
        availableAmount: parseFloat(availableAmount.toFixed(2)),
        lockedAmount: parseFloat(lockedAmount.toFixed(2)),
        availableCount: availableItems.length,
        items: availableItems
      }
    })

  } catch (error: any) {
    console.error('❌ Error fetching available actions:', error)
    return reply.code(500).send({
      success: false,
      error: 'Failed to fetch available actions'
    })
  }
}
