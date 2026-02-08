'use client'
import React, { useState, useEffect } from 'react'

export const FallingStars = () => {
  const [stars, setStars] = useState([])

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes fall {
        0% {
          transform: translateY(-100px) translateX(0) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) translateX(100px) rotate(360deg);
          opacity: 0;
        }
      }
      @keyframes twinkle {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
      }
    `
    document.head.appendChild(style)

    const createStar = () => {
      const id = Math.random()
      const size = Math.random() * 2 + 1
      const left = Math.random() * 100
      const duration = Math.random() * 10 + 15
      const delay = Math.random() * 5
      
      return { id, size, left, duration, delay }
    }

    const initialStars = Array.from({ length: 15 }, createStar)
    setStars(initialStars)

    const interval = setInterval(() => {
      setStars(prevStars => {
        const newStar = createStar()
        return prevStars.length < 20 ? [...prevStars, newStar] : prevStars
      })
    }, Math.random() * 5000 + 3000)

    return () => {
      clearInterval(interval)
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 0,
      overflow: 'hidden'
    }}>
      {stars.map(star => (
        <div
          key={star.id}
          style={{
            position: 'absolute',
            top: '-100px',
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: 'radial-gradient(circle, rgba(45, 212, 191, 0.9) 0%, rgba(45, 212, 191, 0.3) 50%, transparent 100%)',
            borderRadius: '50%',
            boxShadow: `0 0 ${star.size * 3}px rgba(45, 212, 191, 0.5)`,
            animation: `fall ${star.duration}s linear ${star.delay}s infinite, twinkle 2s ease-in-out infinite`,
            filter: 'blur(0.5px)'
          }}
        />
      ))}
    </div>
  )
}

export const FlyingWhiteStars = () => {
  const [stars, setStars] = useState([])

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes flyAcrossScreen {
        0% {
          transform: translate(-150px, -150px) rotate(0deg);
          opacity: 0;
        }
        5% {
          opacity: 1;
        }
        95% {
          opacity: 1;
        }
        100% {
          transform: translate(calc(100vw + 150px), calc(100vh + 150px)) rotate(720deg);
          opacity: 0;
        }
      }
      @keyframes intensePulse {
        0%, 100% { 
          opacity: 0.7;
          transform: scale(1);
          filter: brightness(1.2);
        }
        50% { 
          opacity: 1;
          transform: scale(1.6);
          filter: brightness(1.8);
        }
      }
    `
    document.head.appendChild(style)

    const createBrightStar = () => {
      const id = Math.random()
      const size = Math.random() * 4 + 3
      const startX = Math.random() * -300 - 100
      const startY = Math.random() * window.innerHeight
      const duration = Math.random() * 6 + 5
      const delay = Math.random() * 10
      
      return { id, size, startX, startY, duration, delay }
    }

    const initialStars = Array.from({ length: 35 }, createBrightStar)
    setStars(initialStars)

    const interval = setInterval(() => {
      setStars(prevStars => {
        const newStar = createBrightStar()
        return prevStars.length < 50 ? [...prevStars, newStar] : prevStars
      })
    }, Math.random() * 1500 + 800)

    return () => {
      clearInterval(interval)
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 4,
      overflow: 'hidden'
    }}>
      {stars.map(star => (
        <div
          key={star.id}
          style={{
            position: 'absolute',
            left: `${star.startX}px`,
            top: `${star.startY}px`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: 'radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 60%, transparent 100%)',
            borderRadius: '50%',
            boxShadow: `
              0 0 ${star.size * 8}px rgba(255, 255, 255, 1),
              0 0 ${star.size * 16}px rgba(255, 255, 255, 0.8),
              0 0 ${star.size * 24}px rgba(255, 255, 255, 0.6),
              0 0 ${star.size * 32}px rgba(255, 255, 255, 0.4),
              inset 0 0 ${star.size * 2}px rgba(255, 255, 255, 1)
            `,
            animation: `flyAcrossScreen ${star.duration}s linear ${star.delay}s infinite, intensePulse 1.2s ease-in-out infinite`,
            filter: 'blur(0px) brightness(1.5)',
            willChange: 'transform, opacity'
          }}
        />
      ))}
    </div>
  )
}

