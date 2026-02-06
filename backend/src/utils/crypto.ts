import crypto from 'crypto'
import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!
const ENCRYPTION_IV = process.env.ENCRYPTION_IV!

export class CryptoUtils {
  static encrypt(text: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY, {
        iv: CryptoJS.enc.Utf8.parse(ENCRYPTION_IV),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })
      return encrypted.toString()
    } catch (error) {
      throw new Error('Encryption failed')
    }
  }

  static decrypt(encryptedText: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY, {
        iv: CryptoJS.enc.Utf8.parse(ENCRYPTION_IV),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })
      return decrypted.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      throw new Error('Decryption failed')
    }
  }

  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  static hashWithSalt(data: string, salt?: string): string {
    const saltToUse = salt || process.env.HASH_SALT!
    return crypto.pbkdf2Sync(data, saltToUse, 10000, 64, 'sha512').toString('hex')
  }

  // Исправляем генерацию 2FA секрета
  static generate2FASecret(): string {
    const bytes = crypto.randomBytes(20)
    return bytes.toString('hex').toUpperCase()
  }
}