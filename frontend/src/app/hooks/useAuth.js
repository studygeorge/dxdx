'use client'  
import { useState, useEffect, createContext, useContext } from 'react'
import { authAPI } from '../utils/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('access_token')
      console.log('🔍 Checking auth status, token:', token ? 'exists' : 'not found')
      
      if (token) {
        console.log('📡 Making getProfile request')
        const response = await authAPI.getProfile()
        console.log('✅ Profile response:', response)
        
        if (response.data && response.data.success) {
          const userData = response.data.data || response.data.user
          console.log('👤 User data extracted:', userData)
          
          if (userData) {
            setUser(userData)
            setIsAuthenticated(true)
            console.log('✅ User authenticated successfully')
          } else {
            console.log('❌ No user data in response')
            throw new Error('No user data')
          }
        } else {
          console.log('❌ Invalid response structure')
          throw new Error('Invalid response')
        }
      } else {
        console.log('🚫 No token found')
        setUser(null)  
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('❌ Auth check error:', error)
      console.error('❌ Error response:', error.response?.data)
      
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
      console.log('✅ Auth check completed')
    }
  }

  const login = async (email, password) => {
    try {
      console.log('🔐 Login attempt:', { email })
      
      // ✅ Увеличенный таймаут до 60 секунд
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 секунд

      const response = await authAPI.login({ 
        emailOrUsername: email,
        password 
      }, { signal: controller.signal })
      
      clearTimeout(timeoutId)
      console.log('✅ Login response:', response.data)
      
      const responseData = response.data
      
      let accessToken = null
      let refreshToken = null
      let userData = null
      
      if (responseData.success) {
        accessToken = responseData.access_token || responseData.accessToken
        refreshToken = responseData.refresh_token || responseData.refreshToken
        userData = responseData.user || responseData.data
        
        if (!accessToken && responseData.data?.tokens) {
          accessToken = responseData.data.tokens.accessToken
          refreshToken = responseData.data.tokens.refreshToken
          userData = responseData.data.user
        }
        
        if (!accessToken && responseData.tokens) {
          accessToken = responseData.tokens.accessToken
          refreshToken = responseData.tokens.refreshToken
        }
      }
      
      console.log('🔑 Extracted tokens:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasUserData: !!userData
      })
      
      if (!accessToken) {
        console.error('❌ No access token in response!')
        return {
          success: false,
          error: 'No access token received from server'
        }
      }
      
      localStorage.setItem('access_token', accessToken)
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken)
      }
      
      console.log('💾 Tokens saved to localStorage')
      
      if (userData) {
        setUser(userData)
        setIsAuthenticated(true)
        console.log('👤 User data set:', userData)
      } else {
        console.log('📡 Fetching user data via /me endpoint')
        try {
          const profileResponse = await authAPI.getProfile()
          const profileData = profileResponse.data.data || profileResponse.data.user
          if (profileData) {
            setUser(profileData)
            setIsAuthenticated(true)
            console.log('👤 User data fetched:', profileData)
          }
        } catch (profileError) {
          console.error('❌ Failed to fetch profile:', profileError)
        }
      }
      
      return { success: true, user: userData }
    } catch (error) {
      console.error('❌ Login error:', error)
      console.error('❌ Error response:', error.response?.data)
      
      let errorMessage = 'Login failed'
      
      // ✅ Обработка таймаута
      if (error.name === 'AbortError') {
        errorMessage = 'Server timeout. Please try again.'
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Connection timeout. Please check your internet.'
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return { 
        success: false, 
        error: errorMessage
      }
    }
  }

  const register = async (userData) => {
    try {
      console.log('📤 Registration request:', {
        name: userData.name,
        email: userData.email,
        telegramId: userData.telegramId,
        telegramUsername: userData.telegramUsername,
        telegramFirstName: userData.telegramFirstName,
        telegramLastName: userData.telegramLastName,
        hasPassword: !!userData.password,
        referralCode: userData.referralCode
      })

      // ✅ Увеличенный таймаут до 60 секунд
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000)

      const response = await authAPI.register(userData, { signal: controller.signal })

      clearTimeout(timeoutId)
      console.log('✅ Registration response:', response.data)

      if (response.data.success) {
        return { 
          success: true, 
          data: response.data,
          user: response.data.user || response.data.data
        }
      } else {
        return {
          success: false,
          error: response.data.error || response.data.message || 'Registration failed'
        }
      }
    } catch (error) {
      console.error('❌ Registration error:', error)
      console.error('❌ Error response:', error.response?.data)
      
      let errorMessage = 'Registration failed'
      
      if (error.name === 'AbortError') {
        errorMessage = 'Server timeout. Please try again.'
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return { 
        success: false, 
        error: errorMessage
      }
    }
  }

  const logout = async () => {
    try {
      console.log('🚪 Logging out...')
      await authAPI.logout()
      console.log('✅ Logout request sent')
    } catch (error) {
      console.error('❌ Logout error:', error)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('referralCode')
      setUser(null)
      setIsAuthenticated(false)
      console.log('✅ User logged out, tokens cleared')
    }
  }

  const updateUser = (updatedUserData) => {
    console.log('🔄 Updating user data:', updatedUserData)
    setUser(updatedUserData)
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}