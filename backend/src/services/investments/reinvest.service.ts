import { PrismaClient } from '@prisma/client'
import { PACKAGES, DURATION_BONUSES } from '../../constants/investments.constants'

const prisma = new PrismaClient()

export class ReinvestService {
  /**
   * Получить название текущего пакета по сумме
   */
  static getCurrentPackageName(amount: number): string {
    if (amount >= PACKAGES.elite.min) return 'Elite'
    if (amount >= PACKAGES.pro.min) return 'Pro'
    if (amount >= PACKAGES.advanced.min) return 'Advanced'
    return 'Starter'
  }

  /**
   * Получить базовый ROI пакета
   */
  static getPackageROI(packageName: string): number {
    switch (packageName) {
      case 'Elite': return PACKAGES.elite.monthlyRate
      case 'Pro': return PACKAGES.pro.monthlyRate
      case 'Advanced': return PACKAGES.advanced.monthlyRate
      case 'Starter': return PACKAGES.starter.monthlyRate
      default: return PACKAGES.starter.monthlyRate
    }
  }

  /**
   * Получить бонус за длительность (rateBonus)
   */
  static getDurationBonus(duration: number): number {
    const bonusObj = DURATION_BONUSES[duration]
    if (!bonusObj) return 0
    return bonusObj.rateBonus || 0
  }

  /**
   * Проверка: можно ли перейти на следующий план
   */
  static canUpgradeToNextPlan(currentAmount: number, reinvestAmount: number): {
    canUpgrade: boolean
    targetPackage: string | null
    targetROI: number | null
  } {
    const newTotalAmount = currentAmount + reinvestAmount
    const currentPackage = this.getCurrentPackageName(currentAmount)
    const newPackage = this.getCurrentPackageName(newTotalAmount)

    console.log('🔍 canUpgradeToNextPlan:', {
      currentAmount,
      reinvestAmount,
      newTotalAmount,
      currentPackage,
      newPackage
    })

    if (currentPackage !== newPackage) {
      const targetROI = this.getPackageROI(newPackage)
      return {
        canUpgrade: true,
        targetPackage: newPackage,
        targetROI
      }
    }

    return {
      canUpgrade: false,
      targetPackage: null,
      targetROI: null
    }
  }

  /**
   * Рассчитать доступную прибыль для реинвестирования
   */
  static async calculateAvailableProfit(investmentId: string): Promise<number> {
    const investment = await prisma.investment.findUnique({
      where: { id: investmentId },
      select: {
        amount: true,
        effectiveROI: true,
        duration: true,
        startDate: true,
        lastUpgradeDate: true,
        accumulatedInterest: true,
        withdrawnProfits: true,
        simulatedCurrentDate: true
      }
    })

    if (!investment || !investment.startDate) {
      throw new Error('Investment not found or not started')
    }

    const currentDate = investment.simulatedCurrentDate || new Date()
    const startDate = investment.lastUpgradeDate || investment.startDate

    const daysPassed = Math.floor(
      (currentDate.getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    )

    console.log('📊 calculateAvailableProfit:', {
      investmentId,
      amount: Number(investment.amount),
      effectiveROI: Number(investment.effectiveROI),
      daysPassed,
      accumulatedInterest: Number(investment.accumulatedInterest),
      withdrawnProfits: Number(investment.withdrawnProfits)
    })

    const monthlyRate = Number(investment.effectiveROI) / 100
    const dailyRate = monthlyRate / 30
    const currentProfit = Number(investment.amount) * dailyRate * daysPassed
    const totalProfit = currentProfit + Number(investment.accumulatedInterest)
    const availableProfit = totalProfit - Number(investment.withdrawnProfits)

    console.log('💰 Available profit:', {
      currentProfit: currentProfit.toFixed(2),
      accumulatedInterest: Number(investment.accumulatedInterest).toFixed(2),
      totalProfit: totalProfit.toFixed(2),
      withdrawnProfits: Number(investment.withdrawnProfits).toFixed(2),
      availableProfit: availableProfit.toFixed(2)
    })

    return Math.max(0, availableProfit)
  }

  /**
   * Получить историю реинвестирований
   */
  static async getReinvestHistory(investmentId: string, userId: string) {
    const investment = await prisma.investment.findUnique({
      where: { id: investmentId },
      select: { userId: true }
    })

    if (!investment) {
      throw new Error('Investment not found')
    }

    if (investment.userId !== userId) {
      throw new Error('Unauthorized: Investment does not belong to user')
    }

    const reinvests = await prisma.investmentReinvest.findMany({
      where: { investmentId },
      orderBy: { requestDate: 'desc' }
    })

    return {
      success: true,
      data: reinvests.map(r => ({
        id: r.id,
        reinvestedAmount: Number(r.reinvestedAmount),
        fromProfit: Number(r.fromProfit),
        oldPackage: r.oldPackage,
        newPackage: r.newPackage,
        oldROI: Number(r.oldROI),
        newROI: Number(r.newROI),
        oldAmount: Number(r.oldAmount),
        newAmount: Number(r.newAmount),
        upgraded: r.upgraded,
        status: r.status,
        requestDate: r.requestDate,
        processedDate: r.processedDate
      }))
    }
  }
}