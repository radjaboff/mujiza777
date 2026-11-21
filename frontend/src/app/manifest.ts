import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mo‘jiza 777 — Qandolat Uyi',
    short_name: 'Mo‘jiza 777',
    description: 'Qarshi shahridagi eng sara tortlar va shirinliklar qandolat uyi',
    start_url: '/',
    display: 'standalone',
    background_color: '#FBF9F4',
    theme_color: '#244B2B',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
