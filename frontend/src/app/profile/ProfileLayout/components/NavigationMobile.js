'use client'

export default function NavigationMobile({ 
  tabs, 
  activeTab, 
  onTabChange, 
  isKYCApproved,
  onShowKYCModal,
  isAnyModalOpen
}) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: '12px',
      left: '12px',
      right: '12px',
      height: '56px',
      background: 'rgba(45, 212, 191, 0.15)',
      backdropFilter: 'blur(30px)',
      border: '1px solid rgba(45, 212, 191, 0.25)',
      borderRadius: '20px',
      display: isAnyModalOpen ? 'none' : 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 1000,
      padding: '0 6px'
    }}>
      {tabs.map((tab) => {
        const isUpgrade = tab.alwaysGlowing
        const isActive = activeTab === tab.id
        const isDisabled = tab.requiresKYC && !isKYCApproved
        
        return (
          <button
            key={tab.id}
            onClick={() => {
              if (isDisabled) {
                onShowKYCModal()
              } else {
                onTabChange(tab.id)
              }
            }}
            style={{
              flex: '1 1 0',
              minWidth: '0',
              height: '44px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              background: isActive || isUpgrade
                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)'
                : 'transparent',
              border: 'none',
              borderRadius: '14px',
              color: isDisabled 
                ? 'rgba(255, 255, 255, 0.3)' 
                : (isActive || isUpgrade ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'),
              fontSize: '9px',
              fontWeight: '600',
              letterSpacing: '-0.3px',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              animation: isUpgrade ? 'white-glow 2s ease-in-out infinite' : (isActive ? 'glow-pulse-bright 2s ease-in-out infinite' : 'none'),
              padding: '3px',
              opacity: isDisabled ? 0.5 : 1
            }}
          >
            {(isActive || isUpgrade) && !isDisabled && (
              <>
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '32px',
                  height: '2px',
                  background: isUpgrade 
                    ? 'linear-gradient(90deg, transparent, #ffffff, transparent)' 
                    : 'linear-gradient(90deg, transparent, #2dd4bf, transparent)',
                  borderRadius: '0 0 4px 4px',
                  boxShadow: isUpgrade 
                    ? '0 0 15px rgba(255, 255, 255, 0.9)' 
                    : '0 0 15px rgba(45, 212, 191, 0.9)'
                }} />
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      top: `${15 + i * 18}%`,
                      left: `${8 + i * 25}%`,
                      width: '2px',
                      height: '2px',
                      background: isUpgrade ? '#ffffff' : '#2dd4bf',
                      borderRadius: '50%',
                      boxShadow: isUpgrade 
                        ? '0 0 8px #ffffff' 
                        : '0 0 8px #2dd4bf',
                      animation: `sparkle 1.5s ease-in-out ${i * 0.3}s infinite`
                    }}
                  />
                ))}
              </>
            )}
            <div style={{
              textAlign: 'center',
              lineHeight: '1.2',
              wordBreak: 'break-word',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              maxHeight: '2.4em',
              padding: '0 2px'
            }}>
              {tab.label}
            </div>
          </button>
        )
      })}
    </nav>
  )
}
