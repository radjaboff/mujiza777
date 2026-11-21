'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { 
  Heart, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Clock, 
  Share2, 
  Check, 
  Send, 
  Copy, 
  Flame, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Truck,
  Leaf,
  Award,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { ProductDetail as ProductDetailType, ProductCard as ProductCardType } from '../../lib/api/types';
import { formatCurrency, formatQuantity, formatPrepTime, formatShelfLife } from '../../lib/format';
import { calculateLineTotal } from '../../lib/pricing';
import { useCartStore } from '../../stores/cart';
import { playSoftAddChime } from '../../lib/audio';
import { useFavoritesStore } from '../../stores/favorites';
import { RecommendationsSection } from './RecommendationsSection';
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer';
import { ScrollReveal } from '../ui/ScrollReveal';

interface Props {
  product: ProductDetailType;
  relatedProducts?: ProductCardType[];
  locale: 'uz' | 'ru';
}

export const ProductDetailView: React.FC<Props> = ({ product, relatedProducts = [], locale }) => {
  const t = useTranslations('Product');
  const tc = useTranslations('Common');

  // Galereyadagi barcha takrorlanmas rasmlar
  const rawImages = [product.imageUrl, ...(product.imageUrls || [])].filter(Boolean) as string[];
  const allImages = Array.from(new Set(rawImages));

  const [selectedImage, setSelectedImage] = useState<string>(allImages[0] || '');

  // Mahsulot o'zgarganda birinchi rasmni tanlash
  useEffect(() => {
    const imgs = Array.from(new Set([product.imageUrl, ...(product.imageUrls || [])].filter(Boolean))) as string[];
    if (imgs.length > 0) {
      setSelectedImage(imgs[0]);
    }
  }, [product.slug, product.imageUrl, product.imageUrls]);

  const currentIndex = Math.max(0, allImages.indexOf(selectedImage));

  const handlePrevImage = () => {
    if (allImages.length <= 1) return;
    const prevIdx = (currentIndex - 1 + allImages.length) % allImages.length;
    setSelectedImage(allImages[prevIdx]);
  };

  const handleNextImage = () => {
    if (allImages.length <= 1) return;
    const nextIdx = (currentIndex + 1) % allImages.length;
    setSelectedImage(allImages[nextIdx]);
  };

  // Miqdor tanlagich
  const [quantity, setQuantity] = useState<number>(product.minQuantity || 1);
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Zustand
  const addItem = useCartStore((s) => s.addItem);
  const cartQty = useCartStore((s) => s.getItemQuantity(product.id));
  const isFav = useFavoritesStore((s) => s.isFavorite(product.slug));
  const toggleFav = useFavoritesStore((s) => s.toggleFavorite);

  // Chegirma
  const hasDiscount = product.oldPrice != null && product.oldPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.oldPrice!) * 100)
    : 0;

  // Chegirma taymeri
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!product.discountEndsAt) return;

    const updateTimer = () => {
      const diff = new Date(product.discountEndsAt!).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [product.discountEndsAt]);

  const step = product.quantityStep || 1;

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(100, Number((prev + step).toFixed(3))));
  };

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(product.minQuantity || 1, Number((prev - step).toFixed(3))));
  };

  // Savatga qo'shish
  const handleAddToCart = () => {
    if (!product.isAvailable) return;
    setJustAdded(true);
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice,
        imageUrl: product.imageUrl,
        unitType: product.unitType,
        minQuantity: product.minQuantity,
        quantityStep: product.quantityStep,
        prepTimeMinutes: product.prepTimeMinutes,
        isAvailable: product.isAvailable,
      },
      quantity
    );
    playSoftAddChime();
    setTimeout(() => setJustAdded(false), 1200);
  };

  // Ulashish (Share)
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `${product.name} — Mujiza 777 qandolat uyi`,
          url,
        });
        return;
      } catch {
        // bekor qilindi
      }
    }
    setShareOpen(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Taxminiy qator summasi
  const currentTotal = calculateLineTotal(product.price, quantity);

  // Rasm turining tavsifi
  const getImageLabel = (index: number) => {
    if (locale === 'ru') {
      if (index === 0) return 'Основной вид';
      if (index === 1) return 'В разрезе';
      return 'Детали и упаковка';
    }
    if (index === 0) return 'Tashqi ko‘rinishi';
    if (index === 1) return 'Ichki qatlam (Razrez)';
    return 'Qadoq va bezak';
  };

  return (
    <div className="space-y-12 pb-16 sm:pb-8">
      
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[#596B5E] dark:text-[#A6B7AA] overflow-x-auto whitespace-nowrap">
        <Link href={`/${locale}`} className="hover:text-[#244B2B] dark:hover:text-[#E5C358] transition-colors">
          {tc('all')}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#A8B5AA] dark:text-[#556959]" />
        <Link href={`/${locale}/catalog`} className="hover:text-[#244B2B] dark:hover:text-[#E5C358] transition-colors">
          {locale === 'ru' ? 'Каталог' : 'Katalog'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#A8B5AA] dark:text-[#556959]" />
        <Link
          href={`/${locale}/catalog?categorySlug=${product.categorySlug}`}
          className="hover:text-[#244B2B] dark:hover:text-[#E5C358] transition-colors"
        >
          {product.categoryName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#A8B5AA] dark:text-[#556959]" />
        <span className="text-[#1C261E] dark:text-[#F5F2EA] font-semibold truncate max-w-[180px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* 2. Asosiy Mahsulot Bloklari: Galereya + Ma'lumotlar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        
        {/* Chap qism: Katta Galereya */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Asosiy Rasm */}
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#F4EFE6] dark:bg-[#141F17] border border-[#E9E5DD] dark:border-[#28392B] shadow-md group select-none">
            {selectedImage ? (
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#596B5E]/40 dark:text-[#A6B7AA]/40 p-8 text-center">
                <span className="text-7xl">🍰</span>
                <span className="font-serif font-bold text-lg mt-3 text-[#244B2B]/60 dark:text-[#E5C358]/60">Mujiza 777</span>
              </div>
            )}

            {/* Belgilar (Badges) */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {hasDiscount && (
                <span className="px-3.5 py-1.5 rounded-xl bg-[#B83A3A] text-white font-extrabold text-xs tracking-wider shadow-md flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  -{discountPercent}%
                </span>
              )}
              {product.isNew && (
                <span className="px-3.5 py-1.5 rounded-xl bg-[#244B2B] dark:bg-[#2F4735] text-white font-bold text-xs tracking-wider shadow-md border border-white/10">
                  {locale === 'ru' ? 'Новинка' : 'Yangi'}
                </span>
              )}
              {product.isPopular && !product.isNew && (
                <span className="px-3.5 py-1.5 rounded-xl bg-[#AA820A] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] font-bold text-xs tracking-wider shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {locale === 'ru' ? 'Хит' : 'Mashhur'}
                </span>
              )}
            </div>

            {/* Sevimlilar tugmasi */}
            <button
              onClick={() => toggleFav(product.slug)}
              aria-label="Sevimlilarga qo'shish"
              className="absolute top-4 right-4 z-10 w-11 h-11 rounded-2xl bg-white/90 dark:bg-[#1A281E]/90 backdrop-blur-md text-[#1C261E] dark:text-[#F5F2EA] hover:text-[#B83A3A] border border-[#E9E5DD]/60 dark:border-[#28392B] flex items-center justify-center shadow-lg transition-all active:scale-90"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isFav ? 'fill-[#B83A3A] text-[#B83A3A]' : ''
                }`}
              />
            </button>

            {/* Oldingi / Keyingi o'tkazgich strelkalari (agar >1 rasm bo'lsa) */}
            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label="Oldingi rasm"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/85 dark:bg-[#1A281E]/85 backdrop-blur-md text-[#1C261E] dark:text-[#F5F2EA] hover:bg-white dark:hover:bg-[#1A281E] border border-black/5 dark:border-white/10 flex items-center justify-center shadow-lg transition-all active:scale-90 hover:scale-105"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label="Keyingi rasm"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/85 dark:bg-[#1A281E]/85 backdrop-blur-md text-[#1C261E] dark:text-[#F5F2EA] hover:bg-white dark:hover:bg-[#1A281E] border border-black/5 dark:border-white/10 flex items-center justify-center shadow-lg transition-all active:scale-90 hover:scale-105"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Slayder Hisoblagichi (Counter Badge) */}
                <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white font-mono text-xs font-semibold flex items-center gap-1.5 shadow-md border border-white/10">
                  <span className="text-[#D4AF37]">📸</span>
                  <span>
                    {currentIndex + 1} / {allImages.length}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Miniatyuralar (Thumbnails galereyasi) */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1 scrollbar-none">
              {allImages.map((img, idx) => {
                const isActive = selectedImage === img;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`group relative flex-shrink-0 rounded-2xl overflow-hidden transition-all text-left ${
                      isActive
                        ? 'ring-2 ring-[#D4AF37] ring-offset-2 ring-offset-[#FDFBF7] dark:ring-offset-[#0F1712] shadow-md scale-102'
                        : 'opacity-70 hover:opacity-100 hover:scale-102 border border-[#E9E5DD] dark:border-[#28392B]'
                    }`}
                  >
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-[#F4EFE6] dark:bg-[#141F17]">
                      <Image
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                    <span className="sr-only">{getImageLabel(idx)}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Safia darajasidagi Ishonch va Afzallik Kafolatlari (Trust Badges) */}
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <StaggerItem>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#28392B] shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 text-sm">
                <Leaf className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] truncate">
                  {locale === 'ru' ? '100% Халяль' : '100% Halol & Sof'}
                </h4>
                <p className="text-[11px] text-[#596B5E] dark:text-[#A6B7AA] truncate">
                  {locale === 'ru' ? 'Сливочное масло 82.5%' : "82.5% sof sariyog'"}
                </p>
              </div>
            </div>
            </StaggerItem>

            <StaggerItem>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#28392B] shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center flex-shrink-0 text-sm">
                <Award className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] truncate">
                  {locale === 'ru' ? 'Свежая выпечка' : 'Har tong yangi'}
                </h4>
                <p className="text-[11px] text-[#596B5E] dark:text-[#A6B7AA] truncate">
                  {locale === 'ru' ? 'Каждый день в Карши' : 'Doim barra pishiriladi'}
                </p>
              </div>
            </div>
            </StaggerItem>

            <StaggerItem>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#28392B] shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center flex-shrink-0 text-sm">
                <Truck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] truncate">
                  {locale === 'ru' ? 'Быстрая доставка' : 'Tezkor yetkazish'}
                </h4>
                <p className="text-[11px] text-[#596B5E] dark:text-[#A6B7AA] truncate">
                  {locale === 'ru' ? '35 мин по Карши' : 'Qarshida 35 daqiqada'}
                </p>
              </div>
            </div>
            </StaggerItem>
          </StaggerContainer>

        </div>

        {/* O'ng qism: Narx, Tavsif, Xarid bloki */}
        <div className="lg:col-span-6 space-y-6">
          
          <div>
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block mb-1.5">
              {product.categoryName}
            </span>
            <h1 className="font-serif font-black text-2xl sm:text-4xl text-[#1C261E] dark:text-[#F5F2EA] leading-tight">
              {product.name}
            </h1>
            {product.weightLabel && (
              <span className="inline-block mt-2.5 px-3 py-1 rounded-full bg-[#F4EFE6] dark:bg-[#141F17] border border-[#E9E5DD] dark:border-[#28392B] text-xs font-semibold text-[#596B5E] dark:text-[#A6B7AA]">
                ⚖️ {product.weightLabel}
              </span>
            )}
          </div>

          {/* Narx va Chegirma Taymeri */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#28392B] shadow-sm space-y-3.5">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-serif font-black text-3xl sm:text-4xl text-[#244B2B] dark:text-[#E5C358]">
                {formatCurrency(product.price, locale)}
              </span>
              <span className="text-sm font-semibold text-[#596B5E] dark:text-[#A6B7AA]">
                {product.unitType === 'KG' ? (locale === 'ru' ? '/ 1 кг' : '/ 1 kg') : (locale === 'ru' ? '/ 1 шт' : '/ 1 dona')}
              </span>
              {hasDiscount && (
                <span className="text-base sm:text-lg text-[#596B5E] dark:text-[#889B8C] line-through font-medium ml-1">
                  {formatCurrency(product.oldPrice, locale)}
                </span>
              )}
            </div>

            {/* Taymer */}
            {timeLeft && (
              <div className="pt-3 border-t border-[#F4EFE6] dark:border-[#28392B] flex items-center justify-between flex-wrap gap-2 text-xs font-semibold text-[#B83A3A]">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 animate-bounce" />
                  <span>{t('timerEndsIn')}</span>
                </div>
                <div className="font-mono bg-[#B83A3A]/10 dark:bg-[#B83A3A]/20 px-3 py-1 rounded-xl text-sm font-bold text-[#B83A3A] dark:text-red-400">
                  {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                </div>
              </div>
            )}
          </div>

          {/* Tayyorlanish vaqti / Mavjudlik holati */}
          {product.prepTimeMinutes === 0 ? (
            <div className="flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <span>
                {locale === 'ru'
                  ? '✨ В наличии в кондитерских — можно забрать прямо сейчас!'
                  : "✨ Do‘konlarimizda hozir tayyor mavjud — darhol yetkazib beramiz!"}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-xs text-[#1C261E] dark:text-[#F5F2EA] p-3.5 rounded-2xl bg-[#F4EFE6]/70 dark:bg-[#141F17] border border-[#E9E5DD] dark:border-[#28392B]">
              <Clock className="w-4 h-4 text-[#244B2B] dark:text-[#E5C358] flex-shrink-0" />
              <span>{t('prepTimeNotice', { time: formatPrepTime(product.prepTimeMinutes, locale) })}</span>
            </div>
          )}

          {/* Miqdor tanlash va Savatga qo'shish */}
          {product.isAvailable ? (
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-[#596B5E] dark:text-[#A6B7AA] uppercase tracking-wider">
                  {locale === 'ru' ? 'Количество:' : 'Miqdor:'}
                </span>
                
                {/* Stepper */}
                <div className="flex items-center bg-white dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#28392B] rounded-2xl p-1 shadow-sm">
                  <button
                    onClick={handleDecrement}
                    aria-label="Kamaytirish"
                    className="w-10 h-10 flex items-center justify-center hover:bg-[#F4EFE6] dark:hover:bg-[#203024] rounded-xl text-[#1C261E] dark:text-[#F5F2EA] transition-colors active:scale-95"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-bold min-w-[70px] text-center font-mono text-[#1C261E] dark:text-[#F5F2EA]">
                    {formatQuantity(quantity, product.unitType, locale)}
                  </span>
                  <button
                    onClick={handleIncrement}
                    aria-label="Ko'paytirish"
                    className="w-10 h-10 flex items-center justify-center hover:bg-[#F4EFE6] dark:hover:bg-[#203024] rounded-xl text-[#1C261E] dark:text-[#F5F2EA] transition-colors active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-right ml-auto">
                  <span className="text-[10px] text-[#596B5E] dark:text-[#A6B7AA] block uppercase">
                    {locale === 'ru' ? 'Итого:' : 'Jami:'}
                  </span>
                  <span className="font-serif font-black text-lg text-[#244B2B] dark:text-[#E5C358]">
                    {formatCurrency(currentTotal, locale)}
                  </span>
                </div>
              </div>

              {/* Asosiy Tugmalar */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-4 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg transition-all transform active:scale-98 cursor-pointer ${
                    justAdded
                      ? 'bg-emerald-600 text-white scale-102 shadow-emerald-600/30'
                      : 'bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] hover:bg-[#1A3720] dark:hover:bg-[#E5C358] hover:shadow-xl'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-5 h-5 text-white" />
                      <span>{locale === 'ru' ? 'Добавлено в корзину!' : 'Savatga qo‘shildi!'}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5 text-[#D4AF37] dark:text-[#0F1712]" />
                      <span>{t('addToCart')} ({formatCurrency(currentTotal, locale)})</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleShare}
                  aria-label="Ulashish"
                  className="w-14 h-14 rounded-2xl bg-white dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#28392B] text-[#1C261E] dark:text-[#F5F2EA] hover:text-[#244B2B] dark:hover:text-[#E5C358] hover:border-[#244B2B] dark:hover:border-[#E5C358] flex items-center justify-center shadow-sm transition-colors flex-shrink-0"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Individual / Maxsus Buyurtma Havolasi */}
              <a
                href={`https://t.me/mujiza777_admin?text=${encodeURIComponent(
                  `Salom! Men "${product.name}" shirinligiga individual yozuv/bezak bilan buyurtma bermoqchiman.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-2xl border border-[#244B2B]/20 dark:border-[#D4AF37]/30 hover:border-[#244B2B] dark:hover:border-[#D4AF37] text-[#244B2B] dark:text-[#E5C358] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-[#244B2B]/5 dark:hover:bg-[#D4AF37]/5 transition-all text-center"
              >
                <Send className="w-4 h-4 text-[#2AABEE]" />
                <span>
                  {locale === 'ru'
                    ? 'Индивидуальная надпись или декор (Telegram)'
                    : 'Maxsus tabrik yozuvi bilan buyurtma berish (Telegram)'}
                </span>
              </a>

              {cartQty > 0 && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>
                    {locale === 'ru'
                      ? `В вашей корзине уже есть ${formatQuantity(cartQty, product.unitType, locale)}`
                      : `Bu shirinlik allaqachon savatingizda bor (${formatQuantity(cartQty, product.unitType, locale)})`}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 text-center">
              <span className="text-sm font-bold text-[#596B5E] dark:text-[#A6B7AA]">
                {t('unavailable')}
              </span>
            </div>
          )}

          {/* Tarkibi, Tavsifi va Ozuqaviy Qiymati */}
          <div className="pt-6 border-t border-[#E9E5DD] dark:border-[#28392B] space-y-6">
            
            {product.description && (
              <div className="space-y-1.5">
                <h3 className="font-bold text-sm text-[#1C261E] dark:text-[#F5F2EA]">
                  {locale === 'ru' ? 'Описание' : 'Tavsif'}
                </h3>
                <p className="text-xs sm:text-sm text-[#596B5E] dark:text-[#A6B7AA] leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {product.ingredients && (
              <div className="space-y-1.5">
                <h3 className="font-bold text-sm text-[#1C261E] dark:text-[#F5F2EA]">
                  {t('ingredients')}
                </h3>
                <p className="text-xs text-[#596B5E] dark:text-[#A6B7AA] leading-relaxed">
                  {product.ingredients}
                </p>
              </div>
            )}

            {/* Ozuqaviy Qiymati va Xususiyatlar (KBJU) */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#596B5E] dark:text-[#A6B7AA]">
                {locale === 'ru' ? 'Характеристики & КБЖУ' : 'Xususiyatlar va saqlanishi'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-white dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#28392B] text-center">
                  <span className="text-[10px] uppercase font-bold text-[#596B5E] dark:text-[#A6B7AA] block">
                    {t('calories')}
                  </span>
                  <span className="font-serif font-black text-sm sm:text-base text-[#1C261E] dark:text-[#F5F2EA]">
                    {product.calories || 320}{' '}
                    <span className="text-[10px] font-sans font-normal text-[#596B5E] dark:text-[#A6B7AA]">
                      kkal
                    </span>
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#28392B] text-center">
                  <span className="text-[10px] uppercase font-bold text-[#596B5E] dark:text-[#A6B7AA] block">
                    {t('shelfLife')}
                  </span>
                  <span className="font-serif font-black text-sm sm:text-base text-[#1C261E] dark:text-[#F5F2EA]">
                    {product.shelfLifeHours ? formatShelfLife(product.shelfLifeHours, locale) : '72 soat'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#28392B] text-center">
                  <span className="text-[10px] uppercase font-bold text-[#596B5E] dark:text-[#A6B7AA] block">
                    {locale === 'ru' ? 'Вес / Порция' : 'Hajmi / Og‘irlik'}
                  </span>
                  <span className="font-serif font-black text-sm sm:text-base text-[#1C261E] dark:text-[#F5F2EA]">
                    {product.weightLabel || (product.unitType === 'KG' ? '1.0 kg' : '1 dona')}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#28392B] text-center">
                  <span className="text-[10px] uppercase font-bold text-[#596B5E] dark:text-[#A6B7AA] block">
                    {locale === 'ru' ? 'Хранение' : 'Saqlash'}
                  </span>
                  <span className="font-serif font-black text-sm sm:text-base text-[#1C261E] dark:text-[#F5F2EA]">
                    +2°C...+6°C
                  </span>
                </div>
              </div>
            </div>

            {/* Allergenlar */}
            {product.allergens && product.allergens.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#596B5E] dark:text-[#A6B7AA] uppercase tracking-wider block">
                  {t('allergens')}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {product.allergens.map((alg) => (
                    <span
                      key={alg}
                      className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 text-xs font-semibold"
                    >
                      ⚠️ {alg}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 3. Ulashish Modali */}
      {shareOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A281E] rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl border border-[#E9E5DD] dark:border-[#28392B] animate-in zoom-in-95 duration-200">
            <h3 className="font-serif font-bold text-lg text-[#1C261E] dark:text-[#F5F2EA]">
              {t('share')}
            </h3>

            <div className="space-y-2">
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#2AABEE] text-white font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
              >
                <Send className="w-4 h-4" />
                <span>Telegram orqali yuborish</span>
              </a>

              <button
                onClick={handleCopyLink}
                className="w-full py-3 px-4 rounded-xl bg-[#F4EFE6] dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] border border-transparent dark:border-[#28392B] font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#E9E5DD] dark:hover:bg-[#203024] transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? t('copied') : 'Havolani nusxalash'}</span>
              </button>
            </div>

            <button
              onClick={() => setShareOpen(false)}
              className="w-full py-2.5 rounded-xl border border-[#E9E5DD] dark:border-[#28392B] text-xs font-bold text-[#596B5E] dark:text-[#A6B7AA] hover:bg-[#F4EFE6] dark:hover:bg-[#141F17]"
            >
              {tc('close')}
            </button>
          </div>
        </div>
      )}

      {/* 4. "Birga olinadi" Tavsiyalar bloki (TZ 17.9) */}
      <RecommendationsSection
        currentSlug={product.slug}
        locale={locale}
        limit={4}
      />

      {/* 5. Mobil uchun Doimiy Harakat Paneli (Sticky Bottom Bar) */}
      {product.isAvailable && (
        <div className="lg:hidden fixed bottom-[57px] left-0 right-0 z-40 bg-white/95 dark:bg-[#141F17]/95 backdrop-blur-lg border-t border-[#E9E5DD] dark:border-[#28392B] px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2">
          <div>
            <span className="text-[10px] text-[#596B5E] dark:text-[#A6B7AA] uppercase font-bold block">
              {tc('total')}
            </span>
            <div className="font-serif font-black text-sm sm:text-base text-[#244B2B] dark:text-[#E5C358] leading-tight">
              {formatCurrency(calculateLineTotal(product.price, quantity), locale)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center bg-[#F4EFE6] dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#28392B] rounded-xl p-0.5">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-7 h-7 rounded-lg bg-white dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] flex items-center justify-center active:scale-80"
                aria-label="Kamaytirish"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-bold text-xs min-w-[28px] text-center text-[#1C261E] dark:text-[#F5F2EA]">
                {formatQuantity(quantity, product.unitType, locale)}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                className="w-7 h-7 rounded-lg bg-white dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] flex items-center justify-center active:scale-80"
                aria-label="Ko'paytirish"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="py-2.5 px-4 rounded-xl bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] hover:bg-[#1A3720] text-xs font-bold shadow-md flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
            >
              <ShoppingBag className="w-4 h-4 text-[#D4AF37] dark:text-[#0F1712]" />
              <span>{t('addToCart')}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetailView;

