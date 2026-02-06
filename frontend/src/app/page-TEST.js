'use client'

import { useState, useEffect } from 'react'

export default function TestMobile() {
  const [device, setDevice] = useState('Определяется...')
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [logs, setLogs] = useState([])
  
  const addLog = (message) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
    console.log(message)
  }
  
  useEffect(() => {
    addLog('✅ Страница загружена')
    
    const detectDevice = () => {
      const ua = navigator.userAgent
      const w = window.innerWidth
      const h = window.innerHeight
      
      let dev = 'Desktop'
      if (/iPhone/i.test(ua)) dev = 'iPhone'
      else if (/iPad/i.test(ua)) dev = 'iPad'
      else if (/Android/i.test(ua)) dev = 'Android'
      else if (w <= 768) dev = 'Mobile (by width)'
      
      setDevice(dev)
      setWidth(w)
      setHeight(h)
      
      addLog(`📱 Устройство: ${dev} (${w}x${h})`)
    }
    
    detectDevice()
    window.addEventListener('resize', detectDevice)
    
    return () => window.removeEventListener('resize', detectDevice)
  }, [])
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: 'white',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '32px', 
          marginBottom: '20px', 
          color: '#2dd4bf',
          textAlign: 'center'
        }}>
          🧪 МИНИМАЛЬНЫЙ ТЕСТ
        </h1>
        
        <div style={{
          background: 'rgba(45, 212, 191, 0.1)',
          border: '2px solid #2dd4bf',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '10px', color: '#2dd4bf' }}>
            ✅ React работает!
          </h2>
          <p>Если ты видишь эту страницу - Next.js и React загружаются</p>
        </div>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '10px',
          padding: '15px',
          marginBottom: '15px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ color: '#94a3b8' }}>Устройство:</span>
            <span style={{ color: '#2dd4bf', fontWeight: 'bold' }}>{device}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ color: '#94a3b8' }}>Ширина:</span>
            <span style={{ color: '#2dd4bf', fontWeight: 'bold' }}>{width}px</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
            <span style={{ color: '#94a3b8' }}>Высота:</span>
            <span style={{ color: '#2dd4bf', fontWeight: 'bold' }}>{height}px</span>
          </div>
        </div>
        
        <a 
          href="/profile"
          style={{
            display: 'block',
            width: '100%',
            padding: '15px',
            background: '#2dd4bf',
            color: '#0f172a',
            border: 'none',
            borderRadius: '10px',
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center',
            textDecoration: 'none',
            marginBottom: '10px'
          }}
        >
          👤 Перейти в профиль
        </a>
        
        <div style={{
          background: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '10px',
          padding: '15px',
          marginTop: '20px',
          fontFamily: 'monospace',
          fontSize: '12px',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          <strong>Лог:</strong>
          {logs.map((log, i) => (
            <div key={i} style={{ 
              padding: '5px 0', 
              borderBottom: '1px solid rgba(255,255,255,0.1)' 
            }}>
              {log}
            </div>
          ))}
        </div>
        
        {/* Тест скролла */}
        <div style={{ height: '1000px', marginTop: '40px', background: 'linear-gradient(to bottom, rgba(45, 212, 191, 0.1), rgba(45, 212, 191, 0))' }}>
          <p style={{ textAlign: 'center', padding: '20px' }}>Прокрути вниз ⬇️</p>
          <p style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', padding: '20px', background: '#2dd4bf', color: '#0f172a', borderRadius: '10px', fontWeight: 'bold' }}>
            🎉 Если видишь это - скролл работает!
          </p>
        </div>
      </div>
    </div>
  )
}
