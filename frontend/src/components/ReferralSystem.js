import { fixPrepositions } from '../app/utils/textUtils'
import { useTranslation } from '../app/hooks/useTranslation'

export default function ReferralSystem({ isMobile, isTablet }) {
  const { t } = useTranslation()

  return (
    <div style={{ marginBottom: '100px' }}>
      <div style={{
        background: `
          linear-gradient(135deg, 
            rgba(45, 212, 191, 0.15) 0%,
            rgba(45, 212, 191, 0.05) 50%,
            rgba(45, 212, 191, 0.08) 100%
          )
        `,
        backdropFilter: 'blur(30px) saturate(150%)',
        WebkitBackdropFilter: 'blur(30px) saturate(150%)',
        border: '1px solid rgba(45, 212, 191, 0.3)',
        borderRadius: '32px',
        padding: isMobile ? '32px 24px' : '48px 40px',
        textAlign: 'center',
        maxWidth: '1100px',
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(45, 212, 191, 0.6), transparent)'
        }} />
        
        <h2 style={{
          fontSize: isMobile ? '28px' : '40px',
          fontWeight: '800',
          color: 'white',
          marginBottom: '50px',
          lineHeight: '1.2'
        }}>
          {fixPrepositions(t('referralTitle'))}
        </h2>

        {/* Partnership Program Benefits */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '24px',
          textAlign: 'left',
          marginBottom: '40px'
        }}>
          {[
            { 
              title: t('referralBonus'),
              desc: t('referralBonusDesc'),
              highlight: true
            },
            { 
              title: t('volumeReward'),
              desc: t('volumeRewardDesc'),
              highlight: false
            },
            { 
              title: t('partnerClub'),
              desc: t('partnerClubDesc'),
              highlight: false
            }
          ].map((item, index) => (
            <div key={index} style={{
              background: item.highlight ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              borderRadius: '20px',
              padding: '32px 24px',
              border: item.highlight ? '2px solid rgba(45, 212, 191, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)'
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(45, 212, 191, 0.2)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            >
              {item.highlight && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #2dd4bf, transparent)'
                }} />
              )}
              
              <div style={{
                fontSize: isMobile ? '18px' : '20px',
                fontWeight: '700',
                color: item.highlight ? '#2dd4bf' : 'white',
                marginBottom: '16px',
                lineHeight: '1.3'
              }}>
                {fixPrepositions(item.title)}
              </div>
              <div style={{
                fontSize: '15px',
                color: 'rgba(255,255,255,0.75)',
                lineHeight: '1.6',
                whiteSpace: 'pre-line'
              }}>
                {fixPrepositions(item.desc)}
              </div>
            </div>
          ))}
        </div>

        {/* Example Section */}
        {t('referralExample') && t('referralExampleDesc') && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: isMobile ? '24px' : '32px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '40px',
            textAlign: 'left'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)'
            }} />
            
            <div style={{
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: '700',
              color: '#2dd4bf',
              marginBottom: '16px'
            }}>
              {fixPrepositions(t('referralExample'))}
            </div>
            <div style={{
              fontSize: '15px',
              color: 'rgba(255,255,255,0.85)',
              lineHeight: '1.7',
              whiteSpace: 'pre-line'
            }}>
              {fixPrepositions(t('referralExampleDesc'))}
            </div>
          </div>
        )}

        {/* Community Message */}
        {t('communityMessage') && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: isMobile ? '24px' : '32px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)'
            }} />
            
            <p style={{
              fontSize: isMobile ? '16px' : '20px',
              color: 'rgba(255,255,255,0.9)',
              lineHeight: '1.7',
              margin: 0,
              fontWeight: '500',
              fontStyle: 'italic'
            }}>
              {fixPrepositions(t('communityMessage'))}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}