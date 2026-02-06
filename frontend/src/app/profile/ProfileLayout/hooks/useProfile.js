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
    console.log('🔑 Token check:', token ? 'Found' : 'Not found')
    
    if (!token) {
      console.log('❌ No token, redirecting to home')
      router.push('/')
      return
    }

    try {
      console.log('📥 Fetching user data AND KYC status...')
      
      const [userResponse, kycResponse] = await Promise.allSettled([
        authAPI.getProfile(),
        api.get('/kyc/status')
      ])

      console.log('📊 User response status:', userResponse.status)
      console.log('📊 KYC response status:', kycResponse.status)

      if (userResponse.status === 'fulfilled' && userResponse.value.data) {
        const userData = userResponse.value.data.data || userResponse.value.data.user
        setUser(userData)
        console.log('✅ User data loaded:', userData?.email)
      } else {
        console.error('❌ User response failed:', userResponse)
      }

      if (kycResponse.status === 'fulfilled' && kycResponse.value.data) {
        const result = kycResponse.value.data
        const status = result.data?.kycStatus || result.kycStatus || 'NOT_SUBMITTED'
        setKycStatus(status)
        console.log('✅ KYC status loaded:', status)
      } else {
        console.log('⚠️ KYC status check failed, setting default')
        setKycStatus('NOT_SUBMITTED')
      }
      
    } catch (error) {
      console.error('❌ Failed to fetch user data:', error)
      
      if (error.response?.status === 401) {
        console.log('🔄 401 error, redirecting to home')
        router.push('/')
      }
    } finally {
      console.log('✅ Setting loading to false')
      setLoading(false)
    }
  }

  const fetchInvestmentPlans = async () => {
    setPlansLoading(true)
    console.log('📊 Fetching investment plans...')
    
    try {
      const response = await api.get('/admin/settings/staking-plans/public')
      console.log('✅ Plans response received')
  
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
        console.log('✅ Plans loaded:', formattedPlans.length)
      } else {
        setInvestmentPlans([])
        console.log('⚠️ No plans data')
      }
    } catch (error) {
      console.error('❌ Failed to fetch plans:', error)
      setInvestmentPlans([])
    } finally {
      setPlansLoading(false)
    }
  }

  const handleKYCSubmitted = (newStatus) => {
    console.log('✅ KYC submitted, new status:', newStatus)
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
