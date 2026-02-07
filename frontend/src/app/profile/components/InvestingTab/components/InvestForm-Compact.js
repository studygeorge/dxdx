'use client'
import { useState } from 'react'
import { validateTRC20Address } from '../utils/calculations'

export default function InvestFormCompact({ 
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
      {/* ✅ DESKTOP: Две колонки, MOBILE: Одна колонка */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: isMobile ? '20px' : '24px',
        marginBottom: '20px'
      }}>
        
        {/* LEFT COLUMN - Inputs */}
        <div>
          {/* Amount Input */}
          <div style={{ marginBottom: '16px' }}>
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
                padding: isMobile ? '12px 16px' : '12px 16px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: maxAmountWarning 
                  ? '2px solid rgba(45, 212, 191, 0.6)' 
                  : '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '14px',
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
                marginTop: '6px',
                padding: '6px 10px',
                background: 'rgba(45, 212, 191, 0.15)',
                border: '1px solid rgba(45, 212, 191, 0.3)',
                borderRadius: '8px',
                color: '#2dd4bf',
                fontSize: isMobile ? '10px' : '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span>{t.maxAmountReached}</span>
              </div>
            )}
          </div>

          {/* Duration Selection - COMPACT */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: isMobile ? '12px' : '13px',
              fontWeight: '500',
              marginBottom: '10px',
              letterSpacing: '-0.3px'
            }}>
              {t.selectDuration}
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(DURATION_BONUSES).map(([months, bonus]) => {
                const amount = parseFloat(investAmount) || 0
                const showBonus = months !== '3' && (amount >= 500 || amount >= 1000)
                
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
                      borderRadius: '12px',
                      padding: isMobile ? '10px 12px' : '10px 14px',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ flex: 1 }}>
                        <span style={{
                          color: '#ffffff',
                          fontSize: isMobile ? '13px' : '14px',
                          fontWeight: '600',
                          display: 'block',
                          marginBottom: '2px'
                        }}>
                          {bonus.label}
                        </span>
                        <span style={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: isMobile ? '10px' : '11px'
                        }}>
                          {bonus.description}
                        </span>
                        {showBonus && (
                          <div style={{
                            marginTop: '4px',
                            fontSize: isMobile ? '10px' : '11px',
                            color: '#2dd4bf',
                            fontWeight: '500'
                          }}>
                            {amount >= 1000 ? bonus.cashBonusLabel1000 : bonus.cashBonusLabel500}
                          </div>
                        )}
                      </div>
                      {selectedDuration === parseInt(months) && (
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: '#2dd4bf',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          color: '#000000',
                          fontWeight: 'bold',
                          flexShrink: 0,
                          marginLeft: '8px'
                        }}>
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Wallet Address */}
          <div>
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
                padding: isMobile ? '12px 16px' : '12px 16px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '14px',
                color: '#ffffff',
                fontSize: isMobile ? '12px' : '13px',
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
              marginTop: '5px',
              letterSpacing: '-0.3px'
            }}>
              {t.walletHint}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Returns Summary */}
        {returns && (
          <div style={{
            background: 'rgba(45, 212, 191, 0.08)',
            border: '1px solid rgba(45, 212, 191, 0.2)',
            borderRadius: '16px',
            padding: isMobile ? '14px 16px' : '16px 18px',
            height: 'fit-content'
          }}>
            <div style={{
              fontSize: isMobile ? '12px' : '13px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '12px',
              letterSpacing: '-0.3px'
            }}>
              Summary
            </div>

            {/* Grid Layout for returns */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginBottom: '10px'
            }}>
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '10px',
                padding: '8px 10px'
              }}>
                <div style={{ 
                  color: 'rgba(255, 255, 255, 0.5)', 
                  fontSize: isMobile ? '10px' : '11px',
                  marginBottom: '2px'
                }}>
                  {t.baseRate}
                </div>
                <div style={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  fontSize: isMobile ? '13px' : '14px', 
                  fontWeight: '700'
                }}>
                  {returns.baseRate}%
                </div>
              </div>

              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '10px',
                padding: '8px 10px'
              }}>
                <div style={{ 
                  color: 'rgba(255, 255, 255, 0.5)', 
                  fontSize: isMobile ? '10px' : '11px',
                  marginBottom: '2px'
                }}>
                  {t.effectiveRate}
                </div>
                <div style={{ 
                  color: '#2dd4bf', 
                  fontSize: isMobile ? '13px' : '14px', 
                  fontWeight: '700'
                }}>
                  {returns.effectiveRate}%
                </div>
              </div>

              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '10px',
                padding: '8px 10px'
              }}>
                <div style={{ 
                  color: 'rgba(255, 255, 255, 0.5)', 
                  fontSize: isMobile ? '10px' : '11px',
                  marginBottom: '2px'
                }}>
                  {t.interestReturn}
                </div>
                <div style={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  fontSize: isMobile ? '13px' : '14px', 
                  fontWeight: '700'
                }}>
                  ${returns.interestReturn}
                </div>
              </div>

              {returns.hasCashBonus && (
                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '10px',
                  padding: '8px 10px'
                }}>
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.5)', 
                    fontSize: isMobile ? '10px' : '11px',
                    marginBottom: '2px'
                  }}>
                    {t.cashBonus}
                  </div>
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    fontSize: isMobile ? '13px' : '14px', 
                    fontWeight: '700'
                  }}>
                    ${returns.cashBonus}
                  </div>
                </div>
              )}
            </div>

            {returns.hasCashBonus && (
              <div style={{
                fontSize: isMobile ? '9px' : '10px',
                color: 'rgba(255, 255, 255, 0.4)',
                marginBottom: '10px',
                fontStyle: 'italic',
                lineHeight: '1.3'
              }}>
                {t.bonusNote}
              </div>
            )}

            {/* Total */}
            <div style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '10px',
              marginTop: '10px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
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
                  fontSize: isMobile ? '16px' : '18px', 
                  fontWeight: '700'
                }}>
                  ${returns.totalReturn}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

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
            padding: isMobile ? '12px' : '13px',
            background: (loading || !investAmount || !selectedDuration || !senderWalletAddress)
              ? 'rgba(45, 212, 191, 0.3)' 
              : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
            border: 'none',
            borderRadius: '14px',
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
            padding: isMobile ? '12px 20px' : '13px 24px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '14px',
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
