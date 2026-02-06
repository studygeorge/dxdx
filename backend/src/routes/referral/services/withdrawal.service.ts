import { PrismaClient } from '@prisma/client'
import { REQUIRED_DAYS } from '../types/referral.types'
import { CommissionService } from './commission.service'
import { ReferralTreeService } from './referral-tree.service'
import { ValidationUtils } from '../utils/validation.utils'

const prisma = new PrismaClient()

export class WithdrawalService {
  // ✅ ВСЕГДА обновляем earning с правильной суммой (ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ)
  static async getOrCreateEarning(
    referrerId: string,
    userId: string,
    investmentId: string,
    amount: number,
    percentage: number,
    level: number
  ) {
    console.log(`🔍 Getting/creating earning: referrer=${referrerId}, user=${userId}, investment=${investmentId}`)
    console.log(`📊 Calculated values: amount=$${amount.toFixed(2)}, percentage=${(percentage * 100).toFixed(0)}%, level=${level}`)

    let earning = await prisma.referralEarning.findFirst({
      where: {
        referrerId,
        userId,
        investmentId
      }
    })

    if (earning) {
      const oldAmount = Number(earning.amount)
      const oldPercentage = Number(earning.percentage)

      console.log(`📦 Found existing earning: id=${earning.id}, amount=$${oldAmount.toFixed(2)}, percentage=${(oldPercentage * 100).toFixed(0)}%`)

      // ✅ КРИТИЧЕСКОЕ ИЗМЕНЕНИЕ: Убрана условная проверка - ВСЕГДА обновляем
      console.log(`🔄 FORCE UPDATING earning: $${oldAmount.toFixed(2)} → $${amount.toFixed(2)} (${(oldPercentage * 100).toFixed(0)}% → ${(percentage * 100).toFixed(0)}%)`)

      earning = await prisma.referralEarning.update({
        where: { id: earning.id },
        data: {
          amount,
          percentage,
          level
        }
      })

      console.log(`✅ Earning FORCE-UPDATED successfully: amount=$${Number(earning.amount).toFixed(2)}`)
    } else {
      console.log(`🆕 Creating NEW earning: amount=$${amount.toFixed(2)}, percentage=${(percentage * 100).toFixed(0)}%`)

      earning = await prisma.referralEarning.create({
        data: {
          referrerId,
          userId,
          investmentId,
          amount,
          percentage,
          level,
          withdrawn: false,
          status: 'PENDING'
        }
      })

      console.log(`✅ Earning created: id=${earning.id}, amount=$${Number(earning.amount).toFixed(2)}`)
    }

    return earning
  }

  static async createWithdrawalRequest(
    userId: string,
    referralUserId: string,
    investmentId: string,
    referralEarningId: string,
    trc20Address: string
  ) {
    // ✅ Получаем earning, чтобы взять АКТУАЛЬНУЮ сумму
    const earning = await prisma.referralEarning.findUnique({
      where: { id: referralEarningId }
    })

    if (!earning) {
      throw new Error('Referral earning not found')
    }

    const finalAmount = Number(earning.amount)

    console.log(`💾 Creating withdrawal request: earning_id=${referralEarningId}, amount=$${finalAmount.toFixed(2)}`)

    const withdrawal = await prisma.referralWithdrawalRequest.create({
      data: {
        userId,
        referralUserId,
        investmentId,
        referralEarningId,
        amount: finalAmount, // ✅ Берём из обновлённого earning
        trc20Address,
        status: 'PENDING'
      }
    })

    console.log(`✅ Withdrawal request created: id=${withdrawal.id}, amount=$${Number(withdrawal.amount).toFixed(2)}`)

    return withdrawal
  }

  static async collectAvailableEarnings(userId: string) {
    const level1Referrals = await ReferralTreeService.getLevel1Referrals(userId)
    const level1Count = level1Referrals.length
    const tierPercent = CommissionService.calculateTierPercent(level1Count)

    console.log(`📊 Collecting available earnings: Level 1 count=${level1Count}, tier=${(tierPercent * 100).toFixed(0)}%`)

    const level1Ids = level1Referrals.map(r => r.id)
    const level2Referrals = await ReferralTreeService.getLevel2Referrals(level1Ids)

    const availableItems: any[] = []

    for (const ref of level1Referrals) {
      for (const investment of ref.investments) {
        const commission = CommissionService.calculateCommission(Number(investment.amount), tierPercent)

        console.log(`💰 Level 1: investment=$${Number(investment.amount).toFixed(2)}, commission=$${commission.toFixed(2)} (${(tierPercent * 100).toFixed(0)}%)`)

        if (!ValidationUtils.isWithdrawalAvailable(investment.createdAt, REQUIRED_DAYS)) {
          continue
        }

        const earning = await prisma.referralEarning.findFirst({
          where: {
            referrerId: userId,
            userId: ref.id,
            investmentId: investment.id
          }
        })

        if (earning?.withdrawn) continue

        availableItems.push({
          referralUserId: ref.id,
          investmentId: investment.id,
          amount: commission,
          level: 1,
          percentage: tierPercent
        })
      }
    }

    for (const ref of level2Referrals) {
      for (const investment of ref.investments) {
        const commission = CommissionService.calculateCommission(Number(investment.amount), 0.03)

        console.log(`💰 Level 2: investment=$${Number(investment.amount).toFixed(2)}, commission=$${commission.toFixed(2)} (3%)`)

        if (!ValidationUtils.isWithdrawalAvailable(investment.createdAt, REQUIRED_DAYS)) {
          continue
        }

        const earning = await prisma.referralEarning.findFirst({
          where: {
            referrerId: userId,
            userId: ref.id,
            investmentId: investment.id
          }
        })

        if (earning?.withdrawn) continue

        availableItems.push({
          referralUserId: ref.id,
          investmentId: investment.id,
          amount: commission,
          level: 2,
          percentage: 0.03
        })
      }
    }

    console.log(`✅ Total available items: ${availableItems.length}`)

    return availableItems
  }

  static async markEarningsAsWithdrawn(availableItems: any[], userId: string) {
    const now = new Date()

    for (const item of availableItems) {
      let earning = await this.getOrCreateEarning(
        userId,
        item.referralUserId,
        item.investmentId,
        item.amount,
        item.percentage,
        item.level
      )

      await prisma.referralEarning.update({
        where: { id: earning.id },
        data: {
          withdrawn: true,
          withdrawnAt: now,
          status: 'COMPLETED'
        }
      })
    }
  }
}
