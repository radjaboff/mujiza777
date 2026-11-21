import React from 'react';
import type { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';
import { PromotionsView } from '../../../components/promotions/PromotionsView';
import { apiClient } from '../../../lib/api/client';
import { Promotion } from '../../../lib/api/types';

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
    title: isRu ? 'Акции и скидки | Mo‘jiza 777' : 'Aksiyalar va maxsus takliflar | Mo‘jiza 777',
    description: isRu
      ? 'Акции, скидки, промокоды и подарки кондитерского дома Mujiza 777 в городе Карши'
      : "Mo'jiza 777 qandolat uyi aksiyalari, promokodlari, chegirmalari va sovg'abop to'plamlari.",
  };
}

export default async function PromotionsPage(
  props: {
    params: Promise<{ lang: 'uz' | 'ru' }>;
  }
) {
  const params = await props.params;

  const {
    lang
  } = params;

  unstable_setRequestLocale(lang);
  const isRu = lang === 'ru';

  let promotions: Promotion[] = [];
  try {
    promotions = await apiClient<Promotion[]>('/api/public/promotions', { lang });
  } catch {
    promotions = [];
  }

  return <PromotionsView promotions={promotions} locale={lang} />;
}
