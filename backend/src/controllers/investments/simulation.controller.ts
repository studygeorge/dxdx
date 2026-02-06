import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { SimulateDateDto } from '../../types/investments.types'

const prisma = new PrismaClient()

export class SimulationController {
  static async simulateDate(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.currentUser!.id
      const { investmentId, simulatedDate } = request.body as SimulateDateDto

      console.log('🎮 Date simulation request:', { investmentId, userId, simulatedDate })

      const investment = await prisma.investment.findFirst({
        where: {
          id: investmentId,
          userId
        }
      })

      if (!investment) {
        return reply.code(404).send({
          success: false,
          error: 'Investment not found'
        })
      }

      const newDate = simulatedDate ? new Date(simulatedDate) : null

      await prisma.investment.update({
        where: { id: investmentId },
        data: {
          simulatedCurrentDate: newDate
        }
      })

      console.log('✅ Date simulation updated:', newDate ? newDate.toISOString() : 'RESET TO REAL TIME')

      return reply.send({
        success: true,
        message: newDate ? 'Simulation date set successfully' : 'Simulation reset to real time',
        data: {
          investmentId,
          simulatedDate: newDate,
          isSimulated: !!newDate
        }
      })

    } catch (error: any) {
      console.error('❌ Error in date simulation:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to simulate date'
      })
    }
  }
}