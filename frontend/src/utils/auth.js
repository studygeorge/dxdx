// dxcapai-app/src/utils/auth.js

const API_BASE_URL = 'https://dxcapital-ai.com'

/**
 * Обновление access токена используя refresh токен
 */
export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token')
  
  if (!refreshToken) {
    console.error('❌ No refresh token available')
    return null
  }

  try {
    console.log('🔄 Refreshing access token...')
    
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    const result = await response.json()
    
    if (!result.success || !result.data) {
      throw new Error('Invalid refresh response')
    }

    const { accessToken, refreshToken: newRefreshToken } = result.data
    
    // Сохраняем новые токены
    localStorage.setItem('access_token', accessToken)
    if (newRefreshToken) {
      localStorage.setItem('refresh_token', newRefreshToken)
    }

    console.log('✅ Access token refreshed successfully')
    return accessToken
  } catch (error) {
    console.error('❌ Error refreshing token:', error)
    
    // Если refresh token тоже истек - очищаем все и редиректим на логин
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('wallet_address')
    
    // Редирект на главную
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
    
    return null
  }
}

/**
 * Обертка для fetch с автоматическим обновлением токена
 * Использовать вместо обычного fetch для всех authenticated запросов
 */
export async function authenticatedFetch(url, options = {}) {
  const token = localStorage.getItem('access_token')
  
  // Добавляем токен в заголовки
  const authOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  }

  let response = await fetch(url, authOptions)

  // Если получили 401 - пробуем обновить токен
  if (response.status === 401) {
    console.log('🔐 Token expired (401), attempting refresh...')
    
    const newToken = await refreshAccessToken()
    
    if (newToken) {
      // Повторяем запрос с новым токеном
      authOptions.headers['Authorization'] = `Bearer ${newToken}`
      response = await fetch(url, authOptions)
      console.log('✅ Request retried with new token')
    } else {
      // Если не удалось обновить токен - пользователь будет перенаправлен на логин
      throw new Error('Authentication failed - redirecting to login')
    }
  }

  return response
}

/**
 * Проверка валидности токена (декодирование JWT)
 */
export function isTokenValid() {
  const token = localStorage.getItem('access_token')
  if (!token) return false

  try {
    // Декодируем JWT (base64)
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expirationTime = payload.exp * 1000 // конвертируем в миллисекунды
    const currentTime = Date.now()
    
    // Проверяем, истекает ли токен в ближайшие 5 минут
    const isValid = expirationTime > currentTime + (5 * 60 * 1000)
    
    if (!isValid) {
      console.log('⚠️ Token is expiring soon or already expired')
    }
    
    return isValid
  } catch (error) {
    console.error('❌ Error validating token:', error)
    return false
  }
}

/**
 * Проактивное обновление токена (вызывать при загрузке страницы)
 */
export async function ensureValidToken() {
  if (!isTokenValid()) {
    console.log('⚡ Token is expiring soon, refreshing proactively...')
    await refreshAccessToken()
  } else {
    console.log('✅ Token is still valid')
  }
}

/**
 * Logout с очисткой всех токенов
 */
export async function logout() {
  try {
    const token = localStorage.getItem('access_token')
    const refreshToken = localStorage.getItem('refresh_token')
    
    if (token) {
      // Уведомляем бэкенд о logout
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
      })
    }
  } catch (error) {
    console.error('❌ Logout error:', error)
  } finally {
    // Очищаем все данные
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('wallet_address')
    
    // Редирект на главную
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }
}
