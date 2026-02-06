import { FastifyInstance } from 'fastify'
import { InvestmentsController } from '../../controllers/investments'

export async function createInvestmentRoutes(app: FastifyInstance) {
  app.post('/create', InvestmentsController.createInvestment)
  app.delete('/:id', InvestmentsController.cancelInvestment)
}