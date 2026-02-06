import { ethers, verifyMessage, isAddress, getAddress, JsonRpcProvider, formatEther } from 'ethers'

export class Web3Utils {
  // Генерация nonce для подписи
  static generateNonce(): string {
    return Math.floor(Math.random() * 1000000).toString()
  }

  // ✅ ИСПРАВЛЕНО: Простое создание сообщения БЕЗ библиотеки siwe
  static createSiweMessage(domain: string, address: string, nonce: string): string {
    try {
      console.log('📝 Creating SIWE message with:')
      console.log('  - domain:', domain)
      console.log('  - address:', address)
      console.log('  - nonce:', nonce)

      // ✅ ВАЛИДАЦИЯ ВСЕХ ПАРАМЕТРОВ
      if (!domain || typeof domain !== 'string' || domain.trim().length === 0) {
        throw new Error('Invalid domain: must be a non-empty string')
      }

      if (!address || typeof address !== 'string' || !this.isValidAddress(address)) {
        throw new Error('Invalid address: must be a valid Ethereum address')
      }

      if (!nonce || typeof nonce !== 'string' || nonce.trim().length === 0) {
        throw new Error('Invalid nonce: must be a non-empty string')
      }

      const cleanDomain = domain.trim()
      const cleanAddress = address.trim()
      const cleanNonce = nonce.trim()

      const now = new Date()
      const expirationTime = new Date(now.getTime() + 10 * 60 * 1000) // 10 минут

      // ✅ СОЗДАЕМ СООБЩЕНИЕ ВРУЧНУЮ (EIP-4361 формат)
      const message = `${cleanDomain} wants you to sign in with your Ethereum account:
${cleanAddress}

Sign in to DXCAPAI

URI: https://${cleanDomain}
Version: 1
Chain ID: 1
Nonce: ${cleanNonce}
Issued At: ${now.toISOString()}
Expiration Time: ${expirationTime.toISOString()}`

      console.log('✅ SIWE message created successfully')
      console.log('  - Message preview:', message.substring(0, 100) + '...')
      
      return message
    } catch (error: any) {
      console.error('❌ Failed to create SIWE message:', error.message)
      console.error('   Stack:', error.stack)
      throw new Error(`SIWE message creation failed: ${error.message}`)
    }
  }

  // Проверка подписи
  static async verifySignature(
    message: string, 
    signature: string, 
    expectedAddress: string
  ): Promise<boolean> {
    try {
      if (!message || !signature || !expectedAddress) {
        console.error('❌ Missing parameters for signature verification')
        return false
      }

      if (typeof message !== 'string' || typeof signature !== 'string' || typeof expectedAddress !== 'string') {
        console.error('❌ Invalid parameter types for signature verification')
        return false
      }

      const recoveredAddress = verifyMessage(message, signature)
      const isValid = recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()
      
      if (!isValid) {
        console.error('❌ Signature verification failed:')
        console.error('   Expected:', expectedAddress.toLowerCase())
        console.error('   Recovered:', recoveredAddress.toLowerCase())
      } else {
        console.log('✅ Signature verified successfully')
      }

      return isValid
    } catch (error: any) {
      console.error('❌ Signature verification error:', error.message)
      return false
    }
  }

  // Проверка валидности адреса
  static isValidAddress(address: string): boolean {
    try {
      if (!address || typeof address !== 'string') {
        return false
      }

      const trimmed = address.trim()
      
      if (trimmed.length === 0) {
        return false
      }

      // Проверка базового формата
      if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
        return false
      }

      // Проверка через ethers
      return isAddress(trimmed)
    } catch (error: any) {
      console.error('❌ Address validation exception:', error.message)
      return false
    }
  }

  // Нормализация адреса
  static normalizeAddress(address: string): string {
    try {
      if (!address || typeof address !== 'string') {
        throw new Error('Invalid address: must be a non-empty string')
      }
      
      const trimmed = address.trim().toLowerCase()
      
      if (trimmed.length === 0) {
        throw new Error('Invalid address: empty after trim')
      }

      if (!this.isValidAddress(trimmed)) {
        throw new Error('Invalid Ethereum address format')
      }
      
      // Возвращаем checksummed адрес
      const checksummed = getAddress(trimmed)
      return checksummed
    } catch (error: any) {
      console.error('❌ Address normalization failed:', error.message)
      throw new Error(`Address normalization failed: ${error.message}`)
    }
  }

  // Получение ENS имени
  static async resolveENS(address: string): Promise<string | null> {
    try {
      if (!address || !this.isValidAddress(address)) {
        return null
      }

      const rpcUrl = process.env.ETHEREUM_RPC_URL || 'https://cloudflare-eth.com'
      const provider = new JsonRpcProvider(rpcUrl)
      
      const ensName = await provider.lookupAddress(address)
      
      if (ensName) {
        console.log('✅ ENS resolved:', ensName, 'for', address)
      }

      return ensName
    } catch (error: any) {
      console.error('❌ ENS resolution error:', error.message)
      return null
    }
  }

  // Проверка баланса кошелька
  static async getWalletBalance(address: string): Promise<string> {
    try {
      if (!address || !this.isValidAddress(address)) {
        return '0'
      }

      const rpcUrl = process.env.ETHEREUM_RPC_URL || 'https://cloudflare-eth.com'
      const provider = new JsonRpcProvider(rpcUrl)
      
      const balance = await provider.getBalance(address)
      const formattedBalance = formatEther(balance)
      
      console.log('✅ Balance retrieved:', formattedBalance, 'ETH for', address)

      return formattedBalance
    } catch (error: any) {
      console.error('❌ Balance retrieval error:', error.message)
      return '0'
    }
  }
}