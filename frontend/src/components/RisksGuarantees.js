'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
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
      risksTitle: 'Risks & Guarantees',
      
      intro1: 'Risk is a natural part of any dynamic system, where movement creates opportunities and simultaneously forms responsibility for every decision made.',
      
      intro2: 'The DXCapital team understands this nature and has built capital management processes in such a way that risk is a controlled variable within strategically verified actions.',
      
      multilevel: 'Each of our steps is subject to several levels of analytical verification, where we use a combination of mathematical calculations, technical capabilities, artificial intelligence tools, and most importantly, expert assessment from our professional traders, each of whom has continuous asset management practice of at least 7-9 years.',
      
      blocking: 'Based on all of the above, the DXCapital team strictly blocks any operations that cause contradiction at any stage of verification, thereby minimizing risks.',
      
      keyVector: 'The key vector of DXCapital company is sustainable development.',
      
      policy: 'DXCapital policy excludes any promise of percentages that contradict our conservative capital management strategies.',
      
      participants: 'We have clearly defined that participants in our ecosystem are people striving to preserve and systematically multiply their capital. Situational emotional trading, experiments with market signals, and other high-risk approaches in pursuit of super-percentages — this is not the path for DXCapital.',
      
      stakingSystem: 'Also, for our clients, an asset management system is fully thought out — when starting interaction with the DXCapital platform, you independently determine your staking period.',
      
      stakingPeriods: 'This can be 3 months, 6, or 12 — for more detailed information about staking plans and offered conditions:',
      
      viewStakingPlans: 'View Staking Plans'
    },
    ru: {
      risksTitle: 'Риски и Гарантии',
      
      intro1: 'Риск — естественная часть любой динамичной системы, где движение создаёт возможности и одновременно формирует ответственность за каждое принятое решение.',
      
      intro2: 'Команда DXCapital понимает эту природу и выстроила процессы управления капиталом таким образом, чтобы риск был контролируемой переменной в рамках стратегически выверенных действий.',
      
      multilevel: 'Каждый наш шаг подлежит нескольким уровням аналитической проверки, где мы используем комбинацию математических расчётов, технических возможностей, инструментов искусственного интеллекта и, что самое важное, экспертной оценки наших профессиональных трейдеров, каждый из которых имеет непрерывную практику управления активами не менее 7-9 лет.',
      
      blocking: 'Опираясь на всё вышеперечисленное команда DXCapital строго блокирует любые операции, которые вызывают противоречие на любом из этапов проверки, тем самым минимизируя риски.',
      
      keyVector: 'Ключевой вектор компании DXCapital — устойчивое развитие.',
      
      policy: 'Политика DXCapital исключает любое обещание процентов, противоречащих нашим консервативным стратегиям управления капиталом.',
      
      participants: 'Мы чётко определили, что участники нашей экосистемы — люди, стремящиеся сохранить и системно приумножать свой капитал. Ситуативная эмоциональная торговля, эксперименты с сигналами рынка и прочие высокорискованные подходы в погоне за сверхпроцентами — путь не для DXCapital.',
      
      stakingSystem: 'Так же для наших клиентов полностью продумана система управления активами — при старте взаимодействия с платформой DXCapital вы самостоятельно определяете для себя период стейкинга.',
      
      stakingPeriods: 'Это могут быть 3 месяца, 6 или 12 — более подробную информацию о планах стейкинга и предлагаемых условиях:',
      
      viewStakingPlans: 'Смотреть планы стейкинга'
    }
  }

  const t = (key) => translations[language]?.[key] || translations.en[key] || key
  return { t, language }
}

