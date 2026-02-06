'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

function fixPrepositions(text) {
  if (!text || typeof text !== 'string') return text
  return text
    .replace(/\s+в\s+/gi, ' в\u00A0')
    .replace(/\s+к\s+/gi, ' к\u00A0')
    .replace(/\s+с\s+/gi, ' с\u00A0')
    .replace(/\s+о\s+/gi, ' о\u00A0')
    .replace(/\s+и\s+/gi, ' и\u00A0')
    .replace(/\s+у\s+/gi, ' у\u00A0')
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
      pageTitle: 'About DXCapital',
      whoWeAre: 'Who We Are',
      whoWeAreText: 'DXCapital is a project based on a well-balanced combination of human expertise, technological capabilities, and artificial intelligence.',
      
      whatWeCreated: 'What We Created',
      whatWeCreatedText: 'An ecosystem where absolutely every person can not only change their financial opportunities, but also become part of a strong team of like-minded people.',
      
      whereWeGoing: 'Where We Are Going',
      whereWeGoingText: 'Towards scaling our platform, whose processes are maximally refined for competent and consistent capital management — both our own and client capital. The DXCapital team consists of professionals with continuous asset management experience of more than 9 years — during this time, strong expertise has been formed, which we have embedded in the foundation of our platform.',
      
      whatWeBelieve: 'What We Believe In',
      beliefText: 'Any resource must be in constant motion — this is the key to growth. The more actions we take so that every person can manage their life and well-being, the more new horizons and opportunities for growth open up before us. The more knowledge we pass on to you so that you can improve your standard of living, the more access we get to information for our own development, thereby creating continuous mutual exchange.',
      
      whoLeads: 'Leadership',
      leaderName: 'Vladimir Vladimirov',
      leaderRole: 'Founder & CEO',
      leaderText: 'An entrepreneur whose strong side is the ability to create teams of strong specialists, uniting them with a common mission and goal. Vladimir\'s key role within the DXCapital platform is the implementation of the path from forming an idea to its transformation into a system through engaging the best minds and the most relevant technological tools.'
    },
    ru: {
      pageTitle: 'О платформе DXCapital',
      whoWeAre: 'Кто мы',
      whoWeAreText: 'DXCapital — проект, в основе которого заложена грамотно сбалансированная комбинация человеческой экспертизы, технологических возможностей и искусственного интеллекта.',
      
      whatWeCreated: 'Что мы создали',
      whatWeCreatedText: 'Экосистему, внутри которой абсолютно каждый человек может не только изменить свои финансовые возможности, но и стать частью сильной команды единомышленников.',
      
      whereWeGoing: 'К чему мы идём',
      whereWeGoingText: 'К масштабированию нашей платформы, процессы которой максимально отточены для грамотного и последовательного управления капиталом — как нашим собственным, так и клиентским. В команде DXCapital трудятся профессионалы с непрерывным опытом управления активами более 9ти лет — за это время сформирована сильная экспертиза, которую мы и заложили в основу нашей платформы.',
      
      whatWeBelieve: 'Во что мы верим',
      beliefText: 'Любой ресурс должен быть в постоянном движении — это ключ к росту. Чем больше действий мы предпринимаем для того, чтобы каждый человек мог управлять своей жизнью и благосостоянием, тем больше новых горизонтов и возможностей для роста открывается перед нами. Чем больше знаний мы передаём вам для того, чтобы вы повышали свой уровень жизни, тем больше доступов мы получаем к информации для нашего собственного развития, тем самым создавая непрерывный взаимообмен.',
      
      whoLeads: 'Кто во главе?',
      leaderName: 'Владимир Владимиров',
      leaderRole: 'Основатель и CEO',
      leaderText: 'Предприниматель, чьей сильной стороной является умение создавать команды сильных специалистов, объединяя их общей миссией и целью. Ключевая роль Владимира в рамках платформы DXCapital — реализация пути от формирования идеи до её трансформации в систему посредством задействования лучших умов и самых актуальных технологических инструментов.'
    }
  }

  const t = (key) => {
    const translation = translations[language]?.[key] || translations.en[key] || key
    return translation
  }
  
  return { t, language }
}

