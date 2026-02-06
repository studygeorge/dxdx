'use client'
import { useState, useEffect } from 'react'
import { web3AuthAPI } from '../app/utils/api'
import { useAuth } from '../app/hooks/useAuth'

export default function Web3Connect({ onClose }) {
  const { login } = useAuth()
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed')
      return
    }

    try {
      setLoading(true)
      setError('')

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      
      if (accounts.length === 0) {
        setError('No accounts found')
        return
      }

      const walletAddress = accounts[0]
      setAccount(walletAddress)

      // Get nonce from backend
      const nonceResponse = await web3AuthAPI.requestNonce(walletAddress)
      const { nonce } = nonceResponse.data

      // Create message to sign
      const message = `Welcome to DXCAPITAL!\n\nPlease sign this message to authenticate.\n\nNonce: ${nonce}`

      // Request signature
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress]
      })

      // Verify signature with backend
      const verifyResponse = await web3AuthAPI.verify({
        wallet_address: walletAddress,
        signature,
        message
      })

      if (verifyResponse.data.success) {
        // Store tokens
        const { access_token, refresh_token } = verifyResponse.data
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)
        
        // Update auth context
        window.location.reload()
        onClose()
      }

    } catch (err) {
      console.error('Web3 connection error:', err)
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setLoading(false)
    }
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
        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))`,
        backdropFilter: 'blur(30px)',
        borderRadius: '24px',
        padding: '40px',
        maxWidth: '420px',
        width: '100%',
        border: '1px solid rgba(255, 255, 255, 0.12)',
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
            cursor: 'pointer'
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
          Connect Wallet
        </h2>
        
        <p style={{
          color: 'rgba(255, 255, 255, 0.7)',
          textAlign: 'center',
          marginBottom: '32px',
          fontSize: '16px'
        }}>
          Connect your Web3 wallet to continue
        </p>

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
          onClick={connectWallet}
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? 'rgba(45, 212, 191, 0.5)' : 'linear-gradient(135deg, #f97316, #ea580c)',
            color: 'white',
            border: 'none',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}
        >
          {loading ? (
            'Connecting...'
          ) : (
            <>
              <span style={{ fontSize: '20px' }}>🦊</span>
              Connect MetaMask
            </>
          )}
        </button>

        {account && (
          <div style={{
            background: 'rgba(45, 212, 191, 0.2)',
            border: '1px solid rgba(45, 212, 191, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            color: '#2dd4bf',
            fontSize: '14px',
            wordBreak: 'break-all'
          }}>
            Connected: {account}
          </div>
        )}
      </div>
    </div>
  )
}