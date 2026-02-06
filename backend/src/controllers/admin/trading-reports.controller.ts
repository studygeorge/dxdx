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

interface CreateTradingReportBody {
  exchange: string
  asset: string
  tradeType: string
  entryPrice: number
  entryDate: string
  exitPrice?: number
  exitDate?: string
  pnlPercentage?: number
  status: string
  comment?: string
}

interface UpdateTradingReportBody extends Partial<CreateTradingReportBody> {
  id: string
}

export async function getTradingReports(
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
      orderBy: { createdAt: 'desc' }
    })

    return reply.send({ success: true, data: reports })
  } catch (error) {
    request.log.error(error)
    return reply.code(500).send({ error: 'Failed to fetch trading reports' })
  }
}

export async function getTradingStats(
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

export async function createTradingReport(
  request: FastifyRequest<{ Body: CreateTradingReportBody }>,
  reply: FastifyReply
) {
  try {
    const data = request.body
    const adminId = request.currentAdmin?.id

    if (!adminId) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    const lastReport = await prisma.tradingReport.findFirst({
      orderBy: { tradeNumber: 'desc' }
    })

    const tradeNumber = lastReport 
      ? String(parseInt(lastReport.tradeNumber) + 1)
      : '1'

    const report = await prisma.tradingReport.create({
      data: {
        tradeNumber,
        exchange: data.exchange,
        asset: data.asset,
        tradeType: data.tradeType,
        entryPrice: data.entryPrice,
        entryDate: new Date(data.entryDate),
        exitPrice: data.exitPrice || null,
        exitDate: data.exitDate ? new Date(data.exitDate) : null,
        pnlPercentage: data.pnlPercentage || 0,
        status: data.status,
        comment: data.comment || null,
        createdBy: adminId,
        updatedBy: adminId
      }
    })

    return reply.code(201).send({ success: true, data: report })
  } catch (error) {
    request.log.error(error)
    return reply.code(500).send({ error: 'Failed to create trading report' })
  }
}

export async function updateTradingReport(
  request: FastifyRequest<{ Body: UpdateTradingReportBody }>,
  reply: FastifyReply
) {
  try {
    const { id, ...data } = request.body
    const adminId = request.currentAdmin?.id

    if (!adminId) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    const updateData: any = {
      updatedBy: adminId,
      updatedAt: new Date()
    }

    if (data.exchange) updateData.exchange = data.exchange
    if (data.asset) updateData.asset = data.asset
    if (data.tradeType) updateData.tradeType = data.tradeType
    if (data.status) updateData.status = data.status
    if (data.comment !== undefined) updateData.comment = data.comment
    if (data.entryPrice !== undefined) updateData.entryPrice = data.entryPrice
    if (data.exitPrice !== undefined) updateData.exitPrice = data.exitPrice
    if (data.pnlPercentage !== undefined) updateData.pnlPercentage = data.pnlPercentage

    if (data.entryDate) {
      updateData.entryDate = new Date(data.entryDate)
    }

    if (data.exitDate) {
      updateData.exitDate = new Date(data.exitDate)
    }

    const report = await prisma.tradingReport.update({
      where: { id },
      data: updateData
    })

    return reply.send({ success: true, data: report })
  } catch (error) {
    request.log.error(error)
    return reply.code(500).send({ error: 'Failed to update trading report' })
  }
}

export async function deleteTradingReport(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params

    await prisma.tradingReport.delete({
      where: { id }
    })

    return reply.send({ success: true, message: 'Trading report deleted' })
  } catch (error) {
    request.log.error(error)
    return reply.code(500).send({ error: 'Failed to delete trading report' })
  }
}
