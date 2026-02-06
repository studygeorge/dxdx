import { PrismaClient, User } from '@prisma/client'
import { Web3Utils } from '../utils/web3'
import { JWTUtils } from '../utils/jwt'
import { Web3VerifyRequest } from '../types'

const prisma = new PrismaClient()

export class Web3AuthService {
  static async requestConnection(walletAddress: string, domain: string) {
    console.log('🔍 Web3AuthService.requestConnection called')
    console.log('  - walletAddress:', walletAddress)
    console.log('  - walletAddress type:', typeof walletAddress)
    console.log('  - domain:', domain)

    // ✅ ИСПРАВЛЕНО: Явная проверка на null/undefined/пустую строку
    if (!walletAddress) {
      console.error('❌ walletAddress is null, undefined, or empty')
      throw new Error('Wallet address is required')
    }

    if (typeof walletAddress !== 'string') {
      console.error('❌ walletAddress is not a string, got:', typeof walletAddress)
      throw new Error('Wallet address must be a string')
    }

    const trimmedAddress = walletAddress.trim()
    if (trimmedAddress.length === 0) {
      console.error('❌ walletAddress is empty after trim')
      throw new Error('Wallet address cannot be empty')
    }

    // ✅ ИСПРАВЛЕНО: Проверка формата ДО нормализации
    console.log('🔍 Validating address format...')
    if (!Web3Utils.isValidAddress(trimmedAddress)) {
      console.error('❌ Invalid wallet address format:', trimmedAddress)
      throw new Error('Invalid Ethereum wallet address format')
    }

    console.log('✅ Address format valid, normalizing...')
    const normalizedAddress = Web3Utils.normalizeAddress(trimmedAddress)
    console.log('✅ Normalized address:', normalizedAddress)

    const nonce = Web3Utils.generateNonce()
    console.log('✅ Generated nonce:', nonce)
    
    // Удаляем старые невалидные сессии
    console.log('🧹 Cleaning up old sessions...')
    await prisma.web3Session.deleteMany({
      where: {
        walletAddress: normalizedAddress,
        isVerified: false,
        expiresAt: { lt: new Date() }
      }
    })

    console.log('📝 Creating SIWE message...')
    const message = Web3Utils.createSiweMessage(domain, normalizedAddress, nonce)
    console.log('✅ SIWE message created')

    console.log('💾 Creating web3 session in database...')
    const session = await prisma.web3Session.create({
      data: {
        walletAddress: normalizedAddress,
        nonce,
        message,
        expiresAt: new Date(Date.now() + parseInt(process.env.WEB3_SESSION_TIMEOUT || '600000'))
      }
    })
    console.log('✅ Session created with ID:', session.id)

    return {
      message,
      nonce: session.nonce,
      expiresAt: session.expiresAt
    }
  }

