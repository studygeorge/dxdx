// ✅ СЕРВЕРНЫЕ РАСЧЕТЫ - клиент только форматирует данные

export const getAvailableUpgradePackages = (currentAmount, packages) => {
  const currentPkg = packages.find(p => 
    currentAmount >= p.minAmount && currentAmount <= p.maxAmount
  )
  const currentIndex = packages.indexOf(currentPkg)
  
  if (currentIndex === -1) return []
  
  return packages.slice(currentIndex + 1)
}

export const validateTRC20Address = (address) => {
  const trc20Regex = /^T[A-Za-z1-9]{33}$/
  return trc20Regex.test(address)
}

export const canUpgradeInvestment = (investment, t) => {
  if (investment.status !== 'ACTIVE') {
    return { 
      canUpgrade: false, 
      reason: t.upgradeOnlyActive || 'Upgrade only available for active investments' 
    }
  }
  
  if (investment.pendingUpgrade) {
    return { 
      canUpgrade: false, 
      reason: t.pendingUpgradeExists || 'Pending upgrade already exists' 
    }
  }
  
  if (investment.lastUpgradeDate) {
    const lastUpgrade = new Date(investment.lastUpgradeDate)
    const today = new Date()
    const isSameDay = 
      lastUpgrade.getFullYear() === today.getFullYear() &&
      lastUpgrade.getMonth() === today.getMonth() &&
      lastUpgrade.getDate() === today.getDate()
    
    if (isSameDay) {
      return { 
        canUpgrade: false, 
        reason: t.cannotUpgradeTwicePerDay || 'Cannot upgrade twice in the same day' 
      }
    }
  }
  
  if (investment.planName === 'Elite') {
    return { 
      canUpgrade: false, 
      reason: t.alreadyMaxPackage || 'Already at maximum package' 
    }
  }
  
  return { canUpgrade: true, reason: '' }
}

export const formatCurrency = (value) => {
  const numValue = parseFloat(value) || 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue)
}

export const formatDate = (dateString, language = 'en') => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}