export default function Team({ isMobile, isTablet }) {
  const { t } = useTranslation()
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [visibleSections, setVisibleSections] = useState({
    title: false,
    section1: false,
    section2: false,
    section3: false,
    section4: false,
    leader: false
  })

  const videoRef = useRef(null)
  const titleRef = useRef(null)
  const section1Ref = useRef(null)
  const section2Ref = useRef(null)
  const section3Ref = useRef(null)
  const section4Ref = useRef(null)
  const leaderRef = useRef(null)

  // ✅ ИСПРАВЛЕНО: Принудительная загрузка и воспроизведение видео
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
      { ref: section1Ref, name: 'section1' },
      { ref: section2Ref, name: 'section2' },
      { ref: section3Ref, name: 'section3' },
      { ref: section4Ref, name: 'section4' },
      { ref: leaderRef, name: 'leader' }
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
    <section style={{
      padding: isMobile ? '60px 20px 100px' : '100px 40px 140px',
      position: 'relative',
      minHeight: '100vh',
      overflow: 'hidden'
    }}>
      {/* ✅ ИСПРАВЛЕНО: VIDEO BACKGROUND с Tiffany эффектом */}
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
          src="/profile/Teammobile.mp4" 
          type="video/mp4" 
          media="(max-width: 768px)" 
        />
        <source 
          src="/profile/Teampc.mp4" 
          type="video/mp4" 
          media="(min-width: 769px)" 
        />
      </video>

      {/* ✅ GRADIENT OVERLAY - Tiffany эффект */}
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
          {fixPrepositions(t('pageTitle'))}
        </h1>

        {/* Section 1 */}
        <div 
          ref={section1Ref}
          style={{
            marginBottom: isMobile ? '100px' : '140px',
            opacity: visibleSections.section1 ? 1 : 0,
            transform: visibleSections.section1 ? 'translateY(0)' : 'translateY(60px)',
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div style={{
            position: 'relative',
            marginBottom: '24px'
          }}>
            <div style={{
              fontSize: isMobile ? '120px' : '180px',
              fontWeight: '900',
              color: 'rgba(45, 212, 191, 0.03)',
              position: 'absolute',
              top: '-60px',
              left: '-20px',
              lineHeight: '1',
              zIndex: 0,
              pointerEvents: 'none'
            }}>
              01
            </div>
            <h2 style={{
              fontSize: isMobile ? '40px' : '56px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '32px',
              lineHeight: '1.2',
              letterSpacing: '-1px',
              position: 'relative',
              zIndex: 1,
              textShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 30px rgba(45, 212, 191, 0.25)'
            }}>
              {fixPrepositions(t('whoWeAre'))}
            </h2>
          </div>
          <p style={{
            fontSize: isMobile ? '18px' : '24px',
            color: 'rgba(255, 255, 255, 0.95)',
            lineHeight: '1.8',
            fontWeight: '300',
            letterSpacing: '-0.5px',
            maxWidth: '900px',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
          }}>
            {fixPrepositions(t('whoWeAreText'))}
          </p>
        </div>

        {/* Section 2 */}
        <div 
          ref={section2Ref}
          style={{
            marginBottom: isMobile ? '100px' : '140px',
            opacity: visibleSections.section2 ? 1 : 0,
            transform: visibleSections.section2 ? 'translateY(0)' : 'translateY(60px)',
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
            textAlign: isMobile ? 'left' : 'right'
          }}
        >
          <div style={{
            position: 'relative',
            marginBottom: '24px',
            display: 'inline-block',
            width: '100%'
          }}>
            <div style={{
              fontSize: isMobile ? '120px' : '180px',
              fontWeight: '900',
              color: 'rgba(45, 212, 191, 0.03)',
              position: 'absolute',
              top: '-60px',
              right: isMobile ? 'auto' : '-20px',
              left: isMobile ? '-20px' : 'auto',
              lineHeight: '1',
              zIndex: 0,
              pointerEvents: 'none'
            }}>
              02
            </div>
            <h2 style={{
              fontSize: isMobile ? '40px' : '56px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '32px',
              lineHeight: '1.2',
              letterSpacing: '-1px',
              position: 'relative',
              zIndex: 1,
              textShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 30px rgba(45, 212, 191, 0.25)'
            }}>
              {fixPrepositions(t('whatWeCreated'))}
            </h2>
          </div>
          <p style={{
            fontSize: isMobile ? '18px' : '24px',
            color: 'rgba(255, 255, 255, 0.95)',
            lineHeight: '1.8',
            fontWeight: '300',
            letterSpacing: '-0.5px',
            maxWidth: '900px',
            marginLeft: isMobile ? '0' : 'auto',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
          }}>
            {fixPrepositions(t('whatWeCreatedText'))}
          </p>
        </div>

        {/* Section 3 */}
        <div 
          ref={section3Ref}
          style={{
            marginBottom: isMobile ? '100px' : '140px',
            opacity: visibleSections.section3 ? 1 : 0,
            transform: visibleSections.section3 ? 'translateY(0)' : 'translateY(60px)',
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
            textAlign: 'center'
          }}
        >
          <div style={{
            position: 'relative',
            marginBottom: '24px'
          }}>
            <div style={{
              fontSize: isMobile ? '120px' : '180px',
              fontWeight: '900',
              color: 'rgba(45, 212, 191, 0.03)',
              position: 'absolute',
              top: '-60px',
              left: '50%',
              transform: 'translateX(-50%)',
              lineHeight: '1',
              zIndex: 0,
              pointerEvents: 'none'
            }}>
              03
            </div>
            <h2 style={{
              fontSize: isMobile ? '40px' : '56px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '32px',
              lineHeight: '1.2',
              letterSpacing: '-1px',
              position: 'relative',
              zIndex: 1,
              textShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 30px rgba(45, 212, 191, 0.25)'
            }}>
              {fixPrepositions(t('whereWeGoing'))}
            </h2>
          </div>
          <p style={{
            fontSize: isMobile ? '18px' : '24px',
            color: 'rgba(255, 255, 255, 0.95)',
            lineHeight: '1.8',
            fontWeight: '300',
            letterSpacing: '-0.5px',
            maxWidth: '1000px',
            margin: '0 auto',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
          }}>
            {fixPrepositions(t('whereWeGoingText'))}
          </p>
        </div>

        {/* Section 4 */}
        <div 
          ref={section4Ref}
          style={{
            marginBottom: isMobile ? '100px' : '140px',
            opacity: visibleSections.section4 ? 1 : 0,
            transform: visibleSections.section4 ? 'translateY(0)' : 'translateY(60px)',
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div style={{
            position: 'relative',
            marginBottom: '24px'
          }}>
            <div style={{
              fontSize: isMobile ? '120px' : '180px',
              fontWeight: '900',
              color: 'rgba(45, 212, 191, 0.03)',
              position: 'absolute',
              top: '-60px',
              left: '-20px',
              lineHeight: '1',
              zIndex: 0,
              pointerEvents: 'none'
            }}>
              04
            </div>
            <h2 style={{
              fontSize: isMobile ? '40px' : '56px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '32px',
              lineHeight: '1.2',
              letterSpacing: '-1px',
              position: 'relative',
              zIndex: 1,
              textShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 30px rgba(45, 212, 191, 0.25)'
            }}>
              {fixPrepositions(t('whatWeBelieve'))}
            </h2>
          </div>
          <p style={{
            fontSize: isMobile ? '18px' : '24px',
            color: 'rgba(255, 255, 255, 0.95)',
            lineHeight: '1.8',
            fontWeight: '300',
            letterSpacing: '-0.5px',
            maxWidth: '1000px',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
          }}>
            {fixPrepositions(t('beliefText'))}
          </p>
        </div>

        {/* Leader Section with Photo */}
        <div 
          ref={leaderRef}
          style={{
            marginTop: isMobile ? '120px' : '180px',
            opacity: visibleSections.leader ? 1 : 0,
            transform: visibleSections.leader ? 'translateY(0)' : 'translateY(60px)',
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <h2 style={{
            fontSize: isMobile ? '40px' : '56px',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: isMobile ? '60px' : '80px',
            textAlign: 'center',
            lineHeight: '1.2',
            letterSpacing: '-1px',
            textShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 30px rgba(45, 212, 191, 0.25)'
          }}>
            {fixPrepositions(t('whoLeads'))}
          </h2>

          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '40px' : '60px',
            alignItems: isMobile ? 'center' : 'flex-start',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(45, 212, 191, 0.35)',
            borderRadius: '32px',
            padding: isMobile ? '40px 24px' : '60px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
          }}>
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

            <div style={{
              position: 'relative',
              width: isMobile ? '240px' : '320px',
              flexShrink: 0,
              zIndex: 1
            }}>
              <div style={{
                position: 'relative',
                width: '100%',
                height: isMobile ? '320px' : '420px',
                borderRadius: '32px',
                overflow: 'hidden',
                border: '2px solid rgba(45, 212, 191, 0.3)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}>
                <Image
                  src="/images/Vladimir.JPG"
                  alt="Vladimir Vladimirov"
                  fill
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center top'
                  }}
                  quality={100}
                  priority
                />
              </div>
            </div>

            <div style={{
              flex: 1,
              textAlign: isMobile ? 'center' : 'left',
              position: 'relative',
              zIndex: 1
            }}>
              <h3 style={{
                fontSize: isMobile ? '32px' : '48px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '12px',
                lineHeight: '1.2',
                letterSpacing: '-1px',
                textShadow: '0 2px 12px rgba(0, 0, 0, 0.6)'
              }}>
                {fixPrepositions(t('leaderName'))}
              </h3>
              <div style={{
                fontSize: isMobile ? '18px' : '22px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #2dd4bf 0%, rgba(45, 212, 191, 0.6) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '32px',
                letterSpacing: '-0.5px'
              }}>
                {fixPrepositions(t('leaderRole'))}
              </div>
              <p style={{
                fontSize: isMobile ? '18px' : '20px',
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: '1.8',
                fontWeight: '300',
                letterSpacing: '-0.5px',
                margin: 0,
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
              }}>
                {fixPrepositions(t('leaderText'))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}