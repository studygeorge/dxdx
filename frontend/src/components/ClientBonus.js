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
      bonusTitle: 'DXCapital Partnership Program',
      bonusSubtitle: 'What is it and why',
      
      mainDesc: 'The partnership program is a way to earn with DXCapital, even if you do not invest yourself. You simply recommend the platform to friends or subscribers, and receive real money in USDT for each deposit registered with your code. The more people you invite, the higher your percentage and income. The program is suitable for everyone: from regular users to bloggers and investors.',
      
      howItWorksTitle: 'How it works',
      howItWorksDesc: '1. After registration, you receive a personal partner code.\n2. Send it to friends, colleagues or publish it on your social networks.\n3. Everyone who registers with your code and makes a deposit brings you a bonus.\n4. The more people you invite, the higher your percentage from each next invited person.',
      
      earningsTitle: 'How much can you earn',
      earningsTable: [
        { people: '1 person', percent: '3%' },
        { people: '2–3 people', percent: '4%' },
        { people: '4–5 people', percent: '5%' },
        { people: '6–9 people', percent: '6%' },
        { people: '10 people and more', percent: '7%' }
      ],
      earningsExtra: 'Additionally: When your invited people invite their friends, you also receive a 3% bonus from their deposits (this is the second level).',
      
      payoutTitle: 'When payments arrive',
      payoutDesc: 'All bonuses are credited automatically in USDT currency and are available for instant withdrawal - without waiting and limits. You decide what to do with the bonus: withdraw to your wallet, or add to your deposit to increase income.',
      
      exampleTitle: 'Example',
      exampleDesc: '- You invited one person who registered on our DXCapital platform and deposited $1000 - this means you automatically receive $30 (3% of your invited person\'s deposit amount).\n- After the fifth invited person, your bonus increased to 5%.\n- Now each next deposit of your invited people will bring 5%, and after the tenth — 7%.\n- If your friends invite new people, you receive an additional 3% from their deposits.',
      
      ambassadorTitle: 'DX Ambassador - reward for volume',
      ambassadorDesc: 'If all your invited people deposited a total of more than $50,000, you receive DX Ambassador status. It gives: personalized conditions and increased bonuses, direct support from the DXCapital team, participation in closed partner programs.',
      
      clubTitle: 'DXClub - closed partner community',
      clubDesc: 'The most active partners become part of DXClub - this is a community where you get: invitations to closed meetings and presentations, early access to new products, direct communication with the DXCapital team and board of directors.'
    },
    ru: {
      bonusTitle: 'Партнёрская программа DXCapital',
      bonusSubtitle: 'Что это и зачем',
      
      mainDesc: 'Партнёрская программа - это способ зарабатывать вместе с DXCapital, даже если вы сами не инвестируете. Вы просто рекомендуете платформу друзьям или подписчикам, и получаете реальные деньги в USDT за каждый депозит, зарегистрированный по вашему коду. Чем больше людей вы приглашаете, тем выше ваш процент и доход. Программа подходит для всех: от обычных пользователей до блогеров и инвесторов.',
      
      howItWorksTitle: 'Как это работает',
      howItWorksDesc: '1. После регистрации вы получаете личный партнёрский код.\n2. Отправляете его друзьям, коллегам или публикуете у себя в соц.сетях.\n3. Каждый, кто регистрируется по вашему коду и вносит депозит, приносит вам бонус.\n4. Чем больше людей вы пригласите, тем выше ваш процент с каждого следующего приглашённого.',
      
      earningsTitle: 'Сколько можно заработать',
      earningsTable: [
        { people: '1 человек', percent: '3%' },
        { people: '2–3 человека', percent: '4%' },
        { people: '4–5 человек', percent: '5%' },
        { people: '6–9 человек', percent: '6%' },
        { people: '10 человек и больше', percent: '7%' }
      ],
      earningsExtra: 'Дополнительно: Когда ваши приглашённые зовут своих друзей, вы тоже получаете бонус 3% от их депозитов (это второй уровень).',
      
      payoutTitle: 'Когда приходят выплаты',
      payoutDesc: 'Все бонусы начисляются автоматически в валюте USDT и доступны для моментального вывода - без ожиданий и лимитов. Вы сами решаете, что делать с бонусом: вывести на свой кошелёк, или добавить к депозиту, чтобы увеличить доход.',
      
      exampleTitle: 'Пример',
      exampleDesc: '- Вы пригласили одного человека, который зарегистрировался на нашей платформе DXCapital и внёс $1000 - это значит, что вы автоматически получаете $30 (3% от суммы депозита вашего приглашённого).\n- После пятого приглашённого ваш бонус увеличился до 5%.\n- Теперь каждый следующий депозит ваших приглашённых будет приносить 5%, а после десятого — 7%.\n- Если ваши друзья приглашают новых людей, вы получаете дополнительно 3% с их депозитов.',
      
      ambassadorTitle: 'DX Ambassador - награда за объём',
      ambassadorDesc: 'Если все ваши приглашённые внесли в сумме более $50,000, вы получаете статус DX Ambassador. Он даёт: персональные условия и повышенные бонусы, прямое сопровождение от команды DXCapital, участие в закрытых партнёрских программах.',
      
      clubTitle: 'DXClub - закрытое сообщество партнёров',
      clubDesc: 'Самые активные партнёры становятся частью DXClub - это сообщество, где вы получаете: приглашения на закрытые встречи и презентации, ранний доступ к новым продуктам, прямое общение с командой DXCapital и советом директоров.'
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
  const [visibleElements, setVisibleElements] = useState(new Set(['header', 'main-desc', 'how-it-works', 'earnings', 'payout', 'example', 'ambassador', 'club']))
  const observerRef = useRef(null)
  const initialLoadRef = useRef(true)

  useEffect(() => {
    if (initialLoadRef.current) {
      const timer = setTimeout(() => {
        initialLoadRef.current = false
      }, 100)
      return () => clearTimeout(timer)
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements((prev) => new Set([...prev, entry.target.dataset.index]))
          }
        })
      },
      {
        threshold: 0.2,
        rootMargin: '0px'
      }
    )

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  const registerElement = (element, index) => {
    if (element && observerRef.current && !initialLoadRef.current) {
      element.dataset.index = index
      observerRef.current.observe(element)
    }
  }

  return { visibleElements, registerElement }
}

