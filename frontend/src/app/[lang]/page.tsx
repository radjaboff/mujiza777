import React from 'react';
import Link from 'next/link';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { ArrowRight, Sparkles, Flame } from 'lucide-react';
import { HeroSlider } from '../../components/home/HeroSlider';
import { TrustGuarantees } from '../../components/home/TrustGuarantees';
import { CategoryCapsules } from '../../components/home/CategoryCapsules';
import { AtmosphereSection } from '../../components/home/AtmosphereSection';
import { CakeBuilderCta } from '../../components/home/CakeBuilderCta';
import { HowItWorksSection } from '../../components/home/HowItWorksSection';
import { VIPEventCatering } from '../../components/home/VIPEventCatering';
import { BranchesSection } from '../../components/home/BranchesSection';
import { FlashSaleCountdown } from '../../components/home/FlashSaleCountdown';
import { ProductCard } from '../../components/catalog/ProductCard';
import { ScrollReveal } from '../../components/ui/ScrollReveal';
import { StaggerContainer, StaggerItem } from '../../components/ui/StaggerContainer';
import { PastryWaveDivider } from '../../components/ui/PastryWaveDivider';
import { Category, ProductCard as ProductCardType, Promotion, PageResponse, Branch } from '../../lib/api/types';
import { ALL_DEMO_PRODUCTS } from '../../lib/products-data';
import { apiClient } from '../../lib/api/client';

export const dynamic = 'force-dynamic';

