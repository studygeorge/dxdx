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

// 🆕 Calculate next ROI activation date (15th/30th/28th rule)
export const getNextActivationDate = (currentDate = new Date()) => {
  const day = currentDate.getDate()
  const month = currentDate.getMonth()
  const year = currentDate.getFullYear()

  let activationDate

  if (day < 15) {
    // Before 15th → activates on 15th of current month
    activationDate = new Date(year, month, 15, 0, 0, 0, 0)
  } else if (day < 30) {
    // Between 15th and 30th → activates on 30th (or last day of month)
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate()
    activationDate = new Date(year, month, Math.min(30, lastDayOfMonth), 0, 0, 0, 0)
  } else {
    // After 30th → activates on 15th of next month
    activationDate = new Date(year, month + 1, 15, 0, 0, 0, 0)
  }

  return activationDate
}

// 🆕 Calculate days until activation date
export const getDaysUntilActivation = (activationDate) => {
  if (!activationDate) return 0
  const now = new Date()
  const diff = new Date(activationDate) - now
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}