import { PackageInfo, DurationBonus } from '../types/investments.types'

export const PACKAGES: Record<string, PackageInfo> = {
  starter: { name: 'Starter', monthlyRate: 14, min: 100, max: 999 },
  advanced: { name: 'Advanced', monthlyRate: 17, min: 1000, max: 2999 },
  pro: { name: 'Pro', monthlyRate: 20, min: 3000, max: 5999 },
  elite: { name: 'Elite', monthlyRate: 22, min: 6000, max: 100000 }
}

export const DURATION_BONUSES: Record<number, DurationBonus> = {
  3: {
    months: 3,
    rateBonus: 0,
    cashBonus500: 0,
    cashBonus1000: 0,
    label: '3 месяца'
  },
  6: {
    months: 6,
    rateBonus: 1.5,
    cashBonus500: 200,
    cashBonus1000: 500,
    label: '6 месяцев: +1.5% к месячной ставке + бонус $200/$500'
  },
  12: {
    months: 12,
    rateBonus: 3,
    cashBonus500: 200,
    cashBonus1000: 500,
    label: '12 месяцев: +3% к месячной ставке + бонус $200/$500'
  }
}