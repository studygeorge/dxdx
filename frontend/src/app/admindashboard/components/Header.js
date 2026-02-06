'use client'

export default function Header({ isMobile, activeSection, adminData, onToggleSidebar, onLogout }) {
  const getSectionTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      users: 'Users Management',
      trades: 'Trades',
      wallets: 'Wallets',
      settings: 'Settings'
    }
    return titles[activeSection] || 'Dashboard'
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: isMobile ? '16px 20px' : '20px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            padding: '8px 12px',
            background: 'rgba(45, 212, 191, 0.1)',
            border: '1px solid rgba(45, 212, 191, 0.3)',
            borderRadius: '8px',
            color: '#2dd4bf',
            fontSize: '20px',
            cursor: 'pointer',
            lineHeight: 1
          }}
        >
          ☰
        </button>

        <h1 style={{
          fontSize: isMobile ? '20px' : '28px',
          fontWeight: '600',
          color: 'white',
          letterSpacing: '-1px'
        }}>
          {getSectionTitle()}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {adminData?.photoUrl && (
          <img 
            src={adminData.photoUrl} 
            alt="Avatar" 
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '2px solid #2dd4bf'
            }}
          />
        )}
        
        <button
          onClick={onLogout}
          style={{
            padding: '10px 20px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#ef4444',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}
