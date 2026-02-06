import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface UsersQueryParams {
  page?: string
  limit?: string
  search?: string
  kycStatus?: string
  hasInvestments?: string
  sortBy?: string
}

export class AdminUsersController {
  /**
   * GET /api/v1/admin/users
   * Получение списка пользователей с пагинацией, поиском и фильтрами
   */
  static async getUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { 
        page = '1', 
        limit = '20', 
        search = '',
        kycStatus = 'all',
        hasInvestments = 'all',
        sortBy = 'createdAt'
      } = request.query as UsersQueryParams

      const pageNum = parseInt(page)
      const limitNum = parseInt(limit)
      const skip = (pageNum - 1) * limitNum

      console.log('📊 Fetching users with params:', {
        page: pageNum,
        limit: limitNum,
        search,
        kycStatus,
        hasInvestments,
        sortBy
      })

      let whereCondition: any = {}

      if (search) {
        whereCondition.OR = [
          { email: { contains: search, mode: 'insensitive' as const } },
          { username: { contains: search, mode: 'insensitive' as const } },
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { telegramUsername: { contains: search, mode: 'insensitive' as const } }
        ]
      }

      if (kycStatus !== 'all') {
        whereCondition.kycStatus = kycStatus
      }

      if (hasInvestments === 'false') {
        whereCondition.investments = { none: {} }
      } else if (hasInvestments === 'true') {
        whereCondition.investments = { some: {} }
      }

      let orderBy: any = { createdAt: 'desc' }

