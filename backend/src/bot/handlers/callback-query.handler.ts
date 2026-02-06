import type { CallbackQuery } from 'node-telegram-bot-api'
import { bot } from '../core'
import { sessionManager } from '../core'
import { t } from '../localization'
import {
  handleAuthCallback,
  autoLoginByTelegramId
} from '../telegram-botauthinfo'
import { showWelcomeAfterLanguageSelection } from './start-command.handler'
import {
  handleInvestmentConfirm,
  handleInvestmentCancel,
  handleInvestmentApprove,
  handleInvestmentReject,
  handleUpgradeConfirm,
  handleUpgradeCancel,
  handleUpgradeApprove,
  handleUpgradeReject,
  handleEarlyWithdrawalConfirm,
  handleEarlyWithdrawalCancel,
  handleEarlyWithdrawalApprove,
  handleEarlyWithdrawalReject,
  handlePartialWithdrawalConfirm,
  handlePartialWithdrawalCancel,
  handlePartialWithdrawalApprove,
  handlePartialWithdrawalReject,
  handleFullWithdrawalApprove,
  handleFullWithdrawalReject,
  handleReferralBonusConfirm,
  handleReferralBonusCancel,
  handleReferralBonusApprove,
  handleReferralBonusReject
} from './index'

/**
 * Обработка callback_query (нажатия на inline кнопки)
 */

