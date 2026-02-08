'use client'
import { useState, useEffect } from 'react'
import KYCModal from './KYCModal'

const API_BASE_URL = 'https://dxcapital-ai.com'

export default function OverviewTab({ 
  isMobile, 
  language, 
  user, 
  kycStatus, 
  onOpenKYCModal,
  onNavigateToInvestments  // ✅ НОВЫЙ ПРОП для навигации
}) {
  const [portfolioData, setPortfolioData] = useState({
    totalCapital: 0,
    capitalInWork: 0,
    availableBalance: 0,
    accumulatedReturnPercent: 0,
    activePlans: 0,
    loading: true
  })
  const [investments, setInvestments] = useState([])
  const [activeInvestments, setActiveInvestments] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loadingTransactions, setLoadingTransactions] = useState(true)
  const [showKYCModal, setShowKYCModal] = useState(false)
  const [userKYCStatus, setUserKYCStatus] = useState(kycStatus || 'NOT_SUBMITTED')

  const translations = {
    en: {
      portfolioOverview: 'Capital Overview',
      totalCapital: 'Total Capital',
      capitalInWork: 'Capital in Work',
      availableBalance: 'Available Balance',
      accumulatedReturn: 'Accumulated Return',
      activePlans: 'Active Plans',
      loading: 'Loading',
      reportingTitle: 'Transaction Statistics',
      totalDeposits: 'Total Deposits',
      totalWithdrawals: 'Total Withdrawals',
      noTransactions: 'No transactions found',
      deposit: 'Deposit',
      withdrawal: 'Withdrawal',
      upgrade: 'Upgrade',
      earlyWithdrawal: 'Early Withdrawal',
      plan: 'Plan',
      statusPending: 'Pending',
      statusApproved: 'Approved',
      statusCompleted: 'Completed',
      statusRejected: 'Rejected',
      statusActive: 'Active',
      kycWarningTitle: 'Complete KYC Verification',
      kycWarningText: 'To access investment features, please complete identity verification',
      kycVerifyButton: 'Verify Now',
      kycSubmittedSuccess: 'Your documents have been submitted for review. You will be able to access features after approval.',
      activeInvestmentsTitle: 'Active Investments',
      riskLevel: 'Risk Level: Low',
      noActiveInvestments: 'No active investments',
      invested: 'Invested',
      currentReturn: 'Current Return',
      availableProfit: 'Available',
      completesOn: 'Completes',
      daysRemaining: 'days left',
      daysPassed: 'days passed',
      accumulatedPercent: 'Accumulated',
      managePlan: 'Manage Plan'  // ✅ НОВЫЙ КЛЮЧ
    },
    ru: {
      portfolioOverview: 'Обзор капитала',
      totalCapital: 'Общий капитал',
      capitalInWork: 'Капитал в работе',
      availableBalance: 'Доступный остаток',
      accumulatedReturn: 'Накопленный результат',
      activePlans: 'Активных планов',
      loading: 'Загрузка',
      reportingTitle: 'Статистика транзакций',
      totalDeposits: 'Всего пополнений',
      totalWithdrawals: 'Всего выводов',
      noTransactions: 'Транзакции не найдены',
      deposit: 'Пополнение',
      withdrawal: 'Вывод',
      upgrade: 'Апгрейд',
      earlyWithdrawal: 'Досрочный вывод',
      plan: 'План',
      statusPending: 'Ожидает',
      statusApproved: 'Одобрено',
      statusCompleted: 'Завершено',
      statusRejected: 'Отклонено',
      statusActive: 'Активна',
      kycWarningTitle: 'Пройдите KYC верификацию',
      kycWarningText: 'Для доступа к инвестиционным функциям необходимо подтвердить личность',
      kycVerifyButton: 'Пройти сейчас',
      kycSubmittedSuccess: 'Ваши документы отправлены на проверку. Вы сможете получить доступ к функциям после одобрения.',
      activeInvestmentsTitle: 'Активные инвестиции',
      riskLevel: 'Уровень риска: низкий',
      noActiveInvestments: 'Нет активных инвестиций',
      invested: 'Инвестировано',
      currentReturn: 'Текущий доход',
      availableProfit: 'Доступно',
      completesOn: 'Завершится',
      daysRemaining: 'дн. осталось',
      daysPassed: 'дн. прошло',
      accumulatedPercent: 'Накоплено',
      managePlan: 'Управлять планом'  // ✅ НОВЫЙ КЛЮЧ
    }
  }

  const t = translations[language]

  const packages = [
    { name: 'Starter', apy: 14, minAmount: 100, maxAmount: 999, duration: 30 },
    { name: 'Advanced', apy: 17, minAmount: 1000, maxAmount: 2999, duration: 60 },
    { name: 'Pro', apy: 20, minAmount: 3000, maxAmount: 4999, duration: 90 },
    { name: 'Elite', apy: 22, minAmount: 6000, maxAmount: 100000, duration: 180 }
  ]

  useEffect(() => {
    if (user) {
      fetchPortfolioData()
      fetchTransactionHistory()
    }
  }, [user])

  useEffect(() => {
    setUserKYCStatus(kycStatus || 'NOT_SUBMITTED')
  }, [kycStatus])

  const handleOpenKYCModal = () => {
    setShowKYCModal(true)
  }

  const handleKYCSubmitted = () => {
    setShowKYCModal(false)
    setUserKYCStatus('PENDING')
    alert(t.kycSubmittedSuccess)
  }

  const canUpgradeFromPlan = (planName) => {
    const planIndex = packages.findIndex(p => p.name === planName)
    return planIndex > 0 && planIndex < packages.length
  }

  // ✅ НОВАЯ ФУНКЦИЯ: переход к разделу "Ваши инвестиции"
  const handleManagePlan = (investmentId) => {
    if (onNavigateToInvestments) {
      onNavigateToInvestments(investmentId)
    }
  }

  const fetchPortfolioData = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setPortfolioData({
        totalCapital: 0,
        capitalInWork: 0,
        availableBalance: 0,
        accumulatedReturnPercent: 0,
        activePlans: 0,
        loading: false
      })
      return
    }

    try {
      
      const response = await fetch(`${API_BASE_URL}/api/v1/investments/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        const investmentsList = data.data || []
        

        const activeInvs = investmentsList.filter(inv => inv.status === 'ACTIVE')
        setActiveInvestments(activeInvs)
        setInvestments(activeInvs)

        let capitalInWork = 0
        let availableBalance = 0
        let totalWithdrawnProfit = 0
        let activePlans = 0

        investmentsList.forEach(investment => {
          const amount = parseFloat(investment.amount || 0)
          const status = investment.status
          const availableProfit = parseFloat(investment.availableProfit || 0)
          const withdrawnProfits = parseFloat(investment.withdrawnProfits || 0)

          if (status === 'ACTIVE' || status === 'COMPLETED') {
            capitalInWork += amount
          }

          if (status === 'ACTIVE') {
            availableBalance += availableProfit
            totalWithdrawnProfit += withdrawnProfits
          }

          if (status === 'ACTIVE') {
            activePlans++
          }

            amount,
            availableProfit,
            withdrawnProfits,
            status
          })
        })

        const totalCapital = capitalInWork + availableBalance
        
        const totalAccumulatedProfit = availableBalance + totalWithdrawnProfit
        const accumulatedReturnPercent = capitalInWork > 0 
          ? (totalAccumulatedProfit / capitalInWork) * 100 
          : 0

          totalCapital,
          capitalInWork,
          availableBalance,
          totalWithdrawnProfit,
          totalAccumulatedProfit,
          accumulatedReturnPercent: accumulatedReturnPercent.toFixed(2) + '%',
          activePlans
        })

        setPortfolioData({
          totalCapital,
          capitalInWork,
          availableBalance,
          accumulatedReturnPercent,
          activePlans,
          loading: false
        })
      } else {
        console.error('Failed to fetch investments')
        setPortfolioData({
          totalCapital: 0,
          capitalInWork: 0,
          availableBalance: 0,
          accumulatedReturnPercent: 0,
          activePlans: 0,
          loading: false
        })
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error)
      setPortfolioData({
        totalCapital: 0,
        capitalInWork: 0,
        availableBalance: 0,
        accumulatedReturnPercent: 0,
        activePlans: 0,
        loading: false
      })
    }
  }

  const fetchTransactionHistory = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoadingTransactions(false)
      return
    }

    try {
      
      let allTransactions = []

      try {
        const investmentsRes = await fetch(`${API_BASE_URL}/api/v1/investments/my`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })

        if (investmentsRes.ok) {
          const investmentsData = await investmentsRes.json()
          const investments = investmentsData.data || []
          
          investments.forEach(investment => {
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
              const additionalAmount = parseFloat(investment.pendingUpgrade.additionalAmount || investment.pendingUpgrade.newAmount || 0)
              
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
        console.error('Error fetching investments:', err)
      }

      try {
        const withdrawalsRes = await fetch(`${API_BASE_URL}/api/v1/investments/withdrawals`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })

        if (withdrawalsRes.ok) {
          const withdrawalsData = await withdrawalsRes.json()
          const withdrawals = withdrawalsData.data || withdrawalsData || []
          
          if (Array.isArray(withdrawals)) {
            const addedWithdrawals = new Set()
            
            withdrawals.forEach(withdrawal => {
              const amount = parseFloat(withdrawal.amount || withdrawal.totalAmount || 0)
              const investmentId = withdrawal.investmentId
              
              if (amount > 0 && !addedWithdrawals.has(investmentId)) {
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
            })
          }
        }
      } catch (err) {
        console.error('Error fetching withdrawals:', err)
      }

      try {
        const upgradesRes = await fetch(`${API_BASE_URL}/api/v1/investments/upgrades`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })

        if (upgradesRes.ok) {
          const upgradesData = await upgradesRes.json()
          const upgrades = upgradesData.data || upgradesData || []
          
          if (Array.isArray(upgrades)) {
            upgrades.forEach(upgrade => {
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
        console.error('Error fetching upgrades:', err)
      }

      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))


      setTransactions(allTransactions)
      setLoadingTransactions(false)
    } catch (error) {
      console.error('Error fetching transaction history:', error)
      setLoadingTransactions(false)
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

  const formatPercent = (value) => {
    return value.toFixed(2) + '%'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTransactionDate = (dateString) => {
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

  const getTransactionTypeLabel = (type) => {
    const labels = {
      deposit: t.deposit,
      withdrawal: t.withdrawal,
      upgrade: t.upgrade,
      earlyWithdrawal: t.earlyWithdrawal
    }
    return labels[type] || type
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: t.statusPending,
      approved: t.statusApproved,
      completed: t.statusCompleted,
      rejected: t.statusRejected,
      active: t.statusActive
    }
    return labels[status] || status
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#2dd4bf',
      approved: '#2dd4bf',
      completed: '#2dd4bf',
      rejected: '#14b8a6',
      active: '#2dd4bf'
    }
    return colors[status] || '#2dd4bf'
  }

  const getTransactionTypeColor = (type) => {
    const colors = {
      deposit: '#2dd4bf',
      withdrawal: '#2dd4bf',
      upgrade: '#14b8a6',
      earlyWithdrawal: '#14b8a6'
    }
    return colors[type] || '#2dd4bf'
  }

  const calculateInvestmentAccumulatedPercent = (investment) => {
    const investedAmount = parseFloat(investment.amount || 0)
    const availableProfit = parseFloat(investment.availableProfit || 0)
    const withdrawnProfits = parseFloat(investment.withdrawnProfits || 0)
    
    const totalAccumulated = availableProfit + withdrawnProfits
    
    if (investedAmount <= 0) return 0
    
    return (totalAccumulated / investedAmount) * 100
  }

  const stats = [
    { 
      label: t.totalCapital, 
      value: portfolioData.loading ? t.loading : formatCurrency(portfolioData.totalCapital), 
      color: '#2dd4bf', 
      gradient: 'rgba(45, 212, 191, 0.1)' 
    },
    { 
      label: t.capitalInWork, 
      value: portfolioData.loading ? t.loading : formatCurrency(portfolioData.capitalInWork), 
      color: '#10b981', 
      gradient: 'rgba(16, 185, 129, 0.1)' 
    },
    { 
      label: t.availableBalance, 
      value: portfolioData.loading ? t.loading : formatCurrency(portfolioData.availableBalance), 
      color: '#14b8a6', 
      gradient: 'rgba(20, 184, 166, 0.1)' 
    },
    { 
      label: t.accumulatedReturn, 
      value: portfolioData.loading ? '...' : formatPercent(portfolioData.accumulatedReturnPercent), 
      color: '#ffffff', 
      gradient: 'rgba(255, 255, 255, 0.05)' 
    }
  ]

  const totalDeposits = transactions
    .filter(t => t.type === 'deposit' && (t.status === 'active' || t.status === 'completed'))
    .reduce((sum, t) => sum + t.amount, 0)

  const totalWithdrawals = transactions
    .filter(t => (t.type === 'withdrawal' || t.type === 'earlyWithdrawal') && (t.status === 'completed' || t.status === 'approved'))
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div>
      <h2 style={{
        fontSize: isMobile ? '17px' : '22px',
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: '20px',
        letterSpacing: '-0.7px'
      }}>
        {t.portfolioOverview}
      </h2>

      {userKYCStatus && userKYCStatus !== 'APPROVED' && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(45, 212, 191, 0.08) 100%)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '17px',
          padding: isMobile ? '14px' : '17px',
          marginBottom: '22px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: '11px',
          justifyContent: 'space-between'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: isMobile ? '11px' : '13px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '6px',
              letterSpacing: '-0.35px'
            }}>
              {t.kycWarningTitle}
            </div>
            <div style={{
              fontSize: isMobile ? '9px' : '10px',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: '1.6'
            }}>
              {t.kycWarningText}
            </div>
          </div>
          <button
            onClick={handleOpenKYCModal}
            style={{
              padding: isMobile ? '8px 17px' : '10px 22px',
              background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
              border: 'none',
              borderRadius: '11px',
              color: '#000000',
              fontSize: isMobile ? '9px' : '10px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 6px 14px rgba(45, 212, 191, 0.4)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {t.kycVerifyButton}
          </button>
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', 
        gap: '17px',
        marginBottom: '28px'
      }}>
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '28px',
              padding: isMobile ? '20px 17px' : '25px 22px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)'
              e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.3)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-30%',
              right: '-20%',
              width: '126px',
              height: '126px',
              background: stat.gradient,
              filter: 'blur(28px)',
              pointerEvents: 'none',
              zIndex: 0
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ 
                fontSize: '8px', 
                color: 'rgba(255, 255, 255, 0.5)', 
                marginBottom: '8px', 
                textTransform: 'uppercase', 
                letterSpacing: '0.7px',
                fontWeight: '500'
              }}>
                {stat.label}
              </div>
              <div style={{ 
                fontSize: isMobile ? '22px' : '29px', 
                fontWeight: '600', 
                color: stat.color,
                letterSpacing: '-1.4px',
                minHeight: isMobile ? '34px' : '39px',
                display: 'flex',
                alignItems: 'center'
              }}>
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!portfolioData.loading && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '17px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <h3 style={{
              fontSize: isMobile ? '14px' : '17px',
              fontWeight: '600',
              color: '#ffffff',
              letterSpacing: '-0.35px'
            }}>
              {t.activeInvestmentsTitle}
            </h3>
            <span style={{
              fontSize: isMobile ? '11px' : '12px',
              color: '#8BCFCF',
              fontWeight: '500'
            }}>
              {t.riskLevel}
            </span>
          </div>

          {activeInvestments.length > 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '8px' : '11px'
            }}>
              {activeInvestments.map((investment) => {
                const daysPassed = investment.daysPassed || 0
                const daysRemaining = investment.daysRemaining || 0
                const currentReturn = investment.currentReturn || 0
                const availableProfit = investment.availableProfit || 0
                const investedAmount = parseFloat(investment.amount || 0)
                
                const accumulatedPercent = calculateInvestmentAccumulatedPercent(investment)

                return (
                  <div
                    key={investment.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: isMobile ? '14px' : '17px',
                      padding: isMobile ? '11px 13px' : '14px 17px',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '11px',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ flex: 1, minWidth: '140px' }}>
                        <div style={{
                          fontSize: isMobile ? '12px' : '14px',
                          fontWeight: '600',
                          color: '#ffffff',
                          marginBottom: '6px',
                          letterSpacing: '-0.3px'
                        }}>
                          {investment.planName}
                        </div>

                        <div style={{
                          fontSize: isMobile ? '8px' : '9px',
                          color: 'rgba(255, 255, 255, 0.5)',
                          marginBottom: '3px'
                        }}>
                          {t.invested}: <span style={{ color: '#2dd4bf', fontWeight: '500' }}>
                            {formatCurrency(investedAmount)}
                          </span>
                        </div>

                        <div style={{
                          fontSize: isMobile ? '8px' : '9px',
                          color: 'rgba(255, 255, 255, 0.5)',
                          marginBottom: '3px'
                        }}>
                          {t.currentReturn}: <span style={{ color: '#2dd4bf', fontWeight: '500' }}>
                            {formatCurrency(currentReturn)}
                          </span>
                        </div>

                        <div style={{
                          fontSize: isMobile ? '8px' : '9px',
                          color: 'rgba(255, 255, 255, 0.5)',
                          marginBottom: '3px'
                        }}>
                          {t.availableProfit}: <span style={{ color: '#10b981', fontWeight: '500' }}>
                            {formatCurrency(availableProfit)}
                          </span>
                        </div>

                        <div style={{
                          fontSize: isMobile ? '8px' : '9px',
                          color: 'rgba(255, 255, 255, 0.5)',
                          marginBottom: '3px'
                        }}>
                          {t.accumulatedPercent}: <span style={{ 
                            color: '#ffffff', 
                            fontWeight: '600',
                            background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}>
                            {formatPercent(accumulatedPercent)}
                          </span>
                        </div>

                        <div style={{
                          fontSize: isMobile ? '8px' : '8px',
                          color: 'rgba(255, 255, 255, 0.5)'
                        }}>
                          {t.completesOn}: {formatDate(investment.endDate)}
                          {daysRemaining > 0 && (
                            <span style={{ 
                              color: '#2dd4bf', 
                              fontWeight: '500',
                              marginLeft: '6px'
                            }}>
                              ({daysRemaining} {t.daysRemaining})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ✅ КНОПКА "УПРАВЛЯТЬ ПЛАНОМ" */}
                      <button
                        onClick={() => handleManagePlan(investment.id)}
                        style={{
                          padding: isMobile ? '8px 14px' : '10px 18px',
                          background: 'rgba(45, 212, 191, 0.15)',
                          border: '1px solid rgba(45, 212, 191, 0.3)',
                          borderRadius: '12px',
                          color: '#2dd4bf',
                          fontSize: isMobile ? '10px' : '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          letterSpacing: '-0.3px',
                          whiteSpace: 'nowrap',
                          flexShrink: 0
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'rgba(45, 212, 191, 0.25)'
                          e.currentTarget.style.transform = 'scale(1.05)'
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'rgba(45, 212, 191, 0.15)'
                          e.currentTarget.style.transform = 'scale(1)'
                        }}
                      >
                        {t.managePlan}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: isMobile ? '14px' : '17px',
              padding: isMobile ? '20px' : '24px',
              textAlign: 'center'
            }}>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.5)', 
                fontSize: isMobile ? '11px' : '13px',
                letterSpacing: '-0.3px'
              }}>
                {t.noActiveInvestments}
              </p>
            </div>
          )}
        </div>
      )}

      {!loadingTransactions && (
        <div>
          <h3 style={{
            fontSize: isMobile ? '14px' : '17px',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '17px',
            letterSpacing: '-0.35px'
          }}>
            {t.reportingTitle}
          </h3>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', 
            gap: '14px',
            marginBottom: '28px'
          }}>
            <div style={{
              background: 'rgba(45, 212, 191, 0.1)',
              border: '1px solid rgba(45, 212, 191, 0.3)',
              borderRadius: '17px',
              padding: isMobile ? '14px' : '17px'
            }}>
              <div style={{
                fontSize: '8px',
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.35px'
              }}>
                {t.totalDeposits}
              </div>
              <div style={{
                fontSize: isMobile ? '17px' : '20px',
                fontWeight: '600',
                color: '#2dd4bf',
                letterSpacing: '-0.7px'
              }}>
                {formatCurrency(totalDeposits)}
              </div>
            </div>

            <div style={{
              background: 'rgba(20, 184, 166, 0.1)',
              border: '1px solid rgba(20, 184, 166, 0.3)',
              borderRadius: '17px',
              padding: isMobile ? '14px' : '17px'
            }}>
              <div style={{
                fontSize: '8px',
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.35px'
              }}>
                {t.totalWithdrawals}
              </div>
              <div style={{
                fontSize: isMobile ? '17px' : '20px',
                fontWeight: '600',
                color: '#14b8a6',
                letterSpacing: '-0.7px'
              }}>
                {formatCurrency(totalWithdrawals)}
              </div>
            </div>
          </div>

          {transactions.length > 0 && (
            <div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '8px' : '11px'
              }}>
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: isMobile ? '14px' : '17px',
                      padding: isMobile ? '11px 13px' : '14px 17px',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '11px',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ flex: 1, minWidth: '140px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '6px',
                          flexWrap: 'wrap'
                        }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '3px 8px',
                            background: `${getTransactionTypeColor(transaction.type)}22`,
                            border: `1px solid ${getTransactionTypeColor(transaction.type)}66`,
                            borderRadius: '8px',
                            fontSize: isMobile ? '8px' : '8px',
                            fontWeight: '600',
                            color: getTransactionTypeColor(transaction.type),
                            textTransform: 'uppercase',
                            letterSpacing: '0.35px'
                          }}>
                            {getTransactionTypeLabel(transaction.type)}
                          </div>

                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '3px 7px',
                            background: `${getStatusColor(transaction.status)}22`,
                            border: `1px solid ${getStatusColor(transaction.status)}66`,
                            borderRadius: '8px',
                            fontSize: isMobile ? '7px' : '8px',
                            fontWeight: '600',
                            color: getStatusColor(transaction.status),
                            textTransform: 'uppercase',
                            letterSpacing: '0.35px'
                          }}>
                            {getStatusLabel(transaction.status)}
                          </div>
                        </div>

                        <div style={{
                          fontSize: isMobile ? '14px' : '17px',
                          fontWeight: '600',
                          color: transaction.type === 'withdrawal' || transaction.type === 'earlyWithdrawal' ? '#2dd4bf' : '#2dd4bf',
                          marginBottom: '6px'
                        }}>
                          {transaction.type === 'withdrawal' || transaction.type === 'earlyWithdrawal' 
                            ? `-${formatCurrency(transaction.amount)}` 
                            : transaction.type === 'upgrade'
                              ? formatCurrency(transaction.amount)
                              : `+${formatCurrency(transaction.amount)}`
                          }
                        </div>

                        {transaction.planName && (
                          <div style={{
                            fontSize: isMobile ? '8px' : '9px',
                            color: 'rgba(255, 255, 255, 0.6)',
                            marginBottom: '3px'
                          }}>
                            {t.plan}: {transaction.planName}
                          </div>
                        )}

                        <div style={{
                          fontSize: isMobile ? '8px' : '8px',
                          color: 'rgba(255, 255, 255, 0.5)'
                        }}>
                          {formatTransactionDate(transaction.date)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <KYCModal 
        isOpen={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        userEmail={user?.email}
        userName={user?.name || user?.username}
        currentStatus={userKYCStatus}
        onKYCSubmitted={handleKYCSubmitted}
        language={language}
      />
    </div>
  )
}
