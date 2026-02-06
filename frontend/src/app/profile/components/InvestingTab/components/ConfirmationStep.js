'use client'

export default function ConfirmationStep({ 
  selectedPlan,
  investAmount,
  selectedDuration,
  returns,
  onClose,
  t,
  isMobile
}) {
  return (
    <div>
      <div style={{
        textAlign: 'center',
        marginBottom: '24px'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          margin: '0 auto 16px',
          background: 'rgba(45, 212, 191, 0.15)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            border: '3px solid #2dd4bf',
            borderTop: '3px solid transparent',
            borderRadius: '50%'
          }} className="spinner"></div>
        </div>
        
        <h2 style={{
          fontSize: isMobile ? '22px' : '26px',
          fontWeight: '600',
          color: '#ffffff',
          marginBottom: '8px',
          letterSpacing: '-0.8px'
        }}>
          {t.pendingConfirmation}
        </h2>
        
        <p style={{
          margin: '0',
          fontSize: isMobile ? '13px' : '14px',
          color: 'rgba(255, 255, 255, 0.7)',
          letterSpacing: '-0.3px',
          whiteSpace: 'pre-line'
        }}>
          {t.supportWillReview}
        </p>
      </div>

      {returns && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.12) 0%, rgba(20, 184, 166, 0.08) 100%)',
          border: '1px solid rgba(45, 212, 191, 0.25)',
          borderRadius: '20px',
          padding: isMobile ? '20px' : '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: isMobile ? '14px' : '15px',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '16px',
            letterSpacing: '-0.4px'
          }}>
            {t.investmentDetails}
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: isMobile ? '12px' : '13px',
                color: 'rgba(255, 255, 255, 0.6)',
                letterSpacing: '-0.3px'
              }}>
                {t.investedAmount}:
              </span>
              <span style={{
                fontSize: isMobile ? '15px' : '16px',
                fontWeight: '600',
                color: '#ffffff',
                letterSpacing: '-0.3px'
              }}>
                ${parseFloat(investAmount).toLocaleString()}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: isMobile ? '12px' : '13px',
                color: 'rgba(255, 255, 255, 0.6)',
                letterSpacing: '-0.3px'
              }}>
                {t.plan}:
              </span>
              <span style={{
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.9)',
                letterSpacing: '-0.3px'
              }}>
                {selectedPlan.name}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: isMobile ? '12px' : '13px',
                color: 'rgba(255, 255, 255, 0.6)',
                letterSpacing: '-0.3px'
              }}>
                {t.duration}:
              </span>
              <span style={{
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.9)',
                letterSpacing: '-0.3px'
              }}>
                {selectedDuration} {t.months}
              </span>
            </div>

            <div style={{
              height: '1px',
              background: 'rgba(255, 255, 255, 0.1)',
              margin: '4px 0'
            }} />

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: isMobile ? '12px' : '13px',
                color: 'rgba(255, 255, 255, 0.6)',
                letterSpacing: '-0.3px'
              }}>
                {t.baseRate}:
              </span>
              <span style={{
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.8)',
                letterSpacing: '-0.3px'
              }}>
                {returns.baseRate}%
              </span>
            </div>

            {returns.rateBonus > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: isMobile ? '12px' : '13px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  letterSpacing: '-0.3px'
                }}>
                  {t.rateBonus}:
                </span>
                <span style={{
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '600',
                  color: '#2dd4bf',
                  letterSpacing: '-0.3px'
                }}>
                  +{returns.rateBonus}%
                </span>
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: isMobile ? '12px' : '13px',
                color: 'rgba(255, 255, 255, 0.6)',
                letterSpacing: '-0.3px'
              }}>
                {t.effectiveRate}:
              </span>
              <span style={{
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '600',
                color: '#2dd4bf',
                letterSpacing: '-0.3px'
              }}>
                {returns.effectiveRate}%
              </span>
            </div>

            {returns.hasCashBonus && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: isMobile ? '12px' : '13px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  letterSpacing: '-0.3px'
                }}>
                  {t.cashBonus}:
                </span>
                <span style={{
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '600',
                  color: '#2dd4bf',
                  letterSpacing: '-0.3px'
                }}>
                  ${returns.cashBonus}
                </span>
              </div>
            )}

            <div style={{
              height: '1px',
              background: 'rgba(255, 255, 255, 0.1)',
              margin: '4px 0'
            }} />

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: isMobile ? '12px' : '13px',
                color: 'rgba(255, 255, 255, 0.6)',
                letterSpacing: '-0.3px'
              }}>
                {t.expectedReturn}:
              </span>
              <span style={{
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.9)',
                letterSpacing: '-0.3px'
              }}>
                ${returns.interestReturn}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0 4px 0'
            }}>
              <span style={{
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '600',
                color: '#ffffff',
                letterSpacing: '-0.3px'
              }}>
                {t.totalReturn}:
              </span>
              <span style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                color: '#2dd4bf',
                letterSpacing: '-0.5px'
              }}>
                ${returns.totalReturn}
              </span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onClose}
        style={{
          width: '100%',
          padding: isMobile ? '14px' : '16px',
          background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
          border: 'none',
          borderRadius: '16px',
          color: '#000000',
          fontSize: isMobile ? '14px' : '15px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s',
          letterSpacing: '-0.3px'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)'
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(45, 212, 191, 0.4)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {t.close}
      </button>
    </div>
  )
}
