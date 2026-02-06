'use client'
import { useState, useEffect } from 'react'

const API_BASE_URL = 'https://dxcapital-ai.com'

export default function Reporting({ isMobile }) {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTrades: 0,
    totalPnl: 0
  })
  const [filterExchange, setFilterExchange] = useState('ALL')
  const [filterAsset, setFilterAsset] = useState('ALL')
  const [filterType, setFilterType] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    exchange: 'BYBIT',
    asset: 'BTC',
    tradeType: 'LONG',
    entryPrice: '',
    entryDate: '',
    exitPrice: '',
    exitDate: '',
    pnlPercentage: '',
    status: 'OPEN',
    comment: ''
  })

  const tiffanyColor = '#0abab5'

  // Функция автоматического расчета PNL%
  const calculatePnl = (entryPrice, exitPrice, tradeType) => {
    const entry = parseFloat(entryPrice)
    const exit = parseFloat(exitPrice)

    if (!entry || !exit || entry <= 0 || exit <= 0) {
      return ''
    }

    let pnl = 0
    if (tradeType === 'LONG') {
      pnl = ((exit - entry) / entry) * 100
    } else if (tradeType === 'SHORT') {
      pnl = ((entry - exit) / entry) * 100
    }

    return pnl.toFixed(2)
  }

  // Обработчик изменения полей формы создания с автоматическим расчетом PNL
  const handleCreateFormChange = (field, value) => {
    const updatedForm = { ...createForm, [field]: value }

    // Автоматический расчет PNL при изменении цен или типа сделки
    if (field === 'entryPrice' || field === 'exitPrice' || field === 'tradeType') {
      const calculatedPnl = calculatePnl(
        updatedForm.entryPrice,
        updatedForm.exitPrice,
        updatedForm.tradeType
      )
      updatedForm.pnlPercentage = calculatedPnl
    }

    setCreateForm(updatedForm)
  }

  // Обработчик изменения полей формы редактирования с автоматическим расчетом PNL
  const handleEditFormChange = (field, value) => {
    const updatedForm = { ...editForm, [field]: value }

    // Автоматический расчет PNL при изменении цен или типа сделки
    if (field === 'entryPrice' || field === 'exitPrice' || field === 'tradeType') {
      const calculatedPnl = calculatePnl(
        updatedForm.entryPrice,
        updatedForm.exitPrice,
        updatedForm.tradeType
      )
      updatedForm.pnlPercentage = calculatedPnl
    }

    setEditForm(updatedForm)
  }

  // ✅ ДОБАВЛЕНО: Ранняя проверка токена при монтировании
  useEffect(() => {
    const token = localStorage.getItem('admin_access_token')
    
    if (!token) {
      console.warn('⚠️ No admin token found in Reporting component')
      setLoading(false)
      return
    }

    // Если токен есть - загружаем данные
    fetchTrades()
    fetchStats()
  }, [])

  // ✅ ОБНОВЛЕНО: Проверяем токен перед каждым запросом
  useEffect(() => {
    const token = localStorage.getItem('admin_access_token')
    if (!token) {
      console.warn('⚠️ Token missing, skipping data fetch')
      return
    }

    fetchTrades()
    fetchStats()
  }, [filterExchange, filterAsset, filterType, filterStatus, dateRange])

  const getAuthToken = () => {
    const token = localStorage.getItem('admin_access_token')
    if (!token) {
      console.warn('⚠️ Admin token not found')
    }
    return token
  }

  const fetchStats = async () => {
    const token = getAuthToken()
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/trading-reports/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        // ✅ ДОБАВЛЕНО: Обработка 401 ошибки
        if (response.status === 401) {
          console.error('❌ Unauthorized - token expired or invalid')
          localStorage.removeItem('admin_access_token')
          localStorage.removeItem('admin_refresh_token')
          window.location.reload()
          return
        }
        throw new Error('Failed to fetch stats')
      }

      const result = await response.json()
      setStats(result.data || { totalTrades: 0, totalPnl: 0 })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchTrades = async () => {
    const token = getAuthToken()
    if (!token) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const queryParams = new URLSearchParams()
      if (filterExchange !== 'ALL') queryParams.append('exchange', filterExchange)
      if (filterAsset !== 'ALL') queryParams.append('asset', filterAsset)
      if (filterType !== 'ALL') queryParams.append('type', filterType)
      if (filterStatus !== 'ALL') queryParams.append('status', filterStatus)
      if (dateRange.startDate) queryParams.append('startDate', dateRange.startDate)
      if (dateRange.endDate) queryParams.append('endDate', dateRange.endDate)

      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/trading-reports?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        // ✅ ДОБАВЛЕНО: Обработка 401 ошибки
        if (response.status === 401) {
          console.error('❌ Unauthorized - token expired or invalid')
          localStorage.removeItem('admin_access_token')
          localStorage.removeItem('admin_refresh_token')
          window.location.reload()
          return
        }
        throw new Error('Failed to fetch trades')
      }

      const result = await response.json()
      setTrades(result.data || [])

    } catch (error) {
      console.error('Failed to fetch trades:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    const token = getAuthToken()
    
    // ✅ ДОБАВЛЕНО: Явная проверка токена перед созданием
    if (!token) {
      alert('Сессия истекла. Страница будет перезагружена.')
      window.location.reload()
      return
    }

    try {
      const payload = {
        exchange: createForm.exchange,
        asset: createForm.asset,
        tradeType: createForm.tradeType,
        entryPrice: parseFloat(createForm.entryPrice),
        entryDate: createForm.entryDate,
        exitPrice: createForm.exitPrice ? parseFloat(createForm.exitPrice) : undefined,
        exitDate: createForm.exitDate || undefined,
        pnlPercentage: createForm.pnlPercentage ? parseFloat(createForm.pnlPercentage) : undefined,
        status: createForm.status,
        comment: createForm.comment || undefined
      }

      console.log('📤 Creating trade:', payload)

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/trading-reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      console.log('📥 Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Server error:', errorData)
        
        // ✅ ДОБАВЛЕНО: Обработка 401 при создании
        if (response.status === 401) {
          alert('Сессия истекла. Страница будет перезагружена.')
          localStorage.removeItem('admin_access_token')
          localStorage.removeItem('admin_refresh_token')
          window.location.reload()
          return
        }
        
        throw new Error(errorData.error || 'Failed to create trade')
      }

      const result = await response.json()
      console.log('✅ Trade created successfully:', result)

      await fetchTrades()
      await fetchStats()
      setShowCreateModal(false)
      setCreateForm({
        exchange: 'BYBIT',
        asset: 'BTC',
        tradeType: 'LONG',
        entryPrice: '',
        entryDate: '',
        exitPrice: '',
        exitDate: '',
        pnlPercentage: '',
        status: 'OPEN',
        comment: ''
      })
    } catch (error) {
      console.error('Error creating trade:', error)
      alert('Ошибка при создании сделки: ' + error.message)
    }
  }

  const handleEdit = (trade) => {
    setEditingId(trade.id)
    setEditForm({
      id: trade.id,
      exchange: trade.exchange,
      asset: trade.asset,
      tradeType: trade.tradeType,
      entryPrice: Number(trade.entryPrice).toString(),
      entryDate: new Date(trade.entryDate).toISOString().split('T')[0],
      exitPrice: trade.exitPrice ? Number(trade.exitPrice).toString() : '',
      exitDate: trade.exitDate ? new Date(trade.exitDate).toISOString().split('T')[0] : '',
      pnlPercentage: trade.pnlPercentage ? Number(trade.pnlPercentage).toString() : '',
      status: trade.status,
      comment: trade.comment || ''
    })
  }

  const handleSave = async () => {
    const token = getAuthToken()
    if (!token) {
      alert('Сессия истекла. Страница будет перезагружена.')
      window.location.reload()
      return
    }

    try {
      const payload = {
        id: editForm.id,
        exchange: editForm.exchange,
        asset: editForm.asset,
        tradeType: editForm.tradeType,
        entryPrice: parseFloat(editForm.entryPrice),
        entryDate: editForm.entryDate,
        exitPrice: editForm.exitPrice ? parseFloat(editForm.exitPrice) : undefined,
        exitDate: editForm.exitDate || undefined,
        pnlPercentage: editForm.pnlPercentage ? parseFloat(editForm.pnlPercentage) : undefined,
        status: editForm.status,
        comment: editForm.comment || undefined
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/trading-reports`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        if (response.status === 401) {
          alert('Сессия истекла. Страница будет перезагружена.')
          localStorage.removeItem('admin_access_token')
          localStorage.removeItem('admin_refresh_token')
          window.location.reload()
          return
        }
        throw new Error('Failed to update trade')
      }

      await fetchTrades()
      await fetchStats()
      setEditingId(null)
      setEditForm({})
    } catch (error) {
      console.error('Error updating trade:', error)
      alert('Ошибка при обновлении сделки')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту сделку?')) return

    const token = getAuthToken()
    if (!token) {
      alert('Сессия истекла. Страница будет перезагружена.')
      window.location.reload()
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/trading-reports/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          alert('Сессия истекла. Страница будет перезагружена.')
          localStorage.removeItem('admin_access_token')
          localStorage.removeItem('admin_refresh_token')
          window.location.reload()
          return
        }
        throw new Error('Failed to delete trade')
      }

      await fetchTrades()
      await fetchStats()
    } catch (error) {
      console.error('Error deleting trade:', error)
      alert('Ошибка при удалении сделки')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleExportCSV = async () => {
    const csvContent = [
      ['Номер', 'Статус', 'Биржа', 'Актив', 'Тип', 'Дата открытия', 'Цена входа', 'Дата закрытия', 'Цена выхода', 'PNL%', 'Комментарий'],
      ...trades.map(t => [
        t.tradeNumber,
        t.status,
        t.exchange,
        t.asset,
        t.tradeType,
        new Date(t.entryDate).toLocaleString('ru-RU'),
        t.entryPrice,
        t.exitDate ? new Date(t.exitDate).toLocaleString('ru-RU') : '-',
        t.exitPrice || '-',
        t.pnlPercentage ? Number(t.pnlPercentage).toFixed(2) + '%' : '-',
        t.comment || ''
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trades_report_${new Date().toISOString()}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'WIN': return '#22c55e'
      case 'LOSS': return '#ef4444'
      case 'OPEN': return '#eab308'
      default: return '#6b7280'
    }
  }

  const formatCurrency = (amount) => {
    return '$' + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatPnl = (pnl) => {
    const num = Number(pnl)
    const sign = num >= 0 ? '+' : ''
    return sign + num.toFixed(2) + '%'
  }

  // ✅ ДОБАВЛЕНО: Показываем сообщение если токена нет
  if (!getAuthToken()) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ fontSize: '24px', color: '#ef4444', fontWeight: '600' }}>
          Сессия не найдена
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px',
            background: tiffanyColor,
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Обновить страницу
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px'
      }}>
        <div style={{ fontSize: '24px', color: tiffanyColor, fontWeight: '600' }}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{
            fontSize: isMobile ? '28px' : '36px',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '8px',
            letterSpacing: '-1px'
          }}>
            Отчетность
          </h1>
          <p style={{
            fontSize: isMobile ? '14px' : '16px',
            color: 'rgba(255, 255, 255, 0.6)',
            margin: 0
          }}>
            Статистика торговых сделок
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '12px 24px',
            background: `linear-gradient(135deg, ${tiffanyColor} 0%, #089690 100%)`,
            border: 'none',
            borderRadius: '12px',
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
          + Добавить сделку
        </button>
      </div>

      {/* Stats Grid - только Total Trades и Total PNL */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: '24px',
        marginBottom: '24px'
      }}>
        <div 
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
            TOTAL TRADES
          </div>

          <div style={{
            fontSize: isMobile ? '32px' : '36px',
            fontWeight: '700',
            color: tiffanyColor,
            marginBottom: '8px',
            letterSpacing: '-1px'
          }}>
            {stats.totalTrades}
          </div>

          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.5)',
            letterSpacing: '0.5px'
          }}>
            Всего сделок
          </div>

          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${tiffanyColor}00 0%, ${tiffanyColor} 50%, ${tiffanyColor}00 100%)`,
            opacity: 0.6
          }} />
        </div>

        <div 
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
            TOTAL PNL
          </div>

          <div style={{
            fontSize: isMobile ? '32px' : '36px',
            fontWeight: '700',
            color: stats.totalPnl >= 0 ? '#22c55e' : '#ef4444',
            marginBottom: '8px',
            letterSpacing: '-1px'
          }}>
            {formatPnl(stats.totalPnl)}
          </div>

          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.5)',
            letterSpacing: '0.5px'
          }}>
            Общая доходность
          </div>

          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${stats.totalPnl >= 0 ? '#22c55e' : '#ef4444'}00 0%, ${stats.totalPnl >= 0 ? '#22c55e' : '#ef4444'} 50%, ${stats.totalPnl >= 0 ? '#22c55e' : '#ef4444'}00 100%)`,
            opacity: 0.6
          }} />
        </div>
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
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '16px',
          alignItems: 'end',
          marginBottom: '16px'
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
              Биржа
            </label>
            <select
              value={filterExchange}
              onChange={(e) => setFilterExchange(e.target.value)}
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
              <option value="ALL">Все биржи</option>
              <option value="BYBIT">BYBIT</option>
              <option value="BingX">BingX</option>
              <option value="MEXC">MEXC</option>
            </select>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
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
              Актив
            </label>
            <select
              value={filterAsset}
              onChange={(e) => setFilterAsset(e.target.value)}
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
              <option value="ALL">Все активы</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
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
              Тип
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
              <option value="ALL">Все типы</option>
              <option value="LONG">Long</option>
              <option value="SHORT">Short</option>
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
              <option value="ALL">Все статусы</option>
              <option value="WIN">Win</option>
              <option value="LOSS">Loss</option>
              <option value="OPEN">Open</option>
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
              setFilterExchange('ALL')
              setFilterAsset('ALL')
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
            Экспорт в CSV
          </button>
        </div>
      </div>

      {/* Trades Table */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        overflow: 'hidden'
      }}>
        {trades.length === 0 ? (
          <div style={{
            padding: '60px',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.5)'
          }}>
            Сделки не найдены
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
                    Номер
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
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Биржа
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
                    Актив
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
                    Дата открытия
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
                    Цена входа
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
                    Дата закрытия
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
                    Цена выхода
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
                    PNL%
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
                    Комментарий
                  </th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  editingId === trade.id ? (
                    <tr 
                      key={trade.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: 'rgba(10, 186, 181, 0.05)'
                      }}
                    >
                      <td style={{ padding: '16px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600' }}>
                        {trade.tradeNumber}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <select
                          value={editForm.status}
                          onChange={(e) => handleEditFormChange('status', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '12px'
                          }}
                        >
                          <option value="OPEN">Open</option>
                          <option value="WIN">Win</option>
                          <option value="LOSS">Loss</option>
                        </select>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <select
                          value={editForm.exchange}
                          onChange={(e) => handleEditFormChange('exchange', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '12px'
                          }}
                        >
                          <option value="BYBIT">BYBIT</option>
                          <option value="BingX">BingX</option>
                          <option value="MEXC">MEXC</option>
                        </select>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <input
                          type="text"
                          value={editForm.asset}
                          onChange={(e) => handleEditFormChange('asset', e.target.value.toUpperCase())}
                          style={{
                            width: '100%',
                            padding: '8px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '12px'
                          }}
                        />
                      </td>
                      <td style={{ padding: '16px' }}>
                        <select
                          value={editForm.tradeType}
                          onChange={(e) => handleEditFormChange('tradeType', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '12px'
                          }}
                        >
                          <option value="LONG">LONG</option>
                          <option value="SHORT">SHORT</option>
                        </select>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <input
                          type="date"
                          value={editForm.entryDate}
                          onChange={(e) => handleEditFormChange('entryDate', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '12px'
                          }}
                        />
                      </td>
                      <td style={{ padding: '16px' }}>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.entryPrice}
                          onChange={(e) => handleEditFormChange('entryPrice', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '12px',
                            textAlign: 'right'
                          }}
                        />
                      </td>
                      <td style={{ padding: '16px' }}>
                        <input
                          type="date"
                          value={editForm.exitDate}
                          onChange={(e) => handleEditFormChange('exitDate', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '12px'
                          }}
                        />
                      </td>
                      <td style={{ padding: '16px' }}>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.exitPrice}
                          onChange={(e) => handleEditFormChange('exitPrice', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '12px',
                            textAlign: 'right'
                          }}
                        />
                      </td>
                      <td style={{ padding: '16px' }}>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.pnlPercentage}
                          readOnly
                          style={{
                            width: '100%',
                            padding: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            color: editForm.pnlPercentage >= 0 ? '#22c55e' : '#ef4444',
                            fontSize: '12px',
                            textAlign: 'right',
                            fontWeight: '700',
                            cursor: 'not-allowed'
                          }}
                        />
                      </td>
                      <td style={{ padding: '16px' }}>
                        <input
                          type="text"
                          value={editForm.comment}
                          onChange={(e) => handleEditFormChange('comment', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '12px'
                          }}
                        />
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={handleSave}
                            style={{
                              padding: '8px 16px',
                              background: '#22c55e',
                              border: 'none',
                              borderRadius: '6px',
                              color: '#fff',
                              fontSize: '12px',
                              cursor: 'pointer',
                              fontWeight: '600'
                            }}
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancel}
                            style={{
                              padding: '8px 16px',
                              background: '#ef4444',
                              border: 'none',
                              borderRadius: '6px',
                              color: '#fff',
                              fontSize: '12px',
                              cursor: 'pointer',
                              fontWeight: '600'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr 
                      key={trade.id}
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
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: '600'
                      }}>
                        {trade.tradeNumber}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: `${getStatusColor(trade.status)}20`,
                          color: getStatusColor(trade.status)
                        }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: getStatusColor(trade.status),
                            boxShadow: `0 0 8px ${getStatusColor(trade.status)}`
                          }} />
                          {trade.status}
                        </div>
                      </td>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontWeight: '500'
                      }}>
                        {trade.exchange}
                      </td>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        color: tiffanyColor,
                        fontWeight: '600'
                      }}>
                        {trade.asset}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: trade.tradeType === 'LONG' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: trade.tradeType === 'LONG' ? '#22c55e' : '#ef4444',
                          whiteSpace: 'nowrap'
                        }}>
                          {trade.tradeType}
                        </span>
                      </td>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.7)'
                      }}>
                        {new Date(trade.entryDate).toLocaleString('ru-RU', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td style={{
                        padding: '16px',
                        textAlign: 'right',
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: '500'
                      }}>
                        {formatCurrency(trade.entryPrice)}
                      </td>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.7)'
                      }}>
                        {trade.exitDate ? new Date(trade.exitDate).toLocaleString('ru-RU', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'}
                      </td>
                      <td style={{
                        padding: '16px',
                        textAlign: 'right',
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: '500'
                      }}>
                        {trade.exitPrice ? formatCurrency(trade.exitPrice) : '-'}
                      </td>
                      <td style={{
                        padding: '16px',
                        textAlign: 'right',
                        fontSize: '16px',
                        fontWeight: '700',
                        color: Number(trade.pnlPercentage) >= 0 ? '#22c55e' : '#ef4444'
                      }}>
                        {trade.pnlPercentage ? formatPnl(trade.pnlPercentage) : '-'}
                      </td>
                      <td style={{
                        padding: '16px',
                        fontSize: '13px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        maxWidth: '200px'
                      }}>
                        {trade.comment || '-'}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleEdit(trade)}
                            style={{
                              padding: '8px 16px',
                              background: tiffanyColor,
                              border: 'none',
                              borderRadius: '6px',
                              color: '#fff',
                              fontSize: '12px',
                              cursor: 'pointer',
                              fontWeight: '600'
                            }}
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleDelete(trade.id)}
                            style={{
                              padding: '8px 16px',
                              background: '#ef4444',
                              border: 'none',
                              borderRadius: '6px',
                              color: '#fff',
                              fontSize: '12px',
                              cursor: 'pointer',
                              fontWeight: '600'
                            }}
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#1a1a1a',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#fff',
              marginBottom: '24px'
            }}>
              Создать новую сделку
            </h2>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Биржа
                  </label>
                  <select
                    value={createForm.exchange}
                    onChange={(e) => handleCreateFormChange('exchange', e.target.value)}
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
                    <option value="BYBIT">BYBIT</option>
                    <option value="BingX">BingX</option>
                    <option value="MEXC">MEXC</option>
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
                    Актив
                  </label>
                  <input
                    type="text"
                    value={createForm.asset}
                    onChange={(e) => handleCreateFormChange('asset', e.target.value.toUpperCase())}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                    placeholder="BTC"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Тип
                  </label>
                  <select
                    value={createForm.tradeType}
                    onChange={(e) => handleCreateFormChange('tradeType', e.target.value)}
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
                    <option value="LONG">LONG</option>
                    <option value="SHORT">SHORT</option>
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
                    value={createForm.status}
                    onChange={(e) => handleCreateFormChange('status', e.target.value)}
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
                    <option value="OPEN">OPEN</option>
                    <option value="WIN">WIN</option>
                    <option value="LOSS">LOSS</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Дата открытия
                  </label>
                  <input
                    type="date"
                    value={createForm.entryDate}
                    onChange={(e) => handleCreateFormChange('entryDate', e.target.value)}
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
                    Цена входа
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={createForm.entryPrice}
                    onChange={(e) => handleCreateFormChange('entryPrice', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Дата закрытия (опционально)
                  </label>
                  <input
                    type="date"
                    value={createForm.exitDate}
                    onChange={(e) => handleCreateFormChange('exitDate', e.target.value)}
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
                    Цена выхода (опционально)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={createForm.exitPrice}
                    onChange={(e) => handleCreateFormChange('exitPrice', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
                  PNL % (рассчитывается автоматически)
                </label>
                <input
                  type="text"
                  value={createForm.pnlPercentage ? `${createForm.pnlPercentage}%` : ''}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    color: createForm.pnlPercentage >= 0 ? '#22c55e' : '#ef4444',
                    fontSize: '16px',
                    fontWeight: '700',
                    textAlign: 'center',
                    cursor: 'not-allowed'
                  }}
                  placeholder="Введите цены для расчета"
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
                  Комментарий (опционально)
                </label>
                <textarea
                  value={createForm.comment}
                  onChange={(e) => handleCreateFormChange('comment', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Добавьте комментарий к сделке..."
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '24px'
            }}>
              <button
                onClick={handleCreate}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: `linear-gradient(135deg, ${tiffanyColor} 0%, #089690 100%)`,
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Создать сделку
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setCreateForm({
                    exchange: 'BYBIT',
                    asset: 'BTC',
                    tradeType: 'LONG',
                    entryPrice: '',
                    entryDate: '',
                    exitPrice: '',
                    exitDate: '',
                    pnlPercentage: '',
                    status: 'OPEN',
                    comment: ''
                  })
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Info */}
      <div style={{
        marginTop: '24px',
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
              Reporting Online
            </span>
            <span>API v1.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}