'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { Category } from '../../lib/api/types';

interface CategoryCapsulesProps {
  locale: 'uz' | 'ru';
  categories?: Category[];
}

interface CapsuleItem {
  slug: string;
  nameUz: string;
  nameRu: string;
  countLabelUz: string;
  countLabelRu: string;
  imageBg: string;
  icon: string;
  imageFallbackUrl: string;
}

const CAPSULES: CapsuleItem[] = [
  {
    slug: 'tortlar',
    nameUz: 'Yumaloq tortlar',
    nameRu: 'Круглые торты',
    countLabelUz: '45 xil tur',
    countLabelRu: '45 видов',
    imageBg: 'from-[#3A2212] to-[#1C1108]',
    icon: '🎂',
    imageFallbackUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&auto=format&fit=crop&q=80',
  },
  {
    slug: 'mini-tortlar',
    nameUz: 'Mini-tortlar (Bento)',
    nameRu: 'Мини-торты (Бенто)',
    countLabelUz: '20 xil tur',
    countLabelRu: '20 видов',
    imageBg: 'from-[#B83A3A] to-[#801818]',
    icon: '🧁',
    imageFallbackUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=200&auto=format&fit=crop&q=80',
  },
  {
    slug: 'ruletlar',
    nameUz: 'Pista va mevali ruletlar',
    nameRu: 'Рулеты и рулетики',
    countLabelUz: '15 xil tur',
    countLabelRu: '15 видов',
    imageBg: 'from-[#244B2B] to-[#142618]',
    icon: '🍥',
    imageFallbackUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200&auto=format&fit=crop&q=80',
  },
  {
    slug: 'pirojniylar',
    nameUz: 'Eklerlar va desertlar',
    nameRu: 'Пирожные и десерты',
    countLabelUz: '30 xil tur',
    countLabelRu: '30 видов',
    imageBg: 'from-[#AA820A] to-[#604905]',
    icon: '🍰',
    imageFallbackUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&auto=format&fit=crop&q=80',
  },
  {
    slug: 'pishiriqlar',
    nameUz: 'Kruassan & pishiriqlar',
    nameRu: 'Круассаны и выпечка',
    countLabelUz: '25 xil tur',
    countLabelRu: '25 видов',
    imageBg: 'from-[#8C5D33] to-[#543317]',
    icon: '🥐',
    imageFallbackUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&auto=format&fit=crop&q=80',
  },
  {
    slug: 'shirinliklar',
    nameUz: 'Fransuz makaronlari',
    nameRu: 'Французские макаронс',
    countLabelUz: '12 xil ta’m',
    countLabelRu: '12 вкусов',
    imageBg: 'from-[#C44D76] to-[#781B3C]',
    icon: '🍪',
    imageFallbackUrl: 'https://images.unsplash.com/photo-1569864321398-34823a9d9e4a?w=200&auto=format&fit=crop&q=80',
  },
  {
    slug: 'ichimliklar',
    nameUz: 'Qahva va mualliflik choyi',
    nameRu: 'Кофе и авторский чай',
    countLabelUz: '18 xil tur',
    countLabelRu: '18 видов',
    imageBg: 'from-[#3A2E26] to-[#1E1712]',
    icon: '☕',
    imageFallbackUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80',
  },
];

