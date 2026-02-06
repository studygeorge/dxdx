// backend/src/bot/profit-notifier.ts

import TelegramBot from 'node-telegram-bot-api'
import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import cron from 'node-cron'

const prisma = new PrismaClient()
const API_BASE_URL = process.env.API_BASE_URL || 'https://dxcapital-ai.com'

interface ProfitData {
  userId: string
  telegramId: string
  telegramUsername?: string
  totalProfit: number
  yesterdayProfit: number
  dailyIncrease: number
  activeInvestmentsCount: number
  investmentDetails: Array<{
    planName: string
    amount: number
    dailyProfit: number
  }>
}

interface UserForNotification {
  id: string
  telegramId: string | null
  telegramUsername: string | null
  email: string | null
}

function toNumber(value: any): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value) || 0
  return 0
}

function calculateDailyProfit(amount: number, effectiveROI: number, duration: number): number {
  const monthlyProfit = (amount * effectiveROI) / 100
  const dailyProfit = monthlyProfit / 30
  return dailyProfit
}

async function fetchUserProfitData(userId: string, accessToken: string): Promise<ProfitData | null> {
  try {
    const userResponse = await axios.get(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      timeout: 10000
    })

    const userData = userResponse.data.data || userResponse.data.user

    const investmentsResponse = await axios.get(`${API_BASE_URL}/api/v1/investments/my`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      timeout: 10000
    })

    const investments = investmentsResponse.data.data || []
    const activeInvestments = investments.filter((inv: any) => inv.status === 'ACTIVE')

    if (activeInvestments.length === 0) {
      return null
    }

    let totalDailyProfit = 0
    const investmentDetails: Array<{ planName: string; amount: number; dailyProfit: number }> = []

    activeInvestments.forEach((inv: any) => {
      const amount = toNumber(inv.amount)
      const effectiveROI = toNumber(inv.effectiveROI || inv.roi)
      const duration = inv.duration || 3
      
      const dailyProfit = calculateDailyProfit(amount, effectiveROI, duration)
      totalDailyProfit += dailyProfit

      investmentDetails.push({
        planName: inv.planName || 'Investment',
        amount: amount,
        dailyProfit: dailyProfit
      })
    })

    const totalProfit = activeInvestments.reduce((sum: number, inv: any) => {
      return sum + toNumber(inv.currentReturn)
    }, 0)

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    const profitHistory = await prisma.profitHistory.findFirst({
      where: {
        userId: userId,
        recordedAt: {
          gte: yesterday,
          lt: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { recordedAt: 'desc' }
    })

    const yesterdayProfit = profitHistory ? toNumber(profitHistory.totalProfit) : (totalProfit - totalDailyProfit)
    const actualDailyIncrease = totalProfit - yesterdayProfit

    await prisma.profitHistory.create({
      data: {
        userId: userId,
        totalProfit: totalProfit,
        recordedAt: new Date()
      }
    })

    return {
      userId: userData.id,
      telegramId: userData.telegramId,
      telegramUsername: userData.telegramUsername,
      totalProfit: totalProfit,
      yesterdayProfit: yesterdayProfit,
      dailyIncrease: actualDailyIncrease,
      activeInvestmentsCount: activeInvestments.length,
      investmentDetails: investmentDetails
    }

  } catch (error: any) {
    console.error(`Error fetching profit data for user ${userId}:`, error.message)
    return null
  }
}

