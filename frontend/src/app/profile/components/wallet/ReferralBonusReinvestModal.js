'use client'
import React, { useState } from 'react'

const ReferralBonusReinvestModal = ({ 
  totalAmount = 0,
  availableCount = 0,
  onClose, 
  onSubmit,
  error,
  success,
  submitting,
  t,
  isMobile
}) => {
  const [currentStep, setCurrentStep] = useState(1)

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    const result = await onSubmit()
    
    if (result && result.success) {
      setCurrentStep(2)
    }
  }

  const handleClose = () => {
    setCurrentStep(1)
    onClose()
  }

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
        zIndex: 10000,
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
          border: '1px solid rgba(45, 212, 191, 0.3)',
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
          // Success Screen
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            {/* Success Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)',
              border: '2px solid rgba(45, 212, 191, 0.4)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 2s ease-in-out infinite',
              boxShadow: '0 0 30px rgba(45, 212, 191, 0.3)'
            }}>
              <div style={{
                fontSize: '40px',
                color: '#2dd4bf'
              }}>
                ✓
              </div>
            </div>

            <h2 style={{
              fontSize: isMobile ? '22px' : '24px',
              fontWeight: '700',
              color: '#ffffff',
              margin: '0 0 12px',
              letterSpacing: '-0.02em'
            }}>
              {t.reinvestSuccess || 'Бонусы реинвестированы!'}
            </h2>

            <p style={{
              fontSize: isMobile ? '15px' : '16px',
              color: 'rgba(255, 255, 255, 0.9)',
              margin: '0 0 8px',
              lineHeight: '1.5',
              fontWeight: '500'
            }}>
              {t.reinvestSuccessMessage || 'Ваши реферальные бонусы были успешно реинвестированы.'}
            </p>

            <p style={{
              fontSize: isMobile ? '13px' : '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              margin: '0 0 28px',
              lineHeight: '1.6'
            }}>
              {t.reinvestSuccessSubtext || 'Они будут добавлены к вашим активным инвестициям.'}
            </p>

            {/* Amount Info */}
            <div style={{
              background: 'rgba(45, 212, 191, 0.1)',
              border: '1px solid rgba(45, 212, 191, 0.25)',
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '28px'
            }}>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '8px',
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>
                {t.reinvestedAmount || 'Реинвестировано'}
              </div>
              <div style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#2dd4bf',
                letterSpacing: '-1.2px'
              }}>
                ${totalAmount.toFixed(2)}
              </div>
              {availableCount > 0 && (
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginTop: '6px'
                }}>
                  {availableCount} {t.bonuses || 'бонусов'}
                </div>
              )}
            </div>

            <button
              onClick={handleClose}
              style={{
                width: '100%',
                padding: '14px 24px',
                background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#000000',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 0 30px rgba(45, 212, 191, 0.4)',
                transition: 'all 0.3s',
                letterSpacing: '0.02em'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)'
                e.target.style.boxShadow = '0 0 40px rgba(45, 212, 191, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
                e.target.style.boxShadow = '0 0 30px rgba(45, 212, 191, 0.4)'
              }}
            >
              {t.gotIt || 'Понятно!'}
            </button>

            <style jsx>{`
              @keyframes pulse {
                0%, 100% {
                  transform: scale(1);
                  box-shadow: 0 0 30px rgba(45, 212, 191, 0.3);
                }
                50% {
                  transform: scale(1.05);
                  box-shadow: 0 0 40px rgba(45, 212, 191, 0.5);
                }
              }
            `}</style>
          </div>
        ) : (
          // Confirmation Form
          <>
            <h2 style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '24px',
              letterSpacing: '-0.8px'
            }}>
              {t.reinvestBonusesTitle || 'Реинвестировать бонусы'}
            </h2>

            <div style={{
              background: 'rgba(45, 212, 191, 0.08)',
              border: '1px solid rgba(45, 212, 191, 0.2)',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '20px'
            }}>
              <div style={{ 
                fontSize: '13px', 
                color: 'rgba(255, 255, 255, 0.7)', 
                marginBottom: '12px',
                lineHeight: '1.6'
              }}>
                {t.reinvestDescription || 'Все доступные реферальные бонусы будут реинвестированы в ваши активные инвестиции'}
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '12px',
                borderTop: '1px solid rgba(45, 212, 191, 0.15)'
              }}>
                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {t.totalAmount || 'Общая сумма'}:
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#2dd4bf' }}>
                  ${totalAmount.toFixed(2)}
                </div>
              </div>
              {availableCount > 0 && (
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginTop: '8px',
                  textAlign: 'center'
                }}>
                  {availableCount} {t.availableBonuses || 'доступных бонусов'}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div style={{
              background: 'rgba(45, 212, 191, 0.05)',
              border: '1px solid rgba(45, 212, 191, 0.15)',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.6'
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#2dd4bf', fontWeight: '600' }}>•</span> {t.reinvestBenefit1 || 'Бонусы увеличат ваш капитал'}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#2dd4bf', fontWeight: '600' }}>•</span> {t.reinvestBenefit2 || 'Получайте дополнительный доход'}
                </div>
                <div>
                  <span style={{ color: '#2dd4bf', fontWeight: '600' }}>•</span> {t.reinvestBenefit3 || 'Не требуется адрес кошелька'}
                </div>
              </div>
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
                disabled={submitting || totalAmount <= 0}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: (submitting || totalAmount <= 0)
                    ? 'rgba(45, 212, 191, 0.3)' 
                    : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                  border: 'none',
                  borderRadius: '16px',
                  color: (submitting || totalAmount <= 0)
                    ? 'rgba(255, 255, 255, 0.4)' 
                    : '#000000',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: (submitting || totalAmount <= 0)
                    ? 'not-allowed' 
                    : 'pointer',
                  transition: 'all 0.3s',
                  letterSpacing: '-0.3px',
                  boxShadow: (submitting || totalAmount <= 0)
                    ? 'none'
                    : '0 4px 12px rgba(45, 212, 191, 0.25)'
                }}
                onMouseOver={(e) => {
                  if (!submitting && totalAmount > 0) {
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
                  ? (t.processing || 'Обработка...') 
                  : `${t.confirmReinvest || 'Подтвердить реинвест'} ($${totalAmount.toFixed(2)})`
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
              {t.cancel || 'Отмена'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default ReferralBonusReinvestModal
