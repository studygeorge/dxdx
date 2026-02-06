'use client'
import LanguageToggle from './LanguageToggle'
import { getKYCStatusInfo, getSupportLink } from '../constants'

export default function UserHeader({ 
  user, 
  kycStatus, 
  walletAddress, 
  language, 
  isMobile,
  onShowKYCModal,
  onShowLogoutModal,
  onLanguageToggle,
  onDisconnectWallet,
  t 
}) {
  const kycStatusInfo = getKYCStatusInfo(kycStatus, t)

  return (
    <>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        gap: '12px'
      }}>
        <h1 style={{
          fontSize: isMobile ? '28px' : '36px',
          fontWeight: '700',
          color: '#ffffff',
          letterSpacing: '-1.5px',
          textShadow: '0 0 30px rgba(45, 212, 191, 0.5)',
          margin: 0
        }}>
          DXCAPITAL
        </h1>

        {isMobile && (
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            flexShrink: 0
          }}>
            <button
              onClick={onShowLogoutModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '6px 12px',
                background: 'rgba(45, 212, 191, 0.15)',
                border: '1px solid rgba(45, 212, 191, 0.3)',
                borderRadius: '20px',
                color: '#2dd4bf',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(45, 212, 191, 0.25)'
                e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.5)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(45, 212, 191, 0.15)'
                e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.3)'
              }}
            >
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              {t.logout}
            </button>

            <LanguageToggle language={language} onToggle={onLanguageToggle} />
          </div>
        )}
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '32px',
        padding: isMobile ? '20px 18px' : '28px 36px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(45, 212, 191, 0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '12px' : '20px',
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            width: isMobile ? '52px' : '60px',
            height: isMobile ? '52px' : '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '600',
            color: '#000000',
            letterSpacing: '-1px',
            flexShrink: 0
          }}>
            {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
          </div>
          
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h1 style={{
              fontSize: isMobile ? '18px' : '24px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '4px',
              letterSpacing: '-1px'
            }}>
              {user?.username || user?.firstName || user?.email?.split('@')[0] || 'User'}
            </h1>

            <div style={{ 
              display: 'flex', 
              gap: '10px',
              flexWrap: 'wrap', 
              alignItems: 'center'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: user?.isActive !== false ? 'rgba(45, 212, 191, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: user?.isActive !== false ? '1px solid rgba(45, 212, 191, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '28px',
                padding: '5px 12px',
                fontSize: '11px',
                color: user?.isActive !== false ? '#2dd4bf' : '#fca5a5',
                fontWeight: '500',
                letterSpacing: '-0.3px'
              }}>
                <div style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: user?.isActive !== false ? '#2dd4bf' : '#ef4444'
                }} />
                {user?.isActive !== false ? t.active : t.inactive}
              </div>

              {kycStatus && (
                <button
                  onClick={() => kycStatusInfo.showButton && onShowKYCModal()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: kycStatusInfo.bgColor,
                    border: `1px solid ${kycStatusInfo.borderColor}`,
                    borderRadius: '28px',
                    padding: '5px 12px',
                    fontSize: '11px',
                    color: kycStatusInfo.color,
                    fontWeight: '500',
                    letterSpacing: '-0.3px',
                    cursor: kycStatusInfo.showButton ? 'pointer' : 'default',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => {
                    if (kycStatusInfo.showButton) {
                      e.currentTarget.style.opacity = '0.8'
                    }
                  }}
                  onMouseOut={(e) => {
                    if (kycStatusInfo.showButton) {
                      e.currentTarget.style.opacity = '1'
                    }
                  }}
                >
                  <div style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: kycStatusInfo.color
                  }} />
                  {kycStatusInfo.text}
                  {kycStatusInfo.showButton && (
                    <span style={{
                      marginLeft: '4px',
                      fontSize: '9px',
                      textDecoration: 'underline'
                    }}>
                      {t.verifyNow}
                    </span>
                  )}
                </button>
              )}

              {isMobile && (
                <a
                  href={`https://t.me/dxcapital_bot?start=profile_${language}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(45, 212, 191, 0.15)',
                    border: '1px solid rgba(45, 212, 191, 0.3)',
                    borderRadius: '28px',
                    padding: '5px 12px',
                    fontSize: '11px',
                    color: '#2dd4bf',
                    fontWeight: '500',
                    letterSpacing: '-0.3px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    textDecoration: 'none'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(45, 212, 191, 0.25)'
                    e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.5)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(45, 212, 191, 0.15)'
                    e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.3)'
                  }}
                >
                  <svg width="13" height="13" fill="#26A5E4" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                  </svg>
                  {t.telegramBot}
                </a>
              )}

              <a
                href={getSupportLink()}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(45, 212, 191, 0.15)',
                  border: '1px solid rgba(45, 212, 191, 0.3)',
                  borderRadius: '28px',
                  padding: '5px 12px',
                  fontSize: '11px',
                  color: '#2dd4bf',
                  fontWeight: '500',
                  letterSpacing: '-0.3px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textDecoration: 'none'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(45, 212, 191, 0.25)'
                  e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.5)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(45, 212, 191, 0.15)'
                  e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.3)'
                }}
              >
                <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {t.support}
              </a>

              {walletAddress && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(45, 212, 191, 0.15)',
                  border: '1px solid rgba(45, 212, 191, 0.3)',
                  borderRadius: '28px',
                  padding: '5px 12px',
                  fontSize: '11px',
                  color: '#2dd4bf',
                  fontWeight: '500',
                  letterSpacing: '-0.3px'
                }}>
                  <div style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: '#2dd4bf'
                  }} />
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onDisconnectWallet()
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '9px',
                      padding: '3px 7px',
                      borderRadius: '10px',
                      fontWeight: '600',
                      marginLeft: '4px',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'
                    }}
                  >
                    {t.disconnectWallet}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
