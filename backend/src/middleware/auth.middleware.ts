import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { AdminPayload, CurrentUser } from '../types' // ✅ Импортируем CurrentUser
import { JWTUtils } from '../utils/jwt'

const prisma = new PrismaClient()

// ✅ УБРАЛИ дублирование типа - используем из types/index.ts

// ✅ Основная аутентификация с обработкой истекших токенов
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        success: false,
        error: 'Authentication required',
        code: 'NO_TOKEN'
      })
    }

    const token = authHeader.split(' ')[1]
    
    let decoded
    try {
      decoded = await request.server.jwt.verify(token) as { userId: string }
    } catch (jwtError: any) {
      if (jwtError.message.includes('expired') || jwtError.name === 'TokenExpiredError') {
        return reply.code(401).send({
          success: false,
          error: 'Token expired',
          code: 'TOKEN_EXPIRED'
        })
      }
      
      return reply.code(401).send({
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      })
    }
    
    const session = await prisma.session.findFirst({
      where: {
        token,
        isActive: true,
        expiresAt: { gte: new Date() }
      },
      include: {
        user: true
      }
    })

    if (!session) {
      return reply.code(401).send({
        success: false,
        error: 'Invalid or expired session',
        code: 'SESSION_EXPIRED'
      })
    }

    request.currentUser = {
      id: session.user.id,
      email: session.user.email!,
      username: session.user.username || undefined,
      firstName: session.user.firstName || undefined,
      lastName: session.user.lastName || undefined,
      isEmailVerified: session.user.isEmailVerified,
      twoFactorEnabled: session.user.twoFactorEnabled,
      kycStatus: session.user.kycStatus,
      referralCode: session.user.referralCode || undefined,
      referredBy: session.user.referredBy || undefined,
      isActive: session.user.isActive,
      walletAddress: session.user.walletAddress || undefined,
      authMethod: session.user.authMethod,
      kycVerified: session.user.kycStatus === 'VERIFIED' || session.user.kycStatus === 'APPROVED',
      isKycVerified: session.user.kycStatus === 'VERIFIED' || session.user.kycStatus === 'APPROVED',
      emailVerified: session.user.isEmailVerified
    }

    await prisma.session.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() }
    })

  } catch (error: any) {
    console.error('❌ Auth error:', error)
    return reply.code(401).send({
      success: false,
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    })
  }
}

// Аутентификация обычного пользователя (LEGACY с обработкой истечения)
export async function authenticateToken(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization
    console.log('🔐 Auth header:', authHeader ? 'Present' : 'Missing')
    
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      console.log('❌ No token found in request to', request.url)
      return reply.code(401).send({ 
        error: 'Access token required',
        code: 'NO_TOKEN'
      })
    }

    console.log('🔑 Verifying token for URL:', request.url)
    
    let decoded
    try {
      decoded = JWTUtils.verifyAccessToken(token)
    } catch (jwtError: any) {
      console.error('❌ JWT verification failed:', jwtError.message)
      
      if (jwtError.message.includes('expired') || jwtError.name === 'TokenExpiredError') {
        return reply.code(401).send({ 
          error: 'Token expired',
          code: 'TOKEN_EXPIRED'
        })
      }
      
      return reply.code(401).send({ 
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      })
    }
    
    console.log('✅ Token decoded:', { userId: decoded.userId, type: decoded.type })
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      console.log('❌ User not found:', decoded.userId)
      return reply.code(401).send({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      })
    }

    console.log('✅ User authenticated:', user.email)
    
    request.currentUser = {
      id: user.id,
      email: user.email!,
      username: user.username || undefined,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      isEmailVerified: user.isEmailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      kycStatus: user.kycStatus,
      referralCode: user.referralCode || undefined,
      referredBy: user.referredBy || undefined,
      isActive: user.isActive,
      walletAddress: user.walletAddress || undefined,
      authMethod: user.authMethod,
      kycVerified: user.kycStatus === 'VERIFIED' || user.kycStatus === 'APPROVED',
      isKycVerified: user.kycStatus === 'VERIFIED' || user.kycStatus === 'APPROVED',
      emailVerified: user.isEmailVerified
    }

  } catch (error: any) {
    console.error('❌ Auth error for URL', request.url, ':', error.message)
    return reply.code(401).send({ 
      error: 'Invalid or expired token',
      code: 'AUTH_ERROR',
      details: error.message 
    })
  }
}

