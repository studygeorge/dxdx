import TelegramBot from 'node-telegram-bot-api'
import { BOT_TOKEN, POLLING_OPTIONS } from '../config'

/**
 * Инициализация экземпляра Telegram бота
 */
export const bot = new TelegramBot(BOT_TOKEN!, POLLING_OPTIONS)

console.log('✅ Telegram bot instance created')
