'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

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
      aiTitle1: 'Advanced',
      aiTitle2: 'AI-Powered',
      aiTitle3: 'Trading',
      
      aiDescription: 'We have combined human intelligence and algorithms, which allows us to analyze millions of market signals in real time and turn data into sustainable trading decisions.',
      
      feature1: 'AI Market Analytics',
      feature1Desc: 'Algorithms predict asset dynamics, adapting to market changes, as well as noticing signals, patterns and relationships that are not always available to human perception.',

      feature2: 'DXAnalytics',
      feature2Desc: 'Processing millions of data points per second to form optimal trading scenarios and capital allocation options.',

      feature3: 'Continuous Training of Neural Models',
      feature3Desc: 'DXCapital AI tools undergo round-the-clock training, which increases the accuracy of pattern recognition, optimizes strategies and strengthens risk control.',

      feature4: 'Manual Trade Execution',
      feature4Desc: 'Top-level control is carried out by a team of professional traders — a key factor that minimizes risks and ensures the stability of decisions.'
    },
    ru: {
      aiTitle1: 'Продвинутая',
      aiTitle2: 'ИИ-торговля',
      aiTitle3: 'Нового поколения',
      
      aiDescription: 'Мы объединили человеческий интеллект и алгоритмы, что позволяет нам анализировать миллионы рыночных сигналов в режиме реального времени и превращать данные в устойчивые торговые решения.',
      
      feature1: 'AI-аналитика рынка',
      feature1Desc: 'Алгоритмы прогнозируют динамику активов, адаптируясь к изменениям рынка, а так же замечая сигналы, паттерны и взаимосвязи, которые не всегда доступны человеческому восприятию.',

      feature2: 'DXAnalytics',
      feature2Desc: 'Обработка миллионов точек данных в секунду для формирования оптимальных торговых сценариев и вариантов распределения капитала.',

      feature3: 'Непрерывное обучение нейронных моделей',
      feature3Desc: 'AI-инструменты DXCapital проходят круглосуточное обучение, что повышает точность распознавания закономерностей, оптимизирует стратегии и усиливает контроль рисков.',

      feature4: 'Ручное исполнение сделок',
      feature4Desc: 'Верхнеуровневый контроль осуществляется командой профессиональных трейдеров — ключевой фактор, минимизирующий риски и обеспечивающий стабильность решений.'
    }
  }

  const t = (key) => translations[language]?.[key] || translations.en[key] || key
  return { t, language }
}

