'use client'

export default function Web3Modal({ 
  isOpen, 
  onClose, 
  onConnect, 
  connecting, 
  error, 
  isMobile, 
  t 
}) {
  if (!isOpen) return null

  return (
    <div style={{
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
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '32px',
        padding: isMobile ? '24px 20px' : '36px 32px',
        maxWidth: '420px',
        width: '100%',
        position: 'relative'
      }} onClick={(e) => e.stopPropagation()}>
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
            transition: 'all 0.3s'
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

        <h2 style={{
          color: '#ffffff',
          fontSize: isMobile ? '20px' : '24px',
          fontWeight: '600',
          marginBottom: '6px',
          textAlign: 'center',
          letterSpacing: '-1px'
        }}>
          Connect Wallet
        </h2>
        
        <p style={{
          color: 'rgba(255, 255, 255, 0.6)',
          textAlign: 'center',
          marginBottom: '24px',
          fontSize: '13px',
          letterSpacing: '-0.3px'
        }}>
          Connect your Web3 wallet to continue
        </p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '28px',
            padding: '10px 14px',
            marginBottom: '20px',
            color: '#fca5a5',
            fontSize: '12px',
            letterSpacing: '-0.3px'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={onConnect}
          disabled={connecting}
          style={{
            width: '100%',
            background: connecting ? 'rgba(45, 212, 191, 0.5)' : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
            color: connecting ? 'rgba(0, 0, 0, 0.5)' : '#000000',
            border: 'none',
            padding: '14px',
            borderRadius: '28px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: connecting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            letterSpacing: '-0.3px'
          }}
          onMouseOver={(e) => {
            if (!connecting) {
              e.currentTarget.style.transform = 'scale(1.02)'
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(45, 212, 191, 0.3)'
            }
          }}
          onMouseOut={(e) => {
            if (!connecting) {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }
          }}
        >
          {connecting ? t.connecting : t.connectMetamask}
        </button>
      </div>
    </div>
  )
}
