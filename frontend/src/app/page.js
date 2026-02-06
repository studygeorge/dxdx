'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from './hooks/useTranslation'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Features from '../components/Features'
import TradingWorkspace from '../components/TradingWorkspace'
import StakingSection from '../components/StakingSection'
import TradingResults from '../components/TradingResults'
import ReferralSystem from '../components/ReferralSystem'
import TelegramSupport from '../components/TelegramSupport'
import RocketAnimation from '../components/RocketAnimation'
import RegisterModal from '../components/RegisterModal'

export default function Home() {
  const { t } = useTranslation()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [windowWidth, setWindowWidth] = useState(1400)
  const [showLoading, setShowLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [showPlayButton, setShowPlayButton] = useState(false)
  const searchParams = useSearchParams()

  const [showRegisterModal, setShowRegisterModal] = useState(false)

  const backgroundVideoRef = useRef(null)
  const loadingVideoRef = useRef(null)
  const [backgroundVideoLoaded, setBackgroundVideoLoaded] = useState(false)

  const fixPrepositions = (text) => {
    if (!text) return text
    
    const prepositions = [
      'и', 'в', 'на', 'с', 'для', 'что', 'как', 'к', 'по', 'о', 'у', 'от', 'из', 
      'за', 'до', 'при', 'через', 'без', 'под', 'над', 'перед', 'между', 'а', 
      'но', 'да', 'или', 'либо', 'то', 'не', 'ни', 'же', 'бы', 'ли',
      'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 
      'from', 'as', 'is', 'are', 'be', 'or', 'and', 'but', 'if', 'so'
    ]
    
    let result = text
    
    prepositions.forEach(prep => {
      const regex = new RegExp(`(^|\\s)(${prep})\\s(?=\\S)`, 'gi')
      result = result.replace(regex, `$1$2\u00A0`)
    })
    
    return result
  }

  useEffect(() => {
    console.log('🏠 Home page mounted - Starting initialization')
    setMounted(true)
    
    const refCode = searchParams.get('ref')
    if (refCode) {
      localStorage.setItem('referralCode', refCode)
      console.log('✅ Referral code saved to localStorage:', refCode)
    }
    
    const handleResize = () => {
      const width = window.innerWidth
      console.log('📏 Window width:', width)
      setWindowWidth(width)
    }
    
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth)
      console.log('📱 Initial window width:', window.innerWidth)
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [searchParams])

  useEffect(() => {
    const hasSeenLoading = sessionStorage.getItem('hasSeenLoadingVideo')
    console.log('🎬 Has seen loading video:', hasSeenLoading)
    
    if (hasSeenLoading) {
      console.log('⏭️ Skipping loading video (already seen)')
      setShowLoading(false)
      return
    }

    const videoElement = loadingVideoRef.current
    
    if (videoElement) {
      let playAttempted = false
      let timeoutId = null
      let autoSkipTimeout = null

      // ✅ НОВОЕ: автоматический пропуск через 10 секунд, если видео не загрузилось
      autoSkipTimeout = setTimeout(() => {
        console.warn('⚠️ Loading video timeout (10s), auto-skipping')
        handleSkipVideo()
      }, 10000)

      const handleProgress = () => {
        if (videoElement.buffered.length > 0) {
          const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1)
          const duration = videoElement.duration
          if (duration > 0) {
            const progress = (bufferedEnd / duration) * 100
            setLoadingProgress(progress)
            console.log('📊 Loading progress:', Math.round(progress) + '%')
          }
        }
      }

      const handleCanPlay = () => {
        console.log('✅ Loading video can play')
        setVideoLoaded(true)
        
        if (autoSkipTimeout) {
          clearTimeout(autoSkipTimeout)
          autoSkipTimeout = null
        }
        
        if (!playAttempted) {
          playAttempted = true
          
          setTimeout(() => {
            const playPromise = videoElement.play()
            
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log('✅ Loading video playing successfully')
                  if (timeoutId) {
                    clearTimeout(timeoutId)
                    timeoutId = null
                  }
                })
                .catch(err => {
                  console.error('❌ Autoplay blocked:', err)
                  setShowPlayButton(true)
                })
            }
          }, 300)
        }

        timeoutId = setTimeout(() => {
          if (videoElement.paused || videoElement.currentTime === 0) {
            console.warn('⚠️ Video not playing after 3s, showing play button')
            setShowPlayButton(true)
          }
        }, 3000)
      }

      const handleTimeUpdate = () => {
        if (videoElement.currentTime > 0 && !videoElement.paused) {
          if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
          }
          setShowPlayButton(false)
        }
      }

      const handleVideoEnd = () => {
        console.log('✅ Loading video ended, transitioning to site')
        setFadeOut(true)
        setTimeout(() => {
          setShowLoading(false)
          sessionStorage.setItem('hasSeenLoadingVideo', 'true')
        }, 800)
      }

      const handleError = (e) => {
        console.error('❌ Loading video error:', e)
        if (autoSkipTimeout) clearTimeout(autoSkipTimeout)
        handleSkipVideo()
      }

      const handleStalled = () => {
        console.warn('⚠️ Loading video stalled')
      }

      videoElement.addEventListener('progress', handleProgress)
      videoElement.addEventListener('canplay', handleCanPlay)
      videoElement.addEventListener('canplaythrough', handleCanPlay)
      videoElement.addEventListener('timeupdate', handleTimeUpdate)
      videoElement.addEventListener('ended', handleVideoEnd)
      videoElement.addEventListener('error', handleError)
      videoElement.addEventListener('stalled', handleStalled)

      videoElement.load()

      return () => {
        if (timeoutId) clearTimeout(timeoutId)
        if (autoSkipTimeout) clearTimeout(autoSkipTimeout)
        videoElement.removeEventListener('progress', handleProgress)
        videoElement.removeEventListener('canplay', handleCanPlay)
        videoElement.removeEventListener('canplaythrough', handleCanPlay)
        videoElement.removeEventListener('timeupdate', handleTimeUpdate)
        videoElement.removeEventListener('ended', handleVideoEnd)
        videoElement.removeEventListener('error', handleError)
        videoElement.removeEventListener('stalled', handleStalled)
      }
    }
  }, [mounted])

  useEffect(() => {
    if (backgroundVideoRef.current && !showLoading) {
      console.log('🎥 Loading background video')
      backgroundVideoRef.current.load()
      backgroundVideoRef.current.play().catch((err) => {
        console.error('❌ Background video play failed:', err)
      })
    }
  }, [showLoading])

  useEffect(() => {
    let touchStartY = 0

    const preventPullToRefresh = (e) => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      
      if (scrollTop === 0 && e.touches[0].clientY > touchStartY) {
        e.preventDefault()
      }
    }

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', preventPullToRefresh, { passive: false })

    document.body.style.overscrollBehavior = 'none'
    document.documentElement.style.overscrollBehavior = 'none'
    document.body.style.overflowX = 'hidden'
    document.documentElement.style.overflowX = 'hidden'

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', preventPullToRefresh)
      
      document.body.style.overscrollBehavior = 'auto'
      document.documentElement.style.overscrollBehavior = 'auto'
      document.body.style.overflowX = 'auto'
      document.documentElement.style.overflowX = 'auto'
    }
  }, [])

  const handleStartInvesting = () => {
    console.log('🚀 Opening Register Modal')
    setShowRegisterModal(true)
  }

  const handleLearnMore = () => {
    console.log('📍 Navigating to /directions')
    router.push('/directions')
  }

  const handleSkipVideo = () => {
    console.log('⏭️ Skipping loading video')
    setFadeOut(true)
    setTimeout(() => {
      setShowLoading(false)
      sessionStorage.setItem('hasSeenLoadingVideo', 'true')
    }, 500)
  }

  const handlePlayVideo = () => {
    const videoElement = loadingVideoRef.current
    if (videoElement) {
      videoElement.play()
        .then(() => {
          console.log('✅ Video started playing after user interaction')
          setShowPlayButton(false)
        })
        .catch(err => {
          console.error('❌ Failed to play video:', err)
          handleSkipVideo()
        })
    }
  }

  if (!mounted) {
    console.log('⏳ Waiting for mount...')
    return null
  }

  const isMobile = windowWidth < 768
  const isTablet = windowWidth >= 768 && windowWidth < 1024

  console.log('🎨 Rendering Home page, isMobile:', isMobile, 'showLoading:', showLoading)

  return (
    <>
      {showLoading && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            opacity: fadeOut ? 0 : 1,
            transition: 'opacity 0.8s ease-in-out',
            overflow: 'hidden'
          }}
        >
          {!videoLoaded && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              textAlign: 'center',
              width: isMobile ? '80%' : '400px',
              maxWidth: '100%',
              padding: '0 20px',
              boxSizing: 'border-box'
            }}>
              <div style={{
                marginBottom: '20px',
                color: '#2dd4bf',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '600'
              }}>
                Loading: {Math.round(loadingProgress)}%
              </div>
              
              <div style={{
                width: '100%',
                height: '6px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  width: `${loadingProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #14b8a6, #2dd4bf)',
                  borderRadius: '10px',
                  transition: 'width 0.3s ease',
                  boxShadow: '0 0 15px rgba(45, 212, 191, 0.6)'
                }} />
              </div>

              {/* ✅ НОВОЕ: текст "или нажмите Skip" */}
              <div style={{
                marginTop: '16px',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: isMobile ? '12px' : '14px'
              }}>
                {isMobile ? 'Или нажмите Skip' : 'Or click Skip to enter'}
              </div>
            </div>
          )}

          {showPlayButton && (
            <button
              onClick={handlePlayVideo}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 20,
                background: 'linear-gradient(45deg, #14b8a6, #2dd4bf)',
                color: 'white',
                border: 'none',
                padding: isMobile ? '16px 32px' : '20px 40px',
                borderRadius: '12px',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(20, 184, 166, 0.4)',
                transition: 'all 0.3s',
                pointerEvents: 'auto'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translate(-50%, -50%) scale(1.05)'
                e.target.style.boxShadow = '0 12px 35px rgba(20, 184, 166, 0.5)'
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translate(-50%, -50%) scale(1)'
                e.target.style.boxShadow = '0 8px 25px rgba(20, 184, 166, 0.4)'
              }}
            >
              {isMobile ? 'Tap to Start' : 'Click to Start'}
            </button>
          )}

          <button
            onClick={handleSkipVideo}
            style={{
              position: 'absolute',
              bottom: isMobile ? '40px' : '60px',
              right: isMobile ? '20px' : '40px',
              zIndex: 20,
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: isMobile ? '12px 24px' : '14px 28px',
              borderRadius: '25px',
              fontSize: isMobile ? '14px' : '15px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              pointerEvents: 'auto'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.25)'
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)'
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.15)'
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)'
            }}
          >
            Skip →
          </button>

          <video
            ref={loadingVideoRef}
            muted
            playsInline
            preload="auto"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: videoLoaded ? 1 : 0,
              transition: 'opacity 0.5s ease'
            }}
          >
            <source
              src={isMobile ? '/profile/veryicalloading.mp4' : '/profile/gorizlkloading.mp4'}
              type="video/mp4"
            />
          </video>
        </div>
      )}

      {showRegisterModal && (
        <RegisterModal 
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
        />
      )}

      <div style={{
        minHeight: '100vh',
        position: 'relative',
        background: '#000000',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overscrollBehavior: 'none',
        WebkitOverflowScrolling: 'touch',
        opacity: showLoading ? 0 : 1,
        transition: 'opacity 0.8s ease-in-out',
        overflowX: 'hidden',
        width: '100%',
        maxWidth: '100vw'
      }}>
        
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          overflow: 'hidden',
          pointerEvents: 'none'
        }}>
          <video
            ref={backgroundVideoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onLoadedData={() => {
              console.log('✅ Background video loaded')
              setBackgroundVideoLoaded(true)
            }}
            onError={(e) => {
              console.error('❌ Background video error:', e)
            }}
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
              opacity: backgroundVideoLoaded ? 0.55 : 0,
              filter: 'brightness(1.2) contrast(1.1)',
              transition: 'opacity 0.5s ease-in',
              willChange: 'auto'
            }}
          >
            <source
              src={isMobile ? '/profile/Homepagemobile.mp4' : '/profile/Homepagepk.mp4'}
              type="video/mp4"
            />
          </video>
          
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)',
            pointerEvents: 'none'
          }} />
        </div>

        <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            top: '80px',
            left: isMobile ? '10%' : '20%',
            width: isMobile ? '300px' : '500px',
            height: isMobile ? '300px' : '500px',
            background: '#2dd4bf',
            borderRadius: '50%',
            opacity: 0.08,
            filter: 'blur(80px)'
          }}></div>
          
          <div style={{
            position: 'absolute',
            top: '300px',
            right: isMobile ? '10%' : '15%',
            width: isMobile ? '250px' : '400px',
            height: isMobile ? '250px' : '400px',
            background: '#34d399',
            borderRadius: '50%',
            opacity: 0.06,
            filter: 'blur(70px)'
          }}></div>

          <div style={{
            position: 'absolute',
            top: '600px',
            left: isMobile ? '5%' : '10%',
            width: isMobile ? '200px' : '350px',
            height: isMobile ? '200px' : '350px',
            background: '#22d3ee',
            borderRadius: '50%',
            opacity: 0.05,
            filter: 'blur(60px)'
          }}></div>
          
          <div style={{
            position: 'absolute',
            top: '900px',
            right: isMobile ? '5%' : '25%',
            width: isMobile ? '180px' : '300px',
            height: isMobile ? '180px' : '300px',
            background: '#6366f1',
            borderRadius: '50%',
            opacity: 0.06,
            filter: 'blur(65px)'
          }}></div>

          <div style={{
            position: 'absolute',
            top: '1200px',
            left: isMobile ? '15%' : '30%',
            width: isMobile ? '220px' : '320px',
            height: isMobile ? '220px' : '320px',
            background: '#8b5cf6',
            borderRadius: '50%',
            opacity: 0.05,
            filter: 'blur(55px)'
          }}></div>

          <div style={{
            position: 'absolute',
            top: '1500px',
            right: isMobile ? '10%' : '20%',
            width: isMobile ? '180px' : '280px',
            height: isMobile ? '180px' : '280px',
            background: '#f59e0b',
            borderRadius: '50%',
            opacity: 0.05,
            filter: 'blur(50px)'
          }}></div>

          <div style={{
            position: 'absolute',
            top: '1800px',
            left: isMobile ? '25%' : '15%',
            width: isMobile ? '160px' : '260px',
            height: isMobile ? '160px' : '260px',
            background: '#ef4444',
            borderRadius: '50%',
            opacity: 0.04,
            filter: 'blur(45px)'
          }}></div>

          <div style={{
            position: 'absolute',
            top: '2100px',
            right: isMobile ? '30%' : '35%',
            width: isMobile ? '200px' : '300px',
            height: isMobile ? '200px' : '300px',
            background: '#10b981',
            borderRadius: '50%',
            opacity: 0.05,
            filter: 'blur(60px)'
          }}></div>

          <div style={{
            position: 'absolute',
            top: '2400px',
            left: isMobile ? '5%' : '12%',
            width: isMobile ? '240px' : '340px',
            height: isMobile ? '240px' : '340px',
            background: '#3b82f6',
            borderRadius: '50%',
            opacity: 0.06,
            filter: 'blur(70px)'
          }}></div>

          <div style={{
            position: 'absolute',
            top: '2700px',
            right: isMobile ? '8%' : '18%',
            width: isMobile ? '190px' : '290px',
            height: isMobile ? '190px' : '290px',
            background: '#a855f7',
            borderRadius: '50%',
            opacity: 0.05,
            filter: 'blur(55px)'
          }}></div>

          <div style={{
            position: 'absolute',
            top: '3000px',
            left: isMobile ? '20%' : '25%',
            width: isMobile ? '220px' : '320px',
            height: isMobile ? '220px' : '320px',
            background: '#06b6d4',
            borderRadius: '50%',
            opacity: 0.06,
            filter: 'blur(65px)'
          }}></div>

          <div style={{
            position: 'absolute',
            top: '3300px',
            right: isMobile ? '15%' : '22%',
            width: isMobile ? '170px' : '270px',
            height: isMobile ? '170px' : '270px',
            background: '#84cc16',
            borderRadius: '50%',
            opacity: 0.04,
            filter: 'blur(50px)'
          }}></div>

          <div style={{
            position: 'absolute',
            top: '3600px',
            left: isMobile ? '10%' : '35%',
            width: isMobile ? '200px' : '300px',
            height: isMobile ? '200px' : '300px',
            background: '#f97316',
            borderRadius: '50%',
            opacity: 0.05,
            filter: 'blur(60px)'
          }}></div>

          <div style={{
            position: 'absolute',
            top: '3900px',
            right: isMobile ? '25%' : '15%',
            width: isMobile ? '180px' : '280px',
            height: isMobile ? '180px' : '280px',
            background: '#ec4899',
            borderRadius: '50%',
            opacity: 0.05,
            filter: 'blur(55px)'
          }}></div>

          <div style={{
            position: 'absolute',
            top: '4200px',
            left: isMobile ? '30%' : '20%',
            width: isMobile ? '160px' : '260px',
            height: isMobile ? '160px' : '260px',
            background: '#2dd4bf',
            borderRadius: '50%',
            opacity: 0.04,
            filter: 'blur(45px)'
          }}></div>
        </div>

        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2, overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            top: '0px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: isMobile ? '100vw' : '1200px',
            maxWidth: '100vw',
            height: '400px',
            background: 'radial-gradient(ellipse at center, rgba(45, 212, 191, 0.1) 0%, rgba(45, 212, 191, 0.05) 30%, rgba(45, 212, 191, 0.02) 60%, transparent 100%)',
            filter: 'blur(40px)',
            opacity: 0.5
          }}></div>

          <div style={{
            position: 'absolute',
            top: '700px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: isMobile ? '100vw' : '1200px',
            maxWidth: '100vw',
            height: '500px',
            background: 'radial-gradient(ellipse at center, rgba(45, 212, 191, 0.08) 0%, rgba(45, 212, 191, 0.04) 40%, rgba(45, 212, 191, 0.02) 70%, transparent 100%)',
            filter: 'blur(50px)',
            opacity: 0.4
          }}></div>

          <div style={{
            position: 'absolute',
            top: '1400px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: isMobile ? '100vw' : '1200px',
            maxWidth: '100vw',
            height: '500px',
            background: 'radial-gradient(ellipse at center, rgba(34, 211, 238, 0.08) 0%, rgba(34, 211, 238, 0.04) 40%, rgba(34, 211, 238, 0.02) 70%, transparent 100%)',
            filter: 'blur(50px)',
            opacity: 0.4
          }}></div>

          <div style={{
            position: 'absolute',
            top: '2100px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: isMobile ? '100vw' : '1200px',
            maxWidth: '100vw',
            height: '500px',
            background: 'radial-gradient(ellipse at center, rgba(52, 211, 153, 0.08) 0%, rgba(52, 211, 153, 0.04) 40%, rgba(52, 211, 153, 0.03) 70%, transparent 100%)',
            filter: 'blur(50px)',
            opacity: 0.4
          }}></div>

          <div style={{
            position: 'absolute',
            top: '2800px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: isMobile ? '100vw' : '1200px',
            maxWidth: '100vw',
            height: '500px',
            background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.08) 0%, rgba(139, 92, 246, 0.04) 40%, rgba(139, 92, 246, 0.02) 70%, transparent 100%)',
            filter: 'blur(50px)',
            opacity: 0.4
          }}></div>

          <div style={{
            position: 'absolute',
            top: '3500px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: isMobile ? '100vw' : '1200px',
            maxWidth: '100vw',
            height: '500px',
            background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.04) 40%, rgba(168, 85, 247, 0.02) 70%, transparent 100%)',
            filter: 'blur(50px)',
            opacity: 0.4
          }}></div>
        </div>

        <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 3 }}>
          {[...Array(isMobile ? 30 : 60)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                background: '#2dd4bf',
                borderRadius: '50%',
                opacity: Math.random() * 0.4 + 0.15,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 500}%`,
                animation: `float ${Math.random() * 20 + 15}s infinite linear`,
                animationDelay: `${Math.random() * 10}s`
              }}
            />
          ))}
        </div>

        <Header isMobile={isMobile} isTablet={isTablet} />

        <main style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1400px',
          width: '100%',
          margin: '0 auto',
          padding: isMobile ? '20px 16px' : '40px 24px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: isMobile ? '60px' : '80px',
            position: 'relative',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <RocketAnimation />

            <div style={{ position: 'relative', zIndex: 2, width: '100%', boxSizing: 'border-box' }}>
              <h1 style={{
                fontSize: isMobile ? '48px' : isTablet ? '64px' : '80px',
                fontWeight: '800',
                marginBottom: '24px',
                lineHeight: '1.1',
                color: 'white',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}>
                {fixPrepositions(t('heroTitle'))} <span style={{ color: '#2dd4bf' }}>{fixPrepositions(t('heroTitleAccent'))}</span>
              </h1>
              <p style={{
                  fontSize: isMobile ? '16px' : '20px',
                  color: '#2dd4bf',
                  maxWidth: '700px',
                  margin: '0 auto 40px',
                  fontWeight: '400',
                  lineHeight: '1.6',
                  padding: isMobile ? '0 16px' : '0',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }}>
                  {fixPrepositions(t('heroSubtitle'))}
                  <br />
                  {fixPrepositions(t('heroSubtitle2'))}
              </p>
              
              <div style={{
                background: `
                  linear-gradient(135deg, 
                    rgba(45, 212, 191, 0.15) 0%,
                    rgba(45, 212, 191, 0.05) 100%
                  )
                `,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(45, 212, 191, 0.3)',
                borderRadius: '24px',
                padding: isMobile ? '24px' : '32px',
                margin: '40px auto',
                maxWidth: '600px',
                textAlign: 'center',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <h3 style={{
                  fontSize: isMobile ? '18px' : '22px',
                  fontWeight: '600',
                  color: '#2dd4bf',
                  marginBottom: '16px',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }}>
                  {fixPrepositions(t('howToStart'))}
                </h3>
                <p style={{
                  fontSize: isMobile ? '14px' : '16px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: '1.6',
                  margin: '0',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }}>
                  {fixPrepositions(t('howToStartDesc'))}
                </p>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: isMobile ? '12px' : '20px',
                marginTop: '40px',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: 'center',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <button 
                  onClick={handleStartInvesting}
                  style={{
                    background: 'linear-gradient(45deg, #14b8a6, #2dd4bf)',
                    color: 'white',
                    border: 'none',
                    padding: isMobile ? '16px 32px' : '18px 40px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: isMobile ? '16px' : '18px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    width: isMobile ? '100%' : 'auto',
                    maxWidth: isMobile ? '250px' : 'none',
                    boxShadow: '0 8px 25px rgba(20, 184, 166, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 12px 35px rgba(20, 184, 166, 0.4)'
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = '0 8px 25px rgba(20, 184, 166, 0.3)'
                  }}
                >
                  {fixPrepositions(t('startInvestingNow'))}
                </button>
                <button 
                  onClick={handleLearnMore}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: isMobile ? '16px 32px' : '18px 40px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: isMobile ? '16px' : '18px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    width: isMobile ? '100%' : 'auto',
                    maxWidth: isMobile ? '250px' : 'none'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                    e.target.style.transform = 'translateY(-2px)'
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.target.style.transform = 'translateY(0)'
                  }}
                >
                  {fixPrepositions(t('learnMore'))}
                </button>
              </div>
            </div>
          </div>

          <div style={{
            position: 'relative',
            marginBottom: isMobile ? '60px' : '80px'
          }}>
            <StakingSection isMobile={isMobile} isTablet={isTablet} />
          </div>

          <TradingWorkspace isMobile={isMobile} isTablet={isTablet} />

          <div style={{
            position: 'relative',
            marginBottom: isMobile ? '60px' : '80px'
          }}>
            <TradingResults isMobile={isMobile} isTablet={isTablet} />
          </div>

          <div style={{
            position: 'relative',
            marginBottom: isMobile ? '60px' : '80px'
          }}>
            <Features isMobile={isMobile} isTablet={isTablet} />
          </div>

          <div style={{
            position: 'relative',
            marginBottom: isMobile ? '60px' : '80px'
          }}>
            <ReferralSystem isMobile={isMobile} isTablet={isTablet} />
          </div>
        </main>

        <Footer isMobile={isMobile} isTablet={isTablet} />
        
        <TelegramSupport />

        <style jsx>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) translateX(0px);
              opacity: 0.3;
            }
            33% {
              transform: translateY(-30px) translateX(15px);
              opacity: 0.6;
            }
            66% {
              transform: translateY(15px) translateX(-15px);
              opacity: 0.4;
            }
          }

          * {
            box-sizing: border-box;
          }
        `}</style>
      </div>
    </>
  )
}