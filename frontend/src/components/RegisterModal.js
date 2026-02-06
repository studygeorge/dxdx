'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../app/hooks/useAuth'
import OfferModal from './OfferModal'

export default function RegisterModal({ onClose, onSwitchToLogin }) {
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  
  const [telegramData, setTelegramData] = useState(null)
  const [telegramError, setTelegramError] = useState('')
  
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: 0 })
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaError, setCaptchaError] = useState(false)

  const [acceptedOffer, setAcceptedOffer] = useState(false)
  const [showOfferModal, setShowOfferModal] = useState(false)

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    setCaptcha({ num1, num2, answer: num1 + num2 })
    setCaptchaInput('')
    setCaptchaError(false)
  }

  useEffect(() => {
    generateCaptcha()
    
    const originalOverflow = document.body.style.overflow
    const originalPosition = document.body.style.position
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    
    const storedReferralCode = localStorage.getItem('referralCode')
    const urlParams = new URLSearchParams(window.location.search)
    const urlReferralCode = urlParams.get('ref')
    const finalReferralCode = storedReferralCode || urlReferralCode || ''
    
    if (finalReferralCode) {
      setReferralCode(finalReferralCode)
      if (urlReferralCode && !storedReferralCode) {
        localStorage.setItem('referralCode', urlReferralCode)
      }
    }

    window.onTelegramAuth = (user) => {
      console.log('✅ Telegram auth successful:', user)
      setTelegramData(user)
      setTelegramError('')
    }

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', 'dxcapital_bot')
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.setAttribute('data-request-access', 'write')

    const container = document.getElementById('telegram-login-container')
    if (container) {
      container.innerHTML = ''
      container.appendChild(script)
    }

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.position = originalPosition
      document.body.style.width = ''
      
      delete window.onTelegramAuth
      
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setCaptchaError(false)
    setTelegramError('')

    if (!telegramData) {
      setTelegramError('Please connect your Telegram account')
      setError('Telegram connection is required')
      setLoading(false)
      return
    }

    if (!formData.phoneNumber || formData.phoneNumber.trim() === '') {
      setError('Phone number is required')
      setLoading(false)
      return
    }

    if (parseInt(captchaInput) !== captcha.answer) {
      setCaptchaError(true)
      setError('Incorrect captcha answer')
      setLoading(false)
      generateCaptcha()
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      generateCaptcha()
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    if (!acceptedOffer) {
      setError('Необходимо принять условия Публичной оферты')
      setLoading(false)
      return
    }

    const fullName = `${formData.firstName} ${formData.lastName}`.trim()

    if (!fullName) {
      setError('Please enter your first and last name')
      setLoading(false)
      return
    }

    const registrationData = {
      name: fullName,
      email: formData.email,
      phoneNumber: formData.phoneNumber.trim(),
      password: formData.password,
      referralCode: referralCode || undefined,
      telegramId: String(telegramData.id),
      telegramUsername: telegramData.username || '',
      telegramFirstName: telegramData.first_name || '',
      telegramLastName: telegramData.last_name || '',
      telegramPhotoUrl: telegramData.photo_url || '',
      telegramAuthDate: new Date(telegramData.auth_date * 1000).toISOString()
    }

    try {
      const result = await register(registrationData)
      
      if (result.success) {
        setSuccess(true)
        localStorage.removeItem('referralCode')
        
        setTimeout(() => {
          onSwitchToLogin()
        }, 2000)
      } else {
        setError(result.error || 'Registration failed')
        generateCaptcha()
      }
    } catch (err) {
      console.error('❌ Registration error:', err)
      setError(err.message || 'Registration failed. Please try again.')
      generateCaptcha()
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    if (!telegramData) return
    
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (success) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}>
        <div style={{
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))`,
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '380px',
          width: '100%',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '32px'
          }}>
            ✓
          </div>
          <h2 style={{ color: 'white', marginBottom: '16px', fontSize: '24px' }}>Account Created!</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
            Redirecting to login...
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <OfferModal isOpen={showOfferModal} onClose={() => setShowOfferModal(false)} />

      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px',
          overflow: 'hidden'
        }} 
        onClick={onClose}
      >
        
        <div 
          style={{
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.10) 100%)`,
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            borderRadius: '20px',
            padding: '24px 20px',
            width: '100%',
            maxWidth: '380px',
            maxHeight: '95vh',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            position: 'relative',
            overflowY: 'auto',
            overflowX: 'hidden'
          }} 
          onClick={(e) => e.stopPropagation()}
        >
          
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)'
              e.target.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)'
              e.target.style.transform = 'scale(1)'
            }}
          >
            ×
          </button>

          <h2 style={{
            color: 'white',
            fontSize: '22px',
            fontWeight: 'bold',
            marginBottom: '4px',
            textAlign: 'center',
            marginTop: '8px'
          }}>
            Create Account
          </h2>
          
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center',
            marginBottom: referralCode ? '12px' : '16px',
            fontSize: '13px'
          }}>
            Join DXCAPITAL today
          </p>

          {referralCode && (
            <div style={{
              background: 'rgba(45, 212, 191, 0.1)',
              border: '1px solid rgba(45, 212, 191, 0.3)',
              borderRadius: '10px',
              padding: '8px 10px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{ fontSize: '16px' }}>🎁</div>
              <div style={{ flex: 1 }}>
                <div style={{
                  color: '#2dd4bf',
                  fontSize: '9px',
                  fontWeight: '600',
                  marginBottom: '2px',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}>
                  Referral Code Applied
                </div>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }}>
                  {referralCode}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '12px',
                fontWeight: '500',
                marginBottom: '6px',
                display: 'block'
              }}>
                Telegram Account <span style={{ color: '#ef4444' }}>*</span>
              </label>
              
              {!telegramData ? (
                <div style={{
                  background: telegramError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(45, 212, 191, 0.1)',
                  border: telegramError ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(45, 212, 191, 0.3)',
                  borderRadius: '10px',
                  padding: '10px',
                  textAlign: 'center'
                }}>
                  <p style={{
                    color: telegramError ? '#fca5a5' : 'rgba(255, 255, 255, 0.7)',
                    fontSize: '11px',
                    marginBottom: '8px'
                  }}>
                    Connect your Telegram account
                  </p>
                  
                  <div 
                    id="telegram-login-container"
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: '40px'
                    }}
                  />

                  {telegramError && (
                    <p style={{
                      color: '#fca5a5',
                      fontSize: '10px',
                      marginTop: '6px'
                    }}>
                      {telegramError}
                    </p>
                  )}
                </div>
              ) : (
                <div style={{
                  background: 'rgba(45, 212, 191, 0.1)',
                  border: '1px solid rgba(45, 212, 191, 0.3)',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    color: 'white'
                  }}>
                    ✓
                  </div>
                  <div style={{
                    color: '#2dd4bf',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    Telegram Connected
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
              <div style={{ flex: 1 }}>
                <label style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '12px',
                  fontWeight: '500',
                  marginBottom: '6px',
                  display: 'block'
                }}>
                  First Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!telegramData}
                  required
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    background: !telegramData ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: !telegramData ? 'rgba(255, 255, 255, 0.4)' : 'white',
                    fontSize: '13px',
                    outline: 'none',
                    cursor: !telegramData ? 'not-allowed' : 'text',
                    opacity: !telegramData ? 0.5 : 1
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '12px',
                  fontWeight: '500',
                  marginBottom: '6px',
                  display: 'block'
                }}>
                  Last Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!telegramData}
                  required
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    background: !telegramData ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: !telegramData ? 'rgba(255, 255, 255, 0.4)' : 'white',
                    fontSize: '13px',
                    outline: 'none',
                    cursor: !telegramData ? 'not-allowed' : 'text',
                    opacity: !telegramData ? 0.5 : 1
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '12px',
                fontWeight: '500',
                marginBottom: '6px',
                display: 'block'
              }}>
                Email <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!telegramData}
                required
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  background: !telegramData ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: !telegramData ? 'rgba(255, 255, 255, 0.4)' : 'white',
                  fontSize: '13px',
                  outline: 'none',
                  cursor: !telegramData ? 'not-allowed' : 'text',
                  opacity: !telegramData ? 0.5 : 1
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '12px',
                fontWeight: '500',
                marginBottom: '6px',
                display: 'block'
              }}>
                Phone Number <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={!telegramData}
                required
                placeholder={!telegramData ? '' : '+1234567890'}
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  background: !telegramData ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: !telegramData ? 'rgba(255, 255, 255, 0.4)' : 'white',
                  fontSize: '13px',
                  outline: 'none',
                  cursor: !telegramData ? 'not-allowed' : 'text',
                  opacity: !telegramData ? 0.5 : 1
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '12px',
                fontWeight: '500',
                marginBottom: '6px',
                display: 'block'
              }}>
                Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={!telegramData}
                required
                minLength={8}
                placeholder={!telegramData ? '' : 'Min 8 characters'}
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  background: !telegramData ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: !telegramData ? 'rgba(255, 255, 255, 0.4)' : 'white',
                  fontSize: '13px',
                  outline: 'none',
                  cursor: !telegramData ? 'not-allowed' : 'text',
                  opacity: !telegramData ? 0.5 : 1
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '12px',
                fontWeight: '500',
                marginBottom: '6px',
                display: 'block'
              }}>
                Confirm Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={!telegramData}
                required
                placeholder={!telegramData ? '' : 'Re-enter password'}
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  background: !telegramData ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: !telegramData ? 'rgba(255, 255, 255, 0.4)' : 'white',
                  fontSize: '13px',
                  outline: 'none',
                  cursor: !telegramData ? 'not-allowed' : 'text',
                  opacity: !telegramData ? 0.5 : 1
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '12px',
                fontWeight: '500',
                marginBottom: '6px',
                display: 'block'
              }}>
                Security Check <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}>
                <div style={{
                  flex: 1,
                  background: !telegramData ? 'rgba(255, 255, 255, 0.05)' : 'rgba(45, 212, 191, 0.1)',
                  border: captchaError ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(45, 212, 191, 0.3)',
                  borderRadius: '8px',
                  padding: '9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: !telegramData ? 'rgba(45, 212, 191, 0.4)' : '#2dd4bf',
                  userSelect: 'none',
                  opacity: !telegramData ? 0.5 : 1
                }}>
                  {captcha.num1} + {captcha.num2} = ?
                </div>
                <input
                  type="number"
                  value={captchaInput}
                  onChange={(e) => {
                    if (!telegramData) return
                    setCaptchaInput(e.target.value)
                    setCaptchaError(false)
                  }}
                  disabled={!telegramData}
                  required
                  placeholder=""
                  style={{
                    width: '65px',
                    padding: '9px',
                    background: !telegramData ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                    border: captchaError ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: !telegramData ? 'rgba(255, 255, 255, 0.4)' : 'white',
                    fontSize: '13px',
                    outline: 'none',
                    textAlign: 'center',
                    cursor: !telegramData ? 'not-allowed' : 'text',
                    opacity: !telegramData ? 0.5 : 1
                  }}
                />
                <button
                  type="button"
                  onClick={generateCaptcha}
                  disabled={!telegramData}
                  style={{
                    background: !telegramData ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '9px',
                    color: !telegramData ? 'rgba(255, 255, 255, 0.4)' : 'white',
                    cursor: !telegramData ? 'not-allowed' : 'pointer',
                    fontSize: '15px',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: !telegramData ? 0.5 : 1
                  }}
                  title="Refresh"
                >
                  ↻
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                cursor: !telegramData ? 'not-allowed' : 'pointer',
                opacity: !telegramData ? 0.5 : 1,
                padding: '10px',
                background: acceptedOffer ? 'rgba(45, 212, 191, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                borderRadius: '10px',
                border: acceptedOffer ? '1px solid rgba(45, 212, 191, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s'
              }}>
                <input
                  type="checkbox"
                  checked={acceptedOffer}
                  onChange={(e) => {
                    if (!telegramData) return
                    setAcceptedOffer(e.target.checked)
                    setError('')
                  }}
                  disabled={!telegramData}
                  style={{
                    marginTop: '2px',
                    cursor: !telegramData ? 'not-allowed' : 'pointer',
                    width: '18px',
                    height: '18px',
                    accentColor: '#2dd4bf',
                    flexShrink: 0
                  }}
                />
                <span style={{
                  color: 'rgba(255, 255, 255, 0.88)',
                  fontSize: '12px',
                  lineHeight: '1.6'
                }}>
                  Я подтверждаю, что ознакомился(-ась) и принимаю условия{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      if (!telegramData) return
                      setShowOfferModal(true)
                    }}
                    disabled={!telegramData}
                    style={{
                      color: '#2dd4bf',
                      background: 'none',
                      border: 'none',
                      cursor: !telegramData ? 'not-allowed' : 'pointer',
                      textDecoration: 'underline',
                      fontSize: '12px',
                      padding: 0,
                      fontWeight: '600'
                    }}
                    onMouseEnter={(e) => {
                      if (telegramData) e.target.style.color = '#14b8a6'
                    }}
                    onMouseLeave={(e) => {
                      if (telegramData) e.target.style.color = '#2dd4bf'
                    }}
                  >
                    Публичной оферты DXCapital
                  </button>
                  {' '}<span style={{ color: '#ef4444', fontWeight: 'bold' }}>*</span>
                </span>
              </label>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '10px',
                padding: '10px 12px',
                marginBottom: '14px',
                color: '#fca5a5',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !telegramData || !acceptedOffer}
              style={{
                width: '100%',
                background: (loading || !telegramData || !acceptedOffer) 
                  ? 'rgba(45, 212, 191, 0.4)' 
                  : 'linear-gradient(135deg, #2dd4bf, #14b8a6)',
                color: 'white',
                border: 'none',
                padding: '13px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: (loading || !telegramData || !acceptedOffer) ? 'not-allowed' : 'pointer',
                marginBottom: '16px',
                transition: 'all 0.3s',
                opacity: (loading || !telegramData || !acceptedOffer) ? 0.6 : 1,
                boxShadow: (!loading && telegramData && acceptedOffer) ? '0 4px 12px rgba(45, 212, 191, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!loading && telegramData && acceptedOffer) {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 6px 16px rgba(45, 212, 191, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && telegramData && acceptedOffer) {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 12px rgba(45, 212, 191, 0.3)'
                }
              }}
            >
              {loading 
                ? 'Creating Account...' 
                : !telegramData 
                  ? 'Connect Telegram First' 
                  : !acceptedOffer
                    ? 'Accept Terms to Continue'
                    : 'Create Account'}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '12px'
          }}>
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              style={{
                color: '#2dd4bf',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '12px',
                fontWeight: '600'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#14b8a6'
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#2dd4bf'
              }}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
