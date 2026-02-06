import { ethers } from 'ethers'

export class ValidationService {
  static validateTRC20Address(address: string): boolean {
    const trc20Regex = /^T[A-Za-z1-9]{33}$/
    return trc20Regex.test(address.trim())
  }

  static validateEthereumAddress(address: string): boolean {
    return address.startsWith('0x') && address.length === 42 && ethers.isAddress(address)
  }

  static validateWalletAddress(address: string, paymentMethod?: string): { 
    isValid: boolean
    isTron: boolean
    isEthereum: boolean
    error?: string 
  } {
    if (paymentMethod === 'telegram') {
      return { isValid: true, isTron: true, isEthereum: false }
    }

    const isTron = address.startsWith('T') && address.length === 34
    const isEthereum = address.startsWith('0x') && address.length === 42

    if (!isTron && !isEthereum) {
      return { 
        isValid: false, 
        isTron: false, 
        isEthereum: false,
        error: 'Invalid wallet address. Must be Ethereum (0x...) or TRON (T...) address' 
      }
    }

    if (isEthereum && !this.validateEthereumAddress(address)) {
      return { 
        isValid: false, 
        isTron: false, 
        isEthereum: true,
        error: 'Invalid Ethereum wallet address' 
      }
    }

    return { isValid: true, isTron, isEthereum }
  }

  static validateDuration(duration: number): boolean {
    return [3, 6, 12].includes(duration)
  }
}

