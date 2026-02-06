'use client'

export default function InvestmentPlansGrid({ 
  investmentPlans, 
  onPlanSelect, 
  t, 
  isMobile 
}) {
  if (!investmentPlans || investmentPlans.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: isMobile ? '32px 20px' : '48px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: isMobile ? '20px' : '24px',
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: isMobile ? '13px' : '14px',
        marginBottom: isMobile ? '32px' : '40px'
      }}>
        {t.noPlans}
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: isMobile ? '12px' : '16px',
      marginBottom: isMobile ? '32px' : '40px'
    }}>
      {investmentPlans.map((plan) => (
        <div
          key={plan.id}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: isMobile ? '24px' : '32px',
            padding: isMobile ? '18px 20px' : '22px 24px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.4)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{
            position: 'absolute',
            top: '-40%',
            right: '-30%',
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(45, 212, 191, 0.1) 0%, transparent 70%)',
            filter: 'blur(30px)',
            pointerEvents: 'none',
            zIndex: 0
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '12px',
              letterSpacing: '-0.5px'
            }}>
              {plan.name}
            </h3>

            <div style={{
              fontSize: isMobile ? '28px' : '32px',
              fontWeight: '600',
              color: '#2dd4bf',
              marginBottom: '16px',
              letterSpacing: '-1.5px'
            }}>
              {plan.roi}%
            </div>

            <div style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              marginBottom: '16px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: isMobile ? '11px' : '12px',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                <span>{t.minimumAmount}:</span>
                <span style={{ color: '#2dd4bf', fontWeight: '500' }}>
                  ${plan.minAmount?.toLocaleString()}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: isMobile ? '11px' : '12px',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                <span>{t.maximumAmount}:</span>
                <span style={{ color: '#2dd4bf', fontWeight: '500' }}>
                  ${plan.maxAmount?.toLocaleString()}
                </span>
              </div>

              <div style={{
                fontSize: isMobile ? '10px' : '11px',
                color: 'rgba(255, 255, 255, 0.5)',
                fontStyle: 'italic',
                marginTop: '4px'
              }}>
                {t.chooseDuration}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onPlanSelect(plan)
              }}
              style={{
                width: '100%',
                padding: isMobile ? '10px 16px' : '12px 20px',
                background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                border: 'none',
                borderRadius: '14px',
                color: '#000000',
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                letterSpacing: '-0.3px',
                boxShadow: '0 4px 12px rgba(45, 212, 191, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)'
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(45, 212, 191, 0.5)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 212, 191, 0.3)'
              }}
            >
              {t.selectButton}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
