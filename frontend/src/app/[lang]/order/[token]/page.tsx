import React from 'react';
import type { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { OrderTrackingView } from '../../../../components/order/OrderTrackingView';
import { apiClient } from '../../../../lib/api/client';
import { Order } from '../../../../lib/api/types';

export async function generateMetadata(
  props: {
    params: Promise<{ lang: 'uz' | 'ru'; token: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;

  const {
    lang,
    token
  } = params;

  const isRu = lang === 'ru';
  return {
    title: isRu ? `Отслеживание заказа` : `Buyurtma holati`,
    description: isRu
      ? 'Отслеживайте статус вашего заказа в реальном времени'
      : "Mo'jiza 777 buyurtmangiz holatini real vaqt rejimida kuzatib boring.",
  };
}

export default async function OrderTrackingPage(
  props: {
    params: Promise<{ lang: 'uz' | 'ru'; token: string }>;
  }
) {
  const params = await props.params;

  const {
    lang,
    token
  } = params;

  unstable_setRequestLocale(lang);

  let order: Order;

  try {
    order = await apiClient<Order>(`/api/public/orders/track/${token}`, { lang });
  } catch {
    notFound();
  }

  return <OrderTrackingView initialOrder={order} token={token} locale={lang} />;
}
