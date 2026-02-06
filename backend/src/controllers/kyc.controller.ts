import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs/promises'
import { notifyKYCSubmission } from '../bot/telegram-bot'

const prisma = new PrismaClient()

// ✅ ПРАВИЛЬНЫЕ ПУТИ: относительно dist/ поднимаемся на 2 уровня вверх
const KYC_UPLOADS_DIR = path.resolve(__dirname, '../../uploads/kyc')
const KYC_VIDEOS_DIR = path.resolve(__dirname, '../../uploads/kyc/videos')

console.log('[KYC Controller] 📁 Uploads directory initialized:', KYC_UPLOADS_DIR)
console.log('[KYC Controller] 🎥 Videos directory initialized:', KYC_VIDEOS_DIR)

// ✅ KYC статусы как константы (соответствуют схеме Prisma)
const KYC_STATUS = {
  NOT_SUBMITTED: 'NOT_SUBMITTED',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
} as const

export class KYCController {
  /**
   * POST /api/v1/kyc/submit-photo
   * 🆕 Загрузка ФОТО через веб-камеру (первый шаг KYC)
   */
  static async submitPhoto(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).currentUser?.id

      if (!userId) {
        return reply.code(401).send({
          success: false,
          error: 'User not authenticated'
        })
      }

      console.log('📸 KYC photo submission request from user:', userId)

      // Получаем загруженный файл
      const data = await (request as any).file()

      if (!data) {
        return reply.code(400).send({
          success: false,
          error: 'No file uploaded'
        })
      }

