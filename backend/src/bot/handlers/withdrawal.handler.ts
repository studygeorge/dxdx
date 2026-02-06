import { bot } from '../core'
import { sessionManager } from '../core'
import { t } from '../localization'
import { buildEarlyWithdrawalMessage, buildPartialWithdrawalMessage, buildReferralBonusMessage } from '../utils'
import { 
  fetchEarlyWithdrawal, 
  fetchPartialWithdrawal, 
  fetchReferralBonusWithdrawal,
  approveEarlyWithdrawal,
  rejectEarlyWithdrawal,
  approvePartialWithdrawal,
  rejectPartialWithdrawal,
  approveFullWithdrawal,
  rejectFullWithdrawal,
  approveReferralBonus,
  rejectReferralBonus
} from '../services'
import { SUPPORT_USER_ID } from '../config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Обработка всех типов выводов
 */

// ============ EARLY WITHDRAWAL ============

export async function handleEarlyWithdrawalStart(chatId: number, withdrawalId: string): Promise<void> {
  try {
    console.log('Fetching early withdrawal data:', withdrawalId)

    const data = await fetchEarlyWithdrawal(withdrawalId)

    if (!data) {
      bot.sendMessage(chatId, t('ru', 'earlyWithdrawalNotFound'))
      return
    }

    const lang = data.language || 'ru'

    sessionManager.set(chatId, {
      earlyWithdrawalId: withdrawalId,
      investmentId: data.investmentId,
      amount: data.totalAmount,
      planName: data.planName,
      userEmail: data.userEmail,
      type: 'early_withdrawal',
      language: lang
    })

    const message = buildEarlyWithdrawalMessage(data, lang)

    bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: t(lang, 'buttonConfirm'), callback_data: `confirm_early_${withdrawalId}` }],
          [{ text: t(lang, 'buttonCancel'), callback_data: `cancel_early_${withdrawalId}` }]
        ]
      }
    })

  } catch (error: any) {
    console.error('Error fetching early withdrawal:', error.message)
    bot.sendMessage(chatId, t('ru', 'errorLoading'))
  }
}

export async function handleEarlyWithdrawalConfirm(chatId: number, messageId: number, withdrawalId: string): Promise<void> {
  const session = sessionManager.get(chatId)
  const lang = session?.language || 'ru'

  bot.editMessageReplyMarkup(
    { inline_keyboard: [] },
    { chat_id: chatId, message_id: messageId }
  ).catch(() => {})

  bot.sendMessage(chatId, t(lang, 'earlyWithdrawalRequestSent'))

  try {
    const withdrawalData = await fetchEarlyWithdrawal(withdrawalId)

    const supportMessage = `
<b>НОВАЯ ЗАЯВКА НА ДОСРОЧНЫЙ ВЫВОД</b>

<b>Информация о пользователе:</b>
Telegram ID: <code>${chatId}</code>
User ID: <code>${withdrawalData.userId}</code>
Email: <code>${withdrawalData.userEmail}</code>

<b>Детали вывода:</b>
Investment ID: <code>${withdrawalData.investmentId}</code>
Early Withdrawal ID: <code>${withdrawalId}</code>
План: <b>${withdrawalData.planName}</b>

<b>Расчет:</b>
Инвестировано: $${withdrawalData.investmentAmount.toFixed(2)}
Дней инвестировано: ${withdrawalData.daysInvested} / 30
${withdrawalData.withdrawnProfits > 0 ? `Уже снято прибыли: $${withdrawalData.withdrawnProfits.toFixed(2)}` : ''}
<b>Сумма к выводу: $${withdrawalData.totalAmount.toFixed(2)}</b>

<b>TRC-20 адрес:</b>
<code>${withdrawalData.trc20Address}</code>

<b>Дата заявки:</b> ${new Date().toLocaleString('ru-RU')}

${withdrawalData.withdrawnProfits > 0 ? `<b>Расчет:</b> $${withdrawalData.investmentAmount.toFixed(2)} - $${withdrawalData.withdrawnProfits.toFixed(2)} = $${withdrawalData.totalAmount.toFixed(2)}` : ''}

Подтвердите досрочный вывод средств:
    `.trim()

    await bot.sendMessage(SUPPORT_USER_ID!, supportMessage, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Отправил средства', callback_data: `approve_early_withdrawal_${withdrawalId}` },
            { text: 'Отклонить', callback_data: `reject_early_withdrawal_${withdrawalId}` }
          ]
        ]
      }
    })

    console.log('Support notified for early withdrawal:', withdrawalId)
  } catch (error: any) {
    console.error('Error notifying support about early withdrawal:', error.message)
  }
}

