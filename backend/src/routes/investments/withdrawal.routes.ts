import { FastifyInstance } from 'fastify'
import { WithdrawalController } from '../../controllers/investments/withdrawal.controller'

export async function withdrawalRoutes(app: FastifyInstance) {
  // Early withdrawal
  app.post('/:id/early-withdraw', WithdrawalController.earlyWithdrawInvestment)

  // Partial withdrawal (profit or bonus)
  app.post('/:id/partial-withdraw', WithdrawalController.partialWithdrawInvestment)

  // Full withdrawal
  app.post('/:id/withdraw', WithdrawalController.requestWithdrawal)
}
