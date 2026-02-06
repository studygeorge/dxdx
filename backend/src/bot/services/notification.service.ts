import { bot } from '../core'
import { ADMIN_CHAT_ID, SUPPORT_USER_ID } from '../config'
import { t } from '../localization'
import { formatDateTime } from '../utils'
import type { 
  KYCData, 
  WithdrawalData, 
  EarlyWithdrawalData, 
  PartialWithdrawalData,
  UpgradeData 
} from '../types'

/**
 * Сервис уведомлений администратора
 */

export async function sendTelegramMessage(chatId: string | number, message: string, options: any = {}) {
  try {
    await bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      ...options
    })
    return { success: true }
  } catch (error: any) {
    console.error('Error sending Telegram message:', error.message)
    return { success: false, error: error.message }
  }
}

export async function notifyKYCSubmission(kycData: KYCData) {
  try {
    const lang = kycData.language || 'ru'
    const currentTime = formatDateTime()

    const message = `
НОВАЯ ЗАЯВКА НА KYC ВЕРИФИКАЦИЮ

Информация о пользователе:
User ID: <code>${kycData.userId}</code>
Email: <code>${kycData.userEmail}</code>
Имя: <b>${kycData.userName}</b>

Дата подачи: ${currentTime}
    `.trim()

    await bot.sendMessage(ADMIN_CHAT_ID!, message, {
      parse_mode: 'HTML'
    })

    console.log('KYC notification sent to admin. User ID:', kycData.userId)
    return { success: true }
  } catch (error: any) {
    console.error('Error sending KYC notification:', error.message)
    return { success: false, error: error.message }
  }
}

export async function notifyWithdrawalRequest(withdrawalData: WithdrawalData) {
  try {
    const lang = withdrawalData.language || 'ru'
    const currentTime = formatDateTime()

    const totalAmount = withdrawalData.amount
    const actualProfit = totalAmount - withdrawalData.invested

    const message = `
${t(lang, 'withdrawalTitle')}

${t(lang, 'withdrawalUserInfo')}
User ID: <code>${withdrawalData.userId}</code>
Email: <code>${withdrawalData.userEmail}</code>

${t(lang, 'withdrawalDetails')}
Investment ID: <code>${withdrawalData.investmentId}</code>
Withdrawal ID: <code>${withdrawalData.withdrawalId}</code>
${t(lang, 'plan')}: <b>${withdrawalData.planName}</b>
${t(lang, 'invested')}: $${withdrawalData.invested.toFixed(2)}
${t(lang, 'profit')}: +$${actualProfit.toFixed(2)}
<b>${t(lang, 'withdrawAmount')}: $${totalAmount.toFixed(2)} USDT</b>

${t(lang, 'trc20Address')}
<code>${withdrawalData.trc20Address}</code>

${t(lang, 'requestDate')} ${currentTime}

Проверьте корректность адреса и подтвердите отправку средств:
    `.trim()

    await bot.sendMessage(ADMIN_CHAT_ID!, message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: t('ru', 'buttonSentFunds'), callback_data: `approve_withdrawal_${withdrawalData.withdrawalId}` },
            { text: t('ru', 'buttonReject'), callback_data: `reject_withdrawal_${withdrawalData.withdrawalId}` }
          ]
        ]
      }
    })

    console.log('✅ Full withdrawal notification sent. Withdrawal ID:', withdrawalData.withdrawalId)
    return { success: true }
  } catch (error: any) {
    console.error('❌ Error sending withdrawal notification:', error.message)
    return { success: false, error: error.message }
  }
}

