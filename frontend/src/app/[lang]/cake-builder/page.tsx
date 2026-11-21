import React from 'react';
import type { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';
import { CakeBuilderView } from '../../../components/cake-builder/CakeBuilderView';

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
    title: isRu ? 'Конструктор тортов на заказ' : 'Buyurtmaga tort tayyorlash',
    description: isRu
      ? 'Создайте свой идеальный торт онлайн: выберите форму, начинку, крем и надпись в Mujiza 777 Карши'
      : "Mo'jiza 777 da o'zingiz istagan tortni online konstruktor yordamida loyihalashtiring va buyurtma bering.",
  };
}

export default async function CakeBuilderPage(
  props: {
    params: Promise<{ lang: 'uz' | 'ru' }>;
  }
) {
  const params = await props.params;

  const {
    lang
  } = params;

  unstable_setRequestLocale(lang);
  return <CakeBuilderView locale={lang} />;
}
