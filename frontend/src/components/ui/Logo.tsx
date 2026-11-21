import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  variant?: 'horizontal' | 'emblem';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

export const LogoEmblem: React.FC<{ size?: number; className?: string }> = ({
  size = 64,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 280 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <radialGradient id="emblemGlow" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#36663E" />
          <stop offset="70%" stopColor="#244B2B" />
          <stop offset="100%" stopColor="#1A3820" />
        </radialGradient>
        <linearGradient id="emblemGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDF0CD" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#AA820A" />
        </linearGradient>
        <pattern id="islamicLattice" width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M6 0 L12 6 L6 12 L0 6 Z" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
          <circle cx="6" cy="6" r="1.5" fill="rgba(255,255,255,0.4)" />
        </pattern>
      </defs>

      {/* Tashqi yoritgich (Neon halo) */}
      <circle cx="140" cy="140" r="132" stroke="url(#emblemGold)" strokeWidth="3" opacity="0.85" />
      <circle cx="140" cy="140" r="126" fill="url(#emblemGlow)" />
      
      {/* Ichki oltin hoshiya */}
      <circle cx="140" cy="140" r="121" stroke="url(#emblemGold)" strokeWidth="1.2" strokeDasharray="4 2" opacity="0.6" />

      {/* 777 yozuvi - Barchasi bitta tekis chiziqda, zamonaviy qiya (italic) */}
      <g transform="translate(140, 96)" textAnchor="middle">
        <text x="-25" y="0" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontWeight="700" fontStyle="italic" fontSize="30" fill="#FFFFFF" textAnchor="middle">7</text>
        <text x="0" y="0" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontWeight="800" fontStyle="italic" fontSize="35" fill="#FFFFFF" textAnchor="middle">7</text>
        <text x="25" y="0" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontWeight="700" fontStyle="italic" fontSize="30" fill="#FFFFFF" textAnchor="middle">7</text>
      </g>

      {/* Chapdagi naqsh tasmasi */}
      <rect x="22" y="134" width="34" height="12" fill="url(#islamicLattice)" rx="2" />
      {/* O'ngdagi naqsh tasmasi */}
      <rect x="224" y="134" width="34" height="12" fill="url(#islamicLattice)" rx="2" />

      {/* MO'JIZA yozuvi */}
      <text x="140" y="148" textAnchor="middle" fontFamily="'Playfair Display', Georgia, serif" fontWeight="700" fontSize="37" fill="#FFFFFF" letterSpacing="3">
        MO<tspan fill="#D4AF37">'</tspan>JIZA
      </text>

      {/* shirinliklari yozuvi - Oltin tilla rangda, orasi ochilgan */}
      <text x="140" y="179" textAnchor="middle" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontWeight="600" fontSize="18" fill="url(#emblemGold)" letterSpacing="5">
        shirinliklari
      </text>
    </svg>
  );
};

export const LogoHorizontal: React.FC<{ className?: string; inverted?: boolean }> = ({
  className = 'h-11 sm:h-12 lg:h-14 w-auto',
  inverted = false,
}) => {
  const textColor = inverted ? '#FFFFFF' : 'currentColor';
  const apostropheColor = '#D4AF37';

  return (
    <svg
      viewBox="0 0 348 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none text-[#244B2B] dark:text-white ${className}`}
      textRendering="geometricPrecision"
      shapeRendering="geometricPrecision"
    >
      <defs>
        <linearGradient id="goldTextGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5D982" />
          <stop offset="60%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#AA820A" />
        </linearGradient>
        <radialGradient id="emblemRadialGrad" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#36663E" />
          <stop offset="100%" stopColor="#1B3820" />
        </radialGradient>
      </defs>

      {/* Chapdagi nafis kichik gerb doirasi (Emblem) */}
      <g transform="translate(6, 8)">
        <circle cx="36" cy="36" r="35" fill="url(#emblemRadialGrad)" stroke="#D4AF37" strokeWidth="1.8" />
        
        {/* 777: O'rtadagi 7 biroz kattaroq va tilla, ikki yoni oq */}
        <g transform="translate(36, 40)" textAnchor="middle">
          <text x="-12" y="0" fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" fontWeight="800" fontStyle="italic" fontSize="14" fill="#FFFFFF" textAnchor="middle">7</text>
          <text x="0" y="-2" fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" fontWeight="800" fontStyle="italic" fontSize="19" fill="#D4AF37" textAnchor="middle">7</text>
          <text x="12" y="0" fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" fontWeight="800" fontStyle="italic" fontSize="14" fill="#FFFFFF" textAnchor="middle">7</text>
        </g>
        
        {/* Doira ichidagi kichik MO'JIZA yozuvi */}
        <text x="36" y="55" textAnchor="middle" fontFamily="'Playfair Display', Georgia, serif" fontWeight="700" fontSize="8" fill="#FFFFFF" letterSpacing="1">
          MO'JIZA
        </text>
      </g>

      {/* O'ngdagi asosiy yozuvlar bloki */}
      <g transform="translate(90, 16)">
        {/* MO'JIZA yozuvi */}
        <text
          x="0"
          y="32"
          fontFamily="'Playfair Display', Georgia, 'Times New Roman', serif"
          fontWeight="800"
          fontSize="34"
          fill={textColor}
          letterSpacing="1.2"
          textRendering="geometricPrecision"
        >
          MO<tspan fill={apostropheColor}>'</tspan>JIZA
        </text>
        
        {/* 777 yozuvi - Asl shinam oraliq masofa bilan, hech qachon ustma-ust tushmaydi */}
        <g transform="translate(176, 32)">
          <text x="0" y="0" fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" fontWeight="800" fontStyle="italic" fontSize="22" fill="url(#goldTextGrad)" textRendering="geometricPrecision">7</text>
          <text x="14" y="0" fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" fontWeight="800" fontStyle="italic" fontSize="27" fill="url(#goldTextGrad)" textRendering="geometricPrecision">7</text>
          <text x="29" y="0" fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" fontWeight="800" fontStyle="italic" fontSize="22" fill="url(#goldTextGrad)" textRendering="geometricPrecision">7</text>
        </g>

        {/* Quyi yozuv: shirinliklari - O'ta tiniq, to'yingan tilla rang, markazda */}
        <g transform="translate(0, 52)">
          <text
            x="110"
            y="0"
            textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            fontWeight="700"
            fontSize="13.5"
            fill="url(#goldTextGrad)"
            letterSpacing="5"
            textRendering="geometricPrecision"
          >
            shirinliklari
          </text>
        </g>
      </g>
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'horizontal',
  size = 'md',
  href = '/',
}) => {
  const content =
    variant === 'emblem' ? (
      <LogoEmblem size={size === 'sm' ? 44 : size === 'md' ? 64 : 96} className={className} />
    ) : (
      <LogoHorizontal className={className} />
    );

  if (href) {
    return (
      <Link href={href} className="inline-block hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
