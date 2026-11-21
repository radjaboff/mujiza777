import React from 'react';
import type { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';
import { AboutView } from '../../../components/about/AboutView';

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
    title: isRu ? 'О кондитерском доме Mo‘jiza 777 | Наша история' : "Mo‘jiza 777 qandolat uyi haqida | Bizning tariximiz",
    description: isRu
      ? 'История создания, философия вкуса и традиции качества кондитерского дома Mo‘jiza 777 в городе Карши'
      : "Mo‘jiza 777 qandolat uyi tarixi, tabiiy masalliqlar, statistika va sifat an'analari.",
  };
}

export default async function AboutPage(
  props: {
    params: Promise<{ lang: 'uz' | 'ru' }>;
  }
) {
  const params = await props.params;

  const {
    lang
  } = params;

  unstable_setRequestLocale(lang);
  return <AboutView locale={lang} />;
}
