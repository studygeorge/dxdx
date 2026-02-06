'use client'
import InvestmentCard from '../../wallet/InvestmentCard'

export default function InvestmentsList({ 
  userInvestments, 
  packages,
  durationBonuses,
  onWithdraw,
  onPartialWithdraw,
  onEarlyWithdraw,
  onWithdrawBonus,
  onReinvest, // ✅ ДОБАВЛЕНО
  t, 
  isMobile 
}) {
  if (!userInvestments || userInvestments.length === 0) {
    return null
  }

  return (
    <div style={{ marginBottom: isMobile ? '20px' : '28px' }}>
      <h3 style={{
        fontSize: isMobile ? '18px' : '22px',
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: isMobile ? '16px' : '20px',
        letterSpacing: '-0.6px'
      }}>
        {t.yourInvestments}
      </h3>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '12px' : '16px'
      }}>
        {userInvestments.map((investment) => (
          <InvestmentCard
            key={investment.id}
            investment={investment}
            packages={packages}
            durationBonuses={durationBonuses}
            onWithdraw={onWithdraw}
            onPartialWithdraw={onPartialWithdraw}
            onEarlyWithdraw={onEarlyWithdraw}
            onWithdrawBonus={onWithdrawBonus}
            onReinvest={onReinvest} // ✅ ДОБАВЛЕНО
            t={t}
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
  )
}