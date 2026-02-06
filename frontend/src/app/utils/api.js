import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://dxcapital-ai.com/api/v1' 
    : 'http://localhost:4000/api/v1',
  timeout: 60000, // ✅ Увеличено до 60 секунд
  headers: {
    'Content-Type': 'application/json',
  },
})

// ⭐ Флаг для предотвращения множественных одновременных refresh запросов
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

// ⭐ Функция тихого logout (без уведомлений)
const performSilentLogout = () => {
  console.log('🚪 Performing silent logout...')
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('wallet_address')
  localStorage.removeItem('user_id')
  localStorage.removeItem('user_email')
  
  if (typeof window !== 'undefined') {
    // ✅ Небольшая задержка перед редиректом
    setTimeout(() => {
      window.location.href = '/'
    }, 100)
  }
}

// Интерцептор для добавления токена авторизации
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        console.log('🔑 Added auth token to request:', config.url)
      }
    }
    return config
  },
  (error) => {
    console.error('❌ Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// ⭐ Интерцептор для автоматического обновления токена
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.config.url, response.status)
    return response
  },
  async (error) => {
    const originalRequest = error.config

    console.log('❌ Response error:', {
      url: originalRequest?.url,
      status: error.response?.status,
      code: error.response?.data?.code,
      message: error.response?.data?.error || error.message
    })

    // ✅ Обработка таймаута
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('⏱️ Request timeout:', originalRequest?.url)
      return Promise.reject({
        ...error,
        message: 'Request timeout. Please check your internet connection.',
        isTimeout: true
      })
    }

    // ✅ Обработка сетевых ошибок
    if (error.message === 'Network Error' || !error.response) {
      console.error('🌐 Network error:', originalRequest?.url)
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your internet connection.',
        isNetworkError: true
      })
    }

    // ⭐ Проверяем 401 ошибку
    if (error.response?.status === 401) {
      console.log('🔓 Received 401 error')
      
      // Если это TOKEN_EXPIRED и мы ещё не пытались обновить
      if ((error.response?.data?.code === 'TOKEN_EXPIRED' || 
           error.response?.data?.error?.includes('expired') ||
           error.response?.data?.error?.includes('Token expired')) &&
          !originalRequest._retry) {
        
        console.log('🔄 Token expired, attempting refresh...')
        
        // Если уже идет процесс обновления, добавляем запрос в очередь
        if (isRefreshing) {
          console.log('⏳ Refresh already in progress, queueing request...')
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          }).then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token
            console.log('✅ Retrying request with new token')
            return api(originalRequest)
          }).catch(err => {
            console.error('❌ Queued request failed after refresh')
            performSilentLogout()
            return Promise.reject(err)
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const refreshToken = localStorage.getItem('refresh_token')
          
          if (!refreshToken) {
            console.error('❌ No refresh token available')
            throw new Error('No refresh token')
          }
          
          console.log('📤 Sending refresh token request...')
          
          // ⭐ Пытаемся обновить токен с увеличенным таймаутом
          const response = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refresh_token: refreshToken },
            { timeout: 30000 } // 30 секунд для refresh
          )
          
          console.log('✅ Refresh token response received')
          
          const { access_token, refresh_token: newRefreshToken } = response.data
          
          if (!access_token) {
            console.error('❌ No access token in refresh response')
            throw new Error('No access token in response')
          }
          
          console.log('💾 Saving new tokens...')
          
          // Сохраняем новые токены
          localStorage.setItem('access_token', access_token)
          if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken)
          }
          
          // Обновляем токен в заголовках
          api.defaults.headers.common['Authorization'] = 'Bearer ' + access_token
          originalRequest.headers['Authorization'] = 'Bearer ' + access_token
          
          console.log('✅ Tokens updated successfully')
          
          // Обрабатываем очередь отложенных запросов
          processQueue(null, access_token)
          
          console.log('🔄 Retrying original request with new token')
          
          // Повторяем исходный запрос с новым токеном
          return api(originalRequest)
          
        } catch (refreshError) {
          console.error('❌ Refresh token failed:', refreshError.message)
          
          // ⭐ Если refresh не удался - ТИХИЙ logout без сообщений
          processQueue(refreshError, null)
          performSilentLogout()
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      // ⭐ Для всех остальных 401 ошибок - ТИХИЙ logout
      console.log('🚪 401 error - performing silent logout')
      performSilentLogout()
    }

    // ✅ Обработка других ошибок сервера
    if (error.response?.status >= 500) {
      console.error('🔥 Server error:', error.response.status)
      return Promise.reject({
        ...error,
        message: 'Server error. Please try again later.',
        isServerError: true
      })
    }

    return Promise.reject(error)
  }
)

// ============== API METHODS ==============

