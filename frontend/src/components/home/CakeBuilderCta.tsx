'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Layers, Palette, MessageSquareText } from 'lucide-react';

interface CakeBuilderCtaProps {
  locale: 'uz' | 'ru';
}

export const CakeBuilderCta: React.FC<CakeBuilderCtaProps> = ({ locale }) => {
  const isRu = locale === 'ru';

  return (
    <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#1A261D] via-[#244B2B] to-[#142618] dark:from-[#0F1811] dark:via-[#16251A] dark:to-[#0A120C] text-white p-4 sm:p-10 lg:p-14 border border-[#D4AF37]/45 dark:border-[#D4AF37]/50 shadow-xl my-4 sm:my-10 animate-gold-glow">
      {/* Orqa fon nur effekti */}
      <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-[#D4AF37]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-60 sm:w-80 h-60 sm:h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Suzuvchi nozik bezak yulduzi */}
      <div className="absolute top-8 right-12 text-[#D4AF37]/30 hidden sm:block animate-sparkle-pulse pointer-events-none">
        <Sparkles className="w-8 h-8" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
        
        {/* Chap qism: Matn, xususiyatlar va tugma */}
        <div className="lg:col-span-8 space-y-3 sm:space-y-5">
          {/* Nishon */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] dark:text-[#E5C358] border border-[#D4AF37]/40 text-[10px] sm:text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37]" />
            <span>{isRu ? 'Эксклюзивный сервис' : 'Maxsus xizmat · 100% Individual'}</span>
          </div>

          {/* Sarlavha */}
          <h2 className="font-serif font-bold text-lg sm:text-3xl lg:text-4xl leading-tight">
            {isRu ? (
              <>
                Хотите торт по <span className="gold-shimmer-text">индивидуальному дизайну</span>?
              </>
            ) : (
              <>
                O‘ziga xos dizayndagi <span className="gold-shimmer-text">eksklyuziv tort</span> yasatmoqchimisiz?
              </>
            )}
          </h2>

          {/* Qisqacha tavsif */}
          <p className="text-xs sm:text-base text-[#E2EBE4] max-w-2xl leading-relaxed">
            {isRu
              ? 'С помощью нашего интерактивного 3D-конструктора выберите форму, вес, начинку, крем и свою праздничную надпись!'
              : "Interaktiv konstruktorimizda tort shakli, vazni, ta'mi, kremi va tabrik yozuvingizni o‘zingiz tanlang. Biz maxsus tayyorlab beramiz!"}
          </p>

          {/* Afzallik belgilari: Telefonda 1 qator ixcham teglarda, planshet/desktopda qutilarda */}
          <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-[#FBF9F4]/90 bg-white/10 dark:bg-white/[0.05] px-2.5 py-1 sm:px-3 sm:py-2 rounded-xl border border-white/15 dark:border-white/10">
              <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{isRu ? 'Форма и вес' : 'Shakl & vazn'}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-[#FBF9F4]/90 bg-white/10 dark:bg-white/[0.05] px-2.5 py-1 sm:px-3 sm:py-2 rounded-xl border border-white/15 dark:border-white/10">
              <Palette className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{isRu ? 'Крем и декор' : 'Krem & bezak'}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-[#FBF9F4]/90 bg-white/10 dark:bg-white/[0.05] px-2.5 py-1 sm:px-3 sm:py-2 rounded-xl border border-white/15 dark:border-white/10">
              <MessageSquareText className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{isRu ? 'Ваша надпись' : 'Tabrik yozuvingiz'}</span>
            </div>
          </div>

          {/* Tugma */}
          <div className="pt-2 sm:pt-3">
            <motion.div whileTap={{ scale: 0.95 }} className="inline-block w-full sm:w-auto">
              <Link
                href={`/${locale}/cake-builder`}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#1C261E] font-bold text-xs sm:text-sm shadow-md hover:shadow-xl transition-all text-center"
              >
                <span>{isRu ? 'Собрать свой торт' : "O‘z tortingizni yasash"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* O'ng qism: Haqiqiy fotosuratli hashamatli vitrina (Kompyuterda ko'rinadi) */}
        <div className="hidden lg:flex lg:col-span-4 justify-center">
          <motion.div
            whileHover={{ scale: 1.03, rotate: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative w-64 h-64 xl:w-72 xl:h-72 rounded-3xl overflow-hidden border-2 border-[#D4AF37]/60 shadow-2xl group cursor-pointer"
          >
            <Image
              src="https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80"
              alt="777 Custom Cake"
              fill
              sizes="300px"
              className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            />
            {/* Oyna yaltirashi */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[250%] transition-transform duration-1000 ease-in-out pointer-events-none z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-5 text-center pointer-events-none">
              <span className="font-serif font-black text-lg text-white">777 Custom Cake</span>
              <span className="text-xs text-[#D4AF37] font-bold tracking-wider mt-0.5">100% Individual Dizayn</span>
              <span className="text-[10px] text-white/80 mt-1">Siz xohlagan shakl va ta’m</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CakeBuilderCta;