export default async function HomePage(
  props: {
    params: Promise<{ lang: 'uz' | 'ru' }>;
  }
) {
  const params = await props.params;

  const {
    lang
  } = params;

  unstable_setRequestLocale(lang);
  const t = await getTranslations({ locale: lang, namespace: 'Home' });
  const tc = await getTranslations({ locale: lang, namespace: 'Common' });

  // 1. Backenddan ma'lumotlarni parallel, chaqmoqdek tez yuklash (Promise.allSettled)
  let banners: Promotion[] = [];
  let categories: Category[] = [];
  let popularProducts: ProductCardType[] = [];
  let newProducts: ProductCardType[] = [];
  let discountedProducts: ProductCardType[] = [];
  let branches: Branch[] = [];

  const [branchesRes, bannersRes, categoriesRes, productsRes] = await Promise.allSettled([
    apiClient<Branch[]>('/api/public/branches', { lang }),
    apiClient<Promotion[]>('/api/public/banners', { lang }),
    apiClient<Category[]>('/api/public/categories', { lang }),
    apiClient<PageResponse<ProductCardType>>('/api/public/products', {
      lang,
      params: { size: 24 },
    }),
  ]);

  if (branchesRes.status === 'fulfilled') branches = branchesRes.value || [];
  if (bannersRes.status === 'fulfilled') banners = bannersRes.value || [];
  if (categoriesRes.status === 'fulfilled') categories = categoriesRes.value || [];
  if (productsRes.status === 'fulfilled') {
    const allProducts = productsRes.value?.content || [];
    popularProducts = allProducts.filter((p) => p.isPopular).slice(0, 4);
    newProducts = allProducts.filter((p) => p.isNew).slice(0, 4);
    discountedProducts = allProducts.filter((p) => p.oldPrice && p.oldPrice > p.price).slice(0, 3);
  }

  const DEFAULT_CATEGORIES: Category[] = [
    { id: 1, name: lang === 'ru' ? 'Круглые торты' : 'Yumaloq tortlar', slug: 'tortlar', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150&auto=format&fit=crop&q=80' },
    { id: 2, name: lang === 'ru' ? 'Мини-tortlar (Бенто)' : 'Mini-tortlar (Bento)', slug: 'mini-tortlar', imageUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=150&auto=format&fit=crop&q=80' },
    { id: 3, name: lang === 'ru' ? 'Рулеты и десерты' : 'Ruletlar va desertlar', slug: 'ruletlar', imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=150&auto=format&fit=crop&q=80' },
    { id: 4, name: lang === 'ru' ? 'Пирожные и эклеры' : 'Pirojniylar & Eklerlar', slug: 'pirojniylar', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop&q=80' },
    { id: 5, name: lang === 'ru' ? 'Выпечка и круассаны' : 'Pishiriqlar & Kruassanlar', slug: 'pishiriqlar', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=150&auto=format&fit=crop&q=80' },
    { id: 6, name: lang === 'ru' ? 'Французские макаронс' : 'Fransuz makaronlari', slug: 'shirinliklar', imageUrl: 'https://images.unsplash.com/photo-1569864321398-34823a9d9e4a?w=150&auto=format&fit=crop&q=80' },
    { id: 7, name: lang === 'ru' ? 'Кофе и напитки' : 'Qahva va choylar', slug: 'ichimliklar', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150&auto=format&fit=crop&q=80' },
  ];

  if (categories.length === 0) categories = DEFAULT_CATEGORIES;

  if (popularProducts.length === 0) {
    const allProducts = ALL_DEMO_PRODUCTS;
    popularProducts = allProducts.filter((p) => p.isPopular).slice(0, 4);
    newProducts = allProducts.filter((p) => p.isNew).slice(0, 4);
    discountedProducts = allProducts.filter((p) => p.oldPrice && p.oldPrice > p.price).slice(0, 3);
  }

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-3 sm:py-8 space-y-6 sm:space-y-12 overflow-x-hidden w-full max-w-full">
      
      {/* 1. Hero Slayder (Ishtahaochar 3D-fotosuratlar va animatsiyalar bilan) */}
      <section>
        <HeroSlider locale={lang} banners={banners} />
      </section>

      {/* Shohona Qandolat To'lqini (Artisan Pastry Wave Divider) */}
      <PastryWaveDivider variant="gold" className="-my-1 sm:-my-2" />

      {/* 2. Safia uslubidagi Kapsula Kartochkalar vitrinasi (Katalog doim birinchi) */}
      <ScrollReveal yOffset={16}>
        <CategoryCapsules locale={lang} categories={categories} />
      </ScrollReveal>

      {/* 4. Mo‘jiza 777 ning 4 ta oltin kafolati (Telefonda ixcham 1 qator, kompyuterda 4 ta karta) */}
      <ScrollReveal yOffset={20}>
        <TrustGuarantees locale={lang} />
      </ScrollReveal>

      {/* 5. Kun taklifi & Flash Sale (Jonli orqaga sanovchi taymer bilan) */}
      {discountedProducts.length > 0 && (
        <ScrollReveal yOffset={24}>
          <section className="p-3 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#B83A3A]/[0.08] via-[#FDF0CD]/30 to-[#244B2B]/[0.08] dark:from-[#B83A3A]/20 dark:via-[#19271D] dark:to-[#122216] border border-[#B83A3A]/25 dark:border-[#B83A3A]/30 space-y-3 sm:space-y-6 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#B83A3A] text-white flex items-center justify-center shadow-xs flex-shrink-0">
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-serif font-bold text-base sm:text-2xl text-[#1C261E] dark:text-[#F5F2EA] leading-tight truncate">
                    {t('discountTitle')}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-[#596B5E] dark:text-[#A6B7AA] truncate">
                    {t('discountSubtitle')}
                  </p>
                </div>
              </div>

              {/* Jonli Flash Sale Taymeri */}
              <FlashSaleCountdown 
                locale={lang} 
                targetDate={discountedProducts[0]?.discountEndsAt || undefined} 
              />
            </div>

            <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-6">
              {discountedProducts.map((product, idx) => (
                <StaggerItem key={product.id}>
                  <ProductCard product={product} locale={lang} priority={idx < 4} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        </ScrollReveal>
      )}

      {/* Mayin Zumrad-Oltin To'lqin (Faqat planshet va kompyuterda) */}
      <PastryWaveDivider variant="emerald" flip className="hidden md:block -my-2 sm:-my-4" />

      {/* 6. Do'kon Atmosferasi & Jonli Galereya (Kompyuterda tanaffus) */}
      <ScrollReveal yOffset={24}>
        <AtmosphereSection locale={lang} />
      </ScrollReveal>

      {/* 7. Mashhur shirinliklar (Popular) */}
      <ScrollReveal yOffset={24}>
        <section className="space-y-3.5 sm:space-y-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#AA820A]/10 dark:bg-[#AA820A]/20 text-[#AA820A] dark:text-[#E5C358] flex items-center justify-center shadow-xs flex-shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-serif font-bold text-base sm:text-2xl text-[#1C261E] dark:text-[#F5F2EA] leading-tight truncate">
                  {t('popularTitle')}
                </h2>
                <p className="text-[11px] sm:text-xs text-[#596B5E] dark:text-[#A6B7AA] truncate">
                  {t('popularSubtitle')}
                </p>
              </div>
            </div>

            <Link
              href={`/${lang}/catalog?sort=popular`}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#28392B] hover:border-[#244B2B] dark:hover:border-[#D4AF37] text-xs font-bold text-[#244B2B] dark:text-[#E5C358] shadow-xs transition-all whitespace-nowrap flex-shrink-0 hover:scale-105 active:scale-95"
            >
              <span className="hidden sm:inline">{tc('viewAll')}</span>
              <span className="sm:hidden">{lang === 'ru' ? 'Все' : 'Barchasi'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {popularProducts.map((product, idx) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} locale={lang} priority={idx < 4} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      </ScrollReveal>

      {/* 8. Tort Konstruktori Banneri (Mashhurlar va Yangi ta'mlar o'rtasidagi interaktiv CTA) */}
      <ScrollReveal yOffset={24}>
        <CakeBuilderCta locale={lang} />
      </ScrollReveal>

      {/* 9. Yangi ta'mlar (New Arrivals) */}
      <ScrollReveal yOffset={24}>
        <section className="space-y-3 sm:space-y-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#244B2B]/10 dark:bg-[#244B2B]/20 text-[#244B2B] dark:text-[#4ADE80] flex items-center justify-center shadow-xs flex-shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-serif font-bold text-base sm:text-2xl text-[#1C261E] dark:text-[#F5F2EA] leading-tight truncate">
                  {t('newTitle')}
                </h2>
                <p className="text-[11px] sm:text-xs text-[#596B5E] dark:text-[#A6B7AA] truncate">
                  {t('newSubtitle')}
                </p>
              </div>
            </div>

            <Link
              href={`/${lang}/catalog?sort=newest`}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#28392B] hover:border-[#244B2B] dark:hover:border-[#D4AF37] text-xs font-bold text-[#244B2B] dark:text-[#E5C358] shadow-xs transition-all whitespace-nowrap flex-shrink-0 hover:scale-105 active:scale-95"
            >
              <span className="hidden sm:inline">{tc('viewAll')}</span>
              <span className="sm:hidden">{lang === 'ru' ? 'Все' : 'Barchasi'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {newProducts.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} locale={lang} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      </ScrollReveal>

      {/* 10. Qanday buyurtma beriladi? (3 ta oddiy qadam - Kompyuterda) */}
      <ScrollReveal yOffset={24}>
        <HowItWorksSection locale={lang} />
      </ScrollReveal>

      {/* Mayin Oltin Krem To'lqini (Faqat planshet va kompyuterda) */}
      <PastryWaveDivider variant="gold" className="hidden md:block -my-2 sm:-my-4" />

      {/* 11. VIP To'y Tortlari & Banket Shirinliklari (Katta tadbirlar uchun) */}
      <ScrollReveal yOffset={24}>
        <VIPEventCatering locale={lang} />
      </ScrollReveal>

      {/* 12. Bizning Manzillar va Filiallar (2 ustunli ixcham mobil tartib va xarita bilan) */}
      <ScrollReveal yOffset={24}>
        <BranchesSection locale={lang} branches={branches} />
      </ScrollReveal>

    </div>
  );
}
