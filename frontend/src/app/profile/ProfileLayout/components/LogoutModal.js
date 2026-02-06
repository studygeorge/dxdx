'use client'

export default function LogoutModal({ isOpen, onClose, onConfirm, isMobile, t }) {
  if (!isOpen) return null

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px',
        animation: 'overlayFadeIn 0.3s ease-out'
      }} 
      onClick={onClose}
    >
      <div 
        style={{
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(45, 212, 191, 0.3)',
          borderRadius: '32px',
          padding: isMobile ? '28px 24px' : '36px 32px',
          maxWidth: '420px',
          width: '100%',
          position: 'relative',
          animation: 'modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(45, 212, 191, 0.3) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '24px',
            cursor: 'pointer',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.3s',
            zIndex: 1
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.color = '#ffffff'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'none'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
          }}
        >
          ×
        </button>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.2) 0%, rgba(45, 212, 191, 0.1) 100%)',
            border: '2px solid rgba(45, 212, 191, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 0 30px rgba(45, 212, 191, 0.3)'
          }}>
            <svg width="28" height="28" fill="#2dd4bf" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
          </div>

          <h2 style={{
            color: '#ffffff',
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '600',
            marginBottom: '12px',
            textAlign: 'center',
            letterSpacing: '-1px'
          }}>
            {t.logoutTitle}
          </h2>
          
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center',
            marginBottom: '28px',
            fontSize: '14px',
            letterSpacing: '-0.3px',
            lineHeight: '1.6'
          }}>
            {t.logoutMessage}
          </p>

          <div style={{
            display: 'flex',
            gap: '12px',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px 20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '28px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                letterSpacing: '-0.3px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              }}
            >
              {t.logoutCancel}
            </button>

            <button
              onClick={onConfirm}
              style={{
                flex: 1,
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                border: 'none',
                borderRadius: '28px',
                color: '#000000',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                letterSpacing: '-0.3px',
                boxShadow: '0 4px 12px rgba(45, 212, 191, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)'
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(45, 212, 191, 0.4)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 212, 191, 0.3)'
              }}
            >
              {t.logoutConfirm}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
