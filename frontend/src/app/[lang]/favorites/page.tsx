import React from 'react';
import type { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';
import { FavoritesView } from '../../../components/favorites/FavoritesView';

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
    title: isRu ? 'Избранное' : 'Sevimlilar',
    description: isRu
      ? 'Ваши сохраненные кондитерские изделия Mujiza 777'
      : "Mo'jiza 777 da o'zingiz saqlab qo'ygan sevimli shirinliklar.",
  };
}

export default async function FavoritesPage(
  props: {
    params: Promise<{ lang: 'uz' | 'ru' }>;
  }
) {
  const params = await props.params;

  const {
    lang
  } = params;

  unstable_setRequestLocale(lang);
  return <FavoritesView locale={lang} />;
}
