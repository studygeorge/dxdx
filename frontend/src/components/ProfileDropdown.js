'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfileDropdown({ 
  user, 
  onClose, 
  onLogout, 
  isMobile, 
  profileButtonRef,
  getUserDisplayName,
  getUserInitials
}) {
  const dropdownRef = useRef(null)
  const router = useRouter()
  const [language, setLanguage] = useState('en')

  // Загружаем текущий язык из localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en'
    setLanguage(savedLanguage)

    const handleLanguageChange = (event) => {
      const newLanguage = event.detail
      setLanguage(newLanguage)
    }

    window.addEventListener('languageChanged', handleLanguageChange)
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange)
    }
  }, [])

  // Переводы
  const translations = {
    en: {
      noEmail: 'No email',
      goToProfile: 'Go to Profile',
      signOut: 'Sign Out'
    },
    ru: {
      noEmail: 'Нет email',
      goToProfile: 'Профиль',
      signOut: 'Выйти'
    }
  }

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose, profileButtonRef])

  const handleNavigation = (path) => {
    router.push(path)
    onClose()
  }

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '8px',
        width: isMobile ? '240px' : '280px',
        background: `
          linear-gradient(135deg, 
            rgba(255, 255, 255, 0.15) 0%,
            rgba(255, 255, 255, 0.05) 25%,
            rgba(255, 255, 255, 0.02) 50%,
            rgba(255, 255, 255, 0.05) 75%,
            rgba(255, 255, 255, 0.10) 100%
          )
        `,
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '20px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        padding: '20px',
        zIndex: 1000
      }}
    >
      {/* User Info Header */}
      <div style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '16px',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '18px',
            color: 'white'
          }}>
            {getUserInitials()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              margin: 0,
              lineHeight: '1.2',
              marginBottom: '4px'
            }}>
              {getUserDisplayName()}
            </h3>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '13px',
              margin: 0,
              lineHeight: '1.2',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user?.email || t('noEmail')}
            </p>
          </div>
        </div>
      </div>

      {/* Go to Profile Button */}
      <button
        onClick={() => handleNavigation('/profile')}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px',
          background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)',
          border: 'none',
          borderRadius: '12px',
          color: '#000000',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s',
          marginBottom: '12px'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
        {t('goToProfile')}
      </button>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          color: '#10b981',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.25)'
          e.currentTarget.style.color = '#2dd4bf'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'
          e.currentTarget.style.color = '#10b981'
        }}
      >
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
        </svg>
        {t('signOut')}
      </button>
    </div>
  )
}