export async function handleEarlyWithdrawalCancel(chatId: number, messageId: number, withdrawalId: string): Promise<void> {
  const session = sessionManager.get(chatId)
  const lang = session?.language || 'ru'

  bot.editMessageReplyMarkup(
    { inline_keyboard: [] },
    { chat_id: chatId, message_id: messageId }
  ).catch(() => {})

  bot.sendMessage(chatId, t(lang, 'requestCancelled'))
  sessionManager.delete(chatId)
}

export async function handleEarlyWithdrawalApprove(chatId: number, messageId: number, withdrawalId: string): Promise<void> {
  if (chatId.toString() !== SUPPORT_USER_ID) {
    console.warn('Access denied for early withdrawal approval')
    return
  }

  try {
    console.log('Approving EARLY withdrawal:', withdrawalId)

    await approveEarlyWithdrawal(withdrawalId, chatId.toString())

    bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: messageId }
    ).catch(() => {})

    bot.sendMessage(
      chatId,
      `Досрочный вывод подтверждён!\n\nWithdrawal ID: \`${withdrawalId}\``,
      { parse_mode: 'Markdown' }
    )

    console.log('Early withdrawal approved:', withdrawalId)
  } catch (error: any) {
    console.error('Error approving early withdrawal:', error.message)
  }
}

export async function handleEarlyWithdrawalReject(chatId: number, messageId: number, withdrawalId: string): Promise<void> {
  if (chatId.toString() !== SUPPORT_USER_ID) {
    console.warn('Access denied for early withdrawal rejection')
    return
  }

  try {
    console.log('Rejecting EARLY withdrawal:', withdrawalId)

    await rejectEarlyWithdrawal(withdrawalId, chatId.toString())

    bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: messageId }
    ).catch(() => {})

    bot.sendMessage(
      chatId,
      `Досрочный вывод отклонён\n\nWithdrawal ID: \`${withdrawalId}\``,
      { parse_mode: 'Markdown' }
    )

    console.log('Early withdrawal rejected:', withdrawalId)
  } catch (error: any) {
    console.error('Error rejecting early withdrawal:', error.message)
  }
}

// ============ PARTIAL WITHDRAWAL ============

export async function handlePartialWithdrawalStart(chatId: number, withdrawalId: string): Promise<void> {
  try {
    console.log('Fetching partial withdrawal data:', withdrawalId)

    const data = await fetchPartialWithdrawal(withdrawalId)

    if (!data) {
      bot.sendMessage(chatId, t('ru', 'partialWithdrawalNotFound'))
      return
    }

    const lang = data.language || 'ru'

    sessionManager.set(chatId, {
      partialWithdrawalId: withdrawalId,
      investmentId: data.investmentId,
      amount: data.amount,
      planName: data.planName,
      userEmail: data.userEmail,
      type: 'partial_withdrawal',
      language: lang
    })

    const message = buildPartialWithdrawalMessage(data, lang)

    bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: t(lang, 'buttonConfirm'), callback_data: `confirm_partial_${withdrawalId}` }],
          [{ text: t(lang, 'buttonCancel'), callback_data: `cancel_partial_${withdrawalId}` }]
        ]
      }
    })

  } catch (error: any) {
    console.error('Error fetching partial withdrawal:', error.message)
    bot.sendMessage(chatId, t('ru', 'errorLoading'))
  }
}

