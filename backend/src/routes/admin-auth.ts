import { FastifyInstance } from 'fastify'
import { AdminAuthController } from '../controllers/admin-auth.controller'
import { authenticateAdmin } from '../middleware/admin.middleware'

export default async function adminAuthRoutes(fastify: FastifyInstance) {
  // Авторизация через Telegram (публичный endpoint)
  fastify.post('/telegram', AdminAuthController.loginWithTelegram)

  // Обновление токенов (публичный endpoint)
  fastify.post('/refresh', AdminAuthController.refreshTokens)

  // Защищенные роуты (требуют авторизации)
  fastify.get('/me', { preHandler: [authenticateAdmin] }, AdminAuthController.getCurrentAdmin)
  fastify.post('/logout', { preHandler: [authenticateAdmin] }, AdminAuthController.logout)
}