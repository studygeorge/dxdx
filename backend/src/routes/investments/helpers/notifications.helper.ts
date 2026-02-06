import { notifyEarlyWithdrawal, notifyPartialWithdrawal, notifyUpgradeRequest } from '../../../bot/telegram-bot'

export async function sendInvestmentPaymentNotification(
  bot: any,
  adminChatId: string,
  investment: any,
  investmentId: string,
  adminWallet: string
) {
  const lang = investment.language || 'ru'

  const translations = {
    en: {
      title: '<b>NEW PAYMENT FOR VERIFICATION</b>',
      userInfo: '<b>User Info:</b>',
      investmentInfo: '<b>Investment Info:</b>',
      plan: 'Plan',
      amount: 'Amount',
      adminWallet: '<b>Admin wallet:</b>',
      senderWallet: '<b>Sender wallet:</b>',
      requestDate: '<b>Request date:</b>',
      checkFunds: 'Check if funds received in wallet and approve or decline the request:',
      buttonApprove: 'Approve',
      buttonReject: 'Reject'
    },
    ru: {
      title: '<b>НОВАЯ ОПЛАТА НА ПРОВЕРКУ</b>',
      userInfo: '<b>Информация о пользователе:</b>',
      investmentInfo: '<b>Информация об инвестиции:</b>',
      plan: 'План',
      amount: 'Сумма',
      adminWallet: '<b>Кошелёк админа:</b>',
      senderWallet: '<b>Кошелёк отправителя:</b>',
      requestDate: '<b>Дата заявки:</b>',
      checkFunds: 'Проверьте поступление средств на кошелёк и подтвердите или отклоните заявку:',
      buttonApprove: 'Подтвердить',
      buttonReject: 'Отклонить'
    }
  }

  const t = translations[lang as 'en' | 'ru'] || translations.ru

  const currentTime = new Date().toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  const supportMessage = `
${t.title}

${t.userInfo}
User ID: <code>${investment.userId}</code>
Email: <code>${investment.user.email || 'N/A'}</code>

${t.investmentInfo}
Investment ID: <code>${investmentId}</code>
${t.plan}: ${investment.plan.name}
${t.amount}: <b>${Number(investment.amount).toFixed(2)} USDT (TRC-20)</b>

${t.adminWallet}
<code>${adminWallet}</code>

${t.senderWallet}
<code>${investment.userWalletAddress}</code>

${t.requestDate} ${currentTime}

${t.checkFunds}
  `.trim()

  await bot.sendMessage(adminChatId, supportMessage, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: t.buttonApprove, callback_data: `approve_${investmentId}_0` },
          { text: t.buttonReject, callback_data: `reject_${investmentId}_0` }
        ]
      ]
    }
  })
}

export { notifyEarlyWithdrawal, notifyPartialWithdrawal, notifyUpgradeRequest }
