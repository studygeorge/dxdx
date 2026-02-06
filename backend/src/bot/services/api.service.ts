import axios from 'axios'
import { API_BASE_URL } from '../config'
import type {
  InvestmentData,
  UpgradeData,
  EarlyWithdrawalData,
  PartialWithdrawalData,
  ReferralBonusData
} from '../types'

/**
 * Сервис для взаимодействия с API
 */

export async function fetchInvestment(investmentId: string) {
  const response = await axios.get(
    `${API_BASE_URL}/api/v1/telegram/investment/${investmentId}`
  )
  return response.data.data as InvestmentData
}

export async function fetchUpgrade(upgradeId: string) {
  const response = await axios.get(
    `${API_BASE_URL}/api/v1/telegram/upgrade/${upgradeId}`
  )
  return response.data.data as UpgradeData
}

export async function fetchEarlyWithdrawal(withdrawalId: string) {
  const response = await axios.get(
    `${API_BASE_URL}/api/v1/telegram/early-withdrawal/${withdrawalId}`
  )
  return response.data.data as EarlyWithdrawalData
}

export async function fetchPartialWithdrawal(withdrawalId: string) {
  const response = await axios.get(
    `${API_BASE_URL}/api/v1/telegram/partial-withdrawal/${withdrawalId}`
  )
  return response.data.data as PartialWithdrawalData
}

export async function fetchReferralBonusWithdrawal(withdrawalId: string) {
  const response = await axios.get(
    `${API_BASE_URL}/api/v1/telegram/referral-bonus-withdrawal/${withdrawalId}`
  )
  return response.data as ReferralBonusData
}

export async function approveInvestment(investmentId: string, supportUserId: string) {
  return axios.post(
    `${API_BASE_URL}/api/v1/telegram/investment/${investmentId}/approve`,
    { supportUserId }
  )
}

export async function rejectInvestment(investmentId: string) {
  return axios.delete(
    `${API_BASE_URL}/api/v1/telegram/investment/${investmentId}`
  )
}

export async function approveUpgrade(upgradeId: string, supportUserId: string) {
  return axios.post(
    `${API_BASE_URL}/api/v1/telegram/upgrade/${upgradeId}/approve`,
    { supportUserId }
  )
}

export async function rejectUpgrade(upgradeId: string, supportUserId: string) {
  return axios.post(
    `${API_BASE_URL}/api/v1/telegram/upgrade/${upgradeId}/reject`,
    { supportUserId }
  )
}

export async function approveEarlyWithdrawal(withdrawalId: string, supportUserId: string) {
  return axios.post(
    `${API_BASE_URL}/api/v1/telegram/early-withdrawal/${withdrawalId}/approve`,
    { supportUserId }
  )
}

export async function rejectEarlyWithdrawal(withdrawalId: string, supportUserId: string) {
  return axios.post(
    `${API_BASE_URL}/api/v1/telegram/early-withdrawal/${withdrawalId}/reject`,
    { supportUserId, reason: 'Отклонено администратором' }
  )
}

export async function approvePartialWithdrawal(withdrawalId: string, supportUserId: string) {
  return axios.post(
    `${API_BASE_URL}/api/v1/telegram/partial-withdrawal/${withdrawalId}/approve`,
    { supportUserId }
  )
}

export async function rejectPartialWithdrawal(withdrawalId: string, supportUserId: string) {
  return axios.post(
    `${API_BASE_URL}/api/v1/telegram/partial-withdrawal/${withdrawalId}/reject`,
    { supportUserId, reason: 'Отклонено администратором' }
  )
}

export async function approveFullWithdrawal(withdrawalId: string, supportUserId: string) {
  return axios.post(
    `${API_BASE_URL}/api/v1/telegram/withdrawal/${withdrawalId}/approve`,
    { supportUserId }
  )
}

export async function rejectFullWithdrawal(withdrawalId: string, supportUserId: string) {
  return axios.post(
    `${API_BASE_URL}/api/v1/telegram/withdrawal/${withdrawalId}/reject`,
    { supportUserId, reason: 'Отклонено администратором' }
  )
}

export async function approveReferralBonus(withdrawalId: string) {
  return axios.post(
    `${API_BASE_URL}/api/v1/referrals/withdraw-bonus/${withdrawalId}/approve`,
    {},
    { headers: { 'Content-Type': 'application/json' } }
  )
}

export async function rejectReferralBonus(withdrawalId: string) {
  return axios.post(
    `${API_BASE_URL}/api/v1/referrals/withdraw-bonus/${withdrawalId}/reject`,
    { reason: 'Отклонено администратором' },
    { headers: { 'Content-Type': 'application/json' } }
  )
}

export async function checkTelegramLink(chatId: string) {
  const token = process.env.API_TOKEN
  if (!token) {
    throw new Error('API_TOKEN is not configured')
  }

  const response = await fetch('https://dxcapital-ai.com/api/telegram/check-link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ chatId })
  })

  if (!response.ok) {
    throw new Error(`API response error: ${response.status}`)
  }

  return response.json()
}
