export interface ReferralData {
  fullUserId: string
  userIdShort: string
  email: string | null
  joinedAt: Date
  investmentId: string
  investmentAmount: number
  investmentDate: Date
  commission: number
  bonusWithdrawn: boolean
  withdrawnAt: Date | null
}

export interface WithdrawBonusBody {
  referralUserId: string
  investmentId: string
  trc20Address: string
}

export interface WithdrawalStatusParams {
  withdrawalId: string
}

export interface ApproveRejectBody {
  supportUserId?: string
  reason?: string
}

export interface BulkWithdrawBody {
  trc20Address: string
}

export interface ReinvestBody {
  investmentId: string
}

export interface PackageConfig {
  name: string
  min: number
  max: number
  monthlyRate: number
}

export const PACKAGES: Record<string, PackageConfig> = {
  starter: { name: 'Starter', min: 100, max: 999, monthlyRate: 14 },
  advanced: { name: 'Advanced', min: 1000, max: 2999, monthlyRate: 17 },
  pro: { name: 'Pro', min: 3000, max: 4999, monthlyRate: 20 },
  elite: { name: 'Elite', min: 6000, max: 100000, monthlyRate: 22 }
}

export const REQUIRED_DAYS = 31
