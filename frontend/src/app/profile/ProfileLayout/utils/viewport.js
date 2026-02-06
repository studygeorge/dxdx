export const setupViewport = () => {
  const setViewportMeta = () => {
    let viewport = document.querySelector('meta[name=viewport]')
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover')
    }
  }
  setViewportMeta()

  const preventZoom = (e) => {
    if (e.touches.length > 1) {
      e.preventDefault()
    }
  }
  
  const preventDoubleTapZoom = (e) => {
    const t2 = e.timeStamp
    const t1 = e.currentTarget.dataset.lastTouch || t2
    const dt = t2 - t1
    const fingers = e.touches.length
    e.currentTarget.dataset.lastTouch = t2

    if (dt < 500 && fingers === 1) {
      e.preventDefault()
    }
  }

  document.addEventListener('touchstart', preventZoom, { passive: false })
  document.addEventListener('touchstart', preventDoubleTapZoom, { passive: false })

  return () => {
    document.removeEventListener('touchstart', preventZoom)
    document.removeEventListener('touchstart', preventDoubleTapZoom)
  }
}

export const injectGlobalStyles = () => {
  const style = document.createElement('style')
  style.textContent = `
    * {
      touch-action: pan-y pan-x;
    }
    
    @keyframes glow-pulse-bright {
      0%, 100% {
        box-shadow: 0 0 30px rgba(45, 212, 191, 0.8),
                    0 0 60px rgba(45, 212, 191, 0.5),
                    inset 0 0 30px rgba(45, 212, 191, 0.3);
      }
      50% {
        box-shadow: 0 0 45px rgba(45, 212, 191, 1),
                    0 0 90px rgba(45, 212, 191, 0.7),
                    inset 0 0 45px rgba(45, 212, 191, 0.4);
      }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes sparkle {
      0%, 100% { opacity: 0; transform: scale(0); }
      50% { opacity: 1; transform: scale(1); }
    }
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
    @keyframes white-glow {
      0%, 100% {
        box-shadow: 0 0 25px rgba(255, 255, 255, 0.6),
                    0 0 50px rgba(255, 255, 255, 0.4),
                    inset 0 0 25px rgba(255, 255, 255, 0.2);
      }
      50% {
        box-shadow: 0 0 35px rgba(255, 255, 255, 0.8),
                    0 0 70px rgba(255, 255, 255, 0.5),
                    inset 0 0 35px rgba(255, 255, 255, 0.3);
      }
    }
    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    @keyframes overlayFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `
  document.head.appendChild(style)
  
  return () => {
    if (style.parentNode) {
      document.head.removeChild(style)
    }
  }
}
