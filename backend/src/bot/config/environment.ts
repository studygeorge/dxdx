import dotenv from 'dotenv'

dotenv.config()

/**
 * Валидация и экспорт переменных окружения
 */

export const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
export const API_BASE_URL = process.env.API_BASE_URL || 'https://dxcapital-ai.com'
export const SUPPORT_USER_ID = process.env.SUPPORT_TELEGRAM_ID
export const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || process.env.SUPPORT_TELEGRAM_ID
export const API_TOKEN = process.env.API_TOKEN
export const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME

// Валидация критических переменных
if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in .env')
  process.exit(1)
}

if (!SUPPORT_USER_ID) {
  console.error('❌ SUPPORT_TELEGRAM_ID not found in .env')
  process.exit(1)
}

console.log('✅ Environment variables loaded:')
console.log('   Bot Token:', BOT_TOKEN ? '***' + BOT_TOKEN.slice(-4) : 'NOT SET')
console.log('   API Base URL:', API_BASE_URL)
console.log('   Support User ID:', SUPPORT_USER_ID)
console.log('   Admin Chat ID:', ADMIN_CHAT_ID)
