import type { Message } from 'node-telegram-bot-api'
import { authSessions } from '../telegram-botauthinfo'

/**
 * Обработка текстовых сообщений
 */

export async function handleMessage(msg: Message) {
  if (!msg.text || msg.text.startsWith('/')) return

  const chatId = msg.chat.id
  const session = authSessions.get(chatId)

  // Здесь можно добавить обработку состояний авторизации
  // если они потребуются в будущем
}
