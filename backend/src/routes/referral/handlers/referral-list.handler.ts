import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { ReferralData } from '../types/referral.types'
import { CommissionService } from '../services/commission.service'
import { ReferralTreeService } from '../services/referral-tree.service'

const prisma = new PrismaClient()

export async function getReferralListHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    console.log('📍 GET /my-referrals called')
    console.log('👤 Current user:', request.currentUser?.id, request.currentUser?.email)

    const userId = request.currentUser!.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true }
    })

    if (!user) {
      return reply.code(404).send({
        success: false,
        error: 'User not found'
      })
    }

    const level1Referrals = await ReferralTreeService.getLevel1Referrals(userId)
    const level1Count = level1Referrals.length
    const tierPercent = CommissionService.calculateTierPercent(level1Count)

    console.log(`📊 Level 1 referrals: ${level1Count}, Tier: ${(tierPercent * 100).toFixed(0)}%`)

    const level1Ids = level1Referrals.map(ref => ref.id)
    const level2Referrals = await ReferralTreeService.getLevel2Referrals(level1Ids)

    const level1Data: ReferralData[] = []
    let totalLevel1Commission = 0

    for (const ref of level1Referrals) {
      for (const investment of ref.investments) {
        const commission = CommissionService.calculateCommission(Number(investment.amount), tierPercent)

        const earning = await prisma.referralEarning.findFirst({
          where: {
            referrerId: userId,
            userId: ref.id,
            investmentId: investment.id
          }
        })

        level1Data.push({
          fullUserId: ref.id,
          userIdShort: ref.id.slice(0, 8),
          email: ref.email,
          joinedAt: ref.createdAt,
          investmentId: investment.id,
          investmentAmount: Number(investment.amount),
          investmentDate: investment.createdAt,
          commission: parseFloat(commission.toFixed(2)),
          bonusWithdrawn: earning?.withdrawn || false,
          withdrawnAt: earning?.withdrawnAt || null
        })

        totalLevel1Commission += commission
      }
    }

    const level2Data: ReferralData[] = []
    let totalLevel2Commission = 0

    for (const ref of level2Referrals) {
      for (const investment of ref.investments) {
        const commission = CommissionService.calculateCommission(Number(investment.amount), 0.03)

        const earning = await prisma.referralEarning.findFirst({
          where: {
            referrerId: userId,
            userId: ref.id,
            investmentId: investment.id
          }
        })

        level2Data.push({
          fullUserId: ref.id,
          userIdShort: ref.id.slice(0, 8),
          email: ref.email,
          joinedAt: ref.createdAt,
          investmentId: investment.id,
          investmentAmount: Number(investment.amount),
          investmentDate: investment.createdAt,
          commission: parseFloat(commission.toFixed(2)),
          bonusWithdrawn: earning?.withdrawn || false,
          withdrawnAt: earning?.withdrawnAt || null
        })

        totalLevel2Commission += commission
      }
    }

    const totalEarnings = totalLevel1Commission + totalLevel2Commission
    const uniqueLevel1 = new Set(level1Referrals.map(r => r.id)).size
    const uniqueLevel2 = new Set(level2Referrals.map(r => r.id)).size

    console.log('✅ Referral data fetched successfully:', {
      totalReferrals: uniqueLevel1 + uniqueLevel2,
      level1Investments: level1Data.length,
      level2Investments: level2Data.length,
      tierPercent: `${(tierPercent * 100).toFixed(0)}%`,
      totalEarnings: totalEarnings.toFixed(2)
    })

    return reply.send({
      success: true,
      data: {
        referralCode: user.referralCode,
        totalReferrals: uniqueLevel1 + uniqueLevel2,
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        level1: level1Data,
        level2: level2Data,
        tierPercent,
        level1Count
      }
    })

  } catch (error: any) {
    console.error('❌ Error fetching referral data:', error)
    return reply.code(500).send({
      success: false,
      error: 'Failed to fetch referral data'
    })
  }
}