export const TiffanyNebula = ({ isMobile }) => {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1 }}>
        <div style={{
          position: 'absolute',
          top: '80px',
          left: isMobile ? '10%' : '20%',
          width: isMobile ? '350px' : '600px',
          height: isMobile ? '350px' : '600px',
          background: '#2dd4bf',
          borderRadius: '50%',
          opacity: 0.2,
          filter: 'blur(90px)'
        }}></div>
        
        <div style={{
          position: 'absolute',
          top: '300px',
          right: isMobile ? '10%' : '15%',
          width: isMobile ? '300px' : '500px',
          height: isMobile ? '300px' : '500px',
          background: '#34d399',
          borderRadius: '50%',
          opacity: 0.18,
          filter: 'blur(80px)'
        }}></div>

        <div style={{
          position: 'absolute',
          top: '600px',
          left: isMobile ? '5%' : '10%',
          width: isMobile ? '250px' : '450px',
          height: isMobile ? '250px' : '450px',
          background: '#22d3ee',
          borderRadius: '50%',
          opacity: 0.15,
          filter: 'blur(70px)'
        }}></div>
        
        <div style={{
          position: 'absolute',
          top: '900px',
          right: isMobile ? '5%' : '25%',
          width: isMobile ? '220px' : '400px',
          height: isMobile ? '220px' : '400px',
          background: '#2dd4bf',
          borderRadius: '50%',
          opacity: 0.16,
          filter: 'blur(75px)'
        }}></div>

        <div style={{
          position: 'absolute',
          top: '1200px',
          left: isMobile ? '15%' : '30%',
          width: isMobile ? '260px' : '420px',
          height: isMobile ? '260px' : '420px',
          background: '#14b8a6',
          borderRadius: '50%',
          opacity: 0.14,
          filter: 'blur(65px)'
        }}></div>

        <div style={{
          position: 'absolute',
          top: '1500px',
          right: isMobile ? '10%' : '20%',
          width: isMobile ? '220px' : '380px',
          height: isMobile ? '220px' : '380px',
          background: '#2dd4bf',
          borderRadius: '50%',
          opacity: 0.13,
          filter: 'blur(60px)'
        }}></div>

        <div style={{
          position: 'absolute',
          top: '1800px',
          left: isMobile ? '25%' : '15%',
          width: isMobile ? '200px' : '360px',
          height: isMobile ? '200px' : '360px',
          background: '#22d3ee',
          borderRadius: '50%',
          opacity: 0.12,
          filter: 'blur(55px)'
        }}></div>

        <div style={{
          position: 'absolute',
          top: '2100px',
          right: isMobile ? '30%' : '35%',
          width: isMobile ? '240px' : '400px',
          height: isMobile ? '240px' : '400px',
          background: '#10b981',
          borderRadius: '50%',
          opacity: 0.14,
          filter: 'blur(70px)'
        }}></div>
      </div>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
        <div style={{
          position: 'absolute',
          top: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: isMobile ? '700px' : '1400px',
          height: '500px',
          background: 'radial-gradient(ellipse at center, rgba(45, 212, 191, 0.2) 0%, rgba(45, 212, 191, 0.12) 30%, rgba(45, 212, 191, 0.06) 60%, transparent 100%)',
          filter: 'blur(50px)',
          opacity: 0.7
        }}></div>

        <div style={{
          position: 'absolute',
          top: '700px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: isMobile ? '700px' : '1400px',
          height: '600px',
          background: 'radial-gradient(ellipse at center, rgba(45, 212, 191, 0.18) 0%, rgba(45, 212, 191, 0.1) 40%, rgba(45, 212, 191, 0.05) 70%, transparent 100%)',
          filter: 'blur(60px)',
          opacity: 0.65
        }}></div>

        <div style={{
          position: 'absolute',
          top: '1400px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: isMobile ? '700px' : '1400px',
          height: '600px',
          background: 'radial-gradient(ellipse at center, rgba(34, 211, 238, 0.18) 0%, rgba(34, 211, 238, 0.1) 40%, rgba(34, 211, 238, 0.05) 70%, transparent 100%)',
          filter: 'blur(60px)',
          opacity: 0.65
        }}></div>

        <div style={{
          position: 'absolute',
          top: '2100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: isMobile ? '700px' : '1400px',
          height: '600px',
          background: 'radial-gradient(ellipse at center, rgba(45, 212, 191, 0.18) 0%, rgba(45, 212, 191, 0.1) 40%, rgba(45, 212, 191, 0.05) 70%, transparent 100%)',
          filter: 'blur(60px)',
          opacity: 0.65
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
              opacity: Math.random() * 0.6 + 0.3,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 500}%`,
              animation: `float ${Math.random() * 20 + 15}s infinite linear`,
              animationDelay: `${Math.random() * 10}s`
            }}
          />
        ))}
      </div>
    </>
  )
}

export const VideoBackground = ({ isMobile }) => {
  const videoRef = React.useRef(null)

  React.useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Try to play as soon as possible
    const tryPlay = () => {
      video.play().catch(() => {
        // If autoplay fails, try again after user interaction
        const playOnInteraction = () => {
          video.play().catch(() => {})
          document.removeEventListener('click', playOnInteraction)
          document.removeEventListener('touchstart', playOnInteraction)
        }
        document.addEventListener('click', playOnInteraction)
        document.addEventListener('touchstart', playOnInteraction)
      })
    }

    // Pause video when tab is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause()
      } else {
        video.play().catch(() => {})
      }
    }

    // Start playing as soon as metadata loaded
    video.addEventListener('loadedmetadata', tryPlay)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Force load
    video.load()

    return () => {
      video.removeEventListener('loadedmetadata', tryPlay)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isMobile])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
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
        webkit-playsinline="true"
        x5-playsinline="true"
        x-webkit-airplay="allow"
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
          WebkitTransform: 'translate3d(0, 0, 0)',
          WebkitBackfaceVisibility: 'hidden'
        }}
      >
        <source
          src={isMobile ? '/profile/verticallk.mp4' : '/profile/gorizlk.mp4'}
          type="video/mp4"
        />
      </video>
      
      {/* Dark overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden'
      }} />
    </div>
  )
}
