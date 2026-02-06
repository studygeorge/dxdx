'use client'
import { useState } from 'react'
import { validateTRC20Address } from '../utils/calculations'

export default function InvestForm({ 
  selectedPlan,
  selectedDuration,
  setSelectedDuration,
  investAmount,
  setInvestAmount,
  senderWalletAddress,
  setSenderWalletAddress,
  onSubmit,
  onCancel,
  calculateReturns,
  DURATION_BONUSES,
  loading,
  error,
  maxAmountWarning,
  setMaxAmountWarning,
  setError,
  t,
  isMobile
}) {
  const handleAmountChange = (e) => {
    const value = e.target.value
    
    if (value === '') {
      setInvestAmount('')
      setMaxAmountWarning(false)
      setError('')
      return
    }

    const numValue = parseFloat(value)

    if (isNaN(numValue)) {
      return
    }

    if (selectedPlan && numValue > selectedPlan.maxAmount) {
      setInvestAmount(selectedPlan.maxAmount.toString())
      setMaxAmountWarning(true)
      setError('')
      
      setTimeout(() => {
        setMaxAmountWarning(false)
      }, 2500)
    } else {
      setInvestAmount(value)
      setMaxAmountWarning(false)
      setError('')
    }
  }

  const returns = calculateReturns()

  return (
    <form onSubmit={onSubmit}>
      {/* Amount Input */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: isMobile ? '12px' : '13px',
          fontWeight: '500',
          marginBottom: '8px',
          letterSpacing: '-0.3px'
        }}>
          {t.enterAmount}
        </label>
        <input
          type="number"
          step="0.01"
          min={selectedPlan.minAmount}
          max={selectedPlan.maxAmount}
          value={investAmount}
          onChange={handleAmountChange}
          placeholder={`${selectedPlan.minAmount} - ${selectedPlan.maxAmount}`}
          required
          style={{
            width: '100%',
            padding: isMobile ? '12px 16px' : '14px 18px',
            background: 'rgba(0, 0, 0, 0.3)',
            border: maxAmountWarning 
              ? '2px solid rgba(45, 212, 191, 0.6)' 
              : '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            color: '#ffffff',
            fontSize: isMobile ? '14px' : '15px',
            outline: 'none',
            transition: 'all 0.3s',
            letterSpacing: '-0.3px',
            boxSizing: 'border-box'
          }}
        />
        
        {maxAmountWarning && (
          <div style={{
            marginTop: '8px',
            padding: '8px 12px',
            background: 'rgba(45, 212, 191, 0.15)',
            border: '1px solid rgba(45, 212, 191, 0.3)',
            borderRadius: '10px',
            color: '#2dd4bf',
            fontSize: isMobile ? '11px' : '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{t.maxAmountReached}</span>
          </div>
        )}
      </div>

      {/* Duration Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: isMobile ? '12px' : '13px',
          fontWeight: '500',
          marginBottom: '12px',
          letterSpacing: '-0.3px'
        }}>
          {t.selectDuration}
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.entries(DURATION_BONUSES).map(([months, bonus]) => {
            const amount = parseFloat(investAmount) || 0
            const showBonus500 = months !== '3' && amount >= 500 && amount < 1000
            const showBonus1000 = months !== '3' && amount >= 1000
            
            return (
              <div
                key={months}
                onClick={() => setSelectedDuration(parseInt(months))}
                style={{
                  background: selectedDuration === parseInt(months)
                    ? 'rgba(45, 212, 191, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: selectedDuration === parseInt(months)
                    ? '2px solid rgba(45, 212, 191, 0.5)'
                    : '2px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{
                    color: '#ffffff',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: '600'
                  }}>
                    {bonus.label}
                  </span>
                  {selectedDuration === parseInt(months) && (
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#2dd4bf',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: '#000000',
                      fontWeight: 'bold'
                    }}>
                      ✓
                    </div>
                  )}
                </div>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: isMobile ? '11px' : '12px'
                }}>
                  {bonus.description}
                </div>
                {showBonus500 && (
                  <div style={{
                    marginTop: '8px',
                    fontSize: isMobile ? '11px' : '12px',
                    color: '#2dd4bf',
                    fontWeight: '500'
                  }}>
                    {bonus.cashBonusLabel500}
                  </div>
                )}
                {showBonus1000 && (
                  <div style={{
                    marginTop: '8px',
                    fontSize: isMobile ? '11px' : '12px',
                    color: '#2dd4bf',
                    fontWeight: '500'
                  }}>
                    {bonus.cashBonusLabel1000}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Wallet Address */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: isMobile ? '12px' : '13px',
          fontWeight: '500',
          marginBottom: '8px',
          letterSpacing: '-0.3px'
        }}>
          {t.senderWalletLabel}
        </label>
        <input
          type="text"
          value={senderWalletAddress}
          onChange={(e) => setSenderWalletAddress(e.target.value)}
          placeholder={t.senderWalletPlaceholder}
          required
          style={{
            width: '100%',
            padding: isMobile ? '12px 16px' : '14px 18px',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            color: '#ffffff',
            fontSize: isMobile ? '13px' : '14px',
            outline: 'none',
            transition: 'all 0.3s',
            letterSpacing: '-0.3px',
            boxSizing: 'border-box',
            fontFamily: 'monospace'
          }}
        />
        <div style={{
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: isMobile ? '10px' : '11px',
          marginTop: '6px',
          letterSpacing: '-0.3px'
        }}>
          {t.walletHint}
        </div>
      </div>

      {/* Returns Summary */}
      {returns && (
        <div style={{
          background: 'rgba(45, 212, 191, 0.08)',
          border: '1px solid rgba(45, 212, 191, 0.2)',
          borderRadius: '16px',
          padding: isMobile ? '14px 16px' : '16px 20px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <span style={{ 
              color: 'rgba(255, 255, 255, 0.6)', 
              fontSize: isMobile ? '11px' : '12px'
            }}>
              {t.baseRate}
            </span>
            <span style={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              fontSize: isMobile ? '12px' : '13px', 
              fontWeight: '600'
            }}>
              {returns.baseRate}%
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <span style={{ 
              color: 'rgba(255, 255, 255, 0.6)', 
              fontSize: isMobile ? '11px' : '12px'
            }}>
              {t.effectiveRate}
            </span>
            <span style={{ 
              color: '#2dd4bf', 
              fontSize: isMobile ? '12px' : '13px', 
              fontWeight: '600'
            }}>
              {returns.effectiveRate}%
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <span style={{ 
              color: 'rgba(255, 255, 255, 0.6)', 
              fontSize: isMobile ? '11px' : '12px'
            }}>
              {t.interestReturn}
            </span>
            <span style={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              fontSize: isMobile ? '12px' : '13px', 
              fontWeight: '600'
            }}>
              ${returns.interestReturn}
            </span>
          </div>
          {returns.hasCashBonus && (
            <>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <span style={{ 
                  color: 'rgba(255, 255, 255, 0.6)', 
                  fontSize: isMobile ? '11px' : '12px'
                }}>
                  {t.cashBonus}
                </span>
                <span style={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  fontSize: isMobile ? '12px' : '13px', 
                  fontWeight: '600'
                }}>
                  ${returns.cashBonus}
                </span>
              </div>
              <div style={{
                fontSize: isMobile ? '10px' : '11px',
                color: 'rgba(255, 255, 255, 0.4)',
                marginBottom: '12px',
                fontStyle: 'italic'
              }}>
                {t.bonusNote}
              </div>
            </>
          )}
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '8px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{ 
              color: '#ffffff', 
              fontSize: isMobile ? '12px' : '13px',
              fontWeight: '600'
            }}>
              {t.totalWithBonus}
            </span>
            <span style={{ 
              color: '#2dd4bf', 
              fontSize: isMobile ? '13px' : '14px', 
              fontWeight: '700'
            }}>
              ${returns.totalReturn}
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: isMobile ? '8px 12px' : '10px 14px',
          marginBottom: '16px',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: isMobile ? '11px' : '12px'
        }}>
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          type="submit"
          disabled={loading || !investAmount || !selectedDuration || !senderWalletAddress}
          style={{
            flex: 1,
            minWidth: '120px',
            padding: isMobile ? '12px' : '14px',
            background: (loading || !investAmount || !selectedDuration || !senderWalletAddress)
              ? 'rgba(45, 212, 191, 0.3)' 
              : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
            border: 'none',
            borderRadius: '16px',
            color: (loading || !investAmount || !selectedDuration || !senderWalletAddress)
              ? 'rgba(0, 0, 0, 0.5)' 
              : '#000000',
            fontSize: isMobile ? '13px' : '14px',
            fontWeight: '600',
            cursor: (loading || !investAmount || !selectedDuration || !senderWalletAddress)
              ? 'not-allowed' 
              : 'pointer',
            transition: 'all 0.3s'
          }}
        >
          {loading ? t.loading : t.openInvestment}
        </button>

        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: isMobile ? '12px 20px' : '14px 24px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: isMobile ? '13px' : '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          {t.cancel}
        </button>
      </div>
    </form>
  )
}
