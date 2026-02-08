import { useState, useEffect, useCallback } from 'react'
import { investmentAPI } from '../../components/InvestingTab/utils/api'

/**
 * Global investments hook - single source of truth for all investment data
 * Prevents duplicate API calls across tabs
 */
export const useInvestmentsGlobal = (user) => {
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastFetch, setLastFetch] = useState(null)
  
  // Cache duration: 30 seconds
  const CACHE_DURATION = 30000
  
  const fetchInvestments = useCallback(async (force = false) => {
    if (!user) {
      setInvestments([])
      return
    }
    
    // Check cache
    const now = Date.now()
    if (!force && lastFetch && (now - lastFetch) < CACHE_DURATION) {
      // Return cached data
      return investments
    }
    
    try {
      setLoading(true)
      const data = await investmentAPI.fetchUserInvestments()
      setInvestments(data || [])
      setLastFetch(now)
      return data
    } catch (error) {
      console.error('Failed to fetch investments:', error)
      return []
    } finally {
      setLoading(false)
    }
  }, [user, lastFetch, investments])
  
  // Initial fetch
  useEffect(() => {
    fetchInvestments()
  }, [user?.id]) // Only refetch when user ID changes
  
  const refreshInvestments = useCallback(() => {
    return fetchInvestments(true) // Force refresh
  }, [fetchInvestments])
  
  return {
    investments,
    loading,
    refreshInvestments,
    // Computed values
    activeInvestments: investments.filter(inv => inv.status === 'ACTIVE'),
    completedInvestments: investments.filter(inv => inv.status === 'COMPLETED' || inv.isCompleted),
    totalInvestments: investments.length
  }
}
