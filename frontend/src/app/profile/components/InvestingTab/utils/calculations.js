// dxcapai-frontend/src/app/profile/components/InvestingTab/utils/calculations.js

export const calculateDaysPassedFromStart = (investment) => {
  const startDate = investment.createdAt ? new Date(investment.createdAt) : null
  if (!startDate) return investment.daysPassed || 0
  
  const now = new Date()
  const diffTime = Math.abs(now - startDate)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export const calculateReturns = (investAmount, selectedPlan, selectedDuration, DURATION_BONUSES) => {
  if (!investAmount || !selectedPlan || !selectedDuration) return null

  const amount = parseFloat(investAmount)
  const baseMonthlyRate = selectedPlan.roi
  const durationBonus = DURATION_BONUSES[selectedDuration]
  
  const hasBonusAccess = amount >= 500
  const effectiveRateBonus = durationBonus.rateBonus
  
  let effectiveCashBonus = 0
  if (hasBonusAccess && selectedDuration !== 3) {
    if (amount >= 1000) {
      effectiveCashBonus = durationBonus.cashBonus1000 || 0
    } else if (amount >= 500) {
      effectiveCashBonus = durationBonus.cashBonus500 || 0
    }
  }
  
  const effectiveMonthlyRate = baseMonthlyRate + effectiveRateBonus
  const interestReturn = (amount * effectiveMonthlyRate * durationBonus.months) / 100
  const totalReturn = amount + interestReturn + effectiveCashBonus

  return {
    baseRate: baseMonthlyRate,
    effectiveRate: effectiveMonthlyRate,
    interestReturn: interestReturn.toFixed(2),
    cashBonus: effectiveCashBonus.toFixed(2),
    totalReturn: totalReturn.toFixed(2),
    durationMonths: durationBonus.months,
    hasCashBonus: effectiveCashBonus > 0,
    hasBonusAccess,
    rateBonus: effectiveRateBonus
  }
}

/**
 * 🆕 Определяет следующую дату активации ROI (15-е или 30-е число, в феврале 28/29)
 * @param {Date} currentDate - текущая дата
 * @returns {Date} следующая дата активации
 */
export const getNextActivationDate = (currentDate = new Date()) => {
  const day = currentDate.getDate()
  const month = currentDate.getMonth()
  const year = currentDate.getFullYear()

  // Если день < 15 → активация 15-го текущего месяца
  if (day < 15) {
    return new Date(year, month, 15, 0, 0, 0, 0)
  }

  // Определяем последний день активации для текущего месяца
  let lastActivationDay = 30
  
  if (month === 1) { // Февраль
    const lastDayOfFeb = new Date(year, 2, 0).getDate() // 28 или 29
    lastActivationDay = lastDayOfFeb
  }

  // Если день между 15 и lastActivationDay → активация на lastActivationDay
  if (day >= 15 && day < lastActivationDay) {
    return new Date(year, month, lastActivationDay, 0, 0, 0, 0)
  }

  // Если день >= lastActivationDay → 15-е следующего месяца
  return new Date(year, month + 1, 15, 0, 0, 0, 0)
}

/**
 * 🆕 Вычисляет количество дней до активации
 * @param {Date|string} activationDate - дата активации
 * @returns {number} количество дней
 */
export const getDaysUntilActivation = (activationDate) => {
  if (!activationDate) return 0
  const now = new Date()
  const activation = new Date(activationDate)
  const diff = activation.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export { validateTRC20Address, canUpgradeInvestment, formatCurrency, formatDate } from '../../wallet/calculations'
