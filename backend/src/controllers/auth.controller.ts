import { FastifyRequest, FastifyReply } from 'fastify'
import { AuthService } from '../services/auth.service'
import { RegisterData, LoginData } from '../types'
import jwt from 'jsonwebtoken'
import { sendWelcomeEmail } from '../services/emailService'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'

// ✅ ТОКЕНЫ НА 1 ГОД
const ACCESS_TOKEN_EXPIRY = '365d'   // 365 дней
const REFRESH_TOKEN_EXPIRY = '365d'  // 365 дней

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
  language?: string // Добавляем поддержку языка
}

export class AuthController {
  static async register(
    request: FastifyRequest<{ Body: RegisterRequestBody }>, 
    reply: FastifyReply
  ) {
    try {
      const clientIP = request.ip || request.socket.remoteAddress
      
      if (!request.body.telegramId) {
        return reply.code(400).send({
          success: false,
          error: 'Telegram account connection is required'
        })
      }

      if (!request.body.phoneNumber) {
        return reply.code(400).send({
          success: false,
          error: 'Phone number is required'
        })
      }

      console.log('📝 Registration request with Telegram and phone:', {
        email: request.body.email,
        name: request.body.name,
        phoneNumber: request.body.phoneNumber,
        telegramId: request.body.telegramId,
        telegramUsername: request.body.telegramUsername
      })

      // ✅ РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЯ
      const result = await AuthService.register(request.body, clientIP)
      
      // ✅ ОТПРАВКА ПРИВЕТСТВЕННОГО ПИСЬМА
      try {
        // Определяем имя пользователя для письма
        const userName = request.body.firstName 
          || request.body.telegramFirstName 
          || request.body.name 
          || request.body.username 
          || 'Пользователь';
        
        // Определяем язык (по умолчанию русский)
        const userLanguage = request.body.language || 'ru';
        
        console.log('📧 Sending welcome email to:', {
          email: request.body.email,
          userName,
          language: userLanguage
        });

        const emailResult = await sendWelcomeEmail(
          request.body.email,
          userName,
          userLanguage
        );

        if (emailResult.success) {
          console.log('✅ Welcome email sent successfully:', {
            to: request.body.email,
            messageId: emailResult.messageId
          });
        } else {
          console.warn('⚠️ Welcome email failed (non-critical):', emailResult.error);
        }
      } catch (emailError: any) {
        // Ошибка отправки email не должна прерывать регистрацию
        console.error('⚠️ Failed to send welcome email (non-critical):', {
          error: emailError.message,
          email: request.body.email
        });
      }
      
      return reply.code(201).send({
        success: true,
        message: 'User registered successfully with Telegram account',
        data: result.user,
        emailVerifyToken: result.emailVerifyToken
      })
    } catch (error: any) {
      console.error('❌ Registration error:', error)
      return reply.code(400).send({
        success: false,
        error: error.message
      })
    }
  }

  static async login(
    request: FastifyRequest<{ Body: LoginData }>, 
    reply: FastifyReply
  ) {
    try {
      console.log('🔍 Login request body:', { 
        emailOrUsername: request.body.emailOrUsername, 
        password: '***' 
      })
      
      const clientIP = request.ip || request.socket.remoteAddress
      const userAgent = request.headers['user-agent']
      
      const result = await AuthService.login(request.body, clientIP, userAgent)
      
      console.log('✅ Login successful:', {
        userId: result.user.id,
        email: result.user.email,
        telegramId: result.user.telegramId,
        tokensGenerated: true
      })
      
      // ✅ Cookie тоже на 365 дней
      reply.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 365 * 24 * 60 * 60 * 1000 // 365 дней
      })
      
