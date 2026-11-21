'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Navigation, 
  Store, 
  Coffee, 
  Wifi, 
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Branch } from '../../lib/api/types';
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer';
import { ScrollReveal } from '../ui/ScrollReveal';

interface BranchesViewProps {
  branches: Branch[];
  locale: 'uz' | 'ru';
}

// Har bir filial uchun avto-slayderli interaktiv karta
function BranchCard({ branch, locale }: { branch: Branch; locale: 'uz' | 'ru' }) {
  const t = useTranslations('BranchesPage');
  const tc = useTranslations('Common');
  const isRu = locale === 'ru';

  const defaultImages = branch.id === 2
    ? [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&auto=format&fit=crop&q=80',
      ]
    : [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80',
      ];

  const images = branch.images && branch.images.length > 0
    ? branch.images
    : (branch.imageUrl ? [branch.imageUrl, ...defaultImages.slice(1)] : defaultImages);

  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Har 3.5 soniyada avtomatik keyingi rasmga o'tish (slayder)
  useEffect(() => {
    if (isPaused || images.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused, images.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % images.length);
  };

  const yandexUrl = branch.latitude && branch.longitude
    ? `https://yandex.com/maps/?pt=${branch.longitude},${branch.latitude}&z=17&l=map`
    : `https://yandex.com/maps/?text=${encodeURIComponent(branch.address)}`;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="bg-white dark:bg-[#1A281E] rounded-2xl sm:rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
    >
      {/* Slayder qismi */}
      <div className="relative h-32 sm:h-56 md:h-64 bg-[#F4EFE6] dark:bg-[#141F17] overflow-hidden select-none">
        {images.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              activeIdx === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image
              src={img}
              alt={`${branch.name} ${idx + 1}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10 pointer-events-none" />

        {/* Yuqori chapda: Ochiq nishoni */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20">
          <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-[#244B2B]/90 dark:bg-[#1A281E]/90 backdrop-blur-md text-[#D4AF37] dark:text-[#E5C358] border border-[#D4AF37]/30 shadow-xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{tc('openNow')}</span>
          </span>
        </div>

        {/* Yuqori o'ngda: Filial nishoni */}
        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20">
          <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20">
            {branch.id === 1 ? (isRu ? 'Центр' : 'Markaz') : (isRu ? 'Фабрика' : 'Sex')}
          </span>
        </div>

        {/* Strelkalar (mobilda ham bosish mumkin) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Oldingi rasm"
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 sm:opacity-70 active:scale-90"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Keyingi rasm"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 sm:opacity-70 active:scale-90"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Slayd nuqtalari (Dots) */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveIdx(i);
                  }}
                  aria-label={`Rasm ${i + 1}`}
                  className={`h-1 sm:h-1.5 rounded-full transition-all ${
                    activeIdx === i
                      ? 'w-3.5 sm:w-4 bg-[#D4AF37]'
                      : 'w-1 sm:w-1.5 bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Tafsilotlar */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          <h2 className="font-serif font-black text-xs sm:text-lg text-[#1C261E] dark:text-[#F5F2EA] truncate leading-tight">
            {branch.name}
          </h2>

          <div className="space-y-1.5 mt-1.5 text-[10px] sm:text-xs text-[#596B5E] dark:text-[#A6B7AA]">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#244B2B] dark:text-[#E5C358] flex-shrink-0 mt-0.5" />
              <span className="font-medium text-[#1C261E] dark:text-[#F5F2EA] line-clamp-1">
                {branch.address}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
              <span className="truncate">
                {branch.workHours || '09:00 – 22:00'}
              </span>
            </div>
          </div>

          {/* Qulayliklar (Desktopda ko'rinadi, mobilda ixcham) */}
          <div className="hidden sm:flex items-center gap-3 mt-3 pt-2.5 border-t border-[#E9E5DD] dark:border-[#28392B] text-[11px] text-[#8C9B90] dark:text-[#889B8C]">
            <span className="flex items-center gap-1">
              <Coffee className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Kofe</span>
            </span>
            <span className="flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-[#244B2B] dark:text-[#E5C358]" />
              <span>WiFi</span>
            </span>
            <span className="flex items-center gap-1">
              <Car className="w-3.5 h-3.5 text-[#244B2B] dark:text-[#E5C358]" />
              <span>Parkovka</span>
            </span>
          </div>
        </div>

        {/* Tugmalar (Mobilda 1 qatorda 2 ta qulay tugma) */}
        <div className="pt-2 sm:pt-3 border-t border-[#E9E5DD] dark:border-[#28392B] flex items-center gap-1.5 sm:gap-2.5">
          <a
            href={`tel:${branch.phone.replace(/\s+/g, '')}`}
            className="flex-1 py-1.5 sm:py-2.5 px-2 rounded-xl border border-[#244B2B] dark:border-[#D4AF37] text-[#244B2B] dark:text-[#E5C358] hover:bg-[#244B2B] dark:hover:bg-[#D4AF37] hover:text-white dark:hover:text-[#0F1712] font-bold text-[10px] sm:text-xs text-center transition-all flex items-center justify-center gap-1 active:scale-95 shadow-2xs"
          >
            <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{t('call')}</span>
          </a>

          <a
            href={yandexUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-1.5 sm:py-2.5 px-2 rounded-xl bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] hover:bg-[#1A3720] dark:hover:bg-[#E5C358] font-bold text-[10px] sm:text-xs text-center shadow-xs transition-all flex items-center justify-center gap-1 active:scale-95"
          >
            <Navigation className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37] dark:text-[#0F1712]" />
            <span>{t('openMap')}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export function BranchesView({ branches, locale }: BranchesViewProps) {
  const t = useTranslations('BranchesPage');
  const tc = useTranslations('Common');
  const isRu = locale === 'ru';
  const [localBranches, setLocalBranches] = React.useState<Branch[] | null>(null);

  React.useEffect(() => {
    const handleBranchesUpdated = (event: Event) => {
      const next = (event as CustomEvent<Branch[]>).detail;
      if (Array.isArray(next)) setLocalBranches(next);
    };
    window.addEventListener('mujiza_branches_updated', handleBranchesUpdated);
    return () => window.removeEventListener('mujiza_branches_updated', handleBranchesUpdated);
  }, []);

  const DEFAULT_BRANCHES: Branch[] = [
    {
      id: 1,
      name: isRu ? 'Главный филиал (Центр)' : 'Markaziy filial (Markaz)',
      address: isRu ? 'г. Карши, ул. Ислама Каримова, 14' : "Qarshi sh., Islom Karimov ko'chasi 14",
      phone: '+998 93 706 73 21',
      workHours: '08:00 – 23:00',
      latitude: 38.8354,
      longitude: 65.7923,
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80',
      ],
      isPickupAvailable: true,
    },
    {
      id: 2,
      name: isRu ? 'Филиал Насаф' : 'Nasaf filiali',
      address: isRu ? 'г. Карши, ул. Насаф, 48' : "Qarshi sh., Nasaf ko'chasi 48",
      phone: '+998 93 706 73 22',
      workHours: '08:30 – 22:30',
      latitude: 38.8451,
      longitude: 65.8012,
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&auto=format&fit=crop&q=80',
      ],
      isPickupAvailable: true,
    },
  ];

  const candidate = localBranches && localBranches.length > 0 ? localBranches : branches;
  const items = candidate && candidate.length > 0 ? candidate : DEFAULT_BRANCHES;

  return (
    <div className="max-w-[1720px] mx-auto px-3 sm:px-8 lg:px-12 xl:px-16 pt-4 sm:pt-8 pb-4 sm:pb-10">
      
      <ScrollReveal variant="fade-up">
      {/* Sarlavha */}
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12">
        <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#D4AF37] dark:text-[#E5C358] block mb-1">
          {isRu ? 'Сеть кондитерских домов' : 'Qandolat uylari tarmog‘i'}
        </span>
        <h1 className="font-serif font-black text-2xl sm:text-4xl text-[#1C261E] dark:text-[#F5F2EA] tracking-tight">
          {t('title')}
        </h1>
        <p className="text-xs sm:text-sm text-[#596B5E] dark:text-[#A6B7AA] mt-1.5 sm:mt-2">
          {t('subtitle')}
        </p>
      </div>
      </ScrollReveal>

      {/* Filiallar kartochkalari gridi: Mobilda 1 qatorda 2 ta! */}
      <StaggerContainer mode="mount" className="grid grid-cols-2 gap-2.5 sm:gap-6 lg:gap-8">
        {items.map((branch) => (
          <StaggerItem key={branch.id}>
            <BranchCard branch={branch} locale={locale} />
          </StaggerItem>
        ))}
      </StaggerContainer>

      <ScrollReveal variant="fade-up">
      {/* Qarshi shahri xaritasi ko'rinishi (Interactive Map Section) */}
      <div className="mt-8 sm:mt-14 bg-white dark:bg-[#1A281E] rounded-2xl sm:rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] p-4 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h3 className="font-serif font-black text-base sm:text-xl text-[#1C261E] dark:text-[#F5F2EA]">
              {isRu ? 'Карта филиалов в Карши' : 'Qarshi shahridagi filiallar xaritasi'}
            </h3>
            <p className="text-[11px] sm:text-xs text-[#596B5E] dark:text-[#A6B7AA] mt-0.5">
              {isRu ? 'Все филиалы на единой карте города' : 'Barcha manzillarimiz yagona xaritada'}
            </p>
          </div>
          <span className="text-xs font-bold text-[#244B2B] dark:text-[#E5C358] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
            <span>{items.length} {isRu ? 'действующих филиала' : 'ta filial ochiq'}</span>
          </span>
        </div>

        {/* Yandex Map Iframe */}
        <div className="w-full h-64 sm:h-96 rounded-xl sm:rounded-2xl overflow-hidden border border-[#E9E5DD] dark:border-[#28392B] relative bg-[#F5F2EB] dark:bg-[#121B14] flex flex-col">
          <div className="relative w-full h-[calc(100%+88px)] -mb-[88px] overflow-hidden flex-1">
            <iframe
              src="https://yandex.uz/map-widget/v1/?ll=65.7967%2C38.8402&z=14&pt=65.7923,38.8354,pm2rdm~65.8012,38.8451,pm2rdm"
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              title="Mo'jiza 777 filiallari xaritasi"
              className="w-full h-full border-0"
            />
          </div>

          {/* Pastki brend paneli */}
          <div className="relative z-10 bg-white/95 dark:bg-[#141F17]/95 backdrop-blur-md px-3 sm:px-4 py-2 border-t border-[#E9E5DD] dark:border-[#28392B] flex items-center justify-between text-[11px] text-[#596B5E] dark:text-[#A6B7AA]">
            <span className="font-serif font-bold text-[#244B2B] dark:text-[#E5C358]">Mujiza 777</span>
            <span>Qarshi shahri</span>
          </div>
        </div>
      </div>
      </ScrollReveal>

    </div>
  );
}

export default BranchesView;

