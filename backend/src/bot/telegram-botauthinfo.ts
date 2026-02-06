// backend/src/bot/telegram-botauthinfo.ts

import TelegramBot, { Message, CallbackQuery } from 'node-telegram-bot-api'
import axios from 'axios'
import path from 'path'
import fs from 'fs'

const API_BASE_URL = process.env.API_BASE_URL || 'https://dxcapital-ai.com'

interface AuthSession {
  step: 'authenticated'
  userId?: string
  language?: string
  lastView?: string
  telegramId?: string
}

const authSessions = new Map<number, AuthSession>()

const PHOTOS = {
  firstHello: path.join(__dirname, 'firsthello.jpg'),
  loginSuccess: path.join(__dirname, 'vhoduspeshno.JPG'),
  accountInfo: path.join(__dirname, 'info o schete.png'),
  investments: path.join(__dirname, 'IMG_6232.JPG'),
  available: path.join(__dirname, 'IMG_6231.JPG'),
  referrals: path.join(__dirname, 'IMG_6233.JPG'),
  profile: path.join(__dirname, 'IMG_6226.JPG')
}

function checkPhotoExists(photoPath: string): boolean {
  try {
    return fs.existsSync(photoPath)
  } catch (error) {
    console.error(`Error checking photo: ${photoPath}`, error)
    return false
  }
}

function truncateCaption(text: string, maxLength: number = 1020): string {
  if (text.length <= maxLength) return text
  
  const truncated = text.substring(0, maxLength - 30)
  const lastNewline = truncated.lastIndexOf('\n')
  
  if (lastNewline > maxLength - 100) {
    return truncated.substring(0, lastNewline) + '\n\n...(сокращено)'
  }
  
  return truncated + '\n\n...(сокращено)'
}

async function sendMessageWithPhoto(
  bot: TelegramBot,
  chatId: number,
  photoPath: string,
  caption: string,
  options?: any
) {
  try {
    const safeCaption = truncateCaption(caption, 1020)
    
    if (checkPhotoExists(photoPath)) {
      await bot.sendPhoto(chatId, photoPath, {
        caption: safeCaption,
        parse_mode: 'HTML',
        ...options
      })
    } else {
      console.warn(`Photo not found: ${photoPath}, sending text only`)
      await bot.sendMessage(chatId, safeCaption, {
        parse_mode: 'HTML',
        ...options
      })
    }
  } catch (error) {
    console.error('Error sending photo:', error)
    await bot.sendMessage(chatId, truncateCaption(caption, 4000), {
      parse_mode: 'HTML',
      ...options
    })
  }
}

async function editMessageWithPhoto(
  bot: TelegramBot,
  chatId: number,
  messageId: number,
  photoPath: string,
  caption: string,
  options?: any
) {
  try {
    await bot.deleteMessage(chatId, messageId).catch(() => {})
    await sendMessageWithPhoto(bot, chatId, photoPath, caption, options)
  } catch (error) {
    console.error('Error editing message with photo:', error)
    await sendMessageWithPhoto(bot, chatId, photoPath, caption, options)
  }
}

const languageSelectionTranslations = {
  en: {
    selectLanguage: 'Please select your language / Пожалуйста, выберите язык',
    buttonEnglish: 'English',
    buttonRussian: 'Русский',
    languageSet: 'Language set to English'
  },
  ru: {
    selectLanguage: 'Please select your language / Пожалуйста, выберите язык',
    buttonEnglish: 'English',
    buttonRussian: 'Русский',
    languageSet: 'Язык установлен: Русский'
  }
}