// Alias для authenticateToken
export async function authenticateUser(request: FastifyRequest, reply: FastifyReply) {
  console.log('📍 authenticateUser called for:', request.method, request.url)
  return authenticateToken(request, reply)
}

// Проверка верификации email
export async function requireEmailVerification(request: FastifyRequest, reply: FastifyReply) {
  if (!request.currentUser) {
    return reply.code(401).send({ error: 'Authentication required' })
  }

  if (!request.currentUser.emailVerified && !request.currentUser.isEmailVerified) {
    return reply.code(403).send({ 
      error: 'Email verification required',
      code: 'EMAIL_NOT_VERIFIED'
    })
  }
}

// Проверка KYC верификации
export async function requireKYCVerification(request: FastifyRequest, reply: FastifyReply) {
  if (!request.currentUser) {
    return reply.code(401).send({ error: 'Authentication required' })
  }

  const kycVerified = request.currentUser.kycVerified || 
                      request.currentUser.isKycVerified || 
                      request.currentUser.kycStatus === 'VERIFIED' ||
                      request.currentUser.kycStatus === 'APPROVED'

  if (!kycVerified) {
    return reply.code(403).send({ 
      error: 'KYC verification required',
      code: 'KYC_NOT_VERIFIED',
      kycStatus: request.currentUser.kycStatus || 'NOT_VERIFIED'
    })
  }
}

// Аутентификация администратора
export async function authenticateAdmin(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return reply.code(401).send({ 
        error: 'Admin access token required',
        code: 'NO_TOKEN'
      })
    }

    let decoded
    try {
      decoded = JWTUtils.verifyAdminAccessToken(token)
    } catch (jwtError: any) {
      if (jwtError.message.includes('expired') || jwtError.name === 'TokenExpiredError') {
        return reply.code(401).send({ 
          error: 'Admin token expired',
          code: 'TOKEN_EXPIRED'
        })
      }
      
      return reply.code(401).send({ 
        error: 'Invalid admin token',
        code: 'INVALID_TOKEN'
      })
    }
    
    if (decoded.type !== 'access') {
      return reply.code(401).send({ error: 'Invalid token type' })
    }

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId, isActive: true }
    })

    if (!admin) {
      return reply.code(401).send({ error: 'Admin not found or inactive' })
    }

    const session = await prisma.adminSession.findFirst({
      where: {
        token,
        adminId: admin.id,
        isActive: true,
        expiresAt: { gt: new Date() }
      }
    })

    if (!session) {
      return reply.code(401).send({ 
        error: 'Session expired or invalid',
        code: 'SESSION_EXPIRED'
      })
    }

    await prisma.adminSession.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() }
    })

    request.currentAdmin = {
      id: admin.id,
      telegramId: admin.telegramId,
      username: admin.username || undefined,
      firstName: admin.firstName || undefined,
      lastName: admin.lastName || undefined,
      role: admin.role,
      isActive: admin.isActive
    }

  } catch (error) {
    return reply.code(401).send({ 
      error: 'Invalid or expired admin token',
      code: 'AUTH_ERROR'
    })
  }
}

// Проверка роли супер-админа
export async function requireSuperAdmin(request: FastifyRequest, reply: FastifyReply) {
  if (request.currentAdmin?.role !== 'SUPER_ADMIN') {
    return reply.code(403).send({ 
      error: 'Super admin access required',
      code: 'INSUFFICIENT_PERMISSIONS'
    })
  }
}