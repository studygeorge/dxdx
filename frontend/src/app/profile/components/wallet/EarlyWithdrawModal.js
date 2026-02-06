// components/modals/EarlyWithdrawModal.jsx

import React, { useState } from 'react';

const EarlyWithdrawModal = ({ 
  investment, 
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
  const [currentStep, setCurrentStep] = useState(1);
  const [pendingWithdrawalId, setPendingWithdrawalId] = useState(null);

  if (!investment) return null;

  const calculateEarlyWithdrawalAmount = () => {
    return investment.amount - (investment.withdrawnProfits || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await onSubmit(e);
    
    // ✅ ИСПРАВЛЕНИЕ: Проверяем оба варианта названия поля
    if (result && result.success) {
      const withdrawalId = result.earlyWithdrawalId || result.withdrawalId || result.data?.earlyWithdrawalId;
      setPendingWithdrawalId(withdrawalId);
      setCurrentStep(2);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setPendingWithdrawalId(null);
    onClose();
  };

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
        if (currentStep === 2 && e.target === e.currentTarget) {
          handleClose()
        }
      }}
    >
      <div 
        style={{
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '32px',
          padding: isMobile ? '28px 20px' : '36px 32px',
          maxWidth: '500px',
          width: '100%',
          position: 'relative'
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
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.color = '#ffffff'
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
          color: 'rgba(255, 255, 255, 0.5)',
          marginBottom: '16px',
          letterSpacing: '-0.3px'
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
              {t.requestSubmitted || 'Request Submitted'}
            </h2>

            <div style={{
              background: 'rgba(45, 212, 191, 0.15)',
              border: '1px solid rgba(45, 212, 191, 0.3)',
              borderRadius: '16px',
              padding: isMobile ? '16px' : '20px',
              marginBottom: '20px',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: isMobile ? '13px' : '14px',
              lineHeight: '1.6',
              letterSpacing: '-0.3px'
            }}>
              {t.earlyWithdrawPending || 'Your early withdrawal request has been submitted. Admin will review and process your request within 30 minutes.'}
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: isMobile ? '11px' : '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '8px'
              }}>
                {t.withdrawalAmount || 'Withdrawal Amount'}
              </div>
              <div style={{
                fontSize: isMobile ? '20px' : '24px',
                fontWeight: '600',
                color: '#2dd4bf',
                letterSpacing: '-1px'
              }}>
                ${calculateEarlyWithdrawalAmount().toLocaleString()}
              </div>
            </div>

            <button
              onClick={handleClose}
              style={{
                width: '100%',
                padding: isMobile ? '12px' : '14px',
                background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                border: 'none',
                borderRadius: '16px',
                color: '#000000',
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                letterSpacing: '-0.3px'
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
              {t.earlyWithdrawal || 'Early Withdrawal'}
            </h2>

            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '20px'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {t.earlyWithdrawWarning || 'Warning'}
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#ef4444' }}>
                  ⚠️ First 30 days only
                </div>
              </div>
              
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '12px' }}>
                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px' }}>
                  {t.calculatedReturn || 'Calculation'}
                </div>
                
                <div style={{ fontSize: '12px', color: '#10b981', marginBottom: '4px' }}>
                  {t.originalAmount || 'Original Amount'}: ${investment.amount}
                </div>
                
                {investment.withdrawnProfits > 0 && (
                  <div style={{ fontSize: '12px', color: '#ef4444', marginBottom: '4px' }}>
                    {t.withdrawnProfits || 'Already Withdrawn'}: -${investment.withdrawnProfits}
                  </div>
                )}
                
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#2dd4bf', 
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  {t.youWillReceive || 'You Will Receive'}: ${calculateEarlyWithdrawalAmount()}
                </div>
              </div>
              
              <div style={{
                marginTop: '12px',
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '10px',
                fontSize: '11px',
                color: '#ef4444'
              }}>
                ⚠️ <b>{t.earlyWithdrawPenalty || 'Penalty'}:</b> All accrued interest is forfeited.
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  fontSize: '13px', 
                  marginBottom: '8px',
                  fontWeight: '500',
                  letterSpacing: '-0.3px'
                }}>
                  {t.walletAddress || 'TRC-20 Wallet Address'}
                </label>
                <input
                  type="text"
                  value={trc20Address}
                  onChange={(e) => setTrc20Address(e.target.value)}
                  placeholder={t.enterWalletAddress || 'Enter your TRC-20 address'}
                  required
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
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
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'
                    e.target.style.background = 'rgba(0, 0, 0, 0.3)'
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

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  disabled={submitting || !trc20Address}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: (submitting || !trc20Address) 
                      ? 'rgba(45, 212, 191, 0.3)' 
                      : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                    border: 'none',
                    borderRadius: '16px',
                    color: (submitting || !trc20Address) 
                      ? 'rgba(0, 0, 0, 0.5)' 
                      : '#000000',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: (submitting || !trc20Address) 
                      ? 'not-allowed' 
                      : 'pointer',
                    transition: 'all 0.3s',
                    letterSpacing: '-0.3px'
                  }}
                  onMouseOver={(e) => {
                    if (!submitting && trc20Address) {
                      e.currentTarget.style.transform = 'scale(1.02)'
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(45, 212, 191, 0.3)'
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {submitting ? (t.processing || 'Processing...') : (t.confirmWithdraw || 'Confirm Withdrawal')}
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  style={{
                    padding: '14px 24px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
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
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                      e.currentTarget.style.color = '#ffffff'
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
                  }}
                >
                  {t.cancel || 'Cancel'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default EarlyWithdrawModal;