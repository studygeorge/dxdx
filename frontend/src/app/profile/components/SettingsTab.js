export default function SettingsTab({ isMobile, language, user }) {
    const translations = {
      en: {
        accountSettings: 'Account settings',
        comingSoon: 'coming soon'
      },
      ru: {
        accountSettings: 'Настройки аккаунта',
        comingSoon: 'скоро будет доступно'
      }
    }
  
    const t = translations[language]
  
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '40px',
        padding: isMobile ? '48px 24px' : '80px 48px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: isMobile ? '42px' : '56px',
          fontWeight: '300',
          color: 'rgba(255, 255, 255, 0.1)',
          marginBottom: '16px',
          letterSpacing: '-2px'
        }}>
          05
        </div>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.5)', 
          fontSize: '15px',
          letterSpacing: '-0.3px'
        }}>
          {t.accountSettings} {t.comingSoon}
        </p>
      </div>
    )
  }