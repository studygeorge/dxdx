import { API_BASE_URL } from '../constants'

// ✅ Validate token before making requests
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token')
  
  // Validate token
  if (!token || token === 'undefined' || token === 'null') {
    throw new Error('Invalid token')
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

export const investmentAPI = {
  async fetchUserInvestments() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/investments/my`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to fetch investments')
      const data = await response.json()
      return (data.data || []).filter(
        inv => inv.status === 'ACTIVE' || inv.status === 'COMPLETED'
      )
    } catch (error) {
      if (error.message === 'Invalid token') {
        // Redirect to login on invalid token
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
      }
      throw error
    }
  },

  async createInvestment(payload) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/investments/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create investment')
      }
      return response.json()
    } catch (error) {
      if (error.message === 'Invalid token') {
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
      }
      throw error
    }
  },

  async partialWithdraw(investmentId, payload) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/investments/${investmentId}/partial-withdraw`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(payload)
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit withdrawal')
      }
      
      return response.json()
    } catch (error) {
      if (error.message === 'Invalid token') {
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
      }
      throw error
    }
  },

  async withdraw(investmentId, trc20Address) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/investments/${investmentId}/withdraw`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({ trc20Address: trc20Address.trim() })
        }
      )
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit withdrawal')
      }
      return response.json()
    } catch (error) {
      if (error.message === 'Invalid token') {
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
      }
      throw error
    }
  },

  async upgrade(investmentId, upgradeData) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/investments/${investmentId}/upgrade`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(upgradeData)
        }
      )
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit upgrade')
      }
      return response.json()
    } catch (error) {
      if (error.message === 'Invalid token') {
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
      }
      throw error
    }
  },

  async earlyWithdraw(investmentId, trc20Address) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/investments/${investmentId}/early-withdraw`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({ trc20Address: trc20Address.trim() })
        }
      )
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit early withdrawal')
      }
      return response.json()
    } catch (error) {
      if (error.message === 'Invalid token') {
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
      }
      throw error
    }
  }
}

export const kycAPI = {
  async checkStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/kyc/status`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to check KYC status')
      const data = await response.json()
      return data.data?.kycStatus || 'NOT_SUBMITTED'
    } catch (error) {
      if (error.message === 'Invalid token') {
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
      }
      throw error
    }
  }
}
