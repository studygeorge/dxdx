import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { CreateInvestmentBody } from '../../types/investments.types'
import { PACKAGES, DURATION_BONUSES } from '../../constants/investments.constants'
import { ValidationService } from '../../services/investments/validation.service'
import { CalculationsService } from '../../services/investments/calculations.service'
import { ReferralService } from '../../services/investments/referral.service'

const prisma = new PrismaClient()

export class CreateInvestmentController {
  static async createInvestment(request: FastifyRequest, reply: FastifyReply) {
    console.log('createInvestment controller called')
    console.log('Request body:', request.body)
    console.log('Current user:', request.currentUser?.email)
    
    try {
      const userId = request.currentUser!.id
      const { planId, amount, duration, walletAddress, paymentMethod, language } = request.body as CreateInvestmentBody
      
      const userLanguage = language || 'en'
      
      console.log('Extracted data:', { userId, planId, amount, duration, walletAddress, paymentMethod, language: userLanguage })

      // Валидация обязательных полей
      if (!planId || !amount || !duration || !walletAddress) {
        console.log('Missing required fields')
        return reply.code(400).send({
          success: false,
          error: 'Missing required fields: planId, amount, duration, walletAddress'
        })
      }

      // Валидация duration
      if (!ValidationService.validateDuration(duration)) {
        console.log('Invalid duration:', duration)
        return reply.code(400).send({
          success: false,
          error: 'Duration must be 3, 6, or 12 months'
        })
      }

      // Валидация wallet
      const walletValidation = ValidationService.validateWalletAddress(walletAddress, paymentMethod)
      if (!walletValidation.isValid) {
        return reply.code(400).send({
          success: false,
          error: walletValidation.error
        })
      }

      const { isTron: isTronWallet, isEthereum: isEthereumWallet } = walletValidation

      console.log('Looking for plan:', planId)
      
      const plan = await prisma.stakingPlan.findUnique({
        where: { id: planId }
      })

      console.log('Plan found:', plan ? plan.name : 'NOT FOUND')

      if (!plan) {
        console.log('Plan not found')
        return reply.code(404).send({
          success: false,
          error: 'Investment plan not found'
        })
      }

      if (!plan.isActive) {
        console.log('Plan is not active')
        return reply.code(400).send({
          success: false,
          error: 'This investment plan is not active'
        })
      }

      const amountDecimal = Number(amount)
      console.log('Amount validation:', { 
        amount: amountDecimal, 
        min: Number(plan.minAmount), 
        max: Number(plan.maxAmount) 
      })
      
      if (amountDecimal < Number(plan.minAmount)) {
        console.log('Amount too low')
        return reply.code(400).send({
          success: false,
          error: `Amount must be at least ${plan.minAmount} ${plan.currency}`
        })
      }

      if (plan.maxAmount && amountDecimal > Number(plan.maxAmount)) {
        console.log('Amount too high')
        return reply.code(400).send({
          success: false,
          error: `Amount must not exceed ${plan.maxAmount} ${plan.currency}`
        })
      }

      // Определение пакета
      let selectedPackage: any
      let packageKey: string

      if (amountDecimal >= 100 && amountDecimal <= 999) {
        selectedPackage = PACKAGES.starter
        packageKey = 'starter'
      } else if (amountDecimal >= 1000 && amountDecimal <= 2999) {
        selectedPackage = PACKAGES.advanced
        packageKey = 'advanced'
      } else if (amountDecimal >= 3000 && amountDecimal <= 5999) {
        selectedPackage = PACKAGES.pro
        packageKey = 'pro'
      } else if (amountDecimal >= 6000) {
        selectedPackage = PACKAGES.elite
        packageKey = 'elite'
      } else {
        return reply.code(400).send({
          success: false,
          error: 'Amount must be at least $100'
        })
      }

      console.log('Selected package:', packageKey, selectedPackage)

      // Расчёт бонусов
      const durationBonus = DURATION_BONUSES[duration]
      const baseMonthlyRate = selectedPackage.monthlyRate
      
      let effectiveMonthlyRate = baseMonthlyRate + durationBonus.rateBonus
      let cashBonus = 0
      let bonusUnlockedAt: Date | null = null

      if (amountDecimal >= 500 && duration !== 3) {
        if (amountDecimal >= 1000) {
          cashBonus = durationBonus.cashBonus1000
        } else {
          cashBonus = durationBonus.cashBonus500
        }

        const startDate = new Date()
        const halfDuration = duration / 2
        bonusUnlockedAt = new Date(startDate)
        bonusUnlockedAt.setMonth(bonusUnlockedAt.getMonth() + halfDuration)

        console.log('💰 Bonus calculation (amount >= $500):', {
          amount: amountDecimal,
          duration,
          baseMonthlyRate,
          durationRateBonus: durationBonus.rateBonus,
          effectiveMonthlyRate,
          cashBonus,
          bonusUnlockedAt: bonusUnlockedAt?.toISOString(),
          note: amountDecimal >= 1000 
            ? `Rate bonus: +${durationBonus.rateBonus}% (always). Cash bonus: $500 (from $1000, available after ${duration / 2} months)`
            : `Rate bonus: +${durationBonus.rateBonus}% (always). Cash bonus: $200 (from $500, available after ${duration / 2} months)`
        })
      } else {
        console.log('⚠️ No cash bonus:', {
          amount: amountDecimal,
          duration,
          baseMonthlyRate,
          durationRateBonus: durationBonus.rateBonus,
          effectiveMonthlyRate,
          cashBonus: 0,
          reason: duration === 3 ? 'Duration is 3 months' : 'Amount < $500',
          note: `Rate bonus: +${durationBonus.rateBonus}% (always applied). No cash bonus.`
        })
      }

      const expectedReturn = CalculationsService.calculateExpectedReturn(amountDecimal, effectiveMonthlyRate, duration)
      const totalReturn = amountDecimal + expectedReturn + cashBonus

      console.log('Financial calculation:', {
        amount: amountDecimal,
        baseRate: baseMonthlyRate,
        durationBonus: durationBonus.rateBonus,
        effectiveRate: effectiveMonthlyRate,
        duration,
        expectedReturn,
        cashBonus,
        totalReturn
      })

      const startDate = new Date()
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + duration)

      console.log('Dates:', { startDate, endDate })

      // Определение сети
      let walletKey: string
      let network: string
      let chainId: string | number
      let decimals: number
      let usdtContract: string

      if (paymentMethod === 'telegram' || isTronWallet) {
        walletKey = 'STAKING_WALLET_USDT_TRC20'
        network = 'TRON'
        chainId = 'tron'
        decimals = 6
        usdtContract = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
        console.log('TRON network (TRC-20) selected')
      } else {
        walletKey = 'STAKING_WALLET_USDT_ERC20'
        network = 'Ethereum'
        chainId = 1
        decimals = 6
        usdtContract = '0xdac17f958d2ee523a2206206994597c13d831ec7'
        console.log('Ethereum network (ERC-20) selected')
      }

      console.log('Looking for admin wallet config:', walletKey)
      
      const adminWalletConfig = await prisma.systemConfig.findUnique({
        where: { key: walletKey }
      })

      console.log('Admin wallet config:', adminWalletConfig ? 'FOUND' : 'NOT FOUND')

      if (!adminWalletConfig || !adminWalletConfig.value) {
        console.log('Admin wallet not configured')
        return reply.code(503).send({
          success: false,
          error: `Admin wallet not configured for ${network}. Please contact support.`
        })
      }

      const adminWallet = adminWalletConfig.value
      console.log('Admin wallet:', adminWallet)

      if (paymentMethod !== 'telegram') {
        const adminIsEthereum = adminWallet.startsWith('0x')
        const adminIsTron = adminWallet.startsWith('T')

        if (isEthereumWallet && !adminIsEthereum) {
          return reply.code(503).send({
            success: false,
            error: 'Admin wallet misconfigured for Ethereum network'
          })
        }

        if (isTronWallet && !adminIsTron) {
          return reply.code(503).send({
            success: false,
            error: 'Admin wallet misconfigured for TRON network'
          })
        }
      }

      const valueInSmallestUnit = (amountDecimal * Math.pow(10, decimals)).toString()

      console.log('Payment details:', {
        network,
        chainId,
        decimals,
        amount: amountDecimal,
        valueInSmallestUnit,
        usdtContract,
        paymentMethod
      })

      console.log('Creating investment in database...')
      
      const investment = await prisma.investment.create({
        data: {
          userId,
          planId: plan.id,
          amount: amountDecimal,
          currency: plan.currency,
          roi: baseMonthlyRate,
          duration: duration,
          durationBonus: durationBonus.rateBonus,
          bonusAmount: cashBonus,
          bonusUnlockedAt: bonusUnlockedAt,
          bonusWithdrawn: false,
          effectiveROI: effectiveMonthlyRate,
          expectedReturn,
          totalReturn,
          userWalletAddress: walletAddress,
          adminWalletAddress: adminWallet,
          status: 'PENDING',
          accumulatedInterest: 0,
          withdrawnProfits: 0,
          language: userLanguage,
          startDate: null,
          endDate: null
        },
        include: {
          plan: true,
          user: {
            include: {
              referrer: true
            }
          }
        }
      })

      console.log('Investment created:', investment.id, 'Language:', userLanguage, 'Cash Bonus:', cashBonus)

      // Обработка реферальных комиссий
      await ReferralService.processReferralCommissions(investment)

      const responseData = {
        success: true,
        message: 'Investment created successfully',
        data: {
          investmentId: investment.id,
          adminWallet: adminWallet,
          senderWallet: paymentMethod === 'telegram' ? walletAddress : undefined,
          amount: investment.amount,
          planName: plan.name,
          packageName: selectedPackage.name,
          baseRate: baseMonthlyRate,
          durationBonus: durationBonus.rateBonus,
          effectiveRate: effectiveMonthlyRate,
          cashBonus: cashBonus,
          bonusUnlockedAt: bonusUnlockedAt?.toISOString(),
          duration: duration,
          durationLabel: durationBonus.label,
          expectedReturn: investment.expectedReturn,
          totalReturn: investment.totalReturn,
          language: userLanguage,
          payment: paymentMethod === 'telegram' ? {
            method: 'telegram',
            network: network,
            adminWallet: adminWallet
          } : {
            to: adminWallet,
            from: walletAddress,
            amount: amountDecimal,
            value: valueInSmallestUnit,
            decimals: decimals,
            chainId: chainId,
            network: network,
            token: plan.currency,
            usdtContract: usdtContract
          }
        }
      }

      console.log('Sending response:', responseData)
      
      return reply.code(201).send(responseData)

    } catch (error: any) {
      console.error('Error in createInvestment:', error)
      console.error('Error stack:', error.stack)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to create investment',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
}