/**
 * Типы для сессий пользователей
 */

export type SessionType = 
  | 'investment' 
  | 'upgrade' 
  | 'early_withdrawal' 
  | 'partial_withdrawal' 
  | 'referral_bonus_withdrawal' 
  | 'full_withdrawal'

export interface UserSession {
  investmentId?: string
  upgradeId?: string
  earlyWithdrawalId?: string
  partialWithdrawalId?: string
  referralBonusWithdrawalId?: string
  fullWithdrawalId?: string
  amount: number
  planName: string
  adminWallet?: string
  userEmail: string
  senderWallet?: string
  type: SessionType
  language: string
}