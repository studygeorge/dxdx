'use client'
import { useState } from 'react'
import KYCModal from '../KYCModal'
import WithdrawModal from '../wallet/WithdrawModal'
import UpgradeModal from '../wallet/UpgradeModal'
import EarlyWithdrawModal from '../wallet/EarlyWithdrawModal'
import PartialWithdrawModal from '../wallet/PartialWithdrawModal'
import WithdrawBonusModal from '../wallet/WithdrawBonusModal'
import ReinvestModal from './components/ReinvestModal' // ✅ ДОБАВЛЕНО
import InvestmentPlansGrid from './components/InvestmentPlansGrid'
import InvestmentsList from './components/InvestmentsList'
import InvestForm from './components/InvestForm-Compact' // ✅ КОМПАКТНАЯ ВЕРСИЯ
import PaymentStep from './components/PaymentStep'
import ConfirmationStep from './components/ConfirmationStep'
import { useInvestments } from './hooks/useInvestments'
import { useKYC } from './hooks/useKYC'
import { useModals } from './hooks/useModals'
import { investmentAPI } from './utils/api'
import { validateTRC20Address, canUpgradeInvestment } from './utils/calculations'
import { calculateReturns as calcReturns, calculateDaysPassedFromStart } from './utils/calculations'
import { packages, getDurationBonuses, getDurationBonus, API_BASE_URL } from './constants'
import { getSpinnerKeyframes, getInputResetStyles, alertStyle } from './styles'
import { translations as walletTranslations } from '../wallet/translations'

