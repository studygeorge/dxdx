'use client'

export default function LanguageToggle({ language, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '4px',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        width: '80px',
        height: '32px'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.3)'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
      }}
    >
      <div style={{
        position: 'absolute',
        top: '4px',
        left: language === 'en' ? '4px' : 'calc(50%)',
        width: 'calc(50% - 4px)',
        height: 'calc(100% - 8px)',
        background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
        borderRadius: '16px',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 0
      }} />
      
      <div style={{
        flex: 1,
        textAlign: 'center',
        fontSize: '12px',
        fontWeight: '600',
        color: language === 'en' ? '#000000' : 'rgba(255, 255, 255, 0.6)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 1,
        letterSpacing: '-0.3px',
        lineHeight: '32px'
      }}>
        EN
      </div>
      
      <div style={{
        flex: 1,
        textAlign: 'center',
        fontSize: '12px',
        fontWeight: '600',
        color: language === 'ru' ? '#000000' : 'rgba(255, 255, 255, 0.6)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 1,
        letterSpacing: '-0.3px',
        lineHeight: '32px'
      }}>
        RU
      </div>
    </div>
  )
}
