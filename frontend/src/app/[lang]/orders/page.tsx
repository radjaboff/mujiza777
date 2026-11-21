import React from 'react';
import type { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';
import { MyOrdersView } from '../../../components/order/MyOrdersView';

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
    title: isRu ? 'Мои заказы' : 'Mening buyurtmalarim',
    description: isRu
      ? 'История и отслеживание ваших недавних заказов в Mujiza 777'
      : "Mo'jiza 777 da bergan oxirgi buyurtmalaringiz va ularni kuzatish.",
  };
}

export default async function MyOrdersPage(
  props: {
    params: Promise<{ lang: 'uz' | 'ru' }>;
  }
) {
  const params = await props.params;

  const {
    lang
  } = params;

  unstable_setRequestLocale(lang);
  return <MyOrdersView locale={lang} />;
}