export async function handlePartialWithdrawalConfirm(chatId: number, messageId: number, withdrawalId: string): Promise<void> {
  const session = sessionManager.get(chatId)
  const lang = session?.language || 'ru'

  bot.editMessageReplyMarkup(
    { inline_keyboard: [] },
    { chat_id: chatId, message_id: messageId }
  ).catch(() => {})

  bot.sendMessage(chatId, t(lang, 'partialWithdrawalRequestSent'))

  try {
    const withdrawalData = await fetchPartialWithdrawal(withdrawalId)

    const supportMessage = `
<b>НОВАЯ ЗАЯВКА НА ЧАСТИЧНЫЙ ВЫВОД ПРИБЫЛИ</b>

<b>Информация о пользователе:</b>
Telegram ID: <code>${chatId}</code>
User ID: <code>${withdrawalData.userId}</code>
Email: <code>${withdrawalData.userEmail}</code>

<b>Детали вывода:</b>
Investment ID: <code>${withdrawalData.investmentId}</code>
Partial Withdrawal ID: <code>${withdrawalId}</code>
План: <b>${withdrawalData.planName}</b>
Инвестировано: $${withdrawalData.investmentAmount.toFixed(2)}

<b>Расчет:</b>
<b>Вывод прибыли: $${withdrawalData.amount.toFixed(2)}</b>
Всего снято прибыли: $${withdrawalData.totalWithdrawn.toFixed(2)}

<b>TRC-20 адрес:</b>
<code>${withdrawalData.trc20Address}</code>

<b>Дата заявки:</b> ${new Date().toLocaleString('ru-RU')}

<b>Основная сумма остается в инвестиции</b>

Подтвердите частичный вывод прибыли:
    `.trim()

    await bot.sendMessage(SUPPORT_USER_ID!, supportMessage, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Отправил средства', callback_data: `approve_partial_withdrawal_${withdrawalId}` },
            { text: 'Отклонить', callback_data: `reject_partial_withdrawal_${withdrawalId}` }
          ]
        ]
      }
    })

    console.log('Support notified for partial withdrawal:', withdrawalId)
  } catch (error: any) {
    console.error('Error notifying support about partial withdrawal:', error.message)
  }
}

export async function handlePartialWithdrawalCancel(chatId: number, messageId: number, withdrawalId: string): Promise<void> {
  const session = sessionManager.get(chatId)
  const lang = session?.language || 'ru'

  bot.editMessageReplyMarkup(
    { inline_keyboard: [] },
    { chat_id: chatId, message_id: messageId }
  ).catch(() => {})

  bot.sendMessage(chatId, t(lang, 'requestCancelled'))
  sessionManager.delete(chatId)
}

export async function handlePartialWithdrawalApprove(chatId: number, messageId: number, withdrawalId: string): Promise<void> {
  if (chatId.toString() !== SUPPORT_USER_ID) {
    console.warn('Access denied for partial withdrawal approval')
    return
  }

  try {
    console.log('Approving PARTIAL withdrawal:', withdrawalId)

    await approvePartialWithdrawal(withdrawalId, chatId.toString())

    bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: messageId }
    ).catch(() => {})

    bot.sendMessage(
      chatId,
      `Частичный вывод подтверждён!\n\nWithdrawal ID: \`${withdrawalId}\``,
      { parse_mode: 'Markdown' }
    )

    console.log('Partial withdrawal approved:', withdrawalId)
  } catch (error: any) {
    console.error('Error approving partial withdrawal:', error.message)
  }
}

export async function handlePartialWithdrawalReject(chatId: number, messageId: number, withdrawalId: string): Promise<void> {
  if (chatId.toString() !== SUPPORT_USER_ID) {
    console.warn('Access denied for partial withdrawal rejection')
    return
  }

  try {
    console.log('Rejecting PARTIAL withdrawal:', withdrawalId)

    await rejectPartialWithdrawal(withdrawalId, chatId.toString())

    bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: messageId }
    ).catch(() => {})

    bot.sendMessage(
      chatId,
      `Частичный вывод отклонён\n\nWithdrawal ID: \`${withdrawalId}\``,
      { parse_mode: 'Markdown' }
    )

    console.log('Partial withdrawal rejected:', withdrawalId)
  } catch (error: any) {
    console.error('Error rejecting partial withdrawal:', error.message)
  }
}