const authTranslations = {
  en: {
    loginSuccess: 'Login successful!\n\nWelcome back, %name%!',
    accountNotFound: 'Account not found.\n\nPlease register on our website to access your account via Telegram bot.',
    registerButton: 'Register',
    alreadyLoggedIn: 'You are already logged in.',
    logoutSuccess: 'You have been logged out successfully.',
    
    accountInfo: 'Account Information',
    myAccount: 'My Account',
    totalInvested: 'Total Invested',
    activeInvestments: 'Active Investments',
    totalProfit: 'Total Profit',
    availableToWithdraw: 'Available to Withdraw',
    referralBonus: 'Referral Bonus',
    kycStatus: 'KYC Status',
    
    investmentDetails: 'Investment Details',
    plan: 'Plan',
    amount: 'Amount',
    duration: 'Duration',
    months: 'months',
    apy: 'APY',
    startDate: 'Start Date',
    endDate: 'End Date',
    currentProfit: 'Current Profit',
    expectedProfit: 'Expected Profit',
    status: 'Status',
    
    statusActive: 'Active',
    statusCompleted: 'Completed',
    statusPending: 'Pending',
    kycApproved: 'Verified',
    kycPending: 'Pending',
    kycNotSubmitted: 'Not Verified',
    
    buttonInvestments: 'My Investments',
    buttonAvailable: 'Available Funds',
    buttonReferrals: 'Referrals',
    buttonProfile: 'Profile',
    buttonLogout: 'Logout',
    buttonBack: 'Back',
    buttonRefresh: 'Refresh',
    
    referralInfo: 'Referral Program',
    totalReferrals: 'Total Referrals',
    activeReferrals: 'Active Referrals',
    totalEarned: 'Total Earned',
    availableBonus: 'Available Bonus',
    referralLink: 'Your Referral Link',
    
    errorLoadingData: 'Error loading data. Please try again later.',
    noInvestments: 'You have no active investments yet.',
    noReferrals: 'You have no referrals yet.',
    
    loading: 'Loading...',
    
    availableFundsTitle: 'Available Funds',
    fromInvestments: 'Available from investments',
    fromReferrals: 'Available from referral bonuses',
    totalAvailable: 'Total available',
    
    profileTitle: 'Profile',
    name: 'Name',
    email: 'Email',
    kyc: 'KYC',
    registration: 'Registration',
  },
  
  ru: {
    loginSuccess: 'Вход выполнен успешно!\n\nДобро пожаловать, %name%!',
    accountNotFound: 'Аккаунт не найден.\n\nПожалуйста, зарегистрируйтесь на нашем сайте, чтобы получить доступ к аккаунту через Telegram бот.',
    registerButton: 'Зарегистрироваться',
    alreadyLoggedIn: 'Вы уже авторизованы.',
    logoutSuccess: 'Вы успешно вышли из аккаунта.',
    
    accountInfo: 'Информация о счёте',
    myAccount: 'Мой счёт',
    totalInvested: 'Всего инвестировано',
    activeInvestments: 'Активных инвестиций',
    totalProfit: 'Общая прибыль',
    availableToWithdraw: 'Доступно к выводу',
    referralBonus: 'Реферальный бонус',
    kycStatus: 'KYC статус',
    
    investmentDetails: 'Детали инвестиции',
    plan: 'План',
    amount: 'Сумма',
    duration: 'Срок',
    months: 'месяцев',
    apy: 'APY',
    startDate: 'Дата начала',
    endDate: 'Дата окончания',
    currentProfit: 'Текущая прибыль',
    expectedProfit: 'Ожидаемая прибыль',
    status: 'Статус',
    
    statusActive: 'Активна',
    statusCompleted: 'Завершена',
    statusPending: 'В ожидании',
    kycApproved: 'Верифицирован',
    kycPending: 'На проверке',
    kycNotSubmitted: 'Не верифицирован',
    
    buttonInvestments: 'Мои инвестиции',
    buttonAvailable: 'Доступные средства',
    buttonReferrals: 'Рефералы',
    buttonProfile: 'Профиль',
    buttonLogout: 'Выйти',
    buttonBack: 'Назад',
    buttonRefresh: 'Обновить',
    
    referralInfo: 'Реферальная программа',
    totalReferrals: 'Всего рефералов',
    activeReferrals: 'Активных рефералов',
    totalEarned: 'Всего заработано',
    availableBonus: 'Доступно к выводу',
    referralLink: 'Ваша реферальная ссылка',
    
    errorLoadingData: 'Ошибка загрузки данных. Попробуйте позже.',
    noInvestments: 'У вас пока нет активных инвестиций.',
    noReferrals: 'У вас пока нет рефералов.',
    
    loading: 'Загрузка...',
    
    availableFundsTitle: 'Доступные средства',
    fromInvestments: 'Доступно к выводу из инвестиций',
    fromReferrals: 'Доступно из реферальных бонусов',
    totalAvailable: 'Итого доступно',
    
    profileTitle: 'Профиль',
    name: 'Имя',
    email: 'Email',
    kyc: 'KYC',
    registration: 'Регистрация',
  }
}

