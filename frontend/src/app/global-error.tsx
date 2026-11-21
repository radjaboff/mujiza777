'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="uz">
      <body className="min-h-screen bg-[#FBF9F4] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#244B2B] text-[#D4AF37] flex items-center justify-center text-2xl shadow-md">
          🍰
        </div>
        <h2 className="text-xl font-bold text-[#1C261E]">
          Tizimda xatolik yuz berdi
        </h2>
        <p className="text-xs text-[#596B5E] max-w-md">
          Iltimos, sahifani qayta yuklang yoki birozdan so‘ng urinib ko‘ring.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="px-6 py-2.5 rounded-2xl bg-[#244B2B] text-white text-xs font-bold shadow-md hover:bg-[#1A3720]"
        >
          Qayta yuklash
        </button>
      </body>
    </html>
  );
}
