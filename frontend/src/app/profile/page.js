'use client'
import { useState, useEffect } from 'react'
import ProfileLayout from './ProfileLayout'

export default function ProfilePage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  return <ProfileLayout isMobile={isMobile} />
}
