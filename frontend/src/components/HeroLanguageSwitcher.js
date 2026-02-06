'use client'
import LanguageSwitcher from './LanguageSwitcher'

export default function HeroLanguageSwitcher() {
  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      zIndex: 10
    }}>
      <LanguageSwitcher variant="minimal" />
    </div>
  )
}