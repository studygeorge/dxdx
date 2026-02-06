/**
 * ========================================
 * DXCAPAI TELEGRAM BOT - MAIN ENTRY POINT
 * ========================================
 */

import { bot } from './core'
import { 
  BOT_TOKEN, 
  API_BASE_URL, 
  SUPPORT_USER_ID, 
  ADMIN_CHAT_ID 
} from './config'
import { handleStartCommand } from './handlers/start-command.handler'
import { handleMessage } from './handlers/message.handler'
import { handleCallbackQuery } from './handlers/callback-query.handler'
import { initializeProfitNotifier } from './services/profit-notifier.service'
import { sessionManager } from './core'

// Экспорт для внешнего использования
export { bot, sessionManager as userSessions }
export { sendTelegramMessage } from './services/notification.service'

// Экспорт всех функций уведомлений для использования в API
export {
  notifyKYCSubmission,
  notifyWithdrawalRequest,
  notifyEarlyWithdrawal,
  notifyPartialWithdrawal,
  notifyReferralBonusWithdrawal,
  notifyUpgradeRequest
} from './services/notification.service'

// ✅ ДОБАВЛЕНО: функция notifyBulkReferralWithdrawal
export async function notifyBulkReferralWithdrawal(
  userId: string,
  userEmail: string,
  totalAmount: number,
  trc20Address: string,
  count: number
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
    const currentTime = new Date().toLocaleString('ru-RU', {
      timeZone: 'Europe/Moscow',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

    const message = `
<b>🔔 НОВАЯ МАССОВАЯ ЗАЯВКА НА ВЫВОД РЕФЕРАЛЬНЫХ БОНУСОВ</b>

<b>Информация о пользователе:</b>
User ID: <code>${userId.substring(0, 8)}...</code>
Email: <code>${userEmail}</code>

<b>Детали вывода:</b>
Количество бонусов: <b>${count}</b>
Общая сумма: <b>$${totalAmount.toFixed(2)} USDT</b>

<b>TRC-20 адрес получателя:</b>
<code>${trc20Address}</code>

<b>Дата заявки:</b> ${currentTime}

Переведите средства на указанный адрес и подтвердите операцию через админку или БД.
    `.trim()

    console.log('📤 Sending bulk referral bonus withdrawal notification...')

    await bot.sendMessage(supportChatId, message, {
      parse_mode: 'HTML'
    })

    console.log('✅ Bulk referral bonus withdrawal notification sent successfully')

  } catch (error: any) {
    console.error('❌ Error sending bulk referral withdrawal notification:', error.message)
    throw error
  }
}

// ========================================
// ИНИЦИАЛИЗАЦИЯ БОТА
// ========================================

console.log('========================================')
console.log('🤖 Telegram bot starting...')
console.log('========================================')
console.log('📋 Configuration:')
console.log('   Support User ID:', SUPPORT_USER_ID)
console.log('   Admin Chat ID:', ADMIN_CHAT_ID)
console.log('   API Base URL:', API_BASE_URL)
console.log('========================================')

// ========================================
// РЕГИСТРАЦИЯ ОБРАБОТЧИКОВ
// ========================================

bot.onText(/\/start(?:\s+(.+))?/, handleStartCommand)
bot.on('message', handleMessage)
bot.on('callback_query', handleCallbackQuery)

bot.on('polling_error', (error: Error) => {
  console.error('❌ Polling error:', error.message)
})

// ========================================
// ИНИЦИАЛИЗАЦИЯ ДОПОЛНИТЕЛЬНЫХ СЕРВИСОВ
// ========================================

initializeProfitNotifier(bot)
console.log('✅ Profit notifier initialized')

console.log('========================================')
console.log('✅ Telegram bot started successfully!')
console.log('🎧 Listening for updates...')
console.log('========================================')
