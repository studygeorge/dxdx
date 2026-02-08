'use client'
import React, { useState, useEffect } from 'react'

const ReferralBonusReinvestModal = ({ 
  totalAmount = 0,
  availableAmount = 0,
  totalCount = 0,
  availableCount = 0,
  onClose, 
  onSubmit,
  error,
  success,
  submitting,
  language = 'en',
  isMobile,
  userInvestments = null,
  loadingInvestments: externalLoadingInvestments = false
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [investments, setInvestments] = useState(userInvestments || [])
  const [selectedInvestment, setSelectedInvestment] = useState(null)
  const [loadingInvestments, setLoadingInvestments] = useState(!userInvestments)

  const translations = {
    en: {
      title: 'Reinvest Referral Bonuses',
      subtitle: 'All available referral bonuses will be reinvested into your active investments',
      totalAvailable: 'Total Available',
      availableToReinvest: 'available to reinvest',
      benefits: [
        'Bonuses will increase your capital',
        'Earn additional income',
        'No wallet address required'
      ],
      selectInvestment: 'Select Investment',
      noActiveInvestments: 'No active investments found',
      createNewInvestment: 'Create a new investment to reinvest bonuses',
      loading: 'Loading investments...',
      investment: 'Investment',
      currentAmount: 'Current Amount',
      afterReinvest: 'After Reinvest',
      currentPlan: 'Current Plan',
      newPlan: 'New Plan',
      currentROI: 'Current ROI',
      newROI: 'New ROI',
      upgradeAvailable: '⬆️ Upgrade Available',
      confirmButton: 'Confirm Reinvestment',
      cancelButton: 'Cancel',
      successTitle: 'Bonuses Reinvested!',
      successMessage: 'Your referral bonuses have been successfully reinvested.',
      successSubtext: 'The investment has been updated and is generating profit.',
      gotItButton: 'Got it!'
    },
    ru: {
      title: 'Реинвестировать бонусы',
      subtitle: 'Все доступные реферальные бонусы будут реинвестированы в ваши активные инвестиции',
      totalAvailable: 'Общая сумма',
      availableToReinvest: 'доступно к реинвесту',
      benefits: [
        'Бонусы увеличат ваш капитал',
        'Получайте дополнительный доход',
        'Не требуется адрес кошелька'
      ],
      selectInvestment: 'Выберите инвестицию',
      noActiveInvestments: 'Нет активных инвестиций',
      createNewInvestment: 'Создайте новую инвестицию для реинвестирования бонусов',
      loading: 'Загрузка инвестиций...',
      investment: 'Инвестиция',
      currentAmount: 'Текущая сумма',
      afterReinvest: 'После реинвеста',
      currentPlan: 'Текущий план',
      newPlan: 'Новый план',
      currentROI: 'Текущий ROI',
      newROI: 'Новый ROI',
      upgradeAvailable: '⬆️ Доступен апгрейд',
      confirmButton: 'Подтвердить реинвестирование',
      cancelButton: 'Отмена',
      successTitle: 'Бонусы реинвестированы!',
      successMessage: 'Ваши реферальные бонусы были успешно реинвестированы.',
      successSubtext: 'Инвестиция обновлена и генерирует прибыль.',
      gotItButton: 'Понятно!'
    }
  }

  const t = translations[language] || translations.en

  useEffect(() => {
    if (userInvestments) {
      setInvestments(userInvestments)
      if (userInvestments.length > 0) {
        setSelectedInvestment(userInvestments[0])
      }
      setLoadingInvestments(false)
    } else {
      fetchInvestments()
    }
  }, [userInvestments])

  const fetchInvestments = async () => {
    try {
      setLoadingInvestments(true)
      const token = localStorage.getItem('access_token')
      
      const response = await fetch('https://dxcapital-ai.com/api/v1/investments/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })
      
      const data = await response.json()
      const activeInvestments = data.data?.filter(inv => inv.status === 'ACTIVE') || []
      setInvestments(activeInvestments)
      
      if (activeInvestments.length > 0) {
        setSelectedInvestment(activeInvestments[0])
      }
    } catch (error) {
      console.error('Error fetching investments:', error)
    } finally {
      setLoadingInvestments(false)
    }
  }

  const calculateNewPlan = (currentAmount, reinvestAmount) => {
    const newAmount = currentAmount + reinvestAmount
    
    if (newAmount >= 6000) return { name: 'Elite', roi: 22 }
    if (newAmount >= 3000) return { name: 'Pro', roi: 20 }
    if (newAmount >= 1000) return { name: 'Advanced', roi: 17 }
    return { name: 'Starter', roi: 14 }
  }

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (!selectedInvestment) return
    
    const result = await onSubmit(selectedInvestment.id)
    
    if (result && result.success) {
      setCurrentStep(2)
      setTimeout(() => {
        handleClose()
      }, 3000)
    }
  }

  const handleClose = () => {
    setCurrentStep(1)
    setSelectedInvestment(null)
    onClose()
  }

  const currentPlan = calculateNewPlan(selectedInvestment?.amount || 0, 0)
  const newPlan = calculateNewPlan(selectedInvestment?.amount || 0, availableAmount)
  const willUpgrade = newPlan.roi > currentPlan.roi

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
          // Success Screen
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
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
              <div style={{ fontSize: '40px', color: '#2dd4bf' }}>✓</div>
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
                background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                border: 'none',
                borderRadius: '24px',
                color: '#000000',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(45, 212, 191, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(45, 212, 191, 0.4)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 212, 191, 0.3)'
              }}
            >
              {t.gotItButton}
            </button>
          </div>
        ) : (
          // Step 1: Reinvest Form
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
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#2dd4bf' }}>↻</div>
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
                ${availableAmount.toFixed(2)}
              </div>
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
                <span>{t.availableToReinvest}</span>
              </div>
            </div>

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

            {/* Investment Selection */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '12px',
                fontWeight: '600'
              }}>
                {t.selectInvestment}:
              </div>

              {loadingInvestments || externalLoadingInvestments ? (
                <div style={{
                  textAlign: 'center',
                  padding: '32px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '14px'
                }}>
                  {t.loading}
                </div>
              ) : investments.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '32px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '16px'
                }}>
                  <div style={{
                    fontSize: '40px',
                    marginBottom: '12px'
                  }}>!</div>
                  <div style={{
                    fontSize: '15px',
                    color: '#ef4444',
                    marginBottom: '8px',
                    fontWeight: '600'
                  }}>
                    {t.noActiveInvestments}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.6)'
                  }}>
                    {t.createNewInvestment}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {investments.map((inv) => {
                    const isSelected = selectedInvestment?.id === inv.id
                    const newAmount = inv.amount + availableAmount
                    const currentPlanCalc = calculateNewPlan(inv.amount, 0)
                    const newPlanCalc = calculateNewPlan(inv.amount, availableAmount)
                    const willUpgradeCalc = newPlanCalc.roi > currentPlanCalc.roi

                    return (
                      <div
                        key={inv.id}
                        onClick={() => setSelectedInvestment(inv)}
                        style={{
                          background: isSelected 
                            ? 'linear-gradient(135deg, rgba(45, 212, 191, 0.15) 0%, rgba(20, 184, 166, 0.15) 100%)'
                            : 'rgba(255, 255, 255, 0.03)',
                          border: `2px solid ${isSelected ? '#2dd4bf' : 'rgba(255, 255, 255, 0.1)'}`,
                          borderRadius: '16px',
                          padding: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                        onMouseOver={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                            e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.3)'
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                          }
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '12px'
                        }}>
                          <div>
                            <div style={{
                              fontSize: '12px',
                              color: 'rgba(255, 255, 255, 0.6)',
                              marginBottom: '4px'
                            }}>
                              {t.investment} #{inv.id.substring(0, 8)}
                            </div>
                            <div style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#ffffff'
                            }}>
                              {currentPlanCalc.name} → {newPlanCalc.name}
                            </div>
                          </div>
                          {isSelected && (
                            <div style={{
                              width: '24px',
                              height: '24px',
                              background: '#2dd4bf',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#000',
                              fontSize: '14px',
                              fontWeight: 'bold'
                            }}>
                              ✓
                            </div>
                          )}
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '12px',
                          fontSize: '13px'
                        }}>
                          <div>
                            <div style={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
                              {t.currentAmount}
                            </div>
                            <div style={{ color: '#ffffff', fontWeight: '600' }}>
                              ${inv.amount.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div style={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
                              {t.afterReinvest}
                            </div>
                            <div style={{ color: '#2dd4bf', fontWeight: '600' }}>
                              ${newAmount.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {willUpgradeCalc && (
                          <div style={{
                            marginTop: '12px',
                            padding: '8px 12px',
                            background: 'rgba(45, 212, 191, 0.1)',
                            borderRadius: '12px',
                            fontSize: '12px',
                            color: '#2dd4bf',
                            fontWeight: '600',
                            textAlign: 'center'
                          }}>
                            {t.upgradeAvailable}: {currentPlanCalc.roi}% → {newPlanCalc.roi}%
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
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
                disabled={submitting || !selectedInvestment || investments.length === 0}
                style={{
                  flex: 2,
                  padding: '14px',
                  background: (submitting || !selectedInvestment || investments.length === 0)
                    ? 'rgba(45, 212, 191, 0.3)'
                    : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                  border: 'none',
                  borderRadius: '24px',
                  color: (submitting || !selectedInvestment || investments.length === 0)
                    ? 'rgba(255, 255, 255, 0.5)'
                    : '#000000',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: (submitting || !selectedInvestment || investments.length === 0)
                    ? 'not-allowed'
                    : 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: (submitting || !selectedInvestment || investments.length === 0)
                    ? 'none'
                    : '0 4px 12px rgba(45, 212, 191, 0.3)'
                }}
                onMouseOver={(e) => {
                  if (!submitting && selectedInvestment && investments.length > 0) {
                    e.currentTarget.style.transform = 'scale(1.02)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(45, 212, 191, 0.4)'
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  if (!submitting && selectedInvestment && investments.length > 0) {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 212, 191, 0.3)'
                  }
                }}
              >
                {submitting ? (
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
                ) : t.confirmButton}
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

export default ReferralBonusReinvestModal
