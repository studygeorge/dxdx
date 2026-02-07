'use client'
import LanguageToggle from './LanguageToggle'
import { getSupportLink } from '../constants'

export default function NavigationDesktop({ 
  tabs, 
  activeTab, 
  onTabChange, 
  isKYCApproved,
  onShowKYCModal,
  onShowLogoutModal,
  language,
  onLanguageToggle,
  onBack,
  t,
  isAnyModalOpen
}) {
  return (
    <nav style={{
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      width: '280px',
      padding: '24px 16px',
      zIndex: isAnyModalOpen ? -1 : 1000,
      overflowY: 'visible',
      overflowX: 'visible',
      pointerEvents: 'none',
      opacity: isAnyModalOpen ? 0 : 1,
      transition: 'opacity 0.3s ease, z-index 0s linear 0.3s'
    }}>
      <div style={{
        marginBottom: '36px',
        paddingBottom: '24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        pointerEvents: 'auto'
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '28px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '12px',
            fontWeight: '500',
            letterSpacing: '-0.3px',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            width: '100%',
            justifyContent: 'center',
            marginBottom: '12px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(45, 212, 191, 0.1)'
            e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.3)'
            e.currentTarget.style.color = '#2dd4bf'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
          }}
        >
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          {t.back}
        </button>

        <button
          onClick={onShowLogoutModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: 'rgba(45, 212, 191, 0.1)',
            border: '1px solid rgba(45, 212, 191, 0.3)',
            borderRadius: '28px',
            color: '#2dd4bf',
            fontSize: '12px',
            fontWeight: '500',
            letterSpacing: '-0.3px',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            width: '100%',
            justifyContent: 'center',
            marginBottom: '12px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(45, 212, 191, 0.2)'
            e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.5)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(45, 212, 191, 0.1)'
            e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.3)'
          }}
        >
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
          </svg>
          {t.logout}
        </button>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <LanguageToggle language={language} onToggle={onLanguageToggle} />
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', pointerEvents: 'auto' }}>
        {tabs.map((tab) => {
          const isUpgrade = tab.alwaysGlowing
          const isActive = activeTab === tab.id
          const isDisabled = tab.requiresKYC && !isKYCApproved
          
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (isDisabled) {
                  onShowKYCModal()
                } else {
                  onTabChange(tab.id)
                }
              }}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: isActive || isUpgrade
                  ? (isUpgrade 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)'
                      : 'linear-gradient(135deg, rgba(45, 212, 191, 0.15) 0%, rgba(45, 212, 191, 0.05) 100%)')
                  : 'transparent',
                border: isActive || isUpgrade 
                  ? (isUpgrade 
                      ? '1px solid rgba(255, 255, 255, 0.4)' 
                      : '1px solid rgba(45, 212, 191, 0.4)') 
                  : '1px solid transparent',
                borderRadius: '28px',
                color: isDisabled 
                  ? 'rgba(255, 255, 255, 0.3)' 
                  : (isActive || isUpgrade ? (isUpgrade ? '#ffffff' : '#2dd4bf') : 'rgba(255, 255, 255, 0.6)'),
                fontSize: '13px',
                fontWeight: '500',
                letterSpacing: '-0.5px',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                position: 'relative',
                animation: isUpgrade ? 'white-glow 2s ease-in-out infinite' : (isActive ? 'glow-pulse-bright 2s ease-in-out infinite' : 'none'),
                backgroundImage: isActive || isUpgrade
                  ? (isUpgrade
                      ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)'
                      : 'linear-gradient(90deg, transparent, rgba(45, 212, 191, 0.1), transparent)')
                  : 'none',
                backgroundSize: '200% 100%',
                backgroundPosition: isActive || isUpgrade ? 'center' : '0 0',
                opacity: isDisabled ? 0.5 : 1
              }}
              onMouseOver={(e) => {
                if (!isActive && !isUpgrade && !isDisabled) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
                } else if (!isDisabled) {
                  e.currentTarget.style.animation = isUpgrade 
                    ? 'white-glow 1s ease-in-out infinite, shimmer 2s linear infinite'
                    : 'glow-pulse-bright 1s ease-in-out infinite, shimmer 2s linear infinite'
                }
              }}
              onMouseOut={(e) => {
                if (!isActive && !isUpgrade) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = isDisabled ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.6)'
                } else if (!isDisabled) {
                  e.currentTarget.style.animation = isUpgrade 
                    ? 'white-glow 2s ease-in-out infinite'
                    : 'glow-pulse-bright 2s ease-in-out infinite'
                }
              }}
            >
              {(isActive || isUpgrade) && !isDisabled && (
                <>
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        top: `${10 + i * 25}%`,
                        right: `${5 + (i % 2) * 10}%`,
                        width: '2px',
                        height: '2px',
                        background: isUpgrade ? '#ffffff' : '#2dd4bf',
                        borderRadius: '50%',
                        boxShadow: isUpgrade ? '0 0 8px #ffffff' : '0 0 8px #2dd4bf',
                        animation: `sparkle 2s ease-in-out ${i * 0.4}s infinite`
                      }}
                    />
                  ))}
                </>
              )}
              {tab.label}
              {(isActive || isUpgrade) && !isDisabled && (
                <div style={{
                  position: 'absolute',
                  right: '10px',
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: isUpgrade ? '#ffffff' : '#2dd4bf',
                  boxShadow: isUpgrade 
                    ? '0 0 15px rgba(255, 255, 255, 0.9), 0 0 25px rgba(255, 255, 255, 0.5)'
                    : '0 0 15px rgba(45, 212, 191, 0.9), 0 0 25px rgba(45, 212, 191, 0.5)'
                }} />
              )}
            </button>
          )
        })}

        <a
          href={`https://t.me/dxcapital_bot?start=profile_${language}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            width: '100%',
            padding: '10px 16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '28px',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '13px',
            fontWeight: '500',
            letterSpacing: '-0.5px',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            position: 'relative',
            textDecoration: 'none',
            marginTop: '12px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
          }}
        >
          {t.telegramBot}
        </a>
      </div>
    </nav>
  )
}
