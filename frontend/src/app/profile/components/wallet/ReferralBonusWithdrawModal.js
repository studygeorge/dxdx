'use client'
import React, { useState, useEffect, useRef } from 'react'

const ReferralBonusWithdrawModal = ({ 
  referral,
  bulkMode = false,
  totalAmount = 0,
  availableAmount = 0,
  totalCount = 0,
  availableCount = 0,
  onClose, 
  onSubmit,
  trc20Address,
  setTrc20Address,
  error,
  success,
  submitting,
  isPending = false,
  language = 'en',
  isMobile
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [pendingWithdrawalId, setPendingWithdrawalId] = useState(null)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [withdrawalStatus, setWithdrawalStatus] = useState('PENDING')
  const intervalRef = useRef(null)

  const translations = {
    en: {
      title: bulkMode ? 'Withdraw All Referral Profit' : 'Withdraw Referral Bonus',
      subtitle: bulkMode 
        ? 'Withdraw all available referral earnings to your TRC-20 wallet' 
        : 'Withdraw this referral bonus to your TRC-20 wallet',
      totalAvailable: 'Total Available',
      availableToWithdraw: 'available to withdraw',
      from: 'From',
      referrals: 'referrals',
      benefits: [
        'Fast processing (24-48 hours)',
        'No withdrawal fees',
        'Secure TRC-20 transfer'
      ],
      trc20AddressLabel: 'Your TRC-20 Wallet Address',
      trc20Placeholder: 'Enter your TRC-20 address (e.g. TXxx...)',
      submitButton: 'Submit Withdrawal Request',
      cancelButton: 'Cancel',
      step2Title: 'Step 2: Request Status',
      checkingStatus: 'Checking withdrawal status...',
      statusPending: 'PENDING - Waiting for admin approval',
      statusApproved: 'APPROVED - Funds will be sent shortly',
      statusRejected: 'REJECTED - Please contact support',
      nextCheck: 'Next check in 10 seconds...',
      successTitle: 'Request Submitted!',
      successMessage: 'Your withdrawal request has been submitted successfully.',
      successSubtext: 'An admin will review and process it within 24-48 hours.',
      gotItButton: 'Got it!',
      referralDetails: 'Referral Details',
      userEmail: 'User Email',
      investmentAmount: 'Investment Amount',
      commission: 'Your Commission',
      investmentDate: 'Investment Date'
    },
    ru: {
      title: bulkMode ? 'Вывести все реферальные бонусы' : 'Вывести реферальный бонус',
      subtitle: bulkMode 
        ? 'Выведите все доступные реферальные бонусы на ваш TRC-20 кошелёк' 
        : 'Выведите этот реферальный бонус на ваш TRC-20 кошелёк',
      totalAvailable: 'Общая сумма',
      availableToWithdraw: 'доступно к выводу',
      from: 'От',
      referrals: 'рефералов',
      benefits: [
        'Быстрая обработка (24-48 часов)',
        'Без комиссии за вывод',
        'Безопасный перевод TRC-20'
      ],
      trc20AddressLabel: 'Ваш TRC-20 адрес кошелька',
      trc20Placeholder: 'Введите TRC-20 адрес (например TXxx...)',
      submitButton: 'Отправить заявку на вывод',
      cancelButton: 'Отмена',
      step2Title: 'Шаг 2: Статус заявки',
      checkingStatus: 'Проверка статуса вывода...',
      statusPending: 'ОЖИДАНИЕ - Ожидание одобрения администратором',
      statusApproved: 'ОДОБРЕНО - Средства будут отправлены в ближайшее время',
      statusRejected: 'ОТКЛОНЕНО - Пожалуйста, свяжитесь с поддержкой',
      nextCheck: 'Следующая проверка через 10 секунд...',
      successTitle: 'Заявка отправлена!',
      successMessage: 'Ваша заявка на вывод была успешно отправлена.',
      successSubtext: 'Администратор рассмотрит и обработает её в течение 24-48 часов.',
      gotItButton: 'Понятно!',
      referralDetails: 'Детали реферала',
      userEmail: 'Email пользователя',
      investmentAmount: 'Сумма инвестиции',
      commission: 'Ваша комиссия',
      investmentDate: 'Дата инвестиции'
    }
  }

  const t = translations[language] || translations.en

  if (!bulkMode && !referral) return null

  const commission = bulkMode ? availableAmount : Number(referral?.commission || 0)

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
      if (result.data && result.data.withdrawalId) {
        setPendingWithdrawalId(result.data.withdrawalId)
      } else if (result.data && result.data.withdrawalIds && result.data.withdrawalIds.length > 0) {
        setPendingWithdrawalId(result.data.withdrawalIds[0])
      }
      setCurrentStep(2)
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
    setTrc20Address('')
    onClose()
  }

  const getStatusMessage = () => {
    switch (withdrawalStatus) {
      case 'PENDING':
        return t.statusPending
      case 'APPROVED':
        return t.statusApproved
      case 'REJECTED':
        return t.statusRejected
      default:
        return t.statusPending
    }
  }

  const getStatusColor = () => {
    switch (withdrawalStatus) {
      case 'APPROVED':
        return '#10b981'
      case 'REJECTED':
        return '#ef4444'
      default:
        return '#fbbf24'
    }
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
        zIndex: 99999,
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
          maxWidth: '580px',
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
            transition: 'all 0.3s',
            zIndex: 1
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
          withdrawalStatus === 'APPROVED' ? (
            // Success Screen
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 24px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
                border: '2px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 2s ease-in-out infinite',
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)'
              }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>✓</div>
              </div>

              <h2 style={{
                fontSize: isMobile ? '22px' : '24px',
                fontWeight: '700',
                color: '#ffffff',
                margin: '0 0 12px',
                letterSpacing: '-0.02em'
              }}>
                {t.successTitle}
              </h2>

              <p style={{
                fontSize: isMobile ? '15px' : '16px',
                color: 'rgba(255, 255, 255, 0.9)',
                margin: '0 0 8px',
                lineHeight: '1.5',
                fontWeight: '500'
              }}>
                {t.successMessage}
              </p>

              <p style={{
                fontSize: isMobile ? '13px' : '14px',
                color: 'rgba(255, 255, 255, 0.6)',
                margin: '0',
                lineHeight: '1.4'
              }}>
                {t.successSubtext}
              </p>

              <button
                onClick={handleClose}
                style={{
                  marginTop: '32px',
                  padding: '14px 32px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: '24px',
                  color: '#000000',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                {t.gotItButton}
              </button>
            </div>
          ) : (
            // Status Checking Screen
            <div style={{ padding: '20px 0' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  margin: '0 auto 16px',
                  background: `linear-gradient(135deg, rgba(${withdrawalStatus === 'APPROVED' ? '16, 185, 129' : withdrawalStatus === 'REJECTED' ? '239, 68, 68' : '251, 191, 36'}, 0.2) 0%, rgba(${withdrawalStatus === 'APPROVED' ? '5, 150, 105' : withdrawalStatus === 'REJECTED' ? '220, 38, 38' : '245, 158, 11'}, 0.2) 100%)`,
                  border: `2px solid ${getStatusColor()}40`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {checkingStatus ? (
                    <div style={{
                      width: '24px',
                      height: '24px',
                      border: `2px solid ${getStatusColor()}40`,
                      borderTopColor: getStatusColor(),
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                  ) : (
                    <span style={{ fontSize: '24px' }}>
                      {withdrawalStatus === 'APPROVED' ? '✓' : withdrawalStatus === 'REJECTED' ? '×' : '⏳'}
                    </span>
                  )}
                </div>

                <h2 style={{
                  fontSize: isMobile ? '20px' : '22px',
                  fontWeight: '700',
                  color: '#ffffff',
                  margin: '0 0 8px',
                  letterSpacing: '-0.02em'
                }}>
                  {t.step2Title}
                </h2>

                <p style={{
                  fontSize: isMobile ? '13px' : '14px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  margin: 0
                }}>
                  {checkingStatus ? t.checkingStatus : t.nextCheck}
                </p>
              </div>

              {/* Status Display */}
              <div style={{
                background: `${getStatusColor()}15`,
                border: `1px solid ${getStatusColor()}40`,
                borderRadius: '20px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: `${getStatusColor()}25`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px'
                  }}>
                    {withdrawalStatus === 'APPROVED' ? '✓' : withdrawalStatus === 'REJECTED' ? '×' : '⏳'}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '13px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginBottom: '2px'
                    }}>
                      {language === 'ru' ? 'Статус:' : 'Status:'}
                    </div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: getStatusColor()
                    }}>
                      {withdrawalStatus}
                    </div>
                  </div>
                </div>

                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  {getStatusMessage()}
                </p>
              </div>

              {/* Amount Info */}
              <div style={{
                background: 'rgba(45, 212, 191, 0.1)',
                border: '1px solid rgba(45, 212, 191, 0.3)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '4px'
                }}>
                  {language === 'ru' ? 'Сумма вывода:' : 'Withdrawal Amount:'}
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#2dd4bf'
                }}>
                  ${commission.toFixed(2)} USDT
                </div>
              </div>

              {/* Close Button */}
              {(withdrawalStatus === 'APPROVED' || withdrawalStatus === 'REJECTED') && (
                <button
                  onClick={handleClose}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                    border: 'none',
                    borderRadius: '24px',
                    color: '#000000',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(45, 212, 191, 0.4)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {t.gotItButton}
                </button>
              )}
            </div>
          )
        ) : (
          // Step 1: Withdrawal Form
          <>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 16px',
                background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)',
                border: '2px solid rgba(45, 212, 191, 0.4)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#2dd4bf' }}>$</div>
              </div>

              <h2 style={{
                fontSize: isMobile ? '20px' : '22px',
                fontWeight: '700',
                color: '#ffffff',
                margin: '0 0 8px',
                letterSpacing: '-0.02em'
              }}>
                {t.title}
              </h2>

              <p style={{
                fontSize: isMobile ? '13px' : '14px',
                color: 'rgba(255, 255, 255, 0.6)',
                margin: 0,
                lineHeight: '1.4'
              }}>
                {t.subtitle}
              </p>
            </div>

            {/* Available Amount Box */}
            <div style={{
              background: 'rgba(45, 212, 191, 0.1)',
              border: '1px solid rgba(45, 212, 191, 0.3)',
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <div style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                {t.totalAvailable}:
              </div>
              <div style={{
                fontSize: isMobile ? '28px' : '32px',
                fontWeight: '700',
                color: '#2dd4bf',
                marginBottom: '12px',
                letterSpacing: '-0.02em'
              }}>
                ${commission.toFixed(2)} USDT
              </div>
              {bulkMode && (
                <div style={{
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    background: 'rgba(45, 212, 191, 0.2)',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    color: '#2dd4bf'
                  }}>
                    {availableCount}/{totalCount}
                  </span>
                  <span>{t.availableToWithdraw}</span>
                </div>
              )}
            </div>

            {/* Referral Details (if not bulk) */}
            {!bulkMode && referral && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '12px',
                  fontWeight: '600'
                }}>
                  {t.referralDetails}:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{t.userEmail}:</span>
                    <span style={{ color: '#ffffff', fontWeight: '500' }}>{referral.email}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{t.investmentAmount}:</span>
                    <span style={{ color: '#ffffff', fontWeight: '500' }}>${referral.investmentAmount?.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{t.commission}:</span>
                    <span style={{ color: '#2dd4bf', fontWeight: '600' }}>${commission.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Benefits List */}
            <div style={{ marginBottom: '24px' }}>
              {t.benefits.map((benefit, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  <span style={{ color: '#2dd4bf', fontSize: '16px', lineHeight: '1.4' }}>•</span>
                  <span style={{ lineHeight: '1.4' }}>{benefit}</span>
                </div>
              ))}
            </div>

            {/* TRC-20 Address Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '8px',
                fontWeight: '600'
              }}>
                {t.trc20AddressLabel}
              </label>
              <input
                type="text"
                value={trc20Address}
                onChange={(e) => setTrc20Address(e.target.value)}
                placeholder={t.trc20Placeholder}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.3s',
                  fontFamily: 'monospace'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                  e.target.style.borderColor = 'rgba(45, 212, 191, 0.5)'
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '16px',
                color: '#ef4444',
                fontSize: '14px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '24px'
            }}>
              <button
                onClick={handleClose}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '24px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.5 : 1,
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                }}
              >
                {t.cancelButton}
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting || !trc20Address.trim() || isPending}
                style={{
                  flex: 2,
                  padding: '14px',
                  background: (submitting || !trc20Address.trim() || isPending)
                    ? 'rgba(45, 212, 191, 0.3)'
                    : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                  border: 'none',
                  borderRadius: '24px',
                  color: (submitting || !trc20Address.trim() || isPending)
                    ? 'rgba(255, 255, 255, 0.5)'
                    : '#000000',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: (submitting || !trc20Address.trim() || isPending)
                    ? 'not-allowed'
                    : 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: (submitting || !trc20Address.trim() || isPending)
                    ? 'none'
                    : '0 4px 12px rgba(45, 212, 191, 0.3)'
                }}
                onMouseOver={(e) => {
                  if (!submitting && trc20Address.trim() && !isPending) {
                    e.currentTarget.style.transform = 'scale(1.02)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(45, 212, 191, 0.4)'
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  if (!submitting && trc20Address.trim()) {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 212, 191, 0.3)'
                  }
                }}
              >
                {isPending ? (
                  language === 'ru' ? 'Уже в обработке...' : 'Withdrawal Pending...'
                ) : submitting ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ 
                      display: 'inline-block',
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    {language === 'ru' ? 'Обработка...' : 'Processing...'}
                  </span>
                ) : t.submitButton}
              </button>
            </div>
          </>
        )}

        <style jsx>{`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.05);
              opacity: 0.9;
            }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}

export default ReferralBonusWithdrawModal
