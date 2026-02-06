'use client'
import { useTranslation } from '../app/hooks/useTranslation'

export default function Footer({ isMobile, isTablet }) {
  const { t } = useTranslation()

  return (
    <footer style={{
      position: 'relative',
      zIndex: 10,
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: isMobile ? '40px 20px 30px' : '60px 24px 40px',
      marginTop: '100px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: isMobile ? '24px' : '32px',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '20px'
        }}>
          DX<span style={{ color: '#2dd4bf' }}>CAPITAL</span>
        </div>
        <p style={{
          fontSize: isMobile ? '14px' : '16px',
          color: 'rgba(255,255,255,0.7)',
          marginBottom: '40px',
          maxWidth: '600px',
          margin: '0 auto 40px'
        }}>
          {t('footerDescription')}
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: isMobile ? '20px' : '40px',
          marginBottom: '40px',
          flexWrap: 'wrap'
        }}>
          <a href="#about" style={{ 
            color: 'rgba(255,255,255,0.7)', 
            textDecoration: 'none', 
            fontSize: isMobile ? '14px' : '16px',
            transition: 'color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.color = '#2dd4bf'}
          onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
          >{t('aboutUs')}</a>
          <a href="#terms" style={{ 
            color: 'rgba(255,255,255,0.7)', 
            textDecoration: 'none', 
            fontSize: isMobile ? '14px' : '16px',
            transition: 'color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.color = '#2dd4bf'}
          onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
          >{t('termsOfService')}</a>
          <a href="#privacy" style={{ 
            color: 'rgba(255,255,255,0.7)', 
            textDecoration: 'none', 
            fontSize: isMobile ? '14px' : '16px',
            transition: 'color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.color = '#2dd4bf'}
          onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
          >{t('privacyPolicy')}</a>
          <a href="#support" style={{ 
            color: 'rgba(255,255,255,0.7)', 
            textDecoration: 'none', 
            fontSize: isMobile ? '14px' : '16px',
            transition: 'color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.color = '#2dd4bf'}
          onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
          >{t('support')}</a>
          <a href="#api" style={{ 
            color: 'rgba(255,255,255,0.7)', 
            textDecoration: 'none', 
            fontSize: isMobile ? '14px' : '16px',
            transition: 'color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.color = '#2dd4bf'}
          onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
          >{t('api')}</a>
          <a href="#blog" style={{ 
            color: 'rgba(255,255,255,0.7)', 
            textDecoration: 'none', 
            fontSize: isMobile ? '14px' : '16px',
            transition: 'color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.color = '#2dd4bf'}
          onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
          >{t('blog')}</a>
        </div>
        <div style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.5)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '20px'
        }}>
          © 2025 DXCAPITAL. {t('allRightsReserved')}.
        </div>
      </div>
    </footer>
  )
}