export const authAPI = {
  register: (data, config = {}) => {
    console.log('📤 API: Registering user...')
    return api.post('/auth/register', data, config)
  },
  
  login: (data, config = {}) => {
    console.log('📤 API: Logging in user...')
    return api.post('/auth/login', data, config)
  },
  
  logout: () => {
    console.log('📤 API: Logging out user...')
    return api.post('/auth/logout')
  },
  
  refreshToken: (refreshToken) => {
    console.log('📤 API: Refreshing token...')
    return api.post('/auth/refresh', { refresh_token: refreshToken })
  },
  
  getProfile: (config = {}) => {
    console.log('📤 API: Fetching user profile...')
    return api.get('/auth/me', config)
  },
  
  updateProfile: (data) => {
    console.log('📤 API: Updating user profile...')
    return api.put('/auth/profile', data)
  },
  
  changePassword: (data) => {
    console.log('📤 API: Changing password...')
    return api.post('/auth/change-password', data)
  },
  
  forgotPassword: (email) => {
    console.log('📤 API: Requesting password reset...')
    return api.post('/auth/forgot-password', { email })
  },
  
  resetPassword: (token, newPassword) => {
    console.log('📤 API: Resetting password...')
    return api.post('/auth/reset-password', { token, newPassword })
  },
  
  verifyEmail: (token) => {
    console.log('📤 API: Verifying email...')
    return api.post('/auth/verify-email', { token })
  },
  
  resendVerification: (email) => {
    console.log('📤 API: Resending verification email...')
    return api.post('/auth/resend-verification', { email })
  },
}

export const web3AuthAPI = {
  requestNonce: (walletAddress) => {
    console.log('📤 API: Requesting nonce for wallet:', walletAddress)
    return api.post('/web3auth/request-nonce', { wallet_address: walletAddress })
  },
  
  verify: (data) => {
    console.log('📤 API: Verifying Web3 signature...')
    return api.post('/web3auth/verify', data)
  },
  
  connect: (walletAddress) => {
    console.log('📤 API: Connecting Web3 wallet:', walletAddress)
    return api.post('/web3auth/connect', { wallet_address: walletAddress })
  },
}

export const tradingAPI = {
  getExchangeRate: (from, to, amount) => {
    console.log('📤 API: Fetching exchange rate:', { from, to, amount })
    return api.get(`/trading/rate?from=${from}&to=${to}&amount=${amount}`)
  },
  
  createTrade: (data) => {
    console.log('📤 API: Creating trade...')
    return api.post('/trading/create', data)
  },
  
  getTradeHistory: (params = {}) => {
    console.log('📤 API: Fetching trade history...')
    return api.get('/trading/history', { params })
  },
  
  getTrade: (tradeId) => {
    console.log('📤 API: Fetching trade:', tradeId)
    return api.get(`/trading/${tradeId}`)
  },
}

export const kycAPI = {
  submitKYC: (data) => {
    console.log('📤 API: Submitting KYC...')
    return api.post('/kyc/submit', data)
  },
  
  getKYCStatus: () => {
    console.log('📤 API: Fetching KYC status...')
    return api.get('/kyc/status')
  },
  
  uploadDocument: (formData) => {
    console.log('📤 API: Uploading KYC document...')
    return api.post('/kyc/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
}

export const investmentAPI = {
  getPlans: () => {
    console.log('📤 API: Fetching investment plans...')
    return api.get('/admin/settings/staking-plans/public')
  },
  
  createInvestment: (data) => {
    console.log('📤 API: Creating investment...')
    return api.post('/investments/create', data)
  },
  
  getInvestments: () => {
    console.log('📤 API: Fetching user investments...')
    return api.get('/investments')
  },
  
  getInvestment: (investmentId) => {
    console.log('📤 API: Fetching investment:', investmentId)
    return api.get(`/investments/${investmentId}`)
  },
  
  withdrawInvestment: (investmentId, data) => {
    console.log('📤 API: Withdrawing investment:', investmentId)
    return api.post(`/investments/${investmentId}/withdraw`, data)
  },

  // ✅ ДОБАВЬ ЭТОТ НОВЫЙ МЕТОД!
  getTelegramPartialWithdrawal: (withdrawalId) => {
    console.log('📤 API: Fetching Telegram partial withdrawal:', withdrawalId)
    return api.get(`/telegram/partial-withdrawal/${withdrawalId}`)
  },
}


export const walletAPI = {
  getBalance: () => {
    console.log('📤 API: Fetching wallet balance...')
    return api.get('/wallet/balance')
  },
  
  getTransactions: (params = {}) => {
    console.log('📤 API: Fetching wallet transactions...')
    return api.get('/wallet/transactions', { params })
  },
  
  createWithdrawal: (data) => {
    console.log('📤 API: Creating withdrawal...')
    return api.post('/wallet/withdraw', data)
  },
  
  createDeposit: (data) => {
    console.log('📤 API: Creating deposit...')
    return api.post('/wallet/deposit', data)
  },
}

export const referralAPI = {
  getStats: () => {
    console.log('📤 API: Fetching referral stats...')
    return api.get('/auth/referral-stats')
  },
  
  getReferrals: () => {
    console.log('📤 API: Fetching referrals...')
    return api.get('/referrals')
  },
  
  getEarnings: () => {
    console.log('📤 API: Fetching referral earnings...')
    return api.get('/referrals/earnings')
  },
}

// ✅ Utility функция для проверки наличия токена
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false
  const token = localStorage.getItem('access_token')
  return !!token
}

// ✅ Utility функция для получения текущего токена
export const getAccessToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

// ✅ Utility функция для установки токена
export const setAccessToken = (token) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('access_token', token)
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// ✅ Utility функция для очистки токенов
export const clearTokens = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  delete api.defaults.headers.common['Authorization']
}

export default api