export default function ClientBonus({ isMobile, isTablet }) {
  const { t } = useTranslation()
  const { visibleElements, registerElement } = useScrollAnimation()
  const scrollY = useScrollPosition()
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const [videoLoaded, setVideoLoaded] = useState(false)

  const howItWorksVisible = visibleElements.has('how-it-works')
  const earningsVisible = visibleElements.has('earnings')

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

  return (
    <section 
      ref={containerRef}
      id="client-bonus" 
      style={{
        padding: isMobile ? '20px 20px 80px' : '0 40px 120px',
        paddingTop: isMobile ? '20px' : '0',
        marginTop: '10px',
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
          src="/profile/ClientBonusmobile.mp4" 
          type="video/mp4" 
          media="(max-width: 768px)" 
        />
        <source 
          src="/profile/ClientBonuspk.mp4" 
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
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
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
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.6), 0 0 40px rgba(45, 212, 191, 0.3)'
          }}>
            {fixPrepositions(t('bonusTitle'))}
          </h2>
          <p style={{
            fontSize: isMobile ? '18px' : '22px',
            color: 'rgba(255, 255, 255, 0.75)',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6',
            letterSpacing: '-0.5px',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
          }}>
            {fixPrepositions(t('bonusSubtitle'))}
          </p>
        </div>

        {/* Main Description */}
        <div 
          ref={(el) => registerElement(el, 'main-desc')}
          style={{
            textAlign: 'center',
            marginBottom: isMobile ? '80px' : '120px',
            opacity: visibleElements.has('main-desc') ? 1 : 0,
            transform: visibleElements.has('main-desc') 
              ? `translateY(${scrollY * 0.05}px)` 
              : 'translateY(50px)',
            transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            zIndex: 2
          }}>
          <p style={{
            fontSize: isMobile ? '18px' : '26px',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '1100px',
            margin: '0 auto',
            lineHeight: '1.7',
            fontWeight: '400',
            letterSpacing: '-0.5px',
            whiteSpace: 'pre-line',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
          }}>
            {fixPrepositions(t('mainDesc'))}
          </p>
        </div>

        {/* How it works */}
        <div 
          ref={(el) => registerElement(el, 'how-it-works')}
          style={{
            position: 'relative',
            marginBottom: isMobile ? '120px' : '180px',
            minHeight: isMobile ? '400px' : '500px'
          }}>
          {/* Background Number */}
          <div style={{
            position: 'absolute',
            top: isMobile ? '-50px' : '-80px',
            left: isMobile ? '5%' : '10%',
            fontSize: isMobile ? '180px' : '320px',
            fontWeight: '900',
            color: 'rgba(45, 212, 191, 0.04)',
            lineHeight: '1',
            letterSpacing: '-10px',
            opacity: howItWorksVisible ? 1 : 0,
            transform: howItWorksVisible ? 'scale(1)' : 'scale(0.8)',
            transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'none',
            zIndex: 1
          }}>
            01
          </div>

          {/* Floating Sphere */}
          <div style={{
            position: 'absolute',
            bottom: isMobile ? '-60px' : '-80px',
            right: isMobile ? '5%' : '10%',
            width: isMobile ? '200px' : '350px',
            height: isMobile ? '200px' : '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.18), rgba(45, 212, 191, 0.12) 40%, rgba(45, 212, 191, 0.06) 70%, transparent 90%)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            opacity: howItWorksVisible ? 0.9 : 0,
            transform: howItWorksVisible 
              ? `translate(${scrollY * -0.03}px, ${scrollY * 0.02}px) scale(1)` 
              : 'translate(100px, 100px) scale(0.5)',
            transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease-out',
            boxShadow: '0 20px 60px rgba(45, 212, 191, 0.2), inset 0 0 40px rgba(255, 255, 255, 0.1)',
            zIndex: 1,
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

          {/* Content */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            paddingLeft: isMobile ? '0' : '5%',
            paddingTop: isMobile ? '120px' : '150px',
            opacity: howItWorksVisible ? 1 : 0,
            transform: howItWorksVisible ? 'translateX(0)' : 'translateX(-100px)',
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
            transitionDelay: '0.3s'
          }}>
            <h3 style={{
              fontSize: isMobile ? '36px' : '56px',
              fontWeight: '600',
              color: 'white',
              marginBottom: '32px',
              letterSpacing: '-1.5px',
              maxWidth: '700px',
              textShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 30px rgba(45, 212, 191, 0.25)'
            }}>
              {fixPrepositions(t('howItWorksTitle'))}
            </h3>
            <p style={{
              fontSize: isMobile ? '16px' : '20px',
              color: 'rgba(255, 255, 255, 0.85)',
              lineHeight: '1.9',
              maxWidth: '650px',
              letterSpacing: '-0.3px',
              whiteSpace: 'pre-line',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
            }}>
              {fixPrepositions(t('howItWorksDesc'))}
            </p>
          </div>
        </div>

        {/* Earnings Table */}
        <div 
          ref={(el) => registerElement(el, 'earnings')}
          style={{
            position: 'relative',
            marginBottom: isMobile ? '120px' : '180px',
            minHeight: isMobile ? '500px' : '600px'
          }}>
          {/* Background Number */}
          <div style={{
            position: 'absolute',
            top: isMobile ? '-50px' : '-80px',
            right: isMobile ? '5%' : '10%',
            fontSize: isMobile ? '180px' : '320px',
            fontWeight: '900',
            color: 'rgba(45, 212, 191, 0.04)',
            lineHeight: '1',
            letterSpacing: '-10px',
            opacity: earningsVisible ? 1 : 0,
            transform: earningsVisible ? 'scale(1)' : 'scale(0.8)',
            transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'none',
            zIndex: 1
          }}>
            02
          </div>

          {/* Floating Rectangle */}
          <div style={{
            position: 'absolute',
            bottom: isMobile ? '-80px' : '-100px',
            left: isMobile ? '5%' : '8%',
            width: isMobile ? '150px' : '250px',
            height: isMobile ? '250px' : '400px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(45, 212, 191, 0.1), rgba(45, 212, 191, 0.05))',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '40px',
            opacity: earningsVisible ? 0.85 : 0,
            transform: earningsVisible 
              ? `translate(${scrollY * 0.05}px, ${scrollY * -0.03}px) rotate(-12deg)` 
              : 'translate(-100px, 100px) rotate(0deg)',
            transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease-out',
            boxShadow: '0 30px 80px rgba(45, 212, 191, 0.15), inset 0 0 60px rgba(255, 255, 255, 0.08)',
            zIndex: 1,
            pointerEvents: 'none'
          }}>
            <div style={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              width: '40%',
              height: '30%',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35), transparent)',
              filter: 'blur(15px)'
            }} />
          </div>

          {/* Content */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            paddingRight: isMobile ? '0' : '5%',
            paddingTop: isMobile ? '120px' : '150px',
            textAlign: isMobile ? 'left' : 'right',
            opacity: earningsVisible ? 1 : 0,
            transform: earningsVisible ? 'translateX(0)' : 'translateX(100px)',
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
            transitionDelay: '0.3s'
          }}>
            <h3 style={{
              fontSize: isMobile ? '36px' : '56px',
              fontWeight: '600',
              color: 'white',
              marginBottom: '40px',
              letterSpacing: '-1.5px',
              maxWidth: isMobile ? '100%' : '700px',
              marginLeft: isMobile ? '0' : 'auto',
              textShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 30px rgba(45, 212, 191, 0.25)'
            }}>
              {fixPrepositions(t('earningsTitle'))}
            </h3>

            {/* Table */}
            <div style={{
              background: `
                linear-gradient(135deg, 
                  rgba(45, 212, 191, 0.15) 0%,
                  rgba(45, 212, 191, 0.08) 50%,
                  rgba(45, 212, 191, 0.12) 100%
                )
              `,
              backdropFilter: 'blur(30px) saturate(150%)',
              WebkitBackdropFilter: 'blur(30px) saturate(150%)',
              borderRadius: '32px',
              border: '1px solid rgba(45, 212, 191, 0.35)',
              overflow: 'hidden',
              marginBottom: '32px',
              maxWidth: isMobile ? '100%' : '650px',
              marginLeft: isMobile ? '0' : 'auto',
              position: 'relative',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(45, 212, 191, 0.7), transparent)'
              }} />
              
              {t('earningsTable').map((row, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '24px',
                    padding: isMobile ? '20px 24px' : '24px 32px',
                    borderBottom: index < t('earningsTable').length - 1 ? '1px solid rgba(45, 212, 191, 0.2)' : 'none',
                    transition: 'all 0.4s',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(45, 212, 191, 0.12)'
                    e.currentTarget.style.transform = 'translateX(-4px)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  <div style={{
                    fontSize: isMobile ? '16px' : '19px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: '500',
                    letterSpacing: '-0.3px',
                    textAlign: 'left',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
                  }}>
                    {fixPrepositions(row.people)}
                  </div>
                  <div style={{
                    fontSize: isMobile ? '24px' : '32px',
                    color: '#2dd4bf',
                    fontWeight: '700',
                    letterSpacing: '-1px',
                    textShadow: '0 0 20px rgba(45, 212, 191, 0.5)'
                  }}>
                    {row.percent}
                  </div>
                </div>
              ))}
            </div>

            <p style={{
              fontSize: isMobile ? '15px' : '18px',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.8',
              maxWidth: isMobile ? '100%' : '650px',
              letterSpacing: '-0.3px',
              whiteSpace: 'pre-line',
              marginLeft: isMobile ? '0' : 'auto',
              textAlign: isMobile ? 'left' : 'right',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
            }}>
              {fixPrepositions(t('earningsExtra'))}
            </p>
          </div>
        </div>

        {/* Payout */}
        <div 
          ref={(el) => registerElement(el, 'payout')}
          style={{
            marginBottom: isMobile ? '80px' : '120px',
            opacity: visibleElements.has('payout') ? 1 : 0,
            transform: visibleElements.has('payout') 
              ? `translateY(${scrollY * -0.03}px)` 
              : 'translateY(50px)',
            transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
          <h3 style={{
            fontSize: isMobile ? '32px' : '48px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '28px',
            letterSpacing: '-1px',
            textShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 25px rgba(45, 212, 191, 0.2)'
          }}>
            {fixPrepositions(t('payoutTitle'))}
          </h3>
          <p style={{
            fontSize: isMobile ? '17px' : '22px',
            color: 'rgba(255, 255, 255, 0.85)',
            lineHeight: '1.8',
            maxWidth: '1000px',
            letterSpacing: '-0.4px',
            whiteSpace: 'pre-line',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
          }}>
            {fixPrepositions(t('payoutDesc'))}
          </p>
        </div>

        {/* Example */}
        <div 
          ref={(el) => registerElement(el, 'example')}
          style={{
            marginBottom: isMobile ? '100px' : '140px',
            opacity: visibleElements.has('example') ? 1 : 0,
            transform: visibleElements.has('example') 
              ? `translateY(${scrollY * -0.04}px)` 
              : 'translateY(50px)',
            transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)',
            background: `
              linear-gradient(135deg, 
                rgba(45, 212, 191, 0.18) 0%,
                rgba(45, 212, 191, 0.1) 50%,
                rgba(45, 212, 191, 0.15) 100%
              )
            `,
            backdropFilter: 'blur(30px) saturate(150%)',
            WebkitBackdropFilter: 'blur(30px) saturate(150%)',
            borderRadius: '40px',
            padding: isMobile ? '40px 28px' : '56px 48px',
            border: '1px solid rgba(45, 212, 191, 0.4)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
          }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #2dd4bf, transparent)'
          }} />
          
          <h3 style={{
            fontSize: isMobile ? '32px' : '48px',
            fontWeight: '600',
            color: '#2dd4bf',
            marginBottom: '28px',
            letterSpacing: '-1px',
            textShadow: '0 0 30px rgba(45, 212, 191, 0.6)'
          }}>
            {fixPrepositions(t('exampleTitle'))}
          </h3>
          <p style={{
            fontSize: isMobile ? '17px' : '22px',
            color: 'rgba(255, 255, 255, 0.95)',
            lineHeight: '1.8',
            letterSpacing: '-0.4px',
            whiteSpace: 'pre-line',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
          }}>
            {fixPrepositions(t('exampleDesc'))}
          </p>
        </div>

        {/* Ambassador */}
        <div 
          ref={(el) => registerElement(el, 'ambassador')}
          style={{
            marginBottom: isMobile ? '80px' : '120px',
            opacity: visibleElements.has('ambassador') ? 1 : 0,
            transform: visibleElements.has('ambassador') 
              ? `translateY(${scrollY * -0.03}px)` 
              : 'translateY(50px)',
            transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
          <h3 style={{
            fontSize: isMobile ? '32px' : '48px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '28px',
            letterSpacing: '-1px',
            textShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 25px rgba(45, 212, 191, 0.2)'
          }}>
            {fixPrepositions(t('ambassadorTitle'))}
          </h3>
          <p style={{
            fontSize: isMobile ? '17px' : '22px',
            color: 'rgba(255, 255, 255, 0.85)',
            lineHeight: '1.8',
            maxWidth: '1000px',
            letterSpacing: '-0.4px',
            whiteSpace: 'pre-line',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
          }}>
            {fixPrepositions(t('ambassadorDesc'))}
          </p>
        </div>

        {/* Club */}
        <div 
          ref={(el) => registerElement(el, 'club')}
          style={{
            opacity: visibleElements.has('club') ? 1 : 0,
            transform: visibleElements.has('club') 
              ? `translateY(${scrollY * -0.03}px)` 
              : 'translateY(50px)',
            transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
          <h3 style={{
            fontSize: isMobile ? '32px' : '48px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '28px',
            letterSpacing: '-1px',
            textShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 25px rgba(45, 212, 191, 0.2)'
          }}>
            {fixPrepositions(t('clubTitle'))}
          </h3>
          <p style={{
            fontSize: isMobile ? '17px' : '22px',
            color: 'rgba(255, 255, 255, 0.85)',
            lineHeight: '1.8',
            maxWidth: '1000px',
            letterSpacing: '-0.4px',
            whiteSpace: 'pre-line',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
          }}>
            {fixPrepositions(t('clubDesc'))}
          </p>
        </div>

        {/* Floating Decorative Elements */}
        {!isMobile && (
          <>
            <div style={{
              position: 'absolute',
              top: '40%',
              right: '3%',
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(45, 212, 191, 0.25), transparent 70%)',
              filter: 'blur(35px)',
              opacity: 0.6,
              transform: `translate(${Math.sin(scrollY * 0.01) * 30}px, ${Math.cos(scrollY * 0.01) * 30}px)`,
              transition: 'transform 0.3s ease-out',
              pointerEvents: 'none',
              zIndex: 0
            }} />

            <div style={{
              position: 'absolute',
              top: '70%',
              left: '8%',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(45, 212, 191, 0.2), transparent 70%)',
              filter: 'blur(45px)',
              opacity: 0.5,
              transform: `translate(${Math.cos(scrollY * 0.008) * 40}px, ${Math.sin(scrollY * 0.008) * 40}px)`,
              transition: 'transform 0.3s ease-out',
              pointerEvents: 'none',
              zIndex: 0
            }} />
          </>
        )}
      </div>
    </section>
  )
}