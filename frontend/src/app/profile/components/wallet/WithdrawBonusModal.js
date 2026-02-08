'use client'
import { useState } from 'react'
import { validateTRC20Address } from './calculations'

export default function WithdrawBonusModal({
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
  const [showTelegramLink, setShowTelegramLink] = useState(false)
  const [botLink, setBotLink] = useState('')

  // ✅ ФУНКЦИЯ РАСЧЁТА БОНУСА ВНУТРИ КОМПОНЕНТА
  const getDurationBonus = () => {
    const duration = investment.duration
    if (duration === 3) return 0
    
    const amount = parseFloat(investment.amount || 0)
    
    if (duration === 6 || duration === 12) {
      if (amount >= 1000) return 500
      if (amount >= 500) return 200
    }
    
    return 0
  }

  const termBonus = getDurationBonus()
  const investedAmount = parseFloat(investment.amount || 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const result = await onSubmit(trc20Address)
    
    if (result?.success) {
      if (result?.data?.botLink) {
        setBotLink(result.data.botLink)
        setShowTelegramLink(true)
      } else {
        // ✅ Закрываем модал автоматически через 2 секунды после успешной отправки
        setTimeout(() => {
          handleClose()
        }, 2000)
      }
    }
  }

  const handleOpenTelegram = () => {
    if (botLink) {
      window.open(botLink, '_blank')
      setTimeout(() => {
        handleClose()
      }, 500)
    }
  }

  const handleClose = () => {
    setShowTelegramLink(false)
    setBotLink('')
    setTrc20Address('')
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
      onClick={handleClose}
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
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '600',
            color: '#2dd4bf',
            margin: 0,
            letterSpacing: '-0.8px'
          }}>
            {t.withdrawBonusButton || 'Вывести бонус'}
          </h2>

          <button
            onClick={handleClose}
            style={{
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
        </div>

        {!showTelegramLink ? (
          <>
            <div style={{
              background: 'rgba(45, 212, 191, 0.1)',
              border: '1px solid rgba(45, 212, 191, 0.25)',
              borderRadius: '20px',
              padding: isMobile ? '16px' : '20px',
              marginBottom: '24px'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: isMobile ? '12px' : '13px',
                    color: 'rgba(255, 255, 255, 0.6)'
                  }}>
                    {t.plan || 'План'}:
                  </span>
                  <span style={{
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '600',
                    color: '#ffffff'
                  }}>
                    {investment.planName}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: isMobile ? '12px' : '13px',
                    color: 'rgba(255, 255, 255, 0.6)'
                  }}>
                    {t.investedAmount || 'Инвестировано'}:
                  </span>
                  <span style={{
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '600',
                    color: '#ffffff'
                  }}>
                    ${investedAmount.toLocaleString()}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: isMobile ? '12px' : '13px',
                    color: 'rgba(255, 255, 255, 0.6)'
                  }}>
                    {t.duration || 'Срок'}:
                  </span>
                  <span style={{
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '600',
                    color: '#ffffff'
                  }}>
                    {investment.duration} {t.months || 'мес'}
                  </span>
                </div>

                <div style={{
                  height: '1px',
                  background: 'rgba(45, 212, 191, 0.2)',
                  margin: '8px 0'
                }} />

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '600',
                    color: '#2dd4bf'
                  }}>
                    {t.termBonus || 'Бонус за срок'}:
                  </span>
                  <span style={{
                    fontSize: isMobile ? '18px' : '20px',
                    fontWeight: '700',
                    color: '#2dd4bf'
                  }}>
                    ${termBonus.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: isMobile ? '12px' : '13px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  {t.trc20AddressLabel || 'TRC-20 адрес кошелька'}
                </label>
                <input
                  type="text"
                  value={trc20Address}
                  onChange={(e) => setTrc20Address(e.target.value)}
                  placeholder={t.enterTrc20Address || 'Введите ваш TRC-20 адрес'}
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
                    boxSizing: 'border-box',
                    fontFamily: 'monospace'
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
                  padding: isMobile ? '10px 14px' : '12px 16px',
                  marginBottom: '16px',
                  color: '#ef4444',
                  fontSize: isMobile ? '12px' : '13px'
                }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '12px',
                  padding: isMobile ? '10px 14px' : '12px 16px',
                  marginBottom: '16px',
                  color: '#22c55e',
                  fontSize: isMobile ? '12px' : '13px'
                }}>
                  {success}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  disabled={submitting || !trc20Address || !validateTRC20Address(trc20Address)}
                  style={{
                    flex: 1,
                    minWidth: '120px',
                    padding: isMobile ? '12px' : '14px',
                    background: (submitting || !trc20Address || !validateTRC20Address(trc20Address))
                      ? 'rgba(45, 212, 191, 0.3)'
                      : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                    border: 'none',
                    borderRadius: '16px',
                    color: (submitting || !trc20Address || !validateTRC20Address(trc20Address))
                      ? 'rgba(0, 0, 0, 0.5)'
                      : '#000000',
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '600',
                    cursor: (submitting || !trc20Address || !validateTRC20Address(trc20Address))
                      ? 'not-allowed'
                      : 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  {submitting ? (t.processing || 'Обработка...') : (t.submitRequest || 'Отправить запрос')}
                </button>

                <button
                  type="button"
                  onClick={handleClose}
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
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                  }}
                >
                  {t.cancel || 'Отмена'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div style={{
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 16px',
                background: 'rgba(45, 212, 191, 0.15)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#2dd4bf'
                }} />
              </div>

              <h3 style={{
                fontSize: isMobile ? '18px' : '20px',
                fontWeight: '600',
                color: '#2dd4bf',
                marginBottom: '12px'
              }}>
                {t.requestCreated || 'Запрос создан'}
              </h3>

              <p style={{
                fontSize: isMobile ? '13px' : '14px',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '24px',
                lineHeight: '1.6'
              }}>
                {t.telegramBotInstructions || 'Откройте Telegram бот для завершения процесса вывода'}
              </p>

              <button
                onClick={handleOpenTelegram}
                style={{
                  width: '100%',
                  padding: isMobile ? '14px' : '16px',
                  background: 'linear-gradient(135deg, #0088cc 0%, #006699 100%)',
                  border: 'none',
                  borderRadius: '16px',
                  color: '#ffffff',
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  marginBottom: '12px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 136, 204, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {t.openTelegram || 'Открыть Telegram'}
              </button>

              <button
                onClick={handleClose}
                style={{
                  width: '100%',
                  padding: isMobile ? '12px' : '14px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                }}
              >
                {t.close || 'Закрыть'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