// ============ FULL WITHDRAWAL ============

export async function handleFullWithdrawalApprove(chatId: number, messageId: number, withdrawalId: string): Promise<void> {
  if (chatId.toString() !== SUPPORT_USER_ID) {
    console.warn('Access denied for full withdrawal approval')
    return
  }

  try {
    console.log('Approving FULL withdrawal:', withdrawalId)

    await approveFullWithdrawal(withdrawalId, chatId.toString())

    bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: messageId }
    ).catch(() => {})

    bot.sendMessage(
      chatId,
      `Полный вывод средств подтверждён!\n\nWithdrawal ID: \`${withdrawalId}\``,
      { parse_mode: 'Markdown' }
    )

    console.log('Full withdrawal approved:', withdrawalId)
  } catch (error: any) {
    console.error('Error approving full withdrawal:', error.message)
  }
}

export async function handleFullWithdrawalReject(chatId: number, messageId: number, withdrawalId: string): Promise<void> {
  if (chatId.toString() !== SUPPORT_USER_ID) {
    console.warn('Access denied for full withdrawal rejection')
    return
  }

  try {
    console.log('Rejecting FULL withdrawal:', withdrawalId)

    await rejectFullWithdrawal(withdrawalId, chatId.toString())

    bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: messageId }
    ).catch(() => {})

    bot.sendMessage(
      chatId,
      `Полный вывод средств отклонён\n\nWithdrawal ID: \`${withdrawalId}\``,
      { parse_mode: 'Markdown' }
    )

    console.log('Full withdrawal rejected:', withdrawalId)
  } catch (error: any) {
    console.error('Error rejecting full withdrawal:', error.message)
  }
}

// ============ REFERRAL BONUS WITHDRAWAL ============

export async function handleReferralBonusStart(chatId: number, withdrawalId: string): Promise<void> {
  try {
    console.log('Fetching referral bonus withdrawal data:', withdrawalId)

    const data = await fetchReferralBonusWithdrawal(withdrawalId)

    if (!data || !data.id) {
      bot.sendMessage(chatId, t('ru', 'referralBonusNotFound'))
      return
    }

    const lang = data.language || 'ru'

    sessionManager.set(chatId, {
      referralBonusWithdrawalId: withdrawalId,
      amount: data.amount,
      planName: '',
      userEmail: data.userEmail,
      type: 'referral_bonus_withdrawal',
      language: lang
    })

    const message = buildReferralBonusMessage(data, lang)

    bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: t(lang, 'buttonConfirm'), callback_data: `confirm_referral_bonus_${withdrawalId}` }],
          [{ text: t(lang, 'buttonCancel'), callback_data: `cancel_referral_bonus_${withdrawalId}` }]
        ]
      }
    })

  } catch (error: any) {
    console.error('Error fetching referral bonus withdrawal:', error.message)
    bot.sendMessage(chatId, t('ru', 'errorLoading'))
  }
}

export async function handleReferralBonusConfirm(chatId: number, messageId: number, withdrawalId: string): Promise<void> {
  const session = sessionManager.get(chatId)
  const lang = session?.language || 'ru'

  bot.editMessageReplyMarkup(
    { inline_keyboard: [] },
    { chat_id: chatId, message_id: messageId }
  ).catch(() => {})

  bot.sendMessage(chatId, t(lang, 'referralBonusRequestSent'))

  console.log('User confirmed referral bonus withdrawal:', withdrawalId)
}

export async function handleReferralBonusCancel(chatId: number, messageId: number, withdrawalId: string): Promise<void> {
  const session = sessionManager.get(chatId)
  const lang = session?.language || 'ru'

  bot.editMessageReplyMarkup(
    { inline_keyboard: [] },
    { chat_id: chatId, message_id: messageId }
  ).catch(() => {})

  bot.sendMessage(chatId, t(lang, 'requestCancelled'))
  sessionManager.delete(chatId)
}

