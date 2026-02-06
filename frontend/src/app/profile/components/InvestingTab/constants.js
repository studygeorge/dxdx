export const API_BASE_URL = 'https://dxcapital-ai.com'

export const packages = [
  { name: 'Starter', apy: 14, minAmount: 100, maxAmount: 999 },
  { name: 'Advanced', apy: 17, minAmount: 1000, maxAmount: 2999 },
  { name: 'Pro', apy: 20, minAmount: 3000, maxAmount: 5999 },
  { name: 'Elite', apy: 22, minAmount: 6000, maxAmount: 100000 }
]

export const getDurationBonuses = (language) => ({
  3: {
    months: 3,
    rateBonus: 0,
    cashBonus: 0,
    label: language === 'ru' ? '3 месяца' : '3 months',
    description: language === 'ru' ? 'Базовая ставка' : 'Base rate'
  },
  6: {
    months: 6,
    rateBonus: 1.5,
    cashBonus500: 200,
    cashBonus1000: 500,
    label: language === 'ru' ? '6 месяцев' : '6 months',
    description: language === 'ru' ? 'Базовая ставка +1.5%' : 'Base rate +1.5%',
    cashBonusLabel500: language === 'ru' ? 'Бонус $200 от $500' : 'Bonus $200 from $500',
    cashBonusLabel1000: language === 'ru' ? 'Бонус $500 от $1000' : 'Bonus $500 from $1000'
  },
  12: {
    months: 12,
    rateBonus: 3,
    cashBonus500: 200,
    cashBonus1000: 500,
    label: language === 'ru' ? '12 месяцев' : '12 months',
    description: language === 'ru' ? 'Базовая ставка +3%' : 'Base rate +3%',
    cashBonusLabel500: language === 'ru' ? 'Бонус $200 от $500' : 'Bonus $200 from $500',
    cashBonusLabel1000: language === 'ru' ? 'Бонус $500 от $1000' : 'Bonus $500 from $1000'
  }
})

export const getDurationBonus = (duration, amount) => {
  if (duration === 3) return 0
  if (duration === 6 || duration === 12) {
    if (amount >= 1000) return 500
    if (amount >= 500) return 200
  }
  return 0
}
