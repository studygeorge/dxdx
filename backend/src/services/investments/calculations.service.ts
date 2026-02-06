// dxcapai-backend/src/services/investments/calculations.service.ts

export class CalculationsService {
  static calculateDaysPassedServer(startDate: Date, lastUpgradeDate: Date | null, currentDate: Date): number {
    const baseDate = lastUpgradeDate || startDate
    const diffTime = currentDate.getTime() - baseDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 ? diffDays : 0
  }

  static calculateCurrentReturnServer(
    amount: number,
    effectiveROI: number,
    daysPassed: number,
    accumulatedInterest: number
  ): number {
    const dailyRate = effectiveROI / 30
    const newPeriodProfit = (amount * dailyRate * daysPassed) / 100
    const totalProfit = accumulatedInterest + newPeriodProfit
    
    console.log('💰 calculateCurrentReturnServer:', {
      amount,
      effectiveROI,
      daysPassed,
      dailyRate: dailyRate.toFixed(4),
      newPeriodProfit: newPeriodProfit.toFixed(2),
      accumulatedFromOldPlan: accumulatedInterest.toFixed(2),
      totalProfit: totalProfit.toFixed(2)
    })
    
    return Math.max(0, totalProfit)
  }

  static calculateDaysRemainingServer(endDate: Date, currentDate: Date): number {
    const diffTime = endDate.getTime() - currentDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  static calculateCurrentReturn(amount: number, monthlyRate: number, durationDays: number, daysPassed: number): number {
    const dailyRate = monthlyRate / 30
    return (amount * dailyRate * daysPassed) / 100
  }

  static calculateEarlyWithdraw(
    amount: number, 
    monthlyRate: number, 
    daysPassed: number, 
    accumulatedInterest: number,
    withdrawnProfits: number
  ) {
    const interest = (monthlyRate / 30) * daysPassed
    const earnedAmount = (amount * interest) / 100
    const totalEarned = earnedAmount + accumulatedInterest
    const totalAmount = amount - withdrawnProfits
    
    return {
      earnedInterest: totalEarned,
      withdrawnProfits: withdrawnProfits,
      totalAmount: totalAmount
    }
  }

  static calculateExpectedReturn(amount: number, monthlyRate: number, durationMonths: number): number {
    return (amount * monthlyRate * durationMonths) / 100
  }

  /**
   * 🆕 Определяет следующую дату активации ROI (15-е или 30-е число, в феврале 28/29)
   * @param currentDate - текущая дата (или дата запроса апгрейда)
   * @returns следующая дата активации
   */
  static getNextActivationDate(currentDate: Date): Date {
    const day = currentDate.getDate()
    const month = currentDate.getMonth()
    const year = currentDate.getFullYear()

    // Если день < 15 → активация 15-го текущего месяца
    if (day < 15) {
      return new Date(year, month, 15, 0, 0, 0, 0)
    }

    // Определяем последний день активации для текущего месяца
    let lastActivationDay = 30
    
    if (month === 1) { // Февраль (месяцы с 0)
      const lastDayOfFeb = new Date(year, 2, 0).getDate() // 28 или 29
      lastActivationDay = lastDayOfFeb
    }

    // Если день между 15 и lastActivationDay → активация на lastActivationDay текущего месяца
    if (day >= 15 && day < lastActivationDay) {
      return new Date(year, month, lastActivationDay, 0, 0, 0, 0)
    }

    // Если день >= lastActivationDay → активация 15-го следующего месяца
    return new Date(year, month + 1, 15, 0, 0, 0, 0)
  }
}
