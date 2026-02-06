// backend/src/controllers/admin-transactions.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import ExcelJS from 'exceljs'

const prisma = new PrismaClient()

interface TransactionsQueryParams {
  page?: string
  limit?: string
  type?: 'DEPOSIT' | 'WITHDRAWAL' | 'PARTIAL_WITHDRAWAL' | 'ALL'
  startDate?: string
  endDate?: string
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'
  userId?: string
  export?: 'true' | 'false'
}

export class AdminTransactionsController {
  /**
   * GET /api/v1/admin/transactions
   * Получение истории всех транзакций (пополнения + выводы)
   */
  static async getTransactions(request: FastifyRequest, reply: FastifyReply) {
    try {
      const {
        page = '1',
        limit = '50',
        type = 'ALL',
        startDate,
        endDate,
        status = 'ALL',
        userId,
        export: exportData = 'false'
      } = request.query as TransactionsQueryParams

      const pageNum = parseInt(page)
      const limitNum = parseInt(limit)
      const skip = (pageNum - 1) * limitNum

      console.log('[Transactions] Fetching transactions with filters:', {
        page: pageNum,
        limit: limitNum,
        type,
        startDate,
        endDate,
        status,
        userId,
        export: exportData
      })

      // Фильтры для пополнений (investments)
      const depositFilters: any = {}

      if (userId) depositFilters.userId = userId
      if (startDate) depositFilters.createdAt = { ...depositFilters.createdAt, gte: new Date(startDate) }
      if (endDate) depositFilters.createdAt = { ...depositFilters.createdAt, lte: new Date(endDate) }

      // Маппинг статусов для депозитов
      if (status !== 'ALL') {
        switch (status) {
          case 'PENDING':
            depositFilters.status = 'PENDING'
            break
          case 'APPROVED':
            depositFilters.status = { in: ['ACTIVE', 'COMPLETED'] }
            break
          case 'REJECTED':
            depositFilters.status = 'REJECTED'
            break
        }
      } else {
        depositFilters.status = { in: ['PENDING', 'ACTIVE', 'COMPLETED', 'REJECTED'] }
      }

      // Фильтры для полных выводов (withdrawals)
      const withdrawalFilters: any = {}
      if (userId) withdrawalFilters.userId = userId
      if (status !== 'ALL') withdrawalFilters.status = status
      if (startDate) withdrawalFilters.createdAt = { ...withdrawalFilters.createdAt, gte: new Date(startDate) }
      if (endDate) withdrawalFilters.createdAt = { ...withdrawalFilters.createdAt, lte: new Date(endDate) }

      // Фильтры для частичных выводов (partialWithdrawals)
      const partialWithdrawalFilters: any = {}
      if (userId) partialWithdrawalFilters.userId = userId
      if (status !== 'ALL') partialWithdrawalFilters.status = status
      if (startDate) partialWithdrawalFilters.requestDate = { ...partialWithdrawalFilters.requestDate, gte: new Date(startDate) }
      if (endDate) partialWithdrawalFilters.requestDate = { ...partialWithdrawalFilters.requestDate, lte: new Date(endDate) }

      // Получаем данные параллельно
      const [deposits, fullWithdrawals, partialWithdrawals] = await Promise.all([
        type === 'ALL' || type === 'DEPOSIT'
          ? prisma.investment.findMany({
              where: depositFilters,
              select: {
                id: true,
                userId: true,
                amount: true,
                status: true,
                transactionHash: true,
                createdAt: true,
                startDate: true,
                completedAt: true,
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phoneNumber: true
                  }
                },
                plan: {
                  select: {
                    name: true
                  }
                }
              },
              orderBy: { createdAt: 'desc' },
              skip: exportData === 'true' ? undefined : skip,
              take: exportData === 'true' ? undefined : limitNum
            })
          : [],
        type === 'ALL' || type === 'WITHDRAWAL'
          ? prisma.withdrawalRequest.findMany({
              where: withdrawalFilters,
              select: {
                id: true,
                userId: true,
                amount: true,
                status: true,
                trc20Address: true,
                createdAt: true,
                processedAt: true,
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phoneNumber: true
                  }
                },
                investment: {
                  select: {
                    plan: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              },
              orderBy: { createdAt: 'desc' },
              skip: exportData === 'true' ? undefined : skip,
              take: exportData === 'true' ? undefined : limitNum
            })
          : [],
        type === 'ALL' || type === 'PARTIAL_WITHDRAWAL'
          ? prisma.partialWithdrawal.findMany({
              where: partialWithdrawalFilters,
              select: {
                id: true,
                userId: true,
                amount: true,
                status: true,
                trc20Address: true,
                requestDate: true,
                processedDate: true,
                completedDate: true,
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phoneNumber: true
                  }
                },
                investment: {
                  select: {
                    plan: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              },
              orderBy: { requestDate: 'desc' },
              skip: exportData === 'true' ? undefined : skip,
              take: exportData === 'true' ? undefined : limitNum
            })
          : []
      ])

