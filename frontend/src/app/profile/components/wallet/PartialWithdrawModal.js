'use client'
import React, { useState, useEffect } from 'react';

const PartialWithdrawModal = ({ 
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
  const [withdrawType, setWithdrawType] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState('');

  if (!investment) return null;

  const availableProfit = investment.availableProfit || 0;
  const bonusAmount = investment.bonusAmount ? parseFloat(investment.bonusAmount) : 0;
  
  const isEligibleForBonus = investment.duration >= 6;
  const hasBonusInfo = bonusAmount > 0 && isEligibleForBonus;
  
  const isBonusUnlocked = investment.isBonusUnlocked || 
    (investment.bonusUnlockedAt && new Date(investment.bonusUnlockedAt) <= new Date());
  const isBonusWithdrawn = investment.bonusWithdrawn;

  const handleSubmit = async (e, type) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const result = await onSubmit(e, type, type === 'profit' ? parseFloat(customAmount) : undefined);
    
    if (result && result.success) {
      setWithdrawType(type);
      setWithdrawAmount(type === 'profit' ? parseFloat(customAmount) : bonusAmount);
      setCurrentStep(2);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setWithdrawType(null);
    setWithdrawAmount(0);
    setCustomAmount('');
    onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleMaxClick = () => {
    setCustomAmount(availableProfit.toFixed(2));
  };

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
  );

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
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
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

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
          handleClose();
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
            e.currentTarget.style.background = 'rgba(45, 212, 191, 0.15)';
            e.currentTarget.style.color = '#2dd4bf';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
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
              {t.requestSubmitted || 'Request Submitted'}
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
                {withdrawType === 'profit' 
                  ? (t.profitWithdrawPending || 'Your profit withdrawal request has been submitted to support team. The funds will be transferred to your account after verification.')
                  : (t.bonusWithdrawPending || 'Your bonus withdrawal request has been submitted to support team. The bonus will be transferred to your account after verification.')}
              </div>

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
                ⏱ {t.processingTime72h || 'Processing time: up to 72 hours'}
              </div>
            </div>

            <div style={{
              background: withdrawType === 'profit' 
                ? 'rgba(16, 185, 129, 0.08)'
                : 'rgba(45, 212, 191, 0.08)',
              border: withdrawType === 'profit'
                ? '1px solid rgba(16, 185, 129, 0.2)'
                : '1px solid rgba(45, 212, 191, 0.2)',
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
                {withdrawType === 'profit' 
                  ? (t.profitWithdrawal || 'Profit Withdrawal') 
                  : (t.bonusWithdrawal || 'Bonus Withdrawal')}
              </div>
              <div style={{
                fontSize: isMobile ? '24px' : '28px',
                fontWeight: '700',
                color: withdrawType === 'profit' ? '#10b981' : '#2dd4bf',
                letterSpacing: '-1.2px'
              }}>
                ${withdrawAmount.toFixed(2)}
              </div>
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
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(45, 212, 191, 0.35)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 212, 191, 0.25)';
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
              {t.partialWithdrawal || 'Partial Withdrawal'}
            </h2>

            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '20px'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {t.investmentDetails || 'Investment Details'}
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginTop: '4px' }}>
                  {investment.planName}
                </div>
              </div>
              
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '12px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '8px'
                }}>
                  <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                    {t.available || 'Available'}:
                  </div>
                  <div style={{ fontSize: '14px', color: '#10b981', fontWeight: '500' }}>
                    ${availableProfit.toFixed(2)}
                  </div>
                </div>

                {hasBonusInfo && isBonusUnlocked && !isBonusWithdrawn && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '8px'
                  }}>
                    <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                      {t.durationBonus || 'Duration Bonus'}:
                    </div>
                    <div style={{ fontSize: '14px', color: '#2dd4bf', fontWeight: '500' }}>
                      ${bonusAmount.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {hasBonusInfo && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '20px'
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '6px',
                  letterSpacing: '-0.3px'
                }}>
                  {t.durationBonus || 'Duration Bonus'}: ${bonusAmount.toFixed(2)}
                </div>
                
                {isBonusWithdrawn ? (
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.5)'
                  }}>
                    {t.bonusWithdrawn || 'Bonus already withdrawn'}
                  </div>
                ) : isBonusUnlocked ? (
                  <div style={{
                    fontSize: '11px',
                    color: '#2dd4bf'
                  }}>
                    {t.bonusAvailable || 'Bonus available for withdrawal'}
                  </div>
                ) : (
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.5)'
                  }}>
                    {t.availableFrom || 'Available from'} {formatDate(investment.bonusUnlockedAt)}
                  </div>
                )}
              </div>
            )}

            {bonusAmount > 0 && !isEligibleForBonus && (
              <div style={{
                background: 'rgba(255, 193, 7, 0.1)',
                border: '1px solid rgba(255, 193, 7, 0.3)',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '20px'
              }}>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255, 193, 7, 0.9)',
                  lineHeight: '1.5'
                }}>
                  {t.bonusNotEligible || 'Duration bonus is only available for investments initially created for 6 or 12 months'}
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
                  e.target.style.borderColor = 'rgba(45, 212, 191, 0.5)';
                  e.target.style.background = 'rgba(0, 0, 0, 0.4)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(45, 212, 191, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(45, 212, 191, 0.2)';
                  e.target.style.background = 'rgba(0, 0, 0, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
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
                {t.withdrawAmount || 'Withdrawal Amount'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max={availableProfit}
                  disabled={submitting}
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
                    e.target.style.borderColor = 'rgba(45, 212, 191, 0.5)';
                    e.target.style.background = 'rgba(0, 0, 0, 0.4)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(45, 212, 191, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(45, 212, 191, 0.2)';
                    e.target.style.background = 'rgba(0, 0, 0, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={handleMaxClick}
                  disabled={submitting}
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
                    if (!submitting) e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                >
                  MAX
                </button>
              </div>
              {parseFloat(customAmount) > availableProfit && (
                <div style={{
                  fontSize: '11px',
                  color: '#ef4444',
                  marginTop: '6px'
                }}>
                  {t.insufficientProfit || 'Insufficient available profit'}
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
                onClick={(e) => handleSubmit(e, 'profit')}
                disabled={submitting || !trc20Address || !customAmount || parseFloat(customAmount) <= 0 || parseFloat(customAmount) > availableProfit}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: (submitting || !trc20Address || !customAmount || parseFloat(customAmount) <= 0 || parseFloat(customAmount) > availableProfit)
                    ? 'rgba(16, 185, 129, 0.3)' 
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: '16px',
                  color: (submitting || !trc20Address || !customAmount || parseFloat(customAmount) <= 0 || parseFloat(customAmount) > availableProfit)
                    ? 'rgba(255, 255, 255, 0.4)' 
                    : '#000000',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: (submitting || !trc20Address || !customAmount || parseFloat(customAmount) <= 0 || parseFloat(customAmount) > availableProfit)
                    ? 'not-allowed' 
                    : 'pointer',
                  transition: 'all 0.3s',
                  letterSpacing: '-0.3px',
                  boxShadow: (submitting || !trc20Address || !customAmount || parseFloat(customAmount) <= 0 || parseFloat(customAmount) > availableProfit)
                    ? 'none'
                    : '0 4px 12px rgba(16, 185, 129, 0.25)'
                }}
                onMouseOver={(e) => {
                  if (!submitting && trc20Address && customAmount && parseFloat(customAmount) > 0 && parseFloat(customAmount) <= availableProfit) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.35)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.25)';
                }}
              >
                {submitting ? (t.processing || 'Processing...') : (t.withdrawProfit || 'Withdraw Profit')}
              </button>

              {hasBonusInfo && isBonusUnlocked && !isBonusWithdrawn && (
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'bonus')}
                  disabled={submitting || !trc20Address}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: (submitting || !trc20Address)
                      ? 'rgba(45, 212, 191, 0.3)' 
                      : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                    border: 'none',
                    borderRadius: '16px',
                    color: (submitting || !trc20Address)
                      ? 'rgba(255, 255, 255, 0.4)' 
                      : '#000000',
                    fontSize: '14px',
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
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(45, 212, 191, 0.35)';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 212, 191, 0.25)';
                  }}
                >
                  {submitting ? (t.processing || 'Processing...') : `${t.withdrawBonus || 'Withdraw Bonus'} ($${bonusAmount.toFixed(2)})`}
                </button>
              )}
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
                  e.currentTarget.style.background = 'rgba(45, 212, 191, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.3)';
                  e.currentTarget.style.color = '#2dd4bf';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.2)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
              }}
            >
              {t.cancel || 'Cancel'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PartialWithdrawModal;
