'use client'
import { useState, useEffect } from 'react'

const API_BASE_URL = 'https://dxcapital-ai.com'

export default function Settings({ isMobile }) {
  const [settings, setSettings] = useState(null)
  const [stakingPlans, setStakingPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Wallet settings - теперь с разделением USDT на ERC-20 и TRC-20
  const [wallets, setWallets] = useState({
    USDT_ERC20: '', // Для MetaMask (Ethereum)
    USDT_TRC20: '', // Для Telegram бота (TRON)
    ETH: '',
    BTC: ''
  })
  
  // Staking plan form
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [planForm, setPlanForm] = useState({
    name: '',
    duration: '',
    apy: '',
    minAmount: '',
    maxAmount: '',
    currency: 'USDT',
    isActive: true,
    description: ''
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    const token = localStorage.getItem('admin_access_token')

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.data.settings)
        setStakingPlans(data.data.stakingPlans)
        
        // Заполняем кошельки
        if (data.data.wallets) {
          setWallets(prev => ({
            ...prev,
            ...data.data.wallets
          }))
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateWallet = async (currency) => {
    setSaving(true)
    const token = localStorage.getItem('admin_access_token')

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/settings/wallet`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          currency,
          address: wallets[currency]
        })
      })

      if (response.ok) {
        alert(`${currency} wallet updated successfully!`)
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to update wallet:', error)
      alert('Failed to update wallet')
    } finally {
      setSaving(false)
    }
  }

  const handleSavePlan = async (e) => {
    e.preventDefault()
    setSaving(true)
    const token = localStorage.getItem('admin_access_token')

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/settings/staking-plan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...planForm,
          id: editingPlan?.id,
          duration: parseInt(planForm.duration),
          apy: parseFloat(planForm.apy),
          minAmount: parseFloat(planForm.minAmount),
          maxAmount: planForm.maxAmount ? parseFloat(planForm.maxAmount) : null
        })
      })

      if (response.ok) {
        alert('Staking plan saved successfully!')
        setShowPlanForm(false)
        setEditingPlan(null)
        setPlanForm({
          name: '',
          duration: '',
          apy: '',
          minAmount: '',
          maxAmount: '',
          currency: 'USDT',
          isActive: true,
          description: ''
        })
        fetchSettings()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to save plan:', error)
      alert('Failed to save plan')
    } finally {
      setSaving(false)
    }
  }

  const handleEditPlan = (plan) => {
    setEditingPlan(plan)
    setPlanForm({
      name: plan.name,
      duration: plan.duration.toString(),
      apy: plan.apy.toString(),
      minAmount: plan.minAmount.toString(),
      maxAmount: plan.maxAmount?.toString() || '',
      currency: plan.currency,
      isActive: plan.isActive,
      description: plan.description || ''
    })
    setShowPlanForm(true)
  }

  const handleDeletePlan = async (id) => {
    if (!confirm('Are you sure you want to delete this staking plan?')) return

    const token = localStorage.getItem('admin_access_token')

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/settings/staking-plan/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (response.ok) {
        alert('Staking plan deleted successfully!')
        fetchSettings()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to delete plan:', error)
      alert('Failed to delete plan')
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#2dd4bf' }}>
        Loading settings...
      </div>
    )
  }

  // Определяем порядок и описания для кошельков
  const walletConfigs = [
    {
      key: 'USDT_ERC20',
      label: 'USDT (ERC-20) - MetaMask',
      description: 'Ethereum wallet for MetaMask users',
      placeholder: '0x...',
      icon: ''
    },
    {
      key: 'USDT_TRC20',
      label: 'USDT (TRC-20) - Telegram Bot',
      description: 'TRON wallet for Telegram bot users',
      placeholder: 'T...',
      icon: ''
    },
    {
      key: 'ETH',
      label: 'ETH',
      description: 'Ethereum wallet',
      placeholder: '0x...',
      icon: ''
    },
    {
      key: 'BTC',
      label: 'BTC',
      description: 'Bitcoin wallet',
      placeholder: 'bc1... or 1...',
      icon: ''
    }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Wallet Settings */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: isMobile ? '24px' : '32px'
      }}>
        <h2 style={{
          fontSize: isMobile ? '20px' : '24px',
          fontWeight: '600',
          color: 'white',
          marginBottom: '12px'
        }}>
          Admin Wallet Addresses
        </h2>
        
        <p style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '14px',
          marginBottom: '24px',
          lineHeight: '1.5'
        }}>
          Configure wallet addresses for receiving staking payments. USDT is split into two networks:
          <br />
          <span style={{ color: '#2dd4bf' }}>• ERC-20 (Ethereum)</span> - for MetaMask web users
          <br />
          <span style={{ color: '#fb923c' }}>• TRC-20 (TRON)</span> - for Telegram bot users
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {walletConfigs.map((config) => (
            <div key={config.key} style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: isMobile ? '16px' : '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>{config.icon}</span>
                <label style={{ 
                  color: 'white', 
                  fontSize: isMobile ? '15px' : '16px', 
                  fontWeight: '600' 
                }}>
                  {config.label}
                </label>
              </div>
              
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.5)', 
                fontSize: '12px', 
                marginBottom: '12px' 
              }}>
                {config.description}
              </p>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={wallets[config.key] || ''}
                  onChange={(e) => setWallets({ ...wallets, [config.key]: e.target.value })}
                  placeholder={`Enter ${config.label} wallet address (${config.placeholder})`}
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => handleUpdateWallet(config.key)}
                  disabled={saving || !wallets[config.key]}
                  style={{
                    padding: '12px 24px',
                    background: (saving || !wallets[config.key])
                      ? 'rgba(45, 212, 191, 0.1)'
                      : 'rgba(45, 212, 191, 0.15)',
                    border: (saving || !wallets[config.key])
                      ? '1px solid rgba(45, 212, 191, 0.2)'
                      : '1px solid rgba(45, 212, 191, 0.3)',
                    borderRadius: '8px',
                    color: (saving || !wallets[config.key])
                      ? 'rgba(45, 212, 191, 0.5)'
                      : '#2dd4bf',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: (saving || !wallets[config.key]) ? 'not-allowed' : 'pointer',
                    opacity: (saving || !wallets[config.key]) ? 0.5 : 1
                  }}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staking Plans */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: isMobile ? '24px' : '32px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '600',
            color: 'white'
          }}>
             Staking Plans
          </h2>
          
          <button
            onClick={() => {
              setShowPlanForm(!showPlanForm)
              setEditingPlan(null)
              setPlanForm({
                name: '',
                duration: '',
                apy: '',
                minAmount: '',
                maxAmount: '',
                currency: 'USDT',
                isActive: true,
                description: ''
              })
            }}
            style={{
              padding: '10px 20px',
              background: 'rgba(45, 212, 191, 0.15)',
              border: '1px solid rgba(45, 212, 191, 0.3)',
              borderRadius: '8px',
              color: '#2dd4bf',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {showPlanForm ? 'Cancel' : '+ Add Plan'}
          </button>
        </div>

        {/* Plan Form */}
        {showPlanForm && (
          <form onSubmit={handleSavePlan} style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '8px' }}>
                  Plan Name *
                </label>
                <input
                  type="text"
                  required
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  placeholder="e.g., 30 Days Plan"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '8px' }}>
                  Duration (days) *
                </label>
                <input
                  type="number"
                  required
                  value={planForm.duration}
                  onChange={(e) => setPlanForm({ ...planForm, duration: e.target.value })}
                  placeholder="30"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '8px' }}>
                  APY (%) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={planForm.apy}
                  onChange={(e) => setPlanForm({ ...planForm, apy: e.target.value })}
                  placeholder="12.5"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '8px' }}>
                  Currency *
                </label>
                <select
                  value={planForm.currency}
                  onChange={(e) => setPlanForm({ ...planForm, currency: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="USDT">USDT</option>
                  <option value="ETH">ETH</option>
                  <option value="BTC">BTC</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '8px' }}>
                  Min Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={planForm.minAmount}
                  onChange={(e) => setPlanForm({ ...planForm, minAmount: e.target.value })}
                  placeholder="100"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '8px' }}>
                  Max Amount (optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={planForm.maxAmount}
                  onChange={(e) => setPlanForm({ ...planForm, maxAmount: e.target.value })}
                  placeholder="10000"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ gridColumn: isMobile ? '1' : '1 / -1' }}>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '8px' }}>
                  Description
                </label>
                <textarea
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  placeholder="Enter plan description..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="checkbox"
                  id="isActive"
                  checked={planForm.isActive}
                  onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label htmlFor="isActive" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', cursor: 'pointer' }}>
                  Active
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '12px 32px',
                  background: 'rgba(45, 212, 191, 0.15)',
                  border: '1px solid rgba(45, 212, 191, 0.3)',
                  borderRadius: '8px',
                  color: '#2dd4bf',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.5 : 1
                }}
              >
                {saving ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPlanForm(false)
                  setEditingPlan(null)
                }}
                style={{
                  padding: '12px 32px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Plans List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {stakingPlans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.5)' }}>
              No staking plans yet. Create one to get started!
            </div>
          ) : (
            stakingPlans.map((plan) => (
              <div
                key={plan.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: isMobile ? '16px' : '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>
                      {plan.name}
                    </h3>
                    <span style={{
                      padding: '4px 12px',
                      background: plan.isActive ? 'rgba(45, 212, 191, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      border: plan.isActive ? '1px solid rgba(45, 212, 191, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '6px',
                      color: plan.isActive ? '#2dd4bf' : '#ef4444',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                    {plan.duration} days • {plan.apy}% APY • {plan.currency} {plan.minAmount}{plan.maxAmount ? ` - ${plan.maxAmount}` : '+'}
                  </div>
                  {plan.description && (
                    <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '13px', marginTop: '8px' }}>
                      {plan.description}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEditPlan(plan)}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(45, 212, 191, 0.15)',
                      border: '1px solid rgba(45, 212, 191, 0.3)',
                      borderRadius: '6px',
                      color: '#2dd4bf',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '6px',
                      color: '#ef4444',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