      console.log('[Transactions] Raw data counts:', {
        deposits: deposits.length,
        fullWithdrawals: fullWithdrawals.length,
        partialWithdrawals: partialWithdrawals.length
      })

      // Маппинг статусов депозитов для отображения
      const mapDepositStatus = (investmentStatus: string): string => {
        switch (investmentStatus) {
          case 'PENDING':
            return 'PENDING'
          case 'ACTIVE':
          case 'COMPLETED':
            return 'APPROVED'
          case 'REJECTED':
            return 'REJECTED'
          default:
            return investmentStatus
        }
      }

      const getTypeLabel = (type: string): string => {
        switch(type) {
          case 'DEPOSIT': return 'Пополнение'
          case 'WITHDRAWAL': return 'Полный вывод'
          case 'PARTIAL_WITHDRAWAL': return 'Частичный вывод'
          default: return type
        }
      }

      const getStatusLabel = (status: string): string => {
        switch(status) {
          case 'PENDING': return 'Ожидание'
          case 'ACTIVE': return 'Активно'
          case 'COMPLETED': return 'Завершено'
          case 'APPROVED': return 'Одобрено'
          case 'REJECTED': return 'Отклонено'
          default: return status
        }
      }

      // Формируем единый список транзакций
      const transactions = [
        ...deposits.map(d => ({
          id: d.id,
          type: 'DEPOSIT' as const,
          userId: d.userId,
          userEmail: d.user.email || 'N/A',
          userName: `${d.user.firstName || ''} ${d.user.lastName || ''}`.trim() || d.user.email || 'N/A',
          userPhone: d.user.phoneNumber || 'N/A',
          amount: Number(d.amount),
          status: mapDepositStatus(d.status),
          originalStatus: d.status,
          planName: d.plan.name,
          txHash: d.transactionHash || null,
          walletAddress: null,
          date: d.startDate || d.createdAt,
          processedAt: d.completedAt || d.startDate
        })),
        ...fullWithdrawals.map(w => ({
          id: w.id,
          type: 'WITHDRAWAL' as const,
          userId: w.userId,
          userEmail: w.user.email || 'N/A',
          userName: `${w.user.firstName || ''} ${w.user.lastName || ''}`.trim() || w.user.email || 'N/A',
          userPhone: w.user.phoneNumber || 'N/A',
          amount: Number(w.amount),
          status: w.status,
          originalStatus: w.status,
          planName: w.investment?.plan?.name || 'N/A',
          txHash: null,
          walletAddress: w.trc20Address,
          date: w.createdAt,
          processedAt: w.processedAt
        })),
        ...partialWithdrawals.map(w => ({
          id: w.id,
          type: 'PARTIAL_WITHDRAWAL' as const,
          userId: w.userId,
          userEmail: w.user.email || 'N/A',
          userName: `${w.user.firstName || ''} ${w.user.lastName || ''}`.trim() || w.user.email || 'N/A',
          userPhone: w.user.phoneNumber || 'N/A',
          amount: Number(w.amount),
          status: w.status,
          originalStatus: w.status,
          planName: w.investment?.plan?.name || 'N/A',
          txHash: null,
          walletAddress: w.trc20Address,
          date: w.requestDate,
          processedAt: w.processedDate || w.completedDate
        }))
      ]

      // Сортировка по дате (новые сверху)
      transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      console.log('[Transactions] Mapped transactions:', {
        total: transactions.length,
        statuses: transactions.map(t => ({ type: t.type, status: t.status, originalStatus: t.originalStatus }))
      })

      // Если запрос на экспорт - возвращаем Excel
      if (exportData === 'true') {
        const buffer = await AdminTransactionsController.generateExcel(transactions, getTypeLabel, getStatusLabel)
        return reply
          .code(200)
          .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
          .header('Content-Disposition', `attachment; filename="transactions_${new Date().toISOString().split('T')[0]}.xlsx"`)
          .send(buffer)
      }

      // Подсчёт общей статистики
      const approvedDeposits = deposits.filter(d => ['ACTIVE', 'COMPLETED'].includes(d.status))
      const totalDeposits = approvedDeposits.reduce((sum, d) => sum + Number(d.amount), 0)
      
      const approvedWithdrawals = [...fullWithdrawals, ...partialWithdrawals].filter(w => ['APPROVED', 'COMPLETED'].includes(w.status))
      const totalWithdrawals = approvedWithdrawals.reduce((sum, w) => sum + Number(w.amount), 0)

      const totalCount = transactions.length
      const totalPages = Math.ceil(totalCount / limitNum)

      console.log(`[Transactions] Fetched ${transactions.length} transactions`)

      return reply.code(200).send({
        success: true,
        data: {
          transactions: transactions.slice(0, limitNum),
          summary: {
            totalDeposits: parseFloat(totalDeposits.toFixed(2)),
            totalWithdrawals: parseFloat(totalWithdrawals.toFixed(2)),
            netFlow: parseFloat((totalDeposits - totalWithdrawals).toFixed(2))
          },
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalCount,
            totalPages,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1
          }
        }
      })
    } catch (error: any) {
      console.error('[Transactions] Error fetching transactions:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch transactions'
      })
    }
  }

  /**
   * Генерация Excel файла для экспорта
   */
  private static async generateExcel(
    transactions: any[], 
    getTypeLabel: (type: string) => string,
    getStatusLabel: (status: string) => string
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Транзакции')

    // Настройка колонок
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 36 },
      { header: 'Дата', key: 'date', width: 20 },
      { header: 'Тип', key: 'type', width: 20 },
      { header: 'Пользователь', key: 'userName', width: 25 },
      { header: 'Email', key: 'userEmail', width: 30 },
      { header: 'Телефон', key: 'userPhone', width: 18 },
      { header: 'Сумма (USD)', key: 'amount', width: 15 },
      { header: 'Статус', key: 'status', width: 15 },
      { header: 'План', key: 'planName', width: 20 },
      { header: 'Адрес кошелька', key: 'walletAddress', width: 45 },
      { header: 'TX Hash', key: 'txHash', width: 45 },
      { header: 'Дата обработки', key: 'processedAt', width: 20 }
    ]

    // Стиль заголовков
    worksheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0ABAB5' }
    }
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }
    worksheet.getRow(1).height = 25

    // Добавление данных
    transactions.forEach((transaction) => {
      const row = worksheet.addRow({
        id: transaction.id,
        date: new Date(transaction.date).toLocaleString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        type: getTypeLabel(transaction.type),
        userName: transaction.userName,
        userEmail: transaction.userEmail,
        userPhone: transaction.userPhone,
        amount: transaction.amount.toFixed(2),
        status: getStatusLabel(transaction.status),
        planName: transaction.planName,
        walletAddress: transaction.walletAddress || 'N/A',
        txHash: transaction.txHash || 'N/A',
        processedAt: transaction.processedAt 
          ? new Date(transaction.processedAt).toLocaleString('ru-RU', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'N/A'
      })

      // Чередующиеся цвета строк
      if (row.number % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF5F5F5' }
        }
      }

      // Цветовое выделение типа транзакции
      const typeCell = row.getCell('type')
      if (transaction.type === 'DEPOSIT') {
        typeCell.font = { color: { argb: 'FF0ABAB5' }, bold: true }
      } else {
        typeCell.font = { color: { argb: 'FFF59E0B' }, bold: true }
      }

      // Цветовое выделение статуса
      const statusCell = row.getCell('status')
      switch (transaction.status) {
        case 'PENDING':
          statusCell.font = { color: { argb: 'FFF59E0B' }, bold: true }
          break
        case 'APPROVED':
          statusCell.font = { color: { argb: 'FF10B981' }, bold: true }
          break
        case 'REJECTED':
          statusCell.font = { color: { argb: 'FFEF4444' }, bold: true }
          break
      }

      // Форматирование суммы
      const amountCell = row.getCell('amount')
      amountCell.font = { bold: true }
      amountCell.alignment = { horizontal: 'right' }
    })

    // Добавление итоговой строки
    const totalDeposits = transactions
      .filter(t => t.type === 'DEPOSIT' && t.status === 'APPROVED')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalWithdrawals = transactions
      .filter(t => ['WITHDRAWAL', 'PARTIAL_WITHDRAWAL'].includes(t.type) && t.status === 'APPROVED')
      .reduce((sum, t) => sum + t.amount, 0)

    worksheet.addRow([])
    const summaryRow = worksheet.addRow({
      id: '',
      date: '',
      type: '',
      userName: '',
      userEmail: '',
      userPhone: 'ИТОГО:',
      amount: '',
      status: '',
      planName: '',
      walletAddress: '',
      txHash: '',
      processedAt: ''
    })
    summaryRow.font = { bold: true, size: 12 }
    summaryRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0F2F1' }
    }

    worksheet.addRow({
      id: '',
      date: '',
      type: '',
      userName: '',
      userEmail: '',
      userPhone: 'Всего пополнений:',
      amount: totalDeposits.toFixed(2),
      status: '',
      planName: '',
      walletAddress: '',
      txHash: '',
      processedAt: ''
    }).font = { bold: true }

    worksheet.addRow({
      id: '',
      date: '',
      type: '',
      userName: '',
      userEmail: '',
      userPhone: 'Всего выводов:',
      amount: totalWithdrawals.toFixed(2),
      status: '',
      planName: '',
      walletAddress: '',
      txHash: '',
      processedAt: ''
    }).font = { bold: true }

    const netFlowRow = worksheet.addRow({
      id: '',
      date: '',
      type: '',
      userName: '',
      userEmail: '',
      userPhone: 'Чистый поток:',
      amount: (totalDeposits - totalWithdrawals).toFixed(2),
      status: '',
      planName: '',
      walletAddress: '',
      txHash: '',
      processedAt: ''
    })
    netFlowRow.font = { bold: true }
    netFlowRow.getCell('amount').font = {
      bold: true,
      color: { argb: totalDeposits - totalWithdrawals >= 0 ? 'FF10B981' : 'FFEF4444' }
    }

    // Применение границ ко всем ячейкам
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
        }
      })
    })

    // Генерация буфера
    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }

  /**
   * GET /api/v1/admin/transactions/stats
   * Статистика по транзакциям за период
   */
  static async getTransactionStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { startDate, endDate } = request.query as { startDate?: string; endDate?: string }

      const dateFilter: any = {}
      if (startDate) dateFilter.gte = new Date(startDate)
      if (endDate) dateFilter.lte = new Date(endDate)

      const [depositsSum, withdrawalsSum, partialWithdrawalsSum] = await Promise.all([
        prisma.investment.aggregate({
          _sum: { amount: true },
          _count: true,
          where: {
            status: { in: ['ACTIVE', 'COMPLETED'] },
            ...(startDate || endDate ? { createdAt: dateFilter } : {})
          }
        }),
        prisma.withdrawalRequest.aggregate({
          _sum: { amount: true },
          _count: true,
          where: {
            status: { in: ['APPROVED', 'COMPLETED'] },
            ...(startDate || endDate ? { createdAt: dateFilter } : {})
          }
        }),
        prisma.partialWithdrawal.aggregate({
          _sum: { amount: true },
          _count: true,
          where: {
            status: { in: ['APPROVED', 'COMPLETED'] },
            ...(startDate || endDate ? { requestDate: dateFilter } : {})
          }
        })
      ])

      const totalDeposits = Number(depositsSum._sum.amount || 0)
      const totalWithdrawals = Number(withdrawalsSum._sum.amount || 0) + Number(partialWithdrawalsSum._sum.amount || 0)

      return reply.code(200).send({
        success: true,
        data: {
          deposits: {
            total: parseFloat(totalDeposits.toFixed(2)),
            count: depositsSum._count
          },
          withdrawals: {
            total: parseFloat(totalWithdrawals.toFixed(2)),
            count: withdrawalsSum._count + partialWithdrawalsSum._count
          },
          netFlow: parseFloat((totalDeposits - totalWithdrawals).toFixed(2))
        }
      })
    } catch (error: any) {
      console.error('[Transactions] Error fetching transaction stats:', error)
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch transaction stats'
      })
    }
  }
}
