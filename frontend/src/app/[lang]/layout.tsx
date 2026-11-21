import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { locales, Locale } from '../../i18n';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import MobileNav from '../../components/layout/MobileNav';
import FloatingSupport from '../../components/ui/FloatingSupport';
import BakeryAtmosphere from '../../components/ui/BakeryAtmosphere';
import Providers from '../../components/providers/Providers';
import { apiClient } from '../../lib/api/client';
import { PublicSettings } from '../../lib/api/types';

export async function generateMetadata(
  props: {
    params: Promise<{ lang: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;

  const {
    lang
  } = params;

  const isRu = lang === 'ru';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mujiza777.uz';

  const title = isRu
    ? 'Кондитерский дом Mo‘jiza 777 в Карши — торты, десерты и выпечка на заказ'
    : 'Mo‘jiza 777 — Qarshi shahridagi mashhur shirinliklar va tortlar qandolat uyi';

  const description = isRu
    ? 'Официальный сайт кондитерского дома Mo‘jiza 777 в Карши. Более 200 видов свежих десертов, свадебные и праздничные торты на заказ, бенто, эклеры и круассаны. Быстрая доставка по городу Карши за 35 минут.'
    : "«Mo‘jiza 777 shirinliklari» rasmiy veb-sayti. Qarshi shahrida 200 dan ortiq sara shirinliklar, to‘y va tug‘ilgan kun tortlari, bento-tortlar, issiq kruassanlar. Shahar bo‘ylab 35 daqiqada tezkor yetkazib berish.";

  const keywords = isRu
    ? [
        'мужиза 777',
        'муджиза 777',
        'мужиза 777 карши',
        'кондитерская карши',
        'торты в карши',
        'заказ тортов карши',
        'бенто торты карши',
        'сладости карши',
        'доставка тортов карши',
        'выпечка карши',
        'свадебный торт карши',
        'mojiza 777',
        'mujiza 777',
      ]
    : [
        'mojiza 777',
        'mo\'jiza 777',
        'mujiza 777',
        'mojiza 777 shirinliklari',
        'mojiza 777 web sayti',
        'qarshi shirinliklar',
        'qarshida tort buyurtma qilish',
        'qarshi bento tort',
        'to\'y tortlari qarshi',
        'qandolat uyi qarshi',
        'yetkazib berish qarshi',
        'shirinliklar uyi qarshi',
        'buyurtmaga tort tayyorlash',
        'mojizashirinliklari777',
      ];

  return {
    metadataBase: new URL(siteUrl),
    title: {
      template: "%s | Mo‘jiza 777",
      default: title,
    },
    description,
    keywords,
    authors: [{ name: 'Mo‘jiza 777', url: siteUrl }],
    creator: 'Mo‘jiza 777',
    publisher: 'Mo‘jiza 777 Shirinliklari',
    alternates: {
      canonical: `${siteUrl}/${lang}`,
      languages: {
        'uz-UZ': `${siteUrl}/uz`,
        'ru-RU': `${siteUrl}/ru`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${lang}`,
      siteName: isRu ? 'Кондитерский дом Mo‘jiza 777' : 'Mo‘jiza 777 Shirinliklari',
      locale: isRu ? 'ru_RU' : 'uz_UZ',
      type: 'website',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&auto=format&fit=crop&q=80',
          width: 1200,
          height: 630,
          alt: 'Mo‘jiza 777 qandolat uyi tortlari va shirinliklari',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&auto=format&fit=crop&q=80'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.png', type: 'image/png', sizes: '128x128' },
        { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
        { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
      ],
      apple: [
        { url: '/apple-icon', sizes: '180x180', type: 'image/png' },
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
      shortcut: '/favicon.svg',
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

export default async function RootLocaleLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
  }
) {
  const params = await props.params;
  const {
    lang
  } = params;

  const {
    children
  } = props;

  if (!locales.includes(lang as Locale)) {
    notFound();
  }

  const locale = lang as Locale;
  unstable_setRequestLocale(locale);
  const messages = await getMessages({ locale });

  let settings: PublicSettings | null = null;
  try {
    settings = await apiClient<PublicSettings>('/api/public/settings', { lang: locale });
  } catch {}

  const themeAttr = settings?.seasonTheme && settings.seasonTheme !== 'DEFAULT' 
    ? settings.seasonTheme 
    : undefined;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mujiza777.uz';

  // Google Knowledge Graph uchun Schema.org Mikroformati (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Bakery',
        '@id': `${siteUrl}/#bakery`,
        name: "Mo‘jiza 777 — Qandolat uyi",
        alternateName: [
          'Mujiza 777',
          'Mo\'jiza 777',
          'Mo‘jiza shirinliklari',
          'mujizashirinliklari777',
          'Кондитерский дом Мужиза 777',
        ],
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&auto=format&fit=crop&q=80',
        description: 'Qarshi shahridagi mashhur shirinliklar va maxsus tortlar qandolat uyi. 200 dan ortiq turdagi shirinliklar, buyurtmaga to‘y tortlari va 35 daqiqada tezkor yetkazish.',
        telephone: '+998937067321',
        priceRange: '$$',
        servesCuisine: ['Pastry', 'Bakery', 'Cakes', 'Desserts', 'Halal'],
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Islom Karimov ko\'chasi 14',
          addressLocality: 'Qarshi',
          addressRegion: 'Qashqadaryo',
          addressCountry: 'UZ',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 38.8354,
          longitude: 65.7923,
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ],
            opens: '09:00',
            closes: '22:00',
          },
        ],
        sameAs: [
          'https://instagram.com/mujizashirinliklari777',
          'https://t.me/Karshi777Shirinliklari',
          'https://t.me/mujizashirinliklari777',
        ],
        hasMenu: `${siteUrl}/${locale}/catalog`,
        department: [
          {
            '@type': 'Bakery',
            name: "Mo‘jiza 777 Markaziy filial (Markaz)",
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Islom Karimov ko\'chasi 14',
              addressLocality: 'Qarshi',
              addressCountry: 'UZ',
            },
            telephone: '+998937067321',
          },
          {
            '@type': 'Bakery',
            name: "Mo‘jiza 777 Nasaf filiali",
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Nasaf ko\'chasi 48',
              addressLocality: 'Qarshi',
              addressCountry: 'UZ',
            },
            telephone: '+998937067322',
          },
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Mo‘jiza 777',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/${locale}/catalog?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <Providers>
      {/* Tungi / Kunduzgi mavzuni dastlabki miltillashsiz yuklash */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var saved = localStorage.getItem('mujiza_theme');
                var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (saved === 'dark' || (!saved && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })();
          `,
        }}
      />

      {/* Google va Yandex Qidiruv robotlari uchun Rasmiy Schema.org Strukturasi */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Telegram WebApp (Mini App) skripti */}
      <script src="https://telegram.org/js/telegram-web-app.js" async />

      <NextIntlClientProvider locale={locale} messages={messages}>
        <div data-theme={themeAttr} className="min-h-screen flex flex-col flex-1 relative overflow-x-hidden max-w-full w-full">
          <BakeryAtmosphere />
          <Header locale={locale} initialSettings={settings} />
          <main className="flex-1 relative z-10 overflow-x-hidden max-w-full w-full">{children}</main>
          <Footer locale={locale} settings={settings} />
          <FloatingSupport locale={locale} />
          <MobileNav locale={locale} />
        </div>
      </NextIntlClientProvider>
    </Providers>
  );
}
