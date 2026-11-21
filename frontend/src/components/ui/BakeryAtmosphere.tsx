'use client';

import React from 'react';

interface StarConfig {
  id: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  size: number;
  opacity: number;
  pulseDuration: number;
  delay: number;
}

const STARS: StarConfig[] = [
  { id: 's1', top: '70px', left: '12%', size: 16, opacity: 0.55, pulseDuration: 3.2, delay: 0 },
  { id: 's2', top: '95px', right: '14%', size: 18, opacity: 0.6, pulseDuration: 3.6, delay: 1.2 },
  { id: 's3', top: '130px', left: '49%', size: 12, opacity: 0.4, pulseDuration: 4.0, delay: 2.1 },
  { id: 's4', top: '28%', left: '8%', size: 14, opacity: 0.45, pulseDuration: 3.4, delay: 0.6 },
  { id: 's5', top: '33%', right: '9%', size: 20, opacity: 0.65, pulseDuration: 3.8, delay: 1.8 },
  { id: 's6', top: '39%', left: '52%', size: 13, opacity: 0.35, pulseDuration: 4.2, delay: 2.7 },
  { id: 's7', top: '53%', left: '14%', size: 17, opacity: 0.5, pulseDuration: 3.5, delay: 0.9 },
  { id: 's8', top: '58%', right: '16%', size: 14, opacity: 0.45, pulseDuration: 3.9, delay: 2.4 },
  { id: 's9', top: '65%', left: '46%', size: 11, opacity: 0.35, pulseDuration: 4.5, delay: 1.5 },
  { id: 's10', top: '78%', left: '10%', size: 19, opacity: 0.55, pulseDuration: 3.7, delay: 0.3 },
  { id: 's11', top: '83%', right: '12%', size: 15, opacity: 0.5, pulseDuration: 4.1, delay: 1.7 },
  { id: 's12', top: '88%', left: '51%', size: 12, opacity: 0.35, pulseDuration: 3.6, delay: 2.9 },
  { id: 's13', bottom: '80px', left: '18%', size: 14, opacity: 0.4, pulseDuration: 4.0, delay: 0.8 },
  { id: 's14', bottom: '60px', right: '22%', size: 16, opacity: 0.45, pulseDuration: 3.5, delay: 2.2 },
];

interface DustConfig {
  id: string;
  top: string;
  left: string;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

const STARDUST_PARTICLES: DustConfig[] = [
  { id: 'd1', top: '15%', left: '25%', size: 3, opacity: 0.5, duration: 6, delay: 0.5 },
  { id: 'd2', top: '22%', left: '72%', size: 4, opacity: 0.6, duration: 7, delay: 1.5 },
  { id: 'd3', top: '35%', left: '38%', size: 3, opacity: 0.45, duration: 5.5, delay: 2.5 },
  { id: 'd4', top: '42%', left: '85%', size: 2.5, opacity: 0.4, duration: 6.5, delay: 0.8 },
  { id: 'd5', top: '48%', left: '18%', size: 3.5, opacity: 0.55, duration: 8, delay: 3.0 },
  { id: 'd6', top: '56%', left: '60%', size: 3, opacity: 0.4, duration: 6, delay: 1.2 },
  { id: 'd7', top: '62%', left: '30%', size: 2.5, opacity: 0.45, duration: 7.5, delay: 2.0 },
  { id: 'd8', top: '70%', left: '78%', size: 4, opacity: 0.6, duration: 6.2, delay: 0.3 },
  { id: 'd9', top: '75%', left: '42%', size: 3, opacity: 0.5, duration: 8.5, delay: 2.7 },
  { id: 'd10', top: '82%', left: '22%', size: 3.5, opacity: 0.45, duration: 7, delay: 1.8 },
  { id: 'd11', top: '90%', left: '68%', size: 2.5, opacity: 0.4, duration: 6, delay: 3.2 },
  { id: 'd12', top: '94%', left: '35%', size: 3, opacity: 0.5, duration: 7.8, delay: 0.9 },
];

export const BakeryAtmosphere: React.FC = () => {
  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Mayin issiq pastel nurlar (GPU-do'st radial gradientlar, og'ir blur-3xl olib tashlandi) */}
      <div
        style={{ background: 'radial-gradient(closest-side, rgba(212,175,55,0.12), transparent)' }}
        className="absolute -top-32 -left-32 w-96 sm:w-[500px] h-96 sm:h-[500px] rounded-full opacity-60 dark:opacity-20 animate-ambient-float-1 pointer-events-none"
      />
      <div
        style={{ background: 'radial-gradient(closest-side, rgba(36,75,43,0.14), transparent)' }}
        className="absolute top-1/3 -right-40 w-96 sm:w-[560px] h-96 sm:h-[560px] rounded-full opacity-50 dark:opacity-15 animate-ambient-float-2 pointer-events-none"
      />
      <div
        style={{ background: 'radial-gradient(closest-side, rgba(212,175,55,0.08), transparent)' }}
        className="absolute bottom-10 left-1/4 w-96 sm:w-[500px] h-96 sm:h-[500px] rounded-full opacity-40 dark:opacity-15 animate-ambient-float-3 pointer-events-none"
      />

      {/* 2. Oltin changi (Pure CSS stardust) - Desktop va tablet */}
      <div className="hidden sm:block">
        {STARDUST_PARTICLES.map((dust) => (
          <div
            key={dust.id}
            style={{
              top: dust.top,
              left: dust.left,
              width: `${dust.size}px`,
              height: `${dust.size}px`,
              opacity: dust.opacity,
              boxShadow: '0 0 6px #D4AF37',
              animation: `stardustFloat ${dust.duration}s ease-in-out infinite ${dust.delay}s`,
            }}
            className="absolute rounded-full bg-[#D4AF37] dark:bg-[#F5D061] pointer-events-none will-change-transform"
          />
        ))}
      </div>

      {/* 3. Mayin chaqnaydigan yulduzchalar (Pure CSS GPU sparkles) - Hech qanday JS yuklamasiz */}
      <div className="hidden sm:block">
        {STARS.map((star) => (
          <div
            key={star.id}
            style={{
              top: star.top,
              bottom: star.bottom,
              left: star.left,
              right: star.right,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
            }}
            className="absolute pointer-events-none will-change-transform text-[#D4AF37] dark:text-[#E5C358]"
          >
            <div
              style={{
                animation: `sparklePulse ${star.pulseDuration}s ease-in-out infinite ${star.delay}s`,
                filter: 'drop-shadow(0 0 6px rgba(212, 175, 55, 0.55))',
              }}
              className="w-full h-full will-change-transform"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BakeryAtmosphere;
