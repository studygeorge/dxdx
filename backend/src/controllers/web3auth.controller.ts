import { FastifyRequest, FastifyReply } from 'fastify'
import { Web3AuthService } from '../services/web3auth.service'
import { Web3VerifyRequest } from '../types'

export class Web3AuthController {
  static async requestConnection(
    request: FastifyRequest<{ Body: { walletAddress: string } }>, 
    reply: FastifyReply
  ) {
    try {
      // ✅ ДОБАВЛЕНО: Подробное логирование для отладки
      console.log('📥 Web3 Connect Request:')
      console.log('  - Body:', JSON.stringify(request.body))
      console.log('  - walletAddress:', request.body?.walletAddress)
      console.log('  - Type:', typeof request.body?.walletAddress)
      console.log('  - Headers:', request.headers['content-type'])

      // ✅ ДОБАВЛЕНО: Валидация наличия body и walletAddress
      if (!request.body) {
        console.error('❌ Request body is missing')
        return reply.code(400).send({
          success: false,
          error: 'Request body is required'
        })
      }

      if (!request.body.walletAddress) {
        console.error('❌ walletAddress is missing in body')
        return reply.code(400).send({
          success: false,
          error: 'Wallet address is required in request body'
        })
      }

      if (typeof request.body.walletAddress !== 'string') {
        console.error('❌ walletAddress is not a string:', typeof request.body.walletAddress)
        return reply.code(400).send({
          success: false,
          error: 'Wallet address must be a string'
        })
      }

      const domain = process.env.DOMAIN || 'dxcapital-ai.com'
      console.log('🔄 Processing connection for:', request.body.walletAddress)
      
      const result = await Web3AuthService.requestConnection(
        request.body.walletAddress,
        domain
      )
      
      console.log('✅ Connection request successful')
      return reply.send({
        success: true,
        message: 'Please sign this message to authenticate',
        data: result
      })
    } catch (error: any) {
      console.error('❌ Web3 connection error:', error.message)
      console.error('   Stack:', error.stack)
      return reply.code(400).send({
        success: false,
        error: error.message || 'Failed to process connection request'
      })
    }
  }

  static async verifyAndLogin(
    request: FastifyRequest<{ Body: Web3VerifyRequest }>, 
    reply: FastifyReply
  ) {
    try {
      console.log('📥 Web3 Verify Request:')
      console.log('  - walletAddress:', request.body?.walletAddress)
      console.log('  - signature length:', request.body?.signature?.length)
      console.log('  - nonce:', request.body?.nonce)

      // ✅ ДОБАВЛЕНО: Валидация входных данных
      if (!request.body) {
        return reply.code(400).send({
          success: false,
          error: 'Request body is required'
        })
      }

      if (!request.body.walletAddress || !request.body.signature || !request.body.nonce) {
        return reply.code(400).send({
          success: false,
          error: 'Missing required fields: walletAddress, signature, and nonce are required'
        })
      }

      const clientIP = request.ip || request.socket.remoteAddress
      const result = await Web3AuthService.verifyAndLogin(request.body, clientIP)
      
      reply.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      
      console.log('✅ Web3 verification successful for:', request.body.walletAddress)
      
      return reply.send({
        success: true,
        message: 'Web3 authentication successful',
        access_token: result.tokens.accessToken,
        refresh_token: result.tokens.refreshToken,
        data: {
          user: result.user,
          session: result.session
        }
      })
    } catch (error: any) {
      console.error('❌ Web3 verification error:', error.message)
      console.error('   Stack:', error.stack)
      return reply.code(401).send({
        success: false,
        error: error.message || 'Verification failed'
      })
    }
  }

  static async connectAdditionalWallet(
    request: FastifyRequest<{ Body: { walletAddress: string; signature: string; nonce: string } }>, 
    reply: FastifyReply
  ) {
    try {
      if (!request.currentUser) {
        return reply.code(401).send({
          success: false,
          error: 'Authentication required'
        })
      }

      const userId = request.currentUser.id
      const result = await Web3AuthService.connectAdditionalWallet(
        userId,
        request.body.walletAddress,
        request.body.signature,
        request.body.nonce
      )
      
      return reply.send({
        success: true,
        message: 'Additional wallet connected successfully',
        data: result
      })
    } catch (error: any) {
      console.error('❌ Connect additional wallet error:', error.message)
      return reply.code(400).send({
        success: false,
        error: error.message || 'Failed to connect additional wallet'
      })
    }
  }

  static async getWalletInfo(
    request: FastifyRequest<{ Params: { address: string } }>, 
    reply: FastifyReply
  ) {
    try {
      const { address } = request.params
      
      if (!address) {
        return reply.code(400).send({
          success: false,
          error: 'Wallet address is required'
        })
      }

      const info = await Web3AuthService.getWalletInfo(address)
      
      return reply.send({
        success: true,
        data: info
      })
    } catch (error: any) {
      console.error('❌ Get wallet info error:', error.message)
      return reply.code(400).send({
        success: false,
        error: error.message || 'Failed to get wallet info'
      })
    }
  }

  static async getSupportedNetworks(request: FastifyRequest, reply: FastifyReply) {
    const networks = [
      {
        name: 'Ethereum',
        chainId: 1,
        symbol: 'ETH',
        rpcUrl: process.env.ETHEREUM_RPC_URL,
        isDefault: true
      },
      {
        name: 'Polygon',
        chainId: 137,
        symbol: 'MATIC',
        rpcUrl: process.env.POLYGON_RPC_URL,
        isDefault: false
      },
      {
        name: 'BSC',
        chainId: 56,
        symbol: 'BNB',
        rpcUrl: process.env.BSC_RPC_URL,
        isDefault: false
      }
    ]

    return reply.send({
      success: true,
      data: { networks }
    })
  }
}