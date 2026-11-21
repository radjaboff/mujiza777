'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Truck, ShieldCheck, Sparkles, Gift, Clock, Heart, Award } from 'lucide-react';
import { useCmsContent } from '../../lib/cms/content';

interface TrustGuaranteesProps {
  locale: 'uz' | 'ru';
}

export const TrustGuarantees: React.FC<TrustGuaranteesProps> = ({ locale }) => {
  const isRu = locale === 'ru';
  const { content } = useCmsContent();

  const iconMap: Record<string, any> = {
    truck: Truck,
    shield: ShieldCheck,
    sparkles: Sparkles,
    gift: Gift,
    clock: Clock,
    heart: Heart,
    award: Award,
  };

  const guarantees = content.guarantees.map((item) => ({
    badge: isRu && item.badgeRu ? item.badgeRu : item.badgeUz,
    title: isRu && item.titleRu ? item.titleRu : item.titleUz,
    desc: isRu && item.descRu ? item.descRu : item.descUz,
    icon: iconMap[item.iconType] || Sparkles,
    highlight: isRu && item.highlightRu ? item.highlightRu : item.highlightUz,
  }));

  return (
    <section className="relative">
      
      {/* 1. Telefonda: Ixcham 1 qatorli Ishonch Chizig'i (Joy olmaydi, lekin 100% ishonch beradi) */}
      <div className="sm:hidden grid grid-cols-3 gap-1.5 px-2.5 py-2 rounded-2xl bg-white/80 dark:bg-[#1A281E]/80 border border-[#E9E5DD] dark:border-[#28392B] shadow-xs text-center">
        <div className="flex flex-col items-center justify-center p-1">
          <Truck className="w-3.5 h-3.5 text-[#244B2B] dark:text-[#4ADE80] mb-0.5" />
          <span className="text-[10px] font-bold text-[#1C261E] dark:text-[#F5F2EA] leading-tight">
            {isRu ? '45 мин доставка' : '45 daq. yetkazish'}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center p-1 border-x border-[#E9E5DD] dark:border-[#28392B]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#AA820A] dark:text-[#E5C358] mb-0.5" />
          <span className="text-[10px] font-bold text-[#1C261E] dark:text-[#F5F2EA] leading-tight">
            {isRu ? '100% Халяль' : '100% Halol'}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center p-1">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] mb-0.5" />
          <span className="text-[10px] font-bold text-[#1C261E] dark:text-[#F5F2EA] leading-tight">
            {isRu ? 'Всегда свежее' : 'Yangi pishirilgan'}
          </span>
        </div>
      </div>

      {/* 2. Planshet va Kompyuterda: 4 ta Katta Hashamatli Kafolat Kartochkasi */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {guarantees.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, scale: 1.01 }}
              key={index}
              className="bg-white dark:bg-[#1A281E] rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] p-5 sm:p-6 shadow-xs hover:shadow-xl hover:border-[#D4AF37] transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Oyna yaltirashi */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[250%] transition-transform duration-1000 ease-in-out pointer-events-none z-10" />

              {/* Orqa fondagi nafis tilla burchak nuri */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#D4AF37]/5 rounded-full blur-xl group-hover:bg-[#D4AF37]/15 transition-all pointer-events-none" />

              <div>
                {/* Tepasi: Nishon va Ikona */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#244B2B]/5 dark:bg-[#244B2B]/25 text-[#244B2B] dark:text-[#4ADE80] flex items-center justify-center group-hover:bg-[#244B2B] group-hover:text-white transition-colors duration-300 shadow-xs">
                    <Icon className="w-6 h-6 transition-transform group-hover:scale-110 duration-300" />
                  </div>

                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#AA820A] dark:text-[#E5C358] bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 px-2.5 py-1 rounded-full">
                    {item.badge}
                  </span>
                </div>

                {/* Sarlavha */}
                <h3 className="font-bold text-base text-[#1C261E] dark:text-[#F5F2EA] group-hover:text-[#244B2B] dark:group-hover:text-[#E5C358] transition-colors leading-snug">
                  {item.title}
                </h3>

                {/* Qisqacha tavsif */}
                <p className="text-xs text-[#596B5E] dark:text-[#A6B7AA] leading-relaxed mt-2">
                  {item.desc}
                </p>
              </div>

              {/* Pastki nozik hoshiya va qo'shimcha belgi */}
              <div className="pt-4 border-t border-[#E9E5DD]/60 dark:border-[#28392B]/60 mt-4 flex items-center justify-between text-[11px] font-semibold text-[#8C9B90] dark:text-[#A6B7AA]">
                <span className="group-hover:text-[#244B2B] dark:group-hover:text-[#E5C358] transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                  <span>Mo‘jiza 777 standarti</span>
                </span>
                <span className="text-[10px] font-bold text-[#AA820A] dark:text-[#E5C358] bg-[#FBF9F4] dark:bg-[#141F17] px-2 py-0.5 rounded-md">
                  {item.highlight}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default TrustGuarantees;