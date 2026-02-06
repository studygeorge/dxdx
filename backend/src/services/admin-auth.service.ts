import { PrismaClient } from '@prisma/client'
import { TelegramAuthData, AdminPayload } from '../types'
import { TelegramUtils } from '../utils/telegram'
import { JWTUtils } from '../utils/jwt'

const prisma = new PrismaClient()

export class AdminAuthService {
  /**
   * Авторизация админа через Telegram
   */
  static async loginWithTelegram(
    authData: TelegramAuthData,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Проверяем подлинность данных от Telegram
    const isValid = TelegramUtils.verifyTelegramAuth(authData)
    if (!isValid) {
      throw new Error('Invalid Telegram authentication data')
    }

    const telegramId = authData.id.toString()

    // Проверяем что это разрешенный админ
    const isAllowed = TelegramUtils.isAllowedAdmin(telegramId, authData.username)
    if (!isAllowed) {
      throw new Error('Access denied: You are not authorized as admin')
    }

    // Находим или создаем админа
    let admin = await prisma.admin.findUnique({
      where: { telegramId }
    })

    if (!admin) {
      // Создаем нового админа
      admin = await prisma.admin.create({
        data: {
          telegramId,
          username: authData.username,
          firstName: authData.first_name,
          lastName: authData.last_name,
          photoUrl: authData.photo_url,
          role: 'SUPER_ADMIN',
          lastLoginAt: new Date(),
          lastLoginIP: ipAddress
        }
      })

      // Логируем создание админа
      await prisma.adminAuditLog.create({
        data: {
          adminId: admin.id,
          action: 'ADMIN_CREATED',
          resource: 'ADMIN',
          details: `New admin created: ${authData.username || authData.first_name} (${telegramId})`,
          ipAddress,
          userAgent,
          success: true
        }
      })
    } else {
      // Обновляем существующего админа
      admin = await prisma.admin.update({
        where: { id: admin.id },
        data: {
          username: authData.username,
          firstName: authData.first_name,
          lastName: authData.last_name,
          photoUrl: authData.photo_url,
          lastLoginAt: new Date(),
          lastLoginIP: ipAddress
        }
      })
    }

    // Проверяем что админ активен
    if (!admin.isActive) {
      throw new Error('Admin account is deactivated')
    }

    // Генерируем токены
    const accessToken = JWTUtils.generateAdminAccessToken({
      adminId: admin.id,
      telegramId: admin.telegramId,
      role: admin.role
    })

    const refreshToken = JWTUtils.generateAdminRefreshToken({
      adminId: admin.id,
      telegramId: admin.telegramId,
      role: admin.role
    })

    // Создаем сессию
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 дней

    await prisma.adminSession.create({
      data: {
        adminId: admin.id,
        token: accessToken,
        refreshToken,
        userAgent,
        ipAddress,
        expiresAt,
        isActive: true
      }
    })

    // Логируем вход
    await prisma.adminAuditLog.create({
      data: {
        adminId: admin.id,
        action: 'ADMIN_LOGIN',
        resource: 'AUTH',
        details: `Admin logged in from IP: ${ipAddress}`,
        ipAddress,
        userAgent,
        success: true
      }
    })

    return {
      admin: {
        id: admin.id,
        telegramId: admin.telegramId,
        username: admin.username,
        firstName: admin.firstName,
        lastName: admin.lastName,
        photoUrl: admin.photoUrl,
        role: admin.role
      },
      accessToken,
      refreshToken,
      expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '1h'
    }
  }

  /**
   * Выход админа
   */
  static async logout(token: string) {
    const session = await prisma.adminSession.findUnique({
      where: { token }
    })

    if (!session) {
      throw new Error('Session not found')
    }

    // Деактивируем сессию
    await prisma.adminSession.update({
      where: { id: session.id },
      data: { isActive: false }
    })

    // Логируем выход
    await prisma.adminAuditLog.create({
      data: {
        adminId: session.adminId,
        action: 'ADMIN_LOGOUT',
        resource: 'AUTH',
        details: 'Admin logged out',
        success: true
      }
    })

    return { success: true }
  }

  /**
   * Обновление токенов
   */
  static async refreshTokens(refreshToken: string) {
    const decoded = JWTUtils.verifyAdminRefreshToken(refreshToken)

    const session = await prisma.adminSession.findFirst({
      where: {
        refreshToken,
        adminId: decoded.adminId,
        isActive: true,
        expiresAt: { gt: new Date() }
      },
      include: { admin: true }
    })

    if (!session) {
      throw new Error('Invalid or expired refresh token')
    }

    if (!session.admin.isActive) {
      throw new Error('Admin account is deactivated')
    }

    // Генерируем новые токены
    const newAccessToken = JWTUtils.generateAdminAccessToken({
      adminId: session.admin.id,
      telegramId: session.admin.telegramId,
      role: session.admin.role
    })

    const newRefreshToken = JWTUtils.generateAdminRefreshToken({
      adminId: session.admin.id,
      telegramId: session.admin.telegramId,
      role: session.admin.role
    })

    // Обновляем сессию
    await prisma.adminSession.update({
      where: { id: session.id },
      data: {
        token: newAccessToken,
        refreshToken: newRefreshToken,
        lastUsedAt: new Date()
      }
    })

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '1h'
    }
  }

  /**
   * Получение информации о текущем админе
   */
  static async getCurrentAdmin(adminId: string): Promise<AdminPayload> {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId, isActive: true }
    })

    if (!admin) {
      throw new Error('Admin not found')
    }

    return {
      id: admin.id,
      telegramId: admin.telegramId,
      username: admin.username || undefined,
      firstName: admin.firstName || undefined,
      lastName: admin.lastName || undefined,
      role: admin.role,
      isActive: admin.isActive
    }
  }
}
