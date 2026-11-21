import React from 'react';
import type { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';
import { CheckoutView } from '../../../components/checkout/CheckoutView';
import { apiClient } from '../../../lib/api/client';
import { PublicSettings, Branch } from '../../../lib/api/types';

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
    title: isRu ? 'Оформление заказа' : 'Buyurtmani rasmiylashtirish',
    description: isRu
      ? 'Быстрое и удобное оформление заказа сладостей Mujiza 777 в Карши'
      : "Mo'jiza 777 shirinliklari va tortlarini buyurtma qilish va tez yetkazib berish.",
  };
}

export default async function CheckoutPage(
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
  let branches: Branch[] = [];

  try {
    settings = await apiClient<PublicSettings>('/api/public/settings', { lang });
  } catch {
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

  try {
    branches = await apiClient<Branch[]>('/api/public/branches', { lang });
  } catch {
    branches = [
      {
        id: 1,
        name: lang === 'ru' ? 'Главный филиал (Центр)' : 'Markaziy filial (Markaz)',
        address: lang === 'ru' ? 'г. Карши, ул. Ислама Каримова, 14' : "Qarshi sh., Islom Karimov ko'chasi 14",
        phone: '+998 93 706 73 21',
        workHours: '09:00 - 22:00',
        latitude: 38.8354,
        longitude: 65.7923,
        imageUrl: null,
        isPickupAvailable: true,
      },
      {
        id: 2,
        name: lang === 'ru' ? 'Филиал Насаф' : 'Nasaf filiali',
        address: lang === 'ru' ? 'г. Карши, ул. Насаф, 48' : "Qarshi sh., Nasaf ko'chasi 48",
        phone: '+998 93 706 73 22',
        workHours: '09:00 - 21:00',
        latitude: 38.8451,
        longitude: 65.8012,
        imageUrl: null,
        isPickupAvailable: true,
      },
    ];
  }

  return <CheckoutView locale={lang} settings={settings} branches={branches} />;
}
