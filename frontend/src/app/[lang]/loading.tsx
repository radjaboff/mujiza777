import React from 'react';

// Sahifalar orasida o'tish paytida ko'rsatiladigan yengil "skeleton" komponenti
export default function Loading() {
  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-8 animate-pulse">
      {/* Sarlavha o'rnini egallovchi blok */}
      <div className="h-10 w-48 sm:w-72 rounded-2xl bg-[#E9E5DD] dark:bg-[#243527] mb-8" />
      {/* Kartochkalar to'ri: 8 ta bo'sh kartochka skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl bg-[#E9E5DD] dark:bg-[#243527]" />
        ))}
      </div>
    </div>
  );
}
