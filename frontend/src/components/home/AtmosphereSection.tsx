'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, Award, Heart } from 'lucide-react';
import { LogoEmblem } from '../ui/Logo';
import { useCmsContent } from '../../lib/cms/content';

interface AtmosphereSectionProps {
  locale: 'uz' | 'ru';
}

export const AtmosphereSection: React.FC<AtmosphereSectionProps> = ({ locale }) => {
  const [activePhoto, setActivePhoto] = useState(0);
  const { content } = useCmsContent();
  const isRu = locale === 'ru';

  // Do'kon fotosuratlari va vitrinalari slaydlari
  const atmosphereItems = content.atmosphere.items.map((item) => ({
    title: isRu && item.titleRu ? item.titleRu : item.titleUz,
    desc: isRu && item.descRu ? item.descRu : item.descUz,
    icon: '🌿',
    tag: isRu && item.tagRu ? item.tagRu : item.tagUz,
    imageUrl: item.imageUrl,
    color: 'from-emerald-950/80 via-emerald-900/60 to-transparent',
  }));

  // Avtomatik almashtirish (5 soniyada)
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePhoto((prev) => (prev + 1) % atmosphereItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [atmosphereItems.length]);

  return (
    <section className="hidden sm:block py-12 sm:py-16 bg-[#F4EFE6]/60 dark:bg-[#141F17] rounded-3xl border border-[#E9E5DD]/70 dark:border-[#293B2D] my-10 overflow-hidden shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Sarlavha */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#244B2B]/10 dark:bg-[#244B2B]/30 text-[#244B2B] dark:text-[#4ADE80] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{locale === 'ru' ? 'Наш кондитерский дом' : 'Bizning qandolat uyi'}</span>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-4xl text-[#1C261E] dark:text-[#F5F2EA]">
            {isRu && content.atmosphere.titleRu ? content.atmosphere.titleRu : content.atmosphere.titleUz}
          </h2>
          <p className="text-sm text-[#596B5E] dark:text-[#A6B7AA]">
            {isRu && content.atmosphere.subtitleRu ? content.atmosphere.subtitleRu : content.atmosphere.subtitleUz}
          </p>
        </div>

        {/* Asosiy Atmosfera kartasi va slayderi */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Chap tomondagi interaktiv kartochka */}
          <div className="lg:col-span-7 relative rounded-3xl overflow-hidden shadow-xl min-h-[360px] sm:min-h-[420px] bg-[#1C261E] flex flex-col justify-end p-6 sm:p-10 border border-[#244B2B]/40">
            {/* Rasm agar mavjud bo'lsa */}
            {atmosphereItems[activePhoto]?.imageUrl && (
              <Image 
                src={atmosphereItems[activePhoto].imageUrl} 
                alt={atmosphereItems[activePhoto].title} 
                fill
                unoptimized
                className="object-cover transition-opacity duration-700" 
              />
            )}
            {/* Orqa fon naqsh va zumrad nurlari */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
            <div className="absolute top-10 right-10 z-10 opacity-20 pointer-events-none">
              <LogoEmblem size={160} />
            </div>

            {/* Kontent */}
            <div className="relative z-20 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold">
                <span>{atmosphereItems[activePhoto].icon}</span>
                <span>{atmosphereItems[activePhoto].tag}</span>
              </div>

              <h3 className="font-serif font-bold text-xl sm:text-3xl text-white leading-snug">
                {atmosphereItems[activePhoto].title}
              </h3>

              <p className="text-xs sm:text-sm text-[#E2EBE4] leading-relaxed max-w-lg">
                {atmosphereItems[activePhoto].desc}
              </p>

              {/* Slayder nav nuqtalari */}
              <div className="flex items-center gap-2 pt-2">
                {atmosphereItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhoto(idx)}
                    className={`h-2 rounded-full transition-all ${
                      activePhoto === idx ? 'w-8 bg-[#D4AF37]' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Foto ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* O'ng tomondagi afzalliklar va do'kon xususiyatlari */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#293B2D] shadow-sm flex items-start gap-4 hover:border-[#D4AF37]/60 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#244B2B]/10 dark:bg-[#244B2B]/30 text-[#244B2B] dark:text-[#4ADE80] flex items-center justify-center flex-shrink-0 text-xl font-bold">
                ✨
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-[#1C261E] dark:text-[#F5F2EA]">
                  {locale === 'ru' ? '200+ видов сладостей' : '200+ turdagi shirinliklar'}
                </h4>
                <p className="text-xs text-[#596B5E] dark:text-[#A6B7AA] mt-1 leading-relaxed">
                  {locale === 'ru'
                    ? 'Торты, пирожные, капкейки, макаронс и традиционная восточная выпечка'
                    : "Tortlar, ruletlar, pishiriqlar, kapkeyklar, makaronlar va milliy shirinliklar"}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#293B2D] shadow-sm flex items-start gap-4 hover:border-[#D4AF37]/60 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 dark:bg-[#D4AF37]/25 text-[#AA820A] dark:text-[#E5C358] flex items-center justify-center flex-shrink-0 text-xl font-bold">
                👑
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-[#1C261E] dark:text-[#F5F2EA]">
                  {locale === 'ru' ? 'Бренд 777 — Знак качества' : 'Brend 777 — Sinalgan sifat'}
                </h4>
                <p className="text-xs text-[#596B5E] dark:text-[#A6B7AA] mt-1 leading-relaxed">
                  {locale === 'ru'
                    ? 'Только отборные натуральные ингредиенты: сливочное масло, бельгийский шоколад, свежие ягоды'
                    : "Faqat sara tabiiy mahsulotlar: qaymoq, haqiqiy saryog', Belgiya shokoladi va barra mevalar"}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#293B2D] shadow-sm flex items-start gap-4 hover:border-[#D4AF37]/60 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-[#244B2B] dark:text-[#4ADE80] flex items-center justify-center flex-shrink-0 text-xl font-bold">
                📍
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-[#1C261E] dark:text-[#F5F2EA]">
                  {locale === 'ru' ? 'Удобная локация в Карши' : 'Qarshi shahrida qulay joylashuv'}
                </h4>
                <p className="text-xs text-[#596B5E] dark:text-[#A6B7AA] mt-1 leading-relaxed">
                  {locale === 'ru'
                    ? 'Удобный самовывоз из филиала или бережная доставка прямо до вашей двери'
                    : "Filialdan o'zingiz olib ketishingiz yoki to'g'ridan-to'g'ri eshigingizgacha yetkazib berish imkoniyati"}
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default AtmosphereSection;
