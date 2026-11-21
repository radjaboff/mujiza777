'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Phone, Send, CheckCircle2 } from 'lucide-react';
import { useCmsContent } from '../../lib/cms/content';

interface VIPEventCateringProps {
  locale: 'uz' | 'ru';
  phone?: string;
  telegramUrl?: string;
}

export const VIPEventCatering: React.FC<VIPEventCateringProps> = ({
  locale,
  phone = '+998 93 706 73 21',
  telegramUrl = 'https://t.me/mujizashirinliklari777',
}) => {
  const isRu = locale === 'ru';
  const { content } = useCmsContent();

  const title = isRu && content.wedding.titleRu ? content.wedding.titleRu : content.wedding.titleUz;
  const desc = isRu && content.wedding.descRu ? content.wedding.descRu : content.wedding.descUz;
  const badge = isRu && content.wedding.badgeRu ? content.wedding.badgeRu : content.wedding.badgeUz;
  const perks = content.wedding.perks.length > 0 ? content.wedding.perks : [
    {
      id: 'p1',
      titleUz: "Shohona to‘y tortlari",
      titleRu: "Роскошные свадебные торты",
      descUz: "3–5 qavatli mualliflik to‘y tortlari, individual dizayn va bepul degustatsiya",
      descRu: "3–5 ярусные авторские шедевры, эскиз под концепцию торжества и дегустация",
    },
    {
      id: 'p2',
      titleUz: "Sarpo va to‘y pishiriqlari",
      titleRu: "Свадебная выпечка на заказ",
      descUz: "Katta marosimlar uchun o‘nlab kg barra va sara pishiriqlar assortisi",
      descRu: "Десятки килограммов отборной выпечки и сладостей для праздничных столов",
    },
    {
      id: 'p3',
      titleUz: "Tandir somsa va chuchvara",
      titleRu: "Тандырная самса и чучвара",
      descUz: "Yuzlab dona issiq, mazali tandir somsa va toza go‘shtli sifatli chuchvara",
      descRu: "Горячая сочная самса сотнями штук и домашняя мясная чучвара к банкету",
    },
    {
      id: 'p4',
      titleUz: "Restoranga xavfsiz yetkazish",
      titleRu: "Доставка прямо в банкетный зал",
      descUz: "Restoranga belgilangan aniq daqiqagacha sovutilgan holda butun yetkaziladi",
      descRu: "Точно к начаlu банкета в охлаждаемом фургоне с гарантией сохранности",
    },
  ];

  return (
    <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#1A2E20] via-[#244B2B] to-[#122216] dark:from-[#111C14] dark:via-[#16271B] dark:to-[#0C150E] text-[#FBF9F4] p-4 sm:p-10 lg:p-16 border border-[#D4AF37]/40 dark:border-[#D4AF37]/50 shadow-2xl my-4 sm:my-8">
      
      {/* Hashamatli oltin jilo foni */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-12 items-center">
        
        {/* Chap qism: Matn va Xususiyatlar */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] dark:text-[#E5C358] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37]" />
            <span>{badge}</span>
          </div>

          <h2 className="font-serif font-black text-xl sm:text-4xl lg:text-5xl leading-tight gold-shimmer-text">
            {title}
          </h2>

          <p className="text-xs sm:text-base text-[#D3E0D6] leading-relaxed max-w-xl">
            {desc}
          </p>

          {/* 4 ta afzallik kartochkasi - telefonda ixcham 2x2 grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3.5 pt-1 sm:pt-2">
            {perks.map((p, idx) => (
              <div 
                key={idx}
                className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/5 dark:bg-white/[0.03] border border-white/10 dark:border-[#28392B] backdrop-blur-sm space-y-1 hover:border-[#D4AF37]/50 transition-colors"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 font-bold text-[11px] sm:text-sm text-[#FDF0CD] leading-snug">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37] flex-shrink-0" />
                  <span className="truncate">{isRu ? p.titleRu : p.titleUz}</span>
                </div>
                <p className="hidden sm:block text-[11px] text-[#A8B5AA] pl-6 leading-relaxed">
                  {isRu ? p.descRu : p.descUz}
                </p>
              </div>
            ))}
          </div>

          {/* Tugmalar */}
          <div className="space-y-2 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-4 pt-2 sm:pt-4">
            <motion.div whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
              <Link
                href={`/${locale}/catering`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#1C261E] font-black text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all cursor-pointer"
              >
                <Crown className="w-4 h-4 text-[#1C261E]" />
                <span>{isRu ? 'Оформить заявку онлайн' : 'Onlayn ariza qoldirish'}</span>
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3">
              <motion.a
                whileTap={{ scale: 0.94 }}
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-6 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37]" />
                <span>Telegram</span>
              </motion.a>

              <motion.a
                whileTap={{ scale: 0.94 }}
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs border border-white/15 transition-all cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="truncate">{phone}</span>
              </motion.a>
            </div>
          </div>

        </div>

        {/* O'ng qism: Shohona to'y torti fotosuratli kartochka - faqat kompyuterda ko'rinadi */}
        <div className="hidden lg:flex lg:col-span-5 justify-center">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative w-full max-w-sm rounded-3xl overflow-hidden border-2 border-[#D4AF37]/50 shadow-2xl bg-[#121F15] group"
          >
            <div className="relative w-full h-80">
              <Image
                src="https://images.unsplash.com/photo-1519869325930-281384150729?w=600&auto=format&fit=crop&q=80"
                alt="VIP Wedding Cakes"
                fill
                sizes="380px"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              {/* Oyna yaltirashi */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[250%] transition-transform duration-1000 ease-in-out pointer-events-none z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 border-2 border-[#D4AF37] flex items-center justify-center mx-auto mb-2 text-[#D4AF37] shadow-inner">
                <Crown className="w-6 h-6" />
              </div>

              <span className="font-serif font-black text-xl text-white block">
                VIP Wedding & Event
              </span>
              <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest block mt-0.5">
                Mo‘jiza 777 Signature
              </span>

              <p className="text-[11px] text-[#E2EBE4] mt-2 line-clamp-2 leading-relaxed">
                {isRu
                  ? 'Более 500 проведенных свадебных торжеств по Кашкадарье'
                  : 'Qashqadaryo bo‘ylab 500 dan ortiq to‘y va marosimlarning hamkori'}
              </p>

              <div className="w-full mt-4 pt-3 border-t border-white/15 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="block font-black text-base text-[#D4AF37]">5–30 kg</span>
                  <span className="text-[10px] text-[#A8B5AA]">{isRu ? 'Вес торта' : 'To‘y tortlari'}</span>
                </div>
                <div>
                  <span className="block font-black text-base text-[#D4AF37]">10–50 kg</span>
                  <span className="text-[10px] text-[#A8B5AA]">{isRu ? 'Выпечка' : 'Pishiriqlar'}</span>
                </div>
                <div>
                  <span className="block font-black text-base text-[#D4AF37]">100%</span>
                  <span className="text-[10px] text-[#A8B5AA]">{isRu ? 'Качество' : 'Sifat kafolati'}</span>
                </div>
              </div>
            </div>

          </motion.div>
        </div>

      </div>

    </section>
  );
};

export default VIPEventCatering;