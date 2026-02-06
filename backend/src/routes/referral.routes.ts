import { FastifyInstance } from 'fastify'
import { authenticate } from '../middleware/auth.middleware'
import { getReferralListHandler } from './referral/handlers/referral-list.handler'
import { getEarningsHandler } from './referral/handlers/earnings.handler'
import { getAvailableActionsHandler } from './referral/handlers/available-actions.handler'
import {
  withdrawBonusHandler,
  bulkWithdrawHandler,
  getWithdrawalStatusHandler,
  approveWithdrawalHandler,
  rejectWithdrawalHandler
} from './referral/handlers/withdraw.handler'
import { reinvestToInvestmentHandler } from './referral/handlers/reinvest.handler'
import { getStatsHandler } from './referral/handlers/stats.handler'
import {
  WithdrawBonusBody,
  BulkWithdrawBody,
  ReinvestBody,
  WithdrawalStatusParams,
  ApproveRejectBody
} from './referral/types/referral.types'

export async function referralRoutes(fastify: FastifyInstance) {
  
  fastify.get('/my-referrals', {
    preHandler: [authenticate]
  }, getReferralListHandler)

  fastify.get('/earnings', {
    preHandler: [authenticate]
  }, getEarningsHandler)

  fastify.get('/available-for-actions', {
    preHandler: [authenticate]
  }, getAvailableActionsHandler)

  fastify.post<{ Body: BulkWithdrawBody }>('/bulk-withdraw', {
    preHandler: [authenticate]
  }, bulkWithdrawHandler)

  fastify.post<{ Body: ReinvestBody }>('/reinvest-to-investment', {
    preHandler: [authenticate]
  }, reinvestToInvestmentHandler)

  fastify.post<{ Body: WithdrawBonusBody }>('/withdraw-bonus', {
    preHandler: [authenticate]
  }, withdrawBonusHandler)

  fastify.get<{ Params: WithdrawalStatusParams }>('/withdrawal-status/:withdrawalId', {
    preHandler: [authenticate]
  }, getWithdrawalStatusHandler)

  fastify.post<{ Params: WithdrawalStatusParams; Body: ApproveRejectBody }>('/withdraw-bonus/:withdrawalId/approve', 
    approveWithdrawalHandler)

  fastify.post<{ Params: WithdrawalStatusParams; Body: ApproveRejectBody }>('/withdraw-bonus/:withdrawalId/reject', 
    rejectWithdrawalHandler)

  fastify.get('/stats', {
    preHandler: [authenticate]
  }, getStatsHandler)
}

export default referralRoutes
