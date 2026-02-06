import type { Message } from 'node-telegram-bot-api'
import { bot } from '../core'
import { sessionManager } from '../core'
import { t } from '../localization'
import { checkTelegramLink } from '../services'
import {
  detectLanguageFromStart,
  showLanguageSelection,
  handleLoginCommand
} from '../telegram-botauthinfo'
import {
  handleInvestmentStart,
  handleUpgradeStart,
  handleEarlyWithdrawalStart,
  handlePartialWithdrawalStart,
  handleReferralBonusStart
} from './index'

/**
 * Обработка команды /start
 */

export async function handleStartCommand(msg: Message, match: RegExpExecArray | null) {
  const chatId = msg.chat.id
  const startParam = match?.[1] || ''

  console.log('User started bot:', chatId, 'Param:', startParam)

  const detectedLanguage = detectLanguageFromStart(startParam)
  console.log('Detected language:', detectedLanguage, 'from param:', startParam)

  // Если язык не определён и это не специальная команда - показываем выбор языка
  if (
    detectedLanguage === null && 
    !startParam.startsWith('invest_') && 
    !startParam.startsWith('upgrade_') && 
    !startParam.startsWith('early_') && 
    !startParam.startsWith('partial_') && 
    !startParam.startsWith('referral_bonus_')
  ) {
    showLanguageSelection(bot, chatId)
    return
  }

  const finalLanguage: 'en' | 'ru' = detectedLanguage || 'ru'

  // Обработка /start login или /start profile
  if (startParam === 'login' || startParam.includes('profile')) {
    await handleLoginCommand(bot, chatId, chatId.toString(), finalLanguage)
    return
  }

  // Обработка invest_
  if (startParam.startsWith('invest_')) {
    const investmentId = startParam.replace('invest_', '')
    await handleInvestmentStart(chatId, investmentId)
    return
  }

  // Обработка upgrade_
  if (startParam.startsWith('upgrade_')) {
    const upgradeId = startParam.replace('upgrade_', '')
    await handleUpgradeStart(chatId, upgradeId)
    return
  }

  // Обработка early_
  if (startParam.startsWith('early_')) {
    const withdrawalId = startParam.replace('early_', '')
    await handleEarlyWithdrawalStart(chatId, withdrawalId)
    return
  }

  // Обработка partial_
  if (startParam.startsWith('partial_')) {
    const withdrawalId = startParam.replace('partial_', '')
    await handlePartialWithdrawalStart(chatId, withdrawalId)
    return
  }

  // Обработка referral_bonus_
  if (startParam.startsWith('referral_bonus_')) {
    const withdrawalId = startParam.replace('referral_bonus_', '')
    await handleReferralBonusStart(chatId, withdrawalId)
    return
  }

  // Обработка обычного /start (проверка авторизации)
  try {
    const data: any = await checkTelegramLink(chatId.toString())
    console.log('Auth check response:', data)

    if (!data.isLinked) {
      console.log('User not authorized, showing auth buttons')
      
      let session = sessionManager.get(chatId)
      if (!session) {
        session = sessionManager.createSession(chatId, finalLanguage, '')
      } else {
        session.language = finalLanguage
        sessionManager.set(chatId, session)
      }

      const welcomeMessage = t(finalLanguage, 'welcome')
      
      await bot.sendMessage(chatId, welcomeMessage, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: t(finalLanguage, 'buttonLogin'), callback_data: 'auth_login' }],
            [{ text: t(finalLanguage, 'buttonWebsite'), url: 'https://dxcapital-ai.com' }],
            [{ text: t(finalLanguage, 'buttonTelegramBot'), url: 'https://t.me/dxcapai' }],
            [{ text: t(finalLanguage, 'buttonSupport'), url: 'https://t.me/dxcapital_support' }]
          ]
        }
      })
      return
    }

    console.log('User authorized, email:', data.userEmail)
    
    let session = sessionManager.get(chatId)
    if (!session) {
      session = sessionManager.createSession(chatId, finalLanguage, data.userEmail || '')
    } else {
      session.userEmail = data.userEmail || session.userEmail
      session.language = finalLanguage
      sessionManager.set(chatId, session)
    }

    await bot.sendMessage(
      chatId,
      t(finalLanguage, 'mainMenu'),
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: t(finalLanguage, 'buttonInvest'), callback_data: 'invest' },
              { text: t(finalLanguage, 'buttonWithdraw'), callback_data: 'withdraw' }
            ],
            [
              { text: t(finalLanguage, 'buttonSupport'), url: 'https://t.me/dxcapitalsupport' }
            ]
          ]
        }
      }
    )

  } catch (error) {
    console.error('Error in /start handler:', error)
    await bot.sendMessage(
      chatId,
      'An error occurred. Please try again or contact support @dxcapitalsupport'
    )
  }
}

export async function showWelcomeAfterLanguageSelection(chatId: number, language: 'en' | 'ru') {
  console.log(`Showing welcome message for chat ${chatId} in language ${language}`)
  
  let session = sessionManager.get(chatId)
  if (!session) {
    session = sessionManager.createSession(chatId, language, '')
  } else {
    session.language = language
    sessionManager.set(chatId, session)
  }
  
  const welcomeMessage = t(language, 'welcome')
  
  await bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: t(language, 'buttonLogin'), callback_data: 'auth_login' }],
        [{ text: t(language, 'buttonWebsite'), url: 'https://dxcapital-ai.com' }],
        [{ text: t(language, 'buttonSupport'), url: 'https://t.me/DXCapital1' }]
      ]
    }
  })
}
