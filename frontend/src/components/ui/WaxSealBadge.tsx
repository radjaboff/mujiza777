'use client';

import React from 'react';

interface WaxSealBadgeProps {
  label?: string;
  sublabel?: string;
  variant?: 'gold' | 'ruby' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Mo‘jiza 777 — Royal Confectionery Wax Seal (Shohona Qandolat Mumi Muhri).
 * Qimmatbaho shokolad va tort qutilariga bosiladigan haqiqiy mum muhr effekti.
 * Sof SVG va CSS — tezlikka 0% ta'sir, 100% original ko'rinish.
 */
export const WaxSealBadge: React.FC<WaxSealBadgeProps> = ({
  label = '777',
  sublabel,
  variant = 'gold',
  size = 'md',
  className = '',
}) => {
  const sizePx = {
    sm: 38,
    md: 46,
    lg: 58,
  }[size];

  // Ranglar va gradientlar
  const colors = {
    gold: {
      outer: 'url(#sealGoldOuter)',
      inner: 'url(#sealGoldInner)',
      stroke: '#916B08',
      text: '#4A3300',
      highlight: 'rgba(255, 245, 204, 0.7)',
      shadow: 'drop-shadow(0 3px 5px rgba(170, 130, 10, 0.35))',
    },
    ruby: {
      outer: 'url(#sealRubyOuter)',
      inner: 'url(#sealRubyInner)',
      stroke: '#6E1111',
      text: '#FFF5F5',
      highlight: 'rgba(255, 200, 200, 0.6)',
      shadow: 'drop-shadow(0 3px 5px rgba(184, 58, 58, 0.4))',
    },
    emerald: {
      outer: 'url(#sealEmeraldOuter)',
      inner: 'url(#sealEmeraldInner)',
      stroke: '#0F2613',
      text: '#F2F8F3',
      highlight: 'rgba(212, 175, 55, 0.7)',
      shadow: 'drop-shadow(0 3px 5px rgba(36, 75, 43, 0.4))',
    },
  }[variant];

  // 14 ta to'lqinli qandolat mumi qirralari (Authentic melted wax edge)
  const sealPath = `
    M 50 4
    C 56 4, 60 8, 64 6
    C 69 4, 73 8, 77 11
    C 82 14, 87 14, 90 19
    C 94 24, 94 29, 96 34
    C 98 40, 96 45, 96 50
    C 96 55, 98 60, 96 66
    C 94 71, 94 76, 90 81
    C 87 86, 82 86, 77 89
    C 73 92, 69 96, 64 94
    C 60 92, 56 96, 50 96
    C 44 96, 40 92, 36 94
    C 31 96, 27 92, 23 89
    C 18 86, 13 86, 10 81
    C 6 76, 6 71, 4 66
    C 2 60, 4 55, 4 50
    C 4 45, 2 40, 4 34
    C 6 29, 6 24, 10 19
    C 13 14, 18 14, 23 11
    C 27 8, 31 4, 36 6
    C 40 8, 44 4, 50 4 Z
  `;

  return (
    <div
      className={`inline-flex items-center justify-center select-none transform hover:rotate-6 transition-transform duration-300 ${className}`}
      style={{ filter: colors.shadow }}
      title="Mo‘jiza 777 Sifat Muhri"
    >
      <svg
        width={sizePx}
        height={sizePx}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gold Gradient */}
          <radialGradient id="sealGoldOuter" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFF2B8" />
            <stop offset="30%" stopColor="#E5C358" />
            <stop offset="70%" stopColor="#C59B27" />
            <stop offset="100%" stopColor="#8A6305" />
          </radialGradient>
          <radialGradient id="sealGoldInner" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFEAA0" />
            <stop offset="45%" stopColor="#D4AF37" />
            <stop offset="85%" stopColor="#A37808" />
            <stop offset="100%" stopColor="#755202" />
          </radialGradient>

          {/* Ruby Wax Gradient */}
          <radialGradient id="sealRubyOuter" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#E86161" />
            <stop offset="35%" stopColor="#B83A3A" />
            <stop offset="75%" stopColor="#8C1C1C" />
            <stop offset="100%" stopColor="#540E0E" />
          </radialGradient>
          <radialGradient id="sealRubyInner" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#D44D4D" />
            <stop offset="50%" stopColor="#A82828" />
            <stop offset="100%" stopColor="#630E0E" />
          </radialGradient>

          {/* Emerald Gradient */}
          <radialGradient id="sealEmeraldOuter" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#4A8C57" />
            <stop offset="35%" stopColor="#244B2B" />
            <stop offset="75%" stopColor="#15331B" />
            <stop offset="100%" stopColor="#0B1E10" />
          </radialGradient>
          <radialGradient id="sealEmeraldInner" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#366B40" />
            <stop offset="50%" stopColor="#1E4424" />
            <stop offset="100%" stopColor="#0D2411" />
          </radialGradient>
        </defs>

        {/* 1. Mumning to'lqinsimon tashqi tanasi */}
        <path d={sealPath} fill={colors.outer} />

        {/* 2. Ichki bosilgan halqa (Embossed Inner Rim) */}
        <circle
          cx="50"
          cy="50"
          r="34"
          fill={colors.inner}
          stroke={colors.stroke}
          strokeWidth="1.5"
          strokeDasharray="2 1"
        />

        {/* 3. Yuqori nur yaltirashi (Gloss shine) */}
        <ellipse
          cx="44"
          cy="32"
          rx="18"
          ry="8"
          fill={colors.highlight}
          transform="rotate(-20 44 32)"
        />

        {/* 4. Mini toj yoki yulduzcha */}
        <path
          d="M 44 36 L 47 40 L 50 36 L 53 40 L 56 36 L 55 43 L 45 43 Z"
          fill={colors.text}
          opacity="0.85"
        />

        {/* 5. Asosiy raqam yoki matn (Masalan: 777) */}
        <text
          x="50"
          y={sublabel ? '57' : '62'}
          textAnchor="middle"
          fill={colors.text}
          fontSize={label.length > 3 ? '16' : '22'}
          fontFamily="serif"
          fontWeight="900"
          letterSpacing={label.length > 3 ? '0' : '1.5'}
        >
          {label}
        </text>

        {/* 6. Pastki kichik yozuv (ixtiyoriy) */}
        {sublabel && (
          <text
            x="50"
            y="72"
            textAnchor="middle"
            fill={colors.text}
            fontSize="8"
            fontFamily="sans-serif"
            fontWeight="800"
            letterSpacing="1"
            opacity="0.9"
          >
            {sublabel}
          </text>
        )}
      </svg>
    </div>
  );
};
