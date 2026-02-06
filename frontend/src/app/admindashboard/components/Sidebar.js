'use client'

export default function Sidebar({ 
  isMobile, 
  isOpen, 
  activeSection, 
  onSectionChange, 
  onClose,
  hasSettingsAccess = true,
  hasReportingAccess = true
}) {
  const baseMenuItems = [
    { id: 'dashboard', label: 'Dashboard'},
    { id: 'users', label: 'Users'},
  ]

  // Добавляем Testing и Reporting только если есть доступ к Reporting
  if (hasReportingAccess) {
    baseMenuItems.push({ id: 'testing', label: 'Testing' })
    baseMenuItems.push({ id: 'reporting', label: 'Reporting' })
  }

  // Добавляем Settings только если есть доступ
  const menuItems = hasSettingsAccess 
    ? [...baseMenuItems, { id: 'settings', label: 'Settings' }]
    : baseMenuItems

  return (
    <div style={{
      width: isOpen ? (isMobile ? '100%' : '280px') : '0',
      position: isMobile ? 'fixed' : 'relative',
      height: '100vh',
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'width 0.3s ease',
      overflow: 'hidden',
      zIndex: 1000
    }}>
      <div style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#2dd4bf',
            letterSpacing: '-1px',
            margin: 0
          }}>
            DXCAPITAL
          </h2>

          {isMobile && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '28px',
                cursor: 'pointer',
                padding: '4px 8px',
                lineHeight: '1',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
              }}
            >
              ×
            </button>
          )}
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSectionChange(item.id)
                if (isMobile) onClose()
              }}
              style={{
                padding: '14px 16px',
                background: activeSection === item.id 
                  ? 'rgba(45, 212, 191, 0.15)' 
                  : 'transparent',
                border: activeSection === item.id 
                  ? '1px solid rgba(45, 212, 191, 0.3)' 
                  : '1px solid transparent',
                borderRadius: '12px',
                color: activeSection === item.id 
                  ? '#2dd4bf' 
                  : 'rgba(255, 255, 255, 0.8)',
                fontSize: '15px',
                fontWeight: activeSection === item.id ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
              onMouseOver={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.95)'
                }
              }}
              onMouseOut={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'transparent'
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
                }
              }}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '24px',
          right: '24px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.4)',
            textAlign: 'center'
          }}>
            Admin Panel v1.0
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <div style={{
              marginTop: '8px',
              fontSize: '10px',
              color: (hasSettingsAccess && hasReportingAccess) ? '#22c55e' : '#ef4444',
              textAlign: 'center',
              padding: '4px 8px',
              background: (hasSettingsAccess && hasReportingAccess)
                ? 'rgba(34, 197, 94, 0.1)' 
                : 'rgba(239, 68, 68, 0.1)',
              borderRadius: '6px'
            }}>
              {(hasSettingsAccess && hasReportingAccess) 
                ? 'Full Access' 
                : `Limited: ${!hasReportingAccess ? 'No Testing/Reporting' : ''} ${!hasSettingsAccess ? 'No Settings' : ''}`.trim()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}