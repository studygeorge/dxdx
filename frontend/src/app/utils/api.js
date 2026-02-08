import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://dxcapital-ai.com/api/v1' 
    : 'http://localhost:4000/api/v1',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Flag to prevent multiple simultaneous refresh requests
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

// Silent logout function
const performSilentLogout = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('wallet_address')
  localStorage.removeItem('user_id')
  localStorage.removeItem('user_email')
  
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      window.location.href = '/'
    }, 100)
  }
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle timeout
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return Promise.reject({
        ...error,
        message: 'Request timeout. Please check your internet connection.',
        isTimeout: true
      })
    }

    // Handle network errors
    if (error.message === 'Network Error' || !error.response) {
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your internet connection.',
        isNetworkError: true
      })
    }

    // Handle 401 errors
    if (error.response?.status === 401) {
      // If token expired and not yet retried
      if ((error.response?.data?.code === 'TOKEN_EXPIRED' || 
           error.response?.data?.error?.includes('expired') ||
           error.response?.data?.error?.includes('Token expired')) &&
          !originalRequest._retry) {
        
        // If refresh is already in progress, queue the request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          }).then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token
            return api(originalRequest)
          }).catch(err => {
            performSilentLogout()
            return Promise.reject(err)
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const refreshToken = localStorage.getItem('refresh_token')
          
          if (!refreshToken) {
            throw new Error('No refresh token')
          }
          
          // Try to refresh token
          const response = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refresh_token: refreshToken },
            { timeout: 30000 }
          )
          
          const { access_token, refresh_token: newRefreshToken } = response.data
          
          if (!access_token) {
            throw new Error('No access token in response')
          }
          
          // Save new tokens
          localStorage.setItem('access_token', access_token)
          if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken)
          }
          
          // Update authorization headers
          api.defaults.headers.common['Authorization'] = 'Bearer ' + access_token
          originalRequest.headers['Authorization'] = 'Bearer ' + access_token
          
          // Process queued requests
          processQueue(null, access_token)
          
          // Retry original request
          return api(originalRequest)
          
        } catch (refreshError) {
          // If refresh failed - silent logout
          processQueue(refreshError, null)
          performSilentLogout()
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      // For all other 401 errors - silent logout
      performSilentLogout()
    }

    // Handle server errors (5xx)
    if (error.response?.status >= 500) {
      return Promise.reject({
        ...error,
        message: 'Server error. Please try again later.',
        isServerError: true
      })
    }

    return Promise.reject(error)
  }
)

// API Endpoints
export const authAPI = {
  register: (data, config = {}) => api.post('/auth/register', data, config),
  login: (data, config = {}) => api.post('/auth/login', data, config),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
  getProfile: (config = {}) => api.get('/auth/me', config),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
}

export const web3AuthAPI = {
  requestNonce: (walletAddress) => api.post('/web3auth/request-nonce', { wallet_address: walletAddress }),
  verify: (data) => api.post('/web3auth/verify', data),
  connect: (walletAddress) => api.post('/web3auth/connect', { wallet_address: walletAddress }),
}

export const tradingAPI = {
  getExchangeRate: (from, to, amount) => api.get(`/trading/rate?from=${from}&to=${to}&amount=${amount}`),
  createTrade: (data) => api.post('/trading/create', data),
  getTradeHistory: (params = {}) => api.get('/trading/history', { params }),
  getTrade: (tradeId) => api.get(`/trading/${tradeId}`),
}

export const kycAPI = {
  submitKYC: (data) => api.post('/kyc/submit', data),
  getKYCStatus: () => api.get('/kyc/status'),
  uploadDocument: (formData) => api.post('/kyc/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

export const investmentAPI = {
  getPlans: () => api.get('/admin/settings/staking-plans/public'),
  createInvestment: (data) => api.post('/investments/create', data),
  getInvestments: () => api.get('/investments/my'),
  getInvestment: (investmentId) => api.get(`/investments/${investmentId}`),
  withdrawInvestment: (investmentId, data) => api.post(`/investments/${investmentId}/withdraw`, data),
  partialWithdraw: (investmentId, data) => api.post(`/investments/${investmentId}/partial-withdraw`, data),
  earlyWithdraw: (investmentId, data) => api.post(`/investments/${investmentId}/early-withdraw`, data),
  reinvest: (investmentId) => api.post(`/investments/${investmentId}/reinvest`),
  upgrade: (investmentId, data) => api.post(`/investments/${investmentId}/upgrade`, data),
  getTelegramPartialWithdrawal: (withdrawalId) => api.get(`/telegram/partial-withdrawal/${withdrawalId}`),
}

export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  getTransactions: (params = {}) => api.get('/wallet/transactions', { params }),
  createWithdrawal: (data) => api.post('/wallet/withdraw', data),
  createDeposit: (data) => api.post('/wallet/deposit', data),
}

export const referralAPI = {
  getStats: () => api.get('/auth/referral-stats'),
  getReferrals: () => api.get('/referrals'),
  getEarnings: () => api.get('/referrals/earnings'),
}

// Utility functions
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false
  const token = localStorage.getItem('access_token')
  return !!token
}

export const getAccessToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

export const setAccessToken = (token) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('access_token', token)
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export const clearTokens = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  delete api.defaults.headers.common['Authorization']
}

export default api