      console.log('🔍 Query whereCondition:', JSON.stringify(whereCondition, null, 2))
      console.log('🔍 Query orderBy:', orderBy)

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereCondition,
          skip,
          take: limitNum,
          orderBy,
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            walletAddress: true,
            isActive: true,
            isEmailVerified: true,
            kycStatus: true,
            lastLoginAt: true,
            createdAt: true,
            referralCode: true,
            assignedSalesperson: true,
            referralSource: true,
            telegramId: true,
            telegramUsername: true,
            telegramFirstName: true,
            telegramLastName: true,
            telegramPhotoUrl: true,
            _count: {
              select: {
                investments: true,
                wallets: true
              }
            },
            investments: {
              select: {
                amount: true
              }
            }
          }
        }),
        prisma.user.count({ where: whereCondition })
      ])

      console.log(`✅ Fetched ${users.length} users out of ${total} total`)

      let usersWithTotal = users.map(user => {
        const totalInvested = user.investments.reduce((sum, inv) => {
          return sum + Number(inv.amount)
        }, 0)

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          walletAddress: user.walletAddress,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          kycStatus: user.kycStatus,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          referralCode: user.referralCode,
          assignedSalesperson: user.assignedSalesperson,
          referralSource: user.referralSource,
          telegramId: user.telegramId,
          telegramUsername: user.telegramUsername,
          telegramFirstName: user.telegramFirstName,
          telegramLastName: user.telegramLastName,
          telegramPhotoUrl: user.telegramPhotoUrl,
          totalInvested,
          _count: user._count
        }
      })

      if (sortBy === 'totalInvested') {
        usersWithTotal = usersWithTotal.sort((a, b) => b.totalInvested - a.totalInvested)
        console.log('🔄 Sorted by totalInvested (descending)')
      }

      const totalPages = Math.ceil(total / limitNum)

      return reply.code(200).send({
        success: true,
        data: {
          users: usersWithTotal,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1
          }
        }
      })
    } catch (error: any) {
      request.log.error(error)
      console.error('❌ Error fetching users:', error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch users'
      })
    }
  }

  /**
   * GET /api/v1/admin/users/:id
   * Получение детальной информации о пользователе с инвестициями
   */
  static async getUserById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }

      console.log(`📋 Admin requesting user details for ID: ${id}`)

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          investments: {
            include: {
              plan: true
            },
            orderBy: { createdAt: 'desc' }
          },
          wallets: true,
          _count: {
            select: {
              investments: true,
              wallets: true
            }
          }
        }
      })

      if (!user) {
        console.log(`❌ User not found: ${id}`)
        return reply.code(404).send({
          success: false,
          error: 'User not found'
        })
      }

      const level1Referrals = await prisma.user.findMany({
        where: { referredBy: id },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          investments: {
            where: {
              status: { in: ['ACTIVE', 'COMPLETED'] }
            },
            select: {
              amount: true
            }
          }
        }
      })

      console.log(`👥 Found ${level1Referrals.length} level 1 referrals`)

      const level1Ids = level1Referrals.map(ref => ref.id)
      
      const level2Referrals = await prisma.user.findMany({
        where: { 
          referredBy: { in: level1Ids }
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          referredBy: true,
          createdAt: true,
          investments: {
            where: {
              status: { in: ['ACTIVE', 'COMPLETED'] }
            },
            select: {
              amount: true
            }
          }
        }
      })

      console.log(`👥 Found ${level2Referrals.length} level 2 referrals`)

      const totalInvested = user.investments.reduce((sum, inv) => sum + Number(inv.amount), 0)
      const activeInvestments = user.investments.filter(inv => inv.status === 'ACTIVE').length

      const level1Data = level1Referrals.map(ref => {
        const refTotalInvested = ref.investments.reduce((sum, inv) => sum + Number(inv.amount), 0)
        const commission = refTotalInvested * 0.07
        
        return {
          id: ref.id,
          email: ref.email,
          username: ref.username,
          name: `${ref.firstName || ''} ${ref.lastName || ''}`.trim() || 'N/A',
          joinedAt: ref.createdAt,
          totalInvested: refTotalInvested,
          commission: commission
        }
      })

      const level2Data = level2Referrals.map(ref => {
        const refTotalInvested = ref.investments.reduce((sum, inv) => sum + Number(inv.amount), 0)
        const commission = refTotalInvested * 0.03
        
        return {
          id: ref.id,
          email: ref.email,
          username: ref.username,
          name: `${ref.firstName || ''} ${ref.lastName || ''}`.trim() || 'N/A',
          referredBy: ref.referredBy,
          joinedAt: ref.createdAt,
          totalInvested: refTotalInvested,
          commission: commission
        }
      })

      const totalLevel1Commission = level1Data.reduce((sum, ref) => sum + ref.commission, 0)
      const totalLevel2Commission = level2Data.reduce((sum, ref) => sum + ref.commission, 0)
      const totalReferralEarnings = totalLevel1Commission + totalLevel2Commission

      console.log(`💰 Total referral earnings: $${totalReferralEarnings.toFixed(2)}`)

      const investmentsWithReturn = user.investments.map(inv => {
        const effectiveMonthlyRate = Number(inv.effectiveROI || inv.roi)
        const dailyReturn = (Number(inv.amount) * (effectiveMonthlyRate / 30)) / 100
        
        return {
          id: inv.id,
          amount: Number(inv.amount),
          dailyReturn: dailyReturn,
          roi: Number(inv.roi),
          effectiveROI: Number(inv.effectiveROI),
          duration: inv.duration,
          durationBonus: Number(inv.durationBonus || 0),
          bonusAmount: Number(inv.bonusAmount || 0),
          status: inv.status,
          createdAt: inv.createdAt,
          startDate: inv.startDate,
          endDate: inv.endDate,
          package: {
            name: inv.plan.name,
            minAmount: Number(inv.plan.minAmount),
            maxAmount: inv.plan.maxAmount ? Number(inv.plan.maxAmount) : null,
            apy: Number(inv.plan.apy)
          }
        }
      })

      return reply.code(200).send({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            referralCode: user.referralCode,
            walletAddress: user.walletAddress,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            assignedSalesperson: user.assignedSalesperson,
            referralSource: user.referralSource,
            calendarNote: user.calendarNote,
            adminComment: user.adminComment,
            adminTask: user.adminTask,
            taskDate: user.taskDate,
            telegramId: user.telegramId,
            telegramUsername: user.telegramUsername,
            telegramFirstName: user.telegramFirstName,
            telegramLastName: user.telegramLastName,
            telegramPhotoUrl: user.telegramPhotoUrl,
            kycStatus: user.kycStatus,
            kycPhotoUrl: user.kycPhotoUrl,
            kycVideoUrl: user.kycVideoUrl,
            kycPhotoTakenAt: user.kycPhotoTakenAt,
            kycVideoTakenAt: user.kycVideoTakenAt,
            kycSubmittedAt: user.kycSubmittedAt,
            kycProcessedAt: user.kycProcessedAt,
            kycRejectionReason: user.kycRejectionReason,
            kycPhotoMetadata: user.kycPhotoMetadata,
            kycVideoMetadata: user.kycVideoMetadata,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            totalInvested: totalInvested,
            activeInvestments: activeInvestments,
            totalInvestments: user._count.investments,
            totalWallets: user._count.wallets
          },
          investments: investmentsWithReturn,
          wallets: user.wallets.map(w => ({
            id: w.id,
            address: w.address,
            cryptocurrency: w.cryptocurrency,
            balance: Number(w.balance),
            isActive: w.isActive,
            createdAt: w.createdAt
          })),
          referrals: {
            totalReferrals: level1Referrals.length + level2Referrals.length,
            totalEarnings: totalReferralEarnings,
            level1: level1Data,
            level2: level2Data
          }
        }
      })
    } catch (error: any) {
      console.error('❌ Error fetching user details:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch user details'
      })
    }
  }

  /**
   * PUT /api/v1/admin/users/:id/status
   * Обновление статуса пользователя
   */
  static async updateUserStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const { isActive } = request.body as { isActive: boolean }

      console.log(`🔄 Admin updating user status: ${id} -> ${isActive}`)

      const user = await prisma.user.update({
        where: { id },
        data: { isActive },
        select: {
          id: true,
          email: true,
          isActive: true
        }
      })

      console.log(`✅ User status updated: ${user.email}`)

      return reply.code(200).send({
        success: true,
        data: { user }
      })
    } catch (error: any) {
      console.error('❌ Error updating user status:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to update user status'
      })
    }
  }

  /**
   * PUT /api/v1/admin/users/:id/assign-salesperson
   * Назначение продажника пользователю
   */
  static async assignSalesperson(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const { salesperson } = request.body as { salesperson: string | null }

      const validSalespeople = ['Фортунатус', 'Мохаммед', 'Эльвира']
      
      if (salesperson !== null && !validSalespeople.includes(salesperson)) {
        return reply.code(400).send({
          success: false,
          error: `Invalid salesperson. Must be one of: ${validSalespeople.join(', ')} or null`
        })
      }

      console.log(`👤 Admin assigning salesperson "${salesperson}" to user ${id}`)

      const user = await prisma.user.update({
        where: { id },
        data: { assignedSalesperson: salesperson },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          assignedSalesperson: true
        }
      })

      console.log(`✅ Salesperson assigned: ${user.email} -> ${salesperson || 'none'}`)

      return reply.code(200).send({
        success: true,
        message: salesperson 
          ? `Salesperson "${salesperson}" assigned successfully`
          : 'Salesperson assignment removed',
        data: { user }
      })
    } catch (error: any) {
      console.error('❌ Error assigning salesperson:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to assign salesperson'
      })
    }
  }

  /**
   * PUT /api/v1/admin/users/:id/assign-referral-source
   * Назначение источника привлечения клиента
   */
  static async assignReferralSource(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const { referralSource } = request.body as { referralSource: string | null }

      const validSources = ['Cетевики', 'Реклама, блогеры', 'Самостоятельно']
      
      if (referralSource !== null && !validSources.includes(referralSource)) {
        return reply.code(400).send({
          success: false,
          error: `Invalid referral source. Must be one of: ${validSources.join(', ')} or null`
        })
      }

      console.log(`📍 Admin assigning referral source "${referralSource}" to user ${id}`)

      const user = await prisma.user.update({
        where: { id },
        data: { referralSource: referralSource },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          referralSource: true
        }
      })

      console.log(`✅ Referral source assigned: ${user.email} -> ${referralSource || 'none'}`)

      return reply.code(200).send({
        success: true,
        message: referralSource 
          ? `Referral source "${referralSource}" assigned successfully`
          : 'Referral source assignment removed',
        data: { user }
      })
    } catch (error: any) {
      console.error('❌ Error assigning referral source:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to assign referral source'
      })
    }
  }

  /**
   * PUT /api/v1/admin/users/:id/update-notes
   * Обновление календаря, комментария и задачи пользователя
   */
  static async updateUserNotes(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const { calendarNote, adminComment, adminTask, taskDate } = request.body as {
        calendarNote?: string
        adminComment?: string
        adminTask?: string
        taskDate?: string
      }

      console.log(`📝 Admin updating notes for user ${id}`)

      const user = await prisma.user.update({
        where: { id },
        data: {
          calendarNote: calendarNote || null,
          adminComment: adminComment || null,
          adminTask: adminTask || null,
          taskDate: taskDate || null
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          calendarNote: true,
          adminComment: true,
          adminTask: true,
          taskDate: true
        }
      })

      console.log(`✅ User notes updated: ${user.email}`)

      return reply.code(200).send({
        success: true,
        message: 'User notes updated successfully',
        data: { user }
      })
    } catch (error: any) {
      console.error('❌ Error updating user notes:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to update user notes'
      })
    }
  }

  /**
   * GET /api/v1/admin/users/:id/referral-tree
   * Получение полного дерева рефералов пользователя
   */
  static async getUserReferralTree(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }

      console.log(`🌳 Admin requesting referral tree for user: ${id}`)

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          referralCode: true
        }
      })

      if (!user) {
        return reply.code(404).send({
          success: false,
          error: 'User not found'
        })
      }

      const level1 = await prisma.user.findMany({
        where: { referredBy: id },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          referralCode: true,
          createdAt: true,
          isActive: true,
          investments: {
            where: { status: { in: ['ACTIVE', 'COMPLETED'] } },
            select: { amount: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      const level1Ids = level1.map(u => u.id)
      const level2 = level1Ids.length > 0 ? await prisma.user.findMany({
        where: { referredBy: { in: level1Ids } },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          referredBy: true,
          createdAt: true,
          isActive: true,
          investments: {
            where: { status: { in: ['ACTIVE', 'COMPLETED'] } },
            select: { amount: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }) : []

      const formattedLevel1 = level1.map(u => {
        const totalInvested = u.investments.reduce((sum, inv) => sum + Number(inv.amount), 0)
        return {
          id: u.id,
          email: u.email,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'N/A',
          referralCode: u.referralCode,
          joinedAt: u.createdAt,
          isActive: u.isActive,
          totalInvested,
          commission: totalInvested * 0.07,
          level: 1
        }
      })

      const formattedLevel2 = level2.map(u => {
        const totalInvested = u.investments.reduce((sum, inv) => sum + Number(inv.amount), 0)
        return {
          id: u.id,
          email: u.email,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'N/A',
          referredBy: u.referredBy,
          joinedAt: u.createdAt,
          isActive: u.isActive,
          totalInvested,
          commission: totalInvested * 0.03,
          level: 2
        }
      })

      const totalEarnings = 
        formattedLevel1.reduce((sum, u) => sum + u.commission, 0) +
        formattedLevel2.reduce((sum, u) => sum + u.commission, 0)

      console.log(`✅ Referral tree: L1=${level1.length}, L2=${level2.length}, Earnings=$${totalEarnings.toFixed(2)}`)

      return reply.code(200).send({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            referralCode: user.referralCode
          },
          stats: {
            totalReferrals: level1.length + level2.length,
            level1Count: level1.length,
            level2Count: level2.length,
            totalEarnings
          },
          tree: {
            level1: formattedLevel1,
            level2: formattedLevel2
          }
        }
      })
    } catch (error: any) {
      console.error('❌ Error fetching referral tree:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch referral tree'
      })
    }
  }

  /**
   * GET /api/v1/admin/users/stats
   * Получение общей статистики по пользователям
   */
  static async getUsersStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log('📊 Admin requesting users statistics')

      const [
        totalUsers,
        activeUsers,
        verifiedUsers,
        usersWithInvestments,
        totalInvestments
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { isEmailVerified: true } }),
        prisma.user.count({
          where: {
            investments: {
              some: {}
            }
          }
        }),
        prisma.investment.aggregate({
          _sum: { amount: true },
          where: { status: { in: ['ACTIVE', 'COMPLETED'] } }
        })
      ])

      const stats = {
        totalUsers,
        activeUsers,
        verifiedUsers,
        usersWithInvestments,
        totalInvestedAmount: Number(totalInvestments._sum.amount || 0)
      }

      console.log('✅ Users statistics:', stats)

      return reply.code(200).send({
        success: true,
        data: stats
      })
    } catch (error: any) {
      console.error('❌ Error fetching users stats:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch users statistics'
      })
    }
  }

  /**
   * GET /api/v1/admin/dashboard/stats
   * Получение расширенной статистики для дашборда
   */
  static async getDashboardStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log('📊 Admin requesting dashboard statistics')

      const [
        totalUsers,
        activeUsers,
        totalKYCSubmitted,
        kycApproved,
        kycPending,
        kycRejected,
        usersWithInvestments,
        usersWithoutInvestments,
        totalInvestmentsData
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({
          where: {
            kycStatus: { not: 'NOT_SUBMITTED' }
          }
        }),
        prisma.user.count({ where: { kycStatus: 'APPROVED' } }),
        prisma.user.count({ where: { kycStatus: 'PENDING' } }),
        prisma.user.count({ where: { kycStatus: 'REJECTED' } }),
        prisma.user.count({
          where: {
            investments: {
              some: {}
            }
          }
        }),
        prisma.user.count({
          where: {
            investments: {
              none: {}
            }
          }
        }),
        prisma.investment.aggregate({
          _sum: { amount: true },
          where: { status: { in: ['ACTIVE', 'COMPLETED'] } }
        })
      ])

      const stats = {
        totalUsers,
        activeUsers,
        kyc: {
          total: totalKYCSubmitted,
          approved: kycApproved,
          pending: kycPending,
          rejected: kycRejected,
          notSubmitted: totalUsers - totalKYCSubmitted
        },
        investments: {
          usersWithInvestments,
          usersWithoutInvestments,
          totalAmount: Number(totalInvestmentsData._sum.amount || 0)
        }
      }

      console.log('✅ Dashboard statistics:', stats)

      return reply.code(200).send({
        success: true,
        data: stats
      })
    } catch (error: any) {
      console.error('❌ Error fetching dashboard stats:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch dashboard statistics'
      })
    }
  }

  /**
   * GET /api/v1/admin/kyc/stats
   * Статистика по KYC верификации
   */
  static async getKYCStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log('📊 Admin requesting KYC statistics')

      const [
        totalSubmitted,
        pending,
        approved,
        rejected
      ] = await Promise.all([
        prisma.user.count({
          where: {
            kycStatus: { not: 'NOT_SUBMITTED' }
          }
        }),
        prisma.user.count({ where: { kycStatus: 'PENDING' } }),
        prisma.user.count({ where: { kycStatus: 'APPROVED' } }),
        prisma.user.count({ where: { kycStatus: 'REJECTED' } })
      ])

      const stats = {
        totalSubmitted,
        pending,
        approved,
        rejected,
        approvalRate: totalSubmitted > 0 ? ((approved / totalSubmitted) * 100).toFixed(1) : '0.0'
      }

      console.log('✅ KYC statistics:', stats)

      return reply.code(200).send({
        success: true,
        data: stats
      })
    } catch (error: any) {
      console.error('❌ Error fetching KYC stats:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch KYC statistics'
      })
    }
  }
}