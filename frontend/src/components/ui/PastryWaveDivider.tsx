'use client';

import React from 'react';

interface PastryWaveDividerProps {
  /**
   * To'lqin yo'nalishi:
   * false (default): pastga qarab oqadi
   * true: tepaga qarab oqadi
   */
  flip?: boolean;
  /**
   * Rang tuslari:
   * 'gold' (oltin-krem), 'cream' (qaymoq), 'emerald' (zumrad-shokolad)
   */
  variant?: 'gold' | 'cream' | 'emerald';
  className?: string;
}

export const PastryWaveDivider: React.FC<PastryWaveDividerProps> = ({
  flip = false,
  variant = 'gold',
  className = '',
}) => {
  return (
    <div
      aria-hidden="true"
      className={`w-full overflow-hidden leading-none select-none pointer-events-none py-1 sm:py-2 ${
        flip ? 'rotate-180' : ''
      } ${className}`}
    >
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="w-full h-6 sm:h-10 md:h-14 opacity-75 dark:opacity-40 transition-opacity duration-300"
      >
        <defs>
          <linearGradient id={`pastryWaveGrad-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
            {variant === 'gold' && (
              <>
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.25" />
                <stop offset="35%" stopColor="#FDF0CD" stopOpacity="0.45" />
                <stop offset="70%" stopColor="#AA820A" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.2" />
              </>
            )}
            {variant === 'cream' && (
              <>
                <stop offset="0%" stopColor="#FAF8F5" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#F5EFE6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0.4" />
              </>
            )}
            {variant === 'emerald' && (
              <>
                <stop offset="0%" stopColor="#244B2B" stopOpacity="0.15" />
                <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#244B2B" stopOpacity="0.15" />
              </>
            )}
          </linearGradient>

          <linearGradient id={`pastryWaveGradSubtle-${variant}`} x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.12" />
            <stop offset="50%" stopColor="#FDF0CD" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#AA820A" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Orqa mayin qatlam */}
        <path
          d="M0,0 C180,70 350,20 540,55 C730,90 920,25 1200,60 L1200,0 L0,0 Z"
          fill={`url(#pastryWaveGradSubtle-${variant})`}
        />

        {/* Oldingi oquvchi krem to'lqini (Organic Confectionery Drip Curve) */}
        <path
          d="M0,0 C150,50 300,85 480,45 C660,5 820,75 1020,40 C1100,25 1160,35 1200,20 L1200,0 L0,0 Z"
          fill={`url(#pastryWaveGrad-${variant})`}
        />

        {/* Nozik yaltiroq oltin chiziq */}
        <path
          d="M0,0 C150,50 300,85 480,45 C660,5 820,75 1020,40 C1100,25 1160,35 1200,20"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1"
          strokeOpacity="0.4"
        />
      </svg>
    </div>
  );
};

export default PastryWaveDivider;
