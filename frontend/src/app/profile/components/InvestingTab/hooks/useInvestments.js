import { useState, useEffect } from 'react'
import { investmentAPI } from '../utils/api'

export const useInvestments = (user) => {
  const [userInvestments, setUserInvestments] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchInvestments = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const investments = await investmentAPI.fetchUserInvestments()
      setUserInvestments(investments)
    } catch (error) {
      console.error('Failed to fetch investments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvestments()
  }, [user])

  return {
    userInvestments,
    loading,
    refreshInvestments: fetchInvestments
  }
}
