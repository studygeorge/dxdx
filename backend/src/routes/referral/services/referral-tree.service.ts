import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class ReferralTreeService {
  static async getLevel1Referrals(userId: string) {
    return prisma.user.findMany({
      where: { referredBy: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        investments: {
          where: {
            status: { in: ['ACTIVE', 'COMPLETED'] }
          },
          select: {
            id: true,
            amount: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  }

  static async getLevel2Referrals(level1Ids: string[]) {
    return prisma.user.findMany({
      where: { referredBy: { in: level1Ids } },
      select: {
        id: true,
        email: true,
        createdAt: true,
        investments: {
          where: {
            status: { in: ['ACTIVE', 'COMPLETED'] }
          },
          select: {
            id: true,
            amount: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  }

  static async getReferralLevel(userId: string, referralUserId: string): Promise<number | null> {
    const isLevel1 = await prisma.user.findFirst({
      where: {
        id: referralUserId,
        referredBy: userId
      }
    })

    if (isLevel1) return 1

    const level1Parent = await prisma.user.findFirst({
      where: { id: referralUserId },
      select: { referredBy: true }
    })

    if (level1Parent?.referredBy === userId) return 2

    return null
  }
}
