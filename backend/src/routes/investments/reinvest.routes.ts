import { FastifyInstance } from 'fastify'
import { ReinvestController } from '../../controllers/investments/reinvest.controller'

export async function reinvestRoutes(app: FastifyInstance) {
  // POST /investments/:id/reinvest - Реинвестировать прибыль
  app.post('/:id/reinvest', ReinvestController.reinvestProfit)

  // GET /investments/:id/reinvest/history - История реинвестирований
  app.get('/:id/reinvest/history', ReinvestController.getReinvestHistory)
}