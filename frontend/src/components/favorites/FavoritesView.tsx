'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useFavoritesStore } from '../../stores/favorites';
import { useCartStore } from '../../stores/cart';
import { playSoftAddChime } from '../../lib/audio';
import { ProductCard } from '../catalog/ProductCard';
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer';
import { ScrollReveal } from '../ui/ScrollReveal';

interface FavoritesViewProps {
  locale: 'uz' | 'ru';
}

export function FavoritesView({ locale }: FavoritesViewProps) {
  const t = useTranslations('Favorites');
  const tc = useTranslations('Common');
  const { items, slugs, clearFavorites } = useFavoritesStore();
  const { addItem } = useCartStore();

  const handleAddAllToCart = () => {
    items.forEach((p) => {
      if (p.isAvailable) {
        addItem({
          productId: p.id,
          slug: p.slug,
          name: p.name,
          price: p.price,
          oldPrice: p.oldPrice,
          imageUrl: p.imageUrl,
          unitType: p.unitType,
          minQuantity: p.minQuantity,
          quantityStep: p.quantityStep,
          isAvailable: p.isAvailable,
        });
      }
    });
    playSoftAddChime();
  };

  if (items.length === 0 && slugs.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-24 h-24 rounded-full bg-[#B83A3A]/10 dark:bg-[#B83A3A]/20 flex items-center justify-center text-[#B83A3A] mb-6">
          <Heart className="w-12 h-12 text-[#B83A3A]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C261E] dark:text-[#F5F2EA] mb-3">
          {t('empty')}
        </h1>
        <p className="text-[#596B5E] dark:text-[#A6B7AA] max-w-md mb-8 text-sm sm:text-base leading-relaxed">
          {t('emptyNotice')}
        </p>
        <Link
          href={`/${locale}/catalog`}
          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] font-bold text-sm hover:bg-[#1A3720] dark:hover:bg-[#E5C358] shadow-md hover:shadow-lg transition-all"
        >
          <span>{locale === 'ru' ? 'Перейти в каталог' : 'Katalogga o‘tish'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E9E5DD] dark:border-[#28392B]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C261E] dark:text-[#F5F2EA] tracking-tight">
            {t('title')}
          </h1>
          <p className="text-xs sm:text-sm text-[#596B5E] dark:text-[#A6B7AA] mt-1">
            {items.length} {locale === 'ru' ? 'товаров сохранено' : 'ta shirinlik saqlangan'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddAllToCart}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] text-xs sm:text-sm font-bold hover:bg-[#1A3720] dark:hover:bg-[#E5C358] shadow-sm transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-[#D4AF37] dark:text-[#0F1712]" />
            <span>{t('addAllToCart')}</span>
          </button>

          <button
            onClick={clearFavorites}
            className="inline-flex items-center gap-1.5 p-2.5 rounded-xl border border-[#E9E5DD] dark:border-[#28392B] text-[#B83A3A] hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold transition-colors"
            title={t('clearAll')}
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">{t('clearAll')}</span>
          </button>
        </div>
      </div>

      <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
        {items.map((prod) => (
          <StaggerItem key={prod.id}>
            <ProductCard product={prod} locale={locale} />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}
