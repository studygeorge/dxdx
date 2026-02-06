export const getSpinnerKeyframes = () => `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

export const getInputResetStyles = () => `
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type="number"] {
    -moz-appearance: textfield;
    appearance: textfield;
  }
`

export const containerStyle = (isMobile) => ({
  textAlign: 'center',
  padding: isMobile ? '32px 20px' : '48px',
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: isMobile ? '14px' : '15px'
})

export const headerStyle = (isMobile) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: isMobile ? '20px' : '28px',
  flexWrap: 'wrap',
  gap: '16px'
})

export const titleStyle = (isMobile) => ({
  fontSize: isMobile ? '20px' : '26px',
  fontWeight: '600',
  color: '#ffffff',
  letterSpacing: '-0.8px',
  margin: 0
})

export const alertStyle = (type, isMobile) => {
  const baseStyle = {
    borderRadius: isMobile ? '16px' : '20px',
    padding: isMobile ? '12px 16px' : '16px 20px',
    marginBottom: isMobile ? '20px' : '28px',
    fontSize: isMobile ? '13px' : '14px',
    letterSpacing: '-0.3px'
  }

  if (type === 'success') {
    return {
      ...baseStyle,
      background: 'rgba(45, 212, 191, 0.15)',
      border: '1px solid rgba(45, 212, 191, 0.3)',
      color: '#2dd4bf'
    }
  }

  return {
    ...baseStyle,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: 'rgba(255, 255, 255, 0.7)'
  }
}

export const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.85)',
  backdropFilter: 'blur(20px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '20px'
}

export const modalContentStyle = (isMobile) => ({
  background: 'rgba(0, 0, 0, 0.95)',
  backdropFilter: 'blur(30px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '32px',
  padding: isMobile ? '28px 20px' : '36px 32px',
  maxWidth: '500px',
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto',
  position: 'relative'
})