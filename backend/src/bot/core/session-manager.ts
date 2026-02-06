import { UserSession } from '../types'

/**
 * Менеджер пользовательских сессий
 */
export class SessionManager {
  private sessions: Map<number, UserSession> = new Map()

  get(chatId: number): UserSession | undefined {
    return this.sessions.get(chatId)
  }

  set(chatId: number, session: UserSession): void {
    this.sessions.set(chatId, session)
  }

  delete(chatId: number): boolean {
    return this.sessions.delete(chatId)
  }

  has(chatId: number): boolean {
    return this.sessions.has(chatId)
  }

  updateLanguage(chatId: number, language: string): void {
    const session = this.sessions.get(chatId)
    if (session) {
      session.language = language
      this.sessions.set(chatId, session)
    }
  }

  createSession(chatId: number, language: string, userEmail: string = ''): UserSession {
    const session: UserSession = {
      amount: 0,
      planName: '',
      userEmail,
      type: 'investment',
      language
    }
    this.sessions.set(chatId, session)
    return session
  }
}

// Singleton экземпляр
export const sessionManager = new SessionManager()
