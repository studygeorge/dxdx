import { sign, verify } from 'jsonwebtoken'
import { JWTPayload, AdminJWTPayload } from '../types'

export class JWTUtils {
  // ✅ USER TOKENS - 365 ДНЕЙ
  static generateAccessToken(payload: Omit<JWTPayload, 'type'>): string {
    const tokenPayload = { ...payload, type: 'access' }
    const secret = process.env.JWT_SECRET!
    const expiresIn = '365d' // ✅ 365 дней
    
    return sign(tokenPayload, secret, { expiresIn } as any)
  }

  static generateRefreshToken(payload: Omit<JWTPayload, 'type'>): string {
    const tokenPayload = { ...payload, type: 'refresh' }
    const secret = process.env.JWT_REFRESH_SECRET!
    const expiresIn = '365d' // ✅ 365 дней
    
    return sign(tokenPayload, secret, { expiresIn } as any)
  }

  static verifyAccessToken(token: string): JWTPayload {
    const secret = process.env.JWT_SECRET!
    return verify(token, secret) as JWTPayload
  }

  static verifyRefreshToken(token: string): JWTPayload {
    const secret = process.env.JWT_REFRESH_SECRET!
    return verify(token, secret) as JWTPayload
  }

  // ✅ ADMIN TOKENS - 365 ДНЕЙ
  static generateAdminAccessToken(payload: Omit<AdminJWTPayload, 'type'>): string {
    const tokenPayload = { ...payload, type: 'access' }
    const secret = process.env.ADMIN_JWT_SECRET!
    const expiresIn = '365d' // ✅ 365 дней
    
    return sign(tokenPayload, secret, { expiresIn } as any)
  }

  static generateAdminRefreshToken(payload: Omit<AdminJWTPayload, 'type'>): string {
    const tokenPayload = { ...payload, type: 'refresh' }
    const secret = process.env.ADMIN_JWT_REFRESH_SECRET!
    const expiresIn = '365d' // ✅ 365 дней
    
    return sign(tokenPayload, secret, { expiresIn } as any)
  }

  static verifyAdminAccessToken(token: string): AdminJWTPayload {
    const secret = process.env.ADMIN_JWT_SECRET!
    return verify(token, secret) as AdminJWTPayload
  }

  static verifyAdminRefreshToken(token: string): AdminJWTPayload {
    const secret = process.env.ADMIN_JWT_REFRESH_SECRET!
    return verify(token, secret) as AdminJWTPayload
  }
}