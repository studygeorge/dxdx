import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { InvestmentsController } from '../../controllers/investments'
import { sendInvestmentPaymentNotification } from './helpers/notifications.helper'

const prisma = new PrismaClient()

export async function paymentRoutes(app: FastifyInstance) {
  app.post('/:id/confirm', InvestmentsController.confirmPayment)

  app.post('/:investmentId/confirm-payment', async (request, reply) => {
    try {
      const { investmentId } = request.params as { investmentId: string }
      const userId = request.currentUser!.id

      const investment = await prisma.investment.findUnique({
        where: { id: investmentId },
        include: {
          user: { 
            select: { 
              id: true,
              username: true,
              email: true
            } 
          },
          plan: { select: { name: true } }
        }
      })

      if (!investment) {
        return reply.status(404).send({ 
          success: false,
          error: 'Investment not found' 
        })
      }

      if (investment.userId !== userId) {
        return reply.status(403).send({ 
          success: false,
          error: 'Access denied' 
        })
      }

      if (investment.status !== 'PENDING') {
        return reply.status(400).send({ 
          success: false,
          error: 'Investment is not in pending status' 
        })
      }

      const adminWalletConfig = await prisma.systemConfig.findUnique({
        where: { key: 'STAKING_WALLET_USDT_TRC20' }
      })

      const adminWallet = adminWalletConfig?.value || process.env.ADMIN_WALLET_ADDRESS || ''

      if (!adminWallet) {
        console.error('Admin wallet not configured')
        return reply.status(500).send({
          success: false,
          error: 'Admin wallet configuration missing'
        })
      }

      const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || process.env.SUPPORT_TELEGRAM_ID

      if (!ADMIN_CHAT_ID) {
        console.error('ADMIN_CHAT_ID or SUPPORT_TELEGRAM_ID not configured')
        return reply.status(500).send({
          success: false,
          error: 'Admin notification not configured'
        })
      }

      try {
        const { bot } = await import('../../bot/telegram-bot')
        await sendInvestmentPaymentNotification(bot, ADMIN_CHAT_ID, investment, investmentId, adminWallet)
        console.log('Telegram notification sent to admin for investment:', investmentId)
      } catch (telegramError) {
        console.error('Failed to send Telegram notification:', telegramError)
        return reply.status(500).send({
          success: false,
          error: 'Failed to notify administrator'
        })
      }

      await prisma.auditLog.create({
        data: {
          userId,
          action: 'PAYMENT_CONFIRMATION_SENT',
          resource: 'INVESTMENT',
          details: JSON.stringify({
            investmentId: investment.id,
            planName: investment.plan.name,
            amount: investment.amount.toString(),
            duration: investment.duration,
            userWalletAddress: investment.userWalletAddress,
            adminWalletAddress: adminWallet
          }),
          ipAddress: request.ip,
          success: true
        }
      })

      return reply.send({
        success: true,
        message: 'Payment confirmation sent to administrator. You will be notified within 30 minutes.',
        data: {
          investmentId: investment.id,
          status: 'PENDING',
          expectedResponseTime: '30 minutes'
        }
      })

    } catch (error: any) {
      console.error('Confirm payment error:', error)
      request.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to process payment confirmation'
      })
    }
  })
}