export async function notifyEarlyWithdrawal(withdrawalData: EarlyWithdrawalData) {
  try {
    const lang = withdrawalData.language || 'ru'
    const currentTime = formatDateTime()

    const message = `
<b>НОВАЯ ЗАЯВКА НА ДОСРОЧНЫЙ ВЫВОД</b>

<b>Информация о пользователе:</b>
User ID: <code>${withdrawalData.userId}</code>
Email: <code>${withdrawalData.userEmail}</code>

<b>Детали вывода:</b>
Investment ID: <code>${withdrawalData.investmentId}</code>
Early Withdrawal ID: <code>${withdrawalData.withdrawalId}</code>
План: <b>${withdrawalData.planName}</b>

<b>Расчет:</b>
Инвестировано: $${withdrawalData.investmentAmount.toFixed(2)}
Дней инвестировано: ${withdrawalData.daysInvested} / 30
${withdrawalData.withdrawnProfits > 0 ? `Уже снято прибыли: $${withdrawalData.withdrawnProfits.toFixed(2)}` : ''}
<b>Сумма к выводу: $${withdrawalData.totalAmount.toFixed(2)}</b>

<b>TRC-20 адрес:</b>
<code>${withdrawalData.trc20Address}</code>

<b>Дата заявки:</b> ${currentTime}

${withdrawalData.withdrawnProfits > 0 ? `<b>Расчет:</b> $${withdrawalData.investmentAmount.toFixed(2)} - $${withdrawalData.withdrawnProfits.toFixed(2)} = $${withdrawalData.totalAmount.toFixed(2)}` : ''}

Подтвердите досрочный вывод средств:
    `.trim()

    await bot.sendMessage(ADMIN_CHAT_ID!, message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Отправил средства', callback_data: `approve_early_withdrawal_${withdrawalData.withdrawalId}` },
            { text: 'Отклонить', callback_data: `reject_early_withdrawal_${withdrawalData.withdrawalId}` }
          ]
        ]
      }
    })

    console.log('Early withdrawal notification sent to admin. Withdrawal ID:', withdrawalData.withdrawalId)
    return { 
      success: true,
      botLink: `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=early_${withdrawalData.withdrawalId}`
    }
  } catch (error: any) {
    console.error('Error sending early withdrawal notification:', error.message)
    return { success: false, error: error.message }
  }
}

export async function notifyPartialWithdrawal(withdrawalData: PartialWithdrawalData) {
  try {
    const lang = withdrawalData.language || 'ru'
    const currentTime = formatDateTime()

    const message = `
<b>НОВАЯ ЗАЯВКА НА ЧАСТИЧНЫЙ ВЫВОД ПРИБЫЛИ</b>

<b>Информация о пользователе:</b>
User ID: <code>${withdrawalData.userId}</code>
Email: <code>${withdrawalData.userEmail}</code>

<b>Детали вывода:</b>
Investment ID: <code>${withdrawalData.investmentId}</code>
Partial Withdrawal ID: <code>${withdrawalData.withdrawalId}</code>
План: <b>${withdrawalData.planName}</b>
Инвестировано: $${withdrawalData.investmentAmount.toFixed(2)}

<b>Расчет:</b>
<b>Запрошенная сумма вывода: $${withdrawalData.amount.toFixed(2)}</b>
Всего ранее снято: $${withdrawalData.totalWithdrawn.toFixed(2)}
Новый баланс снятий: $${(withdrawalData.totalWithdrawn + withdrawalData.amount).toFixed(2)}

<b>TRC-20 адрес:</b>
<code>${withdrawalData.trc20Address}</code>

<b>Дата заявки:</b> ${currentTime}

<b>Основная сумма остается в инвестиции</b>

Подтвердите частичный вывод прибыли:
    `.trim()

    await bot.sendMessage(ADMIN_CHAT_ID!, message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Отправил средства', callback_data: `approve_partial_withdrawal_${withdrawalData.withdrawalId}` },
            { text: 'Отклонить', callback_data: `reject_partial_withdrawal_${withdrawalData.withdrawalId}` }
          ]
        ]
      }
    })

    console.log('Partial withdrawal notification sent to admin. Withdrawal ID:', withdrawalData.withdrawalId)
    return { 
      success: true,
      botLink: `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=partial_${withdrawalData.withdrawalId}`
    }
  } catch (error: any) {
    console.error('Error sending partial withdrawal notification:', error.message)
    return { success: false, error: error.message }
  }
}