// ✅ ИСПРАВЛЕНО: Используем Prisma вместо fetchReferralBonusWithdrawal
export async function handleReferralBonusApprove(chatId: number, messageId: number, shortId: string, query: any): Promise<void> {
  if (chatId.toString() !== SUPPORT_USER_ID) {
    bot.answerCallbackQuery(query.id, { text: t('ru', 'accessDenied') }).catch(() => {})
    return
  }

  try {
    console.log('🔍 Referral bonus approval clicked, short ID:', shortId)

    // ✅ Ищем withdrawal request по shortId в БД
    const withdrawals = await prisma.referralWithdrawalRequest.findMany({
      where: {
        id: {
          startsWith: shortId
        },
        status: 'PENDING'
      },
      include: {
        referralEarning: true
      }
    })

    if (withdrawals.length === 0) {
      bot.answerCallbackQuery(query.id, { 
        text: 'Заявка не найдена или уже обработана' 
      }).catch(() => {})
      return
    }

    const withdrawal = withdrawals[0]
    const withdrawalId = withdrawal.id

    console.log('✅ Found withdrawal:', withdrawalId, 'Amount:', Number(withdrawal.amount).toFixed(2))

    // ✅ Подтверждаем через API
    await approveReferralBonus(withdrawalId)

    // ✅ Убираем кнопки
    bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: messageId }
    ).catch(() => {})

    bot.answerCallbackQuery(query.id, {
      text: 'Вывод реферального бонуса одобрен',
    })

    // ✅ Отправляем подтверждение с ПРАВИЛЬНОЙ суммой из БД
    bot.sendMessage(
      chatId,
      `✅ Вывод реферального бонуса одобрен!\n\nСумма: $${Number(withdrawal.amount).toFixed(2)} USDT\nАдрес: \`${withdrawal.trc20Address}\`\nRequest ID: \`${withdrawalId}\``,
      { parse_mode: 'Markdown' }
    )

    console.log('✅ Referral bonus withdrawal approved:', withdrawalId)
  } catch (error: any) {
    console.error('❌ Error approving referral bonus withdrawal:', error)
    bot.answerCallbackQuery(query.id, {
      text: 'Ошибка при одобрении вывода',
    })
  }
}

// ✅ ИСПРАВЛЕНО: Используем Prisma вместо fetchReferralBonusWithdrawal
export async function handleReferralBonusReject(chatId: number, messageId: number, shortId: string, query: any): Promise<void> {
  if (chatId.toString() !== SUPPORT_USER_ID) {
    bot.answerCallbackQuery(query.id, { text: t('ru', 'accessDenied') }).catch(() => {})
    return
  }

  try {
    console.log('🔍 Referral bonus rejection clicked, short ID:', shortId)

    // ✅ Ищем withdrawal request по shortId в БД
    const withdrawals = await prisma.referralWithdrawalRequest.findMany({
      where: {
        id: {
          startsWith: shortId
        },
        status: 'PENDING'
      }
    })

    if (withdrawals.length === 0) {
      bot.answerCallbackQuery(query.id, { 
        text: 'Заявка не найдена или уже обработана' 
      }).catch(() => {})
      return
    }

    const withdrawal = withdrawals[0]
    const withdrawalId = withdrawal.id

    console.log('✅ Found withdrawal:', withdrawalId, 'Amount:', Number(withdrawal.amount).toFixed(2))

    // ✅ Отклоняем через API
    await rejectReferralBonus(withdrawalId)

    // ✅ Убираем кнопки
    bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: messageId }
    ).catch(() => {})

    bot.answerCallbackQuery(query.id, {
      text: 'Вывод реферального бонуса отклонен',
    })

    // ✅ Отправляем подтверждение
    bot.sendMessage(
      chatId,
      `❌ Вывод реферального бонуса отклонен\n\nСумма: $${Number(withdrawal.amount).toFixed(2)} USDT\nRequest ID: \`${withdrawalId}\``,
      { parse_mode: 'Markdown' }
    )

    console.log('❌ Referral bonus withdrawal rejected:', withdrawalId)
  } catch (error: any) {
    console.error('❌ Error rejecting referral bonus withdrawal:', error)
    bot.answerCallbackQuery(query.id, {
      text: 'Ошибка при отклонении вывода',
    })
  }
}
