'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { VideoBackground, FallingStars, TiffanyNebula, FlyingWhiteStars } from './components/BackgroundEffects'
import NavigationDesktop from './components/NavigationDesktop'
import NavigationMobile from './components/NavigationMobile'
import UserHeader from './components/UserHeader'
import LogoutModal from './components/LogoutModal'
import Web3Modal from './components/Web3Modal'
import KYCModal from '../components/KYCModal'
import OverviewTab from '../components/OverviewTab'
import InvestingTab from '../components/InvestingTab'
import HistoryTab from '../components/HistoryTab'
import ReferralTab from '../components/ReferralTab'
import WalletTab from '../components/WalletTab'
import { useProfile } from './hooks/useProfile'
import { useWallet } from './hooks/useWallet'
import { useNavigation } from './hooks/useNavigation'
import { translations, getTabs } from './constants'
import { setupViewport, injectGlobalStyles } from './utils/viewport'
import { authAPI } from '../../utils/api' 

export default function ProfileLayout({ isMobile }) {
  const router = useRouter()
  
  // Хуки
  const {
    user,
    loading,
    kycStatus,
    setKycStatus,
    investmentPlans,
    plansLoading,
    handleKYCSubmitted,
    refreshUserData
  } = useProfile(router)

  const {
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
  } = useNavigation()

  const {
    walletAddress,
    showWeb3Modal,
    setShowWeb3Modal,
    connectingWallet,
    walletError,
    connectWallet,
    disconnectWallet
  } = useWallet(translations[language], user, refreshUserData)

  // Инициализация
  useEffect(() => {
    console.log('🚀 ProfileLayout mounted - Starting initialization')
    
    const cleanupViewport = setupViewport()
    const cleanupStyles = injectGlobalStyles()
    
    return () => {
      cleanupViewport()
      cleanupStyles()
    }
  }, [])

  // Переводы и табы
  const t = translations[language]
  const tabs = getTabs(t)
  const isKYCApproved = kycStatus === 'APPROVED'
  const isAnyModalOpen = showKYCModal || showWeb3Modal || hasOpenModal || showLogoutModal

  // Обработчики
  const handleNavigateToInvestments = (investmentId) => {
    console.log('🚀 Navigating to InvestingTab, investment ID:', investmentId)
    setActiveTab('investing')
    
    setTimeout(() => {
      const element = document.getElementById(`investment-${investmentId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 300)
  }

  const handleLogout = async () => {
    try {
      console.log('🚪 Starting full logout...')
      
      try {
        await authAPI.logout()
        console.log('✅ API logout successful')
      } catch (error) {
        console.error('❌ API logout error:', error)
      }
      
      localStorage.clear()
      console.log('✅ LocalStorage cleared')
      
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          await window.ethereum.request({
            method: 'wallet_revokePermissions',
            params: [{ eth_accounts: {} }]
          })
          console.log('✅ MetaMask permissions revoked')
        } catch (err) {
          console.log('ℹ️ Could not revoke MetaMask permissions')
        }
      }
      
      console.log('🔄 Redirecting to home page...')
      router.push('/')
      
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
      
    } catch (error) {
      console.error('❌ Logout error:', error)
      
      localStorage.clear()
      router.push('/')
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
    }
  }

  const handleKYCClose = () => {
    setShowKYCModal(false)
  }

  const renderTabContent = () => {
    if (!user && activeTab !== 'overview') {
      return (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '32px',
          padding: isMobile ? '36px 20px' : '60px 36px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '15px',
            color: 'rgba(255, 255, 255, 0.5)',
            letterSpacing: '-0.3px'
          }}>
            {t.loading}...
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab 
            isMobile={isMobile} 
            language={language} 
            user={user}
            kycStatus={kycStatus}
            onOpenKYCModal={() => setShowKYCModal(true)}
            onNavigateToInvestments={handleNavigateToInvestments}
          />
        )
      
      case 'investing':
        return (
          <InvestingTab 
            isMobile={isMobile} 
            language={language} 
            investmentPlans={investmentPlans}
            plansLoading={plansLoading}
            walletAddress={walletAddress}
            setShowWeb3Modal={setShowWeb3Modal}
            user={user}
            onModalStateChange={setHasOpenModal}
          />
        )
      
      case 'history':
        return <HistoryTab isMobile={isMobile} language={language} user={user} />
      
      case 'referral':
        return <ReferralTab isMobile={isMobile} language={language} user={user} />
      
      case 'upgrade':
        return <WalletTab isMobile={isMobile} language={language} user={user} walletAddress={walletAddress} />
      
      default:
        return null
    }
  }

  // Loading screen
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <VideoBackground isMobile={isMobile} />
        <TiffanyNebula isMobile={isMobile} />
        <FallingStars />
        <FlyingWhiteStars />
        <div style={{ 
          fontSize: '20px', 
          color: '#2dd4bf', 
          fontWeight: '500',
          letterSpacing: '-0.5px',
          position: 'relative',
          zIndex: 10
        }}>
          {t.loading}...
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000000',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <VideoBackground isMobile={isMobile} />
      <FallingStars />
      <TiffanyNebula isMobile={isMobile} />
      <FlyingWhiteStars />

      {/* Navigation */}
      {isMobile ? (
        <NavigationMobile
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isKYCApproved={isKYCApproved}
          onShowKYCModal={() => setShowKYCModal(true)}
          isAnyModalOpen={isAnyModalOpen}
        />
      ) : (
        <NavigationDesktop
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isKYCApproved={isKYCApproved}
          onShowKYCModal={() => setShowKYCModal(true)}
          onShowLogoutModal={() => setShowLogoutModal(true)}
          language={language}
          onLanguageToggle={toggleLanguage}
          onBack={() => router.push('/')}
          t={t}
          isAnyModalOpen={isAnyModalOpen}
        />
      )}

      {/* Main Content */}
      <main style={{
        marginLeft: isMobile ? 0 : '280px',
        marginBottom: isMobile ? '72px' : 0,
        minHeight: '100vh',
        padding: isMobile ? '24px 16px' : '36px 48px',
        paddingBottom: isMobile ? '84px' : '36px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <UserHeader
            user={user}
            kycStatus={kycStatus}
            walletAddress={walletAddress}
            language={language}
            isMobile={isMobile}
            onShowKYCModal={() => setShowKYCModal(true)}
            onShowLogoutModal={() => setShowLogoutModal(true)}
            onLanguageToggle={toggleLanguage}
            onDisconnectWallet={disconnectWallet}
            t={t}
          />

          {renderTabContent()}
        </div>
      </main>

      {/* Modals */}
      <KYCModal
        isOpen={showKYCModal}
        onClose={handleKYCClose}
        isMobile={isMobile}
        language={language}
        onKYCSubmitted={handleKYCSubmitted}
      />

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        isMobile={isMobile}
        t={t}
      />

      <Web3Modal
        isOpen={showWeb3Modal}
        onClose={() => setShowWeb3Modal(false)}
        onConnect={connectWallet}
        connecting={connectingWallet}
        error={walletError}
        isMobile={isMobile}
        t={t}
      />
    </div>
  )
}
