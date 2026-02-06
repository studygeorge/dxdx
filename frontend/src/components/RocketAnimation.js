'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function RocketAnimation() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Определяем мобильное устройство
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted) return null;

  return (
    <div 
      className="absolute pointer-events-none z-[1] right-[2%] md:right-[5%]"
      style={{
        bottom: isMobile ? 'calc(10% - 250px)' : '10%',
        opacity: 0.85,
        width: '250px',
        height: 'auto'
      }}
    >
      {/* Спутник с анимацией покачивания и наклоном влево */}
      <div 
        className="relative w-[250px] md:w-[350px]"
        style={{
          animation: 'satelliteFloat 4s ease-in-out infinite'
        }}
      >
        <Image
          src="/images/rocket.png"
          alt="Satellite"
          width={350}
          height={350}
          className="w-full h-auto relative z-10"
          priority
        />
      </div>

      <style jsx>{`
        @keyframes satelliteFloat {
          0%, 100% {
            transform: translateY(0) rotate(-22deg);
          }
          25% {
            transform: translateY(-15px) rotate(-19deg);
          }
          50% {
            transform: translateY(0) rotate(-18deg);
          }
          75% {
            transform: translateY(-10px) rotate(-21deg);
          }
        }
      `}</style>
    </div>
  );
}
