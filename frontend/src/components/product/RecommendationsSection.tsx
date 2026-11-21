'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ProductCard as ProductCardType } from '../../lib/api/types';
import { apiClient } from '../../lib/api/client';
import { ProductCard } from '../catalog/ProductCard';
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer';
import { ScrollReveal } from '../ui/ScrollReveal';

interface RecommendationsSectionProps {
  currentSlug?: string;
  locale: 'uz' | 'ru';
  title?: string;
  limit?: number;
}

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  currentSlug,
  locale,
  title,
  limit = 4,
}) => {
  const isRu = locale === 'ru';
  const [items, setItems] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadRecommendations() {
      setLoading(true);

      // 1. Backenddan tavsiyalarni olishga urinib ko'rish
      if (currentSlug) {
        try {
          const res = await apiClient<ProductCardType[]>(
            `/api/public/products/${currentSlug}/recommendations`,
            {
              lang: locale,
              params: { limit },
            }
          );
          if (isMounted && res && res.length > 0) {
            setItems(res.slice(0, limit));
            setLoading(false);
            return;
          }
        } catch { if (isMounted) setItems([]); }
      }

      if (isMounted) {
        setItems([]);
        setLoading(false);
      }
    }

    loadRecommendations();

    return () => {
      isMounted = false;
    };
  }, [currentSlug, locale, limit]);

  if (!loading && items.length === 0) return null;

  const defaultTitle = isRu ? 'С этим товаром часто заказывают' : 'Bu shirinlik bilan birga xarid qilinadi';

  return (
    <section className="pt-10 border-t border-[#E9E5DD] dark:border-[#28392B] space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#AA820A] dark:text-[#E5C358] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div>
            <h3 className="font-serif font-black text-xl sm:text-2xl text-[#1C261E] dark:text-[#F5F2EA]">
              {title || defaultTitle}
            </h3>
            <span className="text-[11px] text-[#596B5E] dark:text-[#A6B7AA] block">
              {isRu ? 'Идеальное дополнение к вашему десерту' : 'Dasturxoningizni yanada boyitadigan nozik ta’mlar'}
            </span>
          </div>
        </div>

        <Link
          href={`/${locale}/catalog`}
          className="text-xs font-bold text-[#244B2B] dark:text-[#E5C358] hover:text-[#D4AF37] dark:hover:text-[#FDF0CD] flex items-center gap-1 transition-colors"
        >
          <span>{isRu ? 'Все сладости' : 'Barcha shirinliklar'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <StaggerContainer className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {items.map((prod) => (
          <StaggerItem key={prod.id}>
            <ProductCard product={prod} locale={locale} />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
};

export default RecommendationsSection;
