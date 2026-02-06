import TelegramBot from 'node-telegram-bot-api'

export class TelegramService {
  private static bot: TelegramBot | null = null

  static initialize(token: string): void {
    if (!token) {
      console.warn('⚠️ Telegram bot token not provided. Bot will not start.')
      return
    }

    try {
      this.bot = new TelegramBot(token, { polling: false })
      console.log('✅ Telegram service initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Telegram service:', error)
    }
  }

  static async sendMessage(
    chatId: string | number, 
    message: string, 
    options?: TelegramBot.SendMessageOptions
  ): Promise<void> {
    if (!this.bot) {
      console.error('❌ Telegram bot not initialized')
      return
    }

    try {
      await this.bot.sendMessage(chatId, message, options)
      console.log('✅ Message sent to:', chatId)
    } catch (error) {
      console.error('❌ Failed to send Telegram message:', error)
    }
  }

  static async notifySupport(
    supportId: string, 
    message: string, 
    options?: TelegramBot.SendMessageOptions
  ): Promise<void> {
    return this.sendMessage(supportId, message, options)
  }

  static async notifyUser(
    userId: string, 
    message: string, 
    options?: TelegramBot.SendMessageOptions
  ): Promise<void> {
    return this.sendMessage(userId, message, options)
  }
}
