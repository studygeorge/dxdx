import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class AdminSettingsController {
  /**
   * GET /api/v1/admin/settings/staking-plans/public
   * Публичный доступ к стейкинг планам (БЕЗ аутентификации)
   */
  static async getPublicStakingPlans(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log('📋 getPublicStakingPlans called')
      
      const plans = await prisma.stakingPlan.findMany({
        where: { isActive: true },
        orderBy: { minAmount: 'asc' }
      })

      console.log('✅ Found plans:', plans.length)

      // ✅ ИСПРАВЛЕНО: Убрано поле duration из ответа
      return reply.code(200).send({
        success: true,
        data: {
          stakingPlans: plans.map(plan => ({
            id: plan.id,
            name: plan.name,
            // duration: plan.duration, // ❌ УДАЛЕНО
            apy: Number(plan.apy), // Базовая месячная ставка
            roi: Number(plan.apy), // Алиас для совместимости с фронтендом
            minAmount: Number(plan.minAmount),
            maxAmount: Number(plan.maxAmount),
            currency: plan.currency,
            description: plan.description,
            isActive: plan.isActive
          }))
        }
      })
    } catch (error: any) {
      console.error('❌ Error fetching public plans:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch investment plans'
      })
    }
  }

  /**
   * GET /api/v1/admin/settings
   * Получить все настройки (защищённый)
   */
  static async getSettings(request: FastifyRequest, reply: FastifyReply) {
    try {
      const plans = await prisma.stakingPlan.findMany({
        orderBy: { createdAt: 'desc' }
      })

      const wallets = await prisma.systemConfig.findMany({
        where: {
          key: {
            startsWith: 'STAKING_WALLET_'
          }
        }
      })

      // Формируем структуру кошельков с поддержкой ERC-20 и TRC-20
      const walletsData: any = {
        settings: {},
        wallets: {}
      }

      wallets.forEach(w => {
        const key = w.key.replace('STAKING_WALLET_', '')
        walletsData.settings[w.key] = w.value
        
        // Разделяем USDT на ERC-20 и TRC-20
        if (key === 'USDT_ERC20') {
          walletsData.wallets['USDT_ERC20'] = w.value
        } else if (key === 'USDT_TRC20') {
          walletsData.wallets['USDT_TRC20'] = w.value
        } else {
          walletsData.wallets[key] = w.value
        }
      })

      return reply.code(200).send({
        success: true,
        data: {
          stakingPlans: plans,
          settings: walletsData.settings,
          wallets: walletsData.wallets
        }
      })
    } catch (error: any) {
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch settings'
      })
    }
  }

  /**
   * PUT /api/v1/admin/settings/wallet
   * Обновить кошелёк админа (поддержка ERC-20 и TRC-20)
   */
  static async updateWallet(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { currency, address } = request.body as { currency: string; address: string }

      if (!currency || !address) {
        return reply.code(400).send({
          success: false,
          error: 'Currency and address are required'
        })
      }

      // Валидация адреса в зависимости от типа
      if (currency === 'USDT_ERC20' || currency === 'ETH' || currency === 'BTC') {
        // Ethereum адреса начинаются с 0x
        if (!address.startsWith('0x') || address.length !== 42) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid Ethereum address format'
          })
        }
      } else if (currency === 'USDT_TRC20') {
        // TRON адреса начинаются с T
        if (!address.startsWith('T') || address.length !== 34) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid TRON address format'
          })
        }
      }

      const key = `STAKING_WALLET_${currency.toUpperCase()}`

      await prisma.systemConfig.upsert({
        where: { key },
        update: { value: address },
        create: {
          key,
          value: address,
          description: `Admin wallet for ${currency}`
        }
      })

      return reply.code(200).send({
        success: true,
        message: 'Wallet updated successfully'
      })
    } catch (error: any) {
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to update wallet'
      })
    }
  }

  /**
   * POST /api/v1/admin/settings/staking-plan
   * ✅ ОБНОВЛЕНО: Создать/обновить стейкинг план (БЕЗ duration)
   */
  static async upsertStakingPlan(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id, name, apy, minAmount, maxAmount, currency, description } = request.body as any

      // ✅ ИСПРАВЛЕНО: Убрано поле duration
      const data = {
        name,
        // duration: parseInt(duration), // ❌ УДАЛЕНО
        apy: parseFloat(apy), // Базовая месячная ставка
        minAmount: parseFloat(minAmount),
        maxAmount: maxAmount ? parseFloat(maxAmount) : null,
        currency: currency || 'USDT',
        description,
        isActive: true
      }

      let plan
      if (id) {
        plan = await prisma.stakingPlan.update({
          where: { id },
          data
        })
      } else {
        plan = await prisma.stakingPlan.create({
          data
        })
      }

      return reply.code(200).send({
        success: true,
        message: id ? 'Plan updated' : 'Plan created',
        data: plan
      })
    } catch (error: any) {
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to save plan'
      })
    }
  }

  /**
   * DELETE /api/v1/admin/settings/staking-plan/:id
   * Удалить стейкинг план
   */
  static async deleteStakingPlan(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }

      await prisma.stakingPlan.delete({
        where: { id }
      })

      return reply.code(200).send({
        success: true,
        message: 'Plan deleted successfully'
      })
    } catch (error: any) {
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to delete plan'
      })
    }
  }

  /**
   * GET /api/v1/admin/stakings
   * Получить все стейкинги
   */
  static async getAllStakings(request: FastifyRequest, reply: FastifyReply) {
    try {
      const stakings = await prisma.staking.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return reply.code(200).send({
        success: true,
        data: stakings
      })
    } catch (error: any) {
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch stakings'
      })
    }
  }
}