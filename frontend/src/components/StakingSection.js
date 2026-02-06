import { useState, useEffect } from 'react'
import { useTranslation } from '../app/hooks/useTranslation'
import { fixPrepositions } from '../app/utils/textUtils'
import RegisterModal from './RegisterModal'

export default function StakingSection({ isMobile, isTablet }) {
  const { t } = useTranslation()
  const [stakingAmount, setStakingAmount] = useState('1000')
  const [stakingPeriod, setStakingPeriod] = useState(3)
  const [estimatedReturn, setEstimatedReturn] = useState({ min: 0, max: 0 })
  const [monthlyIncome, setMonthlyIncome] = useState({ min: 0, max: 0 })
  const [cashBonus, setCashBonus] = useState(0)
  const [totalResult, setTotalResult] = useState({ min: 0, max: 0 })
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  useEffect(() => {
    const amount = parseFloat(stakingAmount) || 0
    
    let minRate = 0
    let maxRate = 0
    let bonus = 0
    
    if (stakingPeriod === 3) {
      minRate = 0.14
      maxRate = 0.22
    } else if (stakingPeriod === 6) {
      minRate = 0.155
      maxRate = 0.235
      
      if (amount >= 1000) {
        bonus = 500
      } else if (amount >= 500) {
        bonus = 200
      }
    } else if (stakingPeriod === 12) {
      minRate = 0.175
      maxRate = 0.25
      
      if (amount >= 1000) {
        bonus = 500
      } else if (amount >= 500) {
        bonus = 200
      }
    }
    
    const minMonthlyReturn = amount * minRate
    const maxMonthlyReturn = amount * maxRate
    const minTotalReturn = minMonthlyReturn * stakingPeriod
    const maxTotalReturn = maxMonthlyReturn * stakingPeriod
    
    setEstimatedReturn({ 
      min: minTotalReturn, 
      max: maxTotalReturn 
    })
    setMonthlyIncome({ 
      min: minMonthlyReturn, 
      max: maxMonthlyReturn 
    })
    setCashBonus(bonus)
    
    setTotalResult({
      min: amount + minTotalReturn + bonus,
      max: amount + maxTotalReturn + bonus
    })
  }, [stakingAmount, stakingPeriod])

  const stakingOptions = [
    { months: 3, minRate: 14, maxRate: 22, minAmount: 100 },
    { months: 6, minRate: 15.5, maxRate: 23.5, minAmount: 500 },
    { months: 12, minRate: 17.5, maxRate: 25, minAmount: 1000 }
  ]

  const handleAmountChange = (e) => {
    const value = e.target.value
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setStakingAmount(value)
    }
  }

  const handleStartStaking = () => {
    console.log('🚀 Opening Register Modal from Staking Section')
    setShowRegisterModal(true)
  }

  return (
    <>
      {showRegisterModal && (
        <RegisterModal 
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
        />
      )}

      <div style={{ marginBottom: '100px' }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          <h2 style={{
            fontSize: isMobile ? '28px' : '36px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '24px'
          }}>
            {fixPrepositions(t('stakingTitle'))}
          </h2>
          <p style={{
            fontSize: isMobile ? '16px' : '20px',
            color: 'rgba(255,255,255,0.8)',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            {fixPrepositions(t('stakingSubtitle'))}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '40px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Staking Calculator */}
          <div style={{
            background: `
              linear-gradient(135deg, 
                rgba(255, 255, 255, 0.15) 0%,
                rgba(255, 255, 255, 0.05) 50%,
                rgba(255, 255, 255, 0.10) 100%
              )
            `,
            backdropFilter: 'blur(30px) saturate(150%)',
            WebkitBackdropFilter: 'blur(30px) saturate(150%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '24px',
            padding: isMobile ? '24px' : '32px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)'
            }} />
            
            <h3 style={{
              fontSize: isMobile ? '22px' : '26px',
              fontWeight: '600',
              color: 'white',
              marginBottom: '32px',
              textAlign: 'center'
            }}>
              {fixPrepositions(t('calculateReturns'))}
            </h3>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '17px',
                marginBottom: '10px',
                fontWeight: '500'
              }}>
                {fixPrepositions(t('stakingAmount'))}
              </label>
              <input
                type="text"
                value={stakingAmount}
                onChange={handleAmountChange}
                placeholder="100"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '18px',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: '600',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '17px',
                marginBottom: '16px',
                fontWeight: '500'
              }}>
                {fixPrepositions(t('stakingPeriod'))}
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px'
              }}>
                {stakingOptions.map((option) => (
                  <button
                    key={option.months}
                    onClick={() => setStakingPeriod(option.months)}
                    style={{
                      background: stakingPeriod === option.months 
                        ? 'linear-gradient(135deg, #2dd4bf, #14b8a6)'
                        : 'rgba(255, 255, 255, 0.1)',
                      border: `1px solid ${stakingPeriod === option.months 
                        ? '#2dd4bf' 
                        : 'rgba(255, 255, 255, 0.2)'}`,
                      borderRadius: '12px',
                      padding: '14px 8px',
                      color: 'white',
                      fontSize: isMobile ? '13px' : '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: isMobile ? '14px' : '16px', marginBottom: '4px' }}>
                      {option.months} {t('months')}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
                      {option.minRate}% - {option.maxRate}%
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.7 }}>
                      {fixPrepositions(t('perMonth'))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              background: 'rgba(45, 212, 191, 0.1)',
              border: '1px solid rgba(45, 212, 191, 0.3)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: isMobile ? '20px' : '24px',
                    fontWeight: 'bold',
                    color: '#2dd4bf',
                    marginBottom: '6px'
                  }}>
                    ${monthlyIncome.min.toFixed(2)} - ${monthlyIncome.max.toFixed(2)}
                  </div>
                  <div style={{
                    fontSize: '15px',
                    color: 'rgba(255,255,255,0.8)'
                  }}>
                    {fixPrepositions(t('monthlyIncome'))}
                  </div>
                </div>

                <div style={{
                  height: '1px',
                  background: 'rgba(45, 212, 191, 0.3)'
                }} />

                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: isMobile ? '20px' : '24px',
                    fontWeight: 'bold',
                    color: '#2dd4bf',
                    marginBottom: '6px'
                  }}>
                    ${estimatedReturn.min.toFixed(2)} - ${estimatedReturn.max.toFixed(2)}
                  </div>
                  <div style={{
                    fontSize: '15px',
                    color: 'rgba(255,255,255,0.8)'
                  }}>
                    {fixPrepositions(t('totalReturns'))}
                  </div>
                </div>

                {cashBonus > 0 && (
                  <>
                    <div style={{
                      height: '1px',
                      background: 'rgba(45, 212, 191, 0.3)'
                    }} />
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: isMobile ? '24px' : '28px',
                        fontWeight: 'bold',
                        color: '#2dd4bf',
                        marginBottom: '6px'
                      }}>
                        +${cashBonus}
                      </div>
                      <div style={{
                        fontSize: '15px',
                        color: 'rgba(255,255,255,0.8)'
                      }}>
                        {t('cashBonus') || 'Бонус'}
                      </div>
                    </div>
                  </>
                )}

                <div style={{
                  height: '2px',
                  background: 'rgba(45, 212, 191, 0.5)'
                }} />

                <div style={{ 
                  textAlign: 'center',
                  background: 'rgba(45, 212, 191, 0.15)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(45, 212, 191, 0.4)'
                }}>
                  <div style={{
                    fontSize: isMobile ? '26px' : '32px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    marginBottom: '6px'
                  }}>
                    ${totalResult.min.toFixed(2)} - ${totalResult.max.toFixed(2)}
                  </div>
                  <div style={{
                    fontSize: '16px',
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: '600'
                  }}>
                    {t('totalResult') || 'Итого результат'}
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleStartStaking}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)',
                border: 'none',
                borderRadius: '16px',
                padding: '20px',
                color: 'white',
                fontSize: '19px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '24px',
                transition: 'all 0.3s',
                boxShadow: '0 8px 25px rgba(20, 184, 166, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 12px 35px rgba(20, 184, 166, 0.4)'
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 8px 25px rgba(20, 184, 166, 0.3)'
              }}
            >
              {fixPrepositions(t('startStaking'))}
            </button>

            {/* ✅ НОВАЯ СТРОКА: Прибыль ориентировочная */}
            <div style={{
              marginTop: '16px',
              textAlign: 'center',
              fontSize: isMobile ? '12px' : '13px',
              color: 'rgba(255, 255, 255, 0.65)',
              lineHeight: '1.5',
              fontStyle: 'italic'
            }}>
              {fixPrepositions(t('profitDisclaimer'))}
            </div>
          </div>

          {/* Staking Information */}
          <div>
            <div style={{
              background: `
                linear-gradient(135deg, 
                  rgba(255, 255, 255, 0.12) 0%,
                  rgba(255, 255, 255, 0.04) 50%,
                  rgba(255, 255, 255, 0.08) 100%
                )
              `,
              backdropFilter: 'blur(30px) saturate(150%)',
              WebkitBackdropFilter: 'blur(30px) saturate(150%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '24px',
              padding: isMobile ? '24px' : '32px',
              marginBottom: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)'
              }} />
              
              <h4 style={{
                fontSize: isMobile ? '20px' : '22px',
                fontWeight: '600',
                color: 'white',
                marginBottom: '24px'
              }}>
                {fixPrepositions(t('humanRobotTrading'))}
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { titleKey: 'guaranteedReturns', descKey: 'guaranteedReturnsDesc' },
                  { titleKey: 'professionalManagement', descKey: 'professionalManagementDesc' },
                  { titleKey: 'secureStorage', descKey: 'secureStorageDesc' }
                ].map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '18px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      background: '#2dd4bf',
                      borderRadius: '50%',
                      marginTop: '8px',
                      flexShrink: 0
                    }} />
                    <div>
                      <div style={{
                        fontSize: '17px',
                        fontWeight: '600',
                        color: 'white',
                        marginBottom: '6px'
                      }}>
                        {fixPrepositions(t(item.titleKey))}
                      </div>
                      <div style={{
                        fontSize: '15px',
                        color: 'rgba(255,255,255,0.7)',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-line'
                      }}>
                        {fixPrepositions(t(item.descKey))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: `
                linear-gradient(135deg, 
                  rgba(45, 212, 191, 0.15) 0%,
                  rgba(45, 212, 191, 0.05) 100%
                )
              `,
              backdropFilter: 'blur(30px) saturate(150%)',
              WebkitBackdropFilter: 'blur(30px) saturate(150%)',
              border: '1px solid rgba(45, 212, 191, 0.3)',
              borderRadius: '24px',
              padding: isMobile ? '24px' : '32px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(45, 212, 191, 0.6), transparent)'
              }} />
              
              <h4 style={{
                fontSize: isMobile ? '17px' : '19px',
                fontWeight: '600',
                color: '#2dd4bf',
                marginBottom: '16px'
              }}>
                {fixPrepositions(t('assetsUnderManagement'))}
              </h4>
              <LiveCounter isMobile={isMobile} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function LiveCounter({ isMobile }) {
  const { t } = useTranslation()
  const [amount, setAmount] = useState(0)

  useEffect(() => {
    const BASE_AMOUNT = 1000000
    const DAILY_GROWTH_RATE = 0.0125
    const START_DATE = new Date('2026-01-01T00:00:00Z')

    const calculateCurrentAmount = () => {
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      START_DATE.setHours(0, 0, 0, 0)
      
      if (now < START_DATE) {
        return BASE_AMOUNT
      }
      
      const daysPassed = Math.floor((now - START_DATE) / (1000 * 60 * 60 * 24))
      const currentAmount = BASE_AMOUNT * Math.pow(1 + DAILY_GROWTH_RATE, daysPassed)
      
      return currentAmount
    }

    setAmount(calculateCurrentAmount())
  }, [])

  return (
    <div>
      <div style={{
        fontSize: isMobile ? '34px' : '38px',
        fontWeight: 'bold',
        color: 'white',
        marginBottom: '10px'
      }}>
        ${Math.floor(amount).toLocaleString()}
      </div>
      <div style={{
        fontSize: '17px',
        color: 'rgba(255,255,255,0.8)',
        marginBottom: '16px'
      }}>
        {fixPrepositions(t('totalAssetsValue'))}
      </div>
      <div style={{
        fontSize: '22px',
        fontWeight: '600',
        color: '#2dd4bf'
      }}>
        4 {fixPrepositions(t('monthsInOperation'))}
      </div>
    </div>
  )
}
