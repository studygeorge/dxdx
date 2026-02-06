import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface TradingReportQuery {
  exchange?: string
  asset?: string
  type?: string
  status?: string
  startDate?: string
  endDate?: string
}

export async function getPublicTradingReports(
  request: FastifyRequest<{ Querystring: TradingReportQuery }>,
  reply: FastifyReply
) {
  try {
    const { exchange, asset, type, status, startDate, endDate } = request.query

    const where: any = {}

    if (exchange) where.exchange = exchange
    if (asset) where.asset = asset
    if (type) where.tradeType = type
    if (status) where.status = status

    if (startDate || endDate) {
      where.entryDate = {}
      if (startDate) where.entryDate.gte = new Date(startDate)
      if (endDate) where.entryDate.lte = new Date(endDate)
    }

    const reports = await prisma.tradingReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        tradeNumber: true,
        status: true,
        exchange: true,
        asset: true,
        tradeType: true,
        entryDate: true,
        entryPrice: true,
        exitDate: true,
        exitPrice: true,
        pnlPercentage: true,
        comment: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return reply.send({ success: true, data: reports })
  } catch (error) {
    request.log.error(error)
    return reply.code(500).send({ error: 'Failed to fetch trading reports' })
  }
}

export async function getPublicTradingStats(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const reports = await prisma.tradingReport.findMany()

    const stats = {
      totalTrades: reports.length,
      winTrades: reports.filter(r => r.status === 'WIN').length,
      lossTrades: reports.filter(r => r.status === 'LOSS').length,
      openTrades: reports.filter(r => r.status === 'OPEN').length,
      totalPnl: reports.reduce((sum, r) => sum + Number(r.pnlPercentage || 0), 0),
      winRate: 0
    }

    const closedTrades = stats.winTrades + stats.lossTrades
    stats.winRate = closedTrades > 0 ? (stats.winTrades / closedTrades) * 100 : 0

    return reply.send({ success: true, data: stats })
  } catch (error) {
    request.log.error(error)
    return reply.code(500).send({ error: 'Failed to fetch trading statistics' })
  }
}
