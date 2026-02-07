import { useState, useEffect } from 'react'

export const useModals = (onModalStateChange) => {
  const [showInvestForm, setShowInvestForm] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showEarlyWithdrawModal, setShowEarlyWithdrawModal] = useState(false)
  const [showPartialWithdrawModal, setShowPartialWithdrawModal] = useState(false)
  const [showWithdrawBonusModal, setShowWithdrawBonusModal] = useState(false)
  const [showReinvestModal, setShowReinvestModal] = useState(false)
  const [showKYCModal, setShowKYCModal] = useState(false)
  const [showPaymentStep, setShowPaymentStep] = useState(false)
  const [showConfirmationStep, setShowConfirmationStep] = useState(false)

  const hasModal = showInvestForm || showKYCModal || showPaymentStep || 
                   showConfirmationStep || showWithdrawModal || showUpgradeModal || 
                   showEarlyWithdrawModal || showPartialWithdrawModal || showWithdrawBonusModal ||
                   showReinvestModal

  useEffect(() => {
    if (onModalStateChange) {
      onModalStateChange(hasModal)
    }
  }, [hasModal, onModalStateChange])

  const closeAll = () => {
    setShowInvestForm(false)
    setShowWithdrawModal(false)
    setShowUpgradeModal(false)
    setShowEarlyWithdrawModal(false)
    setShowPartialWithdrawModal(false)
    setShowWithdrawBonusModal(false)
    setShowReinvestModal(false)
    setShowKYCModal(false)
    setShowPaymentStep(false)
    setShowConfirmationStep(false)
  }

  return {
    showInvestForm,
    setShowInvestForm,
    showWithdrawModal,
    setShowWithdrawModal,
    showUpgradeModal,
    setShowUpgradeModal,
    showEarlyWithdrawModal,
    setShowEarlyWithdrawModal,
    showPartialWithdrawModal,
    setShowPartialWithdrawModal,
    showWithdrawBonusModal,
    setShowWithdrawBonusModal,
    showReinvestModal,
    setShowReinvestModal,
    showKYCModal,
    setShowKYCModal,
    showPaymentStep,
    setShowPaymentStep,
    showConfirmationStep,
    setShowConfirmationStep,
    closeAll
  }
}
