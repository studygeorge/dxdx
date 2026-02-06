// backend/src/routes/auth.routes.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { AuthController } from '../controllers/auth.controller'
import { authenticateToken } from '../middleware/auth.middleware'
import { sendWelcomeEmail } from '../services/emailService'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
const ACCESS_TOKEN_EXPIRY = '365d'
const REFRESH_TOKEN_EXPIRY = '365d'
const BOT_SECRET = process.env.BOT_SECRET || 'your-bot-secret-key'

// ============== TYPE DEFINITIONS ==============

interface RegisterRequestBody {
  email: string
  password: string
  name: string
  username?: string
  firstName?: string
  lastName?: string
  phoneNumber: string
  referralCode?: string
  telegramId?: string
  telegramUsername?: string
  telegramFirstName?: string
  telegramLastName?: string
  telegramPhotoUrl?: string
  telegramAuthDate?: string | number | Date
  language?: string
}

interface TelegramLoginRequestBody {
  telegramId: string
}

interface BotTokenRequestBody {
  userId: string
  botSecret: string
}

interface UpdateProfileBody {
  firstName?: string
  lastName?: string
  username?: string
  phoneNumber?: string
}

interface DeleteSessionParams {
  sessionId: string
}

interface DeleteAllSessionsBody {
  currentRefreshToken: string
}

interface ReportSuspiciousActivityBody {
  sessionId?: string
  description: string
}

// ============== ROUTES ==============

