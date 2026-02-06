// frontend/src/components/wallet/WithdrawModal.jsx

import React, { useState } from 'react';
import { formatCurrency } from './calculations';

export default function WithdrawModal({ 
  investment, 
  onClose, 
  onSubmit, 
  trc20Address, 
  setTrc20Address, 
  error, 
  success, 
  submitting, 
  durationBonuses, 
  t, 
  isMobile 
}) {
  // Шаги: 1 = форма, 2 = подтверждение
  const [currentStep, setCurrentStep] = useState(1);
  const [withdrawalId, setWithdrawalId] = useState(null);
  const [submittedData, setSubmittedData] = useState({
    totalAmount: 0,
    principal: 0,
    interest: 0,
    termBonus: 0
  });

  // Если бонус уже выведен, используем 0, иначе берем из настроек срока
  const isBonusWithdrawn = investment.bonusWithdrawn || false;
  const termBonus = isBonusWithdrawn ? 0 : (durationBonuses[investment.duration]?.cashBonus || 0);
  
  // ✅ ИСПРАВЛЕНО: используем expectedReturn вместо totalReturn
  const interestProfit = parseFloat(investment.expectedReturn) - parseFloat(investment.amount) - termBonus;
  const totalAmount = parseFloat(investment.amount) + interestProfit + termBonus;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!trc20Address) {
      return;
    }

    const result = await onSubmit(e);

    // Проверяем успешность и переходим на шаг 2
    if (result && result.success) {
      // Сохраняем данные для показа на шаге 2
      setSubmittedData({
        totalAmount: totalAmount,
        principal: parseFloat(investment.amount),
        interest: interestProfit,
        termBonus: termBonus
      });
      setWithdrawalId(result.withdrawalId || result.id || null);
      setCurrentStep(2);
    }
  };

  const handleCloseSuccess = () => {
    onClose();
    window.location.reload();
  };

  return (
    <div style={{
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
    }} onClick={currentStep === 1 ? onClose : undefined}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '32px',
        padding: isMobile ? '28px 20px' : '36px 32px',
        maxWidth: '500px',
        width: '100%',
        position: 'relative'
      }} onClick={(e) => e.stopPropagation()}>
        {currentStep === 1 && (
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
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        )}

        {currentStep === 2 ? (
          /* Step 2 - Confirmation */
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px',
              color: '#000000'
            }}>
              ✓
            </div>

            <h2 style={{
              fontSize: isMobile ? '22px' : '26px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '12px'
            }}>
              {t.requestSubmitted || 'Request Submitted!'}
            </h2>

            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '28px',
              lineHeight: '1.6'
            }}>
              {t.withdrawalRequestMessage || 'Your withdrawal request has been submitted successfully. Our admin will review and process it shortly.'}
            </p>

            <div style={{
              background: 'rgba(45, 212, 191, 0.1)',
              border: '1px solid rgba(45, 212, 191, 0.3)',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '28px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {t.principal || 'Principal'}:
                </span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>
                  {formatCurrency(submittedData.principal)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {t.interest || 'Interest'}:
                </span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>
                  +{formatCurrency(submittedData.interest)}
                </span>
              </div>
              {submittedData.termBonus > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                    {t.termBonus || 'Term Bonus'}:
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#2dd4bf' }}>
                    +{formatCurrency(submittedData.termBonus)}
                  </span>
                </div>
              )}
              <div style={{ 
                borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
                paddingTop: '10px',
                marginTop: '10px',
                display: 'flex', 
                justifyContent: 'space-between' 
              }}>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {t.total || 'Total'}:
                </span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#2dd4bf' }}>
                  {formatCurrency(submittedData.totalAmount)}
                </span>
              </div>
              <div style={{ 
                marginTop: '10px',
                paddingTop: '10px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex', 
                justifyContent: 'space-between' 
              }}>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {t.trc20Address || 'TRC-20 Address'}:
                </span>
              </div>
              <div style={{ 
                fontSize: '12px', 
                fontWeight: '500', 
                color: '#2dd4bf',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                marginTop: '4px'
              }}>
                {trc20Address}
              </div>
            </div>

            <button
              onClick={handleCloseSuccess}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                border: 'none',
                borderRadius: '16px',
                color: '#000000',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {t.close || 'Close'}
            </button>
          </div>
        ) : (
          /* Step 1 - Form */
          <>
            <h2 style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '24px'
            }}>
              {t.withdrawTitle}
            </h2>

            <div style={{
              background: 'rgba(45, 212, 191, 0.08)',
              border: '1px solid rgba(45, 212, 191, 0.2)',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
                {t.withdrawalDetails}
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
                  {t.principal}:
                </div>
                <div style={{ fontSize: '14px', color: '#10b981', fontWeight: '500' }}>
                  {formatCurrency(investment.amount)}
                </div>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
                  {t.interest}:
                </div>
                <div style={{ fontSize: '14px', color: '#10b981', fontWeight: '500' }}>
                  +{formatCurrency(interestProfit)}
                </div>
              </div>

              {termBonus > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
                    {t.termBonus}:
                  </div>
                  <div style={{ fontSize: '14px', color: '#2dd4bf', fontWeight: '500' }}>
                    +{formatCurrency(termBonus)}
                  </div>
                </div>
              )}

              {isBonusWithdrawn && (
                <div style={{ 
                  marginBottom: '8px',
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
                    {t.termBonus}:
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}>
                    {t.bonusAlreadyWithdrawn || 'Bonus already withdrawn'}
                  </div>
                </div>
              )}

              <div style={{ 
                borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
                paddingTop: '12px',
                marginTop: '12px'
              }}>
                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
                  {t.total}:
                </div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#2dd4bf' }}>
                  {formatCurrency(totalAmount)}
                </div>
              </div>

              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '8px' }}>
                {investment.planName}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', marginBottom: '8px' }}>
                  {t.enterTRC20}
                </label>
                <input
                  type="text"
                  value={trc20Address}
                  onChange={(e) => setTrc20Address(e.target.value)}
                  placeholder={t.trc20Placeholder}
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
                    fontFamily: 'monospace'
                  }}
                />
              </div>

              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '20px',
                fontSize: '12px',
                color: '#10b981'
              }}>
                {t.trc20Warning}
              </div>

              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '20px' }}>
                {t.withdrawalInstructions}
              </div>

              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  color: '#ef4444',
                  fontSize: '12px'
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
                  fontSize: '12px'
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
                    background: (submitting || !trc20Address) ? 'rgba(45, 212, 191, 0.3)' : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                    border: 'none',
                    borderRadius: '16px',
                    color: (submitting || !trc20Address) ? 'rgba(0, 0, 0, 0.5)' : '#000000',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: (submitting || !trc20Address) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? t.processing : t.submitWithdraw}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  style={{
                    padding: '14px 24px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
