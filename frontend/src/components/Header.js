'use client'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../app/hooks/useAuth'
import Link from 'next/link'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'
import ProfileDropdown from './ProfileDropdown'
import LanguageSwitcher from './LanguageSwitcher'

// Встроенный хук переводов
function useTranslation() {
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en'
    setLanguage(savedLanguage)
    document.documentElement.lang = savedLanguage

    const handleLanguageChange = (event) => {
      const newLanguage = event.detail
      setLanguage(newLanguage)
    }

    window.addEventListener('languageChanged', handleLanguageChange)
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange)
    }
  }, [])

  const translations = {
    en: {
      team: 'Team',
      directions: 'Directions', 
      risksGuarantees: 'Risks / Guarantees',
      statistics: 'Statistics',
      clientBonus: 'Client Bonus',
      faq: 'FAQ',
      about: 'About',
      login: 'Log in',
      startStaking: 'Invest now',
      myProfile: 'My Profile',
      myWallet: 'My Wallet',
      stakingRewards: 'Staking Rewards',
      transactionHistory: 'Transaction History',
      security: 'Security & 2FA',
      accountSettings: 'Account Settings',
      signOut: 'Sign Out',
      activeStaking: 'Active Staking',
      active: 'Active',
      dxcapitalBalance: 'DXCAPITAL Balance',
      loading: 'Loading...',
      noUserData: 'No user data',
      user: 'User',
      errorLoading: 'Error loading',
      menu: 'Menu',
      close: 'Close'
    },
    ru: {
      team: 'Команда',
      directions: 'Направления',
      risksGuarantees: 'Риски и Гарантии',
      statistics: 'Статистика',
      clientBonus: 'Клиентский Бонус',
      faq: 'FAQ',
      about: 'О нас',
      login: 'Войти',
      startStaking: 'Инвестировать сейчас',
      myProfile: 'Мой Профиль',
      myWallet: 'Мой Кошелек',
      stakingRewards: 'Награды Стейкинга',
      transactionHistory: 'История Транзакций',
      security: 'Безопасность и 2FA',
      accountSettings: 'Настройки Аккаунта',
      signOut: 'Выйти',
      activeStaking: 'Активный Стейкинг',
      active: 'Активен',
      dxcapitalBalance: 'Баланс DXCAPITAL',
      loading: 'Загрузка...',
      noUserData: 'Нет данных пользователя',
      user: 'Пользователь',
      errorLoading: 'Ошибка загрузки',
      menu: 'Меню',
      close: 'Закрыть'
    }
  }

  const t = (key) => {
    const translation = translations[language]?.[key] || translations.en[key] || key
    return translation
  }

  return { t, language }
}

