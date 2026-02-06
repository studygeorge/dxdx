'use client'
import React, { useState, useEffect } from 'react'
import { useReinvest } from '../hooks/useReinvest'

const ReinvestModal = ({ 
  investment, 
  onClose, 
  onSuccess,
  t,
  isMobile 
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [reinvestAmount, setReinvestAmount] = useState('')
  const [willUpgrade, setWillUpgrade] = useState(false)
  const [newPackage, setNewPackage] = useState(null)
  const [newROI, setNewROI] = useState(null)
  
  const { reinvestProfit, loading, error, success, setError } = useReinvest()

  if (!investment) return null

  const availableProfit = investment.availableProfit || 0
  const currentAmount = parseFloat(investment.amount)
  const currentPackage = investment.planName
  const currentROI = parseFloat(investment.roi)

  // Пакеты и их параметры (синхронизировано с backend)
  const packages = [
    { name: 'Starter', monthlyRate: 14, min: 100, max: 999 },
    { name: 'Advanced', monthlyRate: 17, min: 1000, max: 2999 },
    { name: 'Pro', monthlyRate: 20, min: 3000, max: 5999 },
    { name: 'Elite', monthlyRate: 22, min: 6000, max: 100000 }
  ]

  // Бонусы за длительность
  const durationBonuses = {
    3: 0,
    6: 1.5,
    12: 3
  }

  const getPackageByAmount = (amount) => {
    if (amount >= 6000) return packages[3] // Elite
    if (amount >= 3000) return packages[2] // Pro
    if (amount >= 1000) return packages[1] // Advanced
    return packages[0] // Starter
  }

  // Проверяем апгрейд при изменении суммы
  useEffect(() => {
    const amount = parseFloat(reinvestAmount)
    if (!amount || amount <= 0) {
      setWillUpgrade(false)
      setNewPackage(null)
      setNewROI(null)
      return
    }

    const newTotalAmount = currentAmount + amount
    const targetPackage = getPackageByAmount(newTotalAmount)
    
    // Проверяем, изменился ли пакет
    if (targetPackage.name !== currentPackage) {
      setWillUpgrade(true)
      setNewPackage(targetPackage.name)
      
      // Рассчитываем новый ROI с учётом бонуса за длительность
      const durationBonus = durationBonuses[investment.duration] || 0
      const calculatedROI = targetPackage.monthlyRate + durationBonus
      setNewROI(calculatedROI)
    } else {
      setWillUpgrade(false)
      setNewPackage(null)
      setNewROI(null)
    }
  }, [reinvestAmount, currentAmount, currentPackage, investment.duration])

  const handleMaxClick = () => {
    setReinvestAmount(availableProfit.toFixed(2))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    const amount = parseFloat(reinvestAmount)
    
    if (!amount || amount <= 0) {
      setError(t.enterValidAmount || 'Please enter a valid amount')
      return
    }

    if (amount > availableProfit) {
      setError(t.insufficientProfit || 'Insufficient available profit')
      return
    }

    try {
      const result = await reinvestProfit(investment.id, amount)
      
      if (result && result.success) {
        setCurrentStep(2)
        setTimeout(() => {
          if (onSuccess) onSuccess()
          handleClose()
        }, 3000)
      }
    } catch (err) {
      console.error('Reinvest failed:', err)
    }
  }

  const handleClose = () => {
    setCurrentStep(1)
    setReinvestAmount('')
    setWillUpgrade(false)
    setNewPackage(null)
    setNewROI(null)
    onClose()
  }

  const LoadingSpinner = () => (
    <div style={{
      display: 'inline-block',
      width: '20px',
      height: '20px',
      border: '3px solid rgba(45, 212, 191, 0.2)',
      borderTop: '3px solid #2dd4bf',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
  )

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
    >
      <div 
        style={{
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(45, 212, 191, 0.2)',
          borderRadius: '32px',
          padding: isMobile ? '28px 20px' : '36px 32px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 0 40px rgba(45, 212, 191, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '24px',
            cursor: 'pointer',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(45, 212, 191, 0.15)'
            e.currentTarget.style.color = '#2dd4bf'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'none'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
          }}
        >
          ×
        </button>

        {currentStep === 2 ? (
          <div>
            <h2 style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '20px',
              letterSpacing: '-0.8px'
            }}>
              {t.reinvestSuccess || 'Reinvestment Successful'}
            </h2>

            <div style={{
              background: 'rgba(45, 212, 191, 0.1)',
              border: '1px solid rgba(45, 212, 191, 0.25)',
              borderRadius: '16px',
              padding: isMobile ? '20px' : '24px',
              marginBottom: '24px',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: isMobile ? '13px' : '14px',
              lineHeight: '1.6',
              letterSpacing: '-0.3px'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '12px', 
                marginBottom: '16px',
                padding: '12px',
                background: 'rgba(45, 212, 191, 0.08)',
                borderRadius: '12px'
              }}>
                <span style={{ fontSize: '24px' }}>✅</span>
                <span style={{ 
                  fontWeight: '600', 
                  color: '#2dd4bf',
                  fontSize: '15px'
                }}>
                  {t.profitReinvested || 'Profit Reinvested'}
                </span>
              </div>
              
              <div style={{ 
                textAlign: 'center',
                lineHeight: '1.8',
                color: 'rgba(255, 255, 255, 0.85)',
                marginBottom: '12px'
              }}>
                {t.reinvestDescription || 'Your profit has been reinvested into your investment. The funds will remain in the system and continue to generate returns.'}
              </div>

              {willUpgrade && (
                <div style={{
                  textAlign: 'center',
                  padding: '10px',
                  background: 'rgba(45, 212, 191, 0.05)',
                  borderRadius: '10px',
                  border: '1px solid rgba(45, 212, 191, 0.15)',
                  color: '#2dd4bf',
                  fontSize: isMobile ? '12px' : '13px',
                  fontWeight: '500'
                }}>
                  🎉 {t.upgradedTo || 'Upgraded to'} {newPackage} ({newROI}%)
                </div>
              )}
            </div>

            <div style={{
              background: 'rgba(45, 212, 191, 0.08)',
              border: '1px solid rgba(45, 212, 191, 0.2)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: isMobile ? '11px' : '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '8px',
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>
                {t.reinvestedAmount || 'Reinvested Amount'}
              </div>
              <div style={{
                fontSize: isMobile ? '24px' : '28px',
                fontWeight: '700',
                color: '#2dd4bf',
                letterSpacing: '-1.2px'
              }}>
                ${parseFloat(reinvestAmount).toFixed(2)}
              </div>
            </div>

            <button
              onClick={handleClose}
              style={{
                width: '100%',
                padding: isMobile ? '14px' : '16px',
                background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                border: 'none',
                borderRadius: '16px',
                color: '#000000',
                fontSize: isMobile ? '14px' : '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                letterSpacing: '-0.3px',
                boxShadow: '0 4px 12px rgba(45, 212, 191, 0.25)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)'
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(45, 212, 191, 0.35)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 212, 191, 0.25)'
              }}
            >
              {t.close || 'Close'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '24px',
              letterSpacing: '-0.8px'
            }}>
              {t.reinvestProfit || 'Reinvest Profit'}
            </h2>

            <div style={{
              background: 'rgba(45, 212, 191, 0.08)',
              border: '1px solid rgba(45, 212, 191, 0.2)',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '20px'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {t.currentInvestment || 'Current Investment'}
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginTop: '4px' }}>
                  {currentPackage} - ${currentAmount.toFixed(2)}
                </div>
              </div>
              
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '12px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '8px'
                }}>
                  <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                    {t.availableProfit || 'Available Profit'}:
                  </div>
                  <div style={{ fontSize: '14px', color: '#2dd4bf', fontWeight: '500' }}>
                    ${availableProfit.toFixed(2)}
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between'
                }}>
                  <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                    {t.currentPlan || 'Current Plan'}:
                  </div>
                  <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: '500' }}>
                    {currentPackage} ({currentROI}%)
                  </div>
                </div>
              </div>
            </div>

            {willUpgrade && (
              <div style={{
                background: 'rgba(45, 212, 191, 0.1)',
                border: '1px solid rgba(45, 212, 191, 0.3)',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '20px'
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#2dd4bf',
                  marginBottom: '6px',
                  letterSpacing: '-0.3px'
                }}>
                  🎉 {t.upgradeDetected || 'Upgrade Detected!'}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  {t.willUpgradeTo || 'Your investment will be upgraded to'} <strong>{newPackage}</strong> {t.with || 'with'} <strong>{newROI}%</strong> ROI
                </div>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                color: 'rgba(255, 255, 255, 0.7)', 
                fontSize: '13px', 
                marginBottom: '8px',
                fontWeight: '500',
                letterSpacing: '-0.3px'
              }}>
                {t.reinvestAmount || 'Reinvest Amount'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={reinvestAmount}
                  onChange={(e) => setReinvestAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max={availableProfit}
                  disabled={loading}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 80px 14px 18px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(45, 212, 191, 0.2)',
                    borderRadius: '16px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.3s',
                    letterSpacing: '-0.3px',
                    MozAppearance: 'textfield',
                    WebkitAppearance: 'none',
                    appearance: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(45, 212, 191, 0.5)'
                    e.target.style.background = 'rgba(0, 0, 0, 0.4)'
                    e.target.style.boxShadow = '0 0 0 3px rgba(45, 212, 191, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(45, 212, 191, 0.2)'
                    e.target.style.background = 'rgba(0, 0, 0, 0.3)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={handleMaxClick}
                  disabled={loading}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#000000',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    letterSpacing: '0.5px'
                  }}
                  onMouseOver={(e) => {
                    if (!loading) e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
                  }}
                >
                  MAX
                </button>
              </div>
              {parseFloat(reinvestAmount) > availableProfit && (
                <div style={{
                  fontSize: '11px',
                  color: '#ef4444',
                  marginTop: '6px'
                }}>
                  {t.insufficientProfit || 'Insufficient available profit'}
                </div>
              )}

              {reinvestAmount && (
                <div style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginTop: '6px'
                }}>
                  {t.newTotalAmount || 'New total amount'}: ${(currentAmount + parseFloat(reinvestAmount || 0)).toFixed(2)}
                </div>
              )}
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '10px 14px',
                marginBottom: '16px',
                color: '#ef4444',
                fontSize: '12px',
                letterSpacing: '-0.3px'
              }}>
                {error}
              </div>
            )}

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(45, 212, 191, 0.15)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.6'
              }}>
                ℹ️ {t.reinvestNote || 'Your profit will be added to your investment amount. No bonus is applied during reinvestment. If the new amount reaches a higher plan threshold, your package will be automatically upgraded.'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                type="submit"
                disabled={loading || !reinvestAmount || parseFloat(reinvestAmount) <= 0 || parseFloat(reinvestAmount) > availableProfit}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: (loading || !reinvestAmount || parseFloat(reinvestAmount) <= 0 || parseFloat(reinvestAmount) > availableProfit)
                    ? 'rgba(45, 212, 191, 0.3)' 
                    : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                  border: 'none',
                  borderRadius: '16px',
                  color: (loading || !reinvestAmount || parseFloat(reinvestAmount) <= 0 || parseFloat(reinvestAmount) > availableProfit)
                    ? 'rgba(255, 255, 255, 0.4)' 
                    : '#000000',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: (loading || !reinvestAmount || parseFloat(reinvestAmount) <= 0 || parseFloat(reinvestAmount) > availableProfit)
                    ? 'not-allowed' 
                    : 'pointer',
                  transition: 'all 0.3s',
                  letterSpacing: '-0.3px',
                  boxShadow: (loading || !reinvestAmount || parseFloat(reinvestAmount) <= 0 || parseFloat(reinvestAmount) > availableProfit)
                    ? 'none'
                    : '0 4px 12px rgba(45, 212, 191, 0.25)'
                }}
                onMouseOver={(e) => {
                  if (!loading && reinvestAmount && parseFloat(reinvestAmount) > 0 && parseFloat(reinvestAmount) <= availableProfit) {
                    e.currentTarget.style.transform = 'scale(1.02)'
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(45, 212, 191, 0.35)'
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 212, 191, 0.25)'
                }}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <LoadingSpinner />
                    <span>{t.processing || 'Processing...'}</span>
                  </div>
                ) : (
                  t.reinvestProfit || 'Reinvest Profit'
                )}
              </button>

              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(45, 212, 191, 0.2)',
                  borderRadius: '16px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  letterSpacing: '-0.3px'
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = 'rgba(45, 212, 191, 0.1)'
                    e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.3)'
                    e.currentTarget.style.color = '#2dd4bf'
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                  e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.2)'
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
                }}
              >
                {t.cancel || 'Cancel'}
              </button>
            </div>
          </form>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  )
}

export default ReinvestModal