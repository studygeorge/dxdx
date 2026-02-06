import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { AdminPayload } from '../types'
import { JWTUtils } from '../utils/jwt'

const prisma = new PrismaClient()

declare module 'fastify' {
  interface FastifyRequest {
    currentAdmin?: AdminPayload
  }
}

export async function authenticateAdmin(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return reply.code(401).send({ error: 'Admin access token required' })
    }

    const decoded = JWTUtils.verifyAdminAccessToken(token)
    
    if (decoded.type !== 'access') {
      return reply.code(401).send({ error: 'Invalid token type' })
    }

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId, isActive: true }
    })

    if (!admin) {
      return reply.code(401).send({ error: 'Admin not found or inactive' })
    }

    const session = await prisma.adminSession.findFirst({
      where: {
        token,
        adminId: admin.id,
        isActive: true,
        expiresAt: { gt: new Date() }
      }
    })

    if (!session) {
      return reply.code(401).send({ error: 'Session expired or invalid' })
    }

    await prisma.adminSession.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() }
    })

    request.currentAdmin = {
      id: admin.id,
      telegramId: admin.telegramId,
      username: admin.username || undefined,
      firstName: admin.firstName || undefined,
      lastName: admin.lastName || undefined,
      role: admin.role,
      isActive: admin.isActive
    }

  } catch (error) {
    return reply.code(401).send({ error: 'Invalid or expired admin token' })
  }
}

export async function requireSuperAdmin(request: FastifyRequest, reply: FastifyReply) {
  if (request.currentAdmin?.role !== 'SUPER_ADMIN') {
    return reply.code(403).send({ 
      error: 'Super admin access required',
      code: 'INSUFFICIENT_PERMISSIONS'
    })
  }
}
