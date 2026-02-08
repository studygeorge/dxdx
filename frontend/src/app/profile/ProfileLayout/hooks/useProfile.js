import { useState, useEffect } from 'react'
import { authAPI } from '../../../utils/api'  // ✅ ИСПРАВЛЕНО
import api from '../../../utils/api'   

export const useProfile = (router) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [kycStatus, setKycStatus] = useState(null)
  const [investmentPlans, setInvestmentPlans] = useState([])
  const [plansLoading, setPlansLoading] = useState(true)

  const fetchUserData = async () => {
    const token = localStorage.getItem('access_token')
    
    if (!token) {
      router.push('/')
      return
    }

    try {
      
      const [userResponse, kycResponse] = await Promise.allSettled([
        authAPI.getProfile(),
        api.get('/kyc/status')
      ])


      if (userResponse.status === 'fulfilled' && userResponse.value.data) {
        const userData = userResponse.value.data.data || userResponse.value.data.user
        setUser(userData)
      } else {
        console.error('❌ User response failed:', userResponse)
      }

      if (kycResponse.status === 'fulfilled' && kycResponse.value.data) {
        const result = kycResponse.value.data
        const status = result.data?.kycStatus || result.kycStatus || 'NOT_SUBMITTED'
        setKycStatus(status)
      } else {
        setKycStatus('NOT_SUBMITTED')
      }
      
    } catch (error) {
      console.error('❌ Failed to fetch user data:', error)
      
      if (error.response?.status === 401) {
        router.push('/')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchInvestmentPlans = async () => {
    setPlansLoading(true)
    
    try {
      const response = await api.get('/admin/settings/staking-plans/public')
  
      if (response.data) {
        const data = response.data
        const plans = data.data?.stakingPlans || data.stakingPlans || data.data || []
        const formattedPlans = plans.map(plan => ({
          id: plan.id,
          name: plan.name,
          minAmount: Number(plan.minAmount),
          maxAmount: Number(plan.maxAmount),
          duration: plan.duration,
          roi: Number(plan.apy),
          currency: plan.currency || 'USDT',
          description: plan.description
        }))
        setInvestmentPlans(formattedPlans)
      } else {
        setInvestmentPlans([])
      }
    } catch (error) {
      console.error('❌ Failed to fetch plans:', error)
      setInvestmentPlans([])
    } finally {
      setPlansLoading(false)
    }
  }

  const handleKYCSubmitted = (newStatus) => {
    setKycStatus(newStatus)
  }

  useEffect(() => {
    fetchUserData()
    fetchInvestmentPlans()
  }, [])

  return {
    user,
    loading,
    kycStatus,
    setKycStatus,
    investmentPlans,
    plansLoading,
    handleKYCSubmitted,
    refreshUserData: fetchUserData
  }
}
