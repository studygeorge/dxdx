import { FastifyRequest, FastifyReply } from 'fastify'
import { AdminAuthService } from '../services/admin-auth.service'
import { TelegramAuthData } from '../types'

// 🆕 ID админов без доступа к Settings
const SETTINGS_BLACKLIST = [ '7261521892', '8238308954', '8054184473', '8271509069', '7086860882']

// 🆕 ID админов без доступа к Reporting
const REPORTING_BLACKLIST = ['5525020749', '7261521892']

export class AdminAuthController {
  /**
   * POST /api/v1/admin/auth/telegram
   * Авторизация админа через Telegram
   */
  static async loginWithTelegram(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authData = request.body as TelegramAuthData
      const ipAddress = request.ip
      const userAgent = request.headers['user-agent']

      const result = await AdminAuthService.loginWithTelegram(
        authData,
        ipAddress,
        userAgent
      )

      // 🆕 Добавляем флаги доступа
      const telegramIdStr = String(authData.id)
      const hasSettingsAccess = !SETTINGS_BLACKLIST.includes(telegramIdStr)
      const hasReportingAccess = !REPORTING_BLACKLIST.includes(telegramIdStr)

      return reply.code(200).send({
        success: true,
        ...result,
        admin: {
          ...result.admin,
          hasSettingsAccess,
          hasReportingAccess
        }
      })
    } catch (error: any) {
      request.log.error(error)
      return reply.code(401).send({
        success: false,
        error: error.message || 'Telegram authentication failed'
      })
    }
  }

  /**
   * POST /api/v1/admin/auth/logout
   * Выход админа
   */
  static async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization
      const token = authHeader?.split(' ')[1]

      if (!token) {
        return reply.code(400).send({
          success: false,
          error: 'Token not provided'
        })
      }

      await AdminAuthService.logout(token)

      return reply.code(200).send({
        success: true,
        message: 'Logged out successfully'
      })
    } catch (error: any) {
      request.log.error(error)
      return reply.code(400).send({
        success: false,
        error: error.message || 'Logout failed'
      })
    }
  }

  /**
   * POST /api/v1/admin/auth/refresh
   * Обновление токенов
   */
  static async refreshTokens(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { refreshToken } = request.body as { refreshToken: string }

      if (!refreshToken) {
        return reply.code(400).send({
          success: false,
          error: 'Refresh token not provided'
        })
      }

      const result = await AdminAuthService.refreshTokens(refreshToken)

      return reply.code(200).send({
        success: true,
        ...result
      })
    } catch (error: any) {
      request.log.error(error)
      return reply.code(401).send({
        success: false,
        error: error.message || 'Token refresh failed'
      })
    }
  }

  /**
   * GET /api/v1/admin/auth/me
   * Получение информации о текущем админе
   */
  static async getCurrentAdmin(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.currentAdmin) {
        return reply.code(401).send({
          success: false,
          error: 'Not authenticated'
        })
      }

      const admin = await AdminAuthService.getCurrentAdmin(request.currentAdmin.id)

      // 🆕 Добавляем флаги доступа
      const telegramIdStr = String(admin.telegramId)
      const hasSettingsAccess = !SETTINGS_BLACKLIST.includes(telegramIdStr)
      const hasReportingAccess = !REPORTING_BLACKLIST.includes(telegramIdStr)

      return reply.code(200).send({
        success: true,
        admin: {
          ...admin,
          hasSettingsAccess,
          hasReportingAccess
        }
      })
    } catch (error: any) {
      request.log.error(error)
      return reply.code(400).send({
        success: false,
        error: error.message || 'Failed to get admin info'
      })
    }
  }
}