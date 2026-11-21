import React from 'react';
import type { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';
import { CateringView } from '../../../components/catering/CateringView';

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
    title: isRu ? 'Свадьбы, банкеты и торты на заказ | Mo‘jiza 777' : 'To‘y va marosimlar uchun shirinliklar va tortlar | Mo‘jiza 777',
    description: isRu
      ? 'Заказ эксклюзивных многоярусных свадебных тортов, оформление Candy Bar и десертных столов для торжеств в Карши.'
      : 'Qarshi shahrida to‘y, yubiley va tantanalar uchun 3–5 qavatli shohona to‘y tortlari va shirinliklar stoli buyurtmasi.',
  };
}

export default async function CateringPage(
  props: {
    params: Promise<{ lang: 'uz' | 'ru' }>;
  }
) {
  const params = await props.params;

  const {
    lang
  } = params;

  unstable_setRequestLocale(lang);
  return <CateringView locale={lang} />;
}
