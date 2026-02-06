'use client'
import { useState, useEffect } from 'react'

export default function LanguageSwitcher({ variant = 'default', className = '' }) {
  const [currentLanguage, setCurrentLanguage] = useState('en')

  // Восстанавливаем язык из localStorage при загрузке
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en'
    setCurrentLanguage(savedLanguage)
    document.documentElement.lang = savedLanguage
  }, [])

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'ru' : 'en'
    setCurrentLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
    document.documentElement.lang = newLanguage
    
    console.log('Language changed to:', newLanguage)
    
    // Отправляем событие для других компонентов
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: newLanguage }))
  }

  // Стили для разных вариантов
  const getStyles = () => {
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '20px',
      padding: '4px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    }

    if (variant === 'minimal') {
      return {
        ...baseStyles,
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '3px'
      }
    }

    return baseStyles
  }

  const getOptionStyles = (isActive) => {
    const baseOptionStyles = {
      padding: '6px 12px',
      borderRadius: '16px',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      position: 'relative',
      zIndex: 2,
      minWidth: '32px',
      textAlign: 'center'
    }

    if (variant === 'minimal') {
      return {
        ...baseOptionStyles,
        padding: '4px 8px',
        fontSize: '12px',
        borderRadius: '12px',
        minWidth: '24px'
      }
    }

    if (isActive) {
      return {
        ...baseOptionStyles,
        color: '#1f2937',
        background: 'rgba(255, 255, 255, 0.9)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }
    }

    return {
      ...baseOptionStyles,
      color: 'rgba(255, 255, 255, 0.7)'
    }
  }

  return (
    <div 
      className={className}
      style={getStyles()}
      onClick={toggleLanguage}
      onMouseOver={(e) => {
        if (variant !== 'minimal') {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
        }
      }}
      onMouseOut={(e) => {
        if (variant !== 'minimal') {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
        } else {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
        }
      }}
      title={`Switch to ${currentLanguage === 'en' ? 'Russian' : 'English'}`}
    >
      <div style={getOptionStyles(currentLanguage === 'en')}>
        EN
      </div>
      <div style={getOptionStyles(currentLanguage === 'ru')}>
        RU
      </div>
    </div>
  )
}
