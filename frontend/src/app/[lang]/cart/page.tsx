import React from 'react';
import type { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';
import { CartView } from '../../../components/cart/CartView';
import { apiClient } from '../../../lib/api/client';
import { PublicSettings } from '../../../lib/api/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  props: {
    params: Promise<{ lang: 'uz' | 'ru' }>;
  }
): Promise<Metadata> {
  const params = await props.params;

  const {
    lang
  } = params;

  const isRu = lang === 'ru';
  return {
    title: isRu ? 'Корзина' : 'Savatcha',
    description: isRu
      ? 'Ваша корзина заказов в кондитерской Mujiza 777'
      : "Mo'jiza 777 qandolat do'konidagi tanlagan shirinliklaringiz savatchasi",
  };
}

export default async function CartPage(
  props: {
    params: Promise<{ lang: 'uz' | 'ru' }>;
  }
) {
  const params = await props.params;

  const {
    lang
  } = params;

  unstable_setRequestLocale(lang);

  let settings: PublicSettings | undefined;
  try {
    settings = await apiClient<PublicSettings>('/api/public/settings', { lang });
  } catch {
    // Standart parametrlar
    settings = {
      phone: '+998 93 706 73 21',
      openTime: '09:00:00',
      closeTime: '22:00:00',
      isOpenNow: true,
      acceptingOrders: true,
      deliveryEnabled: true,
      deliveryFee: 15000,
      freeDeliveryFrom: 150000,
      minOrderAmount: 40000,
      cakeMinAdvanceHours: 24,
      telegramUrl: 'https://t.me/mujizashirinliklari777',
      instagramUrl: 'https://instagram.com/mujizashirinliklari777',
    };
  }

  return <CartView locale={lang} settings={settings} />;
}
