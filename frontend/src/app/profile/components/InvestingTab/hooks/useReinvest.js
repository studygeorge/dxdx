import { useState } from 'react'
import { API_BASE_URL } from '../constants'

export const useReinvest = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const reinvestProfit = async (investmentId, amount) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/v1/investments/${investmentId}/reinvest`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({ amount: parseFloat(amount) })
        }
      )


      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Server error:', errorData)
        throw new Error(errorData.error || 'Failed to reinvest profit')
      }

      const result = await response.json()

      setSuccess('Profit reinvested successfully!')
      return result
    } catch (err) {
      console.error('❌ Reinvest error:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getReinvestHistory = async (investmentId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/investments/${investmentId}/reinvest/history`,
        {
          headers: getAuthHeaders(),
          credentials: 'include'
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch reinvest history')
      }

      const result = await response.json()
      return result.data || []
    } catch (err) {
      console.error('❌ Get reinvest history error:', err)
      return []
    }
  }

  return {
    reinvestProfit,
    getReinvestHistory,
    loading,
    error,
    success,
    setError,
    setSuccess
  }
}
