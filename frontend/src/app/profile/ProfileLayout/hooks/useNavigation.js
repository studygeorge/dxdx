import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export const useNavigation = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [showKYCModal, setShowKYCModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [hasOpenModal, setHasOpenModal] = useState(false)
  const [language, setLanguage] = useState('en')
  
  const searchParams = useSearchParams()

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) {
      console.log('📌 Tab from URL:', tab)
      setActiveTab(tab)
    }
    
    const savedLang = localStorage.getItem('language') || 'en'
    console.log('🌐 Language:', savedLang)
    setLanguage(savedLang)
  }, [searchParams])

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ru' : 'en'
    console.log('🌐 Switching language to:', newLang)
    setLanguage(newLang)
    localStorage.setItem('language', newLang)
  }

  return {
    activeTab,
    setActiveTab,
    showKYCModal,
    setShowKYCModal,
    showLogoutModal,
    setShowLogoutModal,
    hasOpenModal,
    setHasOpenModal,
    language,
    toggleLanguage
  }
}
