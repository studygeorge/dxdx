import { FastifyInstance } from 'fastify'
import { authenticateUser } from '../../middleware/auth.middleware'
import { createInvestmentRoutes } from './create.routes'
import { paymentRoutes } from './payment.routes'
import { upgradeRoutes } from './upgrade.routes'
import { withdrawalRoutes } from './withdrawal.routes'
import { listRoutes } from './list.routes'
import { reinvestRoutes } from './reinvest.routes'  


export async function investmentsRoutes(app: FastifyInstance) {
  // Apply authentication middleware to all routes
  app.addHook('onRequest', authenticateUser)

  // Register all sub-routes
  await createInvestmentRoutes(app)
  await paymentRoutes(app)
  await upgradeRoutes(app)
  await withdrawalRoutes(app)
  await listRoutes(app)
  await reinvestRoutes(app)
}