export const CategoryCapsules: React.FC<CategoryCapsulesProps> = ({ locale }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isRu = locale === 'ru';

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="space-y-4 pt-1">
      {/* Sarlavha qatori: Chapda sarlavha, o'ngda Safia uslubidagi [ ← ] [ → ] aylanali boshqaruv tugmalari */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{isRu ? 'Каталог кондитерской' : 'Qandolat uyi katalogi'}</span>
            <span className="hidden sm:inline font-serif italic font-normal text-xs text-[#AA820A] dark:text-[#E5C358] normal-case ml-1 opacity-90">
              — {isRu ? 'искусство ручной работы' : 'har bir lazzatda mehr va mo‘jiza'}
            </span>
          </div>
          <h2 className="font-serif font-bold text-xl sm:text-3xl text-[#1C261E] dark:text-[#F5F2EA] tracking-tight mt-0.5">
            {isRu ? 'Каталог' : 'Katalog'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Katalogga o'tish havolasi */}
          <Link
            href={`/${locale}/catalog`}
            className="text-xs sm:text-sm font-bold text-[#244B2B] dark:text-[#E5C358] hover:text-[#D4AF37] flex items-center gap-1 sm:mr-3 transition-colors"
          >
            <span>{isRu ? 'В каталог' : "Barchasi"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* O'ngga/Chapga silliq varaqlash tugmalari (Planshet va kompyuterda) */}
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#E4E0D7] dark:border-[#2D3E31] bg-[#F7F5F0] dark:bg-[#18251C] hover:bg-white dark:hover:bg-[#223326] text-[#1C261E] dark:text-[#F5F2EA] hover:border-[#244B2B] dark:hover:border-[#D4AF37] hover:text-[#244B2B] dark:hover:text-[#D4AF37] items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
            aria-label="Oldingi"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#E4E0D7] dark:border-[#2D3E31] bg-[#F7F5F0] dark:bg-[#18251C] hover:bg-white dark:hover:bg-[#223326] text-[#1C261E] dark:text-[#F5F2EA] hover:border-[#244B2B] dark:hover:border-[#D4AF37] hover:text-[#244B2B] dark:hover:text-[#D4AF37] items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
            aria-label="Keyingi"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Gorizontal Kapsula Kartochkalar Karuseli (Safia uslubi) */}
      <div className="w-full overflow-hidden">
        <div
          ref={scrollRef}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
        >
        {/* 0. Maxsus "Barchasi" boshlang'ich kapsulasi */}
        <Link
          href={`/${locale}/catalog`}
          className="flex-shrink-0 group"
        >
          <motion.div
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="flex items-center gap-2.5 sm:gap-3 p-1.5 sm:p-2 pr-4 sm:pr-5 rounded-full bg-gradient-to-r from-[#244B2B] to-[#1A3821] text-white border border-[#D4AF37]/50 shadow-xs hover:shadow-md transition-all duration-300"
          >
            <div className="w-[46px] h-[46px] sm:w-[54px] sm:h-[54px] rounded-full overflow-hidden flex-shrink-0 border-2 border-[#D4AF37] shadow-xs bg-[#1A261D] flex items-center justify-center text-lg sm:text-xl">
              ✨
            </div>
            <div className="whitespace-nowrap pr-1">
              <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#D4AF37] transition-colors leading-snug">
                {isRu ? 'Все сладости' : 'Barchasi'}
              </h3>
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#D4AF37] block mt-0.5">
                {isRu ? '150+ видов' : '150+ xil tur'}
              </span>
            </div>
          </motion.div>
        </Link>

        {CAPSULES.map((item) => {
          const title = isRu ? item.nameRu : item.nameUz;
          const subtitle = isRu ? item.countLabelRu : item.countLabelUz;

          return (
            <Link
              key={item.slug}
              href={`/${locale}/catalog?categorySlug=${item.slug}`}
              className="flex-shrink-0 group"
            >
              <motion.div
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex items-center gap-2.5 sm:gap-3.5 p-1.5 sm:p-2 pr-5 sm:pr-6 rounded-full bg-[#F6F5F2] dark:bg-[#18251C] hover:bg-white dark:hover:bg-[#223326] border border-[#EAE7DF] dark:border-[#2B3D2F] hover:border-[#244B2B] dark:hover:border-[#D4AF37] shadow-xs hover:shadow-md transition-all duration-300"
              >
                
                {/* Dumaloq Desert Fotosurati */}
                <div className="relative w-[46px] h-[46px] sm:w-[54px] sm:h-[54px] rounded-full overflow-hidden flex-shrink-0 border-2 border-white dark:border-[#2B3D2F] shadow-xs bg-white dark:bg-[#121B14]">
                  <Image
                    src={item.imageFallbackUrl}
                    alt={title}
                    fill
                    unoptimized
                    draggable={false}
                    className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    sizes="54px"
                  />
                </div>

                {/* Matn qismi: Kategoriya nomi va xillari soni */}
                <div className="whitespace-nowrap pr-1">
                  <h3 className="font-bold text-xs sm:text-sm text-[#1C261E] dark:text-[#F5F2EA] group-hover:text-[#244B2B] dark:group-hover:text-[#E5C358] transition-colors leading-snug">
                    {title}
                  </h3>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[#8C9B90] dark:text-[#A6B7AA] group-hover:text-[#D4AF37] dark:group-hover:text-[#E5C358] transition-colors block mt-0.5">
                    {subtitle}
                  </span>
                </div>

              </motion.div>
            </Link>
          );
        })}
        </div>
      </div>
    </section>
  );
};

export default CategoryCapsules;