export async function notifyReferralBonusWithdrawal(
  withdrawalId: string,
  userId: string,
  userEmail: string,
  amount: number,
  trc20Address: string,
  level: number
) {
  if (!bot) {
    console.warn('Telegram bot not initialized, skipping notification')
    return
  }

  const supportChatId = ADMIN_CHAT_ID || SUPPORT_USER_ID
  if (!supportChatId) {
    console.warn('ADMIN_CHAT_ID not configured')
    return
  }

  try {
    const shortId = withdrawalId.substring(0, 8)
    const currentTime = formatDateTime()

    const message = `
<b>🔔 НОВАЯ ЗАЯВКА НА ВЫВОД РЕФЕРАЛЬНОГО БОНУСА</b>

<b>Информация о пользователе:</b>
User ID: <code>${userId.substring(0, 8)}...</code>
Email: <code>${userEmail}</code>

<b>Детали вывода:</b>
Withdrawal ID: <code>${withdrawalId}</code>
Уровень: <b>${level}</b>
Сумма бонуса: <b>$${amount.toFixed(2)} USDT</b>

<b>TRC-20 адрес получателя:</b>
<code>${trc20Address}</code>

<b>Дата заявки:</b> ${currentTime}

Переведите средства на указанный адрес и подтвердите операцию:
    `.trim()

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: '✅ Отправил средства',
            callback_data: `rba_${shortId}`
          },
          {
            text: '❌ Отклонить',
            callback_data: `rbr_${shortId}`
          }
        ]
      ]
    }

    console.log('📤 Sending referral bonus withdrawal notification to Telegram...')
    console.log('   Full withdrawal ID:', withdrawalId)
    console.log('   Short ID for buttons:', shortId)
    console.log('   Admin Chat ID:', supportChatId)

    await bot.sendMessage(supportChatId, message, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    })

    console.log('✅ Referral bonus withdrawal notification sent successfully')

  } catch (error: any) {
    console.error('❌ Error sending referral bonus withdrawal notification:', error.message)
    if (error.response) {
      console.error('   Response:', error.response)
    }
    throw error
  }
}

export async function notifyUpgradeRequest(upgradeData: UpgradeData) {
  try {
    const lang = upgradeData.language || 'ru'
    const currentTime = formatDateTime()

    const message = `
<b>НОВАЯ ЗАЯВКА НА АПГРЕЙД</b>

<b>Информация о пользователе:</b>
User ID: <code>${upgradeData.userId}</code>
Email: <code>${upgradeData.userEmail}</code>

<b>Детали апгрейда:</b>
Investment ID: <code>${upgradeData.investmentId}</code>
Upgrade ID: <code>${upgradeData.upgradeId}</code>

<b>Изменения:</b>
План: ${upgradeData.oldPackage} → <b>${upgradeData.newPackage}</b>
APY: ${upgradeData.oldAPY}% → <b>${upgradeData.newAPY}%</b>
Текущая сумма: $${upgradeData.oldAmount.toFixed(2)}
Пополнение: <b>+$${upgradeData.additionalAmount.toFixed(2)}</b>
<b>Новая сумма: $${upgradeData.totalAmount.toFixed(2)}</b>

<b>Кошелёк админа:</b>
<code>${upgradeData.adminWallet}</code>

<b>Кошелёк отправителя:</b>
<code>${upgradeData.senderWallet}</code>

<b>Дата заявки:</b> ${currentTime}

Проверьте поступление средств и подтвердите апгрейд:
    `.trim()

    await bot.sendMessage(ADMIN_CHAT_ID!, message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: t('ru', 'buttonApproveUpgrade'), callback_data: `approve_upgrade_${upgradeData.upgradeId}` },
            { text: t('ru', 'buttonReject'), callback_data: `reject_upgrade_${upgradeData.upgradeId}` }
          ]
        ]
      }
    })

    console.log('Upgrade notification sent to admin. Upgrade ID:', upgradeData.upgradeId)
    return { success: true }
  } catch (error: any) {
    console.error('Error sending upgrade notification:', error.message)
    return { success: false, error: error.message }
  }
}