  static async verifyAndLogin(data: Web3VerifyRequest, ipAddress?: string) {
    console.log('🔍 Web3AuthService.verifyAndLogin called')
    console.log('  - walletAddress:', data.walletAddress)
    console.log('  - nonce:', data.nonce)
    console.log('  - signature length:', data.signature?.length)

    // ✅ ДОБАВЛЕНО: Валидация входных данных
    if (!data.walletAddress || !data.signature || !data.nonce) {
      throw new Error('Missing required fields: walletAddress, signature, and nonce are required')
    }

    if (typeof data.walletAddress !== 'string' || typeof data.signature !== 'string' || typeof data.nonce !== 'string') {
      throw new Error('Invalid field types: all fields must be strings')
    }

    const normalizedAddress = Web3Utils.normalizeAddress(data.walletAddress)
    console.log('✅ Normalized address:', normalizedAddress)

    console.log('🔍 Looking for web3 session...')
    const web3Session = await prisma.web3Session.findFirst({
      where: {
        walletAddress: normalizedAddress,
        nonce: data.nonce,
        isVerified: false,
        expiresAt: { gt: new Date() }
      }
    })

    if (!web3Session) {
      console.error('❌ Web3 session not found or expired')
      throw new Error('Invalid or expired Web3 session')
    }
    console.log('✅ Web3 session found:', web3Session.id)

    console.log('🔍 Verifying signature...')
    const isValidSignature = await Web3Utils.verifySignature(
      web3Session.message,
      data.signature,
      normalizedAddress
    )

    if (!isValidSignature) {
      console.error('❌ Signature verification failed')
      throw new Error('Invalid signature')
    }
    console.log('✅ Signature verified successfully')

    console.log('💾 Updating web3 session as verified...')
    await prisma.web3Session.update({
      where: { id: web3Session.id },
      data: { 
        signature: data.signature,
        isVerified: true 
      }
    })

    // ✅ ИСПРАВЛЕНО: Правильный тип User
    console.log('🔍 Looking for existing user by main wallet address...')
    let user: User | null = await prisma.user.findUnique({
      where: { walletAddress: normalizedAddress }
    })

    // Если не найден по основному адресу, ищем в connectedWallets
    if (!user) {
      console.log('🔍 User not found by main address, searching in connectedWallets...')
      const allUsers = await prisma.user.findMany()
      
      console.log(`🔍 Checking ${allUsers.length} users for connected wallets...`)
      
      // ✅ ИСПРАВЛЕНО: Правильная типизация для find
      const foundUser = allUsers.find(u => {
        if (!u.connectedWallets) {
          return false
        }
        
        try {
          let wallets: string[] = []
          
          // Если это массив
          if (Array.isArray(u.connectedWallets)) {
            wallets = u.connectedWallets.filter((w): w is string => typeof w === 'string')
          }
          // Если это JSON строка
          else if (typeof u.connectedWallets === 'string') {
            try {
              const parsed = JSON.parse(u.connectedWallets)
              if (Array.isArray(parsed)) {
                wallets = parsed.filter((w): w is string => typeof w === 'string')
              }
            } catch (parseError) {
              console.error('Failed to parse connectedWallets as JSON:', parseError)
              return false
            }
          }
          // Если это объект (Prisma Json type)
          else if (typeof u.connectedWallets === 'object' && u.connectedWallets !== null) {
            const values = Object.values(u.connectedWallets)
            wallets = values.filter((v): v is string => typeof v === 'string')
          }
          
          // ✅ ИСПРАВЛЕНО: Проверяем length только после того, как убедились что это массив
          if (wallets.length > 0) {
            return wallets.some(w => w.toLowerCase() === normalizedAddress.toLowerCase())
          }
          
          return false
        } catch (error) {
          console.error('Error checking connectedWallets for user:', u.id, error)
          return false
        }
      })
      
      user = foundUser || null
      
      if (user) {
        console.log('✅ User found in connectedWallets:', user.id)
      } else {
        console.log('ℹ️ User not found in any connectedWallets')
      }
    } else {
      console.log('✅ User found by main address:', user.id)
    }

    // Создаем нового пользователя, если не найден
    if (!user) {
      console.log('👤 Creating new user...')
      const [ensName, balance] = await Promise.all([
        Web3Utils.resolveENS(normalizedAddress),
        Web3Utils.getWalletBalance(normalizedAddress)
      ])
      
      console.log('  - ENS name:', ensName || 'none')
      console.log('  - Balance:', balance, 'ETH')
      
      user = await prisma.user.create({
        data: {
          walletAddress: normalizedAddress,
          ensName,
          authMethod: 'WEB3',
          username: ensName || `wallet_${normalizedAddress.slice(2, 8)}`,
          isActive: true,
          connectedWallets: [normalizedAddress]
        }
      })
      console.log('✅ New user created:', user.id)

      console.log('💰 Creating wallet record...')
      await prisma.wallet.create({
        data: {
          userId: user.id,
          cryptocurrency: 'ETH',
          address: normalizedAddress,
          balance: parseFloat(balance),
          isMainWallet: true
        }
      })
      console.log('✅ Wallet record created')
    }

    // Обновляем последний логин
    console.log('🔄 Updating last login info...')
    user = await prisma.user.update({
      where: { id: user.id },
      data: { 
        lastLoginAt: new Date(),
        lastLoginIP: ipAddress
      }
    })

    console.log('🔑 Generating JWT tokens...')
    const { accessToken, refreshToken } = this.generateTokens(user.id, normalizedAddress)

    console.log('💾 Creating user session...')
    const userSession = await prisma.session.create({
      data: {
        userId: user.id,
        token: accessToken,
        refreshToken,
        ipAddress,
        sessionType: 'WEB3',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })
    console.log('✅ Session created:', userSession.id)

    console.log('📝 Creating audit log...')
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'WEB3_LOGIN',
        resource: 'User',
        details: JSON.stringify({ 
          walletAddress: normalizedAddress,
          ensName: user.ensName,
          sessionId: userSession.id,
          authMethod: 'WEB3'
        }),
        ipAddress,
        success: true
      }
    })

    console.log('✅ Web3 login completed successfully')

    // ✅ ИСПРАВЛЕНО: Безопасное преобразование connectedWallets с правильной типизацией
    let connectedWallets: string[] = []
    if (user.connectedWallets) {
      if (Array.isArray(user.connectedWallets)) {
        connectedWallets = user.connectedWallets.filter((w): w is string => typeof w === 'string')
      } else if (typeof user.connectedWallets === 'string') {
        try {
          const parsed = JSON.parse(user.connectedWallets)
          if (Array.isArray(parsed)) {
            connectedWallets = parsed.filter((w): w is string => typeof w === 'string')
          }
        } catch {
          connectedWallets = []
        }
      }
    }

    return {
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        ensName: user.ensName,
        username: user.username,
        authMethod: user.authMethod,
        kycStatus: user.kycStatus,
        createdAt: user.createdAt,
        connectedWallets: connectedWallets
      },
      tokens: {
        accessToken,
        refreshToken
      },
      session: {
        id: userSession.id,
        expiresAt: userSession.expiresAt
      }
    }
  }

  static async connectAdditionalWallet(userId: string, walletAddress: string, signature: string, nonce: string) {
    console.log('🔗 Connecting additional wallet for user:', userId)

    if (!walletAddress || typeof walletAddress !== 'string') {
      throw new Error('Valid wallet address is required')
    }

    const normalizedAddress = Web3Utils.normalizeAddress(walletAddress)
    console.log('  - Normalized address:', normalizedAddress)

    const existingUser = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: userId } },
          { walletAddress: normalizedAddress }
        ]
      }
    })

    if (existingUser) {
      console.error('❌ Wallet already connected to another account')
      throw new Error('Wallet already connected to another account')
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      console.error('❌ User not found:', userId)
      throw new Error('User not found')
    }

    // ✅ ИСПРАВЛЕНО: Безопасная работа с connectedWallets с правильной типизацией
    let connectedWallets: string[] = []
    
    if (user.connectedWallets) {
      if (Array.isArray(user.connectedWallets)) {
        connectedWallets = user.connectedWallets.filter((w): w is string => typeof w === 'string')
      } else if (typeof user.connectedWallets === 'string') {
        try {
          const parsed = JSON.parse(user.connectedWallets)
          if (Array.isArray(parsed)) {
            connectedWallets = parsed.filter((w): w is string => typeof w === 'string')
          }
        } catch {
          connectedWallets = []
        }
      }
    }

    if (!connectedWallets.includes(normalizedAddress)) {
      connectedWallets.push(normalizedAddress)
      
      await prisma.user.update({
        where: { id: userId },
        data: { connectedWallets }
      })
      console.log('✅ Wallet added to connectedWallets')

      await prisma.wallet.create({
        data: {
          userId: userId,
          cryptocurrency: 'ETH',
          address: normalizedAddress,
          balance: 0,
          isMainWallet: false
        }
      })
      console.log('✅ Wallet record created')

      await prisma.auditLog.create({
        data: {
          userId,
          action: 'WALLET_CONNECT',
          resource: 'Wallet',
          details: JSON.stringify({ walletAddress: normalizedAddress }),
          success: true
        }
      })
      console.log('✅ Audit log created')
    } else {
      console.log('ℹ️ Wallet already connected')
    }

    return { success: true, connectedWallets }
  }

  static async getWalletInfo(address: string) {
    console.log('🔍 Getting wallet info for:', address)

    if (!address || typeof address !== 'string') {
      throw new Error('Valid wallet address is required')
    }

    if (!Web3Utils.isValidAddress(address)) {
      throw new Error('Invalid wallet address format')
    }

    const normalizedAddress = Web3Utils.normalizeAddress(address)
    
    const [ensName, balance] = await Promise.all([
      Web3Utils.resolveENS(normalizedAddress),
      Web3Utils.getWalletBalance(normalizedAddress)
    ])

    console.log('✅ Wallet info retrieved')

    return {
      address: normalizedAddress,
      ensName,
      balance,
      isValid: true
    }
  }

  private static generateTokens(userId: string, walletAddress: string) {
    const accessToken = JWTUtils.generateAccessToken({ 
      userId, 
      walletAddress, 
      authMethod: 'WEB3'
    })
    
    const refreshToken = JWTUtils.generateRefreshToken({ 
      userId, 
      walletAddress, 
      authMethod: 'WEB3'
    })

    return { accessToken, refreshToken }
  }

  static async cleanupExpiredSessions() {
    console.log('🧹 Cleaning up expired Web3 sessions...')
    const result = await prisma.web3Session.deleteMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    })
    console.log(`✅ Deleted ${result.count} expired sessions`)

    return { deletedCount: result.count }
  }
}