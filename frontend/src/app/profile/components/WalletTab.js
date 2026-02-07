'use client'
import { useState, useEffect } from 'react'
import { 
  getAvailableUpgradePackages,
  validateTRC20Address,
  canUpgradeInvestment,
  formatCurrency,
  formatDate
} from './wallet/calculations'
import InvestmentCard from './wallet/InvestmentCard'
import UpgradeModal from './wallet/UpgradeModal'
import { translations } from './wallet/translations'
import { useModals } from './InvestingTab/hooks/useModals'

const API_BASE_URL = 'https://dxcapital-ai.com'

export default function WalletTab({ isMobile, language, user, walletAddress, onModalStateChange }) {
  const [allInvestments, setAllInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedInvestment, setSelectedInvestment] = useState(null)
  const [upgradeError, setUpgradeError] = useState('')
  const [upgradeSuccess, setUpgradeSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isUpgradeInfoOpen, setIsUpgradeInfoOpen] = useState(false)
  
  // Use global modal state from useModals hook with callback to ProfileLayout
  const modals = useModals(onModalStateChange)
  const { showUpgradeModal, setShowUpgradeModal } = modals

  const packages = [
    { name: 'Starter', apy: 14, minAmount: 100, maxAmount: 999 },
    { name: 'Advanced', apy: 17, minAmount: 1000, maxAmount: 2999 },
    { name: 'Pro', apy: 20, minAmount: 3000, maxAmount: 5999 },
    { name: 'Elite', apy: 22, minAmount: 6000, maxAmount: 100000 }
  ]

  const durationBonuses = {
    3: { cashBonus: 0 },
    6: { cashBonus: 200 },
    12: { cashBonus: 500 }
  }

  const t = translations[language]

  useEffect(() => {
    if (user) {
      fetchAllInvestments()
    }
  }, [user])

  const fetchAllInvestments = async () => {
    setLoading(true)
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
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
        const investments = data.data || []
        
        const filtered = investments.filter(inv => 
          inv.status === 'ACTIVE' || inv.status === 'COMPLETED'
        )
        
        setAllInvestments(filtered)
      }
    } catch (error) {
      console.error('Failed to fetch investments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgradeClick = (investment) => {
    const upgradeCheck = canUpgradeInvestment(investment, t)
    
    if (!upgradeCheck.canUpgrade) {
      setUpgradeError(upgradeCheck.reason)
      return
    }
    
    setSelectedInvestment(investment)
    setShowUpgradeModal(true)
    setUpgradeError('')
    setUpgradeSuccess('')
  }

  const handleCloseModals = () => {
    setShowUpgradeModal(false)
    setSelectedInvestment(null)
    setUpgradeError('')
    setUpgradeSuccess('')
    
    fetchAllInvestments()
  }

  const handleSubmitUpgrade = async (upgradeData) => {
    setUpgradeError('')
    setUpgradeSuccess('')

    console.log('🚀 WalletTab: Starting upgrade request with data:', upgradeData)

    const { upgradeType, newPackage, additionalAmount, newDuration, senderWalletAddress } = upgradeData

    if (upgradeType === 'amount') {
      if (!newPackage || !additionalAmount) {
        setUpgradeError(t.selectTargetPlan || 'Please select target plan and amount')
        return null
      }

      if (additionalAmount <= 0) {
        setUpgradeError(t.invalidAmount || 'Invalid amount')
        return null
      }

      if (!senderWalletAddress || senderWalletAddress.trim() === '') {
        setUpgradeError(t.senderWalletRequired || 'Sender wallet address is required')
        return null
      }

      if (!validateTRC20Address(senderWalletAddress.trim())) {
        setUpgradeError(t.invalidTrc20Address || 'Invalid TRC-20 address')
        return null
      }
    }

    if (upgradeType === 'duration') {
      if (!newDuration) {
        setUpgradeError(t.selectNewDuration || 'Please select new duration')
        return null
      }

      if (newDuration <= selectedInvestment.duration) {
        setUpgradeError(t.invalidDuration || 'New duration must be greater than current')
        return null
      }
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem('access_token')
      
      const requestBody = {
        upgradeType,
        paymentMethod: 'telegram'
      }

      if (upgradeType === 'amount') {
        requestBody.newPackage = newPackage
        requestBody.additionalAmount = additionalAmount
        requestBody.senderWalletAddress = senderWalletAddress.trim()
      } else if (upgradeType === 'duration') {
        requestBody.newDuration = newDuration
        requestBody.senderWalletAddress = ''
      }
      
      console.log('📡 WalletTab: Sending request to backend:', requestBody)

      const response = await fetch(`${API_BASE_URL}/api/v1/investments/${selectedInvestment.id}/upgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      })

      console.log('📡 WalletTab: Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ WalletTab: Error response:', errorData)
        throw new Error(errorData.error || 'Failed to submit upgrade')
      }

      const result = await response.json()
      console.log('✅ WalletTab: Full response received:', JSON.stringify(result, null, 2))

      console.log('✅ WalletTab: Returning full result to UpgradeModal')
      
      setUpgradeSuccess(t.telegramBotInstructions || 'Request created successfully')
      
      return result

    } catch (error) {
      console.error('💥 WalletTab: Upgrade error:', error)
      setUpgradeError(error.message || t.errorOccurred)
      return null
    } finally {
      setSubmitting(false)
    }
  }

  const toggleUpgradeInfo = () => {
    setIsUpgradeInfoOpen(!isUpgradeInfoOpen)
  }

  if (loading) {
    return (
      <div style={{
        textAlign: 'center',
        padding: isMobile ? '48px 24px' : '80px 48px',
        color: 'rgba(255, 255, 255, 0.6)'
      }}>
        {t.loading}...
      </div>
    )
  }

  return (
    <div>
      <h2 style={{
        fontSize: isMobile ? '20px' : '26px',
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: isMobile ? '20px' : '28px',
        letterSpacing: '-0.8px'
      }}>
        {t.availableWithdrawals}
      </h2>

      {/* РАСКРЫВАЮЩЕЕСЯ ОПИСАНИЕ АПГРЕЙДОВ */}
      <div style={{
        marginBottom: isMobile ? '16px' : '24px',
        borderRadius: isMobile ? '16px' : '20px',
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(129, 216, 208, 0.2)',
        overflow: 'hidden'
      }}>
        {/* Кнопка раскрытия */}
        <button
          onClick={toggleUpgradeInfo}
          style={{
            width: '100%',
            padding: isMobile ? '14px 16px' : '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: isMobile ? '15px' : '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (!isMobile) e.currentTarget.style.background = 'rgba(129, 216, 208, 0.08)'
          }}
          onMouseLeave={(e) => {
            if (!isMobile) e.currentTarget.style.background = 'transparent'
          }}
        >
          <span>{t.upgradeInfoTitle}</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            style={{
              transform: isUpgradeInfoOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
              color: '#81D8D0'
            }}
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Раскрывающееся содержимое */}
        <div style={{
          maxHeight: isUpgradeInfoOpen ? '800px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <div style={{
            padding: isMobile ? '0 16px 16px 16px' : '0 20px 20px 20px',
            color: 'rgba(255, 255, 255, 0.85)',
            fontSize: isMobile ? '13px' : '14px',
            lineHeight: '1.6'
          }}>
            {/* Апгрейд участия */}
            <div style={{ marginBottom: isMobile ? '16px' : '20px' }}>
              <h4 style={{
                color: '#81D8D0',
                fontSize: isMobile ? '14px' : '15px',
                fontWeight: '600',
                marginBottom: '8px',
                letterSpacing: '0.3px'
              }}>
                {t.upgradeParticipation}
              </h4>
              <p style={{ margin: '0', opacity: 0.9 }}>
                {t.upgradeParticipationText}
              </p>
            </div>

            {/* Апгрейд по сумме */}
            <div style={{ marginBottom: isMobile ? '16px' : '20px' }}>
              <h4 style={{
                color: '#81D8D0',
                fontSize: isMobile ? '14px' : '15px',
                fontWeight: '600',
                marginBottom: '8px',
                letterSpacing: '0.3px'
              }}>
                {t.upgradeByAmount}
              </h4>
              <p style={{ margin: '0 0 6px 0', opacity: 0.9 }}>
                {t.upgradeByAmountText1}
              </p>
              <p style={{ margin: '0 0 6px 0', opacity: 0.9 }}>
                {t.upgradeByAmountText2}
              </p>
              <p style={{ margin: '0', opacity: 0.9 }}>
                {t.upgradeByAmountText3}
              </p>
            </div>

            {/* Апгрейд по длительности */}
            <div>
              <h4 style={{
                color: '#81D8D0',
                fontSize: isMobile ? '14px' : '15px',
                fontWeight: '600',
                marginBottom: '8px',
                letterSpacing: '0.3px'
              }}>
                {t.upgradeByDuration}
              </h4>
              <p style={{ margin: '0 0 6px 0', opacity: 0.9 }}>
                {t.upgradeByDurationText1}
              </p>
              <p style={{ margin: '0 0 6px 0', opacity: 0.9 }}>
                {t.upgradeByDurationText2}
              </p>
              <p style={{ margin: '0', opacity: 0.9 }}>
                {t.upgradeByDurationText3}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* СПИСОК ИНВЕСТИЦИЙ */}
      {allInvestments.length > 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '12px' : '16px'
        }}>
          {allInvestments.map((investment) => (
            <InvestmentCard
              key={investment.id}
              investment={investment}
              packages={packages}
              durationBonuses={durationBonuses}
              onUpgrade={handleUpgradeClick}
              showOnlyUpgrade={true}
              t={t}
              isMobile={isMobile}
            />
          ))}
        </div>
      ) : (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: isMobile ? '20px' : '24px',
          padding: isMobile ? '32px 20px' : '48px',
          textAlign: 'center'
        }}>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.5)', 
            fontSize: isMobile ? '13px' : '15px',
            letterSpacing: '-0.3px'
          }}>
            {t.noWithdrawals}
          </p>
        </div>
      )}

      {showUpgradeModal && selectedInvestment && (
        <UpgradeModal
          investment={selectedInvestment}
          onClose={handleCloseModals}
          onSubmit={handleSubmitUpgrade}
          error={upgradeError}
          success={upgradeSuccess}
          submitting={submitting}
          packages={packages}
          t={t}
          isMobile={isMobile}
        />
      )}
    </div>
  )
}