import { useState, useEffect, useRef } from 'react'
import { useTranslation } from '../app/hooks/useTranslation'
import { fixPrepositions } from '../app/utils/textUtils'

export default function Features({ isMobile, isTablet }) {
  const { t } = useTranslation()
  const containerRef = useRef(null)
  const [visibleCards, setVisibleCards] = useState([])

  // Только 6 блоков БЕЗ эмодзи
  const features = [
    {
      icon: 'TRADE',
      titleKey: 'instantTrading',
      descriptionKey: 'instantTradingDesc'
    },
    {
      icon: 'FEES',
      titleKey: 'lowFees',
      descriptionKey: 'lowFeesDesc'
    },
    {
      icon: 'SECURE',
      titleKey: 'securePlatform',
      descriptionKey: 'securePlatformDesc'
    },
    {
      icon: '24/7',
      titleKey: 'support247',
      descriptionKey: 'support247Desc'
    },
    {
      icon: 'ANALYTICS',
      titleKey: 'advancedAnalytics',
      descriptionKey: 'advancedAnalyticsDesc'
    },
    {
      icon: 'MOBILE',
      titleKey: 'mobileApp',
      descriptionKey: 'mobileAppDesc'
    }
  ]

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const cards = containerRef.current.querySelectorAll('[data-card]')
      const windowHeight = window.innerHeight
      const visible = []

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect()
        const isVisible = rect.top < windowHeight * 0.8 && rect.bottom > windowHeight * 0.2
        if (isVisible) {
          visible.push(index)
        }
      })

      setVisibleCards(visible)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section style={{ 
      padding: isMobile ? '60px 20px' : '100px 40px',
      position: 'relative'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Заголовок */}
        <div style={{
          textAlign: 'center',
          marginBottom: isMobile ? '50px' : '70px'
        }}>
          <h2 style={{
            fontSize: isMobile ? '32px' : isTablet ? '42px' : '48px',
            fontWeight: '800',
            color: 'white',
            marginBottom: '20px',
            lineHeight: '1.2'
          }}>
            {fixPrepositions(t('featuresTitle'))}
          </h2>
          <p style={{
            fontSize: isMobile ? '16px' : '18px',
            color: 'rgba(255, 255, 255, 0.7)',
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            {fixPrepositions(t('featuresSubtitle'))}
          </p>
        </div>

        {/* Сетка карточек 3x2 */}
        <div 
          ref={containerRef}
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: isMobile ? '24px' : '32px'
          }}
        >
          {features.map((feature, index) => {
            const isVisible = visibleCards.includes(index)
            
            return (
              <div
                key={feature.titleKey}
                data-card
                style={{
                  background: `
                    linear-gradient(135deg, 
                      rgba(255, 255, 255, 0.12) 0%,
                      rgba(255, 255, 255, 0.05) 50%,
                      rgba(255, 255, 255, 0.08) 100%
                    )
                  `,
                  backdropFilter: 'blur(30px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(30px) saturate(150%)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '24px',
                  padding: isMobile ? '28px' : '36px',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                  transitionDelay: `${index * 0.1}s`
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.borderColor = '#2dd4bf'
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(45, 212, 191, 0.3)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = isVisible ? 'translateY(0)' : 'translateY(30px)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Верхний блик */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)'
                }} />
                
                {/* Текстовая метка вместо эмодзи - ПО ЦЕНТРУ */}
                <div style={{
                  textAlign: 'center',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    fontSize: isMobile ? '14px' : '16px',
                    fontWeight: '600',
                    color: '#2dd4bf',
                    padding: '12px 20px',
                    background: 'rgba(45, 212, 191, 0.15)',
                    borderRadius: '12px',
                    border: '1px solid rgba(45, 212, 191, 0.3)',
                    letterSpacing: '0.5px',
                    display: 'inline-block',
                    transition: 'all 0.3s ease'
                  }}>
                    {feature.icon}
                  </div>
                </div>

                {/* Заголовок */}
                <h3 style={{
                  fontSize: isMobile ? '20px' : '22px',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '14px',
                  textAlign: 'center',
                  lineHeight: '1.3'
                }}>
                  {fixPrepositions(t(feature.titleKey))}
                </h3>

                {/* Описание */}
                <p style={{
                  fontSize: isMobile ? '14px' : '15px',
                  color: 'rgba(255, 255, 255, 0.75)',
                  lineHeight: '1.7',
                  textAlign: 'center',
                  margin: 0
                }}>
                  {fixPrepositions(t(feature.descriptionKey))}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