function ta(chatId: number, key: keyof typeof authTranslations.en): string {
  const session = authSessions.get(chatId)
  const lang = session?.language || 'ru'
  const language = (lang === 'ru' || lang === 'en') ? lang : 'ru'
  return authTranslations[language][key] || authTranslations.ru[key]
}

function toNumber(value: any): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value) || 0
  return 0
}

function detectLanguageFromStart(startParam: string): 'en' | 'ru' | null {
  if (!startParam) return null
  
  const param = startParam.toLowerCase().trim()
  
  if (param.includes('en') || param.includes('english') || param.includes('profile_en')) {
    return 'en'
  }
  
  if (param.includes('ru') || param.includes('russian') || param.includes('profile_ru')) {
    return 'ru'
  }
  
  return null
}

async function generateBotAccessToken(userId: string): Promise<string | null> {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/v1/auth/bot-token`, {
      userId: userId,
      botSecret: process.env.BOT_SECRET || 'your-bot-secret-key'
    }, {
      timeout: 5000
    })

    return response.data.access_token || null
  } catch (error: any) {
    console.error(`Error generating bot access token:`, error.message)
    return null
  }
}

function showLanguageSelection(bot: TelegramBot, chatId: number) {
  const message = languageSelectionTranslations.en.selectLanguage
  
  sendMessageWithPhoto(
    bot,
    chatId,
    PHOTOS.firstHello,
    message,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: languageSelectionTranslations.en.buttonEnglish, callback_data: 'set_lang_en' }],
          [{ text: languageSelectionTranslations.ru.buttonRussian, callback_data: 'set_lang_ru' }]
        ]
      }
    }
  )
}

async function handleLanguageSelection(
  bot: TelegramBot, 
  chatId: number, 
  language: 'en' | 'ru', 
  messageId?: number
): Promise<'en' | 'ru'> {
  let session = authSessions.get(chatId)
  
  if (!session) {
    session = { 
      step: 'authenticated', 
      language: language,
      telegramId: chatId.toString()
    }
  } else {
    session.language = language
  }
  
  authSessions.set(chatId, session)
  
  console.log(`Language set to: ${language} for chat ${chatId}`)
  
  const confirmMessage = language === 'en' 
    ? languageSelectionTranslations.en.languageSet 
    : languageSelectionTranslations.ru.languageSet
  
  if (messageId) {
    await bot.deleteMessage(chatId, messageId).catch(() => {})
  }
  
  await bot.sendMessage(chatId, confirmMessage)
  
  return language
}

async function autoLoginByTelegramId(bot: TelegramBot, chatId: number, telegramId: string, startLanguage?: 'en' | 'ru') {
  console.log(`Attempting auto-login for Telegram ID: ${telegramId}`)
  
  let session = authSessions.get(chatId)
  
  if (!session) {
    session = {
      step: 'authenticated',
      language: startLanguage || 'ru',
      telegramId: telegramId
    }
    authSessions.set(chatId, session)
  } else if (startLanguage) {
    session.language = startLanguage
    authSessions.set(chatId, session)
  }
  
  const loadingMsg = await bot.sendMessage(chatId, ta(chatId, 'loading'))
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/v1/auth/telegram-login`, {
      telegramId: telegramId
    })
    
    const data = response.data
    
    if (data.success && data.user) {
      session.step = 'authenticated'
      session.userId = data.user.id
      authSessions.set(chatId, session)
      
      const userName = data.user.username || data.user.firstName || data.user.email?.split('@')[0] || 'User'
      
      bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {})
      
      console.log(`Auto-login successful for Telegram ID: ${telegramId}, user: ${userName}`)
      
      await sendMessageWithPhoto(
        bot,
        chatId,
        PHOTOS.loginSuccess,
        ta(chatId, 'loginSuccess').replace('%name%', userName),
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: ta(chatId, 'myAccount'), callback_data: 'auth_account' }]
            ]
          }
        }
      )
    } else {
      throw new Error('No user data received')
    }
  } catch (error: any) {
    bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {})
    
    console.error(`Auto-login failed for Telegram ID: ${telegramId}`, error.message)
    
    authSessions.delete(chatId)
    
    await bot.sendMessage(chatId, ta(chatId, 'accountNotFound'), {
      reply_markup: {
        inline_keyboard: [
          [{ text: ta(chatId, 'registerButton'), url: `https://dxcapital-ai.com/register?telegram_id=${telegramId}` }]
        ]
      }
    })
  }
}

