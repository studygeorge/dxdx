import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { InvestmentsController } from '../../controllers/investments'

const prisma = new PrismaClient()

export async function listRoutes(app: FastifyInstance) {
  // Get user's investments
  app.get('/my', InvestmentsController.getMyInvestments)
  
  // Get single investment
  app.get('/:id', InvestmentsController.getInvestment)

  // Get partial withdrawals
  app.get('/partial-withdrawals', async (request, reply) => {
    try {
      const userId = request.currentUser!.id

      const partialWithdrawals = await prisma.partialWithdrawal.findMany({
        where: { userId },
        include: {
          investment: {
            include: {
              plan: true
            }
          }
        },
        orderBy: { requestDate: 'desc' }
      })

      return reply.send({
        success: true,
        data: partialWithdrawals.map(pw => ({
          id: pw.id,
          investmentId: pw.investmentId,
          amount: Number(pw.amount),
          trc20Address: pw.trc20Address,
          status: pw.status,
          txHash: pw.txHash,
          rejectionReason: pw.rejectionReason,
          requestDate: pw.requestDate,
          processedDate: pw.processedDate,
          completedDate: pw.completedDate,
          createdAt: pw.createdAt,
          investment: {
            planName: pw.investment?.plan?.name
          }
        }))
      })

    } catch (error: any) {
      console.error('❌ Error fetching partial withdrawals:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch partial withdrawals'
      })
    }
  })

  // Get all withdrawals (combined)
  app.get('/withdrawals', async (request, reply) => {
    try {
      const userId = request.currentUser!.id

      const withdrawalRequests = await prisma.withdrawalRequest.findMany({
        where: { userId },
        include: {
          investment: {
            include: {
              plan: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      const earlyWithdrawals = await prisma.earlyWithdrawal.findMany({
        where: { userId },
        include: {
          investment: {
            include: {
              plan: true
            }
          }
        },
        orderBy: { requestDate: 'desc' }
      })

      const partialWithdrawals = await prisma.partialWithdrawal.findMany({
        where: { userId },
        include: {
          investment: {
            include: {
              plan: true
            }
          }
        },
        orderBy: { requestDate: 'desc' }
      })

      const allWithdrawals = [
        ...withdrawalRequests.map(wr => ({
          id: wr.id,
          type: 'WITHDRAWAL',
          investmentId: wr.investmentId,
          amount: Number(wr.amount),
          totalAmount: Number(wr.amount),
          status: wr.status,
          trc20Address: wr.trc20Address,
          createdAt: wr.createdAt,
          requestedAt: wr.createdAt,
          processedAt: wr.processedAt,
          isEarlyWithdrawal: false,
          isPartialWithdrawal: false,
          investment: {
            planName: wr.investment?.plan?.name
          }
        })),
        ...earlyWithdrawals.map(ew => ({
          id: ew.id,
          type: 'EARLY_WITHDRAWAL',
          investmentId: ew.investmentId,
          amount: Number(ew.totalAmount),
          totalAmount: Number(ew.totalAmount),
          investmentAmount: Number(ew.investmentAmount),
          earnedInterest: Number(ew.earnedInterest),
          withdrawnProfits: Number(ew.withdrawnProfits),
          daysInvested: ew.daysInvested,
          status: ew.status,
          trc20Address: ew.trc20Address,
          createdAt: ew.requestDate,
          requestedAt: ew.requestDate,
          processedAt: ew.processedDate,
          isEarlyWithdrawal: true,
          isPartialWithdrawal: false,
          investment: {
            planName: ew.investment?.plan?.name
          }
        })),
        ...partialWithdrawals.map(pw => ({
          id: pw.id,
          type: 'PARTIAL_WITHDRAWAL',
          investmentId: pw.investmentId,
          amount: Number(pw.amount),
          totalAmount: Number(pw.amount),
          status: pw.status,
          trc20Address: pw.trc20Address,
          txHash: pw.txHash,
          rejectionReason: pw.rejectionReason,
          createdAt: pw.requestDate,
          requestedAt: pw.requestDate,
          processedAt: pw.processedDate,
          completedAt: pw.completedDate,
          isEarlyWithdrawal: false,
          isPartialWithdrawal: true,
          investment: {
            planName: pw.investment?.plan?.name
          }
        }))
      ]

      allWithdrawals.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      return reply.send({
        success: true,
        data: allWithdrawals
      })

    } catch (error: any) {
      console.error('❌ Error fetching withdrawals:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch withdrawals'
      })
    }
  })

  // Get early withdrawals
  app.get('/early-withdrawals', async (request, reply) => {
    try {
      const userId = request.currentUser!.id

      const earlyWithdrawals = await prisma.earlyWithdrawal.findMany({
        where: { userId },
        include: {
          investment: {
            include: {
              plan: true
            }
          }
        },
        orderBy: { requestDate: 'desc' }
      })

      return reply.send({
        success: true,
        data: earlyWithdrawals.map(ew => ({
          id: ew.id,
          investmentId: ew.investmentId,
          investmentAmount: Number(ew.investmentAmount),
          daysInvested: ew.daysInvested,
          earnedInterest: Number(ew.earnedInterest),
          withdrawnProfits: Number(ew.withdrawnProfits),
          totalAmount: Number(ew.totalAmount),
          trc20Address: ew.trc20Address,
          status: ew.status,
          requestDate: ew.requestDate,
          createdAt: ew.requestDate,
          processedDate: ew.processedDate,
          type: 'EARLY_WITHDRAWAL',
          isEarlyWithdrawal: true,
          investment: {
            planName: ew.investment?.plan?.name
          }
        }))
      })

    } catch (error: any) {
      console.error('❌ Error fetching early withdrawals:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch early withdrawals'
      })
    }
  })

  // Get upgrades
  app.get('/upgrades', async (request, reply) => {
    try {
      const userId = request.currentUser!.id

      const upgrades = await prisma.investmentUpgrade.findMany({
        where: { userId },
        include: {
          investment: {
            include: {
              plan: true
            }
          }
        },
        orderBy: { requestDate: 'desc' }
      })

      return reply.send({
        success: true,
        data: upgrades.map(upgrade => ({
          id: upgrade.id,
          investmentId: upgrade.investmentId,
          upgradeType: upgrade.upgradeType,
          oldPackage: upgrade.oldPackage,
          newPackage: upgrade.newPackage,
          oldAPY: Number(upgrade.oldAPY),
          newAPY: Number(upgrade.newAPY),
          additionalAmount: Number(upgrade.additionalAmount || 0),
          oldDuration: upgrade.oldDuration,
          newDuration: upgrade.newDuration,
          oldEndDate: upgrade.oldEndDate,
          newEndDate: upgrade.newEndDate,
          adminWalletAddress: upgrade.adminWalletAddress,
          senderWalletAddress: upgrade.senderWalletAddress,
          accumulatedInterest: Number(upgrade.accumulatedInterest || 0),
          status: upgrade.status,
          requestDate: upgrade.requestDate,
          processedDate: upgrade.processedDate,
          createdAt: upgrade.createdDate
        }))
      })

    } catch (error: any) {
      console.error('❌ Error fetching upgrades:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch upgrades'
      })
    }
  })
}
