import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getEarningsHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.currentUser!.id

    const earnings = await prisma.referralEarning.findMany({
      where: { referrerId: userId },
      include: {
        user: { select: { email: true } },
        investment: {
          select: {
            amount: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return reply.send({
      success: true,
      data: earnings
    })

  } catch (error: any) {
    console.error('❌ Error fetching earnings:', error)
    return reply.code(500).send({
      success: false,
      error: 'Failed to fetch earnings'
    })
  }
}