export default function Header({ isMobile, isTablet }) {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const { t } = useTranslation()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [activeDropdownSource, setActiveDropdownSource] = useState(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const profileButtonRef = useRef(null)
  const compactProfileButtonRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > 150 && currentScrollY > lastScrollY) {
        setIsScrolled(true)
      }
      else if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsScrolled(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledScroll)
    
    return () => window.removeEventListener('scroll', throttledScroll)
  }, [lastScrollY])

  useEffect(() => {
    if (isAuthenticated && !user && !loading) {
      console.log('WARNING: User authenticated but no user data!')
    }
  }, [user, isAuthenticated, loading])

  // Блокируем скролл когда открыто мобильное меню
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [showMobileMenu])

  const getUserDisplayName = () => {
    if (loading) return t('loading') || 'Loading...'
    if (isAuthenticated && !user) return t('noUserData') || 'No user data'
    if (!user) return t('user') || 'User'
    
    if (user.email) return user.email
    if (user.firstName) return `${user.firstName} ${user.lastName || ''}`.trim()
    if (user.name) return user.name
    if (user.username) return user.username
    
    return t('user') || 'User'
  }

  const getUserInitials = () => {
    if (loading) return '...'
    if (isAuthenticated && !user) return '?'
    if (!user) return 'U'
    
    if (user.firstName) {
      const firstInitial = user.firstName.charAt(0).toUpperCase()
      const lastInitial = user.lastName ? user.lastName.charAt(0).toUpperCase() : ''
      return firstInitial + lastInitial
    }
    
    if (user.name) {
      const nameParts = user.name.split(' ')
      if (nameParts.length >= 2) {
        return nameParts[0].charAt(0).toUpperCase() + nameParts[1].charAt(0).toUpperCase()
      }
      return user.name.charAt(0).toUpperCase()
    }
    
    if (user.email) return user.email.charAt(0).toUpperCase()
    if (user.username) return user.username.charAt(0).toUpperCase()
    
    return 'U'
  }

  const handleLogout = async () => {
    await logout()
    setShowProfileDropdown(false)
    setActiveDropdownSource(null)
  }

  const toggleProfileDropdown = (e, source) => {
    e.stopPropagation()
    
    if (showProfileDropdown && activeDropdownSource === source) {
      setShowProfileDropdown(false)
      setActiveDropdownSource(null)
    } else {
      setShowProfileDropdown(true)
      setActiveDropdownSource(source)
    }
  }

  const closeProfileDropdown = () => {
    setShowProfileDropdown(false)
    setActiveDropdownSource(null)
  }

  const getActiveProfileButtonRef = () => {
    return activeDropdownSource === 'compact' ? compactProfileButtonRef : profileButtonRef
  }

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu)
  }

  const closeMobileMenu = () => {
    setShowMobileMenu(false)
  }

  if (loading) {
    return (
      <>
        <header style={{
          position: 'relative',
          zIndex: 50,
          padding: '24px'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <Link href="/" style={{
              fontSize: isMobile ? '24px' : '28px',
              fontWeight: 'bold',
              color: 'white',
              textDecoration: 'none'
            }}>
              DX<span style={{ color: '#2dd4bf' }}>CAPITAL</span>
            </Link>
            
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              alignItems: 'center',
              order: 2,
              position: 'relative'
            }}>
              <div style={{
                color: 'white',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                {t('loading') || 'Loading...'}
              </div>
            </div>
          </div>
        </header>
      </>
    )
  }

  const linkStyle = {
    color: 'rgba(255,255,255,0.9)', 
    textDecoration: 'none', 
    fontWeight: '500', 
    fontSize: '15px',
    transition: 'color 0.3s',
    whiteSpace: 'nowrap'
  }

  const compactLinkStyle = {
    color: 'rgba(255,255,255,0.9)', 
    textDecoration: 'none', 
    fontWeight: '500', 
    fontSize: '14px',
    transition: 'color 0.3s',
    whiteSpace: 'nowrap'
  }

  const mobileLinkStyle = {
    display: 'block',
    color: 'rgba(255,255,255,0.9)',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '18px',
    padding: '16px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    transition: 'all 0.3s'
  }

  return (
    <>
      {/* Основной статичный хедер */}
      <header style={{
        position: 'relative',
        zIndex: 50,
        padding: '24px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <Link href="/" style={{
              fontSize: isMobile ? '24px' : '28px',
              fontWeight: 'bold',
              color: 'white',
              textDecoration: 'none'
            }}>
              DX<span style={{ color: '#2dd4bf' }}>CAPITAL</span>
            </Link>
            
            {!isMobile && <LanguageSwitcher />}
          </div>
          
          {!isMobile && (
            <nav style={{
              display: 'flex',
              gap: isTablet ? '20px' : '30px',
              order: 2,
              flexWrap: 'wrap'
            }}>
              <Link href="/team" style={linkStyle}
                onMouseOver={(e) => e.target.style.color = '#2dd4bf'}
                onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.9)'}
              >{t('team')}</Link>

              <Link href="/directions" style={linkStyle}
                onMouseOver={(e) => e.target.style.color = '#2dd4bf'}
                onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.9)'}
              >{t('directions')}</Link>

              <Link href="/risks-guarantees" style={linkStyle}
                onMouseOver={(e) => e.target.style.color = '#2dd4bf'}
                onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.9)'}
              >{t('risksGuarantees')}</Link>

              <Link href="/statistics" style={linkStyle}
                onMouseOver={(e) => e.target.style.color = '#2dd4bf'}
                onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.9)'}
              >{t('statistics')}</Link>

              <Link href="/client-bonus" style={linkStyle}
                onMouseOver={(e) => e.target.style.color = '#2dd4bf'}
                onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.9)'}
              >{t('clientBonus')}</Link>

              <Link href="/faq" style={linkStyle}
                onMouseOver={(e) => e.target.style.color = '#2dd4bf'}
                onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.9)'}
              >{t('faq')}</Link>
            </nav>
          )}
          
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            alignItems: 'center',
            order: isMobile ? 2 : 3,
            position: 'relative'
          }}>
            {isMobile && (
              <button
                onClick={toggleMobileMenu}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                  zIndex: 9999
                }}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showMobileMenu ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}

            {!isMobile && isAuthenticated ? (
              <div style={{ position: 'relative' }}>
                <button 
                  ref={profileButtonRef}
                  onClick={(e) => toggleProfileDropdown(e, 'main')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '16px',
                    padding: '8px 16px',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.15)'}
                  onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: (isAuthenticated && !user) 
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                      : 'linear-gradient(135deg, #2dd4bf, #14b8a6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    {getUserInitials()}
                  </div>
                  
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '600'
                  }}>
                    {getUserDisplayName()}
                  </span>
                  
                  <svg 
                    width="16" 
                    height="16" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                    style={{
                      transform: (showProfileDropdown && activeDropdownSource === 'main') ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s'
                    }}
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {showProfileDropdown && activeDropdownSource === 'main' && (
                  <ProfileDropdown 
                    user={user}
                    onClose={closeProfileDropdown}
                    onLogout={handleLogout}
                    isMobile={isMobile}
                    profileButtonRef={getActiveProfileButtonRef()}
                    getUserDisplayName={getUserDisplayName}
                    getUserInitials={getUserInitials}
                  />
                )}
              </div>
            ) : !isMobile && (
              <>
                <button 
                  onClick={() => setShowLoginModal(true)}
                  style={{
                    color: 'rgba(255,255,255,0.9)',
                    background: 'none',
                    border: 'none',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontSize: '16px',
                    transition: 'color 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.color = 'white'}
                  onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.9)'}
                >
                  {t('login')}
                </button>
                <button 
                  onClick={() => setShowRegisterModal(true)}
                  style={{
                    background: '#14b8a6',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    fontSize: '16px'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#2dd4bf'}
                  onMouseOut={(e) => e.target.style.background = '#14b8a6'}
                >
                  {t('startStaking')}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobile && showMobileMenu && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.98)',
          backdropFilter: 'blur(20px)',
          zIndex: 9998,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}>
          {/* Хедер мобильного меню */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Link href="/" style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'white',
              textDecoration: 'none'
            }} onClick={closeMobileMenu}>
              DX<span style={{ color: '#2dd4bf' }}>CAPITAL</span>
            </Link>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <LanguageSwitcher />
              
              <button
                onClick={closeMobileMenu}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s'
                }}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <nav style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1
          }}>
            <Link href="/team" style={mobileLinkStyle} onClick={closeMobileMenu}
              onMouseOver={(e) => e.target.style.background = 'rgba(45, 212, 191, 0.1)'}
              onMouseOut={(e) => e.target.style.background = 'transparent'}
            >{t('team')}</Link>

            <Link href="/directions" style={mobileLinkStyle} onClick={closeMobileMenu}
              onMouseOver={(e) => e.target.style.background = 'rgba(45, 212, 191, 0.1)'}
              onMouseOut={(e) => e.target.style.background = 'transparent'}
            >{t('directions')}</Link>

            <Link href="/risks-guarantees" style={mobileLinkStyle} onClick={closeMobileMenu}
              onMouseOver={(e) => e.target.style.background = 'rgba(45, 212, 191, 0.1)'}
              onMouseOut={(e) => e.target.style.background = 'transparent'}
            >{t('risksGuarantees')}</Link>

            <Link href="/statistics" style={mobileLinkStyle} onClick={closeMobileMenu}
              onMouseOver={(e) => e.target.style.background = 'rgba(45, 212, 191, 0.1)'}
              onMouseOut={(e) => e.target.style.background = 'transparent'}
            >{t('statistics')}</Link>

            <Link href="/client-bonus" style={mobileLinkStyle} onClick={closeMobileMenu}
              onMouseOver={(e) => e.target.style.background = 'rgba(45, 212, 191, 0.1)'}
              onMouseOut={(e) => e.target.style.background = 'transparent'}
            >{t('clientBonus')}</Link>

            <Link href="/faq" style={mobileLinkStyle} onClick={closeMobileMenu}
              onMouseOver={(e) => e.target.style.background = 'rgba(45, 212, 191, 0.1)'}
              onMouseOut={(e) => e.target.style.background = 'transparent'}
            >{t('faq')}</Link>
          </nav>

          <div style={{
            padding: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {isAuthenticated && (
              <Link 
                href="/profile"
                onClick={closeMobileMenu}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  width: '100%',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  marginBottom: '12px'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #5eead4, #2dd4bf)'
                  e.target.style.transform = 'translateY(-1px)'
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #2dd4bf, #14b8a6)'
                  e.target.style.transform = 'translateY(0)'
                }}
              >
                {t('myProfile')}
              </Link>
            )}

            {!isAuthenticated && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <button 
                  onClick={() => {
                    setShowLoginModal(true)
                    closeMobileMenu()
                  }}
                  style={{
                    color: 'white',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '14px 24px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '16px',
                    width: '100%'
                  }}
                >
                  {t('login')}
                </button>
                <button 
                  onClick={() => {
                    setShowRegisterModal(true)
                    closeMobileMenu()
                  }}
                  style={{
                    background: '#14b8a6',
                    color: 'white',
                    border: 'none',
                    padding: '14px 24px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '16px',
                    width: '100%'
                  }}
                >
                  {t('startStaking')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Компактный фиксированный хедер (только для desktop/tablet) */}
      {!isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 60,
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          transform: isScrolled ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
          padding: '16px 24px'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <Link href="/" style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: 'white',
                textDecoration: 'none'
              }}>
                DX<span style={{ color: '#2dd4bf' }}>CAPITAL</span>
              </Link>

              <LanguageSwitcher variant="minimal" />
            </div>

            <nav style={{
              display: 'flex',
              gap: isTablet ? '15px' : '20px',
              flexWrap: 'wrap'
            }}>
              <Link href="/team" style={compactLinkStyle}
                onMouseOver={(e) => e.target.style.color = '#2dd4bf'}
                onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.9)'}
              >{t('team')}</Link>

              <Link href="/directions" style={compactLinkStyle}
                onMouseOver={(e) => e.target.style.color = '#2dd4bf'}
                onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.9)'}
              >{t('directions')}</Link>

              <Link href="/risks-guarantees" style={compactLinkStyle}
                onMouseOver={(e) => e.target.style.color = '#2dd4bf'}
                onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.9)'}
              >{t('risksGuarantees')}</Link>

              <Link href="/statistics" style={compactLinkStyle}
                onMouseOver={(e) => e.target.style.color = '#2dd4bf'}
                onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.9)'}
              >{t('statistics')}</Link>

              <Link href="/client-bonus" style={compactLinkStyle}
                onMouseOver={(e) => e.target.style.color = '#2dd4bf'}
                onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.9)'}
              >{t('clientBonus')}</Link>

              <Link href="/faq" style={compactLinkStyle}
                onMouseOver={(e) => e.target.style.color = '#2dd4bf'}
                onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.9)'}
              >{t('faq')}</Link>
            </nav>
            
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              alignItems: 'center',
              position: 'relative'
            }}>
              {isAuthenticated ? (
                <div style={{ position: 'relative' }}>
                  <button 
                    ref={compactProfileButtonRef}
                    onClick={(e) => toggleProfileDropdown(e, 'compact')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '14px',
                      padding: '8px 14px',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.15)'}
                    onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                  >
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: (isAuthenticated && !user) 
                        ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                        : 'linear-gradient(135deg, #2dd4bf, #14b8a6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}>
                      {getUserInitials()}
                    </div>
                    
                    <span style={{ 
                      fontSize: '13px', 
                      fontWeight: '600'
                    }}>
                      {getUserDisplayName()}
                    </span>
                    
                    <svg 
                      width="14" 
                      height="14" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                      style={{
                        transform: (showProfileDropdown && activeDropdownSource === 'compact') ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s'
                      }}
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {showProfileDropdown && activeDropdownSource === 'compact' && (
                    <ProfileDropdown 
                      user={user}
                      onClose={closeProfileDropdown}
                      onLogout={handleLogout}
                      isMobile={isMobile}
                      profileButtonRef={getActiveProfileButtonRef()}
                      getUserDisplayName={getUserDisplayName}
                      getUserInitials={getUserInitials}
                    />
                  )}
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    style={{
                      color: 'rgba(255,255,255,0.9)',
                      background: 'none',
                      border: 'none',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontSize: '15px',
                      transition: 'color 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.color = 'white'}
                    onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.9)'}
                  >
                    {t('login')}
                  </button>
                  <button 
                    onClick={() => setShowRegisterModal(true)}
                    style={{
                      background: '#14b8a6',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      fontSize: '15px'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#2dd4bf'}
                    onMouseOut={(e) => e.target.style.background = '#14b8a6'}
                  >
                    {t('startStaking')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => {
            setShowLoginModal(false)
            setShowRegisterModal(true)
          }}
        />
      )}
      
      {showRegisterModal && (
        <RegisterModal 
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => {
            setShowRegisterModal(false)
            setShowLoginModal(true)
          }}
        />
      )}
    </>
  )
}