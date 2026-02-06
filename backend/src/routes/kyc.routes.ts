import { FastifyInstance } from 'fastify'
import { KYCController } from '../controllers/kyc.controller'
import { authenticate } from '../middleware/auth.middleware'

export async function kycRoutes(fastify: FastifyInstance) {
  // ❌ УБРАЛИ: Регистрацию multipart (уже зарегистрировано глобально)
  // await fastify.register(require('@fastify/multipart'), { ... })

  // ===== USER ROUTES ONLY (требуют аутентификации пользователя) =====
  
  /**
   * POST /api/v1/kyc/submit-photo
   * 🆕 Загрузка ФОТО через веб-камеру (первый шаг)
   */
  fastify.post('/submit-photo', {
    preHandler: authenticate
  }, KYCController.submitPhoto)

  /**
   * POST /api/v1/kyc/submit-video
   * 🆕 Загрузка ВИДЕО через веб-камеру (второй шаг)
   */
  fastify.post('/submit-video', {
    preHandler: authenticate
  }, KYCController.submitVideo)

  /**
   * DELETE /api/v1/kyc/delete-files
   * 🆕 Удаление загруженных файлов (для переснятия)
   */
  fastify.delete('/delete-files', {
    preHandler: authenticate
  }, KYCController.deleteFiles)

  /**
   * POST /api/v1/kyc/submit
   * ⚠️ DEPRECATED: Старый метод (для обратной совместимости)
   */
  fastify.post('/submit', {
    preHandler: authenticate
  }, KYCController.submitKYC)

  /**
   * GET /api/v1/kyc/status
   * Получение текущего статуса KYC
   */
  fastify.get('/status', {
    preHandler: authenticate
  }, KYCController.getKYCStatus)

  /**
   * POST /api/v1/kyc/resubmit
   * Повторная отправка после отклонения
   */
  fastify.post('/resubmit', {
    preHandler: authenticate
  }, KYCController.resubmitKYC)
}