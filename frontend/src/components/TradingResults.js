'use client'
import { useState, useEffect } from 'react'
import { useTranslation } from '../app/hooks/useTranslation'

const API_BASE_URL = 'https://dxcapital-ai.com'

// Функция для неразрывных пробелов после предлогов
const fixPrepositions = (text) => {
  if (!text) return text
  const prepositions = [
    'и', 'в', 'во', 'на', 'с', 'со', 'к', 'ко', 'у', 'от', 'ото', 'из', 'изо',
    'по', 'о', 'об', 'обо', 'за', 'до', 'при', 'через', 'чтобы', 'без', 'безо',
    'под', 'подо', 'над', 'надо', 'перед', 'передо', 'между', 'для', 'что',
    'как', 'где', 'когда', 'куда', 'откуда', 'а', 'но', 'или', 'да', 'ни',
    'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
    'after', 'above', 'below', 'between', 'among', 'under', 'over', 'and', 'or'
  ]
  
  let result = text
  prepositions.forEach(prep => {
    const regex = new RegExp(`(^|\\s)(${prep})\\s(?=\\S)`, 'gi')
    result = result.replace(regex, `$1$2\u00A0`)
  })
  return result
}

export default function TradingResults({ isMobile, isTablet }) {
  const { t } = useTranslation()
  const [tradingStats, setTradingStats] = useState({ totalTrades: 0, totalPnl: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTradingStats()
  }, [])

  const fetchTradingStats = async () => {
    try {
      setLoading(true)
      const statsRes = await fetch(`${API_BASE_URL}/api/v1/trading-reports/stats`)
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setTradingStats(statsData.data || { totalTrades: 0, totalPnl: 0 })
      }
    } catch (error) {
      console.error('Error fetching trading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPnl = (pnl) => {
    const num = Number(pnl)
    const sign = num >= 0 ? '+' : ''
    return sign + num.toFixed(2) + '%'
  }
  
  const tradingResults = [
    {
      categoryKey: 'cryptocurrency',
      volume: '$2,847,520',
      profit: loading ? '...' : formatPnl(tradingStats.totalPnl),
      trades: loading ? '...' : tradingStats.totalTrades.toString(),
      descriptionKey: 'cryptocurrencyDesc',
      isActive: true
    },
    {
      categoryKey: 'stockMarkets',
      descriptionKey: 'stockMarketsDesc',
      isActive: false
    },
    {
      categoryKey: 'goldMining',
      descriptionKey: 'goldMiningDesc',
      isActive: false
    },
    {
      categoryKey: 'metaverse',
      descriptionKey: 'metaverseDesc',
      isActive: false
    }
  ]

  return (
    <div style={{ marginBottom: '100px' }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '60px'
      }}>
        <h2 style={{
          fontSize: isMobile ? '28px' : '36px',
          fontWeight: '600',
          color: 'white',
          marginBottom: '24px'
        }}>
          {fixPrepositions(t('tradingResultsTitle'))}
        </h2>
        <p style={{
          fontSize: isMobile ? '16px' : '20px',
          color: 'rgba(255,255,255,0.8)',
          maxWidth: '700px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          {fixPrepositions(t('tradingResultsSubtitle'))}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: '24px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {tradingResults.map((result, index) => (
          <div
            key={result.categoryKey}
            style={{
              background: result.isActive 
                ? `linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 50%, rgba(255, 255, 255, 0.08) 100%)`
                : `linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 50%, rgba(255, 255, 255, 0.05) 100%)`,
              backdropFilter: 'blur(30px) saturate(150%)',
              WebkitBackdropFilter: 'blur(30px) saturate(150%)',
              border: result.isActive 
                ? '1px solid rgba(255, 255, 255, 0.15)' 
                : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              padding: isMobile ? '24px' : '28px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              cursor: result.isActive ? 'pointer' : 'default',
              transition: 'all 0.3s',
              opacity: result.isActive ? 1 : 0.7
            }}
            onMouseOver={(e) => {
              if (result.isActive) {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(45, 212, 191, 0.2)'
                e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.4)'
              }
            }}
            onMouseOut={(e) => {
              if (result.isActive) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
              }
            }}
          >
            {/* Номер карточки */}
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              fontSize: '32px',
              fontWeight: '800',
              color: result.isActive ? 'rgba(45, 212, 191, 0.2)' : 'rgba(255, 255, 255, 0.1)',
              userSelect: 'none'
            }}>
              0{index + 1}
            </div>

            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: result.isActive 
                ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
            }} />
            
            <h3 style={{
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: '600',
              color: 'white',
              marginBottom: result.isActive ? '8px' : '12px',
              marginTop: '32px',
              userSelect: 'none'
            }}>
              {fixPrepositions(t(result.categoryKey))}
            </h3>
            
            {!result.isActive && (
              <div style={{
                fontSize: isMobile ? '12px' : '13px',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: '16px',
                userSelect: 'none'
              }}>
                {fixPrepositions(t('openingSoon'))}
              </div>
            )}
            
            {(result.isActive || !isMobile) && (
              <p style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '20px',
                lineHeight: '1.4',
                userSelect: 'none',
                minHeight: result.isActive ? '36px' : 'auto'
              }}>
                {fixPrepositions(t(result.descriptionKey))}
              </p>
            )}
            
            {result.isActive && (
              <>
                <div style={{
                  fontSize: isMobile ? '24px' : '28px',
                  fontWeight: 'bold',
                  color: '#2dd4bf',
                  marginBottom: '8px',
                  userSelect: 'none'
                }}>
                  {result.volume}
                </div>
                
                <div style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: '16px',
                  userSelect: 'none'
                }}>
                  {fixPrepositions(t('tradingVolume'))}
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginTop: '20px',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div>
                    <div style={{
                      fontSize: isMobile ? '16px' : '18px',
                      fontWeight: 'bold',
                      color: tradingStats.totalPnl >= 0 ? '#10b981' : '#ef4444',
                      userSelect: 'none'
                    }}>
                      {result.profit}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.6)',
                      userSelect: 'none'
                    }}>
                      {fixPrepositions(t('profitMargin'))}
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: isMobile ? '16px' : '18px',
                      fontWeight: 'bold',
                      color: 'white',
                      userSelect: 'none'
                    }}>
                      {result.trades}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.6)',
                      userSelect: 'none'
                    }}>
                      {fixPrepositions(t('totalTrades'))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