async function generateAccessToken(userId: string): Promise<string | null> {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/v1/auth/bot-token`, {
      userId: userId,
      botSecret: process.env.BOT_SECRET || 'your-bot-secret-key'
    }, {
      timeout: 5000
    })

    return response.data.access_token || null
  } catch (error: any) {
    console.error(`Error generating access token for user ${userId}:`, error.message)
    return null
  }
}

async function sendProfitNotification(bot: TelegramBot, profitData: ProfitData) {
  const dailyIncreaseSign = profitData.dailyIncrease >= 0 ? '+' : ''
  
  // Форматируем дату
  const today = new Date()
  const dateString = today.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })

  // ПРОСТОЕ АНГЛИЙСКОЕ СООБЩЕНИЕ - для всех
  let message = `Daily Profit Report (${dateString})

Today You Earned: ${dailyIncreaseSign}$${profitData.dailyIncrease.toFixed(2)}
Active Plans: ${profitData.activeInvestmentsCount}

`

  profitData.investmentDetails.forEach((detail, index) => {
    message += `${index + 1}. ${detail.planName}: +$${detail.dailyProfit.toFixed(2)}\n`
  })

  message = message.trim()

  try {
    await bot.sendMessage(profitData.telegramId, message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'View My Account', callback_data: 'auth_account' }]
        ]
      }
    })

    console.log(`Profit notification sent to user ${profitData.userId} (Telegram: ${profitData.telegramId})`)
    console.log(`Daily increase: $${profitData.dailyIncrease.toFixed(2)}`)
  } catch (error: any) {
    console.error(`Failed to send notification to ${profitData.telegramId}:`, error.message)
  }
}

function getRandomDelay(minMinutes: number, maxMinutes: number): number {
  return Math.floor(Math.random() * (maxMinutes - minMinutes + 1) + minMinutes) * 60 * 1000
}

async function processUserBatch(bot: TelegramBot, users: UserForNotification[], batchIndex: number, totalBatches: number) {
  console.log(`Processing batch ${batchIndex + 1}/${totalBatches} (${users.length} users)`)

  for (const user of users) {
    if (!user.telegramId) {
      console.log(`Skipping user ${user.id}: no Telegram ID`)
      continue
    }

    const accessToken = await generateAccessToken(user.id)
    
    if (!accessToken) {
      console.log(`Skipping user ${user.id}: failed to generate access token`)
      continue
    }

    const profitData = await fetchUserProfitData(user.id, accessToken)

    if (profitData) {
      await sendProfitNotification(bot, profitData)
    } else {
      console.log(`No active investments for user ${user.id}`)
    }

    const delay = getRandomDelay(1, 3)
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  console.log(`Batch ${batchIndex + 1}/${totalBatches} completed`)
}

export function initializeProfitNotifier(bot: TelegramBot) {
  console.log('Initializing daily profit notifier...')

  // ЕЖЕДНЕВНАЯ РАССЫЛКА В 8:00 УТРА
  cron.schedule('0 8 * * *', async () => {
    console.log('Starting daily profit notification cycle (8:00 AM)')

    try {
      const users: UserForNotification[] = await prisma.user.findMany({
        where: {
          isActive: true,
          telegramId: { not: null }
        },
        select: {
          id: true,
          telegramId: true,
          telegramUsername: true,
          email: true
        }
      })

      console.log(`Found ${users.length} users with Telegram accounts`)

      if (users.length === 0) {
        console.log('No users to notify')
        return
      }

      // РАСПРЕДЕЛЕНИЕ НА 12 ЧАСОВ (8:00 - 20:00)
      const NOTIFICATION_WINDOW_HOURS = 12
      const NOTIFICATION_WINDOW_MS = NOTIFICATION_WINDOW_HOURS * 60 * 60 * 1000
      const BATCH_SIZE = 10
      const BATCH_DELAY_MS = NOTIFICATION_WINDOW_MS / Math.ceil(users.length / BATCH_SIZE)

      const batches: UserForNotification[][] = []
      for (let i = 0; i < users.length; i += BATCH_SIZE) {
        batches.push(users.slice(i, i + BATCH_SIZE))
      }

      console.log(`Distribution plan: ${batches.length} batches over ${NOTIFICATION_WINDOW_HOURS} hours`)
      console.log(`Delay between batches: ${(BATCH_DELAY_MS / 60000).toFixed(1)} minutes`)

      for (let i = 0; i < batches.length; i++) {
        await processUserBatch(bot, batches[i], i, batches.length)

        if (i < batches.length - 1) {
          console.log(`Waiting ${(BATCH_DELAY_MS / 60000).toFixed(1)} minutes before next batch...`)
          await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS))
        }
      }

      console.log('Daily profit notification cycle completed')

    } catch (error: any) {
      console.error('Error in profit notification cycle:', error.message)
    }
  })

  console.log('Profit notifier scheduled: daily at 8:00 AM')
}