      return reply.send({
        success: true,
        message: 'Login successful',
        access_token: result.tokens.accessToken,
        refresh_token: result.tokens.refreshToken,
        user: result.user,
        session: result.session
      })
    } catch (error: any) {
      console.error('❌ Login error:', error.message)
      return reply.code(401).send({
        success: false,
        error: error.message
      })
    }
  }

  static async refreshToken(
    request: FastifyRequest<{ Body: { refreshToken?: string } }>, 
    reply: FastifyReply
  ) {
    try {
      const refreshToken = request.body.refreshToken || request.cookies.refreshToken
      
      if (!refreshToken) {
        return reply.code(401).send({
          success: false,
          error: 'Refresh token required'
        })
      }

      console.log('🔄 Attempting to refresh token...')

      let decoded: any
      try {
        decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET)
      } catch (error: any) {
        console.error('❌ Invalid refresh token:', error.message)
        return reply.code(401).send({
          success: false,
          error: 'Invalid or expired refresh token'
        })
      }

      const session = await request.server.prisma.session.findFirst({
        where: {
          userId: decoded.userId,
          refreshToken: refreshToken,
          isActive: true,
          expiresAt: {
            gt: new Date()
          }
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
              isEmailVerified: true,
              kycStatus: true,
              telegramId: true,
              telegramUsername: true
            }
          }
        }
      })

      if (!session) {
        console.error('❌ Session not found or expired')
        return reply.code(401).send({
          success: false,
          error: 'Session not found or expired'
        })
      }

      console.log('✅ Session found, generating new tokens...')

      // ✅ Новые токены на 365 дней
      const newAccessToken = jwt.sign(
        { 
          userId: session.userId,
          email: session.user.email
        },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY } // 365 дней
      )

      const newRefreshToken = jwt.sign(
        { userId: session.userId },
        JWT_REFRESH_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY } // 365 дней
      )

      // ✅ Обновляем сессию на 365 дней
      await request.server.prisma.session.update({
        where: { id: session.id },
        data: {
          refreshToken: newRefreshToken,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 365 дней
          lastUsedAt: new Date()
        }
      })

      console.log('✅ Tokens refreshed successfully')

      reply.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 365 * 24 * 60 * 60 * 1000 // 365 дней
      })

      return reply.send({
        success: true,
        message: 'Tokens refreshed successfully',
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        user: session.user
      })
    } catch (error: any) {
      console.error('❌ Refresh token error:', error)
      return reply.code(401).send({
        success: false,
        error: error.message || 'Failed to refresh token'
      })
    }
  }

  static async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization
      const token = authHeader && authHeader.split(' ')[1]
      
      if (token && request.server.prisma) {
        await request.server.prisma.session.updateMany({
          where: { 
            token, 
            isActive: true 
          },
          data: { 
            isActive: false,
            lastUsedAt: new Date()
          }
        })
      }

      const refreshToken = request.cookies.refreshToken
      if (refreshToken && request.server.prisma) {
        await request.server.prisma.session.updateMany({
          where: { 
            refreshToken,
            isActive: true 
          },
          data: { 
            isActive: false,
            lastUsedAt: new Date()
          }
        })
      }
      
      reply.clearCookie('refreshToken')
      
      return reply.send({
        success: true,
        message: 'Logout successful'
      })
    } catch (error: any) {
      console.error('❌ Logout error:', error)
      return reply.code(500).send({
        success: false,
        error: 'Logout failed'
      })
    }
  }

  static async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const currentUser = (request as any).currentUser
      
      if (!currentUser) {
        return reply.code(401).send({
          success: false,
          error: 'User not authenticated'
        })
      }

      const user = await request.server.prisma.user.findUnique({
        where: { id: currentUser.id },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          walletAddress: true,
          referralCode: true,
          isEmailVerified: true,
          kycStatus: true,
          isActive: true,
          createdAt: true,
          telegramId: true,
          telegramUsername: true,
          telegramFirstName: true,
          telegramLastName: true,
          telegramPhotoUrl: true
        }
      })

      return reply.send({
        success: true,
        data: user,
        user: user
      })
    } catch (error: any) {
      console.error('❌ Get current user error:', error)
      return reply.code(500).send({
        success: false,
        error: error.message
      })
    }
  }

  static async getUserSessions(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).currentUser?.id

      if (!userId) {
        return reply.code(401).send({
          success: false,
          error: 'User not authenticated'
        })
      }

      const sessions = await request.server.prisma.session.findMany({
        where: {
          userId,
          isActive: true,
          expiresAt: {
            gt: new Date()
          }
        },
        select: {
          id: true,
          ipAddress: true,
          userAgent: true,
          lastUsedAt: true,
          createdAt: true
        },
        orderBy: {
          lastUsedAt: 'desc'
        }
      })

      return reply.send({
        success: true,
        data: sessions
      })
    } catch (error: any) {
      console.error('❌ Get sessions error:', error)
      return reply.code(500).send({
        success: false,
        error: error.message
      })
    }
  }

  static async deleteSession(
    request: FastifyRequest<{ Params: { sessionId: string } }>, 
    reply: FastifyReply
  ) {
    try {
      const userId = (request as any).currentUser?.id
      const { sessionId } = request.params

      if (!userId) {
        return reply.code(401).send({
          success: false,
          error: 'User not authenticated'
        })
      }

      await request.server.prisma.session.updateMany({
        where: {
          id: sessionId,
          userId,
          isActive: true
        },
        data: {
          isActive: false,
          lastUsedAt: new Date()
        }
      })

      return reply.send({
        success: true,
        message: 'Session deleted successfully'
      })
    } catch (error: any) {
      console.error('❌ Delete session error:', error)
      return reply.code(500).send({
        success: false,
        error: error.message
      })
    }
  }

  static async deleteAllSessionsExceptCurrent(
    request: FastifyRequest<{ Body: { currentRefreshToken: string } }>,
    reply: FastifyReply
  ) {
    try {
      const userId = (request as any).currentUser?.id
      const { currentRefreshToken } = request.body

      if (!userId) {
        return reply.code(401).send({
          success: false,
          error: 'User not authenticated'
        })
      }

      await request.server.prisma.session.updateMany({
        where: {
          userId,
          refreshToken: {
            not: currentRefreshToken
          },
          isActive: true
        },
        data: {
          isActive: false,
          lastUsedAt: new Date()
        }
      })

      return reply.send({
        success: true,
        message: 'All other sessions deleted successfully'
      })
    } catch (error: any) {
      console.error('❌ Delete sessions error:', error)
      return reply.code(500).send({
        success: false,
        error: error.message
      })
    }
  }

  static async updateProfile(
    request: FastifyRequest<{ 
      Body: { 
        firstName?: string
        lastName?: string
        username?: string
        phoneNumber?: string
      } 
    }>, 
    reply: FastifyReply
  ) {
    try {
      const userId = (request as any).currentUser?.id
      const { firstName, lastName, username, phoneNumber } = request.body

      if (!userId) {
        return reply.code(401).send({
          success: false,
          error: 'User not authenticated'
        })
      }

      const updatedUser = await request.server.prisma.user.update({
        where: { id: userId },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(username && { username }),
          ...(phoneNumber && { phoneNumber })
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          walletAddress: true,
          telegramId: true,
          telegramUsername: true
        }
      })

      return reply.send({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      })
    } catch (error: any) {
      console.error('❌ Update profile error:', error)
      return reply.code(500).send({
        success: false,
        error: error.message
      })
    }
  }

  static async changePassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.send({
        success: true,
        message: 'Change password not implemented yet'
      })
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message
      })
    }
  }

  static async forgotPassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.send({
        success: true,
        message: 'Forgot password not implemented yet'
      })
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message
      })
    }
  }

  static async resetPassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.send({
        success: true,
        message: 'Reset password not implemented yet'
      })
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message
      })
    }
  }

  static async getReferralStats(userId: string) {
    return await AuthService.getReferralStats(userId)
  }

  static async verifyEmail(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.send({
        success: true,
        message: 'Email verification not implemented yet'
      })
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message
      })
    }
  }

  static async resendVerificationEmail(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.send({
        success: true,
        message: 'Resend verification not implemented yet'
      })
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message
      })
    }
  }

  static async setup2FA(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.send({
        success: true,
        message: '2FA setup not implemented yet'
      })
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message
      })
    }
  }

  static async confirm2FA(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.send({
        success: true,
        message: '2FA confirmation not implemented yet'
      })
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message
      })
    }
  }

  static async disable2FA(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.send({
        success: true,
        message: '2FA disable not implemented yet'
      })
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message
      })
    }
  }

  static async verify2FA(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.send({
        success: true,
        message: '2FA verification not implemented yet'
      })
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message
      })
    }
  }
}