export const API_BASE_URL = 'https://dxcapital-ai.com'

export const translations = {
  en: {
    loading: 'Loading',
    back: 'Back',
    overview: 'Profile',
    investments: 'Your Investments',
    history: 'Reporting',
    referral: 'Partner Program',
    upgrade: 'Upgrade',
    active: 'Active',
    inactive: 'Inactive',
    noAvailableProfit: 'No available profit to reinvest',
    reinvestButton: 'Reinvest',
    disconnectWallet: 'Disconnect',
    connectMetamask: 'Connect MetaMask',
    connecting: 'Connecting',
    installMetaMask: 'Please install MetaMask wallet',
    noAccounts: 'No accounts found',
    signatureRejected: 'Signature rejected by user',
    connectionFailed: 'Connection failed. Please try again.',
    walletDisconnected: 'Wallet disconnected successfully',
    logout: 'Logout',
    logoutTitle: 'Confirm Logout',
    logoutMessage: 'Are you sure you want to logout from your account?',
    logoutConfirm: 'Yes, Logout',
    logoutCancel: 'Cancel',
    kycNotSubmitted: 'Not Verified',
    kycPending: 'Pending',
    kycApproved: 'Verified',
    kycRejected: 'Rejected',
    verifyNow: 'Verify Now',
    telegramBot: 'Telegram Bot',
    support: 'Support',
    
    // Reinvest translations
    reinvestProfit: 'Reinvest Profit',
    reinvestButton: 'Reinvest',
    reinvestDescription: 'Your profit has been reinvested into your investment. The funds will remain in the system and continue to generate returns.',
    reinvestSuccess: 'Reinvestment Successful',
    profitReinvested: 'Profit Reinvested',
    reinvestedAmount: 'Reinvested Amount',
    currentInvestment: 'Current Investment',
    availableProfit: 'Available Profit',
    currentPlan: 'Current Plan',
    reinvestAmount: 'Reinvest Amount',
    newTotalAmount: 'New total amount',
    upgradeDetected: 'Upgrade Detected!',
    willUpgradeTo: 'Your investment will be upgraded to',
    with: 'with',
    upgradedTo: 'Upgraded to',
    reinvestNote: 'Your profit will be added to your investment amount. No bonus is applied during reinvestment. If the new amount reaches a higher plan threshold, your package will be automatically upgraded.',
    enterValidAmount: 'Please enter a valid amount',
    processing: 'Processing...',
    close: 'Close',
    cancel: 'Cancel'
  },
  ru: {
    loading: 'Загрузка',
    back: 'Назад',
    overview: 'Личный кабинет',
    investments: 'Ваши инвестиции',
    noAvailableProfit: 'Нет доступной прибыли для реинвестирования',
    reinvestButton: 'Реинвестировать',
    history: 'Отчётность',
    referral: 'Партнёрская программа',
    upgrade: 'Апгрейд',
    active: 'Активен',
    inactive: 'Неактивен',
    disconnectWallet: 'Отключить',
    connectMetamask: 'Подключить MetaMask',
    connecting: 'Подключение',
    installMetaMask: 'Установите кошелёк MetaMask',
    noAccounts: 'Аккаунты не найдены',
    signatureRejected: 'Подпись отклонена пользователем',
    connectionFailed: 'Подключение не удалось. Попробуйте снова.',
    walletDisconnected: 'Кошелёк отключён успешно',
    logout: 'Выйти',
    logoutTitle: 'Подтверждение выхода',
    logoutMessage: 'Вы уверены, что хотите выйти из аккаунта?',
    logoutConfirm: 'Да, выйти',
    logoutCancel: 'Отмена',
    kycNotSubmitted: 'Не верифицирован',
    kycPending: 'На проверке',
    kycApproved: 'Верифицирован',
    kycRejected: 'Отклонено',
    verifyNow: 'Пройти сейчас',
    telegramBot: 'Telegram-бот',
    support: 'Поддержка',
    
    // Переводы для реинвестирования
    reinvestProfit: 'Реинвестировать прибыль',
    reinvestButton: 'Реинвестировать',
    reinvestDescription: 'Ваша прибыль была реинвестирована в ваши инвестиции. Средства останутся в системе и продолжат приносить доход.',
    reinvestSuccess: 'Реинвестирование выполнено',
    profitReinvested: 'Прибыль реинвестирована',
    reinvestedAmount: 'Реинвестированная сумма',
    currentInvestment: 'Текущая инвестиция',
    availableProfit: 'Доступная прибыль',
    currentPlan: 'Текущий план',
    reinvestAmount: 'Сумма реинвестирования',
    newTotalAmount: 'Новая общая сумма',
    upgradeDetected: 'Обнаружен апгрейд!',
    willUpgradeTo: 'Ваша инвестиция будет обновлена до',
    with: 'с',
    upgradedTo: 'Обновлено до',
    reinvestNote: 'Ваша прибыль будет добавлена к сумме инвестиции. Бонус при реинвестировании не начисляется. Если новая сумма достигает порога более высокого плана, ваш пакет будет автоматически обновлён.',
    enterValidAmount: 'Пожалуйста, введите корректную сумму',
    processing: 'Обработка...',
    close: 'Закрыть',
    cancel: 'Отмена'
  }
}

export const getTabs = (t) => [
  { id: 'overview', label: t.overview, emoji: '👤' },
  { id: 'investing', label: t.investments, requiresKYC: true, emoji: '💎' },
  { id: 'history', label: t.history, requiresKYC: true, emoji: '📄' },
  { id: 'referral', label: t.referral, requiresKYC: true, emoji: '👥' },
  { id: 'upgrade', label: t.upgrade, alwaysGlowing: true, requiresKYC: true, emoji: '🚀' }
]

export const getSupportLink = () => {
  const currentMinute = new Date().getMinutes()
  const isFirstHalf = currentMinute < 30
  return isFirstHalf ? 'https://t.me/DXCapital1' : 'https://t.me/DXCapital2'
}

export const getKYCStatusInfo = (kycStatus, t) => {
  switch (kycStatus) {
    case 'APPROVED':
      return {
        text: t.kycApproved,
        color: '#2dd4bf',
        bgColor: 'rgba(45, 212, 191, 0.15)',
        borderColor: 'rgba(45, 212, 191, 0.3)',
        showButton: false
      }
    case 'PENDING':
      return {
        text: t.kycPending,
        color: '#eab308',
        bgColor: 'rgba(234, 179, 8, 0.15)',
        borderColor: 'rgba(234, 179, 8, 0.3)',
        showButton: true
      }
    case 'REJECTED':
      return {
        text: t.kycRejected,
        color: '#eab308',
        bgColor: 'rgba(234, 179, 8, 0.15)',
        borderColor: 'rgba(234, 179, 8, 0.3)',
        showButton: true
      }
    default:
      return {
        text: t.kycNotSubmitted,
        color: '#ffffff',
        bgColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        showButton: true
      }
  }
}