import { API_BASE_URL } from '../constants'

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

export const investmentAPI = {
  async fetchUserInvestments() {
    const response = await fetch(`${API_BASE_URL}/api/v1/investments/my`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to fetch investments')
    const data = await response.json()
    return (data.data || []).filter(
      inv => inv.status === 'ACTIVE' || inv.status === 'COMPLETED'
    )
  },

  async createInvestment(payload) {
    console.log('📤 API: Creating investment:', payload)
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
  },

  async partialWithdraw(investmentId, payload) {
    console.log('📤 API: Partial withdraw:', { investmentId, payload })
    const response = await fetch(
      `${API_BASE_URL}/api/v1/investments/${investmentId}/partial-withdraw`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload)
      }
    )
    
    console.log('📡 Response status:', response.status)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Server error:', errorData)
      throw new Error(errorData.error || 'Failed to submit withdrawal')
    }
    
    const result = await response.json()
    console.log('✅ Server response:', result)
    return result
  },

  async withdraw(investmentId, trc20Address) {
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
  },

  async upgrade(investmentId, upgradeData) {
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
  },

  async earlyWithdraw(investmentId, trc20Address) {
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
  }
}

export const kycAPI = {
  async checkStatus() {
    const response = await fetch(`${API_BASE_URL}/api/v1/kyc/status`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to check KYC status')
    const data = await response.json()
    return data.data?.kycStatus || 'NOT_SUBMITTED'
  }
}
