'use client';

import React, { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xl">
        ⚠️
      </div>
      <h2 className="text-xl font-bold text-[#1C261E] dark:text-[#F5F2EA]">
        Xatolik yuz berdi
      </h2>
      <p className="text-xs text-[#596B5E] dark:text-[#A6B7AA] max-w-md">
        {error?.message || 'Kechirasiz, sahifani yuklashda kutilmagan xatolik yuz berdi.'}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="px-5 py-2.5 rounded-2xl bg-[#244B2B] text-white text-xs font-bold shadow-md hover:bg-[#1A3720] transition-colors"
      >
        Qayta urinish
      </button>
    </div>
  );
}
