'use client'
import { useState, useEffect, useMemo } from 'react'

const API_BASE_URL = 'https://dxcapital-ai.com'

export default function HistoryTab({ isMobile, language, user }) {
  const [transactions, setTransactions] = useState([])
  const [tradingReports, setTradingReports] = useState([])
  const [tradingStats, setTradingStats] = useState({ totalTrades: 0, totalPnl: 0 })
  const [loading, setLoading] = useState(true)
  const [tradingLoading, setTradingLoading] = useState(true)

  const translations = {
    en: {
      tradingReportsTitle: 'Trading Reports',
      reportingTitle: 'Transaction History & Reporting',
      loading: 'Loading',
      noTransactions: 'No transactions found',
      noTradingReports: 'No trading reports available',
      deposit: 'Deposit',
      withdrawal: 'Withdrawal',
      upgrade: 'Upgrade',
      earlyWithdrawal: 'Early Withdrawal',
      status: 'Status',
      amount: 'Amount',
      date: 'Date',
      plan: 'Plan',
      statusPending: 'Pending',
      statusApproved: 'Approved',
      statusCompleted: 'Completed',
      statusRejected: 'Rejected',
      statusActive: 'Active',
      transactionType: 'Type',
      totalDeposits: 'Total Deposits',
      totalWithdrawals: 'Total Withdrawals',
      pendingTransactions: 'Pending Transactions',
      totalTrades: 'Total Trades',
      totalPnl: 'Total PNL',
      tradeNumber: 'Number',
      exchange: 'Exchange',
      asset: 'Asset',
      tradeType: 'Type',
      entryDate: 'Entry Date',
      entryPrice: 'Entry Price',
      exitDate: 'Exit Date',
      exitPrice: 'Exit Price',
      pnl: 'PNL%',
      comment: 'Comment',

      riskTitle: 'Risk Level Control',
      riskSubtitle:
        'The chart reflects the current state of strategy risk load considering market conditions and capital management mode.',
      riskAxisLabel: ' ',
      riskMaxLabel: 'Maximum Risk',
      riskLegendLow: 'Controlled Risk',
      riskLegendMid: 'Increased Attention',
      riskLegendHigh: 'Maximum Risk',
      riskNote:
        'The chart reflects the current state of strategy risk load considering market conditions and capital management mode. Not a trading indicator.',
      daysAgo: 'days ago',
      dayAgo: 'day ago',
      weekAgo: 'Week ago'
    },
    ru: {
      tradingReportsTitle: 'Торговые отчеты',
      reportingTitle: 'История транзакций и отчётность',
      loading: 'Загрузка',
      noTransactions: 'Транзакции не найдены',
      noTradingReports: 'Торговые отчеты отсутствуют',
      deposit: 'Пополнение',
      withdrawal: 'Вывод',
      upgrade: 'Апгрейд',
      earlyWithdrawal: 'Досрочный вывод',
      status: 'Статус',
      amount: 'Сумма',
      date: 'Дата',
      plan: 'План',
      statusPending: 'Ожидает',
      statusApproved: 'Одобрено',
      statusCompleted: 'Завершено',
      statusRejected: 'Отклонено',
      statusActive: 'Активна',
      transactionType: 'Тип',
      totalDeposits: 'Всего на счетах',
      totalWithdrawals: 'Всего выводов',
      pendingTransactions: 'Ожидающие транзакции',
      totalTrades: 'Всего сделок',
      totalPnl: 'Общий PNL',
      tradeNumber: 'Номер',
      exchange: 'Биржа',
      asset: 'Актив',
      tradeType: 'Тип',
      entryDate: 'Дата открытия',
      entryPrice: 'Цена входа',
      exitDate: 'Дата закрытия',
      exitPrice: 'Цена выхода',
      pnl: 'PNL%',
      comment: 'Комментарий',

      riskTitle: 'Контроль уровня риска',
      riskSubtitle:
        'График отражает текущее состояние риск-нагрузки стратегии с учётом рыночных условий и режима управления капиталом.',
      riskAxisLabel: ' ',
      riskMaxLabel: 'Предельный риск',
      riskLegendLow: 'Контролируемый риск',
      riskLegendMid: 'Повышенное внимание',
      riskLegendHigh: 'Предельный риск',
      riskNote:
        'График отражает текущее состояние риск-нагрузки стратегии с учётом рыночных условий и режима управления капиталом. Не является торговым индикатором.',
      daysAgo: 'дней назад',
      dayAgo: 'день назад',
      weekAgo: 'Неделю назад'
    }
  }

  const t = translations[language]

  const packages = [
    { name: 'Starter', apy: 14, minAmount: 100, maxAmount: 999, duration: 30 },
    { name: 'Advanced', apy: 18, minAmount: 1000, maxAmount: 2999, duration: 60 },
    { name: 'Pro', apy: 22, minAmount: 3000, maxAmount: 4999, duration: 90 },
    { name: 'Elite', apy: 28, minAmount: 6000, maxAmount: 100000, duration: 180 }
  ]

  useEffect(() => {
    if (user) {
      fetchTradingReports()
      fetchTransactionHistory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchTradingReports = async () => {
    try {
      setTradingLoading(true)

      const statsRes = await fetch(`${API_BASE_URL}/api/v1/trading-reports/stats`)
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setTradingStats(statsData.data || { totalTrades: 0, totalPnl: 0 })
      }

      const reportsRes = await fetch(`${API_BASE_URL}/api/v1/trading-reports`)
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json()
        setTradingReports(reportsData.data || [])
      }
    } catch (error) {
      console.error('Error fetching trading reports:', error)
    } finally {
      setTradingLoading(false)
    }
  }

  const canUpgradeFromPlan = (planName) => {
    const planIndex = packages.findIndex((p) => p.name === planName)
    return planIndex > 0 && planIndex < packages.length
  }

  const fetchTransactionHistory = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      let allTransactions = []

      try {
        const investmentsRes = await fetch(`${API_BASE_URL}/api/v1/investments/my`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          credentials: 'include'
        })

        if (investmentsRes.ok) {
          const investmentsData = await investmentsRes.json()
          const investments = investmentsData.data || []

          investments.forEach((investment) => {
            allTransactions.push({
              id: `deposit-${investment.id}`,
              type: 'deposit',
              amount: parseFloat(investment.amount),
              status: investment.status === 'ACTIVE' || investment.status === 'COMPLETED' ? 'active' : 'pending',
              date: investment.startDate || investment.createdAt,
              planName: investment.planName,
              investmentId: investment.id
            })

            if (investment.pendingUpgrade && canUpgradeFromPlan(investment.planName)) {
              const additionalAmount = parseFloat(
                investment.pendingUpgrade.additionalAmount || investment.pendingUpgrade.newAmount || 0
              )

              if (additionalAmount > 0) {
                allTransactions.push({
                  id: `upgrade-pending-${investment.id}`,
                  type: 'upgrade',
                  amount: additionalAmount,
                  status: 'pending',
                  date: investment.pendingUpgrade.createdAt || new Date().toISOString(),
                  planName: `${investment.planName} → ${investment.pendingUpgrade.targetPackage}`,
                  investmentId: investment.id
                })
              }
            }
          })
        }
      } catch (err) {
        console.error('❌ Error fetching investments:', err)
      }

      try {
        const withdrawalsRes = await fetch(`${API_BASE_URL}/api/v1/investments/withdrawals`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          credentials: 'include'
        })

        if (withdrawalsRes.ok) {
          const withdrawalsData = await withdrawalsRes.json()
          const withdrawals = withdrawalsData.data || withdrawalsData || []

          if (Array.isArray(withdrawals)) {
            const addedWithdrawals = new Set()

            withdrawals.forEach((withdrawal) => {
              const amount = parseFloat(withdrawal.amount || withdrawal.totalAmount || 0)
              const investmentId = withdrawal.investmentId

              if (amount > 0) {
                if (!addedWithdrawals.has(investmentId)) {
                  const isEarly = withdrawal.type === 'EARLY_WITHDRAWAL' || withdrawal.isEarlyWithdrawal

                  allTransactions.push({
                    id: `withdrawal-${withdrawal.id}`,
                    type: isEarly ? 'earlyWithdrawal' : 'withdrawal',
                    amount: amount,
                    status: (withdrawal.status || '').toLowerCase(),
                    date: withdrawal.createdAt || withdrawal.requestedAt,
                    planName: withdrawal.investment?.planName,
                    investmentId: investmentId
                  })

                  addedWithdrawals.add(investmentId)
                }
              }
            })
          }
        }
      } catch (err) {
        console.error('❌ Error fetching withdrawals:', err)
      }

      try {
        const upgradesRes = await fetch(`${API_BASE_URL}/api/v1/investments/upgrades`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          credentials: 'include'
        })

        if (upgradesRes.ok) {
          const upgradesData = await upgradesRes.json()
          const upgrades = upgradesData.data || upgradesData || []

          if (Array.isArray(upgrades)) {
            upgrades.forEach((upgrade) => {
              const amount = parseFloat(upgrade.additionalAmount || 0)

              if (amount > 0 && upgrade.status !== 'REJECTED' && canUpgradeFromPlan(upgrade.oldPackage)) {
                allTransactions.push({
                  id: `upgrade-history-${upgrade.id}`,
                  type: 'upgrade',
                  amount: amount,
                  status: upgrade.status === 'APPROVED' ? 'completed' : (upgrade.status || '').toLowerCase(),
                  date: upgrade.processedDate || upgrade.requestDate,
                  planName: `${upgrade.oldPackage} → ${upgrade.newPackage}`,
                  investmentId: upgrade.investmentId
                })
              }
            })
          }
        }
      } catch (err) {
        console.error('❌ Error fetching upgrades:', err)
      }

      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))
      setTransactions(allTransactions)
      setLoading(false)
    } catch (error) {
      console.error('❌ Error fetching transaction history:', error)
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPnl = (pnl) => {
    const num = Number(pnl)
    const sign = num >= 0 ? '+' : ''
    return sign + num.toFixed(2) + '%'
  }

  const getTransactionTypeLabel = (type) => {
    const labels = { deposit: t.deposit, withdrawal: t.withdrawal, upgrade: t.upgrade, earlyWithdrawal: t.earlyWithdrawal }
    return labels[type] || type
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: t.statusPending,
      approved: t.statusApproved,
      completed: t.statusCompleted,
      rejected: t.statusRejected,
      active: t.statusActive,
      WIN: 'Win',
      LOSS: 'Loss',
      OPEN: 'Open'
    }
    return labels[status] || status
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#065f46',
      approved: '#10b981',
      completed: '#2dd4bf',
      rejected: '#064e3b',
      active: '#10b981',
      WIN: '#10b981',
      LOSS: '#ef4444',
      OPEN: '#eab308'
    }
    return colors[status] || '#047857'
  }

  const getTransactionTypeColor = (type) => {
    const colors = { deposit: '#10b981', withdrawal: '#2dd4bf', upgrade: '#14b8a6', earlyWithdrawal: '#059669' }
    return colors[type] || '#047857'
  }

  const totalDeposits = transactions
    .filter((x) => x.type === 'deposit' && (x.status === 'active' || x.status === 'completed'))
    .reduce((sum, x) => sum + x.amount, 0)

  const totalWithdrawals = transactions
    .filter((x) => (x.type === 'withdrawal' || x.type === 'earlyWithdrawal') && (x.status === 'completed' || x.status === 'approved'))
    .reduce((sum, x) => sum + x.amount, 0)

  const pendingCount = transactions.filter(
    (x) => x.status === 'pending' && (x.type === 'upgrade' || x.type === 'withdrawal' || x.type === 'earlyWithdrawal')
  ).length

  const tiffanyColor = '#0abab5'

  // ---------------------------
  // Risk series with memory
  // ---------------------------

  const riskStorageKey = useMemo(() => {
    const uid = user?.id ? String(user.id) : 'guest'
    return `dxcap_risk_series_v1_${uid}`
  }, [user])

  const todayKey = useMemo(() => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }, [])

  const mulberry32 = (seedInt) => {
    let a = seedInt >>> 0
    return function () {
      a |= 0
      a = (a + 0x6D2B79F5) | 0
      let t0 = Math.imul(a ^ (a >>> 15), 1 | a)
      t0 = (t0 + Math.imul(t0 ^ (t0 >>> 7), 61 | t0)) ^ t0
      return ((t0 ^ (t0 >>> 14)) >>> 0) / 4294967296
    }
  }

  const hashStringToUint32 = (str) => {
    let h = 2166136261
    for (let i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    return h >>> 0
  }

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

  const daysBetween = (fromYmd, toYmd) => {
    const f = new Date(fromYmd + 'T00:00:00Z')
    const t2 = new Date(toYmd + 'T00:00:00Z')
    const ms = t2.getTime() - f.getTime()
    return Math.floor(ms / 86400000)
  }

  const nextValue = (prev, seedStr) => {
    const rng = mulberry32(hashStringToUint32(seedStr))
    const drift = (rng() - 0.5) * 0.06
    const noise = (rng() - 0.5) * 0.10
    const inertia = (prev - 0.45) * 0.10
    const v = prev + drift + noise - inertia
    return clamp(v, 0.10, 0.92)
  }

  const getInitialSeries = (seedStr) => {
    const rng = mulberry32(hashStringToUint32(seedStr))
    const arr = []
    let v = 0.30 + rng() * 0.10
    for (let i = 0; i < 7; i += 1) {
      v = nextValue(v, seedStr + ':' + String(i))
      arr.push(v)
    }
    // добавить выраженный пик ближе к концу, но без разрыва
    arr[4] = clamp(arr[4] + 0.18, 0.10, 0.92)
    arr[5] = clamp(arr[5] + 0.08, 0.10, 0.92)
    return arr
  }

  const [riskSeries, setRiskSeries] = useState(null)

  useEffect(() => {
    if (!riskStorageKey) return

    const seedBase = `${riskStorageKey}`
    const raw = localStorage.getItem(riskStorageKey)

    let state
    try {
      state = raw ? JSON.parse(raw) : null
    } catch {
      state = null
    }

    const init = () => {
      const series = getInitialSeries(seedBase + ':' + todayKey)
      const payload = { lastDate: todayKey, series }
      localStorage.setItem(riskStorageKey, JSON.stringify(payload))
      setRiskSeries(series)
    }

    if (!state || !Array.isArray(state.series) || state.series.length !== 7 || !state.lastDate) {
      init()
      return
    }

    const diff = daysBetween(state.lastDate, todayKey)
    if (diff <= 0) {
      setRiskSeries(state.series)
      return
    }

    // сдвиг на diff дней; если diff больше недели, инициализация от текущего дня
    if (diff >= 7) {
      init()
      return
    }

    let series = state.series.slice()
    let last = series[series.length - 1]
    for (let i = 0; i < diff; i += 1) {
      series = series.slice(1)
      const seed = `${seedBase}:${todayKey}:shift:${i}`
      last = nextValue(last, seed)
      series.push(last)
    }

    const payload = { lastDate: todayKey, series }
    localStorage.setItem(riskStorageKey, JSON.stringify(payload))
    setRiskSeries(series)
  }, [riskStorageKey, todayKey])

  const catmullRomToBezierPath = (pts) => {
    if (!pts || pts.length < 2) return ''
    if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`

    const d = []
    d.push(`M ${pts[0].x} ${pts[0].y}`)
    for (let i = 0; i < pts.length - 1; i += 1) {
      const p0 = pts[i - 1] || pts[i]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const p3 = pts[i + 2] || p2

      const c1x = p1.x + (p2.x - p0.x) / 6
      const c1y = p1.y + (p2.y - p0.y) / 6
      const c2x = p2.x - (p3.x - p1.x) / 6
      const c2y = p2.y - (p3.y - p1.y) / 6

      d.push(`C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`)
    }
    return d.join(' ')
  }

  const formatDDMM = (ymd) => {
    const d = new Date(ymd + 'T00:00:00')
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    return `${dd}/${mm}`
  }

  const agoLabel = (n) => {
    if (language === 'ru') {
      if (n === 7) return t.weekAgo
      if (n === 1) return t.dayAgo
      return `${n} ${t.daysAgo}`
    }
    if (n === 7) return t.weekAgo
    if (n === 1) return `1 ${t.dayAgo}`
    return `${n} ${t.daysAgo}`
  }

  const riskChart = useMemo(() => {
    const values = Array.isArray(riskSeries) && riskSeries.length === 7 ? riskSeries : null

    const w = isMobile ? 640 : 900
    const h = 280

    // увеличили padL, чтобы подпись оси Y не обрезалась
    const padL = isMobile ? 78 : 88
    const padR = 18
    const padT = 22
    const padB = 54

    const innerW = w - padL - padR
    const innerH = h - padT - padB

    const xStep = innerW / 6

    const pts = values
      ? values.map((v, i) => {
          const x = padL + i * xStep
          const y = padT + (1 - v) * innerH
          return { x, y, v, i }
        })
      : []

    const pathD = values ? catmullRomToBezierPath(pts) : ''

    // 7 точек: слева 7 days ago, справа дата, часть подписей скрываем
    const labels = []
    for (let i = 0; i < 7; i += 1) {
      const daysAgo = 6 - i
      if (i === 0) labels.push(agoLabel(7))
      else if (i === 6) labels.push(formatDDMM(todayKey))
      else labels.push(agoLabel(daysAgo))
    }

    // на мобильном оставляем 4 подписи, чтобы не ломать верстку
    const showLabelAt = (idx) => {
      if (!isMobile) return idx === 0 || idx === 2 || idx === 4 || idx === 6
      return idx === 0 || idx === 3 || idx === 6
    }

    const guideIndices = [2, 4, 5]

    return {
      w,
      h,
      padL,
      padR,
      padT,
      padB,
      innerW,
      innerH,
      pts,
      pathD,
      labels,
      showLabelAt,
      guideIndices
    }
  }, [riskSeries, isMobile, language, t.weekAgo, t.dayAgo, t.daysAgo, todayKey])

  if (loading && tradingLoading) {
    return (
      <div style={{ textAlign: 'center', padding: isMobile ? '48px 24px' : '80px 48px', color: 'rgba(255, 255, 255, 0.6)' }}>
        {t.loading}...
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '600', color: '#ffffff', marginBottom: '28px', letterSpacing: '-1px' }}>
          {t.tradingReportsTitle}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${tiffanyColor}15 0%, ${tiffanyColor}05 100%)`,
              border: `1px solid ${tiffanyColor}40`,
              borderRadius: '24px',
              padding: isMobile ? '20px' : '24px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: `radial-gradient(circle, ${tiffanyColor}20 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t.totalTrades}
            </div>
            <div style={{ fontSize: isMobile ? '28px' : '32px', fontWeight: '600', color: tiffanyColor, letterSpacing: '-1px' }}>{tradingStats.totalTrades}</div>
          </div>

          <div
            style={{
              background: `linear-gradient(135deg, ${tradingStats.totalPnl >= 0 ? '#10b98115' : '#ef444415'} 0%, ${
                tradingStats.totalPnl >= 0 ? '#10b98105' : '#ef444405'
              } 100%)`,
              border: `1px solid ${tradingStats.totalPnl >= 0 ? '#10b98140' : '#ef444440'}`,
              borderRadius: '24px',
              padding: isMobile ? '20px' : '24px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: `radial-gradient(circle, ${tradingStats.totalPnl >= 0 ? '#10b98120' : '#ef444420'} 0%, transparent 70%)`,
                pointerEvents: 'none'
              }}
            />
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t.totalPnl}
            </div>
            <div style={{ fontSize: isMobile ? '28px' : '32px', fontWeight: '600', color: tradingStats.totalPnl >= 0 ? '#10b981' : '#ef4444', letterSpacing: '-1px' }}>
              {formatPnl(tradingStats.totalPnl)}
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(18px)',
            border: '1px solid rgba(255, 255, 255, 0.10)',
            borderRadius: isMobile ? '20px' : '26px',
            padding: isMobile ? '18px 16px' : '22px 22px',
            overflow: 'hidden',
            marginBottom: '26px'
          }}
        >
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '650', color: '#ffffff', letterSpacing: '-0.6px', marginBottom: '6px' }}>
              {t.riskTitle}
            </div>
            <div style={{ fontSize: isMobile ? '12px' : '13px', lineHeight: isMobile ? '16px' : '18px', color: 'rgba(255, 255, 255, 0.58)', maxWidth: '900px' }}>
              {t.riskSubtitle}
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(800px 220px at 70% 30%, rgba(10, 186, 181, 0.16) 0%, transparent 60%), radial-gradient(700px 220px at 30% 70%, rgba(255, 255, 255, 0.06) 0%, transparent 60%)',
                pointerEvents: 'none'
              }}
            />

            <div style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden' }}>
              <div style={{ width: '100%', minWidth: isMobile ? '640px' : '900px' }}>
                <svg
                  width="100%"
                  viewBox={`0 0 ${riskChart.w} ${riskChart.h}`}
                  preserveAspectRatio="none"
                  role="img"
                  aria-label={t.riskTitle}
                  style={{ display: 'block', borderRadius: '18px' }}
                >
                  <defs>
                    <linearGradient id="riskBand" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="rgba(16,185,129,0.22)" />
                      <stop offset="45%" stopColor="rgba(234,179,8,0.22)" />
                      <stop offset="100%" stopColor="rgba(239,68,68,0.26)" />
                    </linearGradient>

                    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feColorMatrix
                        in="blur"
                        type="matrix"
                        values="
                          1 0 0 0 0
                          0 1 0 0 0
                          0 0 1 0 0
                          0 0 0 0.8 0"
                        result="glow"
                      />
                      <feMerge>
                        <feMergeNode in="glow" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>

                    <filter id="dotGlow" x="-60%" y="-60%" width="220%" height="220%">
                      <feGaussianBlur stdDeviation="4" result="b" />
                      <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <rect x={riskChart.padL} y={riskChart.padT} width={riskChart.innerW} height={riskChart.innerH} rx="14" fill="url(#riskBand)" opacity="1" />

                  {[0.25, 0.5, 0.75].map((p) => {
                    const y = riskChart.padT + p * riskChart.innerH
                    return <line key={p} x1={riskChart.padL} y1={y} x2={riskChart.padL + riskChart.innerW} y2={y} stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
                  })}

                  <line
                    x1={riskChart.padL}
                    y1={riskChart.padT - 4}
                    x2={riskChart.padL}
                    y2={riskChart.padT + riskChart.innerH + 8}
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth="2"
                  />

                  <line
                    x1={riskChart.padL}
                    y1={riskChart.padT + 0.16 * riskChart.innerH}
                    x2={riskChart.padL + riskChart.innerW}
                    y2={riskChart.padT + 0.16 * riskChart.innerH}
                    stroke="rgba(239,68,68,0.55)"
                    strokeWidth="2"
                  />

                  <text
                    x={riskChart.padL + riskChart.innerW - 10}
                    y={riskChart.padT + 0.16 * riskChart.innerH - 10}
                    textAnchor="end"
                    fill="rgba(255,255,255,0.70)"
                    fontSize="14"
                    fontWeight="600"
                  >
                    {t.riskMaxLabel}
                  </text>

                  {riskChart.guideIndices.map((idx) => {
                    const p = riskChart.pts[idx]
                    if (!p) return null
                    return (
                      <line
                        key={idx}
                        x1={p.x}
                        y1={p.y + 10}
                        x2={p.x}
                        y2={riskChart.padT + riskChart.innerH + 8}
                        stroke="rgba(255,255,255,0.18)"
                        strokeDasharray="4 6"
                        strokeWidth="1"
                        opacity="0.55"
                      />
                    )
                  })}

                  {riskChart.pathD ? (
                    <>
                      <path d={riskChart.pathD} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="7" filter="url(#softGlow)" />
                      <path d={riskChart.pathD} fill="none" stroke="rgba(255,255,255,0.92)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                    </>
                  ) : null}

                  {riskChart.pts.map((p) => {
                    const isKey = p.i === 0 || p.i === 2 || p.i === 4 || p.i === 5 || p.i === 6
                    if (!isKey) return null
                    return (
                      <g key={p.i}>
                        <circle cx={p.x} cy={p.y} r="9" fill="rgba(255,255,255,0.12)" filter="url(#dotGlow)" />
                        <circle cx={p.x} cy={p.y} r="5.5" fill="rgba(255,255,255,0.95)" />
                      </g>
                    )
                  })}

                  <text
                    x={riskChart.padL - 16}
                    y={riskChart.padT + 28}
                    textAnchor="end"
                    fill="rgba(255,255,255,0.70)"
                    fontSize="14"
                    fontWeight="600"
                  >
                    {t.riskAxisLabel}
                  </text>

                  {riskChart.pts.map((p) => {
                    const label = riskChart.labels[p.i]
                    if (!label) return null
                    if (!riskChart.showLabelAt(p.i)) return null
                    return (
                      <text key={p.i} x={p.x} y={riskChart.padT + riskChart.innerH + 34} textAnchor="middle" fill="rgba(255,255,255,0.66)" fontSize="14" fontWeight="500">
                        {label}
                      </text>
                    )
                  })}
                </svg>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '10px' }}>
              <LegendItem color="#10b981" text={t.riskLegendLow} />
              <LegendItem color="#eab308" text={t.riskLegendMid} />
              <LegendItem color="#ef4444" text={t.riskLegendHigh} />
            </div>

            <div style={{ marginTop: '12px', color: 'rgba(255,255,255,0.50)', fontSize: isMobile ? '12px' : '13px', lineHeight: isMobile ? '16px' : '18px' }}>
              {t.riskNote}
            </div>
          </div>
        </div>

        {tradingReports.length > 0 ? (
          isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tradingReports.map((trade) => (
                <div
                  key={trade.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    padding: '16px',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: tiffanyColor }}>{trade.asset}</div>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 10px',
                        background: `${getStatusColor(trade.status)}22`,
                        border: `1px solid ${getStatusColor(trade.status)}66`,
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '600',
                        color: getStatusColor(trade.status),
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {getStatusLabel(trade.status)}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>{t.exchange}</div>
                      <div style={{ fontSize: '12px', color: '#fff', fontWeight: '500' }}>{trade.exchange}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>{t.tradeType}</div>
                      <div
                        style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: trade.tradeType === 'LONG' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: trade.tradeType === 'LONG' ? '#10b981' : '#ef4444'
                        }}
                      >
                        {trade.tradeType}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>{t.entryPrice}</div>
                      <div style={{ fontSize: '12px', color: '#fff', fontWeight: '500' }}>{formatCurrency(trade.entryPrice)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>{t.exitPrice}</div>
                      <div style={{ fontSize: '12px', color: '#fff', fontWeight: '500' }}>{trade.exitPrice ? formatCurrency(trade.exitPrice) : '-'}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>{t.pnl}</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: Number(trade.pnlPercentage) >= 0 ? '#10b981' : '#ef4444', marginBottom: '8px' }}>
                    {trade.pnlPercentage ? formatPnl(trade.pnlPercentage) : '-'}
                  </div>

                  {trade.comment && (
                    <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>{t.comment}:</span> {trade.comment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <th style={thStyle()}>{t.status}</th>
                      <th style={thStyle()}>{t.exchange}</th>
                      <th style={thStyle()}>{t.asset}</th>
                      <th style={thStyle({ padding: '16px 8px' })}>{t.tradeType}</th>
                      <th style={thStyle({ padding: '16px 8px', textAlign: 'right' })}>{t.entryPrice}</th>
                      <th style={thStyle({ textAlign: 'right' })}>{t.exitPrice}</th>
                      <th style={thStyle({ textAlign: 'right' })}>{t.pnl}</th>
                      <th style={thStyle()}>{t.comment}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tradingReports.map((trade) => (
                      <tr
                        key={trade.id}
                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.2s' }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: `${getStatusColor(trade.status)}22`, color: getStatusColor(trade.status) }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: getStatusColor(trade.status), boxShadow: `0 0 6px ${getStatusColor(trade.status)}` }} />
                            {getStatusLabel(trade.status)}
                          </div>
                        </td>
                        <td style={{ padding: '16px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500' }}>{trade.exchange}</td>
                        <td style={{ padding: '16px', fontSize: '13px', color: tiffanyColor, fontWeight: '600' }}>{trade.asset}</td>
                        <td style={{ padding: '16px 8px' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: '600',
                              background: trade.tradeType === 'LONG' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                              color: trade.tradeType === 'LONG' ? '#10b981' : '#ef4444',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {trade.tradeType}
                          </span>
                        </td>
                        <td style={{ padding: '16px 8px', textAlign: 'right', fontSize: '13px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500' }}>{formatCurrency(trade.entryPrice)}</td>
                        <td style={{ padding: '16px', textAlign: 'right', fontSize: '13px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500' }}>{trade.exitPrice ? formatCurrency(trade.exitPrice) : '-'}</td>
                        <td style={{ padding: '16px', textAlign: 'right', fontSize: '15px', fontWeight: '700', color: Number(trade.pnlPercentage) >= 0 ? '#10b981' : '#ef4444' }}>
                          {trade.pnlPercentage ? formatPnl(trade.pnlPercentage) : '-'}
                        </td>
                        <td style={{ padding: '16px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {trade.comment || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: isMobile ? '20px' : '24px', padding: isMobile ? '32px 20px' : '48px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: isMobile ? '13px' : '15px', letterSpacing: '-0.3px' }}>{t.noTradingReports}</p>
          </div>
        )}
      </div>

      <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '600', color: '#ffffff', marginBottom: '28px', letterSpacing: '-1px' }}>
        {t.reportingTitle}
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '24px', padding: isMobile ? '20px' : '24px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.totalDeposits}</div>
          <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '600', color: '#10b981', letterSpacing: '-1px' }}>{formatCurrency(totalDeposits)}</div>
        </div>

        <div style={{ background: 'rgba(45, 212, 191, 0.1)', border: '1px solid rgba(45, 212, 191, 0.3)', borderRadius: '24px', padding: isMobile ? '20px' : '24px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.totalWithdrawals}</div>
          <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '600', color: '#2dd4bf', letterSpacing: '-1px' }}>{formatCurrency(totalWithdrawals)}</div>
        </div>

        <div style={{ background: 'rgba(6, 95, 70, 0.2)', border: '1px solid rgba(6, 95, 70, 0.4)', borderRadius: '24px', padding: isMobile ? '20px' : '24px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.pendingTransactions}</div>
          <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '600', color: '#065f46', letterSpacing: '-1px' }}>{pendingCount}</div>
        </div>
      </div>

      {transactions.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '16px' }}>
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: isMobile ? '20px' : '24px',
                padding: isMobile ? '16px 18px' : '20px 24px',
                transition: 'all 0.3s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', background: `${getTransactionTypeColor(transaction.type)}22`, border: `1px solid ${getTransactionTypeColor(transaction.type)}66`, borderRadius: '12px', fontSize: isMobile ? '11px' : '12px', fontWeight: '600', color: getTransactionTypeColor(transaction.type), textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {getTransactionTypeLabel(transaction.type)}
                    </div>

                    <div style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', background: `${getStatusColor(transaction.status)}22`, border: `1px solid ${getStatusColor(transaction.status)}66`, borderRadius: '12px', fontSize: isMobile ? '10px' : '11px', fontWeight: '600', color: getStatusColor(transaction.status), textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {getStatusLabel(transaction.status)}
                    </div>
                  </div>

                  <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '600', color: transaction.type === 'withdrawal' || transaction.type === 'earlyWithdrawal' ? '#2dd4bf' : '#10b981', marginBottom: '8px' }}>
                    {transaction.type === 'withdrawal' || transaction.type === 'earlyWithdrawal'
                      ? `-${formatCurrency(transaction.amount)}`
                      : transaction.type === 'upgrade'
                        ? formatCurrency(transaction.amount)
                        : `+${formatCurrency(transaction.amount)}`}
                  </div>

                  {transaction.planName && (
                    <div style={{ fontSize: isMobile ? '12px' : '13px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
                      {t.plan}: {transaction.planName}
                    </div>
                  )}

                  <div style={{ fontSize: isMobile ? '11px' : '12px', color: 'rgba(255, 255, 255, 0.5)' }}>{formatDate(transaction.date)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: isMobile ? '20px' : '24px', padding: isMobile ? '32px 20px' : '48px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: isMobile ? '13px' : '15px', letterSpacing: '-0.3px' }}>{t.noTransactions}</p>
        </div>
      )}
    </div>
  )
}

function LegendItem({ color, text }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}` }} />
      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.70)', fontWeight: '500' }}>{text}</span>
    </div>
  )
}

function thStyle(extra = {}) {
  return {
    padding: '16px',
    textAlign: 'left',
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    ...extra
  }
}