import { useState } from 'react'
import { useTranslation } from '../app/hooks/useTranslation'

export default function TelegramSupport() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const supportTopics = [
    {
      number: '1',
      title: t('howToStartInvesting'),
      desc: t('howToStartInvestingDesc')
    },
    {
      number: '2',
      title: t('rewardProgramDetails'),
      desc: t('rewardProgramDetailsDesc')
    },
    {
      number: '3',
      title: t('accountSecurity'),
      desc: t('accountSecurityDesc')
    },
    {
      number: '4',
      title: t('platformSupport'),
      desc: t('platformSupportDesc')
    },
    {
      number: '5',
      title: t('withdrawalInfo'),
      desc: t('withdrawalInfoDesc')
    }
  ]

  return (
    <>
      {isVisible && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000
        }}>
          {/* Chat Window */}
          {isOpen && (
            <div style={{
              position: 'absolute',
              bottom: '90px',
              right: '0',
              width: '380px',
              maxHeight: '600px',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25), 0 8px 25px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden',
              animation: 'slideUpIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: 'translateZ(0)',
              willChange: 'transform, opacity'
            }}>
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                color: 'white',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)'
                }} />
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    background: 'rgba(255, 255, 255, 0.25)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}>
                    💬
                  </div>
                  <div>
                    <div style={{ 
                      fontWeight: '600', 
                      fontSize: '17px',
                      marginBottom: '2px'
                    }}>
                      DXCAPITAL {t('support')}
                    </div>
                    <div style={{ 
                      fontSize: '13px', 
                      opacity: 0.9,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#10b981',
                        borderRadius: '50%',
                        animation: 'pulse 2s infinite'
                      }} />
                      {t('onlineResponds')}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    width: '34px',
                    height: '34px',
                    color: 'white',
                    fontSize: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    fontWeight: '500'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Chat Content */}
              <div style={{
                padding: '24px',
                maxHeight: '450px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px'
              }}>
                {/* Welcome Message */}
                <div style={{
                  alignSelf: 'flex-start',
                  maxWidth: '95%',
                  animation: 'fadeInUp 0.6s ease 0.2s both'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    color: '#1e293b',
                    padding: '16px 18px',
                    borderRadius: '18px 18px 18px 6px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                    position: 'relative'
                  }}>
                    {t('supportWelcomeMessage')}
                    <div style={{
                      position: 'absolute',
                      bottom: '-1px',
                      left: '12px',
                      width: '0',
                      height: '0',
                      borderLeft: '8px solid transparent',
                      borderRight: '8px solid transparent',
                      borderTop: '8px solid #f8fafc'
                    }} />
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#64748b',
                    marginTop: '8px',
                    marginLeft: '16px',
                    opacity: 0.8
                  }}>
                    {t('justNow')}
                  </div>
                </div>

                {/* Quick Action Buttons with Numbers */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  animation: 'fadeInUp 0.6s ease 0.4s both'
                }}>
                  <div style={{
                    fontSize: '13px',
                    color: '#64748b',
                    fontWeight: '600',
                    marginBottom: '8px',
                    letterSpacing: '0.3px'
                  }}>
                    {t('quickHelpTopics')}:
                  </div>
                  {supportTopics.map((topic, index) => (
                    <button
                      key={index}
                      style={{
                        background: 'rgba(45, 212, 191, 0.08)',
                        border: '1px solid rgba(45, 212, 191, 0.2)',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        color: '#0f766e',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'left',
                        fontWeight: '500',
                        animation: `fadeInUp 0.6s ease ${0.5 + index * 0.1}s both`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(45, 212, 191, 0.15)'
                        e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.4)'
                        e.currentTarget.style.transform = 'translateX(4px)'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(45, 212, 191, 0.08)'
                        e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.2)'
                        e.currentTarget.style.transform = 'translateX(0)'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <span style={{
                          fontWeight: '700',
                          fontSize: '16px',
                          color: '#14b8a6'
                        }}>
                          {topic.number}
                        </span>
                        <span style={{ fontWeight: '600' }}>
                          {topic.title}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#64748b',
                        lineHeight: '1.5',
                        paddingLeft: '26px'
                      }}>
                        {topic.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Telegram Connect Button */}
              <div style={{
                padding: '20px 24px',
                borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                background: 'rgba(248, 250, 252, 0.9)',
                animation: 'fadeInUp 0.6s ease 0.8s both'
              }}>
                <a
                  href="https://t.me/dxcapital_support"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                    color: 'white',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '15px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 18px rgba(45, 212, 191, 0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(45, 212, 191, 0.4)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = '0 4px 18px rgba(45, 212, 191, 0.3)'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </div>
                  {t('openTelegramChat')}
                </a>
              </div>
            </div>
          )}

          {/* Main Support Button - ИСПРАВЛЕНО */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              width: '70px',
              height: '70px',
              background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
              borderRadius: '50%',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(45, 212, 191, 0.4)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              padding: 0,
              flexShrink: 0
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.1) translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(45, 212, 191, 0.5)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(45, 212, 191, 0.4)'
            }}
          >
            {/* Контейнер для иконки с фиксированными размерами */}
            <div style={{
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.3s ease',
              transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
            }}>
              {isOpen ? (
                <span style={{ 
                  fontSize: '26px', 
                  fontWeight: '300',
                  lineHeight: '1',
                  display: 'block'
                }}>×</span>
              ) : (
                <svg 
                  width="30" 
                  height="30" 
                  viewBox="0 0 24 24" 
                  fill="white"
                  style={{ display: 'block' }}
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              )}
            </div>
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUpIn {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  )
}