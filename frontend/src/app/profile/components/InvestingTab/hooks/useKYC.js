import { useState, useEffect } from 'react'
import { kycAPI } from '../utils/api'

export const useKYC = (user) => {
  const [userKYCStatus, setUserKYCStatus] = useState('NOT_SUBMITTED')
  const [kycChecked, setKycChecked] = useState(false)

  const checkKYCStatus = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setKycChecked(true)
        return
      }

      const status = await kycAPI.checkStatus()
      setUserKYCStatus(status)
    } catch (error) {
      console.error('Ошибка проверки KYC статуса:', error)
    } finally {
      setKycChecked(true)
    }
  }

  useEffect(() => {
    if (user) {
      checkKYCStatus()
    }
  }, [user])

  return {
    userKYCStatus,
    kycChecked,
    refreshKYCStatus: checkKYCStatus
  }
}