'use client';

import React from 'react';
import { Send } from 'lucide-react';

interface FloatingSupportProps {
  locale: 'uz' | 'ru';
  telegramUrl?: string;
  phone?: string;
}

export const FloatingSupport: React.FC<FloatingSupportProps> = ({
  locale,
  telegramUrl = 'https://t.me/mujizashirinliklari777',
}) => {
  const isRu = locale === 'ru';

  return (
    <aside aria-label="Tezkor Telegram aloqa" className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-40 pointer-events-auto max-w-[calc(100vw-24px)] overflow-hidden">
      {/* Faqat toza, xalaqit bermaydigan suzuvchi Telegram tugmasi */}
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-center w-12 h-12 sm:w-auto sm:h-12 sm:px-4 rounded-full bg-gradient-to-r from-[#244B2B] to-[#1E3D24] text-white shadow-lg hover:shadow-2xl border border-[#D4AF37]/50 transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Telegram orqali yozish"
        title={isRu ? 'Написать в Telegram' : 'Telegram orqali yozish'}
      >
        <div className="w-7 h-7 rounded-full bg-[#D4AF37] text-[#1C261E] flex items-center justify-center flex-shrink-0 shadow-xs group-hover:rotate-12 transition-transform">
          <Send className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-bold tracking-wide pl-2 pr-1 hidden sm:inline-block">
          {isRu ? 'Написать в Telegram' : 'Telegram yordam'}
        </span>
      </a>
    </aside>
  );
};

export default FloatingSupport;
