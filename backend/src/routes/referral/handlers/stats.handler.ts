import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { CommissionService } from '../services/commission.service'
import { ReferralTreeService } from '../services/referral-tree.service'

const prisma = new PrismaClient()

export async function getStatsHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.currentUser!.id

    const level1Referrals = await ReferralTreeService.getLevel1Referrals(userId)
    const level1Count = level1Referrals.length
    const tierPercent = CommissionService.calculateTierPercent(level1Count)

    let totalLevel1Earned = 0
    for (const ref of level1Referrals) {
      const totalInvested = ref.investments.reduce((sum, inv) => sum + Number(inv.amount), 0)
      totalLevel1Earned += CommissionService.calculateCommission(totalInvested, tierPercent)
    }

    const level1Ids = level1Referrals.map(r => r.id)
    const level2Referrals = await ReferralTreeService.getLevel2Referrals(level1Ids)
    const level2Count = level2Referrals.length

    let totalLevel2Earned = 0
    for (const ref of level2Referrals) {
      const totalInvested = ref.investments.reduce((sum, inv) => sum + Number(inv.amount), 0)
      totalLevel2Earned += CommissionService.calculateCommission(totalInvested, 0.03)
    }

    const totalEarned = totalLevel1Earned + totalLevel2Earned

    const earnings = await prisma.referralEarning.findMany({
      where: { referrerId: userId }
    })

    const totalWithdrawn = earnings
      .filter(e => e.withdrawn)
      .reduce((sum, earning) => sum + Number(earning.amount), 0)

    const availableToWithdraw = totalEarned - totalWithdrawn

    return reply.send({
      success: true,
      data: {
        totalEarned: parseFloat(totalEarned.toFixed(2)),
        totalWithdrawn: parseFloat(totalWithdrawn.toFixed(2)),
        availableToWithdraw: parseFloat(availableToWithdraw.toFixed(2)),
        totalReferrals: level1Count + level2Count,
        level1Referrals: level1Count,
        level2Referrals: level2Count,
        tierPercent,
        currentTier: `${(tierPercent * 100).toFixed(0)}%`,
        totalEarnings: earnings.length,
        withdrawnEarnings: earnings.filter(e => e.withdrawn).length
      }
    })

  } catch (error: any) {
    console.error('❌ Error fetching referral stats:', error)
    return reply.code(500).send({
      success: false,
      error: 'Failed to fetch referral stats'
    })
  }
}
