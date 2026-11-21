'use client';

import { useEffect } from 'react';

/**
 * Telegram WebApp (Mini App) muhitida ochilganda Telegram API bilan sinxronlash:
 * - Saytni to'liq ekranga yoyish (expand)
 * - Telegram header rangini brend rangiga moslash
 * - WebApp tayyor ekanligini xabar qilish (ready)
 */
export default function TelegramWebAppProvider() {
  useEffect(() => {
    // Brauzer yoki Telegram WebApp mavjudligini tekshirish
    if (typeof window !== 'undefined') {
      const tg = (window as unknown as { Telegram?: { WebApp?: {
        ready: () => void;
        expand: () => void;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        enableClosingConfirmation?: () => void;
      } } })?.Telegram?.WebApp;

      if (tg) {
        try {
          tg.ready();
          tg.expand();
          if (tg.setHeaderColor) {
            tg.setHeaderColor('#FAF8F5');
          }
          if (tg.setBackgroundColor) {
            tg.setBackgroundColor('#FAF8F5');
          }
          if (tg.enableClosingConfirmation) {
            tg.enableClosingConfirmation();
          }
        } catch {
          // Oddiy brauzerda ochilgan bo'lsa xatosiz davom etadi
        }
      }
    }
  }, []);

  return null;
}
