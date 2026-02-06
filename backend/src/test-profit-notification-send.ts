// backend/src/test-profit-notification-send.ts

import TelegramBot from 'node-telegram-bot-api'
import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

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

async function generateAccessToken(userId: string): Promise<string | null> {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/v1/auth/bot-token`, {
      userId: userId,
      botSecret: process.env.BOT_SECRET
    }, {
      timeout: 5000
    })

    return response.data.access_token || null
  } catch (error: any) {
    console.error(`Error generating access token:`, error.message)
    return null
  }
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

async function sendProfitNotification(bot: TelegramBot, profitData: ProfitData, dryRun: boolean = false) {
  const dailyIncreaseSign = profitData.dailyIncrease >= 0 ? '+' : ''
  
  // Форматируем сегодняшнюю дату
  const today = new Date()
  const dateString = today.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })

  // ПРОСТОЕ СООБЩЕНИЕ - убрали лишние строки
  let message = `Daily Profit Report (${dateString})

Today You Earned: ${dailyIncreaseSign}$${profitData.dailyIncrease.toFixed(2)}
Active Plans: ${profitData.activeInvestmentsCount}

`

  profitData.investmentDetails.forEach((detail, index) => {
    message += `${index + 1}. ${detail.planName}: +$${detail.dailyProfit.toFixed(2)}\n`
  })

  message = message.trim()

  console.log('\n--- MESSAGE FOR USER ---')
  console.log(`Telegram ID: ${profitData.telegramId}`)
  console.log(`Username: @${profitData.telegramUsername || 'N/A'}`)
  console.log('\nMessage text:')
  console.log(message)
  console.log('---\n')

  if (dryRun) {
    console.log('[DRY RUN] Message NOT sent (test mode)\n')
    return true
  }

  try {
    await bot.sendMessage(profitData.telegramId, message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'View My Account', callback_data: 'auth_account' }]
        ]
      }
    })

    console.log(`Message SENT successfully\n`)
    return true
  } catch (error: any) {
    console.error(`ERROR sending message: ${error.message}\n`)
    return false
  }
}

async function testProfitNotifications() {
  console.log('\n=== TEST PROFIT NOTIFICATIONS ===\n')

  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const sendReal = args.includes('--send')
  const telegramIdArg = args.find(arg => !arg.startsWith('--'))

  if (!dryRun && !sendReal) {
    console.log('ATTENTION: Use flags:')
    console.log('  --dry-run     Test mode (does not send messages)')
    console.log('  --send        Send real messages')
    console.log('\nExample:')
    console.log('  npx ts-node src/test-profit-notification-send.ts --dry-run')
    console.log('  npx ts-node src/test-profit-notification-send.ts --dry-run 5525020749')
    console.log('  npx ts-node src/test-profit-notification-send.ts --send 5525020749')
    console.log('')
    process.exit(1)
  }

  if (sendReal) {
    console.log('ATTENTION: Messages will be sent FOR REAL!')
    console.log('Wait 5 seconds to cancel (Ctrl+C)...\n')
    await new Promise(resolve => setTimeout(resolve, 5000))
  } else {
    console.log('Mode: TEST (messages will not be sent)\n')
  }

  const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: false })

  try {
    let users

    if (telegramIdArg) {
      const user = await prisma.user.findUnique({
        where: { telegramId: telegramIdArg },
        select: {
          id: true,
          email: true,
          username: true,
          telegramId: true,
          telegramUsername: true,
          isActive: true
        }
      })

      if (!user) {
        console.log(`User with Telegram ID ${telegramIdArg} not found`)
        return
      }

      users = [user]
      console.log(`Found user: ${user.email}\n`)
    } else {
      users = await prisma.user.findMany({
        where: {
          isActive: true,
          telegramId: { not: null }
        },
        select: {
          id: true,
          email: true,
          username: true,
          telegramId: true,
          telegramUsername: true,
          isActive: true
        }
      })

      console.log(`Found users with Telegram: ${users.length}\n`)
    }

    if (users.length === 0) {
      console.log('No users to send notifications')
      return
    }

    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (const user of users) {
      console.log(`\nProcessing: ${user.email} (${user.username})`)
      console.log(`Telegram ID: ${user.telegramId}`)

      const accessToken = await generateAccessToken(user.id)
      
      if (!accessToken) {
        console.log('Failed to get access token')
        errorCount++
        continue
      }

      const profitData = await fetchUserProfitData(user.id, accessToken)

      if (!profitData) {
        console.log('No active investments - SKIPPED\n')
        skipCount++
        continue
      }

      const sent = await sendProfitNotification(bot, profitData, dryRun)
      
      if (sent) {
        successCount++
      } else {
        errorCount++
      }

      // Delay between sends
      if (!dryRun && users.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    console.log('\n=== SUMMARY ===')
    console.log(`Total users: ${users.length}`)
    console.log(`Successfully sent: ${successCount}`)
    console.log(`Skipped (no investments): ${skipCount}`)
    console.log(`Errors: ${errorCount}`)
    console.log('')

    if (dryRun) {
      console.log('This was a TEST run.')
      console.log('For real sending use --send flag')
    }

    console.log('\n=== TEST COMPLETED ===\n')

  } catch (error: any) {
    console.error('Critical error:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testProfitNotifications()