export async function handleCallbackQuery(query: CallbackQuery) {
  if (!query.message || !query.data) return

  const chatId = query.message.chat.id
  const messageId = query.message.message_id
  const data = query.data

  console.log('Callback query:', data, 'from user:', chatId)

  // Обработка выбора языка
  if (data === 'set_lang_en' || data === 'set_lang_ru') {
    const selectedLanguage = await handleAuthCallback(bot, query)
    
    if (selectedLanguage) {
      console.log(`Language selected: ${selectedLanguage}, showing welcome message`)
      await showWelcomeAfterLanguageSelection(chatId, selectedLanguage)
    }
    return
  }

  // Обработка auth_login
  if (data === 'auth_login') {
    console.log(`Processing auth_login for user: ${chatId}`)
    const session = sessionManager.get(chatId)
    const userLanguage = session?.language || 'ru'
    
    await autoLoginByTelegramId(bot, chatId, chatId.toString(), userLanguage as 'en' | 'ru')
    bot.answerCallbackQuery(query.id).catch(() => {})
    return
  }

  // Обработка других auth_ коллбеков
  if (data.startsWith('auth_')) {
    await handleAuthCallback(bot, query)
    return
  }

  const session = sessionManager.get(chatId)
  const lang = session?.language || 'en'

  // ========== INVESTMENT HANDLERS ==========

  if (data.startsWith('confirm_') && !data.includes('upgrade') && !data.includes('early') && !data.includes('partial') && !data.includes('referral_bonus')) {
    const investmentId = data.replace('confirm_', '')
    await handleInvestmentConfirm(chatId, messageId, investmentId)
  }

  else if (data.startsWith('cancel_') && !data.includes('upgrade') && !data.includes('early') && !data.includes('partial') && !data.includes('referral_bonus')) {
    const investmentId = data.replace('cancel_', '')
    await handleInvestmentCancel(chatId, messageId, investmentId)
  }

  else if (data.startsWith('approve_') && !data.includes('withdrawal') && !data.includes('upgrade') && !data.includes('early') && !data.includes('partial') && !data.includes('kyc') && !data.includes('referral_bonus')) {
    const parts = data.replace('approve_', '').split('_')
    const investmentId = parts[0]
    const userId = parts[1]
    await handleInvestmentApprove(chatId, messageId, investmentId, userId)
  }

  else if (data.startsWith('reject_') && !data.includes('withdrawal') && !data.includes('upgrade') && !data.includes('early') && !data.includes('partial') && !data.includes('kyc') && !data.includes('referral_bonus')) {
    const parts = data.replace('reject_', '').split('_')
    const investmentId = parts[0]
    const userId = parts[1]
    await handleInvestmentReject(chatId, messageId, investmentId, userId)
  }

  // ========== UPGRADE HANDLERS ==========

  else if (data.startsWith('confirm_upgrade_')) {
    const upgradeId = data.replace('confirm_upgrade_', '')
    await handleUpgradeConfirm(chatId, messageId, upgradeId)
  }

  else if (data.startsWith('cancel_upgrade_')) {
    const upgradeId = data.replace('cancel_upgrade_', '')
    await handleUpgradeCancel(chatId, messageId, upgradeId)
  }

  else if (data.startsWith('approve_upgrade_')) {
    const parts = data.replace('approve_upgrade_', '').split('_')
    const upgradeId = parts[0]
    const userId = parts[1]
    await handleUpgradeApprove(chatId, messageId, upgradeId, userId)
  }

  else if (data.startsWith('reject_upgrade_')) {
    const parts = data.replace('reject_upgrade_', '').split('_')
    const upgradeId = parts[0]
    const userId = parts[1]
    await handleUpgradeReject(chatId, messageId, upgradeId, userId)
  }

  // ========== EARLY WITHDRAWAL HANDLERS ==========

  else if (data.startsWith('confirm_early_')) {
    const withdrawalId = data.replace('confirm_early_', '')
    await handleEarlyWithdrawalConfirm(chatId, messageId, withdrawalId)
  }

  else if (data.startsWith('cancel_early_')) {
    const withdrawalId = data.replace('cancel_early_', '')
    await handleEarlyWithdrawalCancel(chatId, messageId, withdrawalId)
  }

  else if (data.startsWith('approve_early_withdrawal_')) {
    const withdrawalId = data.replace('approve_early_withdrawal_', '')
    await handleEarlyWithdrawalApprove(chatId, messageId, withdrawalId)
  }

  else if (data.startsWith('reject_early_withdrawal_')) {
    const withdrawalId = data.replace('reject_early_withdrawal_', '')
    await handleEarlyWithdrawalReject(chatId, messageId, withdrawalId)
  }

  // ========== PARTIAL WITHDRAWAL HANDLERS ==========

  else if (data.startsWith('confirm_partial_')) {
    const withdrawalId = data.replace('confirm_partial_', '')
    await handlePartialWithdrawalConfirm(chatId, messageId, withdrawalId)
  }

  else if (data.startsWith('cancel_partial_')) {
    const withdrawalId = data.replace('cancel_partial_', '')
    await handlePartialWithdrawalCancel(chatId, messageId, withdrawalId)
  }

  else if (data.startsWith('approve_partial_withdrawal_')) {
    const withdrawalId = data.replace('approve_partial_withdrawal_', '')
    await handlePartialWithdrawalApprove(chatId, messageId, withdrawalId)
  }

  else if (data.startsWith('reject_partial_withdrawal_')) {
    const withdrawalId = data.replace('reject_partial_withdrawal_', '')
    await handlePartialWithdrawalReject(chatId, messageId, withdrawalId)
  }

  // ========== FULL WITHDRAWAL HANDLERS ==========

  else if (data.startsWith('approve_withdrawal_')) {
    const withdrawalId = data.replace('approve_withdrawal_', '')
    await handleFullWithdrawalApprove(chatId, messageId, withdrawalId)
  }

  else if (data.startsWith('reject_withdrawal_')) {
    const withdrawalId = data.replace('reject_withdrawal_', '')
    await handleFullWithdrawalReject(chatId, messageId, withdrawalId)
  }

  // ========== REFERRAL BONUS WITHDRAWAL HANDLERS ==========

  else if (data.startsWith('confirm_referral_bonus_')) {
    const withdrawalId = data.replace('confirm_referral_bonus_', '')
    await handleReferralBonusConfirm(chatId, messageId, withdrawalId)
  }

  else if (data.startsWith('cancel_referral_bonus_')) {
    const withdrawalId = data.replace('cancel_referral_bonus_', '')
    await handleReferralBonusCancel(chatId, messageId, withdrawalId)
  }

  else if (data.startsWith('rba_')) {
    const shortId = data.replace('rba_', '')
    await handleReferralBonusApprove(chatId, messageId, shortId, query)
  }

  else if (data.startsWith('rbr_')) {
    const shortId = data.replace('rbr_', '')
    await handleReferralBonusReject(chatId, messageId, shortId, query)
  }

  bot.answerCallbackQuery(query.id).catch(() => {})
}
