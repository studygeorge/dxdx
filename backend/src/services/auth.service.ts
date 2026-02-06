import bcrypt from 'bcryptjs'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'
import { CryptoUtils } from '../utils/crypto'
import { JWTUtils } from '../utils/jwt'
import { RegisterData, LoginData } from '../types'

const prisma = new PrismaClient()

interface RegisterDataWithTelegram {
  email: string
  password: string
  name: string
  username?: string
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
}

export class AuthService {
  
  private static async generateUniqueReferralCode(): Promise<string> {
    let referralCode: string
    let isUnique = false
    let attempts = 0
    const maxAttempts = 10

    while (!isUnique && attempts < maxAttempts) {
      referralCode = nanoid(8)
      
      const existingUser = await prisma.user.findUnique({
        where: { referralCode }
      })
      
      if (!existingUser) {
        isUnique = true
        console.log(`✅ Generated unique referral code: ${referralCode}`)
        return referralCode
      }
      
      attempts++
      console.log(`⚠️ Referral code collision, retry ${attempts}/${maxAttempts}`)
    }

    throw new Error('Failed to generate unique referral code after multiple attempts')
  }

  static async register(data: RegisterDataWithTelegram, ipAddress?: string) {
    console.log('📝 Registration request with Telegram:', { 
      email: data.email,
      name: data.name,
      phoneNumber: data.phoneNumber,
      telegramId: data.telegramId,
      telegramUsername: data.telegramUsername,
      telegramFirstName: data.telegramFirstName,
      telegramLastName: data.telegramLastName
    })

    if (!data.telegramId) {
      throw new Error('Telegram account connection is required')
    }

    if (!data.phoneNumber || data.phoneNumber.trim() === '') {
      throw new Error('Phone number is required')
    }

    const cleanPhoneNumber = String(data.phoneNumber).trim()

    console.log('📞 Processing phone number:', {
      original: data.phoneNumber,
      cleaned: cleanPhoneNumber,
      length: cleanPhoneNumber.length
    })

    const username = data.username || data.email.split('@')[0]

    const nameParts = data.name.trim().split(' ')
    const firstName = data.firstName || nameParts[0] || data.name
    const lastName = data.lastName || nameParts.slice(1).join(' ') || ''

    console.log('📝 Parsed user data:', {
      username,
      firstName,
      lastName,
      phoneNumber: cleanPhoneNumber
    })

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: username },
          { telegramId: data.telegramId }
        ]
      }
    })

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new Error('Email already registered')
      }
      if (existingUser.username === username) {
        throw new Error('Username already taken')
      }
      if (existingUser.telegramId === data.telegramId) {
        throw new Error('This Telegram account is already linked to another user')
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, parseInt(process.env.BCRYPT_ROUNDS || '12'))
    const emailVerifyToken = CryptoUtils.generateSecureToken()
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const userReferralCode = await this.generateUniqueReferralCode()

    let referrerId: string | undefined = undefined
    
    if (data.referralCode) {
      console.log(`🔍 Looking for referrer with code: ${data.referralCode}`)
      
      const referrer = await prisma.user.findUnique({
        where: { referralCode: data.referralCode }
      })
      
      if (referrer) {
        referrerId = referrer.id
        console.log(`✅ User registered via referral code: ${data.referralCode} (Referrer: ${referrer.email}, ID: ${referrer.id})`)
      } else {
        console.log(`⚠️ Invalid referral code provided: ${data.referralCode}`)
      }
    }

    let parsedTelegramAuthDate: Date | undefined
    if (data.telegramAuthDate) {
      if (typeof data.telegramAuthDate === 'string') {
        parsedTelegramAuthDate = new Date(data.telegramAuthDate)
      } else if (typeof data.telegramAuthDate === 'number') {
        parsedTelegramAuthDate = new Date(data.telegramAuthDate * 1000)
      } else if (data.telegramAuthDate instanceof Date) {
        parsedTelegramAuthDate = data.telegramAuthDate
      }

      if (parsedTelegramAuthDate && isNaN(parsedTelegramAuthDate.getTime())) {
        console.warn('⚠️ Invalid telegramAuthDate, setting to current date')
        parsedTelegramAuthDate = new Date()
      }
    }

    console.log('📝 Registration attempt:', {
      email: data.email,
      username,
      firstName,
      lastName,
      phoneNumber: cleanPhoneNumber,
      referralCode: data.referralCode,
      telegramId: data.telegramId,
      telegramUsername: data.telegramUsername,
      telegramAuthDate: parsedTelegramAuthDate
    })

    const user = await prisma.user.create({
      data: {
        email: data.email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber: cleanPhoneNumber,
        emailVerifyToken,
        emailVerifyExpiry,
        referralCode: userReferralCode,
        referredBy: referrerId,
        telegramId: data.telegramId,
        telegramUsername: data.telegramUsername || undefined,
        telegramFirstName: data.telegramFirstName || undefined,
        telegramLastName: data.telegramLastName || undefined,
        telegramPhotoUrl: data.telegramPhotoUrl || undefined,
        telegramAuthDate: parsedTelegramAuthDate || new Date()
      }
    })

    console.log('✅ User registered successfully:', {
      userId: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      telegramId: user.telegramId,
      telegramUsername: user.telegramUsername
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        resource: 'User',
        details: JSON.stringify({ 
          email: data.email, 
          username: username,
          phoneNumber: cleanPhoneNumber,
          referredBy: referrerId,
          referralCode: userReferralCode,
          telegramId: data.telegramId,
          telegramUsername: data.telegramUsername
        }),
        ipAddress,
        success: true
      }
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        isEmailVerified: user.isEmailVerified,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        telegramId: user.telegramId,
        telegramUsername: user.telegramUsername,
        telegramFirstName: user.telegramFirstName,
        telegramLastName: user.telegramLastName,
        telegramPhotoUrl: user.telegramPhotoUrl
      },
      emailVerifyToken
    }
  }

  static async login(data: LoginData, ipAddress?: string, userAgent?: string) {
    console.log('🔍 Login attempt:', { emailOrUsername: data.emailOrUsername })
    
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.emailOrUsername },
          { username: data.emailOrUsername }
        ],
        isActive: true
      }
    })

    console.log('👤 User found:', user ? 'YES' : 'NO')

    if (!user) {
      await this.logFailedLogin(data.emailOrUsername, 'USER_NOT_FOUND', ipAddress)
      throw new Error('Invalid credentials')
    }

    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      throw new Error('Account temporarily locked')
    }

    if (!user.password) {
      console.log('❌ No password found for user')
      throw new Error('Invalid credentials')
    }

    console.log('🔑 Comparing password...')
    const isPasswordValid = await bcrypt.compare(data.password, user.password)
    console.log('🔑 Password valid:', isPasswordValid)
    
    if (!isPasswordValid) {
      await this.handleFailedLogin(user.id, ipAddress)
      throw new Error('Invalid credentials')
    }

    if (user.twoFactorEnabled) {
      if (!data.twoFactorCode) {
        throw new Error('Two-factor authentication code required')
      }

      if (!user.twoFactorSecret) {
        throw new Error('Two-factor authentication not properly set up')
      }

      const decryptedSecret = CryptoUtils.decrypt(user.twoFactorSecret)
      const isValidToken = speakeasy.totp.verify({
        secret: decryptedSecret,
        encoding: 'base32',
        token: data.twoFactorCode,
        window: 2
      })

      if (!isValidToken) {
        await this.handleFailedLogin(user.id, ipAddress)
        throw new Error('Invalid two-factor authentication code')
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        loginAttempts: 0,
        lockoutUntil: null,
        lastLoginAt: new Date(),
        lastLoginIP: ipAddress
      }
    })

    const tokens = AuthService.generateTokens(user.id)

    // ✅ СЕССИЯ НА 365 ДНЕЙ
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // ✅ 365 дней
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        resource: 'Session',
        details: JSON.stringify({ 
          sessionId: session.id,
          telegramId: user.telegramId,
          telegramUsername: user.telegramUsername
        }),
        ipAddress,
        userAgent,
        success: true
      }
    })

    console.log('✅ Login successful:', {
      userId: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      referralCode: user.referralCode,
      telegramId: user.telegramId,
      telegramUsername: user.telegramUsername
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        kycStatus: user.kycStatus,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        telegramId: user.telegramId,
        telegramUsername: user.telegramUsername,
        telegramFirstName: user.telegramFirstName,
        telegramLastName: user.telegramLastName,
        telegramPhotoUrl: user.telegramPhotoUrl
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt
      }
    }
  }

  static async setup2FA(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')

    const secret = speakeasy.generateSecret({
      name: `DXCAPAI (${user.email})`,
      issuer: process.env.TOTP_ISSUER || 'DXCAPAI'
    })

    const encryptedSecret = CryptoUtils.encrypt(secret.base32!)

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: encryptedSecret }
    })

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32
    }
  }

  static async confirm2FA(userId: string, token: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.twoFactorSecret) {
      throw new Error('2FA setup not found')
    }

    const decryptedSecret = CryptoUtils.decrypt(user.twoFactorSecret)
    const isValidToken = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token,
      window: 2
    })

    if (!isValidToken) {
      throw new Error('Invalid token')
    }

    const backupCodes = Array.from({ length: 10 }, () => 
      CryptoUtils.generateSecureToken(4).toUpperCase()
    )
    const encryptedBackupCodes = CryptoUtils.encrypt(JSON.stringify(backupCodes))

    await prisma.user.update({
      where: { id: userId },
      data: { 
        twoFactorEnabled: true,
        backupCodes: encryptedBackupCodes
      }
    })

    return { backupCodes }
  }

  static async disable2FA(userId: string, token: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.twoFactorSecret) {
      throw new Error('2FA not enabled')
    }

    const decryptedSecret = CryptoUtils.decrypt(user.twoFactorSecret)
    const isValidToken = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token,
      window: 2
    })

    if (!isValidToken) {
      throw new Error('Invalid token')
    }

    await prisma.user.update({
      where: { id: userId },
      data: { 
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: null
      }
    })

    return { success: true }
  }

  static generateTokens(userId: string) {
    const accessToken = JWTUtils.generateAccessToken({ userId })
    const refreshToken = JWTUtils.generateRefreshToken({ userId })
    return { accessToken, refreshToken }
  }

  static async handleFailedLogin(userId: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return

    const newAttempts = user.loginAttempts + 1
    const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5')
    
    let updateData: any = { loginAttempts: newAttempts }
    
    if (newAttempts >= maxAttempts) {
      updateData.lockoutUntil = new Date(Date.now() + parseInt(process.env.LOCKOUT_TIME || '900000'))
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'FAILED_LOGIN',
        resource: 'User',
        details: JSON.stringify({ attempts: newAttempts }),
        ipAddress,
        success: false
      }
    })
  }

  static async logFailedLogin(identifier: string, reason: string, ipAddress?: string) {
    await prisma.auditLog.create({
      data: {
        action: 'FAILED_LOGIN',
        resource: 'User',
        details: JSON.stringify({ identifier, reason }),
        ipAddress,
        success: false
      }
    })
  }

  static async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpiry: { gte: new Date() }
      }
    })

    if (!user) {
      throw new Error('Invalid or expired verification token')
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpiry: null
      }
    })

    return { success: true }
  }

  static async resendVerificationEmail(email: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error('User not found')
    if (user.isEmailVerified) throw new Error('Email already verified')

    const emailVerifyToken = CryptoUtils.generateSecureToken()
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken, emailVerifyExpiry }
    })

    return { emailVerifyToken }
  }

  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error('User not found')

    const resetToken = CryptoUtils.generateSecureToken()
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetTokenExpiry: resetExpiry
      }
    })

    return { resetToken }
  }

  static async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetTokenExpiry: { gte: new Date() }
      }
    })

    if (!user) {
      throw new Error('Invalid or expired reset token')
    }

    const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS || '12'))

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
        loginAttempts: 0,
        lockoutUntil: null
      }
    })

    return { success: true }
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.password) throw new Error('User not found')

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) throw new Error('Current password is incorrect')

    const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS || '12'))

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    return { success: true }
  }

  static async updateProfile(userId: string, data: Partial<RegisterDataWithTelegram>) {
    const updateData: any = {}

    if (data.firstName) updateData.firstName = data.firstName
    if (data.lastName) updateData.lastName = data.lastName
    if (data.username) updateData.username = data.username
    if (data.phoneNumber) updateData.phoneNumber = String(data.phoneNumber).trim()

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        referralCode: true,
        referredBy: true,
        telegramId: true,
        telegramUsername: true,
        telegramFirstName: true,
        telegramLastName: true,
        telegramPhotoUrl: true
      }
    })

    return { user }
  }

  static async getReferralStats(userId: string) {
    try {
      const level1Referrals = await prisma.user.findMany({
        where: { referredBy: userId },
        select: {
          id: true,
          email: true,
          username: true,
          phoneNumber: true,
          referralCode: true,
          createdAt: true,
          telegramId: true,
          telegramUsername: true
        }
      })

      const level1Ids = level1Referrals.map(ref => ref.id)
      
      const level2Referrals = await prisma.user.findMany({
        where: { 
          referredBy: { in: level1Ids }
        },
        select: {
          id: true,
          email: true,
          username: true,
          phoneNumber: true,
          referralCode: true,
          referredBy: true,
          createdAt: true,
          telegramId: true,
          telegramUsername: true
        }
      })

      console.log('📊 Referral stats:', {
        userId,
        level1Count: level1Referrals.length,
        level2Count: level2Referrals.length
      })

      return {
        level1: level1Referrals,
        level2: level2Referrals,
        total: level1Referrals.length + level2Referrals.length
      }

    } catch (error: any) {
      console.error('❌ Error getting referral stats:', error)
      throw error
    }
  }
}