      // Расширенная валидация: принимаем все форматы изображений
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/heic',
        'image/heif',
        'image/bmp',
        'image/tiff',
        'image/tif',
        'image/gif',
        'image/svg+xml',
        'image/x-icon',
        'image/vnd.microsoft.icon',
        'image/jfif',
        'image/pjpeg',
        'image/pjp'
      ]

      // Дополнительная проверка по расширению файла
      const fileExtension = data.filename.toLowerCase().split('.').pop()
      const allowedExtensions = [
        'jpg', 'jpeg', 'png', 'webp', 'heic', 'heif',
        'bmp', 'tiff', 'tif', 'gif', 'svg', 'ico', 'jfif'
      ]

      const isValidMimeType = allowedMimeTypes.includes(data.mimetype)
      const isValidExtension = fileExtension && allowedExtensions.includes(fileExtension)

      if (!isValidMimeType && !isValidExtension) {
        console.log(`❌ Invalid file type: ${data.mimetype}, extension: ${fileExtension}`)
        return reply.code(400).send({
          success: false,
          error: 'Invalid file type. Only image files are allowed (JPG, PNG, WebP, HEIC, BMP, TIFF, GIF, etc.)'
        })
      }

      // Проверяем размер файла (максимум 15MB)
      const fileBuffer = await data.toBuffer()
      const fileSizeInMB = fileBuffer.length / (1024 * 1024)
      
      if (fileSizeInMB > 15) {
        return reply.code(400).send({
          success: false,
          error: `File too large. Maximum size is 15MB. Your file: ${fileSizeInMB.toFixed(2)}MB`
        })
      }

      console.log(`📷 Photo received: ${data.filename}, Type: ${data.mimetype}, Size: ${fileSizeInMB.toFixed(2)}MB`)

      // Создаем уникальное имя файла
      const fileExtensionWithDot = path.extname(data.filename)
      const uniqueFileName = `kyc_photo_${userId}_${Date.now()}${fileExtensionWithDot}`
      
      const filePath = path.join(KYC_UPLOADS_DIR, uniqueFileName)

      console.log(`💾 Saving photo to: ${filePath}`)

      // Создаем директорию если её нет
      await fs.mkdir(KYC_UPLOADS_DIR, { recursive: true })

      // Сохраняем файл
      await fs.writeFile(filePath, fileBuffer)

      console.log(`✅ Photo saved: ${filePath}`)

      // Формируем URL для доступа к файлу
      const fileUrl = `/uploads/kyc/${uniqueFileName}`

      // 🆕 Извлекаем метаданные из запроса (если переданы)
      const fields = data.fields as any
      let photoMetadata = null

      if (fields?.metadata) {
        try {
          photoMetadata = typeof fields.metadata === 'string' 
            ? JSON.parse(fields.metadata.value) 
            : fields.metadata.value
          console.log('📊 Photo metadata received:', photoMetadata)
        } catch (err) {
          console.log('⚠️ Could not parse photo metadata:', err)
        }
      }

      // 🆕 Обновляем только поля ФОТО, НЕ меняем статус на PENDING
      // Статус изменится на PENDING только после загрузки видео
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          kycPhotoUrl: fileUrl,
          kycPhotoTakenAt: new Date(),
          kycPhotoMetadata: photoMetadata || undefined  // ✅ ИСПРАВЛЕНО
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          kycStatus: true,
          kycPhotoUrl: true,
          kycPhotoTakenAt: true,
          kycVideoUrl: true
        }
      })

      console.log(`✅ KYC photo uploaded for user ${user.email}`)

      return reply.code(200).send({
        success: true,
        message: 'KYC photo uploaded successfully. Please proceed to video recording.',
        data: {
          kycStatus: user.kycStatus,
          kycPhotoUrl: user.kycPhotoUrl,
          kycPhotoTakenAt: user.kycPhotoTakenAt,
          hasVideo: !!user.kycVideoUrl
        }
      })
    } catch (error: any) {
      console.error('❌ KYC photo submission error:', error)
      return reply.code(500).send({
        success: false,
        error: error.message || 'Failed to submit KYC photo'
      })
    }
  }

  /**
   * POST /api/v1/kyc/submit-video
   * 🆕 Загрузка ВИДЕО через веб-камеру (второй шаг KYC)
   */
  static async submitVideo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).currentUser?.id

      if (!userId) {
        return reply.code(401).send({
          success: false,
          error: 'User not authenticated'
        })
      }

      console.log('🎥 KYC video submission request from user:', userId)

      // Проверяем, что фото уже загружено
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          kycPhotoUrl: true,
          kycStatus: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true
        }
      })

      if (!currentUser?.kycPhotoUrl) {
        return reply.code(400).send({
          success: false,
          error: 'Please upload photo first before recording video'
        })
      }

      // Получаем загруженный файл
      const data = await (request as any).file()

      if (!data) {
        return reply.code(400).send({
          success: false,
          error: 'No video file uploaded'
        })
      }

      // Валидация видео форматов
      const allowedVideoMimeTypes = [
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-matroska'
      ]

      const videoExtension = data.filename.toLowerCase().split('.').pop()
      const allowedVideoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv']

      const isValidVideoMimeType = allowedVideoMimeTypes.includes(data.mimetype)
      const isValidVideoExtension = videoExtension && allowedVideoExtensions.includes(videoExtension)

      if (!isValidVideoMimeType && !isValidVideoExtension) {
        console.log(`❌ Invalid video type: ${data.mimetype}, extension: ${videoExtension}`)
        return reply.code(400).send({
          success: false,
          error: 'Invalid video format. Allowed formats: MP4, WebM, OGG, MOV'
        })
      }

      // Проверяем размер видео (максимум 50MB)
      const videoBuffer = await data.toBuffer()
      const videoSizeInMB = videoBuffer.length / (1024 * 1024)
      
      if (videoSizeInMB > 50) {
        return reply.code(400).send({
          success: false,
          error: `Video file too large. Maximum size is 50MB. Your file: ${videoSizeInMB.toFixed(2)}MB`
        })
      }

      console.log(`🎬 Video received: ${data.filename}, Type: ${data.mimetype}, Size: ${videoSizeInMB.toFixed(2)}MB`)

      // Создаем уникальное имя файла
      const videoExtensionWithDot = path.extname(data.filename)
      const uniqueVideoName = `kyc_video_${userId}_${Date.now()}${videoExtensionWithDot}`
      
      const videoPath = path.join(KYC_VIDEOS_DIR, uniqueVideoName)

      console.log(`💾 Saving video to: ${videoPath}`)

      // Создаем директорию если её нет
      await fs.mkdir(KYC_VIDEOS_DIR, { recursive: true })

      // Сохраняем файл
      await fs.writeFile(videoPath, videoBuffer)

      console.log(`✅ Video saved: ${videoPath}`)

      // Формируем URL для доступа к файлу
      const videoUrl = `/uploads/kyc/videos/${uniqueVideoName}`

      // 🆕 Извлекаем метаданные из запроса (если переданы)
      const fields = data.fields as any
      let videoMetadata = null

      if (fields?.metadata) {
        try {
          videoMetadata = typeof fields.metadata === 'string' 
            ? JSON.parse(fields.metadata.value) 
            : fields.metadata.value
          console.log('📊 Video metadata received:', videoMetadata)
        } catch (err) {
          console.log('⚠️ Could not parse video metadata:', err)
        }
      }

      // 🆕 Обновляем статус на PENDING после загрузки видео
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          kycStatus: KYC_STATUS.PENDING,
          kycVideoUrl: videoUrl,
          kycVideoTakenAt: new Date(),
          kycVideoMetadata: videoMetadata || undefined,  // ✅ ИСПРАВЛЕНО
          kycSubmittedAt: new Date(),
          kycRejectionReason: null
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          kycStatus: true,
          kycPhotoUrl: true,
          kycVideoUrl: true,
          kycSubmittedAt: true
        }
      })

      console.log(`✅ KYC video uploaded and status updated to PENDING for user ${user.email}`)

      // ✅ Отправляем уведомление админу в Telegram (ТОЛЬКО ФОТО, БЕЗ ВИДЕО)
      try {
        const API_BASE_URL = process.env.API_BASE_URL || 'https://dxcapital-ai.com'
        const photoUrl = `${API_BASE_URL}${user.kycPhotoUrl}`
        
        const userName = user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.username || user.email || 'User'

        const notificationResult = await notifyKYCSubmission({
          userId: user.id,
          userEmail: user.email || 'no-email',
          userName: userName,
          photoUrl: photoUrl,
          language: 'ru'
        })

        if (notificationResult.success) {
          console.log('✅ Telegram notification sent to admin for KYC submission')
        } else {
          console.error('❌ Failed to send Telegram notification:', notificationResult.error)
        }
      } catch (notificationError: any) {
        console.error('❌ Error sending Telegram notification:', notificationError.message)
      }

      return reply.code(200).send({
        success: true,
        message: 'KYC verification submitted successfully. Your documents are under review.',
        data: {
          kycStatus: user.kycStatus,
          kycPhotoUrl: user.kycPhotoUrl,
          kycVideoUrl: user.kycVideoUrl,
          kycSubmittedAt: user.kycSubmittedAt
        }
      })
    } catch (error: any) {
      console.error('❌ KYC video submission error:', error)
      return reply.code(500).send({
        success: false,
        error: error.message || 'Failed to submit KYC video'
      })
    }
  }

  /**
   * DELETE /api/v1/kyc/delete-files
   * 🆕 Удаление загруженных файлов (если пользователь хочет переснять)
   */
  static async deleteFiles(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).currentUser?.id

      if (!userId) {
        return reply.code(401).send({
          success: false,
          error: 'User not authenticated'
        })
      }

      console.log('🗑️ KYC files deletion request from user:', userId)

      // Получаем текущие файлы пользователя
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          kycPhotoUrl: true, 
          kycVideoUrl: true,
          kycStatus: true
        }
      })

      if (!user) {
        return reply.code(404).send({
          success: false,
          error: 'User not found'
        })
      }

      // Не разрешаем удаление если статус PENDING или APPROVED
      if (user.kycStatus === KYC_STATUS.PENDING || user.kycStatus === KYC_STATUS.APPROVED) {
        return reply.code(400).send({
          success: false,
          error: 'Cannot delete files while KYC is under review or approved'
        })
      }

      // Удаляем файлы с диска
      const deletedFiles: string[] = []

      if (user.kycPhotoUrl) {
        const photoFilename = user.kycPhotoUrl.split('/').pop()
        if (photoFilename) {
          const photoPath = path.join(KYC_UPLOADS_DIR, photoFilename)
          try {
            await fs.unlink(photoPath)
            deletedFiles.push('photo')
            console.log(`🗑️ Deleted photo: ${photoPath}`)
          } catch (err) {
            console.log('⚠️ Could not delete photo file:', err)
          }
        }
      }

      if (user.kycVideoUrl) {
        const videoFilename = user.kycVideoUrl.split('/').pop()
        if (videoFilename) {
          const videoPath = path.join(KYC_VIDEOS_DIR, videoFilename)
          try {
            await fs.unlink(videoPath)
            deletedFiles.push('video')
            console.log(`🗑️ Deleted video: ${videoPath}`)
          } catch (err) {
            console.log('⚠️ Could not delete video file:', err)
          }
        }
      }

      // Очищаем данные в БД
      await prisma.user.update({
        where: { id: userId },
        data: {
          kycPhotoUrl: null,
          kycVideoUrl: null,
          kycPhotoTakenAt: null,
          kycVideoTakenAt: null,
          kycPhotoMetadata: undefined,  // ✅ ИСПРАВЛЕНО
          kycVideoMetadata: undefined,  // ✅ ИСПРАВЛЕНО
          kycStatus: KYC_STATUS.NOT_SUBMITTED
        }
      })

      console.log(`✅ KYC files deleted for user ${userId}`)

      return reply.code(200).send({
        success: true,
        message: 'KYC files deleted successfully',
        data: {
          deletedFiles
        }
      })
    } catch (error: any) {
      console.error('❌ KYC files deletion error:', error)
      return reply.code(500).send({
        success: false,
        error: error.message || 'Failed to delete KYC files'
      })
    }
  }

  /**
   * POST /api/v1/kyc/submit
   * ⚠️ DEPRECATED: Старый метод для обратной совместимости
   * Используйте /submit-photo и /submit-video вместо этого
   */
  static async submitKYC(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).currentUser?.id

      if (!userId) {
        return reply.code(401).send({
          success: false,
          error: 'User not authenticated'
        })
      }

      console.log('📤 [DEPRECATED] KYC submission request from user:', userId)

      // Получаем загруженный файл
      const data = await (request as any).file()

      if (!data) {
        return reply.code(400).send({
          success: false,
          error: 'No file uploaded'
        })
      }

      // Расширенная валидация: принимаем все форматы изображений
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/heic',
        'image/heif',
        'image/bmp',
        'image/tiff',
        'image/tif',
        'image/gif',
        'image/svg+xml',
        'image/x-icon',
        'image/vnd.microsoft.icon',
        'image/jfif',
        'image/pjpeg',
        'image/pjp'
      ]

      const fileExtension = data.filename.toLowerCase().split('.').pop()
      const allowedExtensions = [
        'jpg', 'jpeg', 'png', 'webp', 'heic', 'heif',
        'bmp', 'tiff', 'tif', 'gif', 'svg', 'ico', 'jfif'
      ]

      const isValidMimeType = allowedMimeTypes.includes(data.mimetype)
      const isValidExtension = fileExtension && allowedExtensions.includes(fileExtension)

      if (!isValidMimeType && !isValidExtension) {
        console.log(`❌ Invalid file type: ${data.mimetype}, extension: ${fileExtension}`)
        return reply.code(400).send({
          success: false,
          error: 'Invalid file type. Only image files are allowed (JPG, PNG, WebP, HEIC, BMP, TIFF, GIF, etc.)'
        })
      }

      const fileBuffer = await data.toBuffer()
      const fileSizeInMB = fileBuffer.length / (1024 * 1024)
      
      if (fileSizeInMB > 15) {
        return reply.code(400).send({
          success: false,
          error: `File too large. Maximum size is 15MB. Your file: ${fileSizeInMB.toFixed(2)}MB`
        })
      }

      console.log(`📷 File received: ${data.filename}, Type: ${data.mimetype}, Size: ${fileSizeInMB.toFixed(2)}MB`)

      const fileExtensionWithDot = path.extname(data.filename)
      const uniqueFileName = `kyc_${userId}_${Date.now()}${fileExtensionWithDot}`
      
      const filePath = path.join(KYC_UPLOADS_DIR, uniqueFileName)

      console.log(`💾 Saving file to: ${filePath}`)

      await fs.mkdir(KYC_UPLOADS_DIR, { recursive: true })
      await fs.writeFile(filePath, fileBuffer)

      console.log(`✅ File saved: ${filePath}`)

      const fileUrl = `/uploads/kyc/${uniqueFileName}`

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          kycStatus: KYC_STATUS.PENDING,
          kycPhotoUrl: fileUrl,
          kycSubmittedAt: new Date(),
          kycRejectionReason: null
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          kycStatus: true,
          kycPhotoUrl: true,
          kycSubmittedAt: true
        }
      })

      console.log(`✅ KYC status updated for user ${user.email}: PENDING`)

      try {
        const API_BASE_URL = process.env.API_BASE_URL || 'https://dxcapital-ai.com'
        const photoUrl = `${API_BASE_URL}${fileUrl}`
        
        const userName = user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.username || user.email || 'User'

        const notificationResult = await notifyKYCSubmission({
          userId: user.id,
          userEmail: user.email || 'no-email',
          userName: userName,
          photoUrl: photoUrl,
          language: 'ru'
        })

        if (notificationResult.success) {
          console.log('✅ Telegram notification sent to admin for KYC submission')
        } else {
          console.error('❌ Failed to send Telegram notification:', notificationResult.error)
        }
      } catch (notificationError: any) {
        console.error('❌ Error sending Telegram notification:', notificationError.message)
      }

      return reply.code(200).send({
        success: true,
        message: 'KYC document submitted successfully',
        data: {
          kycStatus: user.kycStatus,
          kycPhotoUrl: user.kycPhotoUrl,
          kycSubmittedAt: user.kycSubmittedAt
        }
      })
    } catch (error: any) {
      console.error('❌ KYC submission error:', error)
      return reply.code(500).send({
        success: false,
        error: error.message || 'Failed to submit KYC document'
      })
    }
  }

  /**
   * GET /api/v1/kyc/status
   * Проверка текущего статуса KYC пользователя
   */
  static async getKYCStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).currentUser?.id

      if (!userId) {
        return reply.code(401).send({
          success: false,
          error: 'User not authenticated'
        })
      }

      console.log('🔍 Getting KYC status for user:', userId)

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          kycStatus: true,
          kycPhotoUrl: true,
          kycVideoUrl: true,
          kycPhotoTakenAt: true,
          kycVideoTakenAt: true,
          kycSubmittedAt: true,
          kycProcessedAt: true,
          kycRejectionReason: true
        }
      })

      if (!user) {
        return reply.code(404).send({
          success: false,
          error: 'User not found'
        })
      }

      console.log('✅ KYC status retrieved:', {
        kycStatus: user.kycStatus,
        hasPhoto: !!user.kycPhotoUrl,
        hasVideo: !!user.kycVideoUrl
      })

      return reply.code(200).send({
        success: true,
        data: {
          kycStatus: user.kycStatus,
          kycPhotoUrl: user.kycPhotoUrl,
          kycVideoUrl: user.kycVideoUrl,
          kycPhotoTakenAt: user.kycPhotoTakenAt,
          kycVideoTakenAt: user.kycVideoTakenAt,
          kycSubmittedAt: user.kycSubmittedAt,
          kycProcessedAt: user.kycProcessedAt,
          kycRejectionReason: user.kycRejectionReason
        }
      })
    } catch (error: any) {
      console.error('❌ Get KYC status error:', error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to get KYC status'
      })
    }
  }

  /**
   * POST /api/v1/kyc/resubmit
   * Повторная отправка документа после отклонения
   */
  static async resubmitKYC(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).currentUser?.id

      if (!userId) {
        return reply.code(401).send({
          success: false,
          error: 'User not authenticated'
        })
      }

      // Проверяем текущий статус
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          kycStatus: true, 
          kycPhotoUrl: true,
          kycVideoUrl: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true
        }
      })

      if (currentUser?.kycStatus !== KYC_STATUS.REJECTED) {
        return reply.code(400).send({
          success: false,
          error: 'KYC resubmission is only allowed after rejection'
        })
      }

      console.log('🔄 KYC resubmission request from user:', userId)

      // Удаляем старые файлы если есть
      if (currentUser.kycPhotoUrl) {
        const filename = currentUser.kycPhotoUrl.split('/').pop()
        if (filename) {
          const oldFilePath = path.join(KYC_UPLOADS_DIR, filename)
          try {
            await fs.unlink(oldFilePath)
            console.log(`🗑️ Old KYC photo deleted: ${oldFilePath}`)
          } catch (err) {
            console.log('⚠️ Could not delete old photo:', err)
          }
        }
      }

      if (currentUser.kycVideoUrl) {
        const videoFilename = currentUser.kycVideoUrl.split('/').pop()
        if (videoFilename) {
          const oldVideoPath = path.join(KYC_VIDEOS_DIR, videoFilename)
          try {
            await fs.unlink(oldVideoPath)
            console.log(`🗑️ Old KYC video deleted: ${oldVideoPath}`)
          } catch (err) {
            console.log('⚠️ Could not delete old video:', err)
          }
        }
      }

      // Очищаем KYC данные в БД
      await prisma.user.update({
        where: { id: userId },
        data: {
          kycPhotoUrl: null,
          kycVideoUrl: null,
          kycPhotoTakenAt: null,
          kycVideoTakenAt: null,
          kycPhotoMetadata: undefined,  // ✅ ИСПРАВЛЕНО
          kycVideoMetadata: undefined,  // ✅ ИСПРАВЛЕНО
          kycStatus: KYC_STATUS.NOT_SUBMITTED,
          kycSubmittedAt: null,
          kycRejectionReason: null,
          kycProcessedAt: null,
          kycProcessedBy: null
        }
      })

      console.log(`✅ KYC data cleared for user ${currentUser.email}. User can now resubmit via camera capture.`)

      return reply.code(200).send({
        success: true,
        message: 'Previous KYC data cleared. Please submit new photo and video via camera capture.',
        data: {
          kycStatus: KYC_STATUS.NOT_SUBMITTED
        }
      })
    } catch (error: any) {
      console.error('❌ KYC resubmission error:', error)
      return reply.code(500).send({
        success: false,
        error: error.message || 'Failed to prepare resubmission'
      })
    }
  }

  /**
   * GET /api/v1/admin/kyc/pending
   * Получить список пользователей с KYC на проверке (ADMIN)
   */
  static async getPendingKYC(request: FastifyRequest, reply: FastifyReply) {
    try {
      const adminId = (request as any).currentAdmin?.id
      
      if (!adminId) {
        return reply.code(401).send({
          success: false,
          error: 'Admin authentication required'
        })
      }

      const pendingUsers = await prisma.user.findMany({
        where: {
          kycStatus: KYC_STATUS.PENDING
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          kycStatus: true,
          kycPhotoUrl: true,
          kycVideoUrl: true,
          kycPhotoTakenAt: true,
          kycVideoTakenAt: true,
          kycSubmittedAt: true
        },
        orderBy: {
          kycSubmittedAt: 'desc'
        }
      })

      console.log(`📋 Admin ${adminId} fetched ${pendingUsers.length} pending KYC submissions`)

      return reply.send({
        success: true,
        data: pendingUsers
      })
    } catch (error: any) {
      console.error('❌ Error fetching pending KYC:', error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch pending KYC submissions'
      })
    }
  }

  /**
   * POST /api/v1/admin/kyc/:userId/approve
   * Одобрить KYC пользователя (ADMIN)
   */
  static async approveKYC(request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
    try {
      const { userId } = request.params
      const adminId = (request as any).currentAdmin?.id

      if (!adminId) {
        return reply.code(401).send({
          success: false,
          error: 'Admin authentication required'
        })
      }

      console.log(`✅ Admin ${adminId} approving KYC for user ${userId}`)

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          kycStatus: KYC_STATUS.APPROVED,
          kycProcessedAt: new Date(),
          kycProcessedBy: adminId
        },
        select: {
          id: true,
          email: true,
          kycStatus: true
        }
      })

      console.log(`✅ KYC approved for user ${user.email}`)

      await prisma.adminAuditLog.create({
        data: {
          adminId: adminId,
          action: 'KYC_APPROVE',
          resource: 'KYC',
          details: `Approved KYC for user ${user.email} (${userId})`,
          success: true
        }
      })

      return reply.send({
        success: true,
        message: 'KYC approved successfully',
        data: {
          userId: user.id,
          email: user.email,
          kycStatus: user.kycStatus
        }
      })
    } catch (error: any) {
      console.error('❌ Error approving KYC:', error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to approve KYC'
      })
    }
  }

  /**
   * POST /api/v1/admin/kyc/:userId/reject
   * Отклонить KYC пользователя (ADMIN)
   */
  static async rejectKYC(request: FastifyRequest<{ 
    Params: { userId: string }
    Body: { reason?: string }
  }>, reply: FastifyReply) {
    try {
      const { userId } = request.params
      const { reason } = request.body
      const adminId = (request as any).currentAdmin?.id

      if (!adminId) {
        return reply.code(401).send({
          success: false,
          error: 'Admin authentication required'
        })
      }

      console.log(`❌ Admin ${adminId} rejecting KYC for user ${userId}`)

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          kycStatus: KYC_STATUS.REJECTED,
          kycProcessedAt: new Date(),
          kycProcessedBy: adminId,
          kycRejectionReason: reason || 'Document does not meet verification requirements'
        },
        select: {
          id: true,
          email: true,
          kycStatus: true,
          kycRejectionReason: true
        }
      })

      console.log(`❌ KYC rejected for user ${user.email}`)

      await prisma.adminAuditLog.create({
        data: {
          adminId: adminId,
          action: 'KYC_REJECT',
          resource: 'KYC',
          details: `Rejected KYC for user ${user.email} (${userId}). Reason: ${reason || 'Not specified'}`,
          success: true
        }
      })

      return reply.send({
        success: true,
        message: 'KYC rejected',
        data: {
          userId: user.id,
          email: user.email,
          kycStatus: user.kycStatus,
          reason: user.kycRejectionReason
        }
      })
    } catch (error: any) {
      console.error('❌ Error rejecting KYC:', error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to reject KYC'
      })
    }
  }
}