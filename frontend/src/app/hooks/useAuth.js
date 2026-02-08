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
      
      if (token) {
        const response = await authAPI.getProfile()
        
        if (response.data && response.data.success) {
          const userData = response.data.data || response.data.user
          
          if (userData) {
            setUser(userData)
            setIsAuthenticated(true)
          } else {
            throw new Error('No user data')
          }
        } else {
          throw new Error('Invalid response')
        }
      } else {
        setUser(null)  
        setIsAuthenticated(false)
      }
    } catch (error) {
      // Only log critical errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Auth check error:', error)
      }
      
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      // ✅ 120 секунд для медленных мобильных соединений
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000)

      const response = await authAPI.login({ 
        emailOrUsername: email,
        password 
      }, { signal: controller.signal })
      
      clearTimeout(timeoutId)
      
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
      
      if (!accessToken) {
        return {
          success: false,
          error: 'No access token received from server'
        }
      }
      
      localStorage.setItem('access_token', accessToken)
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken)
      }
      
      if (userData) {
        setUser(userData)
        setIsAuthenticated(true)
      } else {
        // ✅ Fetch profile in background - DON'T block login!
        setIsAuthenticated(true) // Set immediately so redirect works
        authAPI.getProfile()
          .then(profileResponse => {
            const profileData = profileResponse.data.data || profileResponse.data.user
            if (profileData) {
              setUser(profileData)
            }
          })
          .catch(() => {
            // Silent fail - will be fetched on profile page
          })
      }
      
      return { success: true, user: userData }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Login error:', error)
      }
      
      let errorMessage = 'Login failed'
      
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
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000)

      const response = await authAPI.register(userData, { signal: controller.signal })

      clearTimeout(timeoutId)

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
      if (process.env.NODE_ENV === 'development') {
        console.error('Registration error:', error)
      }
      
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
      await authAPI.logout()
    } catch (error) {
      // Silent fail - not critical
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('referralCode')
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const updateUser = (updatedUserData) => {
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
