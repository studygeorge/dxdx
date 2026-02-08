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

export default api
