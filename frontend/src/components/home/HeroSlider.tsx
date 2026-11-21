'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Promotion } from '../../lib/api/types';
import { useCmsContent } from '../../lib/cms/content';

interface SlideItem {
  id: number;
  title: string;
  subtitle: string;
  tag: string;
  bgGradient: string;
  image?: string;
  link: string;
  buttonText: string;
}

interface HeroSliderProps {
  locale: 'uz' | 'ru';
  banners?: Promotion[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ locale, banners }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Yuqori sifatli fotosuratlar bilan boyitilgan slaydlar
  const defaultSlides: SlideItem[] = [
    {
      id: 1,
      title: locale === 'ru' ? 'Ваши волшебные сладости' : "Sizning mo'jizaviy shirinliklaringiz",
      subtitle:
        locale === 'ru'
          ? 'Более 200 видов эксклюзивных тортов, свежей выпечки и десертов ручной работы в городе Карши'
          : "Qarshi shahrida 200 dan ortiq sara tortlar, yangi pishiriqlar va nozik qo'l mehnati shirinliklari",
      tag: 'Brend 777 · Sinalgan sifat',
      bgGradient: 'from-[#1B3820] via-[#244B2B] to-[#122416]',
      image: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1600&auto=format&fit=crop&q=80',
      link: `/${locale}/catalog`,
      buttonText: locale === 'ru' ? 'Смотреть каталог' : "Katalogga o'tish",
    },
    {
      id: 2,
      title: locale === 'ru' ? 'Торты на заказ любой сложности' : "Istalgan dizayndagi maxsus tortlar",
      subtitle:
        locale === 'ru'
          ? 'Свадебные, юбилейные и праздничные торты. Соберите торт своей мечты в нашем конструкторе'
          : "To'y, tug'ilgan kun va bayramlar uchun nafis tortlar. O'zingiz orzu qilgan ta'm va dizaynni tanlang",
      tag: 'Maxsus buyurtmalar',
      bgGradient: 'from-[#2A3F29] via-[#1E3320] to-[#111F13]',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&auto=format&fit=crop&q=80',
      link: `/${locale}/cake-builder`,
      buttonText: locale === 'ru' ? 'Собрать торт' : 'Tort yasash',
    },
    {
      id: 3,
      title: locale === 'ru' ? 'Быстрая доставка по городу' : "Qarshi bo'ylab tezkor yetkazib berish",
      subtitle:
        locale === 'ru'
          ? 'Фирменная изумрудная упаковка сохранит свежесть и красоту вашего десерта до самого стола'
          : "Do'konimizning maxsus zumrad qutisi shirinligingizni xuddi yangi uzilgandek yetkazadi",
      tag: 'Yetkazib berish xizmati',
      bgGradient: 'from-[#19321E] via-[#24482C] to-[#142618]',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
      link: `/${locale}/catalog`,
      buttonText: locale === 'ru' ? 'Заказать сейчас' : 'Hozir buyurtma berish',
    },
  ];

  const { content } = useCmsContent();
  const activeCmsSlides = content.heroSlides.filter((s) => s.isActive);

  // Admin paneldan kiritilgan server bannerlarini birinchi o'ringa qo'yamiz:
  const backendSlides: SlideItem[] = (banners && banners.length > 0)
    ? banners.map((b, idx) => ({
        id: b.id || idx + 1,
        title: (locale === 'ru' && (b as any).titleRu ? (b as any).titleRu : (b as any).titleUz || b.title) || defaultSlides[0].title,
        subtitle: (locale === 'ru' && (b as any).summaryRu ? (b as any).summaryRu : (b as any).summaryUz || b.summary) || defaultSlides[0].subtitle,
        tag: 'Mo‘jiza 777 · Maxsus taklif',
        bgGradient: 'from-[#1B3820] via-[#244B2B] to-[#122416]',
        image: b.imageUrl || (b as any).mobileImageUrl || defaultSlides[idx % defaultSlides.length].image,
        link: b.linkUrl ? (b.linkUrl.startsWith('/') ? `/${locale}${b.linkUrl.replace(/^\/(uz|ru)/, '')}` : b.linkUrl) : `/${locale}/catalog`,
        buttonText: locale === 'ru' ? 'Batafsil ko‘rish' : 'Batafsil',
      }))
    : [];

