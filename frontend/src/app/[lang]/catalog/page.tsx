import React from 'react';
import type { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';
import { CatalogView } from '../../../components/catalog/CatalogView';
import { Category, ProductCard as ProductCardType, PageResponse } from '../../../lib/api/types';
import { apiClient } from '../../../lib/api/client';
import { ALL_DEMO_PRODUCTS } from '../../../lib/products-data';

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
    title: isRu ? 'Каталог кондитерских изделий и тортов' : 'Shirinliklar va tortlar katalogi',
    description: isRu
      ? 'Полный каталог кондитерских изделий Mujiza 777 в Карши: торты, бенто, пирожные, выпечка с доставкой'
      : "Qarshi shahridagi Mujiza 777 qandolat uyi sara shirinliklari: tortlar, bento, pishiriqlar, ruletlar yetkazib berish bilan.",
  };
}

export default async function CatalogPage(
  props: {
    params: Promise<{ lang: 'uz' | 'ru' }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const {
    lang
  } = params;

  unstable_setRequestLocale(lang);

  const isRu = lang === 'ru';

  const DEFAULT_CATEGORIES: Category[] = [
    { 
      id: 1, 
      name: isRu ? 'Круглые торты' : 'Yumaloq tortlar', 
      slug: 'tortlar', 
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150&auto=format&fit=crop&q=80' 
    },
    { 
      id: 2, 
      name: isRu ? 'Мини-торты (Бенто)' : 'Mini-tortlar (Bento)', 
      slug: 'mini-tortlar', 
      imageUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=150&auto=format&fit=crop&q=80' 
    },
    { 
      id: 3, 
      name: isRu ? 'Рулеты и десерты' : 'Ruletlar va desertlar', 
      slug: 'ruletlar', 
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=150&auto=format&fit=crop&q=80' 
    },
    { 
      id: 4, 
      name: isRu ? 'Пирожные и эклеры' : 'Pirojniylar & Eklerlar', 
      slug: 'pirojniylar', 
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop&q=80' 
    },
    { 
      id: 5, 
      name: isRu ? 'Выпечка и круассаны' : 'Pishiriqlar & Kruassanlar', 
      slug: 'pishiriqlar', 
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=150&auto=format&fit=crop&q=80' 
    },
    { 
      id: 6, 
      name: isRu ? 'Французские макаронс' : 'Fransuz makaronlari', 
      slug: 'shirinliklar', 
      imageUrl: 'https://images.unsplash.com/photo-1569864321398-34823a9d9e4a?w=150&auto=format&fit=crop&q=80' 
    },
    { 
      id: 7, 
      name: isRu ? 'Кофе и авторский чай' : 'Qahva va choylar', 
      slug: 'ichimliklar', 
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150&auto=format&fit=crop&q=80' 
    },
  ];

  let categories: Category[] = DEFAULT_CATEGORIES;
  let products: ProductCardType[] = [];
  let totalElements = 0;

  const [categoriesRes, productsRes] = await Promise.allSettled([
    apiClient<Category[]>('/api/public/categories', { lang }),
    apiClient<PageResponse<ProductCardType>>('/api/public/products', {
      lang,
      params: {
        ...searchParams,
        size: 60,
      },
    }),
  ]);

  if (categoriesRes.status === 'fulfilled' && categoriesRes.value && categoriesRes.value.length > 0) {
    categories = categoriesRes.value;
  }

  if (productsRes.status === 'fulfilled' && productsRes.value) {
    products = productsRes.value.content || [];
    totalElements = productsRes.value.totalElements || products.length;
  }

  if (products.length === 0) {
    products = ALL_DEMO_PRODUCTS.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      oldPrice: p.oldPrice,
      unitType: p.unitType,
      weightLabel: p.weightLabel,
      imageUrl: p.imageUrl,
      isAvailable: p.isAvailable,
      isPopular: p.isPopular,
      isNew: p.isNew,
      prepTimeMinutes: p.prepTimeMinutes,
      discountEndsAt: p.discountEndsAt,
      categorySlug: p.categorySlug,
      categoryName: p.categoryName,
      allergens: p.allergens,
      dietTags: p.dietTags,
      minQuantity: p.minQuantity,
      quantityStep: p.quantityStep,
    }));
    totalElements = products.length;
  }

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-2 sm:pt-8 pb-4 sm:pb-10">
      <React.Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center text-[#596B5E] text-sm font-medium">
            Yuklanmoqda...
          </div>
        }
      >
        <CatalogView
          locale={lang}
          categories={categories}
          initialProducts={products}
          totalElements={totalElements}
        />
      </React.Suspense>
    </div>
  );
}
