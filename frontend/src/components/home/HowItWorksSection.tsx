'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Cake, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Gift
} from 'lucide-react';

interface HowItWorksSectionProps {
  locale: 'uz' | 'ru';
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ locale }) => {
  const isRu = locale === 'ru';

  const steps = [
    {
      stepNumber: '01',
      badge: isRu ? '1-Й ШАГ: ВЫБОР' : '1-BOSQICH: TANLASH',
      title: isRu ? 'Выберите любимый десерт' : 'Sevimli shirinlikni tanlang',
      desc: isRu
        ? 'Листайте удобный каталог из 150+ тортов, бенто, рулетов и десертов. Укажите количество в штуках или точный вес в килограммах.'
        : 'Katalogimizdagi 150+ dan ortiq sarxil tortlar, bento, pirojniy yoki ruletlarni ko‘zdan kechiring. Dona yoki kilogrammda belgilang.',
      feature: isRu ? '150+ десертов в наличии' : '150+ xil tayyor shirinliklar',
      icon: Cake,
    },
    {
      stepNumber: '02',
      badge: isRu ? '2-Й ШАГ: ДЕТАЛИ' : '2-BOSQICH: MANZIL VA VAQT',
      title: isRu ? 'Укажите время и адрес' : 'Vaqt va manzilni belgilang',
      desc: isRu
        ? 'Укажите адрес для быстрой доставки за 45 минут или выберите удобный филиал (Центр или Насаф) для выдачи без очереди.'
        : '45 daqiqada tezkor yetkazib berish manzilini kiriting yoki o‘zingizga qulay filialdan (Markaz yoki Nasaf) navbatsiz olib ketishni tanlang.',
      feature: isRu ? 'Доставка или Самовывоз' : 'Yetkazish yoki Olib ketish',
      icon: MapPin,
    },
    {
      stepNumber: '03',
      badge: isRu ? '3-Й ШАГ: НАСЛАЖДЕНИЕ' : '3-BOSQICH: ROHATLANING',
      title: isRu ? 'Получите свежим с подарком' : 'Yangi va sovg‘a bilan qabul qiling',
      desc: isRu
        ? 'Курьер доставит десерт в термобоксе в безупречном виде. К каждому заказу мы бесплатно дарим праздничную свечу и фирменную открытку!'
        : 'Kuryerimiz tortni maxsus termoboksda shakli buzilmasdan yetkazadi. Har bir buyurtmaga bepul bayram shamchasi va tabriknoma qo‘shib beriladi!',
      feature: isRu ? 'Бесплатная свеча и открытка' : 'Bepul shamcha & tabriknoma',
      icon: Gift,
    },
  ];

  return (
    <section className="hidden sm:block space-y-6 sm:space-y-8">
      
      {/* Sarlavha qatori */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-[#E9E5DD] dark:border-[#263729]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#AA820A] dark:text-[#E5C358] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{isRu ? 'Простой и быстрый процесс' : 'Oson va qulay jarayon'}</span>
          </div>
          <h2 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-[#1C261E] dark:text-[#F5F2EA] tracking-tight leading-tight">
            <span>{isRu ? 'Как сделать заказ? ' : 'Qanday buyurtma beriladi? '}</span>
            <span className="text-[#D4AF37] relative inline-block drop-shadow-sm">
              {isRu ? '3 простых шага' : '3 ta oddiy qadam'}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#596B5E] dark:text-[#A6B7AA] mt-1.5 max-w-xl">
            {isRu
              ? 'Всего пара кликов — и ваш праздник украсит свежий, изысканный торт от мастеров Mo‘jiza 777.'
              : 'Bir necha daqiqa ichida sevimli shirinliklaringiz dasturxoningizda yoki bayramingiz markazida bo‘ladi.'}
          </p>
        </div>

        <Link
          href={`/${locale}/catalog`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#244B2B] dark:text-[#E5C358] hover:text-[#D4AF37] transition-colors self-start sm:self-auto"
        >
          <span>{isRu ? 'Перейти к выбору сладостей' : 'Katalogdagi shirinliklarni tanlash'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 3 ta Toza, Nafis va Bejirim Qadam Kartochkasi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.stepNumber}
              className="bg-white dark:bg-[#18261D] rounded-3xl border border-[#E8E2D5] dark:border-[#273B2C] p-6 sm:p-7 flex flex-col justify-between hover:border-[#D4AF37] dark:hover:border-[#D4AF37] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
            >
              {/* Orqa fondagi nafis bosqich raqami (01, 02, 03) */}
              <span className="absolute top-3 right-5 font-serif font-black text-6xl sm:text-7xl text-[#1C261E]/5 dark:text-white/5 group-hover:text-[#D4AF37]/15 transition-colors select-none pointer-events-none">
                {step.stepNumber}
              </span>

              {/* Tepa qismi: Ikona va Nishon */}
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#244B2B]/8 dark:bg-[#244B2B]/30 text-[#244B2B] dark:text-[#4ADE80] flex items-center justify-center group-hover:bg-[#244B2B] group-hover:text-white transition-colors duration-300 shadow-xs border border-[#244B2B]/10 dark:border-white/5">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:scale-105 duration-300" />
                  </div>

                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#996515] dark:text-[#E5C358] bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/40 px-3 py-1 rounded-full">
                    {step.badge}
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  <h3 className="font-bold text-lg sm:text-xl text-[#1C261E] dark:text-[#F5F2EA] group-hover:text-[#244B2B] dark:group-hover:text-[#E5C358] transition-colors leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#596B5E] dark:text-[#A6B7AA] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>

              {/* Pastki qismi: Qulaylik nishoni va indeks */}
              <div className="pt-5 mt-6 border-t border-[#EAE5DA] dark:border-[#263A2B] relative z-10 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#244B2B] dark:text-[#4ADE80] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                  <span>{step.feature}</span>
                </span>
                <span className="text-[#8C9B90] dark:text-[#A6B7AA] font-bold">
                  {idx + 1}/3
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pastki Qulay Harakat Paneli (Banner) */}
      <div className="bg-white dark:bg-[#18261D] rounded-3xl border border-[#E8E2D5] dark:border-[#273B2C] p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#244B2B] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Clock className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base text-[#1C261E] dark:text-[#F5F2EA]">
              {isRu ? 'Готовы сделать заказ прямо сейчас?' : 'Hoziroq birinchi buyurtmangizni bering!'}
            </h4>
            <p className="text-xs text-[#596B5E] dark:text-[#A6B7AA] mt-0.5">
              {isRu
                ? 'Быстро оформим онлайн или примем заказ по телефону за 1 минуту'
                : 'Saytda 1 daqiqada rasmiylashtiring yoki qo‘ng‘iroq qiling'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href={`/${locale}/catalog`}
            className="px-5 py-2.5 rounded-2xl bg-[#244B2B] text-white hover:bg-[#1A3720] font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2"
          >
            <span>{isRu ? 'Katalogga o‘tish' : 'Katalogga o‘tish'}</span>
            <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
          </Link>

          <a
            href="tel:+998937067321"
            className="px-4 py-2.5 rounded-2xl border border-[#E8E2D5] dark:border-[#273B2C] hover:border-[#244B2B] dark:hover:border-[#D4AF37] text-xs sm:text-sm font-bold text-[#1C261E] dark:text-[#F5F2EA] bg-[#FAF8F5] dark:bg-[#131F16] hover:bg-[#F4EFE6] dark:hover:bg-[#1D2F22] transition-colors flex items-center gap-2"
          >
            <Phone className="w-4 h-4 text-[#244B2B] dark:text-[#E5C358]" />
            <span>+998 93 706 73 21</span>
          </a>
        </div>
      </div>

    </section>
  );
};

export default HowItWorksSection;
