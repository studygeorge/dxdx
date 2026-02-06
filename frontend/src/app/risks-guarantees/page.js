'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import RisksGuarantees from '../../components/RisksGuarantees';

export default function RisksGuaranteesPage() {
  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1400);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setWindowWidth(window.innerWidth);
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  if (!mounted) {
    return null;
  }

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#000000',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Fixed Background Effects */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        pointerEvents: 'none'
      }}>
        {/* Main gradient circles */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(45, 212, 191, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          top: '40%',
          right: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          filter: 'blur(50px)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '20%',
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(45, 212, 191, 0.12) 0%, transparent 70%)',
          filter: 'blur(55px)',
          borderRadius: '50%'
        }} />
      </div>

      {/* Floating Particles */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 3,
        pointerEvents: 'none'
      }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              background: '#2dd4bf',
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.2,
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              boxShadow: '0 0 10px rgba(45, 212, 191, 0.5)'
            }}
          />
        ))}
      </div>

      <Header isMobile={isMobile} isTablet={isTablet} />
      
      <main style={{
        position: 'relative',
        zIndex: 10,
        minHeight: 'calc(100vh - 80px)'
      }}>
        {/* ✅ ИСПРАВЛЕНО: Передаём пропсы */}
        <RisksGuarantees isMobile={isMobile} isTablet={isTablet} />
      </main>
      
      <Footer isMobile={isMobile} isTablet={isTablet} />

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-10px) translateX(-10px);
          }
          75% {
            transform: translateY(-30px) translateX(5px);
          }
        }
      `}</style>
    </div>
  );
}