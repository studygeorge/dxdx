'use client'
import { useState, useEffect } from 'react'

const API_BASE_URL = 'https://dxcapital-ai.com'

export default function Dashboard({ isMobile }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    usersWithInvestments: 0,
    totalInvestedAmount: 0,
    totalInvestments: 0,
    activeInvestments: 0,
    kyc: {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      notSubmitted: 0
    }
  })
  const [transactionStats, setTransactionStats] = useState({
    deposits: { total: 0, count: 0 },
    withdrawals: { total: 0, count: 0 },
    netFlow: 0
  })
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [filterType, setFilterType] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')

  useEffect(() => {
    fetchDashboardStats()
    fetchTransactions()
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [dateRange, filterType, filterStatus])

  const fetchDashboardStats = async () => {
    const token = localStorage.getItem('admin_access_token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const dashboardStatsResponse = await fetch(`${API_BASE_URL}/api/v1/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      const investmentsStatsResponse = await fetch(`${API_BASE_URL}/api/v1/admin/investments/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (dashboardStatsResponse.ok) {
        const dashboardData = await dashboardStatsResponse.json()
        console.log('Dashboard stats:', dashboardData.data)
        setStats(prevStats => ({
          ...prevStats,
          ...dashboardData.data
        }))
      }

      if (investmentsStatsResponse.ok) {
        const investmentsData = await investmentsStatsResponse.json()
        console.log('Investments stats:', investmentsData.data)
        setStats(prevStats => ({
          ...prevStats,
          totalInvestedAmount: investmentsData.data.totalInvestedAmount || 0
        }))
      }

    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    const token = localStorage.getItem('admin_access_token')
    if (!token) {
      setTransactionsLoading(false)
      return
    }

    try {
      setTransactionsLoading(true)

      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        type: filterType,
        status: filterStatus
      })

      if (dateRange.startDate) {
        params.append('startDate', new Date(dateRange.startDate).toISOString())
      }
      if (dateRange.endDate) {
        params.append('endDate', new Date(dateRange.endDate).toISOString())
      }

      const transactionsResponse = await fetch(
        `${API_BASE_URL}/api/v1/admin/transactions?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      )

      const statsParams = new URLSearchParams()
      if (dateRange.startDate) {
        statsParams.append('startDate', new Date(dateRange.startDate).toISOString())
      }
      if (dateRange.endDate) {
        statsParams.append('endDate', new Date(dateRange.endDate).toISOString())
      }

      const statsResponse = await fetch(
        `${API_BASE_URL}/api/v1/admin/transactions/stats?${statsParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      )

      if (transactionsResponse.ok) {
        const data = await transactionsResponse.json()
        console.log('Transactions:', data.data)
        setTransactions(data.data.transactions || [])
      }

      if (statsResponse.ok) {
        const data = await statsResponse.json()
        console.log('Transaction stats:', data.data)
        setTransactionStats(data.data)
      }

    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setTransactionsLoading(false)
    }
  }

  const handleExportCSV = async () => {
    const token = localStorage.getItem('admin_access_token')
    if (!token) return

    try {
      const params = new URLSearchParams({
        export: 'true',
        type: filterType,
        status: filterStatus
      })

      if (dateRange.startDate) {
        params.append('startDate', new Date(dateRange.startDate).toISOString())
      }
      if (dateRange.endDate) {
        params.append('endDate', new Date(dateRange.endDate).toISOString())
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/transactions?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        }
      )

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `transactions_${new Date().toISOString()}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Failed to export CSV:', error)
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatCurrency = (amount) => {
    return '$' + Number(amount).toFixed(2)
  }

  const getTypeLabel = (type) => {
    switch(type) {
      case 'DEPOSIT': return 'Пополнение'
      case 'WITHDRAWAL': return 'Полный вывод'
      case 'PARTIAL_WITHDRAWAL': return 'Частичный вывод'
      default: return type
    }
  }

  const getStatusLabel = (status) => {
    switch(status) {
      case 'PENDING': return 'Ожидание'
      case 'ACTIVE': return 'Одобрено'
      case 'COMPLETED': return 'Завершено'
      case 'APPROVED': return 'Одобрено'
      case 'REJECTED': return 'Отклонено'
      default: return status
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
        gap: '24px'
      }}>
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Loading...</div>
          </div>
        ))}
      </div>
    )
  }

  const tiffanyColor = '#0abab5'

  const dashboardStats = [
    { 
      label: 'Total Users', 
      value: formatNumber(stats.totalUsers),
      subValue: 'Total registered accounts',
      color: tiffanyColor
    },
    { 
      label: 'Investors', 
      value: formatNumber(stats.investments?.usersWithInvestments || 0),
      subValue: 'Users with active investments',
      color: tiffanyColor
    },
    { 
      label: 'Total Invested', 
      value: formatCurrency(stats.totalInvestedAmount || stats.investments?.totalAmount || 0),
      subValue: 'Total capital invested',
      color: tiffanyColor
    },
    { 
      label: 'KYC Approved', 
      value: formatNumber(stats.kyc?.approved || 0),
      subValue: 'Verified accounts',
      color: tiffanyColor
    }
  ]

  const transactionStatsData = [
    {
      label: 'Total Deposits',
      value: formatCurrency(transactionStats.deposits.total),
      subValue: `${transactionStats.deposits.count} transactions`,
      color: tiffanyColor
    },
    {
      label: 'Total Withdrawals',
      value: formatCurrency(transactionStats.withdrawals.total),
      subValue: `${transactionStats.withdrawals.count} transactions`,
      color: tiffanyColor
    }
  ]

  return (
    <div>
      {/* Main Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {dashboardStats.map((stat, index) => (
          <div 
            key={index}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '32px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: '600'
            }}>
              {stat.label}
            </div>

            <div style={{
              fontSize: isMobile ? '32px' : '36px',
              fontWeight: '700',
              color: stat.color,
              marginBottom: '8px',
              letterSpacing: '-1px'
            }}>
              {stat.value}
            </div>

            <div style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.5)',
              letterSpacing: '0.5px'
            }}>
              {stat.subValue}
            </div>

            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${stat.color}00 0%, ${stat.color} 50%, ${stat.color}00 100%)`,
              opacity: 0.6
            }} />
          </div>
        ))}
      </div>

      {/* Transaction Stats Section */}
      <div style={{
        marginBottom: '24px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: 'rgba(255, 255, 255, 0.9)',
          marginBottom: '16px',
          letterSpacing: '0.5px'
        }}>
          Статистика транзакций
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: '24px',
          marginBottom: '24px'
        }}>
          {transactionStatsData.map((stat, index) => (
            <div 
              key={index}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '32px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: '600'
              }}>
                {stat.label}
              </div>

              <div style={{
                fontSize: isMobile ? '32px' : '36px',
                fontWeight: '700',
                color: stat.color,
                marginBottom: '8px',
                letterSpacing: '-1px'
              }}>
                {stat.value}
              </div>

              <div style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.5)',
                letterSpacing: '0.5px'
              }}>
                {stat.subValue}
              </div>

              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${stat.color}00 0%, ${stat.color} 50%, ${stat.color}00 100%)`,
                opacity: 0.6
              }} />
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            gap: '16px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                Дата начала
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                Дата окончания
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                Тип транзакции
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                <option value="ALL">Все</option>
                <option value="DEPOSIT">Пополнения</option>
                <option value="WITHDRAWAL">Полные выводы</option>
                <option value="PARTIAL_WITHDRAWAL">Частичные выводы</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                Статус
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                <option value="ALL">Все</option>
                <option value="PENDING">Ожидание</option>
                <option value="APPROVED">Одобрено</option>
                <option value="REJECTED">Отклонено</option>
              </select>
            </div>
          </div>

          <div style={{
            marginTop: '16px',
            display: 'flex',
            gap: '12px'
          }}>
            <button
              onClick={() => {
                setDateRange({ startDate: '', endDate: '' })
                setFilterType('ALL')
                setFilterStatus('ALL')
              }}
              style={{
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              }}
            >
              Сбросить фильтры
            </button>

            <button
              onClick={handleExportCSV}
              style={{
                padding: '10px 20px',
                background: `linear-gradient(135deg, ${tiffanyColor} 0%, #089690 100%)`,
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = `0 4px 12px rgba(10, 186, 181, 0.3)`
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              Экспорт в Excel
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          {transactionsLoading ? (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.5)'
            }}>
              Загрузка транзакций...
            </div>
          ) : transactions.length === 0 ? (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.5)'
            }}>
              Транзакции не найдены
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      Дата
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      Тип
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      Пользователь
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      Телефон
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'right',
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      Сумма
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      План
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      Статус
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, index) => (
                    <tr 
                      key={transaction.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.8)'
                      }}>
                        {new Date(transaction.date).toLocaleString('ru-RU', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: `${tiffanyColor}20`,
                          color: tiffanyColor,
                          whiteSpace: 'nowrap'
                        }}>
                          {getTypeLabel(transaction.type)}
                        </span>
                      </td>
                      <td style={{
                        padding: '16px'
                      }}>
                        <div style={{
                          fontSize: '14px',
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontWeight: '500'
                        }}>
                          {transaction.userName}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: 'rgba(255, 255, 255, 0.5)',
                          marginTop: '2px'
                        }}>
                          {transaction.userEmail}
                        </div>
                      </td>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.7)'
                      }}>
                        {transaction.userPhone}
                      </td>
                      <td style={{
                        padding: '16px',
                        textAlign: 'right',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: tiffanyColor
                      }}>
                        {transaction.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </td>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.7)'
                      }}>
                        {transaction.planName}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: `${tiffanyColor}20`,
                          color: tiffanyColor,
                          whiteSpace: 'nowrap'
                        }}>
                          {getStatusLabel(transaction.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* System Info */}
      <div style={{
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.5)'
        }}>
          <div>
            Last updated: {new Date().toLocaleString('ru-RU')}
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ 
              color: tiffanyColor,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: tiffanyColor,
                boxShadow: `0 0 8px ${tiffanyColor}`
              }} />
              System Online
            </span>
            <span>API v1.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}