export default function InvestingTab({ 
  isMobile, 
  language, 
  investmentPlans = [],
  plansLoading = false,
  walletAddress = '',
  setShowWeb3Modal,
  onModalStateChange,
  user 
}) {
  // Состояния
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [investAmount, setInvestAmount] = useState('')
  const [selectedDuration, setSelectedDuration] = useState(3)
  const [senderWalletAddress, setSenderWalletAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pendingInvestmentId, setPendingInvestmentId] = useState(null)
  const [adminWalletAddress, setAdminWalletAddress] = useState('')
  const [maxAmountWarning, setMaxAmountWarning] = useState(false)
  const [selectedInvestment, setSelectedInvestment] = useState(null)
  const [trc20Address, setTrc20Address] = useState('')
  const [withdrawError, setWithdrawError] = useState('')
  const [withdrawSuccess, setWithdrawSuccess] = useState('')
  const [upgradeError, setUpgradeError] = useState('')
  const [upgradeSuccess, setUpgradeSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Хуки
  const { userInvestments, refreshInvestments } = useInvestments(user)
  const { userKYCStatus, kycChecked, refreshKYCStatus } = useKYC(user)
  const modals = useModals(onModalStateChange)

  // Константы и переводы
  const DURATION_BONUSES = getDurationBonuses(language)
  const translations = {
    en: {
      ...walletTranslations.en,
      openAccount: 'Open Investment Account',
      investmentPlans: 'Investment Plans',
      selectPlan: 'Select Your Plan',
      enterAmount: 'Enter Investment Amount',
      selectDuration: 'Select Investment Duration',
      senderWalletLabel: 'Your TRC-20 Wallet Address',
      senderWalletPlaceholder: 'Enter your TRON wallet address (TRC-20)',
      senderWalletRequired: 'Please enter your TRC-20 wallet address',
      invalidTrc20Address: 'Invalid TRC-20 address format',
      walletHint: 'Specify the wallet address from which you will send USDT',
      months: 'months',
      baseRate: 'Base Rate',
      effectiveRate: 'Effective Rate',
      cashBonus: 'Cash Bonus',
      bonusNote: 'Bonus available after half the investment period',
      openInvestment: 'Continue',
      confirmTransfer: 'I have transferred the funds',
      cancel: 'Cancel',
      minimumAmount: 'Min',
      maximumAmount: 'Max',
      investmentSuccess: 'Investment opened successfully',
      noPlans: 'No investment plans available',
      loading: 'Loading',
      planRequired: 'Please select a plan',
      amountRequired: 'Please enter amount',
      durationRequired: 'Please select duration',
      amountTooLow: 'Amount below minimum',
      amountTooHigh: 'Amount exceeds maximum',
      yourInvestments: 'Your Accounts',
      selectButton: 'Select',
      interestReturn: 'Interest Return',
      totalWithBonus: 'Total with Bonus',
      chooseDuration: 'Choose duration: 3/6/12 months',
      maxAmountReached: 'Maximum amount reached for this plan',
      transferInstructions: 'Transfer Instructions',
      transferStep1: 'Transfer the exact amount to the address below',
      transferStep2: 'Make sure you are sending from your specified TRC-20 wallet',
      transferStep3: 'After transfer, click the confirmation button',
      adminWalletLabel: 'Admin Wallet Address (TRC-20)',
      amountToTransfer: 'Amount to Transfer',
      copyAddress: 'Copy Address',
      addressCopied: 'Address Copied',
      pendingConfirmation: 'Awaiting confirmation from support',
      supportWillReview: 'Support team will review your transfer shortly',
      close: 'Close',
      step: 'Step',
      of: 'of',
      investmentDetails: 'Investment Details',
      investedAmount: 'Invested Amount',
      plan: 'Plan',
      duration: 'Duration',
      rateBonus: 'Rate Bonus',
      expectedReturn: 'Expected Return',
      totalReturn: 'Total Return',
      kycRequired: 'KYC Verification Required',
      kycRequiredMessage: 'You need to complete KYC verification before opening an investment account.',
      withdrawBonusButton: 'Withdraw Bonus',
      noBonusAvailable: 'No bonus available for this investment',
      bonusAlreadyWithdrawn: 'Bonus has already been withdrawn',
      bonusAvailableIn: 'Bonus will be available in'
    },
    ru: {
      ...walletTranslations.ru,
      openAccount: 'Открыть счёт',
      investmentPlans: 'Инвестиционные планы',
      selectPlan: 'Выберите план',
      enterAmount: 'Введите сумму инвестиций',
      selectDuration: 'Выберите срок инвестирования',
      senderWalletLabel: 'Ваш TRC-20 адрес кошелька',
      senderWalletPlaceholder: 'Введите адрес вашего TRON кошелька (TRC-20)',
      senderWalletRequired: 'Пожалуйста, введите адрес вашего TRC-20 кошелька',
      invalidTrc20Address: 'Неверный формат TRC-20 адреса',
      walletHint: 'Укажите адрес кошелька, с которого будете отправлять USDT',
      months: 'месяцев',
      baseRate: 'Базовая ставка',
      effectiveRate: 'Эффективная ставка',
      cashBonus: 'Денежный бонус',
      bonusNote: 'Бонус доступен через половину срока инвестиции',
      openInvestment: 'Продолжить',
      confirmTransfer: 'Я перевел средства',
      cancel: 'Отмена',
      minimumAmount: 'Мин',
      maximumAmount: 'Макс',
      investmentSuccess: 'Счёт успешно открыт',
      noPlans: 'Нет доступных планов',
      loading: 'Загрузка',
      planRequired: 'Выберите план',
      amountRequired: 'Введите сумму',
      durationRequired: 'Выберите срок',
      amountTooLow: 'Сумма ниже минимума',
      amountTooHigh: 'Сумма превышает максимум',
      yourInvestments: 'Ваши счета',
      selectButton: 'Выбрать',
      interestReturn: 'Доход от процентов',
      totalWithBonus: 'Итого с бонусом',
      chooseDuration: 'Выберите срок: 3/6/12 месяцев',
      maxAmountReached: 'Достигнут максимум для этого плана',
      transferInstructions: 'Инструкция по переводу',
      transferStep1: 'Переведите точную сумму на адрес ниже',
      transferStep2: 'Убедитесь, что отправляете с указанного вами TRC-20 кошелька',
      transferStep3: 'После перевода нажмите кнопку подтверждения',
      adminWalletLabel: 'Адрес кошелька администратора (TRC-20)',
      amountToTransfer: 'Сумма для перевода',
      copyAddress: 'Скопировать адрес',
      addressCopied: 'Адрес скопирован',
      pendingConfirmation: 'Ожидает подтверждения от поддержки',
      supportWillReview: 'Команда поддержки скоро проверит ваш перевод.\nОкно можно закрыть.',
      close: 'Закрыть',
      step: 'Шаг',
      of: 'из',
      investmentDetails: 'Детали инвестиции',
      investedAmount: 'Инвестированная сумма',
      plan: 'План',
      duration: 'Срок',
      rateBonus: 'Бонус за срок',
      expectedReturn: 'Ожидаемая прибыль',
      totalReturn: 'Итого к возврату',
      kycRequired: 'Требуется верификация KYC',
      kycRequiredMessage: 'Необходимо пройти верификацию KYC перед открытием инвестиционного счета.',
      withdrawBonusButton: 'Вывести бонус',
      noBonusAvailable: 'Бонус недоступен для данной инвестиции',
      bonusAlreadyWithdrawn: 'Бонус уже был выведен',
      bonusAvailableIn: 'Бонус будет доступен через'
    }
  }
  const t = translations[language]

  // Обработчики событий
  const handleOpenAccount = (plan) => {
    if (!kycChecked) {
      setError(language === 'ru' ? 'Проверка статуса верификации...' : 'Checking verification status...')
      return
    }

    if (userKYCStatus !== 'APPROVED') {
      setSelectedPlan(plan)
      modals.setShowKYCModal(true)
      return
    }

    setSelectedPlan(plan)
    modals.setShowInvestForm(true)
    modals.setShowPaymentStep(false)
    modals.setShowConfirmationStep(false)
    setError('')
    setSuccess('')
    setPendingInvestmentId(null)
    setSelectedDuration(3)
    setSenderWalletAddress('')
    setInvestAmount('')
    setMaxAmountWarning(false)
    setAdminWalletAddress('')
  }

  const handleKYCSubmitted = () => {
    modals.setShowKYCModal(false)
    refreshKYCStatus()
    setSuccess(language === 'ru' 
      ? 'Ваши документы отправлены на проверку. Вы сможете открыть инвестицию после одобрения.'
      : 'Your documents have been submitted for review. You will be able to open an investment after approval.')
  }

  const submitInvestment = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const amount = parseFloat(investAmount)

    if (!selectedPlan) {
      setError(t.planRequired)
      return
    }

    if (!amount || amount <= 0) {
      setError(t.amountRequired)
      return
    }

    if (!selectedDuration) {
      setError(t.durationRequired)
      return
    }

    if (amount < selectedPlan.minAmount) {
      setError(t.amountTooLow)
      return
    }

    if (amount > selectedPlan.maxAmount) {
      setError(t.amountTooHigh)
      return
    }

    if (!senderWalletAddress || senderWalletAddress.trim() === '') {
      setError(t.senderWalletRequired)
      return
    }

    if (!validateTRC20Address(senderWalletAddress.trim())) {
      setError(t.invalidTrc20Address)
      return
    }

    setLoading(true)

    try {
      const result = await investmentAPI.createInvestment({
        planId: selectedPlan.id,
        amount: amount,
        duration: selectedDuration,
        walletAddress: senderWalletAddress.trim(),
        paymentMethod: 'telegram',
        language: language || 'en'
      })

      const investmentId = result.data?.investmentId || result.data?.id
      const adminWallet = result.data?.adminWallet

      if (!investmentId) {
        throw new Error('Investment ID not received from server')
      }

      if (!adminWallet) {
        throw new Error('Admin wallet address not received from server')
      }

      setPendingInvestmentId(investmentId)
      setAdminWalletAddress(adminWallet)
      modals.setShowPaymentStep(true)

    } catch (error) {
      console.error('Investment error:', error)
      setError(error.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmTransfer = async () => {
    if (!pendingInvestmentId) {
      setError('Investment ID is missing')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('access_token')

      const response = await fetch(`${API_BASE_URL}/api/v1/investments/${pendingInvestmentId}/confirm-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({})
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to confirm payment')
      }

      modals.setShowPaymentStep(false)
      modals.setShowConfirmationStep(true)

    } catch (error) {
      console.error('Confirmation error:', error)
      setError(error.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    modals.closeAll()
    setInvestAmount('')
    setSelectedDuration(3)
    setSenderWalletAddress('')
    setSelectedPlan(null)
    setError('')
    setSuccess('')
    setPendingInvestmentId(null)
    setAdminWalletAddress('')
    setMaxAmountWarning(false)
    refreshInvestments()
  }

  const calculateReturns = () => {
    return calcReturns(investAmount, selectedPlan, selectedDuration, DURATION_BONUSES)
  }

  const getCurrentStep = () => {
    if (modals.showConfirmationStep) return 3
    if (modals.showPaymentStep) return 2
    return 1
  }

  // Обработчики действий с инвестициями
  const handleWithdrawClick = (investment) => {
    setSelectedInvestment(investment)
    modals.setShowWithdrawModal(true)
    setTrc20Address('')
    setWithdrawError('')
    setWithdrawSuccess('')
  }

  const handleUpgradeClick = (investment) => {
    const upgradeCheck = canUpgradeInvestment(investment, t)
    
    if (!upgradeCheck.canUpgrade) {
      setUpgradeError(upgradeCheck.reason)
      return
    }
    
    setSelectedInvestment(investment)
    modals.setShowUpgradeModal(true)
    setUpgradeError('')
    setUpgradeSuccess('')
  }

  const handlePartialWithdrawClick = (investment) => {
    const availableProfit = investment.availableProfit || 0
    const bonusAmount = investment.bonusAmount ? parseFloat(investment.bonusAmount) : 0
    const isBonusUnlocked = investment.isBonusUnlocked || 
      (investment.bonusUnlockedAt && new Date(investment.bonusUnlockedAt) <= new Date())
    const isBonusWithdrawn = investment.bonusWithdrawn
    const isEligibleForBonus = investment.duration >= 6

    const hasProfitToWithdraw = availableProfit > 0
    const hasBonusToWithdraw = bonusAmount > 0 && isEligibleForBonus && isBonusUnlocked && !isBonusWithdrawn

    if (!hasProfitToWithdraw && !hasBonusToWithdraw) {
      alert(t.noAccumulatedProfit || 'No profit or bonus available for withdrawal')
      return
    }

    setSelectedInvestment(investment)
    modals.setShowPartialWithdrawModal(true)
    setTrc20Address('')
    setWithdrawError('')
    setWithdrawSuccess('')
  }

  const handleEarlyWithdrawClick = (investment) => {
    const daysPassed = investment.daysPassed || 0
    
    if (daysPassed > 30) {
      alert(t.earlyWithdrawNotAvailable)
      return
    }

    setSelectedInvestment(investment)
    modals.setShowEarlyWithdrawModal(true)
    setTrc20Address('')
    setWithdrawError('')
    setWithdrawSuccess('')
  }

  const handleWithdrawBonusClick = (investment) => {
    
    const termBonus = getDurationBonus(
      investment.duration,
      parseFloat(investment.amount || 0)
    )
    
    const actualDaysPassed = calculateDaysPassedFromStart(investment)
    const halfTermDays = investment.duration === 6 ? 90 : investment.duration === 12 ? 180 : 0
    const isHalfTermPassed = actualDaysPassed >= halfTermDays

      investmentId: investment.id,
      duration: investment.duration,
      amount: parseFloat(investment.amount || 0),
      termBonus,
      bonusWithdrawn: investment.bonusWithdrawn,
      daysPassed: investment.daysPassed,
      actualDaysPassed,
      halfTermDays,
      isHalfTermPassed,
      createdAt: investment.createdAt,
      upgradedAt: investment.upgradedAt
    })

    if (termBonus <= 0) {
      alert(t.noBonusAvailable || 'No bonus available for this investment')
      return
    }

    if (investment.bonusWithdrawn) {
      alert(t.bonusAlreadyWithdrawn || 'Bonus has already been withdrawn')
      return
    }

    if (!isHalfTermPassed) {
      const daysLeft = halfTermDays - actualDaysPassed
      alert(
        language === 'ru' 
          ? `Бонус будет доступен через ${daysLeft} дней (необходимо ${halfTermDays} дней от начала инвестиции)` 
          : `Bonus will be available in ${daysLeft} days (${halfTermDays} days from investment start required)`
      )
      return
    }

    setSelectedInvestment(investment)
    modals.setShowWithdrawBonusModal(true)
    setTrc20Address('')
    setWithdrawError('')
    setWithdrawSuccess('')
  }

  // ✅ НОВЫЙ ОБРАБОТЧИК: Реинвестирование
  const handleReinvestClick = (investment) => {
    
    const availableProfit = investment.availableProfit || 0
    
    if (availableProfit <= 0) {
      alert(t.noAccumulatedProfit || 'No profit available for reinvestment')
      return
    }

    setSelectedInvestment(investment)
    modals.setShowReinvestModal(true)
  }

  const handleCloseActionModals = () => {
    modals.setShowWithdrawModal(false)
    modals.setShowUpgradeModal(false)
    modals.setShowEarlyWithdrawModal(false)
    modals.setShowPartialWithdrawModal(false)
    modals.setShowWithdrawBonusModal(false)
    modals.setShowReinvestModal(false)
    setSelectedInvestment(null)
    setTrc20Address('')
    setWithdrawError('')
    setWithdrawSuccess('')
    setUpgradeError('')
    setUpgradeSuccess('')
    
    refreshInvestments()
  }

  const handleSubmitWithdrawal = async (e) => {
    e.preventDefault()
    setWithdrawError('')
    setWithdrawSuccess('')

    if (!trc20Address || !validateTRC20Address(trc20Address)) {
      setWithdrawError(t.invalidAddress)
      return
    }

    setSubmitting(true)

    try {
      await investmentAPI.withdraw(selectedInvestment.id, trc20Address)
      setWithdrawSuccess(t.withdrawRequested)
      
      setTimeout(() => {
        handleCloseActionModals()
      }, 2000)

    } catch (error) {
      console.error('Withdrawal error:', error)
      setWithdrawError(error.message || t.errorOccurred)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitUpgrade = async (upgradeData) => {
    setUpgradeError('')
    setUpgradeSuccess('')

    const { upgradeType, newPackage, additionalAmount, newDuration, senderWalletAddress } = upgradeData

    if (upgradeType === 'amount') {
      if (!newPackage || !additionalAmount) {
        setUpgradeError(t.selectTargetPlan || 'Please select target plan and amount')
        return null
      }

      if (additionalAmount <= 0) {
        setUpgradeError(t.invalidAmount || 'Invalid amount')
        return null
      }

      if (!senderWalletAddress || senderWalletAddress.trim() === '') {
        setUpgradeError(t.senderWalletRequired || 'Sender wallet address is required')
        return null
      }

      if (!validateTRC20Address(senderWalletAddress.trim())) {
        setUpgradeError(t.invalidTrc20Address || 'Invalid TRC-20 address')
        return null
      }
    }

    if (upgradeType === 'duration') {
      if (!newDuration) {
        setUpgradeError(t.selectNewDuration || 'Please select new duration')
        return null
      }

      if (newDuration <= selectedInvestment.duration) {
        setUpgradeError(t.invalidDuration || 'New duration must be greater than current')
        return null
      }
    }

    setSubmitting(true)

    try {
      const requestBody = {
        upgradeType,
        paymentMethod: 'telegram'
      }

      if (upgradeType === 'amount') {
        requestBody.newPackage = newPackage
        requestBody.additionalAmount = additionalAmount
        requestBody.senderWalletAddress = senderWalletAddress.trim()
      } else if (upgradeType === 'duration') {
        requestBody.newDuration = newDuration
        requestBody.senderWalletAddress = ''
      }

      const result = await investmentAPI.upgrade(selectedInvestment.id, requestBody)
      
      setUpgradeSuccess(t.telegramBotInstructions || 'Request created successfully')
      
      return result

    } catch (error) {
      console.error('Upgrade error:', error)
      setUpgradeError(error.message || t.errorOccurred)
      return null
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitEarlyWithdraw = async (e) => {
    e.preventDefault()
    setWithdrawError('')
    setWithdrawSuccess('')

    if (!trc20Address || !validateTRC20Address(trc20Address)) {
      setWithdrawError(t.invalidAddress)
      return null
    }

    const daysPassed = selectedInvestment.daysPassed || 0
    if (daysPassed > 30) {
      setWithdrawError(t.earlyWithdrawNotAvailable)
      return null
    }

    setSubmitting(true)

    try {
      const result = await investmentAPI.earlyWithdraw(selectedInvestment.id, trc20Address)
      
      const botUsername = 'dxcapital_bot'
      const earlyWithdrawalId = result.data?.earlyWithdrawalId || result.data?.id
      const botLink = `https://t.me/${botUsername}?start=early_${earlyWithdrawalId}`
      
      setWithdrawSuccess(t.telegramBotInstructions || 'Request created successfully')
      
      return {
        success: true,
        botLink: botLink,
        withdrawalId: earlyWithdrawalId
      }

    } catch (error) {
      console.error('Early withdrawal error:', error)
      setWithdrawError(error.message || t.errorOccurred)
      return null
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitPartialWithdraw = async (e, withdrawType, customAmount) => {
      withdrawType,
      customAmount,
      selectedInvestment: selectedInvestment.id,
      availableProfit: selectedInvestment.availableProfit
    })

    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    setWithdrawError('')
    setWithdrawSuccess('')

    if (!trc20Address || !validateTRC20Address(trc20Address)) {
      setWithdrawError(t.invalidAddress || 'Invalid TRC-20 address')
      return null
    }

    if (!withdrawType || !['profit', 'bonus'].includes(withdrawType)) {
      setWithdrawError('Invalid withdrawal type')
      return null
    }

    let amountToWithdraw = 0

    if (withdrawType === 'profit') {
      
      amountToWithdraw = parseFloat(customAmount)
      
      
      if (!amountToWithdraw || amountToWithdraw <= 0) {
        console.error('❌ Invalid amount:', amountToWithdraw)
        setWithdrawError(t.invalidAmount || 'Invalid amount')
        return null
      }

      const availableProfit = selectedInvestment.availableProfit || 0
      
      if (amountToWithdraw > availableProfit) {
        console.error('❌ Insufficient profit:', { amountToWithdraw, availableProfit })
        setWithdrawError(t.insufficientProfit || 'Insufficient profit')
        return null
      }
    } else if (withdrawType === 'bonus') {
      
      const termBonus = getDurationBonus(
        selectedInvestment.duration,
        parseFloat(selectedInvestment.amount)
      )
      
      
      amountToWithdraw = termBonus

      if (termBonus <= 0) {
        console.error('❌ No bonus available')
        setWithdrawError(t.noBonusAvailable || 'No bonus available')
        return null
      }

      const isBonusUnlocked = selectedInvestment.isBonusUnlocked || 
        (selectedInvestment.bonusUnlockedAt && new Date(selectedInvestment.bonusUnlockedAt) <= new Date())
      const isBonusWithdrawn = selectedInvestment.bonusWithdrawn

      if (!isBonusUnlocked) {
        console.error('❌ Bonus not unlocked')
        setWithdrawError(t.bonusNotUnlocked || 'Bonus is not yet unlocked')
        return null
      }

      if (isBonusWithdrawn) {
        console.error('❌ Bonus already withdrawn')
        setWithdrawError(t.bonusAlreadyWithdrawn || 'Bonus already withdrawn')
        return null
      }
    }

      amount: amountToWithdraw,
      trc20Address: trc20Address.trim(),
      withdrawType: withdrawType
    })

    setSubmitting(true)

    try {
      const result = await investmentAPI.partialWithdraw(selectedInvestment.id, {
        amount: amountToWithdraw,
        trc20Address: trc20Address.trim(),
        withdrawType: withdrawType
      })

      const botUsername = 'dxcapital_bot'
      const withdrawalId = result.data?.withdrawalId || result.withdrawalId || result.data?.id
      const botLink = result.botLink || `https://t.me/${botUsername}?start=partial_${withdrawalId}`
      
      setWithdrawSuccess(t.telegramBotInstructions || 'Withdrawal request created successfully')
      
      return {
        success: true,
        botLink: botLink,
        withdrawalId: withdrawalId
      }

    } catch (error) {
      console.error('❌ Partial withdrawal error:', error)
      setWithdrawError(error.message || t.errorOccurred)
      return null
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitWithdrawBonus = async (address) => {
    try {
      
      const token = localStorage.getItem('access_token')
      if (!token) {
        alert(language === 'ru' ? 'Требуется авторизация' : 'Authorization required')
        setTimeout(() => window.location.href = '/login', 2000)
        return { success: false }
      }

      const termBonus = getDurationBonus(
        selectedInvestment.duration,
        parseFloat(selectedInvestment.amount)
      )

        duration: selectedInvestment.duration,
        amount: selectedInvestment.amount,
        termBonus
      })

      if (termBonus <= 0) {
        alert(language === 'ru' ? 'Бонус недоступен для данной инвестиции' : 'No bonus available for this investment')
        return { success: false }
      }

      const url = `${API_BASE_URL}/api/v1/investments/${selectedInvestment.id}/partial-withdraw`

      const requestBody = {
        trc20Address: address,
        withdrawType: 'bonus'
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      })


      if (response.status === 401) {
        alert(language === 'ru' ? 'Сессия истекла. Войдите заново.' : 'Session expired. Please log in again.')
        localStorage.removeItem('access_token')
        setTimeout(() => window.location.href = '/login', 2000)
        return { success: false }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()

      await refreshInvestments()

      return {
        success: true,
        data: data.data || data
      }

    } catch (error) {
      console.error('❌ Bonus withdrawal error:', error)
      alert(`${language === 'ru' ? 'Ошибка' : 'Error'}: ${error.message}`)
      return { success: false }
    }
  }

  if (plansLoading) {
    return (
      <div style={{
        textAlign: 'center',
        padding: isMobile ? '32px 20px' : '48px',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: isMobile ? '14px' : '15px'
      }}>
        {t.loading}...
      </div>
    )
  }

  return (
    <>
      <style jsx>{`
        ${getInputResetStyles()}
        ${getSpinnerKeyframes()}
        .spinner {
          animation: spin 1s linear infinite;
        }
      `}</style>

      <div>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isMobile ? '20px' : '28px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <h2 style={{
            fontSize: isMobile ? '20px' : '26px',
            fontWeight: '600',
            color: '#ffffff',
            letterSpacing: '-0.8px',
            margin: 0
          }}>
            {t.investmentPlans}
          </h2>
        </div>

        {/* Investment Plans Grid */}
        <InvestmentPlansGrid
          investmentPlans={investmentPlans}
          onPlanSelect={handleOpenAccount}
          t={t}
          isMobile={isMobile}
        />

        {/* User Investments List */}
        <InvestmentsList
          userInvestments={userInvestments}
          packages={packages}
          durationBonuses={DURATION_BONUSES}
          onWithdraw={handleWithdrawClick}
          onPartialWithdraw={handlePartialWithdrawClick}
          onEarlyWithdraw={handleEarlyWithdrawClick}
          onWithdrawBonus={handleWithdrawBonusClick}
          onReinvest={handleReinvestClick} // ✅ ДОБАВЛЕНО
          t={t}
          isMobile={isMobile}
        />

        {/* Success Message */}
        {success && (
          <div style={alertStyle('success', isMobile)}>
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={alertStyle('error', isMobile)}>
            {error}
          </div>
        )}

        {/* Investment Form Modal */}
        {modals.showInvestForm && selectedPlan && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }} onClick={(e) => {
            if (modals.showConfirmationStep) {
              handleCloseModal()
            }
          }}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '32px',
              padding: isMobile ? '28px 20px' : '36px 32px',
              maxWidth: isMobile ? '500px' : '900px',
              width: '100%',
              maxHeight: '95vh',
              overflowY: 'auto',
              position: 'relative'
            }} onClick={(e) => e.stopPropagation()}>
              
              {/* Modal Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <div style={{
                  fontSize: isMobile ? '11px' : '12px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  letterSpacing: '-0.3px'
                }}>
                  {t.step} {getCurrentStep()} {t.of} 3
                </div>

                <button
                  onClick={handleCloseModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '24px',
                    cursor: 'pointer',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.color = '#ffffff'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'none'
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              {modals.showConfirmationStep ? (
                <ConfirmationStep
                  selectedPlan={selectedPlan}
                  investAmount={investAmount}
                  selectedDuration={selectedDuration}
                  returns={calculateReturns()}
                  onClose={handleCloseModal}
                  t={t}
                  isMobile={isMobile}
                />
              ) : modals.showPaymentStep ? (
                <PaymentStep
                  adminWalletAddress={adminWalletAddress}
                  investAmount={investAmount}
                  selectedPlan={selectedPlan}
                  selectedDuration={selectedDuration}
                  onConfirm={handleConfirmTransfer}
                  onCancel={handleCloseModal}
                  loading={loading}
                  error={error}
                  success={success}
                  t={t}
                  isMobile={isMobile}
                />
              ) : (
                <>
                  <h2 style={{
                    fontSize: isMobile ? '20px' : '24px',
                    fontWeight: '600',
                    color: '#ffffff',
                    marginBottom: '8px',
                    letterSpacing: '-0.8px'
                  }}>
                    {selectedPlan.name}
                  </h2>

                  <div style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: isMobile ? '12px' : '13px',
                    marginBottom: '24px',
                    letterSpacing: '-0.3px'
                  }}>
                    {t.baseRate}: {selectedPlan.roi}%
                  </div>

                  <InvestForm
                    selectedPlan={selectedPlan}
                    selectedDuration={selectedDuration}
                    setSelectedDuration={setSelectedDuration}
                    investAmount={investAmount}
                    setInvestAmount={setInvestAmount}
                    senderWalletAddress={senderWalletAddress}
                    setSenderWalletAddress={setSenderWalletAddress}
                    onSubmit={submitInvestment}
                    onCancel={handleCloseModal}
                    calculateReturns={calculateReturns}
                    DURATION_BONUSES={DURATION_BONUSES}
                    loading={loading}
                    error={error}
                    maxAmountWarning={maxAmountWarning}
                    setMaxAmountWarning={setMaxAmountWarning}
                    setError={setError}
                    t={t}
                    isMobile={isMobile}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* Action Modals */}
        {modals.showWithdrawModal && selectedInvestment && (
          <WithdrawModal
            investment={selectedInvestment}
            onClose={handleCloseActionModals}
            onSubmit={handleSubmitWithdrawal}
            trc20Address={trc20Address}
            setTrc20Address={setTrc20Address}
            error={withdrawError}
            success={withdrawSuccess}
            submitting={submitting}
            durationBonuses={DURATION_BONUSES}
            t={t}
            isMobile={isMobile}
          />
        )}

        {modals.showUpgradeModal && selectedInvestment && (
          <UpgradeModal
            investment={selectedInvestment}
            onClose={handleCloseActionModals}
            onSubmit={handleSubmitUpgrade}
            error={upgradeError}
            success={upgradeSuccess}
            submitting={submitting}
            packages={packages}
            t={t}
            isMobile={isMobile}
          />
        )}

        {modals.showEarlyWithdrawModal && selectedInvestment && (
          <EarlyWithdrawModal
            investment={selectedInvestment}
            onClose={handleCloseActionModals}
            onSubmit={handleSubmitEarlyWithdraw}
            trc20Address={trc20Address}
            setTrc20Address={setTrc20Address}
            error={withdrawError}
            success={withdrawSuccess}
            submitting={submitting}
            packages={packages}
            t={t}
            isMobile={isMobile}
          />
        )}

        {modals.showPartialWithdrawModal && selectedInvestment && (
          <PartialWithdrawModal
            investment={selectedInvestment}
            onClose={handleCloseActionModals}
            onSubmit={handleSubmitPartialWithdraw}
            trc20Address={trc20Address}
            setTrc20Address={setTrc20Address}
            error={withdrawError}
            success={withdrawSuccess}
            submitting={submitting}
            packages={packages}
            t={t}
            isMobile={isMobile}
          />
        )}

        {modals.showWithdrawBonusModal && selectedInvestment && (
          <WithdrawBonusModal
            investment={selectedInvestment}
            onClose={handleCloseActionModals}
            onSubmit={handleSubmitWithdrawBonus}
            trc20Address={trc20Address}
            setTrc20Address={setTrc20Address}
            error={withdrawError}
            success={withdrawSuccess}
            submitting={submitting}
            durationBonuses={DURATION_BONUSES}
            t={t}
            isMobile={isMobile}
          />
        )}

        {/* ✅ НОВАЯ МОДАЛКА: Реинвестирование */}
        {modals.showReinvestModal && selectedInvestment && (
          <ReinvestModal
            investment={selectedInvestment}
            onClose={handleCloseActionModals}
            onSuccess={refreshInvestments}
            t={t}
            isMobile={isMobile}
            language={language}
          />
        )}

        {/* KYC Modal */}
        <KYCModal 
          isOpen={modals.showKYCModal}
          onClose={() => modals.setShowKYCModal(false)}
          userEmail={user?.email}
          userName={user?.name || user?.username}
          currentStatus={userKYCStatus}
          onKYCSubmitted={handleKYCSubmitted}
          language={language}
        />
      </div>
    </>
  )
}