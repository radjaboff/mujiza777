'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { 
  Tag, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  Copy, 
  Check, 
  Gift,
  Truck,
  ChevronRight,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { Promotion } from '../../lib/api/types';
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer';
import { ScrollReveal } from '../ui/ScrollReveal';

interface PromotionsViewProps {
  promotions: Promotion[];
  locale: 'uz' | 'ru';
}

export function PromotionsView({ promotions, locale }: PromotionsViewProps) {
  const isRu = locale === 'ru';
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const DEFAULT_PROMOTIONS: Promotion[] = [
    {
      id: 1,
      title: isRu ? 'Весеннее сладкое настроение' : 'Mo‘jiza bilan Bahoriy Shirinliklar',
      slug: 'bahoriy-shirinliklar-15',
      summary: isRu ? 'Скидка 15% на все праздничные и семейные торты при заказе от 120 000 сум' : '120 000 so‘mdan yuqori barcha oilaviy va bayramona tortlarga 15% chegirma',
      description: null,
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80',
      mobileImageUrl: null,
      linkUrl: `/${locale}/catalog`,
      activeTo: '2026-12-31T23:59:59Z',
      badge: isRu ? 'Скидка -15%' : 'Chegirma -15%',
      promoCode: 'BAHOR15',
      category: 'DISCOUNT',
    },
    {
      id: 2,
      title: isRu ? '3-й бенто-торт в подарок!' : 'Har 3-chi Bento-tort SOVG‘A!',
      slug: 'bento-tort-sovga',
      summary: isRu ? 'Закажите 2 бенто-торта и получите 3-й фирменный десерт бесплатно' : '2 ta bento-tort xarid qiling va 3-chi desertni mutlaqo bepul oling',
      description: null,
      imageUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800&auto=format&fit=crop&q=80',
      mobileImageUrl: null,
      linkUrl: `/${locale}/catalog?categorySlug=mini-tortlar`,
      activeTo: '2026-12-31T23:59:59Z',
      badge: isRu ? 'Подарок 1+1=3' : 'Sovg‘a 1+1=3',
      promoCode: 'BENTO2026',
      category: 'GIFT',
    },
    {
      id: 3,
      title: isRu ? 'Бесплатная доставка по Карши' : 'Qarshi bo‘ylab BEPUL yetkazish',
      slug: 'bepul-yetkazish-qarshi',
      summary: isRu ? 'При заказе от 150 000 сум наш курьer доставит заказ за 35 минут бесплатно' : '150 000 so‘mdan ortiq xarid qiling va shahar bo‘ylab tezkor yetkazish 0 so‘m bo‘ladi',
      description: null,
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
      mobileImageUrl: null,
      linkUrl: `/${locale}/catalog`,
      activeTo: '2026-12-31T23:59:59Z',
      badge: isRu ? 'Бесплатная доставка' : 'Bepul kuryer',
      promoCode: 'BEPUL777',
      category: 'DELIVERY',
    },
  ];

  const filteredPromotions = promotions && promotions.length > 0 ? promotions : DEFAULT_PROMOTIONS;

  const handleCopyCode = async (code: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => {
        setCopiedCode(null);
      }, 2500);
    } catch {
      setCopiedCode(null);
    }
  };

  return (
    <div className="max-w-[1720px] mx-auto px-3 sm:px-8 lg:px-12 xl:px-16 pt-3 sm:pt-6 pb-6 sm:pb-12 space-y-6 sm:space-y-10">
      
      {/* 1. Breadcrumb navigatsiya */}
      <nav className="flex items-center gap-2 text-xs font-medium text-[#8C9B90] dark:text-[#889B8C]">
        <Link href={`/${locale}`} className="hover:text-[#244B2B] dark:hover:text-[#E5C358] transition-colors">
          {isRu ? 'Главная' : 'Bosh sahifa'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#C4BCB0]" />
        <span className="text-[#244B2B] dark:text-[#E5C358] font-bold">
          {isRu ? 'Акции и предложения' : 'Aksiyalar va takliflar'}
        </span>
      </nav>

      <ScrollReveal variant="fade-up">
      {/* 2. Hashamatli Sarlavha (Hero Banner) */}
      <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#AA820A] dark:text-[#E5C358] text-[11px] sm:text-xs font-extrabold uppercase tracking-wider shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{isRu ? 'Выгодные спецпредложения' : 'Maxsus takliflar & Promo-aksiyalar'}</span>
        </div>

        <h1 className="font-serif font-black text-2xl sm:text-4xl lg:text-5xl text-[#1C261E] dark:text-[#F5F2EA] tracking-tight">
          {isRu ? 'Акции и сладкие подарки' : 'Aksiyalar va shirin sovg‘alar'}
        </h1>

        <p className="text-xs sm:text-sm text-[#596B5E] dark:text-[#A6B7AA] leading-relaxed max-w-lg mx-auto">
          {isRu
            ? 'Специальные цены, бесплатная доставка, промокоды и подарки для каждого праздника в городе Карши'
            : 'Maxsus chegirmalar, bepul kuryerlik yetkazish, promokodlar va bayramona sovg‘alar to‘plami'}
        </p>
      </div>
      </ScrollReveal>

      {/* 4. Aksiyalar kartalari gridi */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {filteredPromotions.map((promo) => {
          const formattedDate = promo.activeTo
            ? new Date(promo.activeTo).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'uz-UZ', {
                day: 'numeric',
                month: 'long',
              })
            : null;

          const isCopied = copiedCode === promo.promoCode;

          return (
            <StaggerItem key={promo.id}>
            <div
              className="bg-white dark:bg-[#1A281E] rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Fotosurat qismi */}
              <div className="relative h-48 sm:h-56 bg-[#F4EFE6] dark:bg-[#121B14] overflow-hidden select-none">
                {promo.imageUrl ? (
                  <Image
                    src={promo.imageUrl}
                    alt={promo.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white p-6 bg-gradient-to-tr from-[#244B2B] to-[#142618]">
                    <Sparkles className="w-12 h-12 text-[#D4AF37] mb-2 animate-pulse" />
                    <span className="font-bold text-center">{promo.title}</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                {/* Yuqori chap burchak: Yorqin chegirma nishoni */}
                {promo.badge && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black tracking-wide uppercase bg-gradient-to-r from-[#B83A3A] to-[#D4AF37] text-white shadow-md flex items-center gap-1 border border-white/20">
                      <Percent className="w-3 h-3 text-white" />
                      <span>{promo.badge}</span>
                    </span>
                  </div>
                )}

                {/* Yuqori o'ng burchak: Muddat / Sana */}
                <div className="absolute top-3 right-3 z-10">
                  <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center gap-1.5 shadow-xs">
                    <Calendar className="w-3 h-3 text-[#D4AF37]" />
                    <span>
                      {formattedDate
                        ? (isRu ? `До ${formattedDate}` : `${formattedDate} gacha`)
                        : (isRu ? 'Постоянная акция' : 'Doimiy amal qiladi')}
                    </span>
                  </span>
                </div>
              </div>

              {/* Matn va Tafsilotlar */}
              <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h2 className="font-serif font-black text-base sm:text-xl text-[#1C261E] dark:text-[#F5F2EA] leading-snug group-hover:text-[#244B2B] dark:group-hover:text-[#E5C358] transition-colors mb-2">
                    {promo.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#596B5E] dark:text-[#A6B7AA] leading-relaxed">
                    {promo.summary || promo.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  
                  {/* 🏷 Promokod bloki (1 bosishda nusxalash) */}
                  {promo.promoCode && (
                    <div className="p-2.5 sm:p-3 rounded-2xl bg-[#FBF9F4] dark:bg-[#141F17] border border-dashed border-[#D4AF37] dark:border-[#D4AF37]/60 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-[#8C9B90] dark:text-[#889B8C] block leading-none mb-1">
                          {isRu ? 'Промокод для заказа:' : 'Buyurtma uchun promokod:'}
                        </span>
                        <span className="font-mono font-black text-xs sm:text-sm text-[#244B2B] dark:text-[#E5C358] tracking-wider select-all">
                          {promo.promoCode}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleCopyCode(promo.promoCode!, e)}
                        className={`py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                          isCopied
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] hover:bg-[#1A3720] dark:hover:bg-[#E5C358]'
                        }`}
                        title={isRu ? 'Скопировать промокод' : 'Promokodni nusxalash'}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{isRu ? 'Скопировано!' : 'Nusxalandi!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{isRu ? 'Копировать' : 'Nusxalash'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Harakat tugmasi (CTA) */}
                  <Link
                    href={`/${locale}/promotions/${promo.slug}`}
                    className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-[#244B2B] dark:bg-[#1A281E] border border-[#244B2B] dark:border-[#D4AF37] text-white dark:text-[#E5C358] hover:bg-[#1A3720] dark:hover:bg-[#244B2B] text-xs sm:text-sm font-bold text-center transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xs group/btn"
                  >
                    <span>{isRu ? 'Воспользоваться акцией' : 'Aksiyadan foydalanish'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37] group-hover/btn:translate-x-1 transition-transform" />
                  </Link>

                </div>
              </div>
            </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* 5. Qo'shimcha Ishonch Bloklari */}
      <div className="mt-8 pt-6 border-t border-[#E9E5DD] dark:border-[#28392B] grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 text-center">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#28392B] flex items-center justify-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA]">
            {isRu ? '100% Халяль и свежесть' : '100% Halol va barra mahsulotlar'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#28392B] flex items-center justify-center gap-2.5">
          <Truck className="w-4 h-4 text-[#244B2B] dark:text-[#E5C358]" />
          <span className="text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA]">
            {isRu ? 'Быстрая доставка по Карши' : 'Qarshi shahrida tezkor yetkazish'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#28392B] flex items-center justify-center gap-2.5">
          <Gift className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA]">
            {isRu ? 'Подарки и бонусы к праздникам' : 'Bayramlarga maxsus sovg‘alar'}
          </span>
        </div>
      </div>

    </div>
  );
}

export default PromotionsView;
