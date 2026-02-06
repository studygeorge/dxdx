'use client'
import { useState, useEffect } from 'react'

const API_BASE_URL = 'https://dxcapital-ai.com'

export default function InvestmentTesting({ isMobile }) {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [investments, setInvestments] = useState([])
  const [selectedInvestment, setSelectedInvestment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionLog, setActionLog] = useState([])
  const [stakingPlans, setStakingPlans] = useState([])

  // Поиск пользователей
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  useEffect(() => {
    fetchStakingPlans()
  }, [])

  const fetchStakingPlans = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/settings/staking-plans/public`)
      if (response.ok) {
        const data = await response.json()
        setStakingPlans(data.data || [])
        console.log('📦 Staking plans loaded:', data.data)
      }
    } catch (error) {
      console.error('Failed to fetch staking plans:', error)
    }
  }

  const searchUsers = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    const token = localStorage.getItem('admin_access_token')

    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '10',
        search: searchQuery
      })

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.data.users || [])
      }
    } catch (error) {
      console.error('Failed to search users:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectUser = async (user) => {
    setSelectedUser(user)
    setSearchResults([])
    setSearchQuery('')
    await fetchUserInvestments(user.id)
  }

  const fetchUserInvestments = async (userId) => {
    setLoading(true)
    const token = localStorage.getItem('admin_access_token')

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/investments/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        console.log('📊 Investments data:', data)
        setInvestments(data.data || [])
      } else {
        console.error('Failed to fetch investments:', response.status)
        addToLog(`❌ Ошибка загрузки инвестиций: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to fetch investments:', error)
      addToLog(`❌ Ошибка загрузки инвестиций`)
    } finally {
      setLoading(false)
    }
  }

  // ✅ СИМУЛЯЦИЯ ВРЕМЕНИ (обновлено)
  const simulateTime = async (days) => {
    if (!selectedInvestment) return

    setLoading(true)
    const token = localStorage.getItem('admin_access_token')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/investments/${selectedInvestment.id}/simulate-time`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ days: days }) // ✅ Правильный параметр
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Time simulated:', data)
        addToLog(`⏰ Продвинуто на ${days} ${days === 1 ? 'день' : 'дней'}`)
        await fetchUserInvestments(selectedUser.id)
        
        // ✅ Уведомление пользователю
        alert(`✅ Время симулировано!\n\n📅 Добавлено: ${days} дней\n\n⚠️ Пользователь увидит изменения:\n• Сразу в админке\n• Через 30 сек на клиенте (auto-refresh)\n• Или после ручного обновления`)
      } else {
        const errorData = await response.json()
        console.error('Simulation failed:', errorData)
        addToLog(`❌ Ошибка симуляции: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to simulate time:', error)
      addToLog(`❌ Ошибка симуляции времени`)
    } finally {
      setLoading(false)
    }
  }

  // ✅ ЧАСТИЧНЫЙ ВЫВОД (обновлено)
  const simulatePartialWithdraw = async () => {
    if (!selectedInvestment) return

    const availableAmount = selectedInvestment.calculatedData?.availableProfit || 0
    if (availableAmount <= 0) {
      addToLog(`❌ Нет доступной прибыли для вывода`)
      alert('❌ Нет доступной прибыли для вывода')
      return
    }

    const amount = prompt(`Введите сумму для частичного вывода (доступно: $${availableAmount.toFixed(2)}):`)
    if (!amount || isNaN(amount) || Number(amount) <= 0) return

    if (Number(amount) > availableAmount) {
      alert(`❌ Сумма превышает доступную прибыль ($${availableAmount.toFixed(2)})`)
      return
    }

    setLoading(true)
    const token = localStorage.getItem('admin_access_token')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/investments/${selectedInvestment.id}/simulate-action`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ 
            action: 'partial_withdraw',
            amount: Number(amount)
          })
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Partial withdrawal simulated:', data)
        addToLog(`💰 Частичный вывод: $${amount}`)
        await fetchUserInvestments(selectedUser.id)
        alert(`✅ Частичный вывод симулирован!\n\nСнято: $${amount}\nОстаток: $${(availableAmount - Number(amount)).toFixed(2)}`)
      } else {
        const errorData = await response.json()
        console.error('Withdrawal failed:', errorData)
        addToLog(`❌ Ошибка вывода: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to simulate partial withdraw:', error)
      addToLog(`❌ Ошибка симуляции частичного вывода`)
    } finally {
      setLoading(false)
    }
  }

  // ✅ АПГРЕЙД (обновлено)
  const simulateUpgrade = async () => {
    if (!selectedInvestment) return

    const currentPlanName = selectedInvestment.plan?.name || 'Unknown'
    const currentAmount = Number(selectedInvestment.amount || 0)

    console.log('Current plan:', currentPlanName, 'Amount:', currentAmount)
    console.log('Available plans:', stakingPlans)

    // Определить доступные пакеты для апгрейда
    const packages = [
      { name: 'Starter', monthlyRate: 14, min: 100, max: 999 },
      { name: 'Advanced', monthlyRate: 17, min: 1000, max: 2999 },
      { name: 'Pro', monthlyRate: 22, min: 3000, max: 4999 },
      { name: 'Elite', monthlyRate: 28, min: 6000, max: 100000 }
    ]

    const currentPackageIndex = packages.findIndex(p => p.name === currentPlanName)
    const availablePackages = packages.slice(currentPackageIndex + 1)

    if (availablePackages.length === 0) {
      addToLog(`❌ Нет доступных пакетов для апгрейда (уже максимальный)`)
      alert('❌ Нет доступных пакетов для апгрейда')
      return
    }

    const packageNames = availablePackages.map(p => p.name).join(', ')
    const newPackageName = prompt(`Выберите новый пакет:\n${packageNames}`)
    
    if (!newPackageName) return

    const newPackage = availablePackages.find(p => p.name.toLowerCase() === newPackageName.toLowerCase())
    if (!newPackage) {
      alert(`❌ Неверный пакет. Доступны: ${packageNames}`)
      return
    }

    const additionalAmount = prompt(`Введите дополнительную сумму для апгрейда до ${newPackage.name}:\n\nМинимум: $${Math.max(0, newPackage.min - currentAmount)}\nМаксимум: $${newPackage.max - currentAmount}`)
    
    if (!additionalAmount || isNaN(additionalAmount) || Number(additionalAmount) <= 0) return

    const newTotalAmount = currentAmount + Number(additionalAmount)
    
    if (newTotalAmount < newPackage.min || newTotalAmount > newPackage.max) {
      alert(`❌ Итоговая сумма ($${newTotalAmount}) должна быть между $${newPackage.min} и $${newPackage.max}`)
      return
    }

    setLoading(true)
    const token = localStorage.getItem('admin_access_token')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/investments/${selectedInvestment.id}/simulate-action`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ 
            action: 'upgrade',
            newPackage: newPackage.name,
            additionalAmount: Number(additionalAmount)
          })
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Upgrade simulated:', data)
        addToLog(`📈 Апгрейд: ${currentPlanName} → ${newPackage.name} (+$${additionalAmount})`)
        await fetchUserInvestments(selectedUser.id)
        alert(`✅ Апгрейд симулирован!\n\n${currentPlanName} → ${newPackage.name}\n\nСтарая сумма: $${currentAmount}\nДобавлено: $${additionalAmount}\nНовая сумма: $${newTotalAmount}\nНовая ставка: ${newPackage.monthlyRate}% APY`)
      } else {
        const errorData = await response.json()
        console.error('Upgrade failed:', errorData)
        addToLog(`❌ Ошибка апгрейда: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to simulate upgrade:', error)
      addToLog(`❌ Ошибка симуляции апгрейда`)
    } finally {
      setLoading(false)
    }
  }

  // ✅ СБРОС (обновлено)
  const resetInvestment = async () => {
    if (!selectedInvestment) return
    if (!confirm('⚠️ Сбросить инвестицию к начальному состоянию?\n\n• Симулированное время → реальное\n• Снятая прибыль → 0\n• Накопленные проценты → 0\n• Последний апгрейд → сброшен')) return

    setLoading(true)
    const token = localStorage.getItem('admin_access_token')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/investments/${selectedInvestment.id}/simulate-action`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ 
            action: 'reset'
          })
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Investment reset:', data)
        addToLog(`🔄 Инвестиция сброшена к начальному состоянию`)
        await fetchUserInvestments(selectedUser.id)
        alert('✅ Инвестиция сброшена к начальному состоянию')
      } else {
        const errorData = await response.json()
        console.error('Reset failed:', errorData)
        addToLog(`❌ Ошибка сброса: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to reset investment:', error)
      addToLog(`❌ Ошибка сброса`)
    } finally {
      setLoading(false)
    }
  }

  const addToLog = (message) => {
    const timestamp = new Date().toLocaleTimeString()
    setActionLog(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 20))
  }

  return (
    <div>
      <h1 style={{ 
        color: 'white', 
        fontSize: isMobile ? '24px' : '32px', 
        fontWeight: '700',
        marginBottom: '24px' 
      }}>
        🧪 Investment Testing
      </h1>

      {/* User Search */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          1. Выберите пользователя
        </h3>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Email, имя или username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px'
            }}
          />
          <button
            onClick={searchUsers}
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: 'rgba(45, 212, 191, 0.15)',
              border: '1px solid rgba(45, 212, 191, 0.3)',
              borderRadius: '8px',
              color: '#2dd4bf',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'wait' : 'pointer'
            }}
          >
            Поиск
          </button>
        </div>

        {searchResults.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {searchResults.map(user => (
              <div
                key={user.id}
                onClick={() => selectUser(user)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
              >
                <div style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>
                  {user.email || user.username}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
                  {user.firstName} {user.lastName}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedUser && (
          <div style={{
            background: 'rgba(45, 212, 191, 0.1)',
            border: '1px solid rgba(45, 212, 191, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginTop: '12px'
          }}>
            <div style={{ color: '#2dd4bf', fontSize: '14px', fontWeight: '600' }}>
              ✓ Выбран: {selectedUser.email || selectedUser.username}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
              {selectedUser.firstName} {selectedUser.lastName}
            </div>
          </div>
        )}
      </div>

      {/* Investments List */}
      {selectedUser && investments.length > 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            2. Выберите инвестицию для тестирования
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {investments.map(inv => {
              // ✅ Безопасный доступ к данным
              const planName = inv.plan?.name || 'Unknown Plan'
              const planApy = inv.effectiveROI || inv.plan?.apy || inv.roi || 0
              const duration = inv.duration || 0
              const daysPassed = inv.calculatedData?.daysPassed || 0
              const daysRemaining = inv.calculatedData?.daysRemaining || 0
              const accumulatedProfit = inv.calculatedData?.accumulatedProfit || 0
              const withdrawnProfits = Number(inv.withdrawnProfits || 0)
              const availableProfit = inv.calculatedData?.availableProfit || 0
              const isSimulated = inv.calculatedData?.isSimulated || false

              return (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvestment(inv)}
                  style={{
                    background: selectedInvestment?.id === inv.id 
                      ? 'rgba(45, 212, 191, 0.15)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    border: selectedInvestment?.id === inv.id
                      ? '2px solid rgba(45, 212, 191, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedInvestment?.id !== inv.id) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedInvestment?.id !== inv.id) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    }
                  }}
                >
                  {/* ✅ ИНДИКАТОР СИМУЛЯЦИИ */}
                  {isSimulated && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.5)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#a78bfa'
                    }}>
                      🎮 TEST MODE
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <div style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>
                        ${Number(inv.amount || 0).toFixed(2)}
                      </div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px' }}>
                        {planName} • {Number(planApy).toFixed(1)}% APY • {duration * 30} days
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        color: daysPassed <= 0 ? '#eab308' : '#2dd4bf',
                        fontSize: '24px', 
                        fontWeight: '700' 
                      }}>
                        День {daysPassed}
                      </div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
                        {daysRemaining > 0 
                          ? `${daysRemaining} дней до конца`
                          : 'Завершена'}
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', 
                    gap: '12px',
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px' }}>
                        Накопленная прибыль
                      </div>
                      <div style={{ color: '#22c55e', fontSize: '15px', fontWeight: '600' }}>
                        ${accumulatedProfit.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px' }}>
                        Снято прибыли
                      </div>
                      <div style={{ color: '#ef4444', fontSize: '15px', fontWeight: '600' }}>
                        ${withdrawnProfits.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px' }}>
                        Доступно для вывода
                      </div>
                      <div style={{ color: '#2dd4bf', fontSize: '15px', fontWeight: '600' }}>
                        ${availableProfit.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    marginTop: '12px',
                    flexWrap: 'wrap'
                  }}>
                    {inv.calculatedData?.canEarlyWithdraw && (
                      <span style={{
                        padding: '4px 8px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '4px',
                        color: '#ef4444',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        Early Withdraw ✓
                      </span>
                    )}
                    {inv.calculatedData?.canPartialWithdraw && (
                      <span style={{
                        padding: '4px 8px',
                        background: 'rgba(45, 212, 191, 0.15)',
                        border: '1px solid rgba(45, 212, 191, 0.3)',
                        borderRadius: '4px',
                        color: '#2dd4bf',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        Partial Withdraw ✓
                      </span>
                    )}
                    {inv.calculatedData?.canUpgrade && (
                      <span style={{
                        padding: '4px 8px',
                        background: 'rgba(234, 179, 8, 0.15)',
                        border: '1px solid rgba(234, 179, 8, 0.3)',
                        borderRadius: '4px',
                        color: '#eab308',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        Upgrade ✓
                      </span>
                    )}
                    {inv.calculatedData?.isCompleted && (
                      <span style={{
                        padding: '4px 8px',
                        background: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '4px',
                        color: '#22c55e',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        Completed ✓
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Control Panel */}
      {selectedInvestment && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            3. Управление временем и действиями
          </h3>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ color: '#2dd4bf', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
              ⏰ Симуляция времени
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)', gap: '8px' }}>
              <button
                onClick={() => simulateTime(1)}
                disabled={loading}
                style={{
                  padding: '12px',
                  background: 'rgba(45, 212, 191, 0.15)',
                  border: '1px solid rgba(45, 212, 191, 0.3)',
                  borderRadius: '8px',
                  color: '#2dd4bf',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: loading ? 'wait' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.background = 'rgba(45, 212, 191, 0.25)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(45, 212, 191, 0.15)'
                }}
              >
                +1 день
              </button>
              <button
                onClick={() => simulateTime(7)}
                disabled={loading}
                style={{
                  padding: '12px',
                  background: 'rgba(45, 212, 191, 0.15)',
                  border: '1px solid rgba(45, 212, 191, 0.3)',
                  borderRadius: '8px',
                  color: '#2dd4bf',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: loading ? 'wait' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.background = 'rgba(45, 212, 191, 0.25)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(45, 212, 191, 0.15)'
                }}
              >
                +7 дней
              </button>
              <button
                onClick={() => simulateTime(15)}
                disabled={loading}
                style={{
                  padding: '12px',
                  background: 'rgba(45, 212, 191, 0.15)',
                  border: '1px solid rgba(45, 212, 191, 0.3)',
                  borderRadius: '8px',
                  color: '#2dd4bf',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: loading ? 'wait' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.background = 'rgba(45, 212, 191, 0.25)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(45, 212, 191, 0.15)'
                }}
              >
                +15 дней
              </button>
              <button
                onClick={() => simulateTime(30)}
                disabled={loading}
                style={{
                  padding: '12px',
                  background: 'rgba(45, 212, 191, 0.15)',
                  border: '1px solid rgba(45, 212, 191, 0.3)',
                  borderRadius: '8px',
                  color: '#2dd4bf',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: loading ? 'wait' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.background = 'rgba(45, 212, 191, 0.25)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(45, 212, 191, 0.15)'
                }}
              >
                +30 дней
              </button>
              <button
                onClick={() => {
                  const days = prompt('Введите количество дней:')
                  if (days && !isNaN(days) && Number(days) > 0) {
                    simulateTime(Number(days))
                  }
                }}
                disabled={loading}
                style={{
                  padding: '12px',
                  background: 'rgba(234, 179, 8, 0.15)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  borderRadius: '8px',
                  color: '#eab308',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: loading ? 'wait' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.background = 'rgba(234, 179, 8, 0.25)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(234, 179, 8, 0.15)'
                }}
              >
                Custom
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ color: '#2dd4bf', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
              💰 Симуляция действий
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px' }}>
              <button
                onClick={simulatePartialWithdraw}
                disabled={loading || !selectedInvestment.calculatedData?.canPartialWithdraw}
                style={{
                  padding: '12px',
                  background: selectedInvestment.calculatedData?.canPartialWithdraw
                    ? 'rgba(45, 212, 191, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: selectedInvestment.calculatedData?.canPartialWithdraw
                    ? '1px solid rgba(45, 212, 191, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: selectedInvestment.calculatedData?.canPartialWithdraw ? '#2dd4bf' : 'rgba(255, 255, 255, 0.3)',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: loading || !selectedInvestment.calculatedData?.canPartialWithdraw ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!loading && selectedInvestment.calculatedData?.canPartialWithdraw) {
                    e.currentTarget.style.background = 'rgba(45, 212, 191, 0.25)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedInvestment.calculatedData?.canPartialWithdraw) {
                    e.currentTarget.style.background = 'rgba(45, 212, 191, 0.15)'
                  }
                }}
              >
                Частичный вывод
              </button>
              <button
                onClick={simulateUpgrade}
                disabled={loading || !selectedInvestment.calculatedData?.canUpgrade}
                style={{
                  padding: '12px',
                  background: selectedInvestment.calculatedData?.canUpgrade
                    ? 'rgba(234, 179, 8, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: selectedInvestment.calculatedData?.canUpgrade
                    ? '1px solid rgba(234, 179, 8, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: selectedInvestment.calculatedData?.canUpgrade ? '#eab308' : 'rgba(255, 255, 255, 0.3)',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: loading || !selectedInvestment.calculatedData?.canUpgrade ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!loading && selectedInvestment.calculatedData?.canUpgrade) {
                    e.currentTarget.style.background = 'rgba(234, 179, 8, 0.25)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedInvestment.calculatedData?.canUpgrade) {
                    e.currentTarget.style.background = 'rgba(234, 179, 8, 0.15)'
                  }
                }}
              >
                Апгрейд
              </button>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#ef4444', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
              🔄 Сброс
            </h4>
            <button
              onClick={resetInvestment}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '13px',
                fontWeight: '600',
                cursor: loading ? 'wait' : 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'
              }}
            >
              Сбросить к начальному состоянию
            </button>
          </div>
        </div>
      )}

      {/* Action Log */}
      {actionLog.length > 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>
              📝 История действий
            </h3>
            <button
              onClick={() => setActionLog([])}
              style={{
                padding: '6px 12px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                color: '#ef4444',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
            >
              Очистить
            </button>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            maxHeight: '300px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}>
            {actionLog.map((log, index) => (
              <div 
                key={index} 
                style={{ 
                  color: log.includes('❌') ? '#ef4444' : '#2dd4bf',
                  marginBottom: '4px'
                }}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedUser && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'rgba(255, 255, 255, 0.5)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧪</div>
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Начните с выбора пользователя
          </div>
          <div style={{ fontSize: '14px' }}>
            Используйте поиск выше чтобы найти пользователя для тестирования
          </div>
        </div>
      )}
    </div>
  )
}