function handleLoginCommand(bot: TelegramBot, chatId: number, telegramId: string, startLanguage?: 'en' | 'ru') {
  const session = authSessions.get(chatId)
  
  if (session?.step === 'authenticated' && session.userId) {
    bot.sendMessage(chatId, ta(chatId, 'alreadyLoggedIn'), {
      reply_markup: {
        inline_keyboard: [
          [{ text: ta(chatId, 'buttonLogout'), callback_data: 'auth_logout' }],
          [{ text: ta(chatId, 'myAccount'), callback_data: 'auth_account' }]
        ]
      }
    })
    return
  }
  
  autoLoginByTelegramId(bot, chatId, telegramId, startLanguage)
}

async function handleAuthMessage(bot: TelegramBot, msg: Message) {
  // Автологин работает через Telegram ID
}

async function showAccountMenu(bot: TelegramBot, chatId: number, messageId?: number) {
  const session = authSessions.get(chatId)
  
  if (!session || !session.userId) {
    const telegramId = chatId.toString()
    await autoLoginByTelegramId(bot, chatId, telegramId)
    setTimeout(() => showAccountMenu(bot, chatId, messageId), 2000)
    return
  }
  
  const accessToken = await generateBotAccessToken(session.userId)
  
  if (!accessToken) {
    bot.sendMessage(chatId, ta(chatId, 'errorLoadingData'))
    return
  }
  
  try {
    const userResponse = await axios.get(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    
    const userData = userResponse.data.data || userResponse.data.user
    
    const investmentsResponse = await axios.get(`${API_BASE_URL}/api/v1/investments/my`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    
    const investments = investmentsResponse.data.data || []
    const activeInvestments = investments.filter((inv: any) => inv.status === 'ACTIVE')
    
    const totalInvested = activeInvestments.reduce((sum: number, inv: any) => sum + toNumber(inv.amount), 0)
    const totalProfit = activeInvestments.reduce((sum: number, inv: any) => sum + toNumber(inv.currentReturn), 0)
    const availableToWithdraw = activeInvestments.reduce((sum: number, inv: any) => {
      return sum + toNumber(inv.availableProfit)
    }, 0)
    
    let referralBonus = 0
    try {
      const referralResponse = await axios.get(`${API_BASE_URL}/api/v1/referrals/stats`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      referralBonus = toNumber(referralResponse.data.data?.availableBonus)
    } catch (err) {
      console.log('No referral data available')
    }
    
    const kycStatusMap: any = {
      'APPROVED': ta(chatId, 'kycApproved'),
      'PENDING': ta(chatId, 'kycPending'),
      'NOT_SUBMITTED': ta(chatId, 'kycNotSubmitted')
    }
    const kycStatus = kycStatusMap[userData.kycStatus] || ta(chatId, 'kycNotSubmitted')
    
    const message = `
${ta(chatId, 'accountInfo')}

${ta(chatId, 'totalInvested')}: $${totalInvested.toFixed(2)}
${ta(chatId, 'activeInvestments')}: ${activeInvestments.length}
${ta(chatId, 'totalProfit')}: $${totalProfit.toFixed(2)}
${ta(chatId, 'availableToWithdraw')}: $${availableToWithdraw.toFixed(2)}
${ta(chatId, 'referralBonus')}: $${referralBonus.toFixed(2)}
${ta(chatId, 'kycStatus')}: ${kycStatus}
    `.trim()
    
    const keyboard = {
      inline_keyboard: [
        [
          { text: ta(chatId, 'buttonInvestments'), callback_data: 'auth_investments' },
          { text: ta(chatId, 'buttonAvailable'), callback_data: 'auth_available' }
        ],
        [
          { text: ta(chatId, 'buttonReferrals'), callback_data: 'auth_referrals' },
          { text: ta(chatId, 'buttonProfile'), callback_data: 'auth_profile' }
        ],
        [
          { text: ta(chatId, 'buttonRefresh'), callback_data: 'auth_account' },
          { text: ta(chatId, 'buttonLogout'), callback_data: 'auth_logout' }
        ]
      ]
    }
    
    if (messageId) {
      await editMessageWithPhoto(bot, chatId, messageId, PHOTOS.accountInfo, message, { reply_markup: keyboard })
    } else {
      await sendMessageWithPhoto(bot, chatId, PHOTOS.accountInfo, message, { reply_markup: keyboard })
    }
    
  } catch (error: any) {
    console.error('Error fetching account data:', error.message)
    bot.sendMessage(chatId, ta(chatId, 'errorLoadingData'))
  }
}

async function showInvestments(bot: TelegramBot, chatId: number, messageId?: number) {
  const session = authSessions.get(chatId)
  
  if (!session || !session.userId) {
    const telegramId = chatId.toString()
    await autoLoginByTelegramId(bot, chatId, telegramId)
    setTimeout(() => showInvestments(bot, chatId, messageId), 2000)
    return
  }
  
  if (session.lastView === 'investments' && messageId) {
    console.log('Investments already open, ignoring duplicate click')
    return
  }
  
  const accessToken = await generateBotAccessToken(session.userId)
  
  if (!accessToken) {
    bot.sendMessage(chatId, ta(chatId, 'errorLoadingData'))
    return
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/investments/my`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    
    const investments = response.data.data || []
    const activeInvestments = investments.filter((inv: any) => inv.status === 'ACTIVE')
    
    if (activeInvestments.length === 0) {
      const message = ta(chatId, 'noInvestments')
      
      const keyboard = {
        inline_keyboard: [
          [{ text: ta(chatId, 'buttonBack'), callback_data: 'auth_account' }]
        ]
      }
      
      if (messageId) {
        await editMessageWithPhoto(bot, chatId, messageId, PHOTOS.investments, message, { reply_markup: keyboard })
      } else {
        await sendMessageWithPhoto(bot, chatId, PHOTOS.investments, message, { reply_markup: keyboard })
      }
      
      session.lastView = 'investments'
      authSessions.set(chatId, session)
      return
    }
    
    let message = `${ta(chatId, 'investmentDetails')}\n\n`
    
    const dateLocale = session.language === 'en' ? 'en-US' : 'ru-RU'
    
    activeInvestments.forEach((inv: any, index: number) => {
      const startDate = inv.startDate ? new Date(inv.startDate).toLocaleDateString(dateLocale) : 'N/A'
      const endDate = inv.endDate ? new Date(inv.endDate).toLocaleDateString(dateLocale) : 'N/A'
      const currentProfit = toNumber(inv.currentReturn)
      const expectedReturn = toNumber(inv.expectedReturn)
      
      message += `
${index + 1}. ${inv.planName || 'N/A'}
${ta(chatId, 'amount')}: $${toNumber(inv.amount).toFixed(2)}
${ta(chatId, 'duration')}: ${inv.duration} ${ta(chatId, 'months')}
${ta(chatId, 'apy')}: ${toNumber(inv.effectiveROI).toFixed(1)}%
${ta(chatId, 'startDate')}: ${startDate}
${ta(chatId, 'endDate')}: ${endDate}
${ta(chatId, 'currentProfit')}: $${currentProfit.toFixed(2)}
${ta(chatId, 'expectedProfit')}: $${expectedReturn.toFixed(2)}
${ta(chatId, 'status')}: ${ta(chatId, 'statusActive')}
━━━━━━━━━━━━━━━━
`
    })
    
    const keyboard = {
      inline_keyboard: [
        [{ text: ta(chatId, 'buttonBack'), callback_data: 'auth_account' }]
      ]
    }
    
    if (messageId) {
      await editMessageWithPhoto(bot, chatId, messageId, PHOTOS.investments, message.trim(), { reply_markup: keyboard })
    } else {
      await sendMessageWithPhoto(bot, chatId, PHOTOS.investments, message.trim(), { reply_markup: keyboard })
    }
    
    session.lastView = 'investments'
    authSessions.set(chatId, session)
    
  } catch (error: any) {
    console.error('Error fetching investments:', error.message)
    bot.sendMessage(chatId, ta(chatId, 'errorLoadingData'))
  }
}

async function showAvailableFunds(bot: TelegramBot, chatId: number, messageId?: number) {
  const session = authSessions.get(chatId)
  
  if (!session || !session.userId) {
    const telegramId = chatId.toString()
    await autoLoginByTelegramId(bot, chatId, telegramId)
    setTimeout(() => showAvailableFunds(bot, chatId, messageId), 2000)
    return
  }
  
  if (session.lastView === 'available' && messageId) {
    console.log('Available funds already open, ignoring duplicate click')
    return
  }
  
  const accessToken = await generateBotAccessToken(session.userId)
  
  if (!accessToken) {
    bot.sendMessage(chatId, ta(chatId, 'errorLoadingData'))
    return
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/investments/my`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    
    const investments = response.data.data || []
    const activeInvestments = investments.filter((inv: any) => inv.status === 'ACTIVE')
    
    const availableToWithdraw = activeInvestments.reduce((sum: number, inv: any) => {
      return sum + toNumber(inv.availableProfit)
    }, 0)
    
    let referralBonus = 0
    try {
      const referralResponse = await axios.get(`${API_BASE_URL}/api/v1/referrals/stats`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      referralBonus = toNumber(referralResponse.data.data?.availableBonus)
    } catch (err) {
      console.log('No referral data available')
    }
    
    const totalAvailable = availableToWithdraw + referralBonus
    
    const message = `
${ta(chatId, 'availableFundsTitle')}

${ta(chatId, 'fromInvestments')}: $${availableToWithdraw.toFixed(2)}
${ta(chatId, 'fromReferrals')}: $${referralBonus.toFixed(2)}

${ta(chatId, 'totalAvailable')}: $${totalAvailable.toFixed(2)}
    `.trim()
    
    const keyboard = {
      inline_keyboard: [
        [{ text: ta(chatId, 'buttonBack'), callback_data: 'auth_account' }]
      ]
    }
    
    if (messageId) {
      await editMessageWithPhoto(bot, chatId, messageId, PHOTOS.available, message, { reply_markup: keyboard })
    } else {
      await sendMessageWithPhoto(bot, chatId, PHOTOS.available, message, { reply_markup: keyboard })
    }
    
    session.lastView = 'available'
    authSessions.set(chatId, session)
    
  } catch (error: any) {
    console.error('Error fetching available funds:', error.message)
    bot.sendMessage(chatId, ta(chatId, 'errorLoadingData'))
  }
}

async function showReferrals(bot: TelegramBot, chatId: number, messageId?: number) {
  const session = authSessions.get(chatId)
  
  if (!session || !session.userId) {
    const telegramId = chatId.toString()
    await autoLoginByTelegramId(bot, chatId, telegramId)
    setTimeout(() => showReferrals(bot, chatId, messageId), 2000)
    return
  }
  
  if (session.lastView === 'referrals' && messageId) {
    console.log('Referrals already open, ignoring duplicate click')
    return
  }
  
  const accessToken = await generateBotAccessToken(session.userId)
  
  if (!accessToken) {
    bot.sendMessage(chatId, ta(chatId, 'errorLoadingData'))
    return
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/referrals/stats`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    
    const stats = response.data.data || {}
    
    const totalReferrals = stats.totalReferrals || 0
    const activeReferrals = stats.activeReferrals || 0
    const totalEarned = toNumber(stats.totalEarned)
    const availableBonus = toNumber(stats.availableBonus)
    
    const userResponse = await axios.get(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    
    const userData = userResponse.data.data || userResponse.data.user
    const referralCode = userData.referralCode || 'N/A'
    const referralLink = `https://dxcapital-ai.com?ref=${referralCode}`
    
    const message = `
${ta(chatId, 'referralInfo')}

${ta(chatId, 'totalReferrals')}: ${totalReferrals}
${ta(chatId, 'activeReferrals')}: ${activeReferrals}
${ta(chatId, 'totalEarned')}: $${totalEarned.toFixed(2)}
${ta(chatId, 'availableBonus')}: $${availableBonus.toFixed(2)}

${ta(chatId, 'referralLink')}:
${referralLink}
    `.trim()
    
    const keyboard = {
      inline_keyboard: [
        [{ text: ta(chatId, 'buttonBack'), callback_data: 'auth_account' }]
      ]
    }
    
    if (messageId) {
      await editMessageWithPhoto(bot, chatId, messageId, PHOTOS.referrals, message, { reply_markup: keyboard })
    } else {
      await sendMessageWithPhoto(bot, chatId, PHOTOS.referrals, message, { reply_markup: keyboard })
    }
    
    session.lastView = 'referrals'
    authSessions.set(chatId, session)
    
  } catch (error: any) {
    console.error('Error fetching referrals:', error.message)
    bot.sendMessage(chatId, ta(chatId, 'errorLoadingData'))
  }
}

async function showProfile(bot: TelegramBot, chatId: number, messageId?: number) {
  const session = authSessions.get(chatId)
  
  if (!session || !session.userId) {
    const telegramId = chatId.toString()
    await autoLoginByTelegramId(bot, chatId, telegramId)
    setTimeout(() => showProfile(bot, chatId, messageId), 2000)
    return
  }
  
  if (session.lastView === 'profile' && messageId) {
    console.log('Profile already open, ignoring duplicate click')
    return
  }
  
  const accessToken = await generateBotAccessToken(session.userId)
  
  if (!accessToken) {
    bot.sendMessage(chatId, ta(chatId, 'errorLoadingData'))
    return
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    
    const userData = response.data.data || response.data.user
    
    const userName = userData.username || userData.firstName || 'N/A'
    const email = userData.email || 'N/A'
    
    const kycStatusMap: any = {
      'APPROVED': ta(chatId, 'kycApproved'),
      'PENDING': ta(chatId, 'kycPending'),
      'NOT_SUBMITTED': ta(chatId, 'kycNotSubmitted')
    }
    const kycStatus = kycStatusMap[userData.kycStatus] || ta(chatId, 'kycNotSubmitted')
    
    const dateLocale = session.language === 'en' ? 'en-US' : 'ru-RU'
    const registeredDate = new Date(userData.createdAt).toLocaleDateString(dateLocale)
    
    const message = `
${ta(chatId, 'profileTitle')}

${ta(chatId, 'name')}: ${userName}
${ta(chatId, 'email')}: ${email}
${ta(chatId, 'kyc')}: ${kycStatus}
${ta(chatId, 'registration')}: ${registeredDate}
    `.trim()
    
    const keyboard = {
      inline_keyboard: [
        [{ text: ta(chatId, 'buttonBack'), callback_data: 'auth_account' }]
      ]
    }
    
    if (messageId) {
      await editMessageWithPhoto(bot, chatId, messageId, PHOTOS.profile, message, { reply_markup: keyboard })
    } else {
      await sendMessageWithPhoto(bot, chatId, PHOTOS.profile, message, { reply_markup: keyboard })
    }
    
    session.lastView = 'profile'
    authSessions.set(chatId, session)
    
  } catch (error: any) {
    console.error('Error fetching profile:', error.message)
    bot.sendMessage(chatId, ta(chatId, 'errorLoadingData'))
  }
}

async function handleAuthCallback(bot: TelegramBot, query: CallbackQuery): Promise<'en' | 'ru' | null> {
  if (!query.message || !query.data) return null
  
  const chatId = query.message.chat.id
  const messageId = query.message.message_id
  const data = query.data
  
  const session = authSessions.get(chatId)
  
  if (session && messageId) {
    if (data === 'auth_investments' && session.lastView === 'investments') {
      console.log('Investments already open, ignoring duplicate click')
      bot.answerCallbackQuery(query.id).catch(() => {})
      return null
    }
    
    if (data === 'auth_available' && session.lastView === 'available') {
      console.log('Available funds already open, ignoring duplicate click')
      bot.answerCallbackQuery(query.id).catch(() => {})
      return null
    }
    
    if (data === 'auth_referrals' && session.lastView === 'referrals') {
      console.log('Referrals already open, ignoring duplicate click')
      bot.answerCallbackQuery(query.id).catch(() => {})
      return null
    }
    
    if (data === 'auth_profile' && session.lastView === 'profile') {
      console.log('Profile already open, ignoring duplicate click')
      bot.answerCallbackQuery(query.id).catch(() => {})
      return null
    }
  }
  
  bot.answerCallbackQuery(query.id).catch(() => {})
  
  if (data === 'set_lang_en' || data === 'set_lang_ru') {
    const language = data === 'set_lang_en' ? 'en' : 'ru'
    const selectedLanguage = await handleLanguageSelection(bot, chatId, language, messageId)
    
    console.log(`Language selected: ${selectedLanguage} - returning to bot.ts for welcome message`)
    
    return selectedLanguage
  }
  
  if (data === 'auth_logout') {
    authSessions.delete(chatId)
    bot.editMessageText(ta(chatId, 'logoutSuccess'), {
      chat_id: chatId,
      message_id: messageId
    }).catch(() => {})
  }
  else if (data === 'auth_account') {
    if (session) {
      session.lastView = undefined
      authSessions.set(chatId, session)
    }
    showAccountMenu(bot, chatId, messageId)
  }
  else if (data === 'auth_investments') {
    showInvestments(bot, chatId, messageId)
  }
  else if (data === 'auth_available') {
    showAvailableFunds(bot, chatId, messageId)
  }
  else if (data === 'auth_referrals') {
    showReferrals(bot, chatId, messageId)
  }
  else if (data === 'auth_profile') {
    showProfile(bot, chatId, messageId)
  }
  
  return null
}

export {
  authSessions,
  detectLanguageFromStart,
  showLanguageSelection,
  handleLanguageSelection,
  handleLoginCommand,
  handleAuthMessage,
  handleAuthCallback,
  showAccountMenu,
  showInvestments,
  showAvailableFunds,
  showReferrals,
  showProfile,
  autoLoginByTelegramId
}