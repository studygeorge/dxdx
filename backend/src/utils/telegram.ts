import crypto from 'crypto'
import { TelegramAuthData } from '../types'

export class TelegramUtils {
  private static botToken = process.env.TELEGRAM_BOT_TOKEN!

  /**
   * Проверяет подлинность данных от Telegram Login Widget
   * https://core.telegram.org/widgets/login#checking-authorization
   */
  static verifyTelegramAuth(authData: TelegramAuthData): boolean {
    const { hash, ...data } = authData

    // Создаем строку для проверки
    const checkString = Object.keys(data)
      .sort()
      .map(key => `${key}=${(data as any)[key]}`)
      .join('\n')

    // Создаем secret key из bot token
    const secretKey = crypto
      .createHash('sha256')
      .update(this.botToken)
      .digest()

    // Создаем hash для проверки
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(checkString)
      .digest('hex')

    // Проверяем что hash совпадает
    if (calculatedHash !== hash) {
      return false
    }

    // Проверяем что данные не старше 24 часов
    const authDate = authData.auth_date
    const currentTime = Math.floor(Date.now() / 1000)
    const timeDiff = currentTime - authDate

    if (timeDiff > 86400) { // 24 часа
      return false
    }

    return true
  }

  /**
   * Проверяет разрешен ли этот админ
   * Поддерживает несколько ID через запятую
   */
  static isAllowedAdmin(telegramId: string, username?: string): boolean {
    const allowedIds = process.env.ALLOWED_ADMIN_TELEGRAM_IDS || process.env.ALLOWED_ADMIN_TELEGRAM_ID
    
    if (!allowedIds) {
      console.warn('⚠️ No ALLOWED_ADMIN_TELEGRAM_IDS configured in .env')
      return false
    }

    // Разбиваем по запятой и проверяем каждый ID
    const allowedIdList = allowedIds.split(',').map(id => id.trim())
    
    if (!allowedIdList.includes(telegramId)) {
      return false
    }

    return true
  }
}
