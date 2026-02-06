'use client'
import { useState, useEffect, useRef } from 'react'
import { fixPrepositions } from '../app/utils/textUtils'

function useTranslation() {
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en'
    setLanguage(savedLanguage)

    const handleLanguageChange = (event) => {
      setLanguage(event.detail)
    }

    window.addEventListener('languageChanged', handleLanguageChange)
    return () => window.removeEventListener('languageChanged', handleLanguageChange)
  }, [])

  const translations = {
    en: {
      statisticsTitle: 'Platform Statistics',
      statisticsSubtitle: 'Real-time performance metrics and transparent reporting',
      
      scaleTitle: 'DXCapital Scale',
      totalInvestments: 'Total Volume of Investments',
      activeUsers: 'Active Users',
      countries: 'Countries',
      countriesDesc: 'Geographic reach of DXCapital clients',
      tradersExperience: 'Years of Continuous Capital Management Experience',
      
      efficiencyTitle: 'Efficiency and Results',
      lastMonthReturn: 'Last Month Return',
      clientRetention: 'Clients Extended Staking After First Cycle',
      maxBonus: 'Maximum Bonus Received by DXCapital Client',
      maxBonusDesc: 'Elite portfolio, 12-month staking and active referral program',
      
      updatedRealtime: 'Updated in real-time',
      viewPlans: 'View Staking Plans',
      lastUpdate: 'Last update'
    },
    ru: {
      statisticsTitle: 'Статистика Платформы',
      statisticsSubtitle: 'Показатели производительности в реальном времени и прозрачная отчетность',
      
      scaleTitle: 'Масштаб DXCapital',
      totalInvestments: 'Общий объём инвестиций',
      activeUsers: 'Активных пользователей',
      countries: 'Стран',
      countriesDesc: 'Локализация клиентов DXCapital',
      tradersExperience: 'Лет непрерывной практики управления капиталом',
      
      efficiencyTitle: 'Эффективность и результаты',
      lastMonthReturn: 'Доходность последнего месяца',
      clientRetention: 'Клиентов продлили стейкинг после первого цикла',
      maxBonus: 'Максимальный бонус клиента DXCapital',
      maxBonusDesc: 'Elite-портфель, 12-месячный стейкинг и активная партнёрская программа',
      
      updatedRealtime: 'Обновлено в реальном времени',
      viewPlans: 'Смотреть пакеты стейкинга',
      lastUpdate: 'Последнее обновление'
    }
  }

  const t = (key) => translations[language]?.[key] || translations.en[key] || key
  return { t, language }
}

function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return scrollY
}

