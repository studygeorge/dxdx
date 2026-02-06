// dxcapai-app/src/app/profile/components/wallet/ReferralBonusWithdrawModal.js

'use client'
import React, { useState, useEffect, useRef } from 'react'

const ReferralBonusWithdrawModal = ({ 
  referral,
  bulkMode = false,
  totalAmount = 0,
  availableCount = 0,
  onClose, 
  onSubmit,
  trc20Address,
  setTrc20Address,
  error,
  success,
  submitting,
  t,
  isMobile
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [pendingWithdrawalId, setPendingWithdrawalId] = useState(null)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [withdrawalStatus, setWithdrawalStatus] = useState('PENDING')
  const intervalRef = useRef(null)

  if (!bulkMode && !referral) return null

  const commission = bulkMode ? totalAmount : Number(referral?.commission || 0)

  const checkWithdrawalStatus = async (withdrawalId) => {
    const token = localStorage.getItem('access_token')
    if (!token || !withdrawalId) return

    try {
      setCheckingStatus(true)

      const response = await fetch(`https://dxcapital-ai.com/api/v1/referrals/withdrawal-status/${withdrawalId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        
        if (result.success && result.data) {
          const newStatus = result.data.status
          setWithdrawalStatus(newStatus)

          if (newStatus === 'APPROVED' || newStatus === 'REJECTED') {
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to check withdrawal status:', error)
    } finally {
      setCheckingStatus(false)
    }
  }

  useEffect(() => {
    if (currentStep === 2 && pendingWithdrawalId && withdrawalStatus === 'PENDING') {
      checkWithdrawalStatus(pendingWithdrawalId)

      intervalRef.current = setInterval(() => {
        checkWithdrawalStatus(pendingWithdrawalId)
      }, 10000)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    }
  }, [currentStep, pendingWithdrawalId, withdrawalStatus])

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    const result = await onSubmit(e)
    
    if (result && result.success) {
      const withdrawalId = bulkMode 
        ? (result.data?.withdrawalIds?.[0] || result.withdrawalId)
        : (result.withdrawalId || result.referralWithdrawalId || result.data?.withdrawalId || result.data?.id)
      
      if (withdrawalId) {
        setPendingWithdrawalId(withdrawalId)
        setWithdrawalStatus('PENDING')
        setCurrentStep(2)
      }
    }
  }

  const handleClose = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setCurrentStep(1)
    setPendingWithdrawalId(null)
    setWithdrawalStatus('PENDING')
    setCheckingStatus(false)
    onClose()
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
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

        <div style={{
          fontSize: isMobile ? '11px' : '12px',
          color: 'rgba(45, 212, 191, 0.7)',
          marginBottom: '16px',
          letterSpacing: '-0.3px',
          fontWeight: '500'
        }}>
          {t.step || 'Step'} {currentStep} {t.of || 'of'} 2
        </div>

        {currentStep === 2 ? (
          <div>
            <h2 style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '20px',
              letterSpacing: '-0.8px'
            }}>
              {withdrawalStatus === 'APPROVED' ? (t.approved || 'Approved') : 
               withdrawalStatus === 'REJECTED' ? (t.rejected || 'Rejected') :
               (t.requestSubmitted || 'Request Submitted')}
            </h2>

            <div style={{
              background: withdrawalStatus === 'APPROVED' 
                ? 'rgba(45, 212, 191, 0.15)'
                : withdrawalStatus === 'REJECTED'
                ? 'rgba(239, 68, 68, 0.15)'
                : 'rgba(45, 212, 191, 0.1)',
              border: withdrawalStatus === 'APPROVED'
                ? '1px solid rgba(45, 212, 191, 0.3)'
                : withdrawalStatus === 'REJECTED'
                ? '1px solid rgba(239, 68, 68, 0.3)'
                : '1px solid rgba(45, 212, 191, 0.25)',
              borderRadius: '16px',
              padding: isMobile ? '20px' : '24px',
              marginBottom: '24px',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: isMobile ? '13px' : '14px',
              lineHeight: '1.6',
              letterSpacing: '-0.3px'
            }}>
              {withdrawalStatus === 'PENDING' ? (
                <>
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
                    <LoadingSpinner />
                    <span style={{ 
                      fontWeight: '600', 
                      color: '#2dd4bf',
                      fontSize: '15px'
                    }}>
                      {t.requestSentToSupport || 'Request Sent to Support'}
                    </span>
                  </div>
                  
                  <div style={{ 
                    textAlign: 'center',
                    lineHeight: '1.8',
                    color: 'rgba(255, 255, 255, 0.85)',
                    marginBottom: '12px'
                  }}>
                    {t.supportWillProcessRequest || 'Your withdrawal request has been submitted to support team. The bonus will be transferred to your account after verification.'}
                  </div>

                  <div style={{ 
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(45, 212, 191, 0.15)',
                    textAlign: 'center',
                    fontSize: '13px', 
                    color: 'rgba(45, 212, 191, 0.8)',
                    fontWeight: '500',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}>
                    {t.canCloseWindow || 'You can safely close this window'}
                  </div>
                </>
              ) : withdrawalStatus === 'APPROVED' ? (
                <>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#2dd4bf', 
                    marginBottom: '12px',
                    fontSize: '16px',
                    textAlign: 'center'
                  }}>
                    ✓ {t.approved || 'Approved'}
                  </div>
                  <div style={{ textAlign: 'center', lineHeight: '1.7' }}>
                    {t.bonusTransferred || 'Your referral bonus has been approved and will be transferred to your wallet shortly.'}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#ef4444', 
                    marginBottom: '12px',
                    fontSize: '16px',
                    textAlign: 'center'
                  }}>
                    ✕ {t.rejected || 'Rejected'}
                  </div>
                  <div style={{ textAlign: 'center', lineHeight: '1.7' }}>
                    {t.contactSupport || 'Your referral bonus withdrawal request has been rejected. Please contact support for more information.'}
                  </div>
                </>
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
                {bulkMode ? (t.totalAmount || 'Total Amount') : (t.referralBonus || 'Referral Bonus')}
              </div>
              <div style={{
                fontSize: isMobile ? '24px' : '28px',
                fontWeight: '700',
                color: '#2dd4bf',
                letterSpacing: '-1.2px'
              }}>
                ${commission.toFixed(2)}
              </div>
              {bulkMode && availableCount > 0 && (
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginTop: '6px'
                }}>
                  {availableCount} {t.withdrawals || 'withdrawals'}
                </div>
              )}
            </div>

            {trc20Address && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(45, 212, 191, 0.15)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{
                  fontSize: isMobile ? '11px' : '12px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '8px',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}>
                  {t.walletAddress || 'TRC-20 Address'}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#2dd4bf',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all'
                }}>
                  {trc20Address}
                </div>
              </div>
            )}

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
          <>
            <h2 style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '24px',
              letterSpacing: '-0.8px'
            }}>
              {bulkMode ? (t.bulkWithdrawTitle || 'Withdraw All Referral Profit') : (t.withdrawReferralBonus || 'Withdraw Referral Bonus')}
            </h2>

            <div style={{
              background: 'rgba(45, 212, 191, 0.08)',
              border: '1px solid rgba(45, 212, 191, 0.2)',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '20px'
            }}>
              {bulkMode ? (
                <>
                  <div style={{ 
                    fontSize: '13px', 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    marginBottom: '12px',
                    lineHeight: '1.6'
                  }}>
                    {t.bulkWithdrawDescription || 'All available referral earnings will be withdrawn to your wallet'}
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(45, 212, 191, 0.15)'
                  }}>
                    <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                      {t.totalAmount || 'Total Amount'}:
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#2dd4bf' }}>
                      ${commission.toFixed(2)}
                    </div>
                  </div>
                  {availableCount > 0 && (
                    <div style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginTop: '8px',
                      textAlign: 'center'
                    }}>
                      {availableCount} {t.availableEarnings || 'available earnings'}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                      {t.referralDetails || 'Referral Details'}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#2dd4bf', marginTop: '4px' }}>
                      {referral?.email || 'N/A'}
                    </div>
                  </div>
                  
                  <div style={{ borderTop: '1px solid rgba(45, 212, 191, 0.15)', paddingTop: '12px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      marginBottom: '8px'
                    }}>
                      <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                        {t.investmentAmount || 'Investment'}:
                      </div>
                      <div style={{ fontSize: '14px', color: '#2dd4bf', fontWeight: '500' }}>
                        ${Number(referral?.investmentAmount || 0).toFixed(2)}
                      </div>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      marginBottom: '8px'
                    }}>
                      <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                        {t.commission || 'Commission'}:
                      </div>
                      <div style={{ fontSize: '14px', color: '#2dd4bf', fontWeight: '600' }}>
                        ${commission.toFixed(2)}
                      </div>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                        {t.investmentDate || 'Investment Date'}:
                      </div>
                      <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                        {formatDate(referral?.investmentDate)}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                color: 'rgba(255, 255, 255, 0.7)', 
                fontSize: '13px', 
                marginBottom: '8px',
                fontWeight: '500',
                letterSpacing: '-0.3px'
              }}>
                {t.enterTRC20 || 'TRC-20 Wallet Address'}
              </label>
              <input
                type="text"
                value={trc20Address}
                onChange={(e) => setTrc20Address(e.target.value)}
                placeholder={t.trc20Placeholder || 'Enter your TRC-20 address'}
                required
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(45, 212, 191, 0.2)',
                  borderRadius: '16px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'monospace',
                  transition: 'all 0.3s',
                  letterSpacing: '-0.3px'
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

            {success && (
              <div style={{
                background: 'rgba(45, 212, 191, 0.15)',
                border: '1px solid rgba(45, 212, 191, 0.3)',
                borderRadius: '12px',
                padding: '10px 14px',
                marginBottom: '16px',
                color: '#2dd4bf',
                fontSize: '12px',
                letterSpacing: '-0.3px'
              }}>
                {success}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !trc20Address}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: (submitting || !trc20Address)
                    ? 'rgba(45, 212, 191, 0.3)' 
                    : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                  border: 'none',
                  borderRadius: '16px',
                  color: (submitting || !trc20Address)
                    ? 'rgba(255, 255, 255, 0.4)' 
                    : '#000000',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: (submitting || !trc20Address)
                    ? 'not-allowed' 
                    : 'pointer',
                  transition: 'all 0.3s',
                  letterSpacing: '-0.3px',
                  boxShadow: (submitting || !trc20Address)
                    ? 'none'
                    : '0 4px 12px rgba(45, 212, 191, 0.25)'
                }}
                onMouseOver={(e) => {
                  if (!submitting && trc20Address) {
                    e.currentTarget.style.transform = 'scale(1.02)'
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(45, 212, 191, 0.35)'
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 212, 191, 0.25)'
                }}
              >
                {submitting 
                  ? (t.processing || 'Processing...') 
                  : bulkMode 
                    ? `${t.confirmWithdrawal || 'Confirm Withdrawal'} ($${commission.toFixed(2)})`
                    : `${t.withdrawBonus || 'Withdraw Bonus'} ($${commission.toFixed(2)})`
                }
              </button>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              style={{
                width: '100%',
                padding: '14px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(45, 212, 191, 0.2)',
                borderRadius: '16px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                letterSpacing: '-0.3px'
              }}
              onMouseOver={(e) => {
                if (!submitting) {
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
          </>
        )}
      </div>
    </div>
  )
}

export default ReferralBonusWithdrawModal