export default function TradingWorkspace({ isMobile, isTablet }) {
  const { t } = useTranslation()
  const [imageProgress, setImageProgress] = useState(0)
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return

      const rect = sectionRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      if (rect.top < windowHeight && rect.bottom > 0) {
        setIsVisible(true)
        
        const sectionTop = rect.top
        const sectionHeight = rect.height
        
        if (sectionTop < windowHeight / 2 && sectionTop > -sectionHeight / 2) {
          const progress = Math.max(0, Math.min(1, (windowHeight / 2 - sectionTop) / (windowHeight / 2)))
          setImageProgress(progress)
        } else if (sectionTop <= -sectionHeight / 2) {
          setImageProgress(1)
        } else {
          setImageProgress(0)
        }
      } else {
        setIsVisible(false)
        setImageProgress(0)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const manOpacity = imageProgress < 0.3 ? 1 : Math.max(0, 1 - ((imageProgress - 0.3) / 0.4))
  const robotOpacity = imageProgress < 0.3 ? 0 : Math.min(1, (imageProgress - 0.3) / 0.4)

  const features = [
    {
      number: '01',
      title: t('feature1'),
      desc: t('feature1Desc')
    },
    {
      number: '02',
      title: t('feature2'),
      desc: t('feature2Desc')
    },
    {
      number: '03',
      title: t('feature3'),
      desc: t('feature3Desc')
    },
    {
      number: '04',
      title: t('feature4'),
      desc: t('feature4Desc')
    }
  ]

  return (
    <div style={{ marginBottom: '100px' }} ref={sectionRef}>
      {/* Background Image Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: isMobile ? 'auto' : '600px',
        aspectRatio: isMobile ? '16/9' : 'auto',
        marginBottom: '60px',
        borderRadius: '32px',
        overflow: 'hidden',
        background: '#000'
      }}>
        {/* Man Image */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: manOpacity,
          transition: 'opacity 0.5s ease-out'
        }}>
          <Image
            src="/images/man.png"
            alt="Professional Trader"
            fill
            style={{
              objectFit: isMobile ? 'contain' : 'cover',
              objectPosition: isMobile ? 'center right' : 'center'
            }}
            priority
            quality={100}
          />
        </div>

        {/* Man + Robot Image */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: robotOpacity,
          transition: 'opacity 0.5s ease-out'
        }}>
          <Image
            src="/images/manplusrobot.png"
            alt="AI-Powered Trading"
            fill
            style={{
              objectFit: isMobile ? 'contain' : 'cover',
              objectPosition: isMobile ? 'center right' : 'center'
            }}
            priority
            quality={100}
          />
        </div>

        {/* Dark Gradient Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: isMobile 
            ? `linear-gradient(90deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.1) 100%)`
            : `linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.8) 100%)`,
          zIndex: 1
        }} />

        {/* Title Overlay on Image */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: isMobile ? 'flex-end' : 'center',
          justifyContent: isMobile ? 'flex-end' : 'center',
          zIndex: 2,
          padding: isMobile ? '20px' : '40px'
        }}>
          <div style={{
            textAlign: isMobile ? 'right' : 'right',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(60px)',
            transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            maxWidth: isMobile ? '60%' : '100%',
            width: isMobile ? 'auto' : '100%',
            paddingRight: isMobile ? '0' : '40px',
            paddingBottom: isMobile ? '20px' : '0'
          }}>
            <h2 style={{
              fontSize: isMobile ? '24px' : isTablet ? '48px' : '64px',
              fontWeight: '800',
              lineHeight: '1.1',
              marginBottom: '0',
              letterSpacing: '-2px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline-block',
                marginBottom: '8px'
              }}>
                {fixPrepositions(t('aiTitle1'))}
              </div>
              <br />
              <div style={{
                background: 'linear-gradient(135deg, #2dd4bf 0%, rgba(45, 212, 191, 0.8) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline-block',
                filter: 'drop-shadow(0 0 30px rgba(45, 212, 191, 0.4))',
                marginBottom: '8px'
              }}>
                {fixPrepositions(t('aiTitle2'))}
              </div>
              <br />
              <div style={{
                background: 'linear-gradient(135deg, #2dd4bf 0%, #ffffff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline-block'
              }}>
                {fixPrepositions(t('aiTitle3'))}
              </div>
            </h2>
          </div>
        </div>
      </div>

      {/* Description Glass Block */}
      <div style={{
        textAlign: 'center',
        marginBottom: '60px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '32px',
          padding: isMobile ? '28px 24px' : '40px 60px',
          maxWidth: '900px',
          margin: '0 auto',
          position: 'relative',
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
        }}>
          {/* Glass Reflection */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '20%',
            width: '60%',
            height: '40%',
            background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.15), transparent 70%)',
            filter: 'blur(30px)',
            pointerEvents: 'none',
            zIndex: 1
          }} />

          <p style={{
            fontSize: isMobile ? '16px' : '20px',
            lineHeight: '1.8',
            color: 'rgba(255, 255, 255, 0.9)',
            margin: 0,
            fontWeight: '400',
            letterSpacing: '-0.5px',
            position: 'relative',
            zIndex: 2
          }}>
            {fixPrepositions(t('aiDescription'))}
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? '16px' : '24px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {features.map((feature, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              border: '1px solid rgba(45, 212, 191, 0.2)',
              borderRadius: '32px',
              padding: isMobile ? '24px 20px' : '32px 28px',
              transition: 'all 0.3s',
              cursor: 'pointer',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              if (!isMobile) {
                e.currentTarget.style.background = 'rgba(45, 212, 191, 0.08)'
                e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.4)'
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(45, 212, 191, 0.2)'
              }
            }}
            onMouseOut={(e) => {
              if (!isMobile) {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)'
                e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.2)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }
            }}
          >
            {/* Top Line */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(45, 212, 191, 0.4), transparent)'
            }} />

            {/* Background Number */}
            <div style={{
              position: 'absolute',
              top: isMobile ? '-15px' : '-20px',
              right: isMobile ? '-5px' : '-10px',
              fontSize: isMobile ? '70px' : '110px',
              fontWeight: '900',
              background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.08), rgba(45, 212, 191, 0.02))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: '1',
              letterSpacing: '-3px',
              pointerEvents: 'none',
              zIndex: 0
            }}>
              {feature.number}
            </div>

            {/* Number Badge */}
            <div style={{
              fontSize: isMobile ? '28px' : '36px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #2dd4bf 0%, rgba(45, 212, 191, 0.6) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: isMobile ? '16px' : '20px',
              letterSpacing: '-1px',
              position: 'relative',
              zIndex: 1
            }}>
              {feature.number}
            </div>

            {/* Title */}
            <h3 style={{
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: isMobile ? '8px' : '12px',
              lineHeight: '1.3',
              letterSpacing: '-0.5px',
              position: 'relative',
              zIndex: 1
            }}>
              {fixPrepositions(feature.title)}
            </h3>

            {/* Description */}
            <p style={{
              fontSize: isMobile ? '13px' : '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: '1.6',
              margin: 0,
              letterSpacing: '-0.3px',
              position: 'relative',
              zIndex: 1
            }}>
              {fixPrepositions(feature.desc)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}