export default function RisksGuarantees({ isMobile, isTablet }) {
  const { t } = useTranslation()
  const videoRef = useRef(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [visibleSections, setVisibleSections] = useState({
    title: false,
    intro1: false,
    intro2: false,
    multilevel: false,
    blocking: false,
    keyVector: false,
    policy: false,
    participants: false,
    staking: false
  })

  const titleRef = useRef(null)
  const intro1Ref = useRef(null)
  const intro2Ref = useRef(null)
  const multilevelRef = useRef(null)
  const blockingRef = useRef(null)
  const keyVectorRef = useRef(null)
  const policyRef = useRef(null)
  const participantsRef = useRef(null)
  const stakingRef = useRef(null)

  // Принудительная загрузка и воспроизведение видео
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load()
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Автовоспроизведение заблокировано - это нормально
        })
      }
    }
  }, [])

  useEffect(() => {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    }

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionName = entry.target.getAttribute('data-section')
          if (sectionName) {
            setVisibleSections(prev => ({
              ...prev,
              [sectionName]: true
            }))
          }
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    const refs = [
      { ref: titleRef, name: 'title' },
      { ref: intro1Ref, name: 'intro1' },
      { ref: intro2Ref, name: 'intro2' },
      { ref: multilevelRef, name: 'multilevel' },
      { ref: blockingRef, name: 'blocking' },
      { ref: keyVectorRef, name: 'keyVector' },
      { ref: policyRef, name: 'policy' },
      { ref: participantsRef, name: 'participants' },
      { ref: stakingRef, name: 'staking' }
    ]

    refs.forEach(({ ref, name }) => {
      if (ref.current) {
        ref.current.setAttribute('data-section', name)
        observer.observe(ref.current)
      }
    })

    return () => {
      refs.forEach(({ ref }) => {
        if (ref.current) {
          observer.unobserve(ref.current)
        }
      })
    }
  }, [])

  return (
    <section id="risks-guarantees" style={{
      padding: isMobile ? '60px 20px 100px' : '100px 40px 140px',
      position: 'relative',
      minHeight: '100vh',
      overflow: 'hidden'
    }}>
      {/* VIDEO BACKGROUND - ОПТИМИЗИРОВАНО */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onLoadedData={() => setVideoLoaded(true)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: videoLoaded ? 0.4 : 0,
          transition: 'opacity 0.6s ease-in',
          zIndex: -2
        }}
      >
        <source 
          src="/profile/RisksGuaranteesmobile.MP4" 
          type="video/mp4" 
          media="(max-width: 768px)" 
        />
        <source 
          src="/profile/RisksGuaranteespk.mp4" 
          type="video/mp4" 
          media="(min-width: 769px)" 
        />
      </video>

      {/* GRADIENT OVERLAY */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.5) 100%)',
        zIndex: -1,
        pointerEvents: 'none'
      }} />

      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Main Title */}
        <h1 
          ref={titleRef}
          style={{
            fontSize: isMobile ? '56px' : isTablet ? '72px' : '96px',
            fontWeight: '800',
            color: '#ffffff',
            marginBottom: isMobile ? '120px' : '160px',
            textAlign: 'center',
            lineHeight: '1.1',
            letterSpacing: '-2px',
            opacity: visibleSections.title ? 1 : 0,
            transform: visibleSections.title ? 'translateY(0)' : 'translateY(-50px)',
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.6), 0 0 40px rgba(45, 212, 191, 0.3)'
          }}
        >
          {fixPrepositions(t('risksTitle'))}
        </h1>

        {/* Intro 1 */}
        <div 
          ref={intro1Ref}
          style={{
            marginBottom: isMobile ? '80px' : '100px',
            opacity: visibleSections.intro1 ? 1 : 0,
            transform: visibleSections.intro1 ? 'translateY(0)' : 'translateY(60px)',
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <p style={{
            fontSize: isMobile ? '20px' : '26px',
            color: 'rgba(255, 255, 255, 0.95)',
            lineHeight: '1.8',
            fontWeight: '300',
            letterSpacing: '-0.5px',
            maxWidth: '1000px',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
          }}>
            {fixPrepositions(t('intro1'))}
          </p>
        </div>

        {/* Intro 2 */}
        <div 
          ref={intro2Ref}
          style={{
            marginBottom: isMobile ? '100px' : '140px',
            opacity: visibleSections.intro2 ? 1 : 0,
            transform: visibleSections.intro2 ? 'translateY(0)' : 'translateY(60px)',
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
            textAlign: isMobile ? 'left' : 'right'
          }}
        >
          <p style={{
            fontSize: isMobile ? '20px' : '26px',
            color: 'rgba(255, 255, 255, 0.95)',
            lineHeight: '1.8',
            fontWeight: '300',
            letterSpacing: '-0.5px',
            maxWidth: '1000px',
            marginLeft: isMobile ? '0' : 'auto',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
          }}>
            {fixPrepositions(t('intro2'))}
          </p>
        </div>

        {/* Multilevel Analysis - Glass Block */}
        <div 
          ref={multilevelRef}
          style={{
            marginBottom: isMobile ? '100px' : '140px',
            padding: isMobile ? '32px 24px' : '50px 60px',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(45, 212, 191, 0.35)',
            borderRadius: '32px',
            position: 'relative',
            overflow: 'hidden',
            opacity: visibleSections.multilevel ? 1 : 0,
            transform: visibleSections.multilevel ? 'translateY(0)' : 'translateY(60px)',
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
          }}
        >
          {/* Glass Reflection */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '20%',
            width: '60%',
            height: '40%',
            background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.12), transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
            zIndex: 0
          }} />

          <p style={{
            fontSize: isMobile ? '18px' : '22px',
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: '1.8',
            fontWeight: '300',
            letterSpacing: '-0.5px',
            margin: 0,
            position: 'relative',
            zIndex: 1,
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
          }}>
            {fixPrepositions(t('multilevel'))}
          </p>
        </div>

        {/* Blocking */}
        <div 
          ref={blockingRef}
          style={{
            marginBottom: isMobile ? '100px' : '140px',
            opacity: visibleSections.blocking ? 1 : 0,
            transform: visibleSections.blocking ? 'translateY(0)' : 'translateY(60px)',
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
            textAlign: 'center'
          }}
        >
          <p style={{
            fontSize: isMobile ? '20px' : '26px',
            color: 'rgba(255, 255, 255, 0.95)',
            lineHeight: '1.8',
            fontWeight: '300',
            letterSpacing: '-0.5px',
            maxWidth: '1000px',
            margin: '0 auto',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
          }}>
            {fixPrepositions(t('blocking'))}
          </p>
        </div>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(45, 212, 191, 0.4) 50%, transparent 100%)',
          marginBottom: isMobile ? '100px' : '140px'
        }} />

        {/* Key Vector */}
        <div 
          ref={keyVectorRef}
          style={{
            marginBottom: isMobile ? '60px' : '80px',
            opacity: visibleSections.keyVector ? 1 : 0,
            transform: visibleSections.keyVector ? 'translateY(0)' : 'translateY(60px)',
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <h2 style={{
            fontSize: isMobile ? '32px' : '44px',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '32px',
            lineHeight: '1.3',
            letterSpacing: '-1px',
            textShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 30px rgba(45, 212, 191, 0.25)'
          }}>
            {fixPrepositions(t('keyVector'))}
          </h2>
        </div>

        {/* Policy */}
        <div 
          ref={policyRef}
          style={{
            marginBottom: isMobile ? '100px' : '140px',
            opacity: visibleSections.policy ? 1 : 0,
            transform: visibleSections.policy ? 'translateY(0)' : 'translateY(60px)',
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <p style={{
            fontSize: isMobile ? '20px' : '26px',
            color: 'rgba(255, 255, 255, 0.95)',
            lineHeight: '1.8',
            fontWeight: '300',
            letterSpacing: '-0.5px',
            maxWidth: '1000px',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
          }}>
            {fixPrepositions(t('policy'))}
          </p>
        </div>

        {/* Participants - Glass Block */}
        <div 
          ref={participantsRef}
          style={{
            marginBottom: isMobile ? '100px' : '140px',
            padding: isMobile ? '32px 24px' : '50px 60px',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(45, 212, 191, 0.35)',
            borderRadius: '32px',
            position: 'relative',
            overflow: 'hidden',
            opacity: visibleSections.participants ? 1 : 0,
            transform: visibleSections.participants ? 'translateY(0)' : 'translateY(60px)',
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
          }}
        >
          {/* Glass Reflection */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '20%',
            width: '60%',
            height: '40%',
            background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.12), transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
            zIndex: 0
          }} />

          <p style={{
            fontSize: isMobile ? '18px' : '22px',
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: '1.8',
            fontWeight: '300',
            letterSpacing: '-0.5px',
            margin: 0,
            position: 'relative',
            zIndex: 1,
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
          }}>
            {fixPrepositions(t('participants'))}
          </p>
        </div>

        {/* Staking System - Final Block with Button */}
        <div 
          ref={stakingRef}
          style={{
            padding: isMobile ? '40px 24px' : '60px',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(45, 212, 191, 0.4)',
            borderRadius: '32px',
            position: 'relative',
            overflow: 'hidden',
            opacity: visibleSections.staking ? 1 : 0,
            transform: visibleSections.staking ? 'translateY(0)' : 'translateY(60px)',
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
          }}
        >
          {/* Glass Reflection */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '20%',
            width: '60%',
            height: '40%',
            background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.12), transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
            zIndex: 0
          }} />

          <p style={{
            fontSize: isMobile ? '20px' : '24px',
            color: 'rgba(255, 255, 255, 0.95)',
            lineHeight: '1.8',
            fontWeight: '300',
            letterSpacing: '-0.5px',
            marginBottom: '32px',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
          }}>
            {fixPrepositions(t('stakingSystem'))}
          </p>
          <p style={{
            fontSize: isMobile ? '18px' : '20px',
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: '1.8',
            fontWeight: '300',
            letterSpacing: '-0.5px',
            textAlign: 'center',
            marginBottom: '40px',
            position: 'relative',
            zIndex: 1,
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
          }}>
            {fixPrepositions(t('stakingPeriods'))}
          </p>

          {/* Button */}
          <div style={{
            textAlign: 'center',
            position: 'relative',
            zIndex: 1
          }}>
            <Link 
              href="/directions"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)',
                color: '#ffffff',
                padding: isMobile ? '16px 32px' : '18px 40px',
                borderRadius: '32px',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '600',
                letterSpacing: '-0.5px',
                textDecoration: 'none',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 8px 25px rgba(45, 212, 191, 0.4)',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-4px)'
                e.target.style.boxShadow = '0 12px 35px rgba(45, 212, 191, 0.6)'
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 8px 25px rgba(45, 212, 191, 0.4)'
              }}
            >
              {fixPrepositions(t('viewStakingPlans'))}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
