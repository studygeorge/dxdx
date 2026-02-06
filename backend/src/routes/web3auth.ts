import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { Web3AuthController } from '../controllers/web3auth.controller'
import { authenticateToken } from '../middleware/auth.middleware'

export default async function web3AuthRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Публичные Web3 роуты
  fastify.post('/connect', Web3AuthController.requestConnection)
  fastify.post('/verify', Web3AuthController.verifyAndLogin)
  fastify.get('/networks', Web3AuthController.getSupportedNetworks)
  fastify.get('/wallet/:address', Web3AuthController.getWalletInfo)
  
  // Защищенные Web3 роуты
  fastify.register(async (fastify) => {
    fastify.addHook('preHandler', authenticateToken)
    
    fastify.post('/wallet/connect', Web3AuthController.connectAdditionalWallet)
  })
}