import React from 'react';

/** Chiziqli tort belgisi. Emoji o‘rnida, konstruktor oldindan ko‘rinishida. */
export function BoutiqueCakeMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      <path d="M16 42h32v6a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4v-6z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M18 42V32h28v10" stroke="currentColor" strokeWidth="1.4" />
      <path d="M24 32V24h16v8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M32 24V16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="32" cy="14" r="1.3" fill="currentColor" />
    </svg>
  );
}

export default BoutiqueCakeMark;
