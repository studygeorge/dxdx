'use client'
import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import Users from './components/Users'
import Settings from './components/Settings'
import InvestmentTesting from './components/InvestmentTesting'
import Reporting from './components/Reporting'

const API_BASE_URL = 'https://dxcapital-ai.com'
const BOT_USERNAME = 'dxcapital_bot'

// ID админов без доступа к Settings
const SETTINGS_BLACKLIST = ['5525020749', '7261521892', '8238308954', '8054184473', '8271509069', '7086860882']

// ID админов без доступа к Reporting и Testing
const REPORTING_BLACKLIST = ['8271509069', '7261521892','8054184473']

export default function AdminDashboard() {
  const [isMobile, setIsMobile] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [adminData, setAdminData] = useState(null)
  const [error, setError] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')

  const hasSettingsAccess = () => {
    if (!adminData?.telegramId) return false
    return !SETTINGS_BLACKLIST.includes(String(adminData.telegramId))
  }

  const hasReportingAccess = () => {
    if (!adminData?.telegramId) return false
    return !REPORTING_BLACKLIST.includes(String(adminData.telegramId))
  }

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      setIsSidebarOpen(!mobile)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    checkExistingSession()

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const checkExistingSession = async () => {
    const token = localStorage.getItem('admin_access_token')
    
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setAdminData(data.admin)
        setIsAuthenticated(true)
      } else {
        await refreshTokens()
      }
    } catch (error) {
      console.error('Session check failed:', error)
      localStorage.removeItem('admin_access_token')
      localStorage.removeItem('admin_refresh_token')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshTokens = async () => {
    const refreshToken = localStorage.getItem('admin_refresh_token')
    
    if (!refreshToken) {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken })
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('admin_access_token', data.accessToken)
        localStorage.setItem('admin_refresh_token', data.refreshToken)
        await checkExistingSession()
      } else {
        localStorage.removeItem('admin_access_token')
        localStorage.removeItem('admin_refresh_token')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      localStorage.removeItem('admin_access_token')
      localStorage.removeItem('admin_refresh_token')
      setIsLoading(false)
    }
  }

  const handleTelegramAuth = async (user) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/auth/telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(user)
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('admin_access_token', data.accessToken)
        localStorage.setItem('admin_refresh_token', data.refreshToken)
        
        setAdminData(data.admin)
        setIsAuthenticated(true)
        setError(null)
      } else {
        setError(data.error || 'Authentication failed')
      }
    } catch (error) {
      console.error('Telegram auth error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    const token = localStorage.getItem('admin_access_token')
    
    try {
      await fetch(`${API_BASE_URL}/api/v1/admin/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    }

    localStorage.removeItem('admin_access_token')
    localStorage.removeItem('admin_refresh_token')
    setIsAuthenticated(false)
    setAdminData(null)
  }

  const handleSectionChange = (section) => {
    // Проверка доступа к Settings
    if (section === 'settings' && !hasSettingsAccess()) {
      console.warn('Access denied to Settings section')
      return
    }

    // Проверка доступа к Testing и Reporting
    if ((section === 'testing' || section === 'reporting') && !hasReportingAccess()) {
      console.warn('Access denied to Testing/Reporting section')
      return
    }

    setActiveSection(section)
  }

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      window.onTelegramAuth = handleTelegramAuth

      const script = document.createElement('script')
      script.src = 'https://telegram.org/js/telegram-widget.js?22'
      script.setAttribute('data-telegram-login', BOT_USERNAME)
      script.setAttribute('data-size', 'large')
      script.setAttribute('data-radius', '8')
      script.setAttribute('data-onauth', 'onTelegramAuth(user)')
      script.setAttribute('data-request-access', 'write')
      script.async = true

      const container = document.getElementById('telegram-login-container')
      if (container) {
        container.innerHTML = ''
        container.appendChild(script)
      }

      return () => {
        if (container) {
          container.innerHTML = ''
        }
        delete window.onTelegramAuth
      }
    }
  }, [isAuthenticated, isLoading])

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          fontSize: '24px',
          color: '#2dd4bf',
          fontWeight: '600'
        }}>
          Loading...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '20px' : '40px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(45, 212, 191, 0.2)',
          borderRadius: '32px',
          padding: isMobile ? '40px 24px' : '60px 80px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: isMobile ? '32px' : '42px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '16px',
            letterSpacing: '-2px'
          }}>
            Admin Access
          </h1>
          
          <p style={{
            fontSize: isMobile ? '16px' : '18px',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '40px',
            letterSpacing: '-0.5px'
          }}>
            Sign in with your Telegram account
          </p>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              color: '#ef4444',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div 
            id="telegram-login-container"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '60px',
              marginTop: '32px'
            }}
          />

          <p style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.4)',
            marginTop: '32px',
            lineHeight: '1.6'
          }}>
            Only authorized administrators can access this panel
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      display: 'flex'
    }}>
      <Sidebar 
        isMobile={isMobile}
        isOpen={isSidebarOpen}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onClose={() => setIsSidebarOpen(false)}
        hasSettingsAccess={hasSettingsAccess()}
        hasReportingAccess={hasReportingAccess()}
      />

      <div style={{ flex: 1, overflow: 'auto' }}>
        <Header 
          isMobile={isMobile}
          activeSection={activeSection}
          adminData={adminData}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onLogout={handleLogout}
        />

        <div style={{ padding: isMobile ? '20px' : '40px' }}>
          {activeSection === 'dashboard' && <Dashboard isMobile={isMobile} />}
          {activeSection === 'users' && <Users isMobile={isMobile} />}
          
          {activeSection === 'testing' && (
            hasReportingAccess() ? (
              <InvestmentTesting isMobile={isMobile} />
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px', 
                color: 'rgba(255, 255, 255, 0.5)' 
              }}>
                Access denied. You don't have permission to view this section.
              </div>
            )
          )}

          {activeSection === 'reporting' && (
            hasReportingAccess() ? (
              <Reporting isMobile={isMobile} />
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px', 
                color: 'rgba(255, 255, 255, 0.5)' 
              }}>
                Access denied. You don't have permission to view this section.
              </div>
            )
          )}

          {activeSection === 'trades' && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255, 255, 255, 0.5)' }}>
              Trades section - Coming soon
            </div>
          )}
          
          {activeSection === 'wallets' && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255, 255, 255, 0.5)' }}>
              Wallets section - Coming soon
            </div>
          )}
          
          {activeSection === 'settings' && (
            hasSettingsAccess() ? (
              <Settings isMobile={isMobile} />
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px', 
                color: 'rgba(255, 255, 255, 0.5)' 
              }}>
                Access denied. You don't have permission to view this section.
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}