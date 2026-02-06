import { useState, useEffect } from 'react'
import { web3AuthAPI } from '../utils/web3Auth'

export const useWallet = (t, user, refreshUserData) => {
  const [walletAddress, setWalletAddress] = useState('')
  const [showWeb3Modal, setShowWeb3Modal] = useState(false)
  const [connectingWallet, setConnectingWallet] = useState(false)
  const [walletError, setWalletError] = useState('')

  const checkWalletConnection = async () => {
    const savedWalletAddress = localStorage.getItem('wallet_address')
    console.log('💼 Checking wallet connection...')
    
    if (savedWalletAddress) {
      console.log('✅ Wallet address found in localStorage')
      setWalletAddress(savedWalletAddress)
      return
    }
  
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts && accounts.length > 0) {
          const address = accounts[0]
          setWalletAddress(address)
          localStorage.setItem('wallet_address', address)
          console.log('✅ Wallet connected from MetaMask')
        } else {
          console.log('ℹ️ No wallet connected')
        }
      } catch (error) {
        console.error('❌ Failed to check wallet:', error)
      }
    }
  }

  const connectWallet = async () => {
    console.log('🦊 Starting wallet connection...')
    
    if (typeof window === 'undefined' || !window.ethereum) {
      setWalletError(t.installMetaMask)
      console.error('❌ MetaMask not installed')
      return
    }
  
    try {
      setConnectingWallet(true)
      setWalletError('')
  
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      
      if (!accounts || accounts.length === 0) {
        throw new Error(t.noAccounts)
      }
  
      const address = accounts[0]
      console.log('✅ Account received')
  
      const nonceResponse = await web3AuthAPI.requestNonce(address)
      
      if (!nonceResponse.data || !nonceResponse.data.success) {
        throw new Error(nonceResponse.data?.error || 'Failed to get nonce')
      }
      
      const nonceData = nonceResponse.data.data || nonceResponse.data
      const nonce = nonceData.nonce
      const message = nonceData.message
      
      if (!nonce || !message) {
        throw new Error('Invalid nonce response from server')
      }
  
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address]
      })
  
      const verifyResponse = await web3AuthAPI.verify({
        walletAddress: address,
        signature,
        nonce
      })
  
      if (verifyResponse.data && verifyResponse.data.success) {
        const accessToken = verifyResponse.data.access_token || verifyResponse.data.data?.accessToken
        const refreshToken = verifyResponse.data.refresh_token || verifyResponse.data.data?.refreshToken
        
        if (!accessToken || !refreshToken) {
          throw new Error('Invalid token response from server')
        }
  
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)
        localStorage.setItem('wallet_address', address)
        
        setWalletAddress(address)
        setShowWeb3Modal(false)
        
        await refreshUserData()
        
        console.log('✅ Wallet connection successful!')
      } else {
        throw new Error(verifyResponse.data?.error || 'Signature verification failed')
      }
  
    } catch (err) {
      console.error('❌ Web3 connection error:', err)
      
      if (err.code === 4001) {
        setWalletError(t.signatureRejected)
      } else if (err.message) {
        setWalletError(err.message)
      } else {
        setWalletError(t.connectionFailed)
      }
      
      setWalletAddress('')
      localStorage.removeItem('wallet_address')
    } finally {
      setConnectingWallet(false)
    }
  }

  const disconnectWallet = async () => {
    console.log('🔌 Disconnecting wallet...')
    
    try {
      setWalletAddress('')
      setWalletError('')
      
      localStorage.removeItem('wallet_address')
      
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          await window.ethereum.request({
            method: 'wallet_revokePermissions',
            params: [{ eth_accounts: {} }]
          })
          console.log('✅ MetaMask permissions revoked')
        } catch (err) {
          console.log('ℹ️ Could not revoke MetaMask permissions (not supported)')
        }
      }
      
      console.log('✅ Wallet disconnected')
      alert(t.walletDisconnected)
      
    } catch (error) {
      console.error('❌ Error during disconnect:', error)
    }
  }

  useEffect(() => {
    if (user) {
      checkWalletConnection()
    }
  }, [user])

  useEffect(() => {
    if (user?.walletAddress && !walletAddress) {
      setWalletAddress(user.walletAddress)
      console.log('✅ Wallet address synced from user:', user.walletAddress)
    }
  }, [user])

  return {
    walletAddress,
    showWeb3Modal,
    setShowWeb3Modal,
    connectingWallet,
    walletError,
    connectWallet,
    disconnectWallet
  }
}
