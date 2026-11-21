'use client';

import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('mujiza_theme') as Theme | null;
      if (saved === 'dark' || saved === 'light') {
        setTheme(saved);
        if (saved === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initial: Theme = prefersDark ? 'dark' : 'light';
        setTheme(initial);
        if (initial === 'dark') {
          document.documentElement.classList.add('dark');
        }
      }
    } catch {}

    const handleThemeChange = (e: any) => {
      if (e.detail && (e.detail === 'dark' || e.detail === 'light')) {
        setTheme(e.detail);
      }
    };
    window.addEventListener('mujiza_theme_changed', handleThemeChange);
    return () => window.removeEventListener('mujiza_theme_changed', handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('mujiza_theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      window.dispatchEvent(new CustomEvent('mujiza_theme_changed', { detail: nextTheme }));
    } catch {}
  };

  return {
    theme,
    isDark: mounted ? theme === 'dark' : false,
    toggleTheme,
    mounted,
  };
}