function useScrollAnimation() {
  const [visibleElements, setVisibleElements] = useState(new Set([
    'header', 
    'section-1', 
    'scale-1', 
    'scale-2', 
    'scale-3', 
    'scale-4',
    'section-2',
    'eff-1',
    'eff-2',
    'eff-3',
    'cta',
    'timestamp'
  ]))
  const observerRef = useRef(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements((prev) => new Set([...prev, entry.target.dataset.index]))
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  const registerElement = (element, index) => {
    if (element && observerRef.current) {
      element.dataset.index = index
      observerRef.current.observe(element)
    }
  }

  return { visibleElements, registerElement }
}

function calculateTotalInvestments() {
  const BASE_VALUE = 1002700
  const START_DATE = new Date('2026-01-01')
  const EVEN_DAY_INCREMENT = 2700
  const ODD_DAY_INCREMENT = 2800
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  START_DATE.setHours(0, 0, 0, 0)
  
  const daysDifference = Math.floor((today - START_DATE) / (1000 * 60 * 60 * 24))
  
  if (daysDifference < 0) {
    return BASE_VALUE
  }
  
  let totalIncrement = 0
  
  for (let day = 1; day <= daysDifference; day++) {
    const currentDate = new Date(START_DATE)
    currentDate.setDate(START_DATE.getDate() + day)
    const dayOfMonth = currentDate.getDate()
    
    if (dayOfMonth % 2 === 0) {
      totalIncrement += EVEN_DAY_INCREMENT
    } else {
      totalIncrement += ODD_DAY_INCREMENT
    }
  }
  
  return BASE_VALUE + totalIncrement
}

function formatInvestmentValue(value) {
  return `$${value.toLocaleString('en-US')}+`
}

export default function Statistics({ isMobile, isTablet }) {
  const { t } = useTranslation()
  const { visibleElements, registerElement } = useScrollAnimation()
  const scrollY = useScrollPosition()
  const [currentTime, setCurrentTime] = useState('')
  const [totalInvestments, setTotalInvestments] = useState('')
  
  const videoRef = useRef(null)
  const [videoLoaded, setVideoLoaded] = useState(false)

  useEffect(() => {
    const calculatedValue = calculateTotalInvestments()
    setTotalInvestments(formatInvestmentValue(calculatedValue))
  }, [])

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const formatted = now.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
      setCurrentTime(formatted)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load()
      videoRef.current.play().catch(() => {})
    }
  }, [])

  const scaleStats = [
    { value: totalInvestments, label: fixPrepositions(t('totalInvestments')), index: 'scale-1' },
    { value: '1,420+', label: fixPrepositions(t('activeUsers')), index: 'scale-2' },
    { value: '8+', label: fixPrepositions(t('countries')), desc: fixPrepositions(t('countriesDesc')), index: 'scale-3' },
    { value: '9', label: fixPrepositions(t('tradersExperience')), index: 'scale-4' }
  ]

  const efficiencyStats = [
    { value: '23.2%', label: fixPrepositions(t('lastMonthReturn')), index: 'eff-1' },
    { value: '87%', label: fixPrepositions(t('clientRetention')), index: 'eff-2' },
    { value: '$4,860', label: fixPrepositions(t('maxBonus')), desc: fixPrepositions(t('maxBonusDesc')), index: 'eff-3' }
  ]

  return (
    <section 
      id="statistics" 
      style={{
        padding: isMobile ? '20px 20px 80px' : '0 40px 120px',
        paddingTop: isMobile ? '20px' : '0',
        marginTop: '10px',
        position: 'relative',
        minHeight: '100vh'
      }}>
      
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={() => setVideoLoaded(true)}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            minWidth: '100%',
            minHeight: '100%',
            width: 'auto',
            height: 'auto',
            transform: 'translate(-50%, -50%)',
            objectFit: 'cover',
            opacity: videoLoaded ? 0.4 : 0,
            transition: 'opacity 0.5s ease-in',
            willChange: 'auto'
          }}
        >
          <source
            src={isMobile ? '/profile/Statisticsmobile.MP4' : '/profile/Statisticspk.mp4'}
            type="video/mp4"
          />
        </video>
        
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.5) 100%)',
          pointerEvents: 'none'
        }} />
      </div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative'
      }}>
        {/* Header */}
        <div 
          ref={(el) => registerElement(el, 'header')}
          style={{
            textAlign: 'center',
            marginBottom: isMobile ? '60px' : '80px',
            opacity: visibleElements.has('header') ? 1 : 0,
            transform: visibleElements.has('header') ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
          <h2 style={{
            fontSize: isMobile ? '40px' : isTablet ? '56px' : '72px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '24px',
            lineHeight: '1',
            letterSpacing: '-2px',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
          }}>
            {fixPrepositions(t('statisticsTitle'))}
          </h2>
          <p style={{
            fontSize: isMobile ? '18px' : '22px',
            color: 'rgba(255, 255, 255, 0.95)',
            maxWidth: '700px',
            margin: '0 auto 32px',
            lineHeight: '1.6',
            letterSpacing: '-0.5px',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)'
          }}>
            {fixPrepositions(t('statisticsSubtitle'))}
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(45, 212, 191, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(45, 212, 191, 0.4)',
            borderRadius: '32px',
            padding: '8px 20px',
            fontSize: '12px',
            color: '#2dd4bf',
            fontWeight: '500'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#2dd4bf',
              boxShadow: '0 0 12px #2dd4bf',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
            {fixPrepositions(t('updatedRealtime'))}
          </div>
        </div>

        {/* Section 1: DXCapital Scale */}
        <div 
          ref={(el) => registerElement(el, 'section-1')}
          style={{
            marginBottom: isMobile ? '100px' : '150px',
            position: 'relative',
            opacity: visibleElements.has('section-1') ? 1 : 0,
            transform: visibleElements.has('section-1') ? 'translateY(0)' : 'translateY(50px)',
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
          
          <div style={{
            position: 'absolute',
            top: isMobile ? '-30px' : '-60px',
            left: isMobile ? '5%' : '10%',
            fontSize: isMobile ? '150px' : '280px',
            fontWeight: '900',
            color: 'rgba(45, 212, 191, 0.05)',
            lineHeight: '1',
            letterSpacing: '-10px',
            pointerEvents: 'none',
            zIndex: 1
          }}>
            01
          </div>

          <div style={{
            position: 'absolute',
            top: isMobile ? '15%' : '10%',
            right: isMobile ? '5%' : '8%',
            width: isMobile ? '180px' : '320px',
            height: isMobile ? '180px' : '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2), rgba(45, 212, 191, 0.15) 40%, rgba(45, 212, 191, 0.08) 70%, transparent 90%)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            opacity: visibleElements.has('section-1') ? 0.9 : 0,
            transform: visibleElements.has('section-1') 
              ? `translate(${scrollY * -0.05}px, ${scrollY * 0.03}px) scale(1)` 
              : 'translate(100px, -100px) scale(0.5)',
            transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease-out',
            boxShadow: '0 20px 60px rgba(45, 212, 191, 0.2), inset 0 0 40px rgba(255, 255, 255, 0.1)',
            zIndex: 0,
            pointerEvents: 'none'
          }}>
            <div style={{
              position: 'absolute',
              top: '15%',
              left: '15%',
              width: '35%',
              height: '35%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.5), transparent 60%)',
              filter: 'blur(6px)'
            }} />
          </div>

          <h3 style={{
            fontSize: isMobile ? '26px' : '48px',
            fontWeight: '600',
            color: 'white',
            marginBottom: isMobile ? '50px' : '70px',
            letterSpacing: isMobile ? '-0.5px' : '-1px',
            position: 'relative',
            zIndex: 2,
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)',
            lineHeight: '1.2',
            whiteSpace: isMobile ? 'normal' : 'nowrap'
          }}>
            {fixPrepositions(t('scaleTitle'))}
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
            gap: isMobile ? '24px' : '32px',
            position: 'relative',
            zIndex: 2
          }}>
            {scaleStats.map((stat, index) => (
              <div
                key={index}
                ref={(el) => registerElement(el, stat.index)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '40px',
                  padding: isMobile ? '32px 28px' : '48px 40px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: visibleElements.has(stat.index) ? 1 : 0,
                  transform: visibleElements.has(stat.index) ? 'translateY(0)' : 'translateY(30px)',
                  transitionDelay: `${index * 0.1}s`,
                  boxShadow: '0 4px 20px rgba(45, 212, 191, 0.15)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-12px)'
                  e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.5)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(45, 212, 191, 0.3)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(45, 212, 191, 0.15)'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-20%',
                  right: '-15%',
                  width: '150px',
                  height: '150px',
                  background: 'rgba(45, 212, 191, 0.12)',
                  filter: 'blur(40px)',
                  pointerEvents: 'none',
                  zIndex: 0
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    fontSize: isMobile ? '32px' : '48px',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #2dd4bf 0%, rgba(45, 212, 191, 0.7) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '16px',
                    lineHeight: '1.2',
                    letterSpacing: '-1.5px',
                    textShadow: '0 2px 8px rgba(45, 212, 191, 0.3)'
                  }}>
                    {stat.value}
                  </div>
                  <p style={{
                    fontSize: isMobile ? '14px' : '16px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.6',
                    letterSpacing: '-0.3px',
                    marginBottom: stat.desc ? '8px' : '0',
                    textShadow: '0 2px 6px rgba(0, 0, 0, 0.5)'
                  }}>
                    {stat.label}
                  </p>
                  {stat.desc && (
                    <p style={{
                      fontSize: isMobile ? '12px' : '13px',
                      color: 'rgba(255, 255, 255, 0.75)',
                      lineHeight: '1.5',
                      letterSpacing: '-0.2px',
                      textShadow: '0 1px 4px rgba(0, 0, 0, 0.4)'
                    }}>
                      {stat.desc}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Efficiency and Results */}
        <div 
          ref={(el) => registerElement(el, 'section-2')}
          style={{
            marginBottom: isMobile ? '80px' : '120px',
            position: 'relative',
            opacity: visibleElements.has('section-2') ? 1 : 0,
            transform: visibleElements.has('section-2') ? 'translateY(0)' : 'translateY(50px)',
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
          
          <div style={{
            position: 'absolute',
            top: isMobile ? '-30px' : '-60px',
            right: isMobile ? '5%' : '10%',
            fontSize: isMobile ? '150px' : '280px',
            fontWeight: '900',
            color: 'rgba(45, 212, 191, 0.05)',
            lineHeight: '1',
            letterSpacing: '-10px',
            pointerEvents: 'none',
            zIndex: 1
          }}>
            02
          </div>

          <div style={{
            position: 'absolute',
            top: isMobile ? '10%' : '5%',
            left: isMobile ? '0%' : '5%',
            width: isMobile ? '140px' : '240px',
            height: isMobile ? '220px' : '380px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(45, 212, 191, 0.12), rgba(45, 212, 191, 0.06))',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '40px',
            opacity: visibleElements.has('section-2') ? 0.85 : 0,
            transform: visibleElements.has('section-2') 
              ? `translate(${scrollY * 0.08}px, ${scrollY * -0.05}px) rotate(-12deg)` 
              : 'translate(-100px, 100px) rotate(0deg)',
            transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease-out',
            boxShadow: '0 30px 80px rgba(45, 212, 191, 0.15), inset 0 0 60px rgba(255, 255, 255, 0.08)',
            zIndex: 0,
            pointerEvents: 'none'
          }}>
            <div style={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              width: '40%',
              height: '30%',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), transparent)',
              filter: 'blur(15px)'
            }} />
          </div>

          <h3 style={{
            fontSize: isMobile ? '26px' : '48px',
            fontWeight: '600',
            color: 'white',
            marginBottom: isMobile ? '50px' : '70px',
            letterSpacing: isMobile ? '-0.5px' : '-1px',
            position: 'relative',
            zIndex: 2,
            textAlign: isMobile ? 'left' : 'right',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)',
            lineHeight: '1.2'
          }}>
            {fixPrepositions(t('efficiencyTitle'))}
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: isMobile ? '24px' : '32px',
            position: 'relative',
            zIndex: 2
          }}>
            {efficiencyStats.map((stat, index) => (
              <div
                key={index}
                ref={(el) => registerElement(el, stat.index)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '40px',
                  padding: isMobile ? '32px 28px' : '48px 40px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: visibleElements.has(stat.index) ? 1 : 0,
                  transform: visibleElements.has(stat.index) ? 'translateY(0)' : 'translateY(30px)',
                  transitionDelay: `${index * 0.15}s`,
                  boxShadow: '0 4px 20px rgba(45, 212, 191, 0.15)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-12px)'
                  e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.5)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(45, 212, 191, 0.3)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(45, 212, 191, 0.15)'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-20%',
                  right: '-15%',
                  width: '150px',
                  height: '150px',
                  background: 'rgba(45, 212, 191, 0.12)',
                  filter: 'blur(40px)',
                  pointerEvents: 'none',
                  zIndex: 0
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    fontSize: isMobile ? '40px' : '56px',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #2dd4bf 0%, rgba(45, 212, 191, 0.7) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '16px',
                    lineHeight: '1',
                    letterSpacing: '-2px',
                    textShadow: '0 2px 8px rgba(45, 212, 191, 0.3)'
                  }}>
                    {stat.value}
                  </div>
                  <p style={{
                    fontSize: isMobile ? '14px' : '16px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.6',
                    letterSpacing: '-0.3px',
                    marginBottom: stat.desc ? '8px' : '0',
                    textShadow: '0 2px 6px rgba(0, 0, 0, 0.5)'
                  }}>
                    {stat.label}
                  </p>
                  {stat.desc && (
                    <p style={{
                      fontSize: isMobile ? '11px' : '12px',
                      color: 'rgba(255, 255, 255, 0.75)',
                      lineHeight: '1.5',
                      letterSpacing: '-0.2px',
                      textShadow: '0 1px 4px rgba(0, 0, 0, 0.4)'
                    }}>
                      {stat.desc}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div 
          ref={(el) => registerElement(el, 'cta')}
          style={{
            textAlign: 'center',
            opacity: visibleElements.has('cta') ? 1 : 0,
            transform: visibleElements.has('cta') ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
            marginBottom: isMobile ? '50px' : '70px'
          }}>
          <a
            href="/directions"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)',
              color: '#000000',
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: '600',
              padding: isMobile ? '18px 36px' : '20px 48px',
              borderRadius: '32px',
              textDecoration: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 10px 30px rgba(45, 212, 191, 0.4)',
              letterSpacing: '-0.3px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(45, 212, 191, 0.5)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(45, 212, 191, 0.4)'
            }}
          >
            {fixPrepositions(t('viewPlans'))}
          </a>
        </div>

        {/* Last Update Time */}
        <div 
          ref={(el) => registerElement(el, 'timestamp')}
          style={{
            textAlign: 'center',
            opacity: visibleElements.has('timestamp') ? 1 : 0,
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
            transitionDelay: '0.2s'
          }}>
          <p style={{
            fontSize: isMobile ? '12px' : '13px',
            color: 'rgba(255, 255, 255, 0.7)',
            letterSpacing: '0.5px',
            textShadow: '0 2px 6px rgba(0, 0, 0, 0.6)'
          }}>
            {fixPrepositions(t('lastUpdate'))}: {currentTime}
          </p>
        </div>

        {/* Floating ambient orbs */}
        {!isMobile && (
          <>
            <div style={{
              position: 'absolute',
              top: '25%',
              right: '8%',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(45, 212, 191, 0.25), transparent 70%)',
              filter: 'blur(30px)',
              opacity: visibleElements.has('section-1') ? 0.6 : 0,
              transform: visibleElements.has('section-1') 
                ? `translate(${Math.sin(scrollY * 0.01) * 30}px, ${Math.cos(scrollY * 0.01) * 30}px)` 
                : 'translate(0, 0)',
              transition: 'opacity 2s, transform 0.3s ease-out',
              pointerEvents: 'none',
              zIndex: 0
            }} />

            <div style={{
              position: 'absolute',
              top: '55%',
              left: '12%',
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(45, 212, 191, 0.2), transparent 70%)',
              filter: 'blur(40px)',
              opacity: visibleElements.has('section-2') ? 0.5 : 0,
              transform: visibleElements.has('section-2') 
                ? `translate(${Math.cos(scrollY * 0.008) * 40}px, ${Math.sin(scrollY * 0.008) * 40}px)` 
                : 'translate(0, 0)',
              transition: 'opacity 2s, transform 0.3s ease-out',
              pointerEvents: 'none',
              zIndex: 0
            }} />
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.2);
          }
        }
      `}</style>
    </section>
  )
}