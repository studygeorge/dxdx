import { t } from '../localization'

/**
 * Построение форматированных сообщений
 */

export function buildInvestmentMessage(data: any, lang: string): string {
  const showBonus = data.amount >= 500

  const durationBonusText = !showBonus
    ? t(lang, 'baseRateNoBonus')
    : data.duration === 6
    ? t(lang, 'bonus6months')
    : data.duration === 12
    ? t(lang, 'bonus12months')
    : t(lang, 'baseRateNoBonus')

  const baseROI = data.roi || 0
  const durationBonus = showBonus ? (data.durationBonus || 0) : 0
  const effectiveROI = baseROI + durationBonus
  const bonusAmount = showBonus ? (data.bonusAmount || 0) : 0

  return `
${t(lang, 'investmentTitle')}

${t(lang, 'plan')}: ${data.planName}
${t(lang, 'amount')}: ${data.amount} USDT (TRC-20)
${t(lang, 'term')}: ${data.duration} ${t(lang, 'months')}
${t(lang, 'baseRate')}: ${baseROI}% ${t(lang, 'perMonth')}

${showBonus ? `${t(lang, 'termBonus')}\n${durationBonusText}` : ''}
${t(lang, 'finalRate')}: ${effectiveROI}% ${t(lang, 'perMonth')}

${t(lang, 'expectedProfit')}
${t(lang, 'interestProfit')}: $${data.expectedReturn}
${bonusAmount > 0 ? `${t(lang, 'cashBonus')}: $${bonusAmount}` : ''}
${t(lang, 'totalReceive')}${data.totalReturn}</b>

${t(lang, 'sendUSDT')}

<code>${data.adminWallet}</code>

${t(lang, 'yourSenderAddress')}
<code>${data.senderWallet}</code>

${t(lang, 'important')}
${t(lang, 'useOnlyTron')}
${t(lang, 'sendExactAmount')}: ${data.amount} USDT
${t(lang, 'sendFromAddress')}: ${data.senderWallet}
${bonusAmount > 0 ? t(lang, 'cashBonusInfo').replace('$', `$${bonusAmount}`) : ''}
${t(lang, 'afterSendingPress')}
  `.trim()
}

export function buildUpgradeMessage(data: any, lang: string): string {
  return `
${t(lang, 'upgradeTitle')}

${t(lang, 'planChange')}
${t(lang, 'current')}: ${data.oldPackage} (${data.oldAPY}%)
${t(lang, 'newPlan')}: <b>${data.newPackage} (${data.newAPY}%)</b>

${t(lang, 'finances')}
${t(lang, 'currentAmount')}: $${data.oldAmount}
${t(lang, 'topUp')}: <b>+$${data.additionalAmount} USDT</b>
${t(lang, 'newAmount')}: <b>$${data.totalAmount}</b>

${t(lang, 'sendUSDT')}

<code>${data.adminWallet}</code>

${t(lang, 'yourSenderAddress')}
<code>${data.senderWallet}</code>

${t(lang, 'important')}
${t(lang, 'useOnlyTron')}
${t(lang, 'sendExactAmount')}: <b>${data.additionalAmount} USDT</b>
${t(lang, 'sendFromAddress')}: ${data.senderWallet}
${t(lang, 'afterSendingPress')}
  `.trim()
}

export function buildEarlyWithdrawalMessage(data: any, lang: string): string {
  const penaltyText = t(lang, 'penaltyDescription')
    .replace('%amount%', data.earnedInterest.toFixed(2))
    .replace('%minus%', data.withdrawnProfits > 0 ? t(lang, 'minusProfits') : '')
  
  const calcFormula = data.withdrawnProfits > 0 
    ? t(lang, 'calculationFormula')
        .replace('%invested%', data.investmentAmount.toFixed(2))
        .replace('%withdrawn%', data.withdrawnProfits.toFixed(2))
        .replace('%total%', data.totalAmount.toFixed(2))
    : ''

  return `
${t(lang, 'earlyWithdrawalTitle')}

${t(lang, 'plan')}: <b>${data.planName}</b>
${t(lang, 'invested')}: $${data.investmentAmount.toFixed(2)}

${t(lang, 'calculation')}
${t(lang, 'daysInvested')}: ${data.daysInvested} / 30
${data.withdrawnProfits > 0 ? `${t(lang, 'alreadyWithdrawnProfit')}: $${data.withdrawnProfits.toFixed(2)}` : ''}
<b>${t(lang, 'withdrawAmount')}: $${data.totalAmount.toFixed(2)}</b>

${t(lang, 'trc20Address')}
<code>${data.trc20Address}</code>

${t(lang, 'penaltyWarning')}
${penaltyText}

${calcFormula}

${t(lang, 'pressButtonToConfirm')}
  `.trim()
}

export function buildPartialWithdrawalMessage(data: any, lang: string): string {
  return `
${t(lang, 'partialWithdrawalTitle')}

${t(lang, 'plan')}: <b>${data.planName}</b>
${t(lang, 'invested')}: $${data.investmentAmount.toFixed(2)}

${t(lang, 'calculation')}
<b>${t(lang, 'profitWithdrawal')}: $${data.amount.toFixed(2)}</b>
${t(lang, 'totalWithdrawnProfits')}: $${data.totalWithdrawn.toFixed(2)}

${t(lang, 'trc20Address')}
<code>${data.trc20Address}</code>

${t(lang, 'principalRemains')}

${t(lang, 'pressButtonToConfirm')}
  `.trim()
}

export function buildReferralBonusMessage(data: any, lang: string): string {
  return `
${t(lang, 'referralBonusTitle')}

${t(lang, 'referralInfo')}
${t(lang, 'referralEmail')}: <b>${data.referralEmail}</b>
${t(lang, 'investmentDate')}: ${new Date(data.investmentDate).toLocaleDateString('ru-RU')}
${t(lang, 'commission')}: ${data.commissionRate}%

<b>${t(lang, 'bonusAmount')}: $${data.amount.toFixed(2)}</b>

${t(lang, 'trc20Address')}
<code>${data.trc20Address}</code>

${t(lang, 'pressButtonToConfirm')}
  `.trim()
}
