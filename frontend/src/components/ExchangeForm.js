'use client'
import { useState } from 'react'
import { tradingAPI } from '../app/utils/api'
import { useAuth } from '../app/hooks/useAuth'

export default function ExchangeForm({ 
  spendAmount, 
  setSpendAmount, 
  getAmount, 
  setGetAmount, 
  selectedFromCurrency, 
  selectedToCurrency, 
  handleSwap, 
  isMobile 
}) {
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleCalculate = async () => {
    if (!spendAmount || parseFloat(spendAmount) <= 0) {
      setError('Please enter a valid amount')
      setSuccess('')
      return
    }

    if (!isAuthenticated) {
      setError('Please login to calculate exchange rates')
      setSuccess('')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')
      
      const response = await tradingAPI.getExchangeRate(
        selectedFromCurrency,
        selectedToCurrency,
        spendAmount
      )
      
      setGetAmount(response.data.amount.toString())
      setSuccess('Exchange rate calculated successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate exchange rate')
      setGetAmount('')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTrade = async () => {
    if (!isAuthenticated) {
      setError('Please login to create trades')
      return
    }

    if (!spendAmount || !getAmount) {
      setError('Please calculate exchange rate first')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')
      
      const response = await tradingAPI.createTrade({
        from_currency: selectedFromCurrency,
        to_currency: selectedToCurrency,
        from_amount: parseFloat(spendAmount),
        to_amount: parseFloat(getAmount)
      })
      
      setSuccess('Trade executed successfully!')
      // Очистить форму после успешной сделки
      setTimeout(() => {
        setSpendAmount('')
        setGetAmount('')
        setSuccess('')
      }, 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to execute trade')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      // iOS Glass Effect для основной формы
      background: `
        linear-gradient(135deg, 
          rgba(255, 255, 255, 0.15) 0%,
          rgba(255, 255, 255, 0.05) 25%,
          rgba(255, 255, 255, 0.02) 50%,
          rgba(255, 255, 255, 0.05) 75%,
          rgba(255, 255, 255, 0.10) 100%
        )
      `,
      backdropFilter: 'blur(50px) saturate(180%)',
      WebkitBackdropFilter: 'blur(50px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '32px',
      padding: isMobile ? '28px' : '44px',
      marginBottom: '60px',
      boxShadow: `
        0 16px 64px rgba(0, 0, 0, 0.12),
        0 4px 16px rgba(0, 0, 0, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.15),
        inset 0 -1px 0 rgba(255, 255, 255, 0.05)
      `,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Топ блик */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)'
      }} />
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr auto 1fr',
        gap: isMobile ? '20px' : '32px',
        alignItems: 'center',
        marginBottom: isMobile ? '30px' : '40px'
      }}>
        {/* To Spend */}
        <div style={{
          background: `
            linear-gradient(135deg, 
              rgba(0, 0, 0, 0.15) 0%,
              rgba(255, 255, 255, 0.05) 25%,
              rgba(0, 0, 0, 0.08) 50%,
              rgba(255, 255, 255, 0.03) 75%,
              rgba(0, 0, 0, 0.12) 100%
            )
          `,
          backdropFilter: 'blur(30px) saturate(150%)',
          WebkitBackdropFilter: 'blur(30px) saturate(150%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '28px',
          padding: isMobile ? '24px' : '32px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Внутренний блик */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)'
          }} />
          
          <label style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '16px',
            marginBottom: '16px',
            display: 'block',
            fontWeight: '500',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
          }}>To Spend</label>
          
          <input
            type="text"
            value={spendAmount}
            onChange={(e) => setSpendAmount(e.target.value)}
            placeholder="0.00"
            style={{
              width: '100%',
              background: 'transparent',
              fontSize: isMobile ? '28px' : '42px',
              fontWeight: 'bold',
              color: 'white',
              outline: 'none',
              border: 'none',
              marginBottom: '20px',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)'
            }}
          />
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: 'white',
              fontSize: '16px',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
            }}>
              ₿
            </div>
            <span style={{ 
              color: 'white', 
              fontWeight: '600', 
              fontSize: isMobile ? '18px' : '20px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
            }}>
              {selectedFromCurrency}
            </span>
            <svg style={{ width: '18px', height: '18px', color: 'rgba(255,255,255,0.6)', marginLeft: 'auto' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Swap Button */}
        <div style={{ display: 'flex', justifyContent: 'center', order: isMobile ? -1 : 0 }}>
          <button
            onClick={handleSwap}
            disabled={loading}
            style={{
              width: isMobile ? '52px' : '60px',
              height: isMobile ? '52px' : '60px',
              background: loading ? 'rgba(45, 212, 191, 0.5)' : `
                linear-gradient(135deg, 
                  rgba(45, 212, 191, 0.9) 0%,
                  rgba(20, 184, 166, 0.8) 50%,
                  rgba(45, 212, 191, 0.9) 100%
                )
              `,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.42, 0.94)',
              boxShadow: `
                0 8px 25px rgba(20, 184, 166, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.4),
                inset 0 -1px 0 rgba(0, 0, 0, 0.1)
              `
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.transform = 'scale(1.1) rotate(180deg) translateZ(0)'
                e.target.style.boxShadow = `
                  0 12px 35px rgba(20, 184, 166, 0.5),
                  inset 0 1px 0 rgba(255, 255, 255, 0.5),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                `
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.transform = 'scale(1) rotate(0deg) translateZ(0)'
                e.target.style.boxShadow = `
                  0 8px 25px rgba(20, 184, 166, 0.4),
                  inset 0 1px 0 rgba(255, 255, 255, 0.4),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                `
              }
            }}
          >
            <svg style={{ width: isMobile ? '22px' : '26px', height: isMobile ? '22px' : '26px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* You Get */}
        <div style={{
          background: `
            linear-gradient(135deg, 
              rgba(0, 0, 0, 0.15) 0%,
              rgba(255, 255, 255, 0.05) 25%,
              rgba(0, 0, 0, 0.08) 50%,
              rgba(255, 255, 255, 0.03) 75%,
              rgba(0, 0, 0, 0.12) 100%
            )
          `,
          backdropFilter: 'blur(30px) saturate(150%)',
          WebkitBackdropFilter: 'blur(30px) saturate(150%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '28px',
          padding: isMobile ? '24px' : '32px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Внутренний блик */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)'
          }} />
          
          <label style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '16px',
            marginBottom: '16px',
            display: 'block',
            fontWeight: '500',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
          }}>You Get</label>
          
          <input
            type="text"
            value={getAmount}
            readOnly
            placeholder="0.00"
            style={{
              width: '100%',
              background: 'transparent',
              fontSize: isMobile ? '28px' : '42px',
              fontWeight: 'bold',
              color: getAmount ? 'white' : 'rgba(255, 255, 255, 0.5)',
              outline: 'none',
              border: 'none',
              marginBottom: '20px',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
              cursor: 'default'
            }}
          />
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #14b8a6, #0f766e)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: 'white',
              fontSize: '16px',
              boxShadow: '0 4px 12px rgba(20, 184, 166, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
            }}>
              ₮
            </div>
            <span style={{ 
              color: 'white', 
              fontWeight: '600', 
              fontSize: isMobile ? '18px' : '20px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
            }}>
              {selectedToCurrency}
            </span>
            <svg style={{ width: '18px', height: '18px', color: 'rgba(255,255,255,0.6)', marginLeft: 'auto' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div style={{
          background: `
            linear-gradient(135deg, 
              rgba(239, 68, 68, 0.25) 0%,
              rgba(220, 38, 38, 0.15) 50%,
              rgba(239, 68, 68, 0.25) 100%
            )
          `,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '20px',
          padding: isMobile ? '16px' : '20px',
          marginBottom: '24px',
          color: '#fca5a5',
          fontSize: isMobile ? '14px' : '16px',
          textAlign: 'center',
          fontWeight: '500',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
          boxShadow: `
            0 8px 25px rgba(239, 68, 68, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          background: `
            linear-gradient(135deg, 
              rgba(16, 185, 129, 0.25) 0%,
              rgba(5, 150, 105, 0.15) 50%,
              rgba(16, 185, 129, 0.25) 100%
            )
          `,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '20px',
          padding: isMobile ? '16px' : '20px',
          marginBottom: '24px',
          color: '#6ee7b7',
          fontSize: isMobile ? '14px' : '16px',
          textAlign: 'center',
          fontWeight: '500',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
          boxShadow: `
            0 8px 25px rgba(16, 185, 129, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `
        }}>
          {success}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex',
        gap: isMobile ? '16px' : '24px',
        flexDirection: isMobile ? 'column' : 'row'
      }}>
        {/* Calculate Button */}
        <button
          onClick={handleCalculate}
          disabled={loading}
          style={{
            background: loading ? 'rgba(45, 212, 191, 0.5)' : `
              linear-gradient(135deg, 
                rgba(45, 212, 191, 0.95) 0%,
                rgba(20, 184, 166, 0.9) 25%,
                rgba(13, 148, 136, 0.9) 75%,
                rgba(45, 212, 191, 0.95) 100%
              )
            `,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: isMobile ? '18px 24px' : '22px 48px',
            borderRadius: '60px',
            color: 'white',
            fontWeight: 'bold',
            fontSize: isMobile ? '16px' : '18px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.42, 0.94)',
            flex: 1,
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
            boxShadow: `
              0 16px 40px rgba(20, 184, 166, 0.35),
              inset 0 1px 0 rgba(255, 255, 255, 0.4),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1)
            `
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.target.style.transform = 'scale(1.02) translateY(-2px) translateZ(0)'
              e.target.style.boxShadow = `
                0 20px 50px rgba(20, 184, 166, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.5),
                inset 0 -1px 0 rgba(0, 0, 0, 0.1)
              `
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.target.style.transform = 'scale(1) translateY(0) translateZ(0)'
              e.target.style.boxShadow = `
                0 16px 40px rgba(20, 184, 166, 0.35),
                inset 0 1px 0 rgba(255, 255, 255, 0.4),
                inset 0 -1px 0 rgba(0, 0, 0, 0.1)
              `
            }
          }}
        >
          {loading ? 'Calculating...' : 'Calculate Rate'}
        </button>

        {/* Execute Trade Button - показывается только если есть расчет */}
        {getAmount && (
          <button
            onClick={handleCreateTrade}
            disabled={loading || !isAuthenticated}
            style={{
              background: (!isAuthenticated || loading) ? 'rgba(156, 163, 175, 0.5)' : `
                linear-gradient(135deg, 
                  rgba(16, 185, 129, 0.95) 0%,
                  rgba(5, 150, 105, 0.9) 25%,
                  rgba(4, 120, 87, 0.9) 75%,
                  rgba(16, 185, 129, 0.95) 100%
                )
              `,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              padding: isMobile ? '18px 24px' : '22px 48px',
              borderRadius: '60px',
              color: 'white',
              fontWeight: 'bold',
              fontSize: isMobile ? '16px' : '18px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              cursor: (!isAuthenticated || loading) ? 'not-allowed' : 'pointer',
              transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.42, 0.94)',
              flex: 1,
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
              boxShadow: (!isAuthenticated || loading) ? 'none' : `
                0 16px 40px rgba(16, 185, 129, 0.35),
                inset 0 1px 0 rgba(255, 255, 255, 0.4),
                inset 0 -1px 0 rgba(0, 0, 0, 0.1)
              `
            }}
            onMouseOver={(e) => {
              if (!loading && isAuthenticated) {
                e.target.style.transform = 'scale(1.02) translateY(-2px) translateZ(0)'
                e.target.style.boxShadow = `
                  0 20px 50px rgba(16, 185, 129, 0.4),
                  inset 0 1px 0 rgba(255, 255, 255, 0.5),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                `
              }
            }}
            onMouseOut={(e) => {
              if (!loading && isAuthenticated) {
                e.target.style.transform = 'scale(1) translateY(0) translateZ(0)'
                e.target.style.boxShadow = `
                  0 16px 40px rgba(16, 185, 129, 0.35),
                  inset 0 1px 0 rgba(255, 255, 255, 0.4),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                `
              }
            }}
          >
            {loading ? 'Processing...' : !isAuthenticated ? 'Login to Trade' : 'Execute Trade'}
          </button>
        )}
      </div>
    </div>
  )
}
