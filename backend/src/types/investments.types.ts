export interface CreateInvestmentBody {
  planId: string
  amount: number
  duration: number
  walletAddress: string
  paymentMethod?: string
  language?: string
}

export interface ConfirmPaymentBody {
  txHash: string
}

export interface UpgradeInvestmentBody {
  additionalAmount: number
  newPackage: string
  paymentMethod?: string
  senderWalletAddress?: string
  accumulatedInterest?: number
}

export interface PartialWithdrawDto {
  amount: number
  trc20Address: string
  withdrawType?: 'profit' | 'bonus'
}

export interface SimulateDateDto {
  investmentId: string
  simulatedDate: string
}

export interface PackageInfo {
  name: string
  monthlyRate: number
  min: number
  max: number
}

export interface DurationBonus {
  months: number
  rateBonus: number
  cashBonus500: number
  cashBonus1000: number
  label: string
}

export interface ReinvestDto {
  amount: number  // Сумма для реинвестирования (из доступной прибыли)
}

// ========================================
// REINVEST TYPES
// ========================================

export interface ReinvestDto {
  amount: number
}

export interface ReinvestResponse {
  success: boolean
  data: {
    reinvestId: string
    investmentId: string
    reinvestedAmount: number
    newTotalAmount: number
    oldPackage: string
    newPackage: string
    oldROI: number
    newROI: number
    upgraded: boolean
    status: 'PENDING' | 'COMPLETED'
  }
}

export interface ReinvestHistoryItem {
  id: string
  reinvestedAmount: number
  fromProfit: number
  oldPackage: string
  newPackage: string
  oldROI: number
  newROI: number
  oldAmount: number
  newAmount: number
  upgraded: boolean
  status: string
  requestDate: Date
  processedDate?: Date
}