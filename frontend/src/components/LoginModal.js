'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../app/hooks/useAuth'

export default function LoginModal({ onClose, onSwitchToRegister }) {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Captcha state
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: 0 })
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaError, setCaptchaError] = useState(false)

  // Generate new captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    setCaptcha({ num1, num2, answer: num1 + num2 })
    setCaptchaInput('')
    setCaptchaError(false)
  }

  useEffect(() => {
    generateCaptcha()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setCaptchaError(false)

    // Validate captcha
    if (parseInt(captchaInput) !== captcha.answer) {
      setCaptchaError(true)
      setError('Incorrect captcha answer')
      setLoading(false)
      generateCaptcha()
      return
    }

    const result = await login(formData.email, formData.password)
    
    if (result.success) {
      onClose()
      router.push('/profile')
    } else {
      // ✅ Фильтруем сообщение "Too many requests"
      const errorMessage = result.error || 'Login failed'
      if (!errorMessage.toLowerCase().includes('too many requests')) {
        setError(errorMessage)
      } else {
        setError('Please try again in a moment')
      }
      generateCaptcha()
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }} onClick={onClose}>
      
      <div style={{
        background: `
          linear-gradient(135deg, 
            rgba(255, 255, 255, 0.15) 0%,
            rgba(255, 255, 255, 0.05) 25%,
            rgba(255, 255, 255, 0.02) 50%,
            rgba(255, 255, 255, 0.05) 75%,
            rgba(255, 255, 255, 0.10) 100%
          )
        `,
        backdropFilter: 'blur(30px)',
        borderRadius: '24px',
        padding: '40px',
        maxWidth: '420px',
        width: '100%',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        position: 'relative'
      }} onClick={(e) => e.stopPropagation()}>
        
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '24px',
            cursor: 'pointer',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>

        <h2 style={{
          color: 'white',
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '8px',
          textAlign: 'center'
        }}>
          Welcome Back
        </h2>
        
        <p style={{
          color: 'rgba(255, 255, 255, 0.7)',
          textAlign: 'center',
          marginBottom: '32px',
          fontSize: '16px'
        }}>
          Sign in to your DXCAPITAL account
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px',
              display: 'block'
            }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2dd4bf'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px',
              display: 'block'
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2dd4bf'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
            />
          </div>

          {/* Captcha Section */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px',
              display: 'block'
            }}>
              Security Check
            </label>
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <div style={{
                flex: 1,
                background: 'rgba(45, 212, 191, 0.1)',
                border: captchaError ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(45, 212, 191, 0.3)',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: '600',
                color: '#2dd4bf',
                userSelect: 'none'
              }}>
                {captcha.num1} + {captcha.num2} = ?
              </div>
              <input
                type="number"
                value={captchaInput}
                onChange={(e) => {
                  setCaptchaInput(e.target.value)
                  setCaptchaError(false)
                }}
                required
                placeholder="Answer"
                style={{
                  width: '100px',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: captchaError ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  // ✅ Убираем стрелочки в input type="number"
                  MozAppearance: 'textfield',
                  WebkitAppearance: 'none',
                  appearance: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = captchaError ? 'rgba(239, 68, 68, 0.5)' : '#2dd4bf'}
                onBlur={(e) => e.target.style.borderColor = captchaError ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.2)'}
              />
              <button
                type="button"
                onClick={generateCaptcha}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '14px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.15)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                title="Refresh captcha"
              >
                ↻
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px',
              color: '#fca5a5',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? 'rgba(45, 212, 191, 0.5)' : 'linear-gradient(135deg, #2dd4bf, #14b8a6)',
              color: 'white',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              marginBottom: '24px'
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '14px'
        }}>
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            style={{
              color: '#2dd4bf',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px'
            }}
          >
            Sign up
          </button>
        </div>

        {/* ✅ Добавляем глобальный CSS для удаления стрелочек из всех number input */}
        <style jsx>{`
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
            appearance: textfield;
          }
        `}</style>
      </div>
    </div>
  )
}