  const slides: SlideItem[] = backendSlides.length > 0
    ? backendSlides
    : (activeCmsSlides.length > 0
        ? activeCmsSlides.map((s, idx) => ({
            id: idx + 1,
            title: locale === 'ru' && s.titleRu ? s.titleRu : s.titleUz,
            subtitle: locale === 'ru' && s.subtitleRu ? s.subtitleRu : s.subtitleUz,
            tag: locale === 'ru' && s.tagRu ? s.tagRu : s.tagUz,
            bgGradient: s.bgGradient || 'from-[#1B3820] via-[#244B2B] to-[#122416]',
            image: s.imageUrl || defaultSlides[idx % defaultSlides.length].image,
            link: s.link.startsWith('/') ? `/${locale}${s.link.replace(/^\/(uz|ru)/, '')}` : s.link,
            buttonText: locale === 'ru' && s.buttonTextRu ? s.buttonTextRu : s.buttonTextUz,
          }))
        : defaultSlides);

  // Avtomatik aylanuvchi slayder (4.5 soniyada)
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl border border-transparent dark:border-[#D4AF37]/30 sm:min-h-[460px] lg:min-h-[500px] flex items-stretch sm:items-center ${isPaused ? 'hero-paused' : ''}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0 overflow-hidden">
        {slides.map((slide, idx) => {
          const active = idx === currentSlide;
          return (
            <div
              key={slide.id}
              className={`hero-fade absolute inset-0 overflow-hidden ${active ? 'opacity-100' : 'opacity-0'}`}
              aria-hidden={!active}
            >
              {slide.image ? (
                <div className="hero-drift absolute inset-0" style={{ animationDelay: `${idx * -7}s` }}>
                  <Image
                    src={slide.image}
                    alt={active ? slide.title : ''}
                    fill
                    sizes="100vw"
                    className="object-cover object-center"
                    priority={idx === 0}
                  />
                </div>
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient}`} />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0E1A11]/95 via-[#18311D]/85 to-black/40 sm:to-black/30" />
              <div className="absolute inset-0 bg-black/25" />
            </div>
          );
        })}
      </div>

      {/* Nozik yaltiroq doiralar (Atmosfera effekti) */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Slayd tarkibi */}
      <div className="relative z-10 w-full px-4 sm:px-12 lg:px-20 pt-6 pb-10 sm:py-14">
        {slides[currentSlide] && (() => {
          const slide = slides[currentSlide];
          return (
            <div key={slide.id} className="max-w-2xl lg:max-w-3xl space-y-3 sm:space-y-5">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/20 dark:border-white/10 text-[#D4AF37] dark:text-[#E5C358] text-[11px] sm:text-xs font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{slide.tag}</span>
              </div>

              <h1 className="font-serif font-bold text-[1.65rem] leading-[1.15] sm:text-4xl lg:text-5xl sm:leading-tight text-white drop-shadow-md">
                {slide.title}
              </h1>

              <p className="text-[13px] sm:text-base text-[#E2EBE4] leading-relaxed sm:line-clamp-3 max-w-xl drop-shadow-sm">
                {slide.subtitle}
              </p>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3.5 pt-1 sm:pt-2 sm:max-w-none">
                <motion.div whileTap={{ scale: 0.94 }} className="contents">
                  <Link
                    href={slide.link}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-1 px-3 sm:px-7 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#1C261E] font-bold text-[12px] sm:text-sm shadow-md hover:shadow-xl transition-all text-center leading-tight cursor-pointer"
                  >
                    <span>{slide.buttonText}</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  </Link>
                </motion.div>

                <motion.div whileTap={{ scale: 0.94 }} className="contents">
                  <Link
                    href={`/${locale}/cake-builder`}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 px-3 sm:px-7 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-white/10 dark:bg-white/[0.08] hover:bg-white/20 dark:hover:bg-white/[0.14] text-white font-semibold text-[12px] sm:text-sm backdrop-blur-md border border-white/25 dark:border-white/15 transition-all text-center leading-tight cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                    <span>{locale === 'ru' ? 'Торт на заказ' : 'Tort yasash'}</span>
                  </Link>
                </motion.div>
              </div>
            </div>
          );
        })()}
      </div>

      <svg
        aria-hidden="true"
        viewBox="0 0 1200 48"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full h-5 sm:h-10 pointer-events-none z-10 text-[#FBF9F4] dark:text-[#0F1712]"
      >
        <path d="M0 28 C 180 8 320 40 520 22 C 740 4 900 36 1200 16 L 1200 48 L 0 48 Z" fill="currentColor" fillOpacity="0.92" />
      </svg>

      {/* Slayder Navigatsiya tugmalari (Desktop) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Oldingi slayd"
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/30 hover:bg-black/50 text-white items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-90"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            aria-label="Keyingi slayd"
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/30 hover:bg-black/50 text-white items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-90"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Nuqtalar (Dots) */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Slayd ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  currentSlide === idx ? 'w-7 bg-[#244B2B] dark:bg-[#E5C358]' : 'w-1.5 bg-[#244B2B]/30 dark:bg-white/30'
                }`}
              />
            ))}
          </div>
        </>
      )}

    </div>
  );
};

export default HeroSlider;