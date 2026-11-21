'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Phone, Clock, MapPin, Send, Instagram, Heart, ShieldCheck } from 'lucide-react';
import { LogoEmblem } from '../ui/Logo';
import { PublicSettings } from '../../lib/api/types';

interface FooterProps {
  locale: 'uz' | 'ru';
  settings?: PublicSettings | null;
}

export const Footer: React.FC<FooterProps> = ({ locale, settings }) => {
  const t = useTranslations('Navigation');
  const isRu = locale === 'ru';

  const phone = settings?.phone || '+998 93 706 73 21';
  const openTime = settings?.openTime?.slice(0, 5) || '09:00';
  const closeTime = settings?.closeTime?.slice(0, 5) || '22:00';
  const telegramUrl = settings?.telegramUrl || 'https://t.me/mujizashirinliklari777';
  const instagramUrl = settings?.instagramUrl || 'https://instagram.com/mujizashirinliklari777';

  return (
    <footer className="bg-[#1C261E] dark:bg-[#0C140E] text-[#FBF9F4] pt-8 sm:pt-14 pb-28 sm:pb-24 lg:pb-12 border-t border-[#2C3B2F] dark:border-[#213024] relative overflow-hidden">
      {/* Orqa fondagi nozik tilla/zumrad gradient nurlari */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#244B2B]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        
        {/* Asosiy qator: Telefonda ixchamlashtirilgan, kompyuterda 4 ustunli to'liq tartib */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 pb-8 sm:pb-12 border-b border-[#2C3B2F]/80">
          
          {/* 1. Brend & Logo bloki (Telefonda ixcham, desktopda 4 ustun) */}
          <div className="lg:col-span-4 space-y-3.5">
            <div className="flex items-center gap-3">
              <LogoEmblem size={50} className="drop-shadow-lg flex-shrink-0" />
              <div>
                <span className="font-serif font-bold text-lg sm:text-xl tracking-wide text-[#FBF9F4] block">
                  MO<span className="text-[#D4AF37]">'</span>JIZA <span className="text-[#D4AF37]">777</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-sans font-semibold tracking-[0.24em] text-[#D4AF37] uppercase block">
                  {isRu ? 'кондитерский дом' : 'shirinliklari'}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#A8B5AA] leading-relaxed max-w-md">
              {isRu
                ? 'Кондитерский дом в городе Карши. Авторские торты, десерты и восточные сладости с гарантией вкуса и свежести.'
                : 'Qarshi shahridagi mashhur shirinliklar va maxsus tortlar qandolat uyi. Yillar davomida sinalgan sifat va o‘zgacha mehr.'}
            </p>

            {/* Ijtimoiy tarmoqlar: Telefonda qulay 2 ta kapsula tugma */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#244B2B] border border-white/10 hover:border-[#D4AF37]/60 text-xs font-semibold text-[#FDF0CD] transition-all shadow-xs active:scale-95"
                aria-label="Telegram"
              >
                <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Telegram</span>
              </a>

              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#244B2B] border border-white/10 hover:border-[#D4AF37]/60 text-xs font-semibold text-[#FDF0CD] transition-all shadow-xs active:scale-95"
                aria-label="Instagram"
              >
                <Instagram className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Instagram</span>
              </a>
            </div>
          </div>

          {/* 2 & 3. Bo'limlar va Ma'lumot: Telefonda YONMA-YON (2 ustun!), kompyuterda 2 ta alohida ustun */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-4 sm:gap-6">
            
            {/* Bo'limlar */}
            <div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#FBF9F4] mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
                <span>{isRu ? 'Разделы' : "Bo'limlar"}</span>
              </h4>
              <ul className="space-y-2 text-xs text-[#A8B5AA]">
                <li>
                  <Link href={`/${locale}`} className="hover:text-[#D4AF37] transition-colors">
                    {t('home')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/catalog`} className="hover:text-[#D4AF37] transition-colors">
                    {t('catalog')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/branches`} className="hover:text-[#D4AF37] transition-colors">
                    {t('branches')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/cake-builder`} className="hover:text-[#D4AF37] transition-colors flex items-center gap-1 text-[#D4AF37]">
                    <span>✨</span>
                    <span>{t('cakeBuilder')}</span>
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/catering`} className="hover:text-[#D4AF37] transition-colors flex items-center gap-1 text-[#D4AF37]">
                    <span>👑</span>
                    <span>{isRu ? 'Банкеты' : 'To‘y & marosim'}</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Ma'lumot va yordam */}
            <div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#FBF9F4] mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
                <span>{isRu ? 'Инфо' : "Ma'lumot"}</span>
              </h4>
              <ul className="space-y-2 text-xs text-[#A8B5AA]">
                <li>
                  <Link href={`/${locale}/delivery-payment`} className="hover:text-[#D4AF37] transition-colors">
                    {t('deliveryPayment')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/about`} className="hover:text-[#D4AF37] transition-colors">
                    {t('about')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/privacy`} className="hover:text-[#D4AF37] transition-colors">
                    {t('privacy')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/offer`} className="hover:text-[#D4AF37] transition-colors">
                    {t('offer')}
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          {/* 4. Aloqa & Manzil - Telefonda hashamatli ixcham Kontakt Kartochkasi */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-serif font-bold text-sm sm:text-base text-[#FBF9F4] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
              <span>{t('contact')}</span>
            </h4>

            <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
              
              {/* Tezkor Qo'ng'iroq Tugmasi (1-bosishda ulaydi) */}
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-[#244B2B] to-[#1A3720] hover:from-[#2E5E36] hover:to-[#22482A] border border-[#D4AF37]/40 text-white transition-all active:scale-95 group shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block text-[9px] text-[#D3E0D6] uppercase tracking-wider">
                      {isRu ? 'Заказ & Доставка' : 'Buyurtma & Aloqa'}
                    </span>
                    <span className="block text-xs font-bold text-[#FDF0CD] group-hover:text-white transition-colors">
                      {phone}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#D4AF37] bg-white/10 px-2 py-0.5 rounded-md">
                  {isRu ? 'Позвонить' : 'Qo‘ng‘iroq'}
                </span>
              </a>

              {/* Ish vaqti */}
              <div className="flex items-center gap-2 text-xs text-[#A8B5AA]">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                <span>
                  {isRu ? 'Ежедневно:' : 'Har kuni:'}{' '}
                  <strong className="text-[#FDF0CD]">{openTime} – {closeTime}</strong>
                </span>
              </div>

              {/* Manzil */}
              <div className="flex items-start gap-2 text-xs text-[#A8B5AA]">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span className="line-clamp-2">
                  {isRu 
                    ? 'г. Карши, ул. Ислама Каримова, 14 (Центр) и ул. Насаф, 48' 
                    : "Qarshi sh., Islom Karimov ko'chasi 14 (Markaz) va Nasaf ko'chasi 48"}
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* Mualliflik huquqi va Admin havola */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A8B5AA]/70 gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Mo‘jiza 777. {isRu ? 'Все права защищены.' : 'Barcha huquqlar himoyalangan.'}</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link 
              href="/admin" 
              className="text-[#A8B5AA]/60 hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{isRu ? 'Панель управления (Admin)' : 'Boshqaruv paneli (Admin)'}</span>
            </Link>
            <p className="flex items-center gap-1">
              <span>{isRu ? 'С любовью' : 'Mehr bilan tayyorlangan'}</span>
              <Heart className="w-3 h-3 text-[#B83A3A] fill-[#B83A3A]" />
              <span>Qarshi</span>
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;