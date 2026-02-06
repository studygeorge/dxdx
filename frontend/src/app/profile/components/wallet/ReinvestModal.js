// dxcapai-app/src/app/profile/components/wallet/ReinvestModal.js

'use client'
import React, { useState, useEffect } from 'react'

const ReinvestModal = ({ 
  availableAmount,
  investments,
  onClose, 
  onSubmit,
  error,
  success,
  submitting,
  t,
  isMobile
}) => {
  const [selectedInvestmentId, setSelectedInvestmentId] = useState('')
  const [step, setStep] = useState(1)
  const [reinvestResult, setReinvestResult] = useState(null)

  useEffect(() => {
    if (investments && investments.length === 1) {
      setSelectedInvestmentId(investments[0].id)
    }
  }, [investments])

  const handleSubmit = async () => {
    if (!selectedInvestmentId) return
    
    const result = await onSubmit(selectedInvestmentId)
    if (result && result.success) {
      setReinvestResult(result.data)
      setStep(2)
    }
  }

  const LoadingSpinner = () => (
    <div style={{
      display: 'inline-block',
      width: '20px',
      height: '20px',
      border: '3px solid rgba(139, 92, 246, 0.2)',
      borderTop: '3px solid #8b5cf6',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
  )

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `
    document.head.appendChild(style)
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

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
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div 
        style={{
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '32px',
          padding: isMobile ? '28px 20px' : '36px 32px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
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
            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)'
            e.currentTarget.style.color = '#8b5cf6'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'none'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
          }}
        >
          ×
        </button>

        <div style={{
          fontSize: isMobile ? '11px' : '12px',
          color: 'rgba(139, 92, 246, 0.7)',
          marginBottom: '16px',
          letterSpacing: '-0.3px',
          fontWeight: '500'
        }}>
          {t.step || 'Step'} {step} {t.of || 'of'} 2
        </div>

        <h2 style={{
          fontSize: isMobile ? '20px' : '24px',
          fontWeight: '600',
          color: '#ffffff',
          marginBottom: '20px',
          letterSpacing: '-0.8px'
        }}>
          {step === 1 ? (t.reinvestProfit || 'Reinvest Referral Profit') : (t.reinvestSuccess || 'Reinvest Successful')}
        </h2>

        {step === 1 ? (
          <>
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
                {t.reinvestAmount || 'Amount to Reinvest'}
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6' }}>
                ${availableAmount.toFixed(2)}
              </div>
            </div>

            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '20px',
              lineHeight: '1.6',
              textAlign: 'center'
            }}>
              {t.reinvestDescription || 'Reinvest your referral earnings into an existing investment package to upgrade it'}
            </p>

            {investments && investments.length > 0 ? (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    fontSize: '13px', 
                    marginBottom: '12px',
                    fontWeight: '500'
                  }}>
                    {t.selectInvestment || 'Select Investment to Upgrade'}
                  </label>

                  {investments.map(inv => (
                    <div
                      key={inv.id}
                      onClick={() => setSelectedInvestmentId(inv.id)}
                      style={{
                        background: selectedInvestmentId === inv.id 
                          ? 'rgba(139, 92, 246, 0.2)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        border: selectedInvestmentId === inv.id 
                          ? '2px solid rgba(139, 92, 246, 0.5)' 
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        padding: '16px',
                        marginBottom: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onMouseOver={(e) => {
                        if (selectedInvestmentId !== inv.id) {
                          e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'
                          e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)'
                        }
                      }}
                      onMouseOut={(e) => {
                        if (selectedInvestmentId !== inv.id) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <div style={{ 
                          fontSize: '15px', 
                          fontWeight: '600', 
                          color: '#ffffff'
                        }}>
                          {inv.planName || inv.plan}
                        </div>
                        <div style={{ 
                          fontSize: '16px', 
                          fontWeight: '700', 
                          color: '#8b5cf6' 
                        }}>
                          ${Number(inv.amount).toFixed(2)}
                        </div>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        gap: '16px',
                        fontSize: '12px', 
                        color: 'rgba(255, 255, 255, 0.6)' 
                      }}>
                        <span>ROI: {Number(inv.roi || inv.effectiveROI)}%</span>
                        <span>Duration: {inv.duration} {t.months || 'months'}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {error && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px',
                    padding: '10px',
                    marginBottom: '16px',
                    color: '#ef4444',
                    fontSize: '12px'
                  }}>
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !selectedInvestmentId}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: (submitting || !selectedInvestmentId) 
                      ? 'rgba(139, 92, 246, 0.3)' 
                      : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    border: 'none',
                    borderRadius: '16px',
                    color: (submitting || !selectedInvestmentId) ? 'rgba(255, 255, 255, 0.4)' : '#ffffff',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: (submitting || !selectedInvestmentId) ? 'not-allowed' : 'pointer',
                    marginBottom: '12px',
                    transition: 'all 0.3s',
                    boxShadow: (submitting || !selectedInvestmentId) ? 'none' : '0 4px 12px rgba(139, 92, 246, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => {
                    if (!submitting && selectedInvestmentId) {
                      e.currentTarget.style.transform = 'scale(1.02)'
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.35)'
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.25)'
                  }}
                >
                  {submitting && <LoadingSpinner />}
                  {submitting ? (t.processing || 'Processing...') : `${t.confirmReinvest || 'Confirm Reinvest'} ($${availableAmount.toFixed(2)})`}
                </button>
              </>
            ) : (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
                color: '#ef4444',
                fontSize: '14px',
                marginBottom: '20px',
                lineHeight: '1.6'
              }}>
                {t.noInvestments || 'No active investments found. Please create an investment first before reinvesting.'}
              </div>
            )}

            <button
              onClick={onClose}
              disabled={submitting}
              style={{
                width: '100%',
                padding: '14px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '16px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                if (!submitting) {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'
                  e.currentTarget.style.color = '#8b5cf6'
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
              }}
            >
              {t.cancel || 'Cancel'}
            </button>
          </>
        ) : (
          <>
            <div style={{
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px', color: '#8b5cf6' }}>✓</div>
              <div style={{ fontSize: '16px', color: '#8b5cf6', fontWeight: '600', marginBottom: '12px' }}>
                {t.reinvestSuccess || 'Reinvestment Successful!'}
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
                {t.reinvestSuccessMessage || 'Your referral earnings have been successfully reinvested into your investment package.'}
              </div>
            </div>

            {reinvestResult && (
              <div style={{
                background: 'rgba(139, 92, 246, 0.08)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
                    {t.reinvestedAmount || 'Reinvested Amount'}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#8b5cf6' }}>
                    ${Number(reinvestResult.reinvestedAmount || availableAmount).toFixed(2)}
                  </div>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(139, 92, 246, 0.15)'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px', textTransform: 'uppercase' }}>
                      {t.previousAmount || 'Previous'}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.7)' }}>
                      ${Number(reinvestResult.oldAmount || 0).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px', textTransform: 'uppercase' }}>
                      {t.newAmount || 'New'}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#8b5cf6' }}>
                      ${Number(reinvestResult.newAmount || 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                {reinvestResult.upgraded && reinvestResult.activationDate && (
                  <div style={{
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(139, 92, 246, 0.15)',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    textAlign: 'center'
                  }}>
                    <div style={{ marginBottom: '6px' }}>
                      {t.packageUpgraded || 'Package Upgraded'}: {reinvestResult.oldPackage} → {reinvestResult.newPackage}
                    </div>
                    <div>
                      {t.roiActivationDate || 'New ROI activation'}: {new Date(reinvestResult.activationDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: '16px',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)'
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.35)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.25)'
              }}
            >
              {t.close || 'Close'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default ReinvestModal