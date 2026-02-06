/**
 * Типы для API запросов/ответов
 */

export interface InvestmentData {
  investmentId: string
  amount: number
  planName: string
  adminWallet: string
  userEmail: string
  senderWallet: string
  language: string
  duration: number
  roi: number
  durationBonus: number
  bonusAmount: number
  expectedReturn: number
  totalReturn: number
}

export interface UpgradeData {
  upgradeId: string
  investmentId: string
  userId: string
  userEmail: string
  oldPackage: string
  newPackage: string
  oldAPY: number
  newAPY: number
  oldAmount: number
  additionalAmount: number
  totalAmount: number
  adminWallet: string
  senderWallet: string
  language: string
}

export interface WithdrawalData {
  withdrawalId: string
  investmentId: string
  userId: string
  userEmail: string
  planName: string
  amount: number
  invested: number
  profit: number
  trc20Address: string
  language: string
}

// ✅ ИСПРАВЛЕНИЕ: добавлены поля amount, invested, profit
export interface EarlyWithdrawalData {
  withdrawalId: string
  investmentId: string
  userId: string
  userEmail: string
  planName: string
  amount: number              // ✅ ДОБАВЛЕНО
  invested: number            // ✅ ДОБАВЛЕНО
  profit: number              // ✅ ДОБАВЛЕНО
  investmentAmount: number
  earnedInterest: number
  withdrawnProfits: number
  totalAmount: number
  daysInvested: number
  trc20Address: string
  language: string
}

// ✅ ИСПРАВЛЕНИЕ: добавлены поля invested, profit
export interface PartialWithdrawalData {
  withdrawalId: string
  investmentId: string
  userId: string
  userEmail: string
  planName: string
  amount: number
  invested: number            // ✅ ДОБАВЛЕНО
  profit: number              // ✅ ДОБАВЛЕНО
  investmentAmount: number
  totalWithdrawn: number
  trc20Address: string
  language: string
}

export interface ReferralBonusData {
  withdrawalId: string
  id?: string  // ✅ Добавлено опциональное поле
  userId: string
  userEmail: string
  referralEmail: string
  investmentDate: string
  commissionRate: number
  amount: number
  trc20Address: string
  language: string
}

export interface KYCData {
  userId: string
  userEmail: string
  userName: string
  photoUrl: string
  language: string
}
