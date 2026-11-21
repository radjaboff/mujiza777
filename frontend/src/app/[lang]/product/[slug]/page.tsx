import React from 'react';
import type { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';
import { ProductDetailView } from '../../../../components/product/ProductDetailView';
import { ProductDetail, ProductCard, PageResponse } from '../../../../lib/api/types';
import { apiClient } from '../../../../lib/api/client';
import { ALL_DEMO_PRODUCTS, getDemoProductBySlug } from '../../../../lib/products-data';
import { notFound } from 'next/navigation';

export const revalidate = 60; // TZ 10-bo'lim: revalidate har 60 soniyada

export async function generateMetadata(
  props: {
    params: Promise<{ lang: 'uz' | 'ru'; slug: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;

  const {
    lang,
    slug
  } = params;

  let product: ProductDetail | undefined;
  try {
    product = await apiClient<ProductDetail>(`/api/public/products/${slug}`, { lang });
  } catch {
    if (process.env.NODE_ENV !== 'production') {
      product = ALL_DEMO_PRODUCTS.find((p) => p.slug === slug);
    }
  }

  if (!product) {
    return {
      title: lang === 'ru' ? 'Товар не найден | Mo‘jiza 777' : 'Mahsulot topilmadi | Mo‘jiza 777',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mujiza777.uz';
  const imageUrl = product.imageUrl?.startsWith('http')
    ? product.imageUrl
    : `${siteUrl}${product.imageUrl || '/logo.png'}`;

  return {
    title: `${product.name} | Mo‘jiza 777`,
    description:
      product.description ||
      `${product.name} — Qarshi shahridagi Mo‘jiza 777 qandolat uyining eksklyuziv shirinligi.`,
    openGraph: {
      title: `${product.name} — ${product.price} so'm`,
      description: product.description || 'Mo‘jiza 777 qandolat uyi',
      images: [{ url: imageUrl, alt: product.name }],
    },
  };
}

export default async function ProductDetailPage(
  props: {
    params: Promise<{ lang: 'uz' | 'ru'; slug: string }>;
  }
) {
  const params = await props.params;

  const {
    lang,
    slug
  } = params;

  unstable_setRequestLocale(lang);

  let product: ProductDetail;
  let relatedProducts: ProductCard[] = [];

  const [productRes, relatedRes] = await Promise.allSettled([
    apiClient<ProductDetail>(`/api/public/products/${slug}`, { lang }),
    apiClient<PageResponse<ProductCard>>('/api/public/products', {
      lang,
      params: { size: 6 },
    }),
  ]);

  if (productRes.status === 'fulfilled' && productRes.value) {
    product = productRes.value;
  } else {
    const fallback = ALL_DEMO_PRODUCTS.find((p) => p.slug === slug) || getDemoProductBySlug(slug, lang);
    if (!fallback) {
      notFound();
    }
    product = fallback;
  }

  if (relatedRes.status === 'fulfilled' && relatedRes.value) {
    relatedProducts = (relatedRes.value.content || []).filter((p) => p.slug !== slug).slice(0, 4);
  } else {
    relatedProducts = ALL_DEMO_PRODUCTS.filter((p) => p.slug !== slug).slice(0, 4);
  }

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-6 sm:pt-10 pb-28 sm:pb-16">
      <ProductDetailView product={product} relatedProducts={relatedProducts} locale={lang} />
    </div>
  );
}
