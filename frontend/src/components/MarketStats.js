export default function MarketStats({ isMobile, isTablet }) {
  const marketStats = [
    { label: 'Market Cap', value: '$2.4T', change: '+2.5%', positive: true },
    { label: 'Cryptocurrencies', value: '500+', change: 'Active', positive: true },
    { label: 'Trading Fees', value: '0.1%', change: 'From', positive: true },
    { label: 'Support', value: '24/7', change: 'Available', positive: true }
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: isMobile ? '12px' : '20px',
      marginBottom: '40px'
    }}>
      {marketStats.map((stat, index) => (
        <div key={stat.label} style={{
          background: `
            linear-gradient(135deg, 
              rgba(255, 255, 255, 0.15) 0%,
              rgba(255, 255, 255, 0.05) 50%,
              rgba(255, 255, 255, 0.10) 100%
            )
          `,
          backdropFilter: 'blur(30px) saturate(150%)',
          WebkitBackdropFilter: 'blur(30px) saturate(150%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '18px',
          padding: isMobile ? '18px' : '22px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `
            0 6px 20px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.2)
          `
        }}>
          {/* Топ блик */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)'
          }} />
          
          <div style={{ 
            fontSize: isMobile ? '20px' : '26px', 
            fontWeight: 'bold', 
            color: '#2dd4bf', 
            marginBottom: '6px',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
          }}>
            {stat.value}
          </div>
          <div style={{ 
            fontSize: isMobile ? '12px' : '14px', 
            color: 'rgba(255,255,255,0.8)', 
            marginBottom: '4px',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
          }}>
            {stat.label}
          </div>
          <div style={{ 
            fontSize: isMobile ? '10px' : '12px', 
            color: stat.positive ? '#2dd4bf' : '#ef4444',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
          }}>
            {stat.change}
          </div>
        </div>
      ))}
    </div>
  )
}