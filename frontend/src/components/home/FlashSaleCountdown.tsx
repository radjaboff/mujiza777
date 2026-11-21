'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface FlashSaleCountdownProps {
  locale: 'uz' | 'ru';
  targetDate?: string;
}

export const FlashSaleCountdown: React.FC<FlashSaleCountdownProps> = ({ locale, targetDate }) => {
  const isRu = locale === 'ru';
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      let target: Date;
      if (targetDate) {
        target = new Date(targetDate);
      } else {
        // Agar admin sana kiritmagan bo'lsa, bugun kechki 23:59:59 gacha sanaydi
        target = new Date();
        target.setHours(23, 59, 59, 999);
      }

      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (timeLeft.isExpired) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-[#B83A3A] dark:text-[#F87171] border border-[#B83A3A]/30 text-xs font-bold shadow-xs whitespace-nowrap">
        <Clock className="w-3.5 h-3.5 text-[#B83A3A]" />
        <span>{isRu ? 'Акция завершена' : 'Aksiya yakunlandi'}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white/95 dark:bg-[#152217]/95 text-[#B83A3A] dark:text-[#F87171] border border-[#B83A3A]/30 text-xs font-bold shadow-xs whitespace-nowrap">
      <Clock className="w-3.5 h-3.5 animate-pulse text-[#B83A3A] flex-shrink-0" />
      <span className="hidden sm:inline text-[11px] font-semibold text-[#596B5E] dark:text-[#A6B7AA]">
        {isRu ? 'До конца акции:' : 'Tugashiga:'}
      </span>
      <div className="flex items-center gap-1 font-mono font-black text-xs sm:text-sm tracking-wider text-[#B83A3A] dark:text-[#F87171]">
        {timeLeft.days > 0 && (
          <>
            <span className="bg-[#B83A3A]/10 dark:bg-[#B83A3A]/20 px-1 py-0.5 rounded text-[11px] sm:text-xs">
              {timeLeft.days}{isRu ? 'д' : 'k'}
            </span>
            <span className="opacity-60">:</span>
          </>
        )}
        <span className="bg-[#B83A3A]/10 dark:bg-[#B83A3A]/20 px-1 py-0.5 rounded">
          {pad(timeLeft.hours)}
        </span>
        <span className="animate-pulse">:</span>
        <span className="bg-[#B83A3A]/10 dark:bg-[#B83A3A]/20 px-1 py-0.5 rounded">
          {pad(timeLeft.minutes)}
        </span>
        <span className="animate-pulse">:</span>
        <span className="bg-[#B83A3A]/10 dark:bg-[#B83A3A]/20 px-1 py-0.5 rounded">
          {pad(timeLeft.seconds)}
        </span>
      </div>
    </div>
  );
};

export default FlashSaleCountdown;