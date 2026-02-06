import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import cookie from '@fastify/cookie'
import fastifyMultipart from '@fastify/multipart'
import path from 'path'
import fs from 'fs'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

import authRoutes from './routes/auth'
import web3AuthRoutes from './routes/web3auth'
import { adminRoutes } from './routes/admin.routes'
import { investmentsRoutes } from './routes/investments'  // ✅ ОБНОВЛЁН ИМПОРТ
import { telegramRoutes } from './routes/telegram.routes'
import { referralRoutes } from './routes/referral.routes'
import { kycRoutes } from './routes/kyc.routes'
import tradingReportsRoutes from './routes/admin/trading-reports.routes'
import publicTradingReportsRoutes from './routes/public-trading-reports.routes'
import { AdminTransactionsController } from './controllers/admin-transactions.controller'
import { authenticateAdmin } from './middleware/admin.middleware'

const prisma = new PrismaClient()

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

export async function build(opts = {}) {
  const app: FastifyInstance = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info'
    },
    bodyLimit: 52428800, // ✅ 50MB для видео
    requestTimeout: 180000, // ✅ 3 минуты
    connectionTimeout: 180000, // ✅ 3 минуты
    ignoreTrailingSlash: true,
    trustProxy: true,
    ...opts
  })

  app.decorate('prisma', prisma)

  await app.register(cookie, {
    secret: process.env.SESSION_SECRET,
    parseOptions: {}
  })

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://telegram.org"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:", "wss:"],
        frameSrc: ["'self'", "https://oauth.telegram.org"],
      },
    },
  })

  // ✅ CORS с поддержкой www и без www
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:4000',
    'https://dxcapital-ai.com',
    'https://www.dxcapital-ai.com'
  ]

  if (process.env.ALLOWED_ORIGINS) {
    allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(','))
  }

  await app.register(cors, {
    origin: (origin, cb) => {
      // Разрешаем запросы без origin (Postman, curl)
      if (!origin) {
        cb(null, true)
        return
      }
      
      // Проверяем разрешенные origins
      if (allowedOrigins.includes(origin)) {
        cb(null, true)
        return
      }
      
      // Разрешаем localhost в development
      if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
        cb(null, true)
        return
      }
      
      cb(new Error('Not allowed by CORS'), false)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Request-Id'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })

  await app.register(rateLimit, {
    max: async (request) => {
      const authHeader = request.headers.authorization
      const isAuthenticated = authHeader && authHeader.startsWith('Bearer ')
      
      if (isAuthenticated) {
        if (request.url.includes('/kyc/')) {
          return 50 // ✅ Лимит для KYC
        }
        if (request.url.includes('/auth/')) {
          return 100
        }
        if (request.url.includes('/investments/')) {
          return 100
        }
        if (request.url.includes('/referrals/')) {
          return 100
        }
        if (request.url.includes('/transactions')) {
          return 100
        }
        if (request.url.includes('/admin/trading-reports')) {
          return 100
        }
        if (request.url.includes('/trading-reports')) {
          return 200
        }
        return 200
      }
      
      // Публичные эндпоинты
      if (request.url.includes('/trading-reports')) {
        return 50
      }
      if (request.url.includes('/auth/')) {
        return 15
      }
      if (request.url.includes('/web3auth/')) {
        return 20
      }
      return 50
    },
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.'
    })
  })

  await app.register(jwt, {
    secret: process.env.JWT_SECRET!,
    sign: {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    }
  })

  // ✅ Multipart с увеличенными лимитами для видео
  await app.register(fastifyMultipart, {
    limits: {
      fieldNameSize: 100,
      fieldSize: 52428800, // 50MB
      fields: 10,
      fileSize: 52428800, // ✅ 50MB для видео
      files: 5,
      headerPairs: 2000
    }
  })

  // ✅ Создание директорий для загрузок
  const uploadsPath = '/home/dxcapai-backend/uploads'
  const kycPath = path.join(uploadsPath, 'kyc')
  const kycVideosPath = path.join(kycPath, 'videos')
  
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true })
  }
  if (!fs.existsSync(kycPath)) {
    fs.mkdirSync(kycPath, { recursive: true })
  }
  if (!fs.existsSync(kycVideosPath)) {
    fs.mkdirSync(kycVideosPath, { recursive: true })
  }

  const apiPrefix = process.env.API_PREFIX || '/api/v1'

  // ✅ Регистрация роутов
  console.log('[App] Registering routes...')
  
  await app.register(authRoutes, { prefix: `${apiPrefix}/auth` })
  console.log(`[App] ✅ Auth routes registered at ${apiPrefix}/auth`)
  
  await app.register(web3AuthRoutes, { prefix: `${apiPrefix}/web3auth` })
  console.log(`[App] ✅ Web3Auth routes registered at ${apiPrefix}/web3auth`)
  
  await app.register(adminRoutes, { prefix: `${apiPrefix}/admin` })
  console.log(`[App] ✅ Admin routes registered at ${apiPrefix}/admin`)
  
  await app.register(investmentsRoutes, { prefix: `${apiPrefix}/investments` })
  console.log(`[App] ✅ Investments routes registered at ${apiPrefix}/investments`)
  
  await app.register(telegramRoutes, { prefix: `${apiPrefix}/telegram` })
  console.log(`[App] ✅ Telegram routes registered at ${apiPrefix}/telegram`)
  
  await app.register(referralRoutes, { prefix: `${apiPrefix}/referrals` })
  console.log(`[App] ✅ Referral routes registered at ${apiPrefix}/referrals`)
  
  await app.register(kycRoutes, { prefix: `${apiPrefix}/kyc` })
  console.log(`[App] ✅ KYC routes registered at ${apiPrefix}/kyc`)
  
  await app.register(publicTradingReportsRoutes, { prefix: `${apiPrefix}/trading-reports` })
  console.log(`[App] ✅ Public trading reports routes registered at ${apiPrefix}/trading-reports`)
  
  await app.register(tradingReportsRoutes, { prefix: `${apiPrefix}/admin/trading-reports` })
  console.log(`[App] ✅ Admin trading reports routes registered at ${apiPrefix}/admin/trading-reports`)

  // ✅ Админские транзакции
  await app.register(async (adminTransactionsScope) => {
    adminTransactionsScope.addHook('preHandler', authenticateAdmin)
    console.log('[Admin Transactions Routes] Registering transaction routes...')
    adminTransactionsScope.get('/transactions', AdminTransactionsController.getTransactions)
    adminTransactionsScope.get('/transactions/stats', AdminTransactionsController.getTransactionStats)
    console.log('[Admin Transactions Routes] Transaction routes registered successfully')
  }, { prefix: `${apiPrefix}/admin` })

  // ✅ Health checks
  app.get('/health', async () => {
    try {
      await prisma.$queryRaw`SELECT 1`
      return { 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        database: 'connected'
      }
    } catch (error) {
      return { 
        status: 'error', 
        timestamp: new Date().toISOString(),
        database: 'disconnected'
      }
    }
  })

  app.get('/api/v1/health', async () => {
    try {
      await prisma.$queryRaw`SELECT 1`
      
      const uploadsExists = fs.existsSync(uploadsPath)
      const kycExists = fs.existsSync(kycPath)
      const videosExists = fs.existsSync(kycVideosPath)
      
      const fileCount = kycExists ? fs.readdirSync(kycPath).filter(f => !fs.statSync(path.join(kycPath, f)).isDirectory()).length : 0
      const videoCount = videosExists ? fs.readdirSync(kycVideosPath).length : 0
      
      return {
        status: 'ok',
        message: 'DXCAPAI Backend is healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        database: 'connected',
        telegram: {
          botActive: !!process.env.TELEGRAM_BOT_TOKEN,
          supportConfigured: !!process.env.SUPPORT_TELEGRAM_ID
        },
        kyc: {
          uploadsConfigured: true,
          uploadsPath: kycPath,
          uploadsExists: kycExists,
          fileCount: fileCount,
          videosPath: kycVideosPath,
          videosExists: videosExists,
          videoCount: videoCount,
          maxFileSize: '50MB'
        },
        tradingReports: {
          enabled: true,
          publicEndpoint: `${apiPrefix}/trading-reports`,
          adminEndpoint: `${apiPrefix}/admin/trading-reports`
        },
        routes: {
          investments: {
            modular: true,
            structure: 'split into create/payment/upgrade/withdrawal/list routes',
            prefix: `${apiPrefix}/investments`
          }
        }
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'Backend has issues',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        database: 'disconnected'
      }
    }
  })

  // ✅ Not Found handler
  app.setNotFoundHandler((request, reply) => {
    app.log.warn(`Route not found: ${request.method} ${request.url}`)
    reply.code(404).send({
      success: false,
      error: 'Route not found',
      method: request.method,
      url: request.url
    })
  })

  // ✅ Error handler
  app.setErrorHandler(async (error, request, reply) => {
    app.log.error({
      error: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method
    })
    
    if (process.env.NODE_ENV === 'production') {
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      })
    }
    
    return reply.code(500).send({
      success: false,
      error: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method
    })
  })

  // ✅ Graceful shutdown
  const gracefulShutdown = async () => {
    app.log.info('Shutting down gracefully...')
    await prisma.$disconnect()
    process.exit(0)
  }

  process.on('SIGTERM', gracefulShutdown)
  process.on('SIGINT', gracefulShutdown)

  console.log('[App] ✅ All routes registered successfully')
  console.log(`[App] 🚀 Server ready to start on ${process.env.HOST || '0.0.0.0'}:${process.env.PORT || 3001}`)

  return app
}
