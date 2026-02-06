import { bot } from '../core'
import { sessionManager } from '../core'
import { t } from '../localization'
import { buildInvestmentMessage } from '../utils'
import { fetchInvestment, approveInvestment, rejectInvestment } from '../services'
import { API_BASE_URL, SUPPORT_USER_ID } from '../config'
import axios from 'axios'

/**
 * Обработка инвестиций
 */

export async function handleInvestmentStart(chatId: number, investmentId: string): Promise<void> {
  try {
    const data = await fetchInvestment(investmentId)

    if (!data) {
      bot.sendMessage(chatId, t('en', 'investmentNotFound'))
      return
    }

    const lang = data.language || 'en'

    sessionManager.set(chatId, {
      investmentId: investmentId,
      amount: data.amount,
      planName: data.planName,
      adminWallet: data.adminWallet,
      userEmail: data.userEmail,
      senderWallet: data.senderWallet,
      type: 'investment',
      language: lang
    })

    const message = buildInvestmentMessage(data, lang)

    bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: t(lang, 'buttonSent'), callback_data: `confirm_${investmentId}` }],
          [{ text: t(lang, 'buttonCancel'), callback_data: `cancel_${investmentId}` }]
        ]
      }
    })

  } catch (error: any) {
    console.error('Error fetching investment:', error.message)
    bot.sendMessage(chatId, t('en', 'errorLoading'))
  }
}

export async function handleInvestmentConfirm(chatId: number, messageId: number, investmentId: string): Promise<void> {
  const session = sessionManager.get(chatId)
  const lang = session?.language || 'en'

  bot.editMessageReplyMarkup(
    { inline_keyboard: [] },
    { chat_id: chatId, message_id: messageId }
  ).catch(() => {})

  bot.sendMessage(chatId, t(lang, 'requestSent'))

  const supportMessage = `
${t('ru', 'supportNewPayment')}

${t('ru', 'supportUserInfo')}
Telegram ID: <code>${chatId}</code>
Email: <code>${session?.userEmail || 'N/A'}</code>

${t('ru', 'supportInvestmentInfo')}
Investment ID: <code>${investmentId}</code>
План: ${session?.planName || 'N/A'}
Сумма: <b>${session?.amount || 'N/A'} USDT (TRC-20)</b>

${t('ru', 'supportAdminWallet')}
<code>${session?.adminWallet || 'N/A'}</code>

${t('ru', 'supportSenderWallet')}
<code>${session?.senderWallet || 'N/A'}</code>

${t('ru', 'supportCheckFunds')}
  `.trim()

  try {
    await bot.sendMessage(SUPPORT_USER_ID!, supportMessage, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: t('ru', 'buttonApprove'), callback_data: `approve_${investmentId}_${chatId}` },
            { text: t('ru', 'buttonReject'), callback_data: `reject_${investmentId}_${chatId}` }
          ]
        ]
      }
    })

    console.log('Support notified for investment:', investmentId)
  } catch (error: any) {
    console.error('Error notifying support:', error.message)
  }
}

export async function handleInvestmentCancel(chatId: number, messageId: number, investmentId: string): Promise<void> {
  const session = sessionManager.get(chatId)
  const lang = session?.language || 'en'

  try {
    await axios.delete(`${API_BASE_URL}/api/v1/telegram/investment/${investmentId}`)

    bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: messageId }
    ).catch(() => {})

    bot.sendMessage(chatId, t(lang, 'requestCancelled'))
    sessionManager.delete(chatId)
  } catch (error: any) {
    console.error('Error cancelling investment:', error.message)
    bot.sendMessage(chatId, t(lang, 'errorCancelling'))
  }
}

export async function handleInvestmentApprove(chatId: number, messageId: number, investmentId: string, userId: string): Promise<void> {
  if (chatId.toString() !== SUPPORT_USER_ID) {
    console.warn('Access denied for investment approval')
    return
  }

  try {
    await approveInvestment(investmentId, chatId.toString())

    bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: messageId }
    ).catch(() => {})

    bot.sendMessage(chatId, `Инвестиция ${investmentId} подтверждена!\n\nПользователь получит уведомление.`)

    const userSession = sessionManager.get(parseInt(userId))
    const userLang = userSession?.language || 'en'

    bot.sendMessage(parseInt(userId), t(userLang, 'paymentConfirmed'), { 
      parse_mode: 'HTML' 
    }).catch(() => {})

    sessionManager.delete(parseInt(userId))

  } catch (error: any) {
    console.error('Error approving investment:', error.message)
    bot.sendMessage(chatId, t('ru', 'errorApproving'))
  }
}

export async function handleInvestmentReject(chatId: number, messageId: number, investmentId: string, userId: string): Promise<void> {
  if (chatId.toString() !== SUPPORT_USER_ID) {
    console.warn('Access denied for investment rejection')
    return
  }

  try {
    await rejectInvestment(investmentId)

    bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: messageId }
    ).catch(() => {})

    bot.sendMessage(chatId, `Инвестиция ${investmentId} отклонена.\n\nПользователь получит уведомление.`)

    const userSession = sessionManager.get(parseInt(userId))
    const userLang = userSession?.language || 'en'

    bot.sendMessage(parseInt(userId), t(userLang, 'paymentDeclined'), { 
      parse_mode: 'HTML' 
    }).catch(() => {})

    sessionManager.delete(parseInt(userId))

  } catch (error: any) {
    console.error('Error rejecting investment:', error.message)
    bot.sendMessage(chatId, t('ru', 'errorRejecting'))
  }
}
