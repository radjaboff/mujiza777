import type { MetadataRoute } from 'next';
import { apiClient } from '../lib/api/client';
import type { Category, PageResponse, ProductCard, Promotion } from '../lib/api/types';

export const dynamic = 'force-dynamic';

const coreRoutes = [
  '', '/catalog', '/branches', '/about', '/cake-builder', '/catering',
  '/promotions', '/delivery-payment', '/offer', '/privacy',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mujiza777.uz';
  const now = new Date();
  const languages = ['uz', 'ru'] as const;
  const dataByLanguage = await Promise.all(languages.map(async (lang) => {
    const [categoryResult, promotionResult] = await Promise.allSettled([
      apiClient<Category[]>('/api/public/categories', { lang }),
      apiClient<Promotion[]>('/api/public/promotions', { lang }),
    ]);
    const products: ProductCard[] = [];
    for (let page = 0; page < 100; page += 1) {
      try {
        const result = await apiClient<PageResponse<ProductCard>>('/api/public/products', {
          lang,
          params: { size: 50, page },
        });
        products.push(...result.content);
        if (result.last || result.content.length === 0) break;
      } catch {
        break;
      }
    }
    return {
      lang,
      categories: categoryResult.status === 'fulfilled' ? categoryResult.value : [],
      products,
      promotions: promotionResult.status === 'fulfilled' ? promotionResult.value : [],
    };
  }));

  const entries: MetadataRoute.Sitemap = [];
  for (const lang of languages) {
    for (const route of coreRoutes) {
      entries.push({
        url: `${baseUrl}/${lang}${route}`,
        lastModified: now,
        changeFrequency: route === '' || route === '/catalog' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : route === '/catalog' || route === '/branches' ? 0.9 : 0.7,
      });
    }
    const data = dataByLanguage.find((item) => item.lang === lang);
    for (const category of data?.categories || []) {
      entries.push({
        url: `${baseUrl}/${lang}/catalog/${category.slug}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      });
    }
    for (const product of data?.products || []) {
      entries.push({
        url: `${baseUrl}/${lang}/product/${product.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
    for (const promotion of data?.promotions || []) {
      entries.push({
        url: `${baseUrl}/${lang}/promotions/${promotion.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  }
  return entries;
}
