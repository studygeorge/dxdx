import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class ReferralService {
  // Tiered commission based on referral order
  static calculateTierPercent(referralOrder: number): number {
    if (referralOrder === 1) return 0.03       // 1st referral: 3%
    if (referralOrder <= 3) return 0.04        // 2nd-3rd: 4%
    if (referralOrder <= 5) return 0.05        // 4th-5th: 5%
    if (referralOrder <= 9) return 0.06        // 6th-9th: 6%
    return 0.07                                 // 10th+: 7%
  }

  static async processReferralCommissions(investment: any): Promise<void> {
    try {
      console.log('Processing referral commissions for investment:', investment.id)

      const user = investment.user
      
      if (!user.referredBy) {
        console.log('User has no referrer, skipping commissions')
        return
      }

      const level1Referrer = user.referrer
      if (level1Referrer) {
        // ✅ Определяем порядковый номер этого реферала
        const referralOrder = await prisma.user.count({
          where: {
            referredBy: level1Referrer.id,
            createdAt: { lte: user.createdAt }  // Рефералы созданные до или одновременно с текущим
          }
        })

        const tierPercent = this.calculateTierPercent(referralOrder)
        const level1Commission = Number(investment.amount) * tierPercent
        
        console.log(`Level 1: Referral #${referralOrder} → ${(tierPercent * 100).toFixed(0)}% commission = $${level1Commission.toFixed(2)}`)
        
        await prisma.referralEarning.create({
          data: {
            referrerId: level1Referrer.id,
            userId: user.id,
            investmentId: investment.id,
            level: 1,
            percentage: tierPercent * 100,  // Сохраняем как 3, 4, 5, 6, 7
            amount: level1Commission,
            status: 'COMPLETED'
          }
        })
        
        console.log(`Level 1 commission: $${level1Commission.toFixed(2)} (${(tierPercent * 100).toFixed(0)}%) for referrer ${level1Referrer.email}`)

        if (level1Referrer.referredBy) {
          const level2Referrer = await prisma.user.findUnique({
            where: { id: level1Referrer.referredBy }
          })

          if (level2Referrer) {
            const level2Commission = Number(investment.amount) * 0.03
            
            await prisma.referralEarning.create({
              data: {
                referrerId: level2Referrer.id,
                userId: user.id,
                investmentId: investment.id,
                level: 2,
                percentage: 3.00,
                amount: level2Commission,
                status: 'COMPLETED'
              }
            })
            
            console.log(`Level 2 commission: $${level2Commission.toFixed(2)} for referrer ${level2Referrer.email}`)
          }
        }
      }

    } catch (error) {
      console.error('Error processing referral commissions:', error)
    }
  }
}