'use client'
import { useState } from 'react'

export default function PaymentStep({ 
  adminWalletAddress,
  investAmount,
  selectedPlan,
  selectedDuration,
  onConfirm,
  onCancel,
  loading,
  error,
  success,
  t,
  isMobile
}) {
  const [addressCopied, setAddressCopied] = useState(false)

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(adminWalletAddress)
      setAddressCopied(true)
      setTimeout(() => setAddressCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy address:', err)
    }
  }

  return (
    <div>
      <h2 style={{
        fontSize: isMobile ? '20px' : '24px',
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: '8px',
        letterSpacing: '-0.8px'
      }}>
        {t.transferInstructions}
      </h2>

      <div style={{
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: isMobile ? '12px' : '13px',
        marginBottom: '24px',
        letterSpacing: '-0.3px'
      }}>
        {selectedPlan.name}
      </div>

      {/* Amount Display */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: isMobile ? '16px' : '20px',
        marginBottom: '20px'
      }}>
        <div style={{
          fontSize: isMobile ? '11px' : '12px',
          color: 'rgba(255, 255, 255, 0.6)',
          marginBottom: '4px',
          letterSpacing: '-0.3px'
        }}>
          {t.amountToTransfer}
        </div>
        <div style={{
          fontSize: isMobile ? '24px' : '28px',
          fontWeight: '600',
          color: '#2dd4bf',
          marginBottom: '16px',
          letterSpacing: '-1px'
        }}>
          ${parseFloat(investAmount).toLocaleString()}
        </div>

        <div style={{
          fontSize: isMobile ? '11px' : '12px',
          color: 'rgba(255, 255, 255, 0.6)',
          marginBottom: '8px',
          letterSpacing: '-0.3px'
        }}>
          {t.adminWalletLabel}
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <div style={{
            flex: 1,
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: isMobile ? '10px 12px' : '12px 14px',
            color: '#ffffff',
            fontSize: isMobile ? '11px' : '12px',
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            letterSpacing: '-0.3px'
          }}>
            {adminWalletAddress}
          </div>

          <button
            onClick={handleCopyAddress}
            style={{
              padding: isMobile ? '10px 14px' : '12px 16px',
              background: addressCopied 
                ? 'rgba(45, 212, 191, 0.25)' 
                : 'rgba(45, 212, 191, 0.15)',
              border: '1px solid rgba(45, 212, 191, 0.3)',
              borderRadius: '12px',
              color: '#2dd4bf',
              fontSize: isMobile ? '11px' : '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              letterSpacing: '-0.3px',
              whiteSpace: 'nowrap'
            }}
          >
            {addressCopied ? t.addressCopied : t.copyAddress}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: isMobile ? '14px 16px' : '16px 20px',
        marginBottom: '20px'
      }}>
        <div style={{
          fontSize: isMobile ? '12px' : '13px',
          color: 'rgba(255, 255, 255, 0.7)',
          lineHeight: '1.6',
          letterSpacing: '-0.3px'
        }}>
          <div style={{ marginBottom: '8px' }}>1. {t.transferStep1}</div>
          <div style={{ marginBottom: '8px' }}>2. {t.transferStep2}</div>
          <div>3. {t.transferStep3}</div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: isMobile ? '8px 12px' : '10px 14px',
          marginBottom: '16px',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: isMobile ? '11px' : '12px',
          letterSpacing: '-0.3px'
        }}>
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div style={{
          background: 'rgba(45, 212, 191, 0.15)',
          border: '1px solid rgba(45, 212, 191, 0.3)',
          borderRadius: '12px',
          padding: isMobile ? '8px 12px' : '10px 14px',
          marginBottom: '16px',
          color: '#2dd4bf',
          fontSize: isMobile ? '11px' : '12px',
          letterSpacing: '-0.3px'
        }}>
          {success}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={onConfirm}
          disabled={loading}
          style={{
            flex: 1,
            minWidth: '120px',
            padding: isMobile ? '12px' : '14px',
            background: loading
              ? 'rgba(45, 212, 191, 0.3)' 
              : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
            border: 'none',
            borderRadius: '16px',
            color: loading ? 'rgba(0, 0, 0, 0.5)' : '#000000',
            fontSize: isMobile ? '13px' : '14px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            letterSpacing: '-0.3px'
          }}
        >
          {loading ? t.loading : t.confirmTransfer}
        </button>

        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: isMobile ? '12px 20px' : '14px 24px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: isMobile ? '13px' : '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s',
            letterSpacing: '-0.3px'
          }}
        >
          {t.cancel}
        </button>
      </div>
    </div>
  )
}
