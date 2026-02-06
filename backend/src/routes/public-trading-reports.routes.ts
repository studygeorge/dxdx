import { FastifyInstance } from 'fastify'
import {
  getPublicTradingReports,
  getPublicTradingStats
} from '../controllers/public-trading-reports.controller'

export default async function publicTradingReportsRoutes(fastify: FastifyInstance) {
  // Публичные эндпоинты без авторизации
  fastify.get('/stats', getPublicTradingStats)
  fastify.get('/', getPublicTradingReports)
}
