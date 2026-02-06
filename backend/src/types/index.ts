// ==================== USER TYPES ====================

export interface UserPayload {
  id: string
  email?: string
  username?: string
  walletAddress?: string
  ensName?: string
  authMethod: string
  isEmailVerified: boolean
  twoFactorEnabled: boolean
  kycStatus: string
  connectedWallets?: string[]
}

export interface RegisterData {
  email: string
  username?: string
  password: string
  name?: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  referralCode?: string
  telegramId?: string
  telegramUsername?: string
  telegramFirstName?: string
  telegramLastName?: string
  telegramPhotoUrl?: string
  telegramAuthDate?: string | number | Date
  language?: string
}

export interface LoginData {
  emailOrUsername: string
  password: string
  twoFactorCode?: string
}

// ✅ СИНХРОНИЗИРОВАНО с auth.middleware.ts
export interface CurrentUser {
  id: string
  email: string
  username?: string
  firstName?: string
  lastName?: string
  isEmailVerified: boolean
  twoFactorEnabled: boolean
  kycStatus: string
  referralCode?: string
  referredBy?: string
  isActive: boolean
  walletAddress?: string
  authMethod: string
  kycVerified?: boolean
  isKycVerified?: boolean
  emailVerified?: boolean
  phoneNumber?: string
  telegramId?: string
  telegramUsername?: string
  createdAt?: Date
}

// ==================== AUTH TYPES ====================

export interface Web3VerifyRequest {
  walletAddress: string
  signature: string
  nonce: string
}

export interface JWTPayload {
  userId: string
  email?: string
  walletAddress?: string
  authMethod?: string
  type: 'access' | 'refresh'
  iat?: number
  exp?: number
}

export interface RefreshTokenData {
  refreshToken?: string
}

export interface TelegramLoginData {
  telegramId: string
}

// ==================== ADMIN TYPES ====================

export interface AdminPayload {
  id: string
  telegramId: string
  username?: string
  firstName?: string
  lastName?: string
  role: string
  isActive: boolean
}

export interface AdminJWTPayload {
  adminId: string
  telegramId: string
  role: string
  type: 'access' | 'refresh'
}

// ==================== TELEGRAM TYPES ====================

export interface TelegramAuthData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

// ==================== KYC TYPES ====================

export interface KYCSubmitData {
  documentType?: string
  documentNumber?: string
  dateOfBirth?: string
  address?: string
  city?: string
  country?: string
  postalCode?: string
}

export interface KYCStatus {
  kycStatus: string
  hasDocument: boolean
  kycPhotoUrl?: string
  kycVideoUrl?: string
  kycSubmittedAt?: Date
  kycRejectionReason?: string
}

// ==================== SESSION TYPES ====================

export interface SessionData {
  id: string
  userId: string
  token: string
  refreshToken: string
  ipAddress?: string
  userAgent?: string
  isActive: boolean
  expiresAt: Date
  lastUsedAt: Date
  createdAt: Date
}

export interface DeleteSessionParams {
  sessionId: string
}

export interface DeleteAllSessionsBody {
  currentRefreshToken: string
}

// ==================== PROFILE TYPES ====================

export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  username?: string
  phoneNumber?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

// ==================== REFERRAL TYPES ====================

export interface ReferralStats {
  totalReferrals: number
  activeReferrals: number
  totalEarnings: number
  pendingEarnings: number
  referrals: ReferralUser[]
}

export interface ReferralUser {
  id: string
  email: string
  username?: string
  createdAt: Date
  isActive: boolean
  totalInvestment?: number
}

// ==================== SECURITY TYPES ====================

export interface ReportSuspiciousActivityBody {
  sessionId?: string
  description: string
}

export interface AuditLogEntry {
  id: string
  action: string
  resource: string
  ipAddress?: string
  userAgent?: string
  success: boolean
  createdAt: Date
}

// ==================== ERROR TYPES ====================

export interface ErrorResponse {
  success: false
  error: string
  code?: string
}

export interface SuccessResponse<T = any> {
  success: true
  message?: string
  data?: T
}

// ==================== REQUEST EXTENSION ====================

declare module 'fastify' {
  interface FastifyRequest {
    currentAdmin?: AdminPayload
    currentUser?: CurrentUser
  }
}

// ==================== INVESTMENT TYPES ====================

export interface Investment {
  id: string
  userId: string
  amount: number
  currency: string
  status: string
  createdAt: Date
  updatedAt: Date
}

export interface InvestmentPlan {
  id: string
  name: string
  minAmount: number
  maxAmount: number
  interestRate: number
  duration: number
  isActive: boolean
}

// ==================== WALLET TYPES ====================

export interface WalletBalance {
  userId: string
  totalBalance: number
  availableBalance: number
  lockedBalance: number
  currency: string
}

export interface Transaction {
  id: string
  userId: string
  type: string
  amount: number
  currency: string
  status: string
  createdAt: Date
}

// ==================== NOTIFICATION TYPES ====================

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: Date
}

// ==================== PAGINATION TYPES ====================

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  success: true
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ==================== FILE UPLOAD TYPES ====================

export interface FileUploadResult {
  filename: string
  mimetype: string
  size: number
  url: string
}

export interface MultipartFile {
  fieldname: string
  filename: string
  encoding: string
  mimetype: string
  file: NodeJS.ReadableStream
  toBuffer: () => Promise<Buffer>
}

// ==================== TRADING REPORT TYPES ====================

export interface TradingReport {
  id: string
  date: Date
  profit: number
  currency: string
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateTradingReportData {
  date: Date
  profit: number
  currency?: string
  description?: string
  isActive?: boolean
}

export interface UpdateTradingReportData {
  date?: Date
  profit?: number
  currency?: string
  description?: string
  isActive?: boolean
}

// ==================== VIDEO UPLOAD TYPES ====================

export interface VideoUploadResult {
  filename: string
  mimetype: string
  size: number
  duration?: number
  url: string
  path: string
}

export interface KYCUploadData {
  photoFile?: MultipartFile
  videoFile?: MultipartFile
  userId: string
}
