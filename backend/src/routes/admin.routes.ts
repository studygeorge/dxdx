import fs from 'fs'
import path from 'path'
import { FastifyInstance } from 'fastify'
import { AdminAuthController } from '../controllers/admin-auth.controller'
import { AdminUsersController } from '../controllers/admin-users.controller'
import { AdminInvestmentsController } from '../controllers/admin-investments.controller'
import { AdminSettingsController } from '../controllers/admin-settings.controller'
import { KYCController } from '../controllers/kyc.controller'
import { authenticateAdmin } from '../middleware/admin.middleware'

const UPLOADS_KYC_PHOTOS = path.resolve(__dirname, '../../uploads/kyc')
const UPLOADS_KYC_VIDEOS = path.resolve(__dirname, '../../uploads/kyc/videos')

export async function adminRoutes(app: FastifyInstance) {
  console.log('[Admin Routes] Starting registration...')
  console.log('[Admin Routes] KYC Photos directory:', UPLOADS_KYC_PHOTOS)
  console.log('[Admin Routes] KYC Videos directory:', UPLOADS_KYC_VIDEOS)

  // ==================== PUBLIC ROUTES ====================
  app.post('/auth/telegram', AdminAuthController.loginWithTelegram)
  app.post('/auth/refresh', AdminAuthController.refreshTokens)
  app.get('/settings/staking-plans/public', AdminSettingsController.getPublicStakingPlans)

  // ==================== KYC PHOTO ACCESS ====================
  app.get('/kyc/photo/:filename', {
    preHandler: authenticateAdmin
  }, async (request, reply) => {
    console.log('[KYC Photo] REQUEST RECEIVED')
    console.log('[KYC Photo] Admin:', (request as any).currentAdmin?.email)
    console.log('[KYC Photo] Params:', request.params)
    
    const filename = (request.params as any).filename
    const filePath = path.join(UPLOADS_KYC_PHOTOS, filename)

    console.log('[KYC Photo] Looking for file:', filePath)
    console.log('[KYC Photo] File exists:', fs.existsSync(filePath))

    if (!fs.existsSync(filePath)) {
      console.error('[KYC Photo] File not found')
      return reply.code(404).send({ 
        success: false,
        error: 'File not found',
        path: filePath 
      })
    }

    const normalizedPath = path.normalize(filePath)
    const baseDir = path.normalize(UPLOADS_KYC_PHOTOS)

    if (!normalizedPath.startsWith(baseDir)) {
      console.error('[KYC Photo] Security: Path traversal attempt blocked')
      return reply.code(403).send({ 
        success: false,
        error: 'Access denied' 
      })
    }

    const ext = path.extname(filename).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.heic': 'image/heic',
      '.heif': 'image/heif',
      '.bmp': 'image/bmp',
      '.tiff': 'image/tiff',
      '.svg': 'image/svg+xml',
      '.jfif': 'image/jpeg'
    }
    const mimeType = mimeTypes[ext] || 'application/octet-stream'

    console.log('[KYC Photo] Sending file, mime:', mimeType)

    try {
      const fileStream = fs.createReadStream(filePath)

      fileStream.on('error', (error) => {
        console.error('[KYC Photo] Stream error:', error)
        if (!reply.sent) {
          reply.code(500).send({ 
            success: false,
            error: 'Failed to read file' 
          })
        }
      })

      return reply
        .type(mimeType)
        .header('Cache-Control', 'private, max-age=3600')
        .header('Content-Disposition', `inline; filename="${filename}"`)
        .send(fileStream)
    } catch (error) {
      console.error('[KYC Photo] Error sending file:', error)
      return reply.code(500).send({ 
        success: false,
        error: 'Failed to send file' 
      })
    }
  })

  console.log('[Admin Routes] KYC photo route registered at /kyc/photo/:filename')

  // ==================== KYC VIDEO ACCESS ====================
  app.get('/kyc/video/:filename', {
    preHandler: authenticateAdmin
  }, async (request, reply) => {
    console.log('[KYC Video] REQUEST RECEIVED')
    console.log('[KYC Video] Admin:', (request as any).currentAdmin?.email)
    console.log('[KYC Video] Params:', request.params)
    
    const filename = (request.params as any).filename
    const filePath = path.join(UPLOADS_KYC_VIDEOS, filename)

    console.log('[KYC Video] Looking for file:', filePath)
    console.log('[KYC Video] File exists:', fs.existsSync(filePath))

    if (!fs.existsSync(filePath)) {
      console.error('[KYC Video] File not found')
      return reply.code(404).send({ 
        success: false,
        error: 'Video file not found',
        path: filePath 
      })
    }

    const normalizedPath = path.normalize(filePath)
    const baseDir = path.normalize(UPLOADS_KYC_VIDEOS)

    if (!normalizedPath.startsWith(baseDir)) {
      console.error('[KYC Video] Security: Path traversal attempt blocked')
      return reply.code(403).send({ 
        success: false,
        error: 'Access denied' 
      })
    }

    const ext = path.extname(filename).toLowerCase()
    const videoMimeTypes: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogg': 'video/ogg',
      '.ogv': 'video/ogg',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.wmv': 'video/x-ms-wmv',
      '.flv': 'video/x-flv',
      '.mkv': 'video/x-matroska'
    }
    const mimeType = videoMimeTypes[ext] || 'video/webm'

    console.log('[KYC Video] Sending video, mime:', mimeType)

    try {
      const stat = fs.statSync(filePath)
      const fileSize = stat.size
      const range = request.headers.range

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
        const chunksize = (end - start) + 1
        const fileStream = fs.createReadStream(filePath, { start, end })

        console.log(`[KYC Video] Range request: ${start}-${end}/${fileSize}`)

        return reply
          .code(206)
          .header('Content-Range', `bytes ${start}-${end}/${fileSize}`)
          .header('Accept-Ranges', 'bytes')
          .header('Content-Length', chunksize.toString())
          .header('Content-Type', mimeType)
          .header('Cache-Control', 'private, max-age=3600')
          .send(fileStream)
      } else {
        const fileStream = fs.createReadStream(filePath)

        fileStream.on('error', (error) => {
          console.error('[KYC Video] Stream error:', error)
          if (!reply.sent) {
            reply.code(500).send({ 
              success: false,
              error: 'Failed to read video file' 
            })
          }
        })

        return reply
          .type(mimeType)
          .header('Content-Length', fileSize.toString())
          .header('Accept-Ranges', 'bytes')
          .header('Cache-Control', 'private, max-age=3600')
          .header('Content-Disposition', `inline; filename="${filename}"`)
          .send(fileStream)
      }
    } catch (error) {
      console.error('[KYC Video] Error sending video:', error)
      return reply.code(500).send({ 
        success: false,
        error: 'Failed to send video file' 
      })
    }
  })

  console.log('[Admin Routes] KYC video route registered at /kyc/video/:filename')

  // ==================== PROTECTED ROUTES ====================
  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook('preHandler', authenticateAdmin)

    console.log('[Admin Routes] Registering protected routes...')

    // ===== AUTH =====
    protectedRoutes.post('/auth/logout', AdminAuthController.logout)
    protectedRoutes.get('/auth/me', AdminAuthController.getCurrentAdmin)

    // ===== DASHBOARD =====
    protectedRoutes.get('/dashboard/stats', AdminUsersController.getDashboardStats)

    // ===== USERS MANAGEMENT =====
    protectedRoutes.get('/users', AdminUsersController.getUsers)
    protectedRoutes.get('/users/stats', AdminUsersController.getUsersStats)
    protectedRoutes.get('/users/:id', AdminUsersController.getUserById)
    protectedRoutes.get('/users/:id/referral-tree', AdminUsersController.getUserReferralTree)
    protectedRoutes.put('/users/:id/status', AdminUsersController.updateUserStatus)
    protectedRoutes.put('/users/:id/assign-salesperson', AdminUsersController.assignSalesperson)
    protectedRoutes.put('/users/:id/update-referral-source', AdminUsersController.assignReferralSource)
    protectedRoutes.put('/users/:id/update-notes', AdminUsersController.updateUserNotes)

    // ===== INVESTMENTS MANAGEMENT =====
    protectedRoutes.get('/investments/stats', AdminInvestmentsController.getInvestmentsStats)
    protectedRoutes.get('/investments/user/:userId', AdminInvestmentsController.getUserInvestments)
    protectedRoutes.post('/investments/:id/simulate-time', AdminInvestmentsController.simulateTime)
    protectedRoutes.post('/investments/:id/simulate-action', AdminInvestmentsController.simulateAction)
    protectedRoutes.post('/investments/:id/reset', AdminInvestmentsController.resetInvestment)

    // ===== SETTINGS MANAGEMENT =====
    protectedRoutes.get('/settings', AdminSettingsController.getSettings)
    protectedRoutes.put('/settings/wallet', AdminSettingsController.updateWallet)
    protectedRoutes.post('/settings/staking-plan', AdminSettingsController.upsertStakingPlan)
    protectedRoutes.delete('/settings/staking-plan/:id', AdminSettingsController.deleteStakingPlan)

    // ===== STAKINGS MANAGEMENT =====
    protectedRoutes.get('/stakings', AdminSettingsController.getAllStakings)

    // ===== KYC MANAGEMENT =====
    protectedRoutes.get('/kyc/pending', KYCController.getPendingKYC)
    protectedRoutes.get('/kyc/stats', AdminUsersController.getKYCStats)
    protectedRoutes.post('/kyc/:userId/approve', KYCController.approveKYC)
    protectedRoutes.post('/kyc/:userId/reject', KYCController.rejectKYC)
    
    console.log('[Admin Routes] Protected routes registered')
  })

  console.log('[Admin Routes] All routes registered successfully')
}
