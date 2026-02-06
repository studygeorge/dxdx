import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class ReferralService {
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
        const level1Commission = Number(investment.amount) * 0.07
        
        await prisma.referralEarning.create({
          data: {
            referrerId: level1Referrer.id,
            userId: user.id,
            investmentId: investment.id,
            level: 1,
            percentage: 7.00,
            amount: level1Commission,
            status: 'PENDING'
          }
        })
        
        console.log(`Level 1 commission: $${level1Commission.toFixed(2)} for referrer ${level1Referrer.email}`)

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
                status: 'PENDING'
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