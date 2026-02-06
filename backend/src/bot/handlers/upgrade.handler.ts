import { bot } from '../core'
import { sessionManager } from '../core'
import { t } from '../localization'
import { buildUpgradeMessage } from '../utils'
import { fetchUpgrade, approveUpgrade, rejectUpgrade } from '../services'
import { SUPPORT_USER_ID } from '../config'

/**
 * Обработка апгрейдов
 */

export async function handleUpgradeStart(chatId: number, upgradeId: string): Promise<void> {
  try {
    console.log('Fetching upgrade data:', upgradeId)

    const data = await fetchUpgrade(upgradeId)

    if (!data) {
      bot.sendMessage(chatId, t('en', 'upgradeNotFound'))
      return
    }

    const lang = data.language || 'en'

    sessionManager.set(chatId, {
      upgradeId: upgradeId,
      investmentId: data.investmentId,
      amount: data.additionalAmount,
      planName: data.newPackage,
      adminWallet: data.adminWallet,
      userEmail: data.userEmail,
      senderWallet: data.senderWallet,
      type: 'upgrade',
      language: lang
    })

    const message = buildUpgradeMessage(data, lang)

    bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: t(lang, 'buttonSent'), callback_data: `confirm_upgrade_${upgradeId}` }],
          [{ text: t(lang, 'buttonCancel'), callback_data: `cancel_upgrade_${upgradeId}` }]
        ]
      }
    })

  } catch (error: any) {
    console.error('Error fetching upgrade:', error.message)
    bot.sendMessage(chatId, t('en', 'errorLoading'))
  }
}

export async function handleUpgradeConfirm(chatId: number, messageId: number, upgradeId: string): Promise<void> {
  const session = sessionManager.get(chatId)
  const lang = session?.language || 'en'

  bot.editMessageReplyMarkup(
    { inline_keyboard: [] },
    { chat_id: chatId, message_id: messageId }
  ).catch(() => {})

  bot.sendMessage(chatId, t(lang, 'upgradeRequestSent'))

  try {
    const upgradeData = await fetchUpgrade(upgradeId)

    const supportMessage = `
<b>НОВАЯ ЗАЯВКА НА АПГРЕЙД</b>

<b>Информация о пользователе:</b>
Telegram ID: <code>${chatId}</code>
User ID: <code>${upgradeData.userId}</code>
Email: <code>${upgradeData.userEmail}</code>

<b>Детали апгрейда:</b>
Investment ID: <code>${upgradeData.investmentId}</code>
Upgrade ID: <code>${upgradeId}</code>

<b>Изменения:</b>
План: ${upgradeData.oldPackage} → <b>${upgradeData.newPackage}</b>
APY: ${upgradeData.oldAPY}% → <b>${upgradeData.newAPY}%</b>
Текущая сумма: $${upgradeData.oldAmount}
Пополнение: <b>+$${upgradeData.additionalAmount}</b>
Новая сумма: <b>$${upgradeData.totalAmount}</b>

<b>Кошелёк админа:</b>
<code>${upgradeData.adminWallet}</code>

<b>Кошелёк отправителя:</b>
<code>${upgradeData.senderWallet}</code>

<b>Дата заявки:</b> ${new Date().toLocaleString('ru-RU')}

Проверьте поступление средств (${upgradeData.additionalAmount} USDT) и подтвердите апгрейд:
    `.trim()

    await bot.sendMessage(SUPPORT_USER_ID!, supportMessage, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: t('ru', 'buttonApproveUpgrade'), callback_data: `approve_upgrade_${upgradeId}_${chatId}` },
            { text: t('ru', 'buttonReject'), callback_data: `reject_upgrade_${upgradeId}_${chatId}` }
          ]
        ]
      }
    })

    console.log('Support notified for upgrade:', upgradeId)
  } catch (error: any) {
    console.error('Error notifying support about upgrade:', error.message)
  }
}

export async function handleUpgradeCancel(chatId: number, messageId: number, upgradeId: string): Promise<void> {
  const session = sessionManager.get(chatId)
  const lang = session?.language || 'en'

  bot.editMessageReplyMarkup(
    { inline_keyboard: [] },
    { chat_id: chatId, message_id: messageId }
  ).catch(() => {})

  bot.sendMessage(chatId, t(lang, 'requestCancelled'))
  sessionManager.delete(chatId)
}

export async function handleUpgradeApprove(chatId: number, messageId: number, upgradeId: string, userId: string): Promise<void> {
  if (chatId.toString() !== SUPPORT_USER_ID) {
    console.warn('Access denied for upgrade approval')
    return
  }

  try {
    await approveUpgrade(upgradeId, chatId.toString())

    bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: messageId }
    ).catch(() => {})

    bot.sendMessage(chatId, `Апгрейд ${upgradeId} подтверждён!\n\nПользователь получит уведомление.`)

    const userSession = sessionManager.get(parseInt(userId))
    const userLang = userSession?.language || 'ru'

    bot.sendMessage(parseInt(userId), t(userLang, 'upgradeConfirmed'), { 
      parse_mode: 'HTML' 
    }).catch(() => {})

    sessionManager.delete(parseInt(userId))

  } catch (error: any) {
    console.error('Error approving upgrade:', error.message)
    bot.sendMessage(chatId, t('ru', 'errorApproving'))
  }
}

export async function handleUpgradeReject(chatId: number, messageId: number, upgradeId: string, userId: string): Promise<void> {
  if (chatId.toString() !== SUPPORT_USER_ID) {
    console.warn('Access denied for upgrade rejection')
    return
  }

  try {
    await rejectUpgrade(upgradeId, chatId.toString())

    bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: messageId }
    ).catch(() => {})

    bot.sendMessage(chatId, `Апгрейд ${upgradeId} отклонён.\n\nПользователь получит уведомление.`)

    const userSession = sessionManager.get(parseInt(userId))
    const userLang = userSession?.language || 'ru'

    bot.sendMessage(parseInt(userId), t(userLang, 'upgradeDeclined'), { 
      parse_mode: 'HTML' 
    }).catch(() => {})

    sessionManager.delete(parseInt(userId))

  } catch (error: any) {
    console.error('Error rejecting upgrade:', error.message)
    bot.sendMessage(chatId, t('ru', 'errorRejecting'))
  }
}
