import { FastifyInstance } from 'fastify'
import { authenticateAdmin } from '../../middleware/admin.middleware'
import {
  getTradingReports,
  getTradingStats,
  createTradingReport,
  updateTradingReport,
  deleteTradingReport
} from '../../controllers/admin/trading-reports.controller'

export default async function tradingReportsRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', authenticateAdmin)

  fastify.get('/stats', getTradingStats)
  fastify.get('/', getTradingReports)
  fastify.post('/', createTradingReport)
  fastify.put('/', updateTradingReport)
  fastify.delete('/:id', deleteTradingReport)
}