export default async function authRoutes(fastify: FastifyInstance) {
  // ==================== PUBLIC ROUTES ====================
  
  /**
   * POST /api/v1/auth/register
   * Регистрация нового пользователя + отправка Welcome Email
   */
  fastify.post<{ Body: RegisterRequestBody }>('/register', async (request, reply) => {
    try {
      const { email, name, username, language = 'en' } = request.body
      const result = await AuthController.register(request, reply)

      if (reply.sent && email) {
        setImmediate(async () => {
          try {
            const displayName = name || username || email.split('@')[0]
            const emailResult = await sendWelcomeEmail(email, displayName, language)
            
            if (!emailResult.success) {
              console.warn('Welcome email failed, but registration succeeded:', emailResult.error)
            } else {
              console.log('Welcome email sent successfully to:', email)
            }
          } catch (emailError) {
            console.error('Email error (non-critical):', emailError)
          }
        })
      }

      return result
    } catch (error: any) {
      if (!reply.sent) {
        console.error('Registration error:', error)
        return reply.code(400).send({
          success: false,
          error: error.message
        })
      }
    }
  })
  
  /**
   * POST /api/v1/auth/login
   * Авторизация пользователя
   */
  fastify.post('/login', AuthController.login)

  /**
   * POST /api/v1/auth/telegram-login
   * Автологин по Telegram ID для бота
   */
  fastify.post<{ Body: TelegramLoginRequestBody }>('/telegram-login', async (request, reply) => {
    try {
      const { telegramId } = request.body

      if (!telegramId) {
        return reply.code(400).send({
          success: false,
          error: 'Telegram ID is required'
        })
      }

      console.log(`Attempting Telegram auto-login for ID: ${telegramId}`)

      const user = await request.server.prisma.user.findUnique({
        where: { telegramId: telegramId },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          isEmailVerified: true,
          kycStatus: true,
          isActive: true,
          telegramId: true,
          telegramUsername: true,
          referralCode: true,
          walletAddress: true
        }
      })

      if (!user) {
        console.log(`Telegram ID ${telegramId} not found in database`)
        return reply.code(404).send({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        })
      }

      if (!user.isActive) {
        console.log(`User ${user.id} is deactivated`)
        return reply.code(403).send({
          success: false,
          error: 'Account is deactivated'
        })
      }

      console.log(`User found: ${user.email} (${user.id})`)

      const accessToken = jwt.sign(
        { 
          userId: user.id,
          email: user.email
        },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
      )

      const refreshToken = jwt.sign(
        { userId: user.id },
        JWT_REFRESH_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
      )

      const clientIP = request.ip || request.socket.remoteAddress || 'unknown'
      const userAgent = request.headers['user-agent'] || 'Telegram Bot'

      const session = await request.server.prisma.session.create({
        data: {
          userId: user.id,
          token: accessToken,
          refreshToken: refreshToken,
          ipAddress: clientIP,
          userAgent: userAgent,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          lastUsedAt: new Date()
        }
      })

      console.log(`Telegram auto-login successful for user ${user.id}`)

      await request.server.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'TELEGRAM_LOGIN',
          resource: 'auth',
          ipAddress: clientIP,
          userAgent: userAgent,
          success: true
        }
      })

      return reply.send({
        success: true,
        message: 'Telegram login successful',
        access_token: accessToken,
        refresh_token: refreshToken,
        user: user,
        session: {
          id: session.id,
          expiresAt: session.expiresAt
        }
      })
    } catch (error: any) {
      console.error('Telegram login error:', error)
      return reply.code(500).send({
        success: false,
        error: 'Internal server error during Telegram login'
      })
    }
  })

  /**
   * POST /api/v1/auth/bot-token
   * Генерация временного токена для бота (внутренний эндпоинт)
   */
  fastify.post<{ Body: BotTokenRequestBody }>('/bot-token', async (request, reply) => {
    try {
      const { userId, botSecret } = request.body

      if (botSecret !== BOT_SECRET) {
        console.log('Invalid bot secret provided')
        return reply.code(401).send({
          success: false,
          error: 'Invalid bot secret'
        })
      }

      if (!userId) {
        return reply.code(400).send({
          success: false,
          error: 'User ID is required'
        })
      }

      const user = await request.server.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          isActive: true
        }
      })

      if (!user) {
        return reply.code(404).send({
          success: false,
          error: 'User not found'
        })
      }

      if (!user.isActive) {
        return reply.code(403).send({
          success: false,
          error: 'User account is deactivated'
        })
      }

      const accessToken = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          botGenerated: true
        },
        JWT_SECRET,
        { expiresIn: '1h' }
      )

      const refreshToken = jwt.sign(
        { userId: user.id },
        JWT_REFRESH_SECRET,
        { expiresIn: '365d' }
      )

      const session = await request.server.prisma.session.create({
        data: {
          userId: user.id,
          token: accessToken,
          refreshToken: refreshToken,
          sessionType: 'BOT',
          userAgent: 'Telegram Bot',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          lastUsedAt: new Date()
        }
      })

      console.log(`Bot token generated for user ${userId}`)

      return reply.send({
        success: true,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 3600,
        session: {
          id: session.id,
          expiresAt: session.expiresAt
        }
      })

    } catch (error: any) {
      console.error('Bot token generation error:', error)
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      })
    }
  })
  
  /**
   * POST /api/v1/auth/refresh
   * Обновление access токена через refresh токен
   */
  fastify.post('/refresh', AuthController.refreshToken)
  
  /**
   * POST /api/v1/auth/forgot-password
   * Запрос на сброс пароля
   */
  fastify.post('/forgot-password', AuthController.forgotPassword)
  
  /**
   * POST /api/v1/auth/reset-password
   * Сброс пароля по токену
   */
  fastify.post('/reset-password', AuthController.resetPassword)
  
  /**
   * POST /api/v1/auth/verify-email
   * Подтверждение email
   */
  fastify.post('/verify-email', AuthController.verifyEmail)
  
  /**
   * POST /api/v1/auth/resend-verification
   * Повторная отправка письма верификации
   */
  fastify.post('/resend-verification', AuthController.resendVerificationEmail)

  // ==================== PROTECTED ROUTES ====================
  
  /**
   * GET /api/v1/auth/me
   * Получение информации о текущем пользователе
   */
  fastify.get('/me', { 
    preHandler: [authenticateToken] 
  }, AuthController.getCurrentUser)
  
  /**
   * POST /api/v1/auth/logout
   * Выход из системы
   */
  fastify.post('/logout', { 
    preHandler: [authenticateToken] 
  }, AuthController.logout)
  
  /**
   * PUT /api/v1/auth/profile
   * Обновление профиля пользователя
   */
  fastify.put<{ Body: UpdateProfileBody }>('/profile', { 
    preHandler: [authenticateToken] 
  }, AuthController.updateProfile)
  
  /**
   * POST /api/v1/auth/change-password
   * Смена пароля
   */
  fastify.post('/change-password', { 
    preHandler: [authenticateToken] 
  }, AuthController.changePassword)

  // ==================== 2FA ROUTES ====================
  
  /**
   * POST /api/v1/auth/2fa/setup
   * Настройка двухфакторной аутентификации
   */
  fastify.post('/2fa/setup', { 
    preHandler: [authenticateToken] 
  }, AuthController.setup2FA)
  
  /**
   * POST /api/v1/auth/2fa/confirm
   * Подтверждение настройки 2FA
   */
  fastify.post('/2fa/confirm', { 
    preHandler: [authenticateToken] 
  }, AuthController.confirm2FA)
  
  /**
   * POST /api/v1/auth/2fa/disable
   * Отключение 2FA
   */
  fastify.post('/2fa/disable', { 
    preHandler: [authenticateToken] 
  }, AuthController.disable2FA)
  
  /**
   * POST /api/v1/auth/2fa/verify
   * Верификация 2FA кода при логине
   */
  fastify.post('/2fa/verify', AuthController.verify2FA)
  
  // ==================== REFERRAL ROUTES ====================
  
  /**
   * GET /api/v1/auth/referral-stats
   * Получение статистики по реферальной программе
   */
  fastify.get('/referral-stats', { 
    preHandler: [authenticateToken] 
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).currentUser!.id
      const stats = await AuthController.getReferralStats(userId)
      
      return reply.send({
        success: true,
        data: stats
      })
    } catch (error: any) {
      console.error('Error fetching referral stats:', error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch referral stats'
      })
    }
  })

  // ==================== SESSION MANAGEMENT ====================
  
  /**
   * GET /api/v1/auth/sessions
   * Получение списка всех активных сессий пользователя
   */
  fastify.get('/sessions', { 
    preHandler: [authenticateToken] 
  }, AuthController.getUserSessions)
  
  /**
   * DELETE /api/v1/auth/sessions/:sessionId
   * Удаление конкретной сессии по ID
   */
  fastify.delete<{ Params: DeleteSessionParams }>('/sessions/:sessionId', { 
    preHandler: [authenticateToken] 
  }, AuthController.deleteSession)
  
  /**
   * DELETE /api/v1/auth/sessions
   * Удаление всех сессий кроме текущей
   */
  fastify.delete<{ Body: DeleteAllSessionsBody }>('/sessions', { 
    preHandler: [authenticateToken] 
  }, AuthController.deleteAllSessionsExceptCurrent)

  // ==================== VERIFICATION & SECURITY ====================
  
  /**
   * GET /api/v1/auth/verify-kyc-status
   * Проверка статуса KYC верификации пользователя
   */
  fastify.get('/verify-kyc-status', { 
    preHandler: [authenticateToken] 
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).currentUser!.id
      
      const user = await request.server.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          kycStatus: true,
          kycPhotoUrl: true,
          kycSubmittedAt: true,
          kycRejectionReason: true
        }
      })

      if (!user) {
        return reply.code(404).send({
          success: false,
          error: 'User not found'
        })
      }

      return reply.send({
        success: true,
        data: {
          kycStatus: user.kycStatus,
          hasDocument: !!user.kycPhotoUrl,
          kycPhotoUrl: user.kycPhotoUrl,
          kycSubmittedAt: user.kycSubmittedAt,
          kycRejectionReason: user.kycRejectionReason
        }
      })
    } catch (error: any) {
      console.error('Error checking KYC status:', error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to check KYC status'
      })
    }
  })

  /**
   * GET /api/v1/auth/verify-email-status
   * Проверка статуса верификации email
   */
  fastify.get('/verify-email-status', { 
    preHandler: [authenticateToken] 
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).currentUser!.id
      
      const user = await request.server.prisma.user.findUnique({
        where: { id: userId },
        select: {
          isEmailVerified: true,
          email: true
        }
      })

      if (!user) {
        return reply.code(404).send({
          success: false,
          error: 'User not found'
        })
      }

      return reply.send({
        success: true,
        data: {
          isEmailVerified: user.isEmailVerified,
          email: user.email
        }
      })
    } catch (error: any) {
      console.error('Error checking email verification status:', error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to check email verification status'
      })
    }
  })

  /**
   * GET /api/v1/auth/security-log
   * Получение истории безопасности (последние 50 событий)
   */
  fastify.get('/security-log', { 
    preHandler: [authenticateToken] 
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).currentUser!.id
      
      const logs = await request.server.prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          action: true,
          resource: true,
          ipAddress: true,
          userAgent: true,
          success: true,
          createdAt: true
        }
      })

      return reply.send({
        success: true,
        data: logs
      })
    } catch (error: any) {
      console.error('Error fetching security log:', error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch security log'
      })
    }
  })

  /**
   * POST /api/v1/auth/report-suspicious-activity
   * Отчет о подозрительной активности в аккаунте
   */
  fastify.post<{ Body: ReportSuspiciousActivityBody }>('/report-suspicious-activity', { 
    preHandler: [authenticateToken] 
  }, async (request, reply) => {
    try {
      const userId = (request as any).currentUser!.id
      const { sessionId, description } = request.body

      await request.server.prisma.auditLog.create({
        data: {
          userId,
          action: 'SUSPICIOUS_ACTIVITY_REPORTED',
          resource: sessionId ? `session:${sessionId}` : 'general',
          details: description,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          success: true
        }
      })

      if (sessionId) {
        await request.server.prisma.session.updateMany({
          where: { 
            id: sessionId,
            userId 
          },
          data: { 
            isActive: false,
            lastUsedAt: new Date()
          }
        })
      }

      return reply.send({
        success: true,
        message: 'Suspicious activity reported successfully'
      })
    } catch (error: any) {
      console.error('Error reporting suspicious activity:', error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to report suspicious activity'
      })
    }
  })

  // ==================== HEALTH CHECK ====================
  
  /**
   * GET /api/v1/auth/health
   * Проверка работоспособности auth сервиса
   */
  fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.server.prisma.$queryRaw`SELECT 1`

      return reply.send({
        success: true,
        message: 'Auth service is healthy',
        timestamp: new Date().toISOString()
      })
    } catch (error: any) {
      console.error('Health check failed:', error)
      return reply.code(503).send({
        success: false,
        error: 'Service unavailable'
      })
    }
  })
}