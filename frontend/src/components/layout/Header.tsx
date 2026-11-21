'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  ShoppingBag, 
  Heart, 
  Phone, 
  Clock, 
  Menu, 
  X, 
  MapPin, 
  Search,
  Sparkles,
  Globe,
  User,
  Truck,
  Store,
  ChevronRight,
  Sun,
  Moon,
  Volume2,
  VolumeX
} from 'lucide-react';
import { isSoftSoundEnabled, setSoftSoundEnabled, playSoftAddChime } from '../../lib/audio';
import { LogoHorizontal } from '../ui/Logo';
import { useCartStore } from '../../stores/cart';
import { useFavoritesStore } from '../../stores/favorites';
import { useTheme } from '../../lib/theme/useTheme';
import { formatCurrency } from '../../lib/format';
import { PublicSettings, OrderType } from '../../lib/api/types';

interface HeaderProps {
  locale: 'uz' | 'ru';
  initialSettings?: PublicSettings | null;
}

export const Header: React.FC<HeaderProps> = ({ locale, initialSettings }) => {
  const t = useTranslations('Navigation');
  const tc = useTranslations('Common');
  const pathname = usePathname();
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();

  const [settings, setSettings] = useState<PublicSettings | null>(initialSettings || null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderTypeModalOpen, setOrderTypeModalOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>('DELIVERY');

  const cartCount = useCartStore((s) => s.getItemCount());
  const cartItems = useCartStore((s) => s.items);
  const favoritesCount = useFavoritesStore((s) => s.slugs.length);
  const [cartBounced, setCartBounced] = useState(false);
  const [softSound, setSoftSound] = useState(false);

  useEffect(() => {
    setSoftSound(isSoftSoundEnabled());
  }, []);

  const toggleSoftSound = () => {
    const next = !softSound;
    setSoftSound(next);
    setSoftSoundEnabled(next);
    if (next) playSoftAddChime();
  };

  useEffect(() => {
    if (cartCount > 0) {
      setCartBounced(true);
      const timer = setTimeout(() => setCartBounced(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  // Buyurtma turini localStorage dan yuklash
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mujiza_order_type') as OrderType | null;
      if (saved) setOrderType(saved);
    } catch {}
  }, []);

  // data-theme ni butun sahifaga qo'llash
  useEffect(() => {
    const theme = settings?.seasonTheme;
    if (theme && theme !== 'DEFAULT') {
      document.documentElement.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.body.removeAttribute('data-theme');
    }
  }, [settings?.seasonTheme]);

  const seasonTheme = settings?.seasonTheme;

  const renderSeasonBanner = () => {
    if (!seasonTheme || seasonTheme === 'DEFAULT') return null;

    if (seasonTheme === 'MARCH_8') {
      return (
        <div className="bg-gradient-to-r from-[#8E24AA] via-[#D81B60] to-[#E91E63] text-white text-xs sm:text-sm font-bold py-2 px-4 shadow-sm border-b border-white/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2 mx-auto sm:mx-0">
              <span className="text-base sm:text-lg animate-bounce">🌸</span>
              <span>
                {locale === 'ru'
                  ? 'Поздравляем с 8 Марта! Праздничная коллекция авторских тортов и десертов для любимых 🌷'
                  : '8-Mart Xotin-qizlar bayrami muborak! Aziz ayollarimiz uchun bayramona tortlar va eksklyuziv shirinliklar to‘plami 🌷'}
              </span>
            </div>
            <Link
              href={`/${locale}/catalog`}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-xs font-extrabold text-white transition-all whitespace-nowrap"
            >
              <span>{locale === 'ru' ? 'Выбрать торт' : 'Tortlarni ko‘rish'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      );
    }

    if (seasonTheme === 'NEW_YEAR') {
      return (
        <div className="bg-gradient-to-r from-[#0D2B45] via-[#1B3B6F] to-[#0D2B45] border-b border-[#D4AF37]/40 text-white text-xs sm:text-sm font-bold py-2 px-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2 mx-auto sm:mx-0">
              <span className="text-base sm:text-lg animate-pulse">❄️</span>
              <span>
                {locale === 'ru'
                  ? 'С наступающим Новым Годом! Сказочные праздничные торты и сладкие подарочные наборы 🎄'
                  : 'Yangi Yil Mo‘jizasi! Bayram dasturxoni uchun sehrli qishki tortlar va sovg‘abop to‘plamlar 🎄'}
              </span>
            </div>
            <Link
              href={`/${locale}/catalog`}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37] hover:bg-[#C59B27] text-[#1C261E] text-xs font-extrabold transition-all whitespace-nowrap shadow-sm"
            >
              <span>{locale === 'ru' ? 'Заказать к столу' : 'Dasturxonga buyurtma'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      );
    }

    if (seasonTheme === 'HAYIT') {
      return (
        <div className="bg-gradient-to-r from-[#064E3B] via-[#0F766E] to-[#064E3B] border-b border-[#D4AF37]/50 text-white text-xs sm:text-sm font-bold py-2 px-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2 mx-auto sm:mx-0">
              <span className="text-base sm:text-lg">🌙</span>
              <span>
                {locale === 'ru'
                  ? 'Благословенного Рамазана и праздника Хаит! Свежие халяльные сладости к праздничному столу ✨'
                  : 'Ramazon va Hayit ayyomi muborak bo‘lsin! Iftorlik va bayram dasturxoni uchun sara halol shirinliklar ✨'}
              </span>
            </div>
            <Link
              href={`/${locale}/catalog`}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37] hover:bg-[#C59B27] text-[#1C261E] text-xs font-extrabold transition-all whitespace-nowrap shadow-sm"
            >
              <span>{locale === 'ru' ? 'Меню десертов' : 'Shirinliklar menyusi'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      );
    }

    if (seasonTheme === 'NAVRUZ') {
      return (
        <div className="bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#388E3C] border-b border-amber-300/30 text-white text-xs sm:text-sm font-bold py-2 px-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2 mx-auto sm:mx-0">
              <span className="text-base sm:text-lg animate-bounce">🌱</span>
              <span>
                {locale === 'ru'
                  ? 'С праздником Навруз! Весеннее обновление, новые вкусы сумаляка и праздничная выпечка ☀️'
                  : 'Navro‘zi olam muborak! Bahoriy yangilanish, sumalakli desertlar va bayramona shirinliklar ☀️'}
              </span>
            </div>
            <Link
              href={`/${locale}/catalog`}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-xs font-extrabold text-white transition-all whitespace-nowrap"
            >
              <span>{locale === 'ru' ? 'Весенние новинки' : 'Yangi ta’mlar'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      );
    }

    return null;
  };

  const handleSelectOrderType = (type: OrderType) => {
    setOrderType(type);
    try {
      localStorage.setItem('mujiza_order_type', type);
    } catch {}
    setOrderTypeModalOpen(false);
  };

  // Tilni almashtirish (/uz/... <-> /ru/...)
  const switchLocale = (newLocale: 'uz' | 'ru') => {
    if (newLocale === locale) return;
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    router.push(newPath);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/${locale}/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchModalOpen(false);
    setSearchQuery('');
  };

  const navLinks = [
    { href: `/${locale}/about`, label: locale === 'ru' ? 'О нас' : 'Biz haqimizda' },
    { href: `/${locale}/catalog`, label: locale === 'ru' ? 'Menyu' : 'Menyu' },
    { href: `/${locale}/branches`, label: locale === 'ru' ? 'Филиалы' : 'Filiallar' },
    { href: `/${locale}/cake-builder`, label: locale === 'ru' ? 'Торты на заказ' : 'Tort yasash', isSpecial: true },
    { href: `/${locale}/catering`, label: locale === 'ru' ? 'Свадьбы и торжества' : 'To‘y va marosimlar' },
  ];

  const phone = settings?.phone || '+998 93 706 73 21';
  const openTime = settings?.openTime?.slice(0, 5) || '09:00';
  const closeTime = settings?.closeTime?.slice(0, 5) || '22:00';
  const isOpen = settings?.isOpenNow ?? true;
  const acceptingOrders = settings?.acceptingOrders ?? true;

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#E9E5DD] shadow-sm transition-all duration-300">
        
        {/* Mavsumiy bayramona lenta (Admin Settings dan boshqariladi) */}
        {renderSeasonBanner()}

        {/* Do'kon yopiq yoki buyurtmalar to'xtatilgan bo'lsa yuqori xabar */}
        {!acceptingOrders ? (
          <div className="bg-[#B83A3A] text-white text-xs font-semibold py-1.5 px-4 text-center tracking-wide">
            ⚠️ {tc('ordersPaused')}
          </div>
        ) : !isOpen ? (
          <div className="bg-[#AA820A] text-white text-xs font-medium py-1.5 px-4 text-center">
            🌙 {tc('closedNotice')} ({openTime} – {closeTime})
          </div>
        ) : null}

        {/* Asosiy Yagona Navbar (axmad.uz va safia kabi butun ekran bo'ylab keng va toza) */}
        <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24 gap-2 sm:gap-4 xl:gap-8">
            
            {/* 1. Chap tomonda: Brend Logo (Kattaroq, bilarli va salobatli) */}
            <div className="flex items-center flex-shrink-0 py-1">
              <Link href={`/${locale}`} prefetch={true} className="flex-shrink-0 group hover:opacity-95 transition-opacity">
                <LogoHorizontal className="h-10 sm:h-12 lg:h-16 w-auto" />
              </Link>
            </div>

            {/* 2. O'rtada: Navigatsiya havolalari (Desktop) - qisqarmaydigan, bitta tekis qatorda */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-6 2xl:gap-8 whitespace-nowrap">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={true}
                    className={`relative text-xs xl:text-sm font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                      isActive
                        ? 'text-[#244B2B] font-bold'
                        : 'text-[#1C261E] hover:text-[#244B2B]'
                    }`}
                  >
                    {link.isSpecial && <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />}
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#244B2B] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* 3. "Buyurtma turi" Tabletka tugmasi (Mo'jiza 777 Tillarang & Zumrad) */}
            <div className="hidden md:flex items-center flex-shrink-0">
              <button
                type="button"
                onClick={() => setOrderTypeModalOpen(true)}
                className="px-4 py-2.5 rounded-full bg-[#D4AF37] hover:bg-[#C59B27] text-[#1C261E] text-xs xl:text-sm font-extrabold shadow-sm hover:shadow transition-all flex items-center gap-2 group active:scale-95 whitespace-nowrap"
              >
                {orderType === 'DELIVERY' ? (
                  <Truck className="w-4 h-4 text-[#1C261E]" />
                ) : (
                  <Store className="w-4 h-4 text-[#1C261E]" />
                )}
                <span>
                  {orderType === 'DELIVERY'
                    ? (locale === 'ru' ? 'Доставка' : 'Yetkazib berish')
                    : (locale === 'ru' ? 'Самовывоз' : 'Olib ketish')}
                </span>
                <span className="text-[10px] opacity-60 group-hover:translate-x-0.5 transition-transform">▼</span>
              </button>
            </div>

            {/* 4. Telefon va Ish vaqti - Hech qachon sinib pastga tushmaydi */}
            <div className="hidden sm:flex flex-col text-right leading-tight flex-shrink-0 whitespace-nowrap">
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="font-extrabold text-sm xl:text-base text-[#1C261E] hover:text-[#244B2B] transition-colors whitespace-nowrap"
              >
                {phone}
              </a>
              <span className="text-[10px] xl:text-[11px] text-[#596B5E] mt-0.5 whitespace-nowrap">
                {locale === 'ru' ? `Ежедневно ${openTime} – ${closeTime}` : `Har kuni ${openTime} – ${closeTime}`}
              </span>
            </div>

            {/* 5. O'ng tomondagi ixcham ikonkalari guruhi */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
              
              {/* Qidiruv ikonka */}
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="p-2.5 rounded-full text-[#1C261E] hover:text-[#244B2B] hover:bg-[#F4EFE6] transition-colors"
                title={locale === 'ru' ? 'Поиск' : 'Qidiruv'}
                aria-label="Qidiruv"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Savat ikonka (Desktopda ko'rinadi, mobil telefonda esa pastki qatorda o'rnatilgan) */}
              <Link
                href={`/${locale}/cart`}
                className={`hidden sm:inline-flex relative p-2.5 rounded-full text-[#1C261E] hover:text-[#244B2B] hover:bg-[#F4EFE6] transition-transform duration-200 group active:scale-90 ${
                  cartBounced ? 'animate-cart-pulse' : ''
                }`}
                title={locale === 'ru' ? 'Корзина' : 'Savat'}
                aria-label="Savat"
              >
                <ShoppingBag className="w-5 h-5 text-[#244B2B] group-hover:scale-105 transition-transform" />
                {cartCount > 0 && (
                  <span className={`absolute top-1 right-1 w-4 h-4 text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-sm transition-all duration-300 ${
                    cartBounced ? 'bg-[#244B2B] text-white scale-125' : 'bg-[#D4AF37] text-[#1C261E] scale-100'
                  }`}>
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Sevimlilar ikonka (Desktopda ko'rinadi, mobil telefonda esa pastki qatorda) */}
              <Link
                href={`/${locale}/favorites`}
                className="hidden sm:inline-flex relative p-2.5 rounded-full text-[#1C261E] hover:text-[#244B2B] hover:bg-[#F4EFE6] transition-colors"
                title={locale === 'ru' ? 'Избранное' : 'Sevimlilar'}
                aria-label="Sevimlilar"
              >
                <Heart className="w-5 h-5" />
                {favoritesCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#B83A3A] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {favoritesCount}
                  </span>
                )}
              </Link>

              {/* Til tanlash tugmasi (Globe) */}
              <button
                type="button"
                onClick={() => switchLocale(locale === 'uz' ? 'ru' : 'uz')}
                className="p-2 sm:px-3 sm:py-1.5 rounded-full border border-[#E9E5DD] hover:border-[#D4AF37] text-xs font-bold text-[#1C261E] flex items-center gap-1.5 hover:bg-[#F4EFE6] transition-colors"
                title="Tilni almashtirish"
              >
                <Globe className="w-4 h-4 text-[#244B2B]" />
                <span className="uppercase text-[11px] font-extrabold">{locale}</span>
              </button>

              <button
                type="button"
                onClick={toggleSoftSound}
                className="hidden sm:inline-flex p-2 sm:p-2.5 rounded-full border border-[#E9E5DD] hover:border-[#D4AF37] text-[#1C261E] hover:bg-[#F4EFE6] transition-colors"
                title={softSound ? (locale === 'ru' ? 'Звук выключен' : 'Ovozni o‘chirish') : (locale === 'ru' ? 'Тихий звук' : 'Past ovoz')}
                aria-label="Ovoz"
                aria-pressed={softSound}
              >
                {softSound ? <Volume2 className="w-4 h-4 text-[#244B2B]" /> : <VolumeX className="w-4 h-4 text-[#596B5E]" />}
              </button>

              {/* Tungi / Kunduzgi rejim (Dark Mode Toggle) */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 sm:p-2.5 rounded-full border border-[#E9E5DD] hover:border-[#D4AF37] text-[#1C261E] hover:bg-[#F4EFE6] transition-all group"
                title={isDark ? (locale === 'ru' ? 'Светлый режим' : 'Kunduzgi rejim') : (locale === 'ru' ? 'Тёмный режим' : 'Tungi rejim')}
                aria-label="Tungi rejimni yoqish/o'chirish"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-[#E5C358] group-hover:rotate-45 transition-transform duration-300" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-[#244B2B] group-hover:-rotate-12 transition-transform duration-300" />
                )}
              </button>

              {/* Mening buyurtmalarim (Profil ikonka) */}
              <Link
                href={`/${locale}/orders`}
                className="hidden sm:inline-flex p-2.5 rounded-full text-[#1C261E] hover:text-[#244B2B] hover:bg-[#F4EFE6] transition-colors"
                title={locale === 'ru' ? 'Мои заказы' : 'Mening buyurtmalarim'}
                aria-label="Buyurtmalarim"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Mobil burger menyu tugmasi */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-[#1C261E] hover:bg-[#F4EFE6] transition-colors ml-1"
                aria-label="Menyu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

            </div>

          </div>
        </div>

        {/* Mobil ochiladigan menyu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FBF9F4] border-t border-[#E9E5DD] px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
            {/* Buyurtma turi mobil tanlovi */}
            <div className="mb-4 pt-1">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setOrderTypeModalOpen(true);
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#D4AF37] text-[#1C261E] text-xs font-extrabold flex items-center justify-between shadow-sm"
              >
                <span className="flex items-center gap-2">
                  {orderType === 'DELIVERY' ? <Truck className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                  <span>{orderType === 'DELIVERY' ? 'Yetkazib berish' : 'Filialdan olib ketish'}</span>
                </span>
                <span className="text-[11px] font-medium opacity-80">O‘zgartirish →</span>
              </button>
            </div>

            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1C261E] hover:bg-[#F4EFE6]"
                >
                  <span className="flex items-center gap-2">
                    {link.isSpecial && <Sparkles className="w-4 h-4 text-[#D4AF37]" />}
                    {link.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#8C9B90]" />
                </Link>
              ))}

              <Link
                href={`/${locale}/orders`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1C261E] hover:bg-[#F4EFE6]"
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#244B2B]" />
                  <span>{locale === 'ru' ? 'Мои заказы' : 'Mening buyurtmalarim'}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-[#8C9B90]" />
              </Link>
            </nav>

            {/* Mobil menyuda Tungi rejim tugmasi */}
            <div className="mt-3 pt-3 border-t border-[#E9E5DD] space-y-2">
              <button
                type="button"
                onClick={toggleSoftSound}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E9E5DD] text-xs font-bold text-[#1C261E] hover:border-[#D4AF37] transition-all shadow-sm"
              >
                <span className="flex items-center gap-2">
                  {softSound ? <Volume2 className="w-4 h-4 text-[#244B2B]" /> : <VolumeX className="w-4 h-4 text-[#596B5E]" />}
                  <span>{locale === 'ru' ? 'Тихий звук' : 'Past ovoz'}</span>
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${softSound ? 'bg-[#2E7D32]/20 text-[#4ADE80]' : 'bg-[#F4EFE6] text-[#596B5E]'}`}>
                  {softSound ? 'ON' : 'OFF'}
                </span>
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E9E5DD] text-xs font-bold text-[#1C261E] hover:border-[#D4AF37] transition-all shadow-sm"
              >
                <span className="flex items-center gap-2">
                  {isDark ? (
                    <Sun className="w-4 h-4 text-[#E5C358]" />
                  ) : (
                    <Moon className="w-4 h-4 text-[#244B2B]" />
                  )}
                  <span>{isDark ? (locale === 'ru' ? 'Светлый режим' : 'Kunduzgi rejim') : (locale === 'ru' ? 'Тёмный режим' : 'Tungi rejim')}</span>
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                  isDark ? 'bg-[#2E7D32]/20 text-[#4ADE80]' : 'bg-[#F4EFE6] text-[#596B5E]'
                }`}>
                  {isDark ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-[#E9E5DD] flex items-center justify-between text-xs">
              <a href={`tel:${phone.replace(/\s+/g, '')}`} className="font-bold text-[#244B2B] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                <span>{phone}</span>
              </a>
              <span className="text-[#596B5E] text-[11px]">{openTime} – {closeTime}</span>
            </div>
          </div>
        )}

      </header>

      {/* 1. Qidiruv Modali (Search Modal) */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-[#E9E5DD]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E9E5DD]">
              <h3 className="text-base font-bold text-[#1C261E]">
                {locale === 'ru' ? 'Поиск десертов и тортов' : 'Shirinliklar va tortlarni qidirish'}
              </h3>
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1 rounded-lg text-[#596B5E] hover:bg-[#F4EFE6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="w-5 h-5 text-[#8C9B90] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={locale === 'ru' ? 'Например: Медовик, Эклер, Чизкейк...' : 'Masalan: Medovik, Ekler, Chizkeyk...'}
                  className="w-full pl-11 pr-10 py-3 rounded-2xl border border-[#E9E5DD] text-sm focus:outline-none focus:border-[#244B2B] bg-[#FBF9F4]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C9B90] hover:text-[#1C261E]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Ommabop qidiruv teglari */}
              <div className="mt-4 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C9B90] block mb-2">
                  {locale === 'ru' ? 'Популярные запросы:' : 'Ko‘p qidirilganlar:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { uz: 'Bento', ru: 'Бенто' },
                    { uz: 'Qizil baxmal', ru: 'Красный бархат' },
                    { uz: 'Snikers', ru: 'Сникерс' },
                    { uz: 'Kruassan', ru: 'Круассан' },
                    { uz: 'Pistali rulet', ru: 'Фисташковый рулет' },
                    { uz: 'Makaronlar', ru: 'Макаронс' },
                  ].map((tag, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        const val = locale === 'ru' ? tag.ru : tag.uz;
                        setSearchQuery(val);
                        router.push(`/${locale}/catalog?search=${encodeURIComponent(val)}`);
                        setSearchModalOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-full bg-[#F4EFE6] hover:bg-[#D4AF37]/20 text-[#1C261E] hover:text-[#244B2B] text-xs font-semibold border border-[#E9E5DD] transition-all"
                    >
                      {locale === 'ru' ? tag.ru : tag.uz}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-[#E9E5DD]">
                <button
                  type="button"
                  onClick={() => setSearchModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#596B5E] hover:bg-[#F4EFE6]"
                >
                  {tc('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#244B2B] hover:bg-[#1A3720] text-white font-bold text-xs shadow-md transition-all"
                >
                  {tc('search')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. "Buyurtma turi" Modali (Delivery vs Pickup Modal) */}
      {orderTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E9E5DD]">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-[#E9E5DD]">
              <h3 className="text-lg font-black text-[#1C261E]">
                {locale === 'ru' ? 'Выберите способ получения' : 'Buyurtma turini tanlang'}
              </h3>
              <button
                onClick={() => setOrderTypeModalOpen(false)}
                className="p-1 rounded-lg text-[#596B5E] hover:bg-[#F4EFE6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {/* Yetkazib berish tanlovi */}
              <button
                type="button"
                onClick={() => handleSelectOrderType('DELIVERY')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${
                  orderType === 'DELIVERY'
                    ? 'border-[#244B2B] bg-[#244B2B]/5 ring-2 ring-[#244B2B]'
                    : 'border-[#E9E5DD] hover:border-[#D4AF37] bg-[#FBF9F4]/40'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#244B2B] text-[#D4AF37] flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#1C261E]">
                    {locale === 'ru' ? 'Доставка курьером' : 'Kuryer orqali yetkazish'}
                  </div>
                  <div className="text-xs text-[#596B5E] mt-0.5">
                    {locale === 'ru' ? 'Прямо к вашей двери по гороdu Карши' : 'Qarshi shahri bo‘ylab eshigingizgacha'}
                  </div>
                </div>
              </button>

              {/* Olib ketish tanlovi */}
              <button
                type="button"
                onClick={() => handleSelectOrderType('PICKUP')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${
                  orderType === 'PICKUP'
                    ? 'border-[#244B2B] bg-[#244B2B]/5 ring-2 ring-[#244B2B]'
                    : 'border-[#E9E5DD] hover:border-[#D4AF37] bg-[#FBF9F4]/40'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37] text-[#1C261E] flex items-center justify-center flex-shrink-0">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#1C261E]">
                    {locale === 'ru' ? 'Самовывоз из филиала' : 'Filialdan olib ketish'}
                  </div>
                  <div className="text-xs text-[#596B5E] mt-0.5">
                    {locale === 'ru' ? 'Быстро и бесплатно без очереди' : 'Filialimizdan navbatsiz va bepul'}
                  </div>
                </div>
              </button>
            </div>

            <p className="text-[11px] text-[#596B5E] text-center mt-4">
              {locale === 'ru'
                ? 'Вы сможете указать точный адрес или филиал при оформлении заказа'
                : 'Aniq manzil yoki filialni buyurtma rasmiylashtirishda ko‘rsatasiz'}
            </p>

            <div className="text-center mt-3 pt-3 border-t border-[#E9E5DD]">
              <Link
                href={`/${locale}/delivery-payment`}
                onClick={() => setOrderTypeModalOpen(false)}
                className="text-xs font-semibold text-[#244B2B] hover:text-[#D4AF37] transition-colors inline-flex items-center gap-1"
              >
                <span>{locale === 'ru' ? 'Подробные условия доставки и оплаты →' : 'Batafsil yetkazish va to‘lov shartlari →'}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
