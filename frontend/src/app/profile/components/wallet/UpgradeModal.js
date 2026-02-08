// frontend/src/components/wallet/UpgradeModal.jsx

import React, { useState, useEffect } from 'react';

// 🆕 Функция для вычисления следующей даты активации (15-е или 30-е число)
const getNextActivationDate = (currentDate = new Date()) => {
  const day = currentDate.getDate();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  let activationDate;

  if (day < 15) {
    // До 15-го → активация 15-го текущего месяца
    activationDate = new Date(year, month, 15, 0, 0, 0, 0);
  } else if (day < 30) {
    // С 15-го до 30-го → активация 30-го текущего месяца (или последний день месяца)
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    activationDate = new Date(year, month, Math.min(30, lastDayOfMonth), 0, 0, 0, 0);
  } else {
    // После 30-го → активация 15-го следующего месяца
    activationDate = new Date(year, month + 1, 15, 0, 0, 0, 0);
  }

  return activationDate;
};

// 🆕 Функция для вычисления количества дней до активации
const getDaysUntilActivation = (activationDate) => {
  const now = new Date();
  const diff = activationDate - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const UpgradeModal = ({ 
  investment, 
  onClose, 
  onSubmit, 
  error, 
  success, 
  submitting,
  packages,
  t,
  isMobile 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [upgradeId, setUpgradeId] = useState(null);
  const [submittedAmount, setSubmittedAmount] = useState(0);
  const [submittedPackage, setSubmittedPackage] = useState('');
  const [adminWalletAddress, setAdminWalletAddress] = useState('');
  const [senderWalletAddressStored, setSenderWalletAddressStored] = useState('');
  
  const [upgradeType, setUpgradeType] = useState('amount');
  
  const [upgradeAmount, setUpgradeAmount] = useState('');
  const [selectedTargetPackage, setSelectedTargetPackage] = useState('');
  const [senderWalletAddress, setSenderWalletAddress] = useState('');
  
  const [selectedDuration, setSelectedDuration] = useState('');
  
  const [durationUpgradeSuccess, setDurationUpgradeSuccess] = useState(false);

  // 🆕 Состояние для даты активации
  const [activationDate, setActivationDate] = useState(null);
  const [daysUntilActivation, setDaysUntilActivation] = useState(0);

  // Early return if no investment
  if (!investment) return null;

  // 🔧 IMPORTANT: Declare these BEFORE useEffect that depends on them
  const currentAmount = parseFloat(investment.amount || 0);
  const currentDuration = investment.duration || 3;
  const currentPackageName = investment.planName;

  useEffect(() => {
    setCurrentStep(1);
    setDurationUpgradeSuccess(false);
  }, [upgradeType]);

  // 🆕 Вычисление даты активации при изменении выбранного пакета или длительности
  useEffect(() => {
    // Для апгрейда плана (amount upgrade)
    if (selectedTargetPackage && selectedTargetPackage !== investment?.planName) {
      const nextActivation = getNextActivationDate();
      setActivationDate(nextActivation);
      setDaysUntilActivation(getDaysUntilActivation(nextActivation));
    } 
    // Для апгрейда длительности (duration upgrade)
    else if (selectedDuration && parseInt(selectedDuration) !== currentDuration) {
      const nextActivation = getNextActivationDate();
      setActivationDate(nextActivation);
      setDaysUntilActivation(getDaysUntilActivation(nextActivation));
    }
    else {
      setActivationDate(null);
      setDaysUntilActivation(0);
    }
  }, [selectedTargetPackage, investment?.planName, selectedDuration, currentDuration]);

  const allPackages = [
    { name: 'Starter', baseROI: 14, min: 100, max: 999 },
    { name: 'Advanced', baseROI: 17, min: 1000, max: 2999 },
    { name: 'Pro', baseROI: 20, min: 3000, max: 5999 },
    { name: 'Elite', baseROI: 22, min: 6000, max: 100000 }
  ];

  const ABSOLUTE_MAX_AMOUNT = 100000;

  const currentPackageIndex = allPackages.findIndex(pkg => pkg.name === currentPackageName);
  const availablePackages = allPackages.filter((_, index) => index > currentPackageIndex);

  const hasBonusAccess = (amount) => {
    return amount >= 1000;
  };

  const getDurationBonuses = (amount) => {
    const hasAccess = hasBonusAccess(amount);
    return {
      3: { bonus: 0, cashBonus: 0 },
      6: { bonus: 1.5, cashBonus: hasAccess ? 200 : 0 },
      12: { bonus: 3, cashBonus: hasAccess ? 500 : 0 }
    };
  };

  const durationBonuses = getDurationBonuses(currentAmount);

  const allDurations = [
    { 
      months: 3, 
      bonus: 0
    },
    { 
      months: 6, 
      bonus: 1.5
    },
    { 
      months: 12, 
      bonus: 3
    }
  ];

  const currentDurationIndex = allDurations.findIndex(d => d.months === currentDuration);
  const availableDurations = allDurations.filter((_, index) => index > currentDurationIndex);

  const getPackageBaseROI = (packageName) => {
    const pkg = allPackages.find(p => p.name === packageName);
    return pkg ? pkg.baseROI : 14;
  };

  const currentBaseROI = getPackageBaseROI(currentPackageName);
  const currentBonusROI = durationBonuses[currentDuration]?.bonus || 0;
  const currentEffectiveROI = currentBaseROI + currentBonusROI;

  const getPackageForAmount = (totalAmount) => {
    if (totalAmount > ABSOLUTE_MAX_AMOUNT) {
      return null;
    }
    
    for (let i = allPackages.length - 1; i >= 0; i--) {
      if (totalAmount >= allPackages[i].min && totalAmount <= allPackages[i].max) {
        return allPackages[i];
      }
    }
    return null;
  };

  const handleUpgradeAmountChange = (value) => {
    const additionalAmount = parseFloat(value) || 0;
    const newTotalAmount = currentAmount + additionalAmount;

    if (newTotalAmount > ABSOLUTE_MAX_AMOUNT) {
      const maxAdditional = ABSOLUTE_MAX_AMOUNT - currentAmount;
      setUpgradeAmount(maxAdditional > 0 ? maxAdditional.toFixed(2) : '0');
      
      const targetPkg = getPackageForAmount(ABSOLUTE_MAX_AMOUNT);
      if (targetPkg && targetPkg.name !== currentPackageName) {
        setSelectedTargetPackage(targetPkg.name);
      }
      return;
    }

    setUpgradeAmount(value);

    if (additionalAmount > 0) {
      const targetPkg = getPackageForAmount(newTotalAmount);
      
      if (targetPkg) {
        const targetIndex = allPackages.findIndex(p => p.name === targetPkg.name);
        if (targetIndex > currentPackageIndex) {
          setSelectedTargetPackage(targetPkg.name);
        } else if (targetIndex === currentPackageIndex) {
          setSelectedTargetPackage('');
        }
      }
    } else {
      setSelectedTargetPackage('');
    }
  };

  const getMinimumAdditionalAmount = () => {
    if (!selectedTargetPackage) return 0;
    const targetPkg = allPackages.find(pkg => pkg.name === selectedTargetPackage);
    if (!targetPkg) return 0;
    return Math.max(0, targetPkg.min - currentAmount);
  };

  const getMaximumAdditionalAmount = () => {
    return Math.max(0, ABSOLUTE_MAX_AMOUNT - currentAmount);
  };

  const minimumAdditionalAmount = getMinimumAdditionalAmount();
  const maximumAdditionalAmount = getMaximumAdditionalAmount();

  const calculateAmountUpgrade = () => {
    if (!selectedTargetPackage || !upgradeAmount) return null;

    const additionalAmount = parseFloat(upgradeAmount);
    if (isNaN(additionalAmount) || additionalAmount <= 0) return null;

    const newTotalAmount = currentAmount + additionalAmount;
    
    if (newTotalAmount > ABSOLUTE_MAX_AMOUNT) return null;

    const newBaseROI = getPackageBaseROI(selectedTargetPackage);
    const newEffectiveROI = newBaseROI + currentBonusROI;
    
    // 🆕 Проверка, является ли это реальным апгрейдом плана
    const isRealUpgrade = selectedTargetPackage !== currentPackageName;

    return {
      newTotalAmount,
      newBaseROI,
      newEffectiveROI,
      roiIncrease: newEffectiveROI - currentEffectiveROI,
      isRealUpgrade
    };
  };

  const calculateDurationUpgrade = () => {
    if (!selectedDuration) return null;

    const newDuration = parseInt(selectedDuration);
    const newBonusROI = allDurations.find(d => d.months === newDuration)?.bonus || 0;
    const newEffectiveROI = currentBaseROI + newBonusROI;

    return {
      newDuration,
      newBonusROI,
      newEffectiveROI,
      roiIncrease: newEffectiveROI - currentEffectiveROI,
      additionalMonths: newDuration - currentDuration
    };
  };

  const amountUpgradeCalc = upgradeType === 'amount' ? calculateAmountUpgrade() : null;
  const durationUpgradeCalc = upgradeType === 'duration' ? calculateDurationUpgrade() : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (upgradeType === 'amount') {
      if (!selectedTargetPackage || !upgradeAmount || !senderWalletAddress) {
        return;
      }

      const additionalAmount = parseFloat(upgradeAmount);
      if (additionalAmount < minimumAdditionalAmount) {
        return;
      }

      const newTotalAmount = currentAmount + additionalAmount;
      if (newTotalAmount > ABSOLUTE_MAX_AMOUNT) {
        return;
      }

      const result = await onSubmit({
        upgradeType: 'amount',
        newPackage: selectedTargetPackage,
        additionalAmount: additionalAmount,
        senderWalletAddress: senderWalletAddress.trim()
      });


      if (result && result.success) {
        setSubmittedAmount(additionalAmount);
        setSubmittedPackage(selectedTargetPackage);
        setSenderWalletAddressStored(senderWalletAddress.trim());
        
        const upgradeIdValue = result.data?.upgradeId || result.upgradeId || result.id || null;
        const adminWalletValue = result.data?.adminWallet || result.adminWallet || '';
        const senderWalletValue = result.data?.senderWallet || result.senderWallet || senderWalletAddress.trim();

        setUpgradeId(upgradeIdValue);
        setAdminWalletAddress(adminWalletValue);
        
        if (!adminWalletValue) {
          console.error('❌ CRITICAL: adminWallet not found in response!');
          console.error('   Full response.data:', result.data);
          console.error('   Checking alternative paths...');
          
          if (result.adminWalletAddress) {
            setAdminWalletAddress(result.adminWalletAddress);
          } else if (result.data?.adminWalletAddress) {
            setAdminWalletAddress(result.data.adminWalletAddress);
          } else {
            alert('Error: Admin wallet address not received from server. Please contact support.');
            return;
          }
        }
        
        setCurrentStep(2);
      }
    } else {
      if (!selectedDuration) {
        return;
      }

      const result = await onSubmit({
        upgradeType: 'duration',
        newDuration: parseInt(selectedDuration),
        senderWalletAddress: 'T' + 'x'.repeat(33)
      });

      if (result && result.success) {
        setDurationUpgradeSuccess(true);
      }
    }
  };

  const handleConfirmTransfer = async () => {
    if (!upgradeId) {
      console.error('❌ No upgradeId available for notification');
      alert('Error: Upgrade ID not found. Please try again.');
      return;
    }

    if (!adminWalletAddress) {
      console.error('❌ No adminWalletAddress available');
      alert('Error: Admin wallet address not available. Please contact support.');
      return;
    }


    const token = localStorage.getItem('access_token');
    
    if (!token) {
      console.error('❌ No token found in localStorage');
      alert('Authentication error. Please login again.');
      return;
    }


    try {
      const url = `/api/v1/investments/upgrade/${upgradeId}/confirm-payment`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });


      if (response.ok) {
        const data = await response.json();
        
        setCurrentStep(3);
      } else {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        if (response.status === 401) {
          alert('Session expired. Please login again.');
          window.location.href = '/login';
          return;
        } else if (response.status === 404) {
          alert('Upgrade not found. Please refresh the page and try again.');
        } else {
          alert(`Error: ${errorText || 'Failed to confirm payment'}`);
        }
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(adminWalletAddress);
      
      const button = document.querySelector('[data-copy-button]');
      if (button) {
        const originalText = button.textContent;
        button.textContent = t.copied || 'Copied!';
        button.style.background = 'rgba(16, 185, 129, 0.25)';
        button.style.borderColor = 'rgba(16, 185, 129, 0.5)';
        button.style.color = '#10b981';
        
        setTimeout(() => {
          button.textContent = originalText;
          button.style.background = 'rgba(45, 212, 191, 0.15)';
          button.style.borderColor = 'rgba(45, 212, 191, 0.3)';
          button.style.color = '#2dd4bf';
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy address:', err);
      alert('Failed to copy address. Please copy manually.');
    }
  };

  const handleCloseDurationSuccess = () => {
    onClose();
    window.location.reload();
  };

  const handleCloseAmountSuccess = () => {
    onClose();
    window.location.reload();
  };

  const canUpgradeByAmount = maximumAdditionalAmount > 0;

  return (
    <div 
      style={{
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
        zIndex: 10000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>

      <div 
        style={{
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '32px',
          padding: isMobile ? '28px 20px' : '36px 32px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {!durationUpgradeSuccess && currentStep !== 3 && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        )}

        {durationUpgradeSuccess ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px',
              color: '#000000'
            }}>
              ✓
            </div>

            <h2 style={{
              fontSize: isMobile ? '22px' : '26px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '12px'
            }}>
              {t.upgradeSuccessful || 'Upgrade Successful!'}
            </h2>

            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '28px',
              lineHeight: '1.6'
            }}>
              {t.durationUpgradeSuccessMessage || 'Your investment duration has been successfully upgraded. The changes have been applied immediately.'}
            </p>

            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '28px',
              textAlign: 'left'
            }}>
              {durationUpgradeCalc && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                      {t.newDuration || 'New Duration'}:
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>
                      {durationUpgradeCalc.newDuration} {t.months || 'months'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                      {t.newAPY || 'New APY'}:
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>
                      {durationUpgradeCalc.newEffectiveROI}% (+{durationUpgradeCalc.roiIncrease.toFixed(1)}%)
                    </span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleCloseDurationSuccess}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                borderRadius: '16px',
                color: '#000000',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {t.close || 'Close'}
            </button>
          </div>
        ) : currentStep === 3 && upgradeType === 'amount' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(45, 212, 191, 0.15)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #2dd4bf',
                borderTop: '4px solid transparent',
                borderRadius: '50%'
              }} className="spinner"></div>
            </div>

            <h2 style={{
              fontSize: isMobile ? '22px' : '26px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '12px'
            }}>
              {t.pendingConfirmation || 'Awaiting confirmation from support'}
            </h2>

            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '28px',
              lineHeight: '1.6'
            }}>
              {t.supportWillReview || 'Support team will review your transfer shortly'}
            </p>

            <div style={{
              background: 'rgba(45, 212, 191, 0.1)',
              border: '1px solid rgba(45, 212, 191, 0.3)',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '28px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {t.additionalAmount || 'Additional Amount'}:
                </span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#2dd4bf' }}>
                  ${submittedAmount.toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {t.newPackage || 'New Package'}:
                </span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#2dd4bf' }}>
                  {submittedPackage}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {t.newTotalAmount || 'New Total Amount'}:
                </span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#2dd4bf' }}>
                  ${(currentAmount + submittedAmount).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCloseAmountSuccess}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                border: 'none',
                borderRadius: '16px',
                color: '#000000',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {t.close || 'Close'}
            </button>
          </div>
        ) : currentStep === 2 && upgradeType === 'amount' ? (
          <div>
            <h2 style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '8px'
            }}>
              {t.transferInstructions || 'Transfer Instructions'}
            </h2>

            <div style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: isMobile ? '12px' : '13px',
              marginBottom: '24px'
            }}>
              {t.upgradePayment || 'Upgrade Payment'}
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: isMobile ? '16px' : '20px',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: isMobile ? '11px' : '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '4px'
              }}>
                {t.amountToTransfer || 'Amount to Transfer'}
              </div>
              <div style={{
                fontSize: isMobile ? '24px' : '28px',
                fontWeight: '600',
                color: '#2dd4bf',
                marginBottom: '16px'
              }}>
                ${submittedAmount.toFixed(2)}
              </div>

              <div style={{
                fontSize: isMobile ? '11px' : '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '8px'
              }}>
                {t.adminWalletLabel || 'Admin Wallet Address (TRC-20)'}
              </div>

              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}>
                <div style={{
                  flex: 1,
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: isMobile ? '10px 12px' : '12px 14px',
                  color: '#ffffff',
                  fontSize: isMobile ? '11px' : '12px',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all'
                }}>
                  {adminWalletAddress || 'Loading...'}
                </div>

                <button
                  data-copy-button
                  onClick={handleCopyAddress}
                  disabled={!adminWalletAddress}
                  style={{
                    padding: isMobile ? '10px 14px' : '12px 16px',
                    background: adminWalletAddress ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${adminWalletAddress ? 'rgba(45, 212, 191, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '12px',
                    color: adminWalletAddress ? '#2dd4bf' : 'rgba(255, 255, 255, 0.3)',
                    fontSize: isMobile ? '11px' : '12px',
                    fontWeight: '600',
                    cursor: adminWalletAddress ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t.copyAddress || 'Copy'}
                </button>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: isMobile ? '14px 16px' : '16px 20px',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: isMobile ? '12px' : '13px',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.6'
              }}>
                <div style={{ marginBottom: '8px' }}>1. {t.transferStep1 || 'Transfer the exact amount to the address above'}</div>
                <div style={{ marginBottom: '8px' }}>2. {t.transferStep2 || 'Make sure you are sending from your specified TRC-20 wallet'}</div>
                <div>3. {t.transferStep3 || 'After transfer, click the confirmation button'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={handleConfirmTransfer}
                disabled={submitting || !adminWalletAddress}
                style={{
                  flex: 1,
                  minWidth: '120px',
                  padding: isMobile ? '12px' : '14px',
                  background: (submitting || !adminWalletAddress)
                    ? 'rgba(45, 212, 191, 0.3)' 
                    : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                  border: 'none',
                  borderRadius: '16px',
                  color: (submitting || !adminWalletAddress) ? 'rgba(0, 0, 0, 0.5)' : '#000000',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '600',
                  cursor: (submitting || !adminWalletAddress) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {submitting ? (t.processing || 'Processing...') : (t.confirmTransfer || 'I have transferred the funds')}
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: isMobile ? '12px 20px' : '14px 24px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {t.cancel || 'Cancel'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '24px'
            }}>
              {t.upgradeInvestment || 'Upgrade Investment'}
            </h2>

            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
                {t.currentInvestment || 'Current Investment'}
              </div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                {currentPackageName} • ${currentAmount.toFixed(2)}
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                {currentEffectiveROI}% APY • {currentDuration} {currentDuration === 1 ? 'month' : t.months || 'months'}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#ffffff', 
                marginBottom: '12px' 
              }}>
                {t.upgradeType || 'Upgrade Type'}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setUpgradeType('amount')}
                  disabled={!canUpgradeByAmount}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: upgradeType === 'amount' 
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: upgradeType === 'amount'
                      ? 'none'
                      : '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    color: upgradeType === 'amount' ? '#000000' : 'rgba(255, 255, 255, 0.6)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: canUpgradeByAmount ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s',
                    opacity: canUpgradeByAmount ? 1 : 0.5
                  }}
                >
                  {t.upgradeByAmount || 'Upgrade by Amount'}
                </button>
                <button
                  type="button"
                  onClick={() => setUpgradeType('duration')}
                  disabled={availableDurations.length === 0}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: upgradeType === 'duration' 
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: upgradeType === 'duration'
                      ? 'none'
                      : '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    color: upgradeType === 'duration' ? '#000000' : 'rgba(255, 255, 255, 0.6)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: availableDurations.length === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s',
                    opacity: availableDurations.length === 0 ? 0.5 : 1
                  }}
                >
                  {t.upgradeByDuration || 'Upgrade by Duration'}
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {upgradeType === 'amount' && (
                <>
                  {!canUpgradeByAmount ? (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      marginBottom: '16px',
                      color: '#ef4444',
                      fontSize: '13px',
                      textAlign: 'center'
                    }}>
                      {t.reachedMaxAmount || `Maximum investment amount reached ($${ABSOLUTE_MAX_AMOUNT.toLocaleString()})`}
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ 
                          display: 'block', 
                          color: 'rgba(255, 255, 255, 0.7)', 
                          fontSize: '13px', 
                          marginBottom: '12px' 
                        }}>
                          {t.selectTargetPlan || 'Select Target Plan'}
                        </label>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {allPackages.map((pkg, index) => {
                            const isPast = index < currentPackageIndex;
                            const isCurrent = index === currentPackageIndex;
                            const isFuture = index > currentPackageIndex;
                            const isSelected = selectedTargetPackage === pkg.name;

                            return (
                              <div
                                key={pkg.name}
                                onClick={() => {
                                  if (isFuture) {
                                    setSelectedTargetPackage(pkg.name);
                                    setUpgradeAmount('');
                                  }
                                }}
                                style={{
                                  padding: '14px 18px',
                                  background: isSelected 
                                    ? 'rgba(16, 185, 129, 0.15)'
                                    : isPast 
                                    ? 'rgba(255, 255, 255, 0.03)'
                                    : isCurrent
                                    ? 'rgba(45, 212, 191, 0.08)'
                                    : 'rgba(255, 255, 255, 0.05)',
                                  border: isSelected
                                    ? '2px solid #10b981'
                                    : isPast
                                    ? '1px solid rgba(255, 255, 255, 0.05)'
                                    : isCurrent
                                    ? '1px solid rgba(45, 212, 191, 0.3)'
                                    : '1px solid rgba(255, 255, 255, 0.15)',
                                  borderRadius: '12px',
                                  cursor: isFuture ? 'pointer' : 'not-allowed',
                                  opacity: isPast ? 0.4 : 1,
                                  transition: 'all 0.3s',
                                  position: 'relative'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                    <div style={{ 
                                      fontSize: '15px', 
                                      fontWeight: '600', 
                                      color: isPast 
                                        ? 'rgba(255, 255, 255, 0.3)' 
                                        : isCurrent 
                                        ? '#2dd4bf' 
                                        : '#ffffff',
                                      marginBottom: '4px',
                                      textDecoration: isPast ? 'line-through' : 'none'
                                    }}>
                                      {pkg.name}
                                      {isCurrent && (
                                        <span style={{
                                          marginLeft: '8px',
                                          fontSize: '11px',
                                          padding: '2px 8px',
                                          background: 'rgba(45, 212, 191, 0.2)',
                                          borderRadius: '6px',
                                          color: '#2dd4bf'
                                        }}>
                                          {t.current || 'Current'}
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ 
                                      fontSize: '12px', 
                                      color: isPast 
                                        ? 'rgba(255, 255, 255, 0.2)' 
                                        : 'rgba(255, 255, 255, 0.6)' 
                                    }}>
                                      ${pkg.min.toLocaleString()} - ${pkg.max.toLocaleString()} • {pkg.baseROI + currentBonusROI}% APY
                                    </div>
                                  </div>
                                  
                                  {isSelected && (
                                    <div style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      background: '#10b981',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '12px',
                                      color: '#000000',
                                      fontWeight: 'bold'
                                    }}>
                                      ✓
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {selectedTargetPackage && minimumAdditionalAmount > 0 && (
                        <div style={{
                          background: 'rgba(45, 212, 191, 0.1)',
                          border: '1px solid rgba(45, 212, 191, 0.3)',
                          borderRadius: '12px',
                          padding: '10px 14px',
                          marginBottom: '16px',
                          fontSize: '12px',
                          color: 'rgba(255, 255, 255, 0.8)'
                        }}>
                          {t.minimumAddInfo || 'Minimum additional amount required'}: 
                          <span style={{ 
                            color: '#2dd4bf', 
                            fontWeight: '600',
                            marginLeft: '6px'
                          }}>
                            ${minimumAdditionalAmount.toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ 
                          display: 'block', 
                          color: 'rgba(255, 255, 255, 0.7)', 
                          fontSize: '13px', 
                          marginBottom: '8px' 
                        }}>
                          {t.additionalAmount || 'Additional Amount'}
                        </label>
                        <input
                          type="number"
                          value={upgradeAmount}
                          onChange={(e) => handleUpgradeAmountChange(e.target.value)}
                          placeholder={minimumAdditionalAmount > 0 ? `Min: ${minimumAdditionalAmount.toFixed(2)}` : '0.00'}
                          step="0.01"
                          min={minimumAdditionalAmount}
                          max={maximumAdditionalAmount}
                          required
                          disabled={submitting}
                          style={{
                            width: '100%',
                            padding: '14px 18px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '16px',
                            color: '#ffffff',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box',
                            MozAppearance: 'textfield',
                            WebkitAppearance: 'none',
                            appearance: 'none'
                          }}
                        />
                        <style>
                          {`
                            input[type=number]::-webkit-inner-spin-button,
                            input[type=number]::-webkit-outer-spin-button {
                              -webkit-appearance: none;
                              margin: 0;
                            }
                          `}
                        </style>
                        {upgradeAmount && parseFloat(upgradeAmount) < minimumAdditionalAmount && (
                          <div style={{
                            fontSize: '11px',
                            color: '#ef4444',
                            marginTop: '6px'
                          }}>
                            {t.amountTooLow || 'Amount must be at least'} ${minimumAdditionalAmount.toFixed(2)}
                          </div>
                        )}
                        {upgradeAmount && (currentAmount + parseFloat(upgradeAmount)) > ABSOLUTE_MAX_AMOUNT && (
                          <div style={{
                            fontSize: '11px',
                            color: '#ef4444',
                            marginTop: '6px'
                          }}>
                            {t.exceedsMaxLimit || 'Exceeds maximum investment limit'}
                          </div>
                        )}
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ 
                          display: 'block', 
                          color: 'rgba(255, 255, 255, 0.7)', 
                          fontSize: '13px', 
                          marginBottom: '8px' 
                        }}>
                          {t.senderWalletAddress || 'Your TRC-20 Wallet Address'}
                        </label>
                        <input
                          type="text"
                          value={senderWalletAddress}
                          onChange={(e) => setSenderWalletAddress(e.target.value)}
                          placeholder="T..."
                          required
                          disabled={submitting}
                          style={{
                            width: '100%',
                            padding: '14px 18px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '16px',
                            color: '#ffffff',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box',
                            fontFamily: 'monospace'
                          }}
                        />
                      </div>

                      {/* 🆕 ACTIVATION DATE BANNER */}
                      {amountUpgradeCalc && amountUpgradeCalc.isRealUpgrade && activationDate && (
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(251, 191, 36, 0.15) 100%)',
                          border: '1px solid rgba(245, 158, 11, 0.4)',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          marginBottom: '16px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
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
                              {t.newROIActivation || 'New ROI Activation Schedule'}
                            </div>
                          </div>
                          
                          <div style={{
                            fontSize: '12px',
                            color: 'rgba(245, 158, 11, 0.9)',
                            lineHeight: '1.6'
                          }}>
                            <div style={{ marginBottom: '6px' }}>
                              <strong>{t.currentROI || 'Current ROI'}:</strong> {currentEffectiveROI}% APY ({t.activeUntil || 'active until'} {activationDate.toLocaleDateString('ru-RU')})
                            </div>
                            <div style={{ marginBottom: '6px' }}>
                              <strong>{t.newROI || 'New ROI'}:</strong> {amountUpgradeCalc.newEffectiveROI}% APY
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              marginTop: '8px',
                              padding: '6px 10px',
                              background: 'rgba(245, 158, 11, 0.15)',
                              borderRadius: '8px'
                            }}>
                              <span style={{ fontSize: '16px' }}>📅</span>
                              <span style={{ fontWeight: '600', color: '#f59e0b' }}>
                                {t.activatesOn || 'New rate activates on'}: {activationDate.toLocaleDateString('ru-RU')}
                              </span>
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              marginTop: '6px',
                              padding: '6px 10px',
                              background: 'rgba(245, 158, 11, 0.15)',
                              borderRadius: '8px'
                            }}>
                              <span style={{ fontSize: '16px' }}>⏰</span>
                              <span style={{ fontWeight: '600', color: '#f59e0b' }}>
                                {daysUntilActivation === 0 
                                  ? (t.activatingToday || '🎉 Activating today!')
                                  : `${daysUntilActivation} ${t.daysUntilNewROI || 'days until new ROI'}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {amountUpgradeCalc && (
                        <div style={{
                          background: 'rgba(45, 212, 191, 0.1)',
                          border: '1px solid rgba(45, 212, 191, 0.3)',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          marginBottom: '16px',
                          fontSize: '13px'
                        }}>
                          <div style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px' }}>
                            {t.afterUpgrade || 'After Upgrade'}:
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{t.totalAmount || 'Total Amount'}:</span>
                            <span style={{ color: '#2dd4bf', fontWeight: '600' }}>${amountUpgradeCalc.newTotalAmount.toFixed(2)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{t.newAPY || 'New APY'}:</span>
                            <span style={{ color: '#10b981', fontWeight: '600' }}>
                              {amountUpgradeCalc.newEffectiveROI}% 
                              {amountUpgradeCalc.roiIncrease > 0 && ` (+${amountUpgradeCalc.roiIncrease.toFixed(1)}%)`}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {upgradeType === 'duration' && (
                <>
                  {availableDurations.length === 0 ? (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      marginBottom: '16px',
                      color: '#ef4444',
                      fontSize: '13px',
                      textAlign: 'center'
                    }}>
                      {t.alreadyMaxDuration || 'Already at maximum duration'}
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ 
                          display: 'block', 
                          color: 'rgba(255, 255, 255, 0.7)', 
                          fontSize: '13px', 
                          marginBottom: '12px' 
                        }}>
                          {t.selectNewDuration || 'Select New Duration'}
                        </label>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {allDurations.map((duration, index) => {
                            const isPast = index < currentDurationIndex;
                            const isCurrent = index === currentDurationIndex;
                            const isFuture = index > currentDurationIndex;
                            const isSelected = selectedDuration === duration.months.toString();

                            return (
                              <div
                                key={duration.months}
                                onClick={() => {
                                  if (isFuture) {
                                    setSelectedDuration(duration.months.toString());
                                  }
                                }}
                                style={{
                                  padding: '14px 18px',
                                  background: isSelected 
                                    ? 'rgba(16, 185, 129, 0.15)'
                                    : isPast 
                                    ? 'rgba(255, 255, 255, 0.03)'
                                    : isCurrent
                                    ? 'rgba(45, 212, 191, 0.08)'
                                    : 'rgba(255, 255, 255, 0.05)',
                                  border: isSelected
                                    ? '2px solid #10b981'
                                    : isPast
                                    ? '1px solid rgba(255, 255, 255, 0.05)'
                                    : isCurrent
                                    ? '1px solid rgba(45, 212, 191, 0.3)'
                                    : '1px solid rgba(255, 255, 255, 0.15)',
                                  borderRadius: '12px',
                                  cursor: isFuture ? 'pointer' : 'not-allowed',
                                  opacity: isPast ? 0.4 : 1,
                                  transition: 'all 0.3s',
                                  position: 'relative'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                    <div style={{ 
                                      fontSize: '15px', 
                                      fontWeight: '600', 
                                      color: isPast 
                                        ? 'rgba(255, 255, 255, 0.3)' 
                                        : isCurrent 
                                        ? '#2dd4bf' 
                                        : '#ffffff',
                                      marginBottom: '4px',
                                      textDecoration: isPast ? 'line-through' : 'none'
                                    }}>
                                      {duration.months} {duration.months === 1 ? 'month' : (t.months || 'months')}
                                      {isCurrent && (
                                        <span style={{
                                          marginLeft: '8px',
                                          fontSize: '11px',
                                          padding: '2px 8px',
                                          background: 'rgba(45, 212, 191, 0.2)',
                                          borderRadius: '6px',
                                          color: '#2dd4bf'
                                        }}>
                                          {t.current || 'Current'}
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ 
                                      fontSize: '12px', 
                                      color: isPast 
                                        ? 'rgba(255, 255, 255, 0.2)' 
                                        : 'rgba(255, 255, 255, 0.6)' 
                                    }}>
                                      {duration.bonus > 0 ? `+${duration.bonus}% APY` : 'No bonus'}
                                    </div>
                                  </div>
                                  
                                  {isSelected && (
                                    <div style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      background: '#10b981',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '12px',
                                      color: '#000000',
                                      fontWeight: 'bold'
                                    }}>
                                      ✓
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 🆕 ACTIVATION DATE BANNER FOR DURATION UPGRADE */}
                      {activationDate && selectedDuration && (
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(251, 191, 36, 0.15) 100%)',
                          border: '1px solid rgba(245, 158, 11, 0.4)',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          marginBottom: '16px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
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
                              {t.newROIActivation || 'New ROI Activation Schedule'}
                            </div>
                          </div>
                          
                          <div style={{
                            fontSize: '12px',
                            color: 'rgba(245, 158, 11, 0.9)',
                            lineHeight: '1.6'
                          }}>
                            {durationUpgradeCalc && (
                              <>
                                <div style={{ marginBottom: '6px' }}>
                                  <strong>{t.currentROI || 'Current ROI'}:</strong> {currentEffectiveROI}% APY ({t.activeUntil || 'active until'} {activationDate.toLocaleDateString('ru-RU')})
                                </div>
                                <div style={{ marginBottom: '6px' }}>
                                  <strong>{t.newROI || 'New ROI'}:</strong> {durationUpgradeCalc.newEffectiveROI}% APY
                                </div>
                              </>
                            )}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              marginTop: '8px',
                              padding: '6px 10px',
                              background: 'rgba(245, 158, 11, 0.15)',
                              borderRadius: '8px'
                            }}>
                              <span style={{ fontSize: '16px' }}>📅</span>
                              <span style={{ fontWeight: '600', color: '#f59e0b' }}>
                                {t.activatesOn || 'New rate activates on'}: {activationDate.toLocaleDateString('ru-RU')}
                              </span>
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              marginTop: '6px',
                              padding: '6px 10px',
                              background: 'rgba(245, 158, 11, 0.15)',
                              borderRadius: '8px'
                            }}>
                              <span style={{ fontSize: '16px' }}>⏰</span>
                              <span style={{ fontWeight: '600', color: '#f59e0b' }}>
                                {daysUntilActivation === 0 
                                  ? (t.activatingToday || '🎉 Activating today!')
                                  : `${daysUntilActivation} ${t.daysUntilNewROI || 'days until new ROI'}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {durationUpgradeCalc && (
                        <div style={{
                          background: 'rgba(45, 212, 191, 0.1)',
                          border: '1px solid rgba(45, 212, 191, 0.3)',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          marginBottom: '16px',
                          fontSize: '13px'
                        }}>
                          <div style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px' }}>
                            {t.afterUpgrade || 'After Upgrade'}:
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{t.newDuration || 'New Duration'}:</span>
                            <span style={{ color: '#2dd4bf', fontWeight: '600' }}>
                              {durationUpgradeCalc.newDuration} {t.months || 'months'} (+{durationUpgradeCalc.additionalMonths} {t.months || 'months'})
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{t.newAPY || 'New APY'}:</span>
                            <span style={{ color: '#10b981', fontWeight: '600' }}>
                              {durationUpgradeCalc.newEffectiveROI}% (+{durationUpgradeCalc.roiIncrease.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  color: '#ef4444',
                  fontSize: '12px'
                }}>
                  {error}
                </div>
              )}

              {success && !durationUpgradeSuccess && currentStep === 1 && (
                <div style={{
                  background: 'rgba(45, 212, 191, 0.15)',
                  border: '1px solid rgba(45, 212, 191, 0.3)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  color: '#2dd4bf',
                  fontSize: '12px'
                }}>
                  {success}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  disabled={
                    submitting || 
                    (upgradeType === 'amount' && (
                      !canUpgradeByAmount ||
                      !selectedTargetPackage || 
                      !upgradeAmount || 
                      !senderWalletAddress || 
                      parseFloat(upgradeAmount) < minimumAdditionalAmount ||
                      (currentAmount + parseFloat(upgradeAmount)) > ABSOLUTE_MAX_AMOUNT
                    )) ||
                    (upgradeType === 'duration' && (!selectedDuration || availableDurations.length === 0))
                  }
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: (
                      submitting || 
                      (upgradeType === 'amount' && (
                        !canUpgradeByAmount ||
                        !selectedTargetPackage || 
                        !upgradeAmount || 
                        !senderWalletAddress ||
                        parseFloat(upgradeAmount) < minimumAdditionalAmount ||
                        (currentAmount + parseFloat(upgradeAmount)) > ABSOLUTE_MAX_AMOUNT
                      )) ||
                      (upgradeType === 'duration' && (!selectedDuration || availableDurations.length === 0))
                    ) 
                      ? 'rgba(16, 185, 129, 0.3)' 
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    borderRadius: '16px',
                    color: (
                      submitting || 
                      (upgradeType === 'amount' && (
                        !canUpgradeByAmount ||
                        !selectedTargetPackage || 
                        !upgradeAmount || 
                        !senderWalletAddress ||
                        parseFloat(upgradeAmount) < minimumAdditionalAmount ||
                        (currentAmount + parseFloat(upgradeAmount)) > ABSOLUTE_MAX_AMOUNT
                      )) ||
                      (upgradeType === 'duration' && (!selectedDuration || availableDurations.length === 0))
                    ) 
                      ? 'rgba(0, 0, 0, 0.5)' 
                      : '#000000',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: (
                      submitting || 
                      (upgradeType === 'amount' && (
                        !canUpgradeByAmount ||
                        !selectedTargetPackage || 
                        !upgradeAmount || 
                        !senderWalletAddress ||
                        parseFloat(upgradeAmount) < minimumAdditionalAmount ||
                        (currentAmount + parseFloat(upgradeAmount)) > ABSOLUTE_MAX_AMOUNT
                      )) ||
                      (upgradeType === 'duration' && (!selectedDuration || availableDurations.length === 0))
                    ) 
                      ? 'not-allowed' 
                      : 'pointer'
                  }}
                >
                  {submitting ? (t.processing || 'Processing...') : (t.confirmUpgrade || 'Confirm Upgrade')}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  style={{
                    padding: '14px 24px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {t.cancel || 'Cancel'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default UpgradeModal;
