'use client'
import { useState, useEffect } from 'react'
import ReferralBonusWithdrawModal from './wallet/ReferralBonusWithdrawModal'
import ReferralBonusReinvestModal from './wallet/ReferralBonusReinvestModal'

export default function ReferralTab({ isMobile, language, user, onModalStateChange }) {
  const [referralData, setReferralData] = useState({
    referralCode: '',
    referralLink: '',
    totalReferrals: 0,
    totalEarnings: 0,
    level1: [],
    level2: [],
    tierPercent: 0.03,
    level1Count: 0
  })
  const [loading, setLoading] = useState(true)
  const [copiedLink, setCopiedLink] = useState(false)
  const [expandedLevel, setExpandedLevel] = useState(null)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showReinvestModal, setShowReinvestModal] = useState(false)
  const [showBulkWithdrawModal, setShowBulkWithdrawModal] = useState(false)
  const [selectedReferral, setSelectedReferral] = useState(null)
  const [trc20Address, setTrc20Address] = useState('')
  const [withdrawError, setWithdrawError] = useState('')
  const [withdrawSuccess, setWithdrawSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [hasPendingWithdrawal, setHasPendingWithdrawal] = useState(false)
  const [pendingWithdrawalReferrals, setPendingWithdrawalReferrals] = useState(new Set())
  const [isTokenReady, setIsTokenReady] = useState(false)
  const [userInvestments, setUserInvestments] = useState([])
  const [loadingInvestments, setLoadingInvestments] = useState(false)

  const translations = {
    en: {
      title: 'Earn with DXCAPITAL',
      subtitle: 'Invite friends and earn commission from their investments',
      yourLink: 'Your Referral Link',
      copy: 'Copy',
      copied: 'Copied!',
      invitedPartners: 'Invited Partners',
      totalEarnings: 'Total Earnings',
      levels: 'Commission Levels',
      tierTable: {
        header: 'Tiered Commission',
        row1: '1st referral — 3%',
        row2: '2nd–3rd referrals — 4%',
        row3: '4th–5th referrals — 5%',
        row4: '6th–9th referrals — 6%',
        row5: '10th+ referrals — 7%'
      },
      level1: '1st Level',
      level2: '2nd Level — 3%',
      inviteFriend: 'Invite a Friend',
      noReferrals: 'No referrals yet',
      userId: 'User ID',
      email: 'Email',
      joinedDate: 'Joined',
      investmentDate: 'Investment Date',
      investment: 'Investment',
      commission: 'Commission',
      commissionRate: 'Rate',
      loading: 'Loading',
      showDetails: 'Show Details',
      hideDetails: 'Hide Details',
      errorLoading: 'Failed to load referral data',
      copyError: 'Failed to copy',
      withdrawBonus: 'Withdraw Bonus',
      withdrawing: 'Withdrawing...',
      availableIn: 'Available in',
      days: 'days',
      bonusWithdrawn: 'Withdrawn',
      withdrawSuccess: 'Bonus withdrawal request submitted!',
      withdrawError: 'Failed to withdraw bonus',
      notAvailableYet: 'Bonus available after 31 days from investment',
      withdrawnOn: 'Withdrawn on',
      authRequired: 'Authentication required',
      investments: 'investments',
      walletAddress: 'TRC-20 Address',
      referralNumber: 'Referral #',
      trc20Placeholder: 'Enter TRC-20 address',
      withdrawAll: 'Withdraw All Bonuses',
      reinvest: 'Reinvest Bonuses',
      noBonuses: 'No bonuses available',
      bulkWithdrawSuccess: 'Bulk withdrawal request created successfully!',
      reinvestSuccess: 'Reinvestment completed successfully!',
      confirmReinvest: 'Reinvest all bonuses into a new investment?'
    },
    ru: {
      title: 'Зарабатывайте вместе с DXCAPITAL',
      subtitle: 'Приглашайте друзей и получайте комиссию с их инвестиций',
      yourLink: 'Ваша реферальная ссылка',
      copy: 'Копировать',
      copied: 'Скопировано!',
      invitedPartners: 'Приглашено партнёров',
      totalEarnings: 'Доход по вознаграждениям',
      levels: 'Уровни комиссии',
      tierTable: {
        header: 'Уровни комиссий',
        row1: '1-й реферал — 3%',
        row2: '2–3-й рефералы — 4%',
        row3: '4–5-й рефералы — 5%',
        row4: '6–9-й рефералы — 6%',
        row5: '10+ рефералы — 7%'
      },
      level1: '1-й уровень',
      level2: '2-й уровень — 3%',
      inviteFriend: 'Пригласить друга',
      noReferrals: 'Рефералов пока нет',
      userId: 'ID пользователя',
      email: 'Email',
      joinedDate: 'Дата регистрации',
      investmentDate: 'Дата инвестиции',
      investment: 'Инвестиция',
      commission: 'Комиссия',
      commissionRate: 'Ставка',
      loading: 'Загрузка',
      showDetails: 'Показать список',
      hideDetails: 'Скрыть список',
      errorLoading: 'Не удалось загрузить данные',
      copyError: 'Ошибка копирования',
      withdrawBonus: 'Вывести бонус',
      withdrawing: 'Выводим...',
      availableIn: 'Доступно через',
      days: 'дней',
      bonusWithdrawn: 'Выведено',
      withdrawSuccess: 'Заявка на вывод бонуса отправлена!',
      withdrawError: 'Ошибка вывода бонуса',
      notAvailableYet: 'Бонус доступен через 31 день после инвестиции',
      withdrawnOn: 'Выведено',
      authRequired: 'Требуется авторизация',
      investments: 'инвестиций',
      walletAddress: 'TRC-20 адрес',
      referralNumber: 'Реферал №',
      trc20Placeholder: 'Введите TRC-20 адрес',
      withdrawAll: 'Вывести все бонусы',
      reinvest: 'Реинвестировать',
      noBonuses: 'Нет доступных бонусов',
      bulkWithdrawSuccess: 'Заявка на массовый вывод создана!',
      reinvestSuccess: 'Реинвестирование успешно выполнено!',
      confirmReinvest: 'Реинвестировать все бонусы в новую инвестицию?'
    }
  }

  const t = translations[language]

  const calculateReferralPercent = (referralNumber) => {
    if (referralNumber >= 10) return 0.07
    if (referralNumber >= 6) return 0.06
    if (referralNumber >= 4) return 0.05
    if (referralNumber >= 2) return 0.04
    return 0.03
  }

  const getReferralColor = (percent) => {
    if (percent >= 0.07) return '#4CAF50'
    if (percent >= 0.06) return '#8BC34A'
    if (percent >= 0.05) return '#FFC107'
    if (percent >= 0.04) return '#FF9800'
    return '#FF5722'
  }

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('access_token')
      setIsTokenReady(!!token)
    }

    checkToken()
    const timer = setTimeout(checkToken, 100)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isTokenReady) {
      fetchReferralData()
    } else {
      setLoading(false)
    }
  }, [isTokenReady])

  const fetchInvestments = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    try {
      setLoadingInvestments(true)
      const response = await fetch('https://dxcapital-ai.com/api/v1/investments/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        const activeInvestments = data.data?.filter(inv => inv.status === 'ACTIVE') || []
        setUserInvestments(activeInvestments)
      }
    } catch (error) {
      console.error('Error fetching investments:', error)
    } finally {
      setLoadingInvestments(false)
    }
  }

  const fetchReferralData = async (retryCount = 0) => {
    const MAX_RETRIES = 3
    const token = localStorage.getItem('access_token')
    
    if (!token) {
      setLoading(false)
      return
    }

    if (retryCount === 0) {
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    try {
      setLoading(true)

      const response = await fetch('https://dxcapital-ai.com/api/v1/referrals/my-referrals', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (response.status === 401) {
        if (retryCount < MAX_RETRIES) {
          const delay = (retryCount + 1) * 500
          await new Promise(resolve => setTimeout(resolve, delay))
          return fetchReferralData(retryCount + 1)
        } else {
          setLoading(false)
          return
        }
      }

      if (response.ok) {
        const result = await response.json()
        
        if (result.success && result.data) {
          const apiData = result.data
          
          const level1UsersMap = new Map()
          
          if (Array.isArray(apiData.level1)) {
            apiData.level1.forEach(item => {
              if (!level1UsersMap.has(item.fullUserId)) {
                level1UsersMap.set(item.fullUserId, {
                  userId: item.fullUserId,
                  email: item.email,
                  joinedAt: item.joinedAt,
                  investments: []
                })
              }
              level1UsersMap.get(item.fullUserId).investments.push(item)
            })
          }

          const sortedUsers = Array.from(level1UsersMap.values()).sort((a, b) => 
            new Date(a.joinedAt) - new Date(b.joinedAt)
          )

          const level1WithNumbers = []
          let totalRecalculatedEarnings = 0
          
          sortedUsers.forEach((userGroup, userIndex) => {
            const referralNumber = userIndex + 1
            const percent = calculateReferralPercent(referralNumber)
            
            userGroup.investments.forEach(inv => {
              const recalculatedCommission = Number(inv.investmentAmount || 0) * percent
              totalRecalculatedEarnings += recalculatedCommission
              
              level1WithNumbers.push({
                ...inv,
                referralNumber,
                individualPercent: percent,
                commission: recalculatedCommission
              })
            })
          })
          
          const level2WithRecalculated = []
          if (Array.isArray(apiData.level2)) {
            apiData.level2.forEach(item => {
              const recalculatedCommission = Number(item.investmentAmount || 0) * 0.03
              totalRecalculatedEarnings += recalculatedCommission
              
              level2WithRecalculated.push({
                ...item,
                commission: recalculatedCommission
              })
            })
          }

          setReferralData({
            referralCode: apiData.referralCode || user?.referralCode || '',
            referralLink: `https://dxcapital-ai.com?ref=${apiData.referralCode || user?.referralCode || ''}`,
            totalReferrals: Number(apiData.totalReferrals) || 0,
            totalEarnings: totalRecalculatedEarnings,
            level1: level1WithNumbers,
            level2: level2WithRecalculated,
            tierPercent: apiData.tierPercent || 0.03,
            level1Count: apiData.level1Count || 0
          })
        }
      }

    } catch (error) {
      console.error('Failed to fetch referral data:', error)
      
      if (retryCount < MAX_RETRIES) {
        const delay = (retryCount + 1) * 500
        await new Promise(resolve => setTimeout(resolve, delay))
        return fetchReferralData(retryCount + 1)
      }
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        const successful = document.execCommand('copy')
        textArea.remove()
        
        if (successful) {
          setCopiedLink(true)
          setTimeout(() => setCopiedLink(false), 2000)
        } else {
          throw new Error('execCommand copy failed')
        }
      }
    } catch (err) {
      console.error('❌ Failed to copy:', err)
      alert(t.copyError + ': ' + text)
    }
  }

  const toggleLevel = (level) => {
    setExpandedLevel(expandedLevel === level ? null : level)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'N/A'
    }
  }

  const canWithdrawBonus = (investmentDate, isWithdrawn) => {
    if (isWithdrawn) return { canWithdraw: false, daysLeft: 0, reason: 'withdrawn' }
    if (!investmentDate) return { canWithdraw: false, daysLeft: 0, reason: 'no_date' }

    try {
      const investDate = new Date(investmentDate)
      const now = new Date()
      const diffTime = now - investDate
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      const REQUIRED_DAYS = 31
      
      if (diffDays >= REQUIRED_DAYS) {
        return { canWithdraw: true, daysLeft: 0, reason: 'available' }
      } else {
        return { canWithdraw: false, daysLeft: REQUIRED_DAYS - diffDays, reason: 'waiting' }
      }
    } catch {
      return { canWithdraw: false, daysLeft: 0, reason: 'invalid_date' }
    }
  }

  const handleOpenWithdrawModal = (referral) => {
    setSelectedReferral(referral)
    setTrc20Address('')
    setWithdrawError('')
    setWithdrawSuccess('')
    setShowWithdrawModal(true)
  }

  const handleCloseWithdrawModal = () => {
    setShowWithdrawModal(false)
    setSelectedReferral(null)
    setTrc20Address('')
    setWithdrawError('')
    setWithdrawSuccess('')
    setSubmitting(false)
    
    fetchReferralData()
  }

  const handleSubmitWithdrawal = async (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!trc20Address || !trc20Address.trim()) {
      setWithdrawError(t.trc20Placeholder || 'Please enter TRC-20 address')
      return { success: false }
    }

    if (!selectedReferral) {
      setWithdrawError(t.withdrawError || 'Invalid referral data')
      return { success: false }
    }

    const token = localStorage.getItem('access_token')
    if (!token) {
      setWithdrawError(t.withdrawError || 'Authentication required')
      return { success: false }
    }

    try {
      setSubmitting(true)
      setWithdrawError('')
      setWithdrawSuccess('')

      const response = await fetch('https://dxcapital-ai.com/api/v1/referrals/withdraw-bonus', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          referralUserId: selectedReferral.fullUserId,
          investmentId: selectedReferral.investmentId,
          trc20Address: trc20Address.trim()
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // ✅ Mark this referral as having pending withdrawal
        setPendingWithdrawalReferrals(prev => new Set([...prev, selectedReferral.fullUserId]))
        setWithdrawSuccess(t.withdrawSuccess)
        
        setSubmitting(false)
        
        return { 
          success: true, 
          withdrawalId: result.data?.id || result.data?.withdrawalId,
          data: result.data
        }
      } else {
        const errorMsg = result.error || result.message || 'Unknown error'
        
        // Check if error is "already pending"
        if (errorMsg && errorMsg.toLowerCase().includes('pending')) {
          setPendingWithdrawalReferrals(prev => new Set([...prev, selectedReferral.fullUserId]))
        }
        
        if (result.daysRemaining) {
          setWithdrawError(`${t.availableIn} ${result.daysRemaining} ${t.days}`)
        } else {
          setWithdrawError(errorMsg)
        }
        
        setSubmitting(false)
        return { success: false, error: errorMsg }
      }
    } catch (error) {
      console.error('Failed to withdraw bonus:', error)
      setWithdrawError(t.withdrawError || 'Network error')
      setSubmitting(false)
      return { success: false, error: error.message }
    }
  }

  const handleBulkWithdrawAll = async () => {
    if (referralData.totalEarnings <= 0) {
      return
    }
    setShowBulkWithdrawModal(true)
    if (onModalStateChange) onModalStateChange(true)
  }

  const handleBulkWithdrawSubmit = async (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!trc20Address || !trc20Address.trim()) {
      setWithdrawError(t.trc20Placeholder)
      return
    }

    const token = localStorage.getItem('access_token')
    if (!token) {
      setWithdrawError(t.authRequired)
      return
    }

    try {
      setSubmitting(true)
      setWithdrawError('')
      setWithdrawSuccess('')

      const response = await fetch('https://dxcapital-ai.com/api/v1/referrals/bulk-withdraw', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          trc20Address: trc20Address.trim()
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // ✅ Mark withdrawal as pending
        setHasPendingWithdrawal(true)
        setWithdrawSuccess(t.bulkWithdrawSuccess)
        setTrc20Address('')
        setTimeout(() => {
          setShowBulkWithdrawModal(false)
          fetchReferralData()
        }, 2000)
        return { success: true, data: result.data }
      } else {
        // Check if error is "already pending"
        if (result.error && result.error.toLowerCase().includes('pending')) {
          setHasPendingWithdrawal(true)
        }
        setWithdrawError(result.error || t.withdrawError)
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Bulk withdrawal error:', error)
      setWithdrawError(language === 'ru' ? 'Ошибка сети' : 'Network error')
      return { success: false, error: error.message }
    } finally {
      setSubmitting(false)
    }
  }

  const handleReinvestBonuses = async () => {
    if (referralData.totalEarnings <= 0) {
      return
    }
    // Fetch investments when modal opens
    if (userInvestments.length === 0) {
      fetchInvestments()
    }
    setShowReinvestModal(true)
    if (onModalStateChange) onModalStateChange(true)
  }

  const handleReinvestSubmit = async (investmentId) => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setWithdrawError(t.authRequired)
      return { success: false }
    }

    if (!investmentId) {
      setWithdrawError(language === 'ru' ? 'Выберите инвестицию' : 'Please select an investment')
      return { success: false }
    }

    try {
      setSubmitting(true)
      setWithdrawError('')
      setWithdrawSuccess('')

      const response = await fetch('https://dxcapital-ai.com/api/v1/referrals/reinvest-to-investment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          investmentId: investmentId
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setWithdrawSuccess(t.reinvestSuccess)
        setTimeout(() => {
          setShowReinvestModal(false)
          fetchReferralData()
        }, 2000)
        return { success: true, data: result.data }
      } else {
        setWithdrawError(result.error || t.withdrawError)
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Reinvest error:', error)
      setWithdrawError(language === 'ru' ? 'Ошибка сети' : 'Network error')
      return { success: false, error: error.message }
    } finally {
      setSubmitting(false)
    }
  }

  const renderReferralItem = (referral, index) => {
    const withdrawStatus = canWithdrawBonus(referral.investmentDate, referral.bonusWithdrawn)
    const percent = referral.individualPercent || 0.03
    const percentColor = getReferralColor(percent)
    
    return (
      <div
        key={`${referral.fullUserId}-${referral.investmentId}-${index}`}
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '8px'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
          paddingBottom: '12px',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '12px',
            background: `${percentColor}15`,
            border: `1px solid ${percentColor}40`
          }}>
            <span style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.6)',
              fontWeight: '500'
            }}>
              {t.referralNumber}{referral.referralNumber}
            </span>
            <span style={{
              fontSize: '13px',
              color: percentColor,
              fontWeight: '700'
            }}>
              {(percent * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr 1fr',
          gap: '16px'
        }}>
          <div>
            <div style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.4)',
              marginBottom: '4px',
              letterSpacing: '-0.2px',
              textTransform: 'uppercase'
            }}>
              {t.userId}
            </div>
            <div style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontFamily: 'monospace',
              letterSpacing: '-0.3px'
            }}>
              {referral.userIdShort || 'N/A'}
            </div>
          </div>

          <div>
            <div style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.4)',
              marginBottom: '4px',
              letterSpacing: '-0.2px',
              textTransform: 'uppercase'
            }}>
              {t.email}
            </div>
            <div style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.8)',
              letterSpacing: '-0.3px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {referral.email || 'N/A'}
            </div>
          </div>

          <div>
            <div style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.4)',
              marginBottom: '4px',
              letterSpacing: '-0.2px',
              textTransform: 'uppercase'
            }}>
              {t.investment}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#2dd4bf',
              fontWeight: '600',
              letterSpacing: '-0.3px'
            }}>
              ${Number(referral.investmentAmount || 0).toFixed(2)}
            </div>
          </div>

          <div>
            <div style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.4)',
              marginBottom: '4px',
              letterSpacing: '-0.2px',
              textTransform: 'uppercase'
            }}>
              {t.commission}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#fbbf24',
              fontWeight: '600',
              letterSpacing: '-0.3px'
            }}>
              ${Number(referral.commission || 0).toFixed(2)}
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '16px'
        }}>
          <div>
            <div style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.4)',
              marginBottom: '4px',
              letterSpacing: '-0.2px',
              textTransform: 'uppercase'
            }}>
              {t.joinedDate}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.6)',
              letterSpacing: '-0.3px'
            }}>
              {formatDate(referral.joinedAt)}
            </div>
          </div>

          <div>
            <div style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.4)',
              marginBottom: '4px',
              letterSpacing: '-0.2px',
              textTransform: 'uppercase'
            }}>
              {t.investmentDate}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.6)',
              letterSpacing: '-0.3px'
            }}>
              {formatDate(referral.investmentDate)}
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          {withdrawStatus.reason === 'withdrawn' ? (
            <div style={{
              padding: '12px',
              background: 'rgba(45, 212, 191, 0.1)',
              border: '1px solid rgba(45, 212, 191, 0.3)',
              borderRadius: '12px',
              textAlign: 'center',
              color: '#2dd4bf',
              fontSize: '13px',
              fontWeight: '500',
              letterSpacing: '-0.3px'
            }}>
              ✓ {t.bonusWithdrawn}
              {referral.withdrawnAt && (
                <div style={{
                  fontSize: '11px',
                  color: 'rgba(45, 212, 191, 0.7)',
                  marginTop: '4px'
                }}>
                  {formatDate(referral.withdrawnAt)}
                </div>
              )}
            </div>
          ) : withdrawStatus.canWithdraw ? (
            <button
              onClick={() => handleOpenWithdrawModal(referral)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#000000',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                letterSpacing: '-0.3px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)'
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(45, 212, 191, 0.3)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {t.withdrawBonus}
            </button>
          ) : (
            <div style={{
              padding: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '12px',
              letterSpacing: '-0.3px'
            }}>
              {t.availableIn} {withdrawStatus.daysLeft} {t.days}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '40px',
        padding: isMobile ? '48px 24px' : '80px 48px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '15px',
          color: 'rgba(255, 255, 255, 0.5)',
          letterSpacing: '-0.3px'
        }}>
          {t.loading}...
        </div>
      </div>
    )
  }

  if (!isTokenReady) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '40px',
        padding: isMobile ? '48px 24px' : '80px 48px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '15px',
          color: 'rgba(255, 255, 255, 0.5)',
          letterSpacing: '-0.3px'
        }}>
          {t.authRequired}
        </div>
      </div>
    )
  }

  return (
    <>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '40px',
        padding: isMobile ? '28px 24px' : '40px 48px'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h2 style={{
            fontSize: isMobile ? '24px' : '32px',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '8px',
            letterSpacing: '-1px'
          }}>
            {t.title}
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.5)',
            letterSpacing: '-0.3px'
          }}>
            {t.subtitle}
          </p>
        </div>

        <div style={{
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            overflow: 'hidden',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <div style={{
              padding: '12px',
              background: 'rgba(255,255,255,0.05)',
              fontSize: '13px',
              fontWeight: '600',
              color: 'rgba(255,255,255,0.8)',
              letterSpacing: '-0.3px'
            }}>
              {t.tierTable.header}
            </div>
            {[t.tierTable.row1, t.tierTable.row2, t.tierTable.row3, t.tierTable.row4, t.tierTable.row5].map((row, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 16px',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.7)',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  letterSpacing: '-0.3px'
                }}
              >
                {row}
              </div>
            ))}
          </div>
        </div>

        <div style={{
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '20px'
          }}>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: '12px',
              letterSpacing: '-0.3px'
            }}>
              {t.yourLink}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                flex: 1,
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.8)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.3px'
              }}>
                {referralData.referralLink}
              </div>
              <button
                onClick={() => copyToClipboard(referralData.referralLink)}
                style={{
                  padding: '8px 16px',
                  background: copiedLink ? 'rgba(45, 212, 191, 0.2)' : 'rgba(45, 212, 191, 0.1)',
                  border: '1px solid rgba(45, 212, 191, 0.3)',
                  borderRadius: '16px',
                  color: '#2dd4bf',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  letterSpacing: '-0.3px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(45, 212, 191, 0.2)'
                }}
                onMouseOut={(e) => {
                  if (!copiedLink) {
                    e.currentTarget.style.background = 'rgba(45, 212, 191, 0.1)'
                  }
                }}
              >
                {copiedLink ? t.copied : t.copy}
              </button>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.1) 0%, rgba(45, 212, 191, 0.05) 100%)',
            border: '1px solid rgba(45, 212, 191, 0.2)',
            borderRadius: '24px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: '600',
              color: '#2dd4bf',
              marginBottom: '8px',
              letterSpacing: '-1px'
            }}>
              {referralData.totalReferrals}
            </div>
            <div style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.6)',
              letterSpacing: '-0.3px'
            }}>
              {t.invitedPartners}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(234, 179, 8, 0.05) 100%)',
            border: '1px solid rgba(234, 179, 8, 0.2)',
            borderRadius: '24px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: '600',
              color: '#fbbf24',
              marginBottom: '8px',
              letterSpacing: '-1px'
            }}>
              {referralData.totalEarnings.toFixed(2)} <span style={{ fontSize: '18px' }}>USDT</span>
            </div>
            <div style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.6)',
              letterSpacing: '-0.3px'
            }}>
              {t.totalEarnings}
            </div>
          </div>
        </div>

        {/* ✅ НОВЫЙ БЛОК: Кнопки массового вывода и реинвеста */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <button
            onClick={handleBulkWithdrawAll}
            disabled={referralData.totalEarnings <= 0 || hasPendingWithdrawal}
            style={{
              padding: '20px',
              background: (referralData.totalEarnings > 0 && !hasPendingWithdrawal)
                ? 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)'
                : 'rgba(255, 255, 255, 0.05)',
              border: (referralData.totalEarnings > 0 && !hasPendingWithdrawal)
                ? '1px solid rgba(45, 212, 191, 0.3)'
                : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              color: (referralData.totalEarnings > 0 && !hasPendingWithdrawal) ? '#000000' : 'rgba(255, 255, 255, 0.3)',
              fontSize: '15px',
              fontWeight: '600',
              cursor: (referralData.totalEarnings > 0 && !hasPendingWithdrawal) ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s',
              letterSpacing: '-0.3px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              if (referralData.totalEarnings > 0 && !hasPendingWithdrawal) {
                e.currentTarget.style.transform = 'scale(1.02)'
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(45, 212, 191, 0.3)'
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ opacity: (referralData.totalEarnings > 0 && !hasPendingWithdrawal) ? 1 : 0.3 }}>
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>{hasPendingWithdrawal ? 'Withdrawal Pending...' : t.withdrawAll}</div>
            <div style={{
              fontSize: '12px',
              opacity: 0.8,
              fontWeight: '400'
            }}>
              ${referralData.totalEarnings.toFixed(2)} USDT
            </div>
          </button>

          <button
            onClick={handleReinvestBonuses}
            disabled={referralData.totalEarnings <= 0}
            style={{
              padding: '20px',
              background: referralData.totalEarnings > 0
                ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                : 'rgba(255, 255, 255, 0.05)',
              border: referralData.totalEarnings > 0
                ? '1px solid rgba(251, 191, 36, 0.3)'
                : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              color: referralData.totalEarnings > 0 ? '#000000' : 'rgba(255, 255, 255, 0.3)',
              fontSize: '15px',
              fontWeight: '600',
              cursor: referralData.totalEarnings > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s',
              letterSpacing: '-0.3px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              if (referralData.totalEarnings > 0) {
                e.currentTarget.style.transform = 'scale(1.02)'
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(251, 191, 36, 0.3)'
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ opacity: referralData.totalEarnings > 0 ? 1 : 0.3 }}>
              <path d="M12 5V19M12 5L19 12M12 5L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>{t.reinvest}</div>
            <div style={{
              fontSize: '12px',
              opacity: 0.8,
              fontWeight: '400'
            }}>
              ${referralData.totalEarnings.toFixed(2)} USDT
            </div>
          </button>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '20px',
            letterSpacing: '-0.5px'
          }}>
            {t.levels}
          </h3>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '20px',
            marginBottom: '12px'
          }}>
            <div
              onClick={() => toggleLevel(1)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '4px',
                  letterSpacing: '-0.5px'
                }}>
                  {t.level1}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  letterSpacing: '-0.3px'
                }}>
                  {referralData.level1.length} {t.investments}
                </div>
              </div>
              <div style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(45, 212, 191, 0.1)',
                borderRadius: '50%',
                color: '#2dd4bf',
                fontSize: '20px',
                fontWeight: '300',
                transition: 'transform 0.3s'
              }}>
                {expandedLevel === 1 ? '−' : '+'}
              </div>
            </div>

            {expandedLevel === 1 && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                {referralData.level1.length > 0 ? (
                  referralData.level1.map((ref, idx) => renderReferralItem(ref, idx))
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '24px',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '13px',
                    letterSpacing: '-0.3px'
                  }}>
                    {t.noReferrals}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '20px'
          }}>
            <div
              onClick={() => toggleLevel(2)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '4px',
                  letterSpacing: '-0.5px'
                }}>
                  {t.level2}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  letterSpacing: '-0.3px'
                }}>
                  {referralData.level2.length} {t.investments}
                </div>
              </div>
              <div style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(45, 212, 191, 0.1)',
                borderRadius: '50%',
                color: '#2dd4bf',
                fontSize: '20px',
                fontWeight: '300',
                transition: 'transform 0.3s'
              }}>
                {expandedLevel === 2 ? '−' : '+'}
              </div>
            </div>

            {expandedLevel === 2 && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                {referralData.level2.length > 0 ? (
                  referralData.level2.map((ref, idx) => renderReferralItem(ref, idx))
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '24px',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '13px',
                    letterSpacing: '-0.3px'
                  }}>
                    {t.noReferrals}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            const shareText = `Join DXCAPITAL and start investing! Use my referral link:\n\n${referralData.referralLink}`
            if (navigator.share) {
              navigator.share({
                title: 'DXCAPITAL',
                text: shareText
              }).catch(err => {
                copyToClipboard(referralData.referralLink)
              })
            } else {
              copyToClipboard(referralData.referralLink)
            }
          }}
          style={{
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
            border: 'none',
            borderRadius: '32px',
            color: '#000000',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            letterSpacing: '-0.3px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)'
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(45, 212, 191, 0.3)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {t.inviteFriend}
        </button>
      </div>

      {showWithdrawModal && selectedReferral && (
        <ReferralBonusWithdrawModal
          referral={selectedReferral}
          onClose={handleCloseWithdrawModal}
          onSubmit={handleSubmitWithdrawal}
          trc20Address={trc20Address}
          setTrc20Address={setTrc20Address}
          error={withdrawError}
          success={withdrawSuccess}
          submitting={submitting}
          isPending={pendingWithdrawalReferrals.has(selectedReferral.fullUserId)}
          t={t}
          isMobile={isMobile}
        />
      )}

      {showBulkWithdrawModal && (
        <ReferralBonusWithdrawModal
          bulkMode={true}
          totalAmount={referralData.totalEarnings}
          availableAmount={(() => {
            // Calculate available earnings (31+ days old)
            const now = new Date()
            const allReferrals = [...referralData.level1, ...referralData.level2]
            const availableEarnings = allReferrals.filter(ref => {
              if (!ref.investmentDate) return false
              const daysPassed = Math.floor((now - new Date(ref.investmentDate)) / (1000 * 60 * 60 * 24))
              return daysPassed >= 31 && !ref.bonusWithdrawn
            })
            return availableEarnings.reduce((sum, ref) => sum + (ref.commission || 0), 0)
          })()}
          totalCount={referralData.level1.length + referralData.level2.length}
          availableCount={(() => {
            const now = new Date()
            const allReferrals = [...referralData.level1, ...referralData.level2]
            return allReferrals.filter(ref => {
              if (!ref.investmentDate) return false
              const daysPassed = Math.floor((now - new Date(ref.investmentDate)) / (1000 * 60 * 60 * 24))
              return daysPassed >= 31 && !ref.bonusWithdrawn
            }).length
          })()}
          onClose={() => {
            setShowBulkWithdrawModal(false)
            setTrc20Address('')
            setWithdrawError('')
            setWithdrawSuccess('')
            if (onModalStateChange) onModalStateChange(false)
          }}
          onSubmit={handleBulkWithdrawSubmit}
          trc20Address={trc20Address}
          setTrc20Address={setTrc20Address}
          error={withdrawError}
          success={withdrawSuccess}
          submitting={submitting}
          language={language}
          isMobile={isMobile}
        />
      )}

      {showReinvestModal && (
        <ReferralBonusReinvestModal
          totalAmount={referralData.totalEarnings}
          availableAmount={(() => {
            // Calculate available earnings (31+ days old)
            const now = new Date()
            const allReferrals = [...referralData.level1, ...referralData.level2]
            const availableEarnings = allReferrals.filter(ref => {
              if (!ref.investmentDate) return false
              const daysPassed = Math.floor((now - new Date(ref.investmentDate)) / (1000 * 60 * 60 * 24))
              return daysPassed >= 31 && !ref.bonusWithdrawn
            })
            return availableEarnings.reduce((sum, ref) => sum + (ref.commission || 0), 0)
          })()}
          totalCount={referralData.level1.length + referralData.level2.length}
          availableCount={(() => {
            const now = new Date()
            const allReferrals = [...referralData.level1, ...referralData.level2]
            return allReferrals.filter(ref => {
              if (!ref.investmentDate) return false
              const daysPassed = Math.floor((now - new Date(ref.investmentDate)) / (1000 * 60 * 60 * 24))
              return daysPassed >= 31 && !ref.bonusWithdrawn
            }).length
          })()}
          onClose={() => {
            setShowReinvestModal(false)
            setWithdrawError('')
            setWithdrawSuccess('')
            if (onModalStateChange) onModalStateChange(false)
          }}
          onSubmit={handleReinvestSubmit}
          error={withdrawError}
          success={withdrawSuccess}
          submitting={submitting}
          language={language}
          isMobile={isMobile}
          userInvestments={userInvestments}
          loadingInvestments={loadingInvestments}
        />
      )}
    </>
  )
}
