import { API_BASE_URL } from '../constants'

export const web3AuthAPI = {
  requestNonce: async (walletAddress) => {
    try {
      console.log('📤 Requesting nonce for:', walletAddress)
      const response = await fetch(`${API_BASE_URL}/api/v1/web3auth/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ walletAddress: walletAddress })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ Nonce response:', data)
      return { data }
    } catch (error) {
      console.error('❌ Request nonce error:', error)
      throw error
    }
  },
  
  verify: async (payload) => {
    try {
      console.log('📤 Verifying signature...')
      const response = await fetch(`${API_BASE_URL}/api/v1/web3auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ Verify response:', data)
      return { data }
    } catch (error) {
      console.error('❌ Verify error:', error)
      throw error
    }
  }
}
