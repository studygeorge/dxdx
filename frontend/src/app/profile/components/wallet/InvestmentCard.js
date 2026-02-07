import { formatCurrency, formatDate, canUpgradeInvestment, getNextActivationDate, getDaysUntilActivation } from './calculations'

export default function InvestmentCard({ 
  investment, 
  packages, 
  durationBonuses,
  onWithdraw,
  onPartialWithdraw,
  onUpgrade,
  onEarlyWithdraw,
  onWithdrawBonus,
  onReinvest,
  showOnlyUpgrade = false,
  t, 
  isMobile 
}) {
  console.log('InvestmentCard Debug:', {
    id: investment.id,
    planName: investment.planName,
    status: investment.status,
    isCompleted: investment.isCompleted,
    daysPassed: investment.daysPassed,
    daysRemaining: investment.daysRemaining,
    duration: investment.duration,
    amount: investment.amount,
    bonusWithdrawn: investment.bonusWithdrawn,
    availableProfit: investment.availableProfit,
    pendingUpgrade: investment.pendingUpgrade
  })

  const daysPassed = investment.daysPassed || 0
  const daysRemaining = investment.daysRemaining || 0
  const currentReturn = investment.currentReturn || 0
  const availableProfit = investment.availableProfit || 0
  const isCompleted = investment.status === 'COMPLETED' || investment.isCompleted || false
  const isSimulated = investment.isSimulated || false
  
  const investedAmount = parseFloat(investment.amount || 0)
  const expectedReturn = parseFloat(investment.expectedReturn || 0)
  const withdrawnProfits = parseFloat(investment.withdrawnProfits || 0)
  const accumulatedInterest = parseFloat(investment.accumulatedInterest || 0)

  // 🆕 Pending upgrade данные
  const hasPendingUpgrade = !!(investment.pendingUpgrade && investment.pendingUpgrade.newPlan)
  const pendingUpgradeActivationDate = hasPendingUpgrade 
    ? new Date(investment.pendingUpgrade.activationDate) 
    : null
  const daysUntilActivation = pendingUpgradeActivationDate 
    ? getDaysUntilActivation(pendingUpgradeActivationDate) 
    : 0

  // 🆕 Reinvest данные
  const hasRecentReinvest = !!(investment.lastReinvestAt || investment.reinvestedAt)
  const reinvestActivationDate = hasRecentReinvest && investment.roiActivationDate
    ? new Date(investment.roiActivationDate)
    : null
  const daysUntilReinvestActivation = reinvestActivationDate
    ? getDaysUntilActivation(reinvestActivationDate)
    : 0
  const reinvestedAmount = parseFloat(investment.reinvestedAmount || investment.lastReinvestedAmount || 0)

  // 🆕 Текущий ROI (до активации) и новый ROI (после активации)
  // Учитываем бонус длительности
  // ✅ Backend уже возвращает effectiveROI с учётом duration bonus
  // НЕ добавляем бонус повторно!
  const currentROI = Number(investment.effectiveROI || investment.roi || 0)
  const newROI = hasPendingUpgrade ? investment.pendingUpgrade.newROI : null

  const getDurationBonus = () => {
    const duration = investment.duration
    if (duration === 3) return 0
    
    const amount = parseFloat(investment.amount || 0)
    
    if (duration === 6) {
      if (amount >= 1000) return 500
      if (amount >= 500) return 200
      return 0
    }
    
    if (duration === 12) {
      if (amount >= 1000) return 500
      if (amount >= 500) return 200
      return 0
    }
    
    return 0
  }

  const termBonus = getDurationBonus()
  const totalProfit = expectedReturn - investedAmount - termBonus

  const totalDaysFromCreation = (() => {
    if (!investment.createdAt) return daysPassed
    
    const createdDate = new Date(investment.createdAt)
    const now = new Date()
    const diffTime = now.getTime() - createdDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 ? diffDays : 0
  })()

  const getStatusColor = () => {
    if (hasPendingUpgrade) return '#f59e0b'
    if (investment.pendingUpgrade) return '#f59e0b'
    if (isCompleted) {
      if (investment.withdrawalRequested) return '#6b7280'
      return '#6366f1'
    }
    return '#2dd4bf'
  }

  const getStatusText = () => {
    if (hasPendingUpgrade) return t.statusUpgradePending || t.pendingUpgrade || 'Upgrade Pending'
    if (investment.pendingUpgrade) return t.statusUpgradePending || t.pendingUpgrade || 'Upgrade Pending'
    if (isCompleted) {
      if (investment.withdrawalRequested) return t.statusWithdrawn || t.withdrawalRequested || 'Withdrawn'
      return t.completed || 'Completed'
    }
    return t.active || 'Active'
  }

  const isWithdrawable = () => {
    return isCompleted && !investment.withdrawalRequested
  }

  const canUpgradePlan = () => {
    if (investment.status !== 'ACTIVE') return false
    if (investment.pendingUpgrade) return false
    if (hasPendingUpgrade) return false
    if (isCompleted) return false
    const upgradeCheck = canUpgradeInvestment(investment, t)
    return upgradeCheck.canUpgrade
  }

  const canEarlyWithdrawPlan = () => {
    if (investment.status !== 'ACTIVE') return false
    if (investment.withdrawalRequested) return false
    if (investment.pendingUpgrade) return false
    if (hasPendingUpgrade) return false
    if (isCompleted) return false
    return totalDaysFromCreation <= 30
  }

  const canPartialWithdrawPlan = () => {
    if (investment.status !== 'ACTIVE') return { can: false, reason: '' }
    if (investment.withdrawalRequested) return { can: false, reason: '' }
    if (isCompleted) return { can: false, reason: '' }
    if (availableProfit <= 0) return { can: false, reason: t.noAccumulatedProfit }
    return { can: true, reason: '' }
  }

  const canWithdrawBonus = () => {
    const bonusAmount = getDurationBonus()
    if (bonusAmount <= 0) return false

    const isEligibleForBonus = investment.duration >= 6
    if (!isEligibleForBonus) return false

    if (investment.bonusWithdrawn) return false

    const isActiveOrCompleted = investment.status === 'ACTIVE' || investment.status === 'COMPLETED' || investment.isCompleted
    if (!isActiveOrCompleted) return false

    const halfDuration = investment.duration === 6 ? 90 : 180
    const currentDaysPassed = investment.daysPassed || 0
    
    return currentDaysPassed >= halfDuration
  }

  const canReinvestProfit = () => {
    if (investment.status !== 'ACTIVE') return false
    if (investment.withdrawalRequested) return false
    if (isCompleted) return false
    return availableProfit > 0
  }

  const statusColor = getStatusColor()
  const statusText = getStatusText()
  const canWithdraw = isWithdrawable()
  const canUpgrade = canUpgradePlan()
  const canEarlyWithdraw = canEarlyWithdrawPlan()
  const partialWithdrawCheck = canPartialWithdrawPlan()
  const canWithdrawBonusFlag = canWithdrawBonus()
  const canReinvest = canReinvestProfit()

  const showUpgradeInfo = investment.lastUpgradeDate && daysPassed >= 0

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${
          hasPendingUpgrade || investment.pendingUpgrade
            ? 'rgba(245, 158, 11, 0.3)'
            : isCompleted 
              ? 'rgba(99, 102, 241, 0.3)'
              : 'rgba(255, 255, 255, 0.1)'
        }`,
        borderRadius: isMobile ? '20px' : '24px',
        padding: isMobile ? '16px 18px' : '20px 24px',
        transition: 'all 0.3s',
        position: 'relative'
      }}
    >
      {/* 🆕 PENDING UPGRADE BANNER С РАСПИСАНИЕМ ПРОЦЕНТОВ */}
      {hasPendingUpgrade && pendingUpgradeActivationDate && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(251, 191, 36, 0.15) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#f59e0b',
              animation: 'pulse 2s infinite'
            }} />
            <div style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#f59e0b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {t.upgradeScheduled || 'Upgrade Scheduled'}
            </div>
          </div>
          
          <div style={{
            fontSize: '12px',
            color: 'rgba(245, 158, 11, 0.9)',
            lineHeight: '1.6'
          }}>
            {/* 🆕 ТЕКУЩИЙ ПЕРИОД (до активации) */}
            <div style={{
              background: 'rgba(45, 212, 191, 0.15)',
              border: '1px solid rgba(45, 212, 191, 0.3)',
              borderRadius: '8px',
              padding: '8px 12px',
              marginBottom: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px' }}>📊</span>
                <strong style={{ color: '#2dd4bf' }}>{t.currentPeriod || 'Current Period'}</strong>
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '11px' }}>
                {t.plan || 'Plan'}: <strong>{investment.planName}</strong> • 
                <strong style={{ color: '#2dd4bf', marginLeft: '4px' }}>{currentROI}% APY</strong>
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '11px', marginTop: '2px' }}>
                {t.activeUntil || 'Active until'}: <strong>{pendingUpgradeActivationDate.toLocaleDateString('ru-RU')}</strong>
              </div>
            </div>

            {/* 🆕 СЛЕДУЮЩИЙ ПЕРИОД (после активации) */}
            <div style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '8px',
              padding: '8px 12px',
              marginBottom: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px' }}>⏭️</span>
                <strong style={{ color: '#f59e0b' }}>{t.nextPeriod || 'Next Period'}</strong>
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '11px' }}>
                {t.plan || 'Plan'}: <strong>{investment.pendingUpgrade.newPlan}</strong> • 
                <strong style={{ color: '#f59e0b', marginLeft: '4px' }}>{investment.pendingUpgrade.newROI}% APY</strong>
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '11px', marginTop: '2px' }}>
                {t.startsFrom || 'Starts from'}: <strong>{pendingUpgradeActivationDate.toLocaleDateString('ru-RU')}</strong>
              </div>
            </div>

            {/* 🆕 ОБРАТНЫЙ ОТСЧЁТ */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              background: 'rgba(245, 158, 11, 0.2)',
              borderRadius: '8px',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
              <span style={{ fontSize: '16px' }}>⏰</span>
              <span style={{ fontWeight: '700', color: '#f59e0b', fontSize: '13px' }}>
                {daysUntilActivation === 0 
                  ? (t.activatingToday || '🎉 New rate activates today!')
                  : `${daysUntilActivation} ${t.daysUntilNewRate || 'days until new rate'}`}
              </span>
            </div>

            {/* 🆕 ПОЯСНЕНИЕ */}
            <div style={{
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.6)',
              marginTop: '8px',
              fontStyle: 'italic',
              lineHeight: '1.4'
            }}>
              💡 {t.upgradeExplanation || 'New interest rate will apply from the 15th or 30th of each month after the upgrade is confirmed.'}
            </div>
          </div>
        </div>
      )}

      {/* 🆕 REINVEST BANNER - показывает что был реинвест и когда активируется новый ROI */}
      {!hasPendingUpgrade && hasRecentReinvest && reinvestActivationDate && daysUntilReinvestActivation > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.2) 0%, rgba(20, 184, 166, 0.15) 100%)',
          border: '1px solid rgba(45, 212, 191, 0.4)',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#2dd4bf',
              animation: 'pulse 2s infinite'
            }} />
            <div style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#2dd4bf',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              💰 {t.reinvestActivation || 'Profit Reinvested'}
            </div>
          </div>
          
          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: '1.6'
          }}>
            {/* Реинвестированная сумма */}
            {reinvestedAmount > 0 && (
              <div style={{
                background: 'rgba(45, 212, 191, 0.15)',
                border: '1px solid rgba(45, 212, 191, 0.3)',
                borderRadius: '8px',
                padding: '8px 12px',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px' }}>📈</span>
                  <strong style={{ color: '#2dd4bf' }}>{t.reinvestedAmount || 'Reinvested'}: ${reinvestedAmount.toFixed(2)}</strong>
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '11px' }}>
                  {t.newTotalAmount || 'New total amount'}: <strong>${investedAmount.toFixed(2)}</strong>
                </div>
              </div>
            )}

            {/* Дата активации нового ROI */}
            <div style={{
              background: 'rgba(45, 212, 191, 0.1)',
              border: '1px solid rgba(45, 212, 191, 0.25)',
              borderRadius: '8px',
              padding: '8px 12px',
              marginBottom: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px' }}>📅</span>
                <strong style={{ color: '#2dd4bf' }}>{t.newROIActivation || 'New ROI Activation'}</strong>
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '11px' }}>
                {t.currentROI || 'Current'}: <strong style={{ color: '#2dd4bf' }}>{currentROI}% APY</strong>
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '11px', marginTop: '2px' }}>
                {t.activatesOn || 'Activates on'}: <strong>{reinvestActivationDate.toLocaleDateString('ru-RU')}</strong>
              </div>
            </div>

            {/* Обратный отсчёт */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: 'rgba(45, 212, 191, 0.08)',
              borderRadius: '6px',
              border: '1px solid rgba(45, 212, 191, 0.2)'
            }}>
              <span style={{ fontSize: '16px' }}>⏰</span>
              <span style={{ fontWeight: '700', color: '#2dd4bf', fontSize: '13px' }}>
                {daysUntilReinvestActivation === 0 
                  ? (t.activatingToday || '🎉 Activates today!')
                  : `${daysUntilReinvestActivation} ${t.daysUntilActivation || 'days until activation'}`}
              </span>
            </div>

            {/* Пояснение */}
            <div style={{
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.6)',
              marginTop: '8px',
              fontStyle: 'italic',
              lineHeight: '1.4'
            }}>
              💡 {t.reinvestExplanation || 'Interest will be calculated on the new amount starting from the 15th or 30th (28th in February) of the month.'}
            </div>
          </div>
        </div>
      )}

      {/* Старый pending upgrade banner (для обратной совместимости) */}
      {!hasPendingUpgrade && investment.pendingUpgrade && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '12px',
          padding: '10px 14px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#f59e0b',
            animation: 'pulse 2s infinite'
          }} />
          <div>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#f59e0b',
              marginBottom: '2px'
            }}>
              {t.upgradeInProgress}
            </div>
            <div style={{
              fontSize: '11px',
              color: 'rgba(245, 158, 11, 0.8)'
            }}>
              {t.upgradingTo} {investment.pendingUpgrade.targetPackage} • {formatCurrency(investment.pendingUpgrade.newAmount)}
            </div>
          </div>
        </div>
      )}

      {isCompleted && !investment.withdrawalRequested && (
        <div style={{
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '12px',
          padding: '10px 14px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#6366f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#ffffff',
            fontWeight: 'bold'
          }}>
            ✓
          </div>
          <div>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#6366f1',
              marginBottom: '2px'
            }}>
              {t.investmentCompleted || 'Investment Completed'}
            </div>
            <div style={{
              fontSize: '11px',
              color: 'rgba(99, 102, 241, 0.8)'
            }}>
              {t.readyToWithdraw || 'Ready to withdraw'} • {formatCurrency(expectedReturn)}
            </div>
          </div>
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '16px'
      }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '600',
              color: '#ffffff',
              letterSpacing: '-0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {investment.planName}
              {!hasPendingUpgrade && !investment.pendingUpgrade && (
                <span style={{
                  fontSize: isMobile ? '11px' : '12px',
                  fontWeight: '600',
                  color: '#2dd4bf',
                  background: 'rgba(45, 212, 191, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(45, 212, 191, 0.3)'
                }}>
                  {currentROI}% APY
                </span>
              )}
            </div>
            
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 10px',
              background: `${statusColor}22`,
              border: `1px solid ${statusColor}66`,
              borderRadius: '12px',
              fontSize: isMobile ? '10px' : '11px',
              fontWeight: '600',
              color: statusColor,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {statusText}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <div style={{
              fontSize: isMobile ? '11px' : '12px',
              color: 'rgba(255, 255, 255, 0.5)'
            }}>
              <span>{t.invested}:</span>{' '}
              <span style={{ color: '#2dd4bf', fontWeight: '500' }}>
                {formatCurrency(investedAmount)}
              </span>
            </div>

            <div style={{
              fontSize: isMobile ? '11px' : '12px',
              color: 'rgba(255, 255, 255, 0.5)'
            }}>
              <span>{isCompleted ? t.earned : t.currentReturn}:</span>{' '}
              <span style={{ color: '#2dd4bf', fontWeight: '500' }}>
                {formatCurrency(isCompleted ? totalProfit : currentReturn)}
              </span>
            </div>
          </div>

          {withdrawnProfits > 0 && (
            <div style={{
              fontSize: isMobile ? '11px' : '12px',
              background: 'rgba(20, 184, 166, 0.1)',
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid rgba(20, 184, 166, 0.2)',
              marginBottom: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  {t.alreadyWithdrawn}:
                </div>
                <div style={{ color: '#14b8a6', fontWeight: '600' }}>
                  {formatCurrency(withdrawnProfits)}
                </div>
              </div>
              {!isCompleted && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    {t.availableProfit}:
                  </div>
                  <div style={{ color: '#2dd4bf', fontWeight: '600' }}>
                    {formatCurrency(availableProfit)}
                  </div>
                </div>
              )}
            </div>
          )}

          {accumulatedInterest > 0 && (
            <div style={{
              fontSize: isMobile ? '11px' : '12px',
              background: 'rgba(45, 212, 191, 0.1)',
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid rgba(45, 212, 191, 0.2)',
              marginBottom: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '10px' }}>
                    {t.accumulatedInterest}
                  </div>
                  <div style={{ color: '#2dd4bf', fontWeight: '600', fontSize: '13px' }}>
                    {formatCurrency(accumulatedInterest)}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '9px', marginTop: '2px' }}>
                    {t.fromPreviousPlan}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{
            fontSize: isMobile ? '11px' : '12px',
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: '8px'
          }}>
            {isCompleted ? (
              <>{t.completedDate || t.completedOn || 'Completed'}: {formatDate(investment.completedAt || investment.endDate, investment.language)}</>
            ) : (
              <>
                {t.completesOn}: {formatDate(investment.endDate, investment.language)}
                {daysRemaining > 0 && (
                  <span style={{ 
                    color: '#2dd4bf', 
                    fontWeight: '500',
                    marginLeft: '8px'
                  }}>
                    ({daysRemaining} {t.daysRemaining})
                  </span>
                )}
                {' | '}
                <span style={{ color: '#2dd4bf' }}>
                  {daysPassed} {t.daysPassed}
                </span>
                {showUpgradeInfo && (
                  <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '10px', marginLeft: '4px' }}>
                    ({t.sinceUpgrade || 'since upgrade'})
                  </span>
                )}
              </>
            )}
          </div>

          <div style={{
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '600',
            color: isCompleted ? '#6366f1' : '#2dd4bf',
            letterSpacing: '-0.5px'
          }}>
            {canWithdraw ? t.availableAmount : (isCompleted ? t.total : t.expectedReturn)}: {formatCurrency(expectedReturn)}
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          {!showOnlyUpgrade && !isCompleted && onReinvest && (
            <button
              onClick={() => canReinvest ? onReinvest(investment) : null}
              disabled={!canReinvest}
              title={!canReinvest ? (t.noAvailableProfit || 'No available profit to reinvest') : ''}
              style={{
                padding: isMobile ? '10px 20px' : '12px 24px',
                background: canReinvest
                  ? 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)'
                  : 'rgba(45, 212, 191, 0.2)',
                border: canReinvest
                  ? 'none'
                  : '1px solid rgba(45, 212, 191, 0.3)',
                borderRadius: '16px',
                color: canReinvest ? '#000000' : 'rgba(45, 212, 191, 0.5)',
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '600',
                cursor: canReinvest ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s',
                letterSpacing: '-0.3px',
                whiteSpace: 'nowrap',
                opacity: canReinvest ? 1 : 0.6,
                boxShadow: canReinvest ? '0 4px 12px rgba(45, 212, 191, 0.3)' : 'none'
              }}
              onMouseOver={(e) => {
                if (canReinvest) {
                  e.currentTarget.style.transform = 'scale(1.03)'
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(45, 212, 191, 0.5)'
                }
              }}
              onMouseOut={(e) => {
                if (canReinvest) {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 212, 191, 0.3)'
                }
              }}
            >
              {t.reinvestButton}
            </button>
          )}

          {!showOnlyUpgrade && canWithdraw && (
            <button
              onClick={() => onWithdraw(investment)}
              style={{
                padding: isMobile ? '10px 20px' : '12px 24px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                border: 'none',
                borderRadius: '16px',
                color: '#ffffff',
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                letterSpacing: '-0.3px',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)'
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(99, 102, 241, 0.5)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}
            >
              {t.withdrawButton}
            </button>
          )}

          {!showOnlyUpgrade && canWithdrawBonusFlag && onWithdrawBonus && (
            <button
              onClick={() => onWithdrawBonus(investment)}
              style={{
                padding: isMobile ? '10px 20px' : '12px 24px',
                background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                border: 'none',
                borderRadius: '16px',
                color: '#000000',
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                letterSpacing: '-0.3px',
                whiteSpace: 'nowrap',
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
              {t.withdrawBonusButton || 'Вывести бонус'} ({formatCurrency(termBonus)})
            </button>
          )}

          {!showOnlyUpgrade && investment.status === 'ACTIVE' && !isCompleted && (
            <button
              onClick={() => onPartialWithdraw(investment)}
              disabled={!partialWithdrawCheck.can}
              title={!partialWithdrawCheck.can ? partialWithdrawCheck.reason : ''}
              style={{
                padding: isMobile ? '10px 20px' : '12px 24px',
                background: partialWithdrawCheck.can 
                  ? 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)'
                  : 'rgba(45, 212, 191, 0.2)',
                border: partialWithdrawCheck.can 
                  ? 'none' 
                  : '1px solid rgba(45, 212, 191, 0.3)',
                borderRadius: '16px',
                color: partialWithdrawCheck.can ? '#000000' : 'rgba(45, 212, 191, 0.5)',
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '600',
                cursor: partialWithdrawCheck.can ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s',
                letterSpacing: '-0.3px',
                whiteSpace: 'nowrap',
                opacity: partialWithdrawCheck.can ? 1 : 0.6
              }}
            >
              {t.partialWithdrawButton}
            </button>
          )}

          {showOnlyUpgrade && canUpgrade && (
            <button
              onClick={() => onUpgrade(investment)}
              style={{
                padding: isMobile ? '10px 20px' : '12px 24px',
                background: 'rgba(45, 212, 191, 0.15)',
                border: '1px solid rgba(45, 212, 191, 0.3)',
                borderRadius: '16px',
                color: '#2dd4bf',
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                letterSpacing: '-0.3px',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(45, 212, 191, 0.25)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(45, 212, 191, 0.15)'
              }}
            >
              {t.upgradeButton}
            </button>
          )}

          {!showOnlyUpgrade && investment.status === 'ACTIVE' && !isCompleted && (
            <button
              onClick={() => onEarlyWithdraw(investment)}
              disabled={!canEarlyWithdraw}
              title={!canEarlyWithdraw ? t.earlyWithdrawNotAvailable : (withdrawnProfits > 0 ? t.earlyWithdrawMinusWithdrawn : '')}
              style={{
                padding: isMobile ? '10px 20px' : '12px 24px',
                background: canEarlyWithdraw 
                  ? 'rgba(20, 184, 166, 0.3)' 
                  : 'rgba(20, 184, 166, 0.15)',
                border: `1px solid rgba(20, 184, 166, ${canEarlyWithdraw ? '0.5' : '0.25'})`,
                borderRadius: '16px',
                color: canEarlyWithdraw ? '#14b8a6' : 'rgba(20, 184, 166, 0.4)',
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '600',
                cursor: canEarlyWithdraw ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s',
                letterSpacing: '-0.3px',
                whiteSpace: 'nowrap',
                opacity: canEarlyWithdraw ? 1 : 0.5
              }}
            >
              {t.earlyWithdrawButton}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}
