'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag, 
  Sparkles, 
  AlertCircle,
  Truck,
  CheckCircle2,
  Cake,
  Leaf,
  ShieldCheck,
  CreditCard,
  Gift,
  ChevronRight
} from 'lucide-react';
import { useCartStore } from '../../stores/cart';
import { formatCurrency, formatQuantity } from '../../lib/format';
import { calculateOrderSummary } from '../../lib/pricing';
import { PublicSettings } from '../../lib/api/types';
import { RecommendationsSection } from '../product/RecommendationsSection';

interface CartViewProps {
  locale: 'uz' | 'ru';
  settings?: PublicSettings;
}

export function CartView({ locale, settings }: CartViewProps) {
  const t = useTranslations('Cart');
  const tc = useTranslations('Common');
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const deliveryFee = settings?.deliveryFee ?? 15000;
  const freeDeliveryFrom = settings?.freeDeliveryFrom ?? 150000;
  const minOrderAmount = settings?.minOrderAmount ?? 40000;

  const summary = calculateOrderSummary(
    items.map((i) => ({ productId: i.productId, price: i.price, quantity: i.quantity })),
    { deliveryFee, freeDeliveryFrom, minOrderAmount },
    'DELIVERY'
  );

  // Bepul yetkazish foizi (0 dan 100 gacha)
  const freeDeliveryPercent = freeDeliveryFrom > 0
    ? Math.min(100, Math.round((summary.itemsTotal / freeDeliveryFrom) * 100))
    : 100;

  // Bo'sh savat holati
  if (items.length === 0) {
    return (
      <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-12 sm:py-20 pb-28">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="relative w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br from-[#244B2B]/10 to-[#D4AF37]/20 dark:from-[#244B2B]/20 dark:to-[#D4AF37]/30 flex items-center justify-center border border-[#D4AF37]/30 shadow-inner">
            <span className="text-5xl select-none animate-bounce">🍰</span>
            <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-2xl bg-[#244B2B] text-[#D4AF37] flex items-center justify-center shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#1C261E] dark:text-[#F5F2EA]">
              {t('empty')}
            </h1>
            <p className="text-[#596B5E] dark:text-[#A6B7AA] text-xs sm:text-sm leading-relaxed">
              {locale === 'ru'
                ? 'В вашей корзине пока пусто. Откройте наш каталог и порадуйте себя свежими тортами и десертами!'
                : "Savatingiz hozircha bo‘sh. Katalogimizdan sevimli tort va shirinliklaringizni tanlang va o‘zingizni xursand qiling!"}
            </p>
          </div>

          <Link
            href={`/${locale}/catalog`}
            className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] font-bold text-sm hover:bg-[#1A3720] dark:hover:bg-[#E5C358] shadow-lg hover:shadow-xl transition-all active:scale-98"
          >
            <span>{locale === 'ru' ? 'Перейти в каталог десертов' : 'Shirinliklar katalogiga o‘tish'}</span>
            <ArrowRight className="w-4 h-4 text-[#D4AF37] dark:text-[#0F1712]" />
          </Link>
        </div>

        {/* Bo'sh savatda ham mashhur shirinliklar tavsiyasi */}
        <div className="mt-16">
          <RecommendationsSection
            locale={locale}
            title={locale === 'ru' ? 'Популярные десерты от шеф-кондитера' : 'Qandolat ustalarimizdan eng mashhur shirinliklar'}
            limit={4}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-4 sm:pt-8 pb-36 sm:pb-16">
      
      {/* Sarlavha va Savatni tozalash */}
      <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-[#E9E5DD] dark:border-[#28392B]">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#1C261E] dark:text-[#F5F2EA] tracking-tight">
            {t('title')}
          </h1>
          <p className="text-xs sm:text-sm text-[#596B5E] dark:text-[#A6B7AA] mt-0.5">
            {items.length} {locale === 'ru' ? 'поз. в корзине' : 'tur shirinlik tanlandi'}
          </p>
        </div>

        <button
          onClick={() => setShowClearConfirm(true)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B83A3A] hover:text-red-700 py-2 px-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900/40"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">
            {locale === 'ru' ? 'Очистить корзину' : 'Savatni tozalash'}
          </span>
          <span className="sm:hidden">
            {locale === 'ru' ? 'Очистить' : 'Tozalash'}
          </span>
        </button>
      </div>

      {/* Savatni tozalash tasdig'i modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1A281E] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#E9E5DD] dark:border-[#28392B] text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-[#B83A3A] mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1C261E] dark:text-[#F5F2EA]">
                {locale === 'ru' ? 'Очистить корзину?' : 'Savatni tozalamoqchimisiz?'}
              </h3>
              <p className="text-xs text-[#596B5E] dark:text-[#A6B7AA] mt-1.5 leading-relaxed">
                {locale === 'ru' 
                  ? 'Все выбранные вами сладости будут удалены из корзины.' 
                  : "Savatdagi barcha tanlangan shirinliklar o‘chiriladi."}
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-[#E9E5DD] dark:border-[#28392B] text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] hover:bg-[#F4EFE6] dark:hover:bg-[#141F17]"
              >
                {tc('cancel')}
              </button>
              <button
                onClick={() => {
                  clearCart();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#B83A3A] text-xs font-bold text-white hover:bg-red-700 shadow-md active:scale-95 transition-all"
              >
                {locale === 'ru' ? 'Да, очистить' : 'Ha, tozalash'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 mt-6">
        
        {/* Chap qism: Bepul yetkazish + Mahsulotlar kartochkalari */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* 1. Bepul yetkazib berish progress paneli */}
          {freeDeliveryFrom > 0 && (
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-xs transition-all duration-300 ${
              summary.freeDeliveryRemaining <= 0
                ? 'bg-gradient-to-r from-[#244B2B]/15 via-[#D4AF37]/25 to-[#244B2B]/15 border-[#D4AF37] ring-1 ring-[#D4AF37]/50 animate-gold-glow'
                : 'bg-gradient-to-r from-[#244B2B]/8 via-[#D4AF37]/15 to-[#244B2B]/8 dark:from-[#152418] dark:to-[#1e2f22] border-[#D4AF37]/35'
            }`}>
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                    summary.freeDeliveryRemaining <= 0
                      ? 'bg-[#D4AF37] text-[#1C261E]'
                      : 'bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712]'
                  }`}>
                    {summary.freeDeliveryRemaining <= 0 ? (
                      <Sparkles className="w-4 h-4 text-[#1C261E]" />
                    ) : (
                      <Truck className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#1C261E] dark:text-[#F5F2EA] truncate">
                    {summary.freeDeliveryRemaining > 0
                      ? t('freeDeliveryProgress', { amount: formatCurrency(summary.freeDeliveryRemaining, locale) })
                      : (locale === 'ru' ? '🎉 Поздравляем! Доставка для вас БЕСПЛАТНА!' : '🎉 Tabriklaymiz! Yetkazib berish siz uchun MUTLAQO BEPUL!')}
                  </span>
                </div>
                <span className="text-xs font-black text-[#244B2B] dark:text-[#E5C358] flex-shrink-0">
                  {freeDeliveryPercent}%
                </span>
              </div>

              {/* Progress chizig'i */}
              <div className="w-full h-2.5 bg-[#E9E5DD]/80 dark:bg-[#141F17] rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#244B2B] via-[#AA820A] to-[#D4AF37] transition-all duration-500 rounded-full"
                  style={{ width: `${freeDeliveryPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* 2. Mahsulotlar ro'yxati (Mobilda alohida go'zal kartochkalar) */}
          <div className="space-y-3">
            {items.map((item) => {
              const lineTotal = item.price * item.quantity;
              const isKg = item.unitType === 'KG';

              return (
                <div
                  key={item.productId}
                  className="bg-white dark:bg-[#1A281E] rounded-2xl p-3.5 sm:p-4 border border-[#E9E5DD] dark:border-[#28392B] shadow-xs hover:border-[#D4AF37]/50 transition-all flex flex-col gap-3 group"
                >
                  {/* Yuqori qism: Rasm, Nomi, Birlik narxi va O'chirish tugmasi */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Mahsulot rasmi */}
                    <Link
                      href={`/${locale}/product/${item.slug}`}
                      className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#F4EFE6] dark:bg-[#141F17] flex-shrink-0 border border-[#E9E5DD]/80 dark:border-[#28392B]"
                    >
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="96px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#596B5E]/40 dark:text-[#A6B7AA]/40">
                          <Cake className="w-8 h-8" />
                        </div>
                      )}
                    </Link>

                    {/* Nomi va Narxi */}
                    <div className="flex-1 min-w-0 pr-1">
                      <Link
                        href={`/${locale}/product/${item.slug}`}
                        className="font-bold text-sm sm:text-base text-[#1C261E] dark:text-[#F5F2EA] hover:text-[#244B2B] dark:hover:text-[#E5C358] transition-colors line-clamp-2 leading-snug"
                      >
                        {item.name}
                      </Link>

                      <div className="flex items-center gap-2 mt-1 text-xs text-[#596B5E] dark:text-[#A6B7AA]">
                        <span className="font-semibold text-[#1C261E] dark:text-[#F5F2EA]">
                          {formatCurrency(item.price, locale)}
                        </span>
                        <span className="text-[#8C9B90] dark:text-[#889B8C]">
                          / {isKg ? 'kg' : (locale === 'ru' ? 'шт' : 'dona')}
                        </span>
                        {item.oldPrice != null && item.oldPrice > item.price && (
                          <span className="line-through text-[11px] text-[#8C9B90] dark:text-[#889B8C]">
                            {formatCurrency(item.oldPrice, locale)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* O'chirish tugmasi */}
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-[#596B5E] dark:text-[#A6B7AA] hover:text-[#B83A3A] dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex-shrink-0"
                      aria-label="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Pastki qism: Stepper boshqaruvi va Jami summa */}
                  <div className="pt-2 border-t border-[#F4EFE6] dark:border-[#28392B] flex items-center justify-between gap-3">
                    {/* Stepper */}
                    <div className="inline-flex items-center bg-[#F4EFE6] dark:bg-[#141F17] border border-[#E9E5DD] dark:border-[#28392B] rounded-xl p-1 shadow-inner">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-[#1A281E] text-[#1C261E] dark:text-[#F5F2EA] border border-transparent dark:border-[#28392B] flex items-center justify-center hover:bg-[#E9E5DD] dark:hover:bg-[#25392B] active:scale-90 transition-all shadow-xs"
                        aria-label="Kamaytirish"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <div className="min-w-[54px] sm:min-w-[64px] text-center font-bold text-xs sm:text-sm text-[#1C261E] dark:text-[#F5F2EA] px-1 select-none font-mono">
                        {formatQuantity(item.quantity, item.unitType, locale)}
                      </div>

                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-[#1A281E] text-[#1C261E] dark:text-[#F5F2EA] border border-transparent dark:border-[#28392B] flex items-center justify-center hover:bg-[#E9E5DD] dark:hover:bg-[#25392B] active:scale-90 transition-all shadow-xs"
                        aria-label="Ko'paytirish"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Ushbu qator jami summasi */}
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-[#596B5E] dark:text-[#A6B7AA] block">
                        {locale === 'ru' ? 'Сумма:' : 'Jami:'}
                      </span>
                      <span className="font-serif font-black text-base sm:text-lg text-[#244B2B] dark:text-[#E5C358]">
                        {formatCurrency(lineTotal, locale)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Xaridni davom ettirish tugmasi */}
          <div className="pt-2">
            <Link
              href={`/${locale}/catalog`}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#244B2B] dark:text-[#E5C358] hover:text-[#1A3720] dark:hover:text-[#FDF0CD] hover:underline"
            >
              <span>← {t('continueShopping')}</span>
            </Link>
          </div>

          {/* Savatdagi Ishonch Mikro-Badgelari (Trust micro-badges) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3">
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-white dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#28392B] shadow-2xs">
              <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-xs font-semibold text-[#1C261E] dark:text-[#F5F2EA] truncate">
                {locale === 'ru' ? '100% Халяль & Натурально' : '100% Halol & Sof masalliqlar'}
              </span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-white dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#28392B] shadow-2xs">
              <Truck className="w-4 h-4 text-[#AA820A] dark:text-[#E5C358] flex-shrink-0" />
              <span className="text-xs font-semibold text-[#1C261E] dark:text-[#F5F2EA] truncate">
                {locale === 'ru' ? '35 минут по Карши' : '35 daqiqada yangi yetkazish'}
              </span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-white dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#28392B] shadow-2xs">
              <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-xs font-semibold text-[#1C261E] dark:text-[#F5F2EA] truncate">
                {locale === 'ru' ? 'Оплата при получении' : 'Qabul qilib olgach to‘lash'}
              </span>
            </div>
          </div>
        </div>

        {/* O'ng qism: Xulosa va Rasmiylashtirish bloki */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 bg-[#FBF9F4] dark:bg-[#1A281E] rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] p-5 sm:p-6 shadow-sm space-y-5">
            <h2 className="font-serif font-black text-lg sm:text-xl text-[#1C261E] dark:text-[#F5F2EA]">
              {tc('orderSummary')}
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-[#596B5E] dark:text-[#A6B7AA]">
                <span>{t('itemsTotal')} ({items.length} {locale === 'ru' ? 'поз.' : 'tur'})</span>
                <span className="font-semibold text-[#1C261E] dark:text-[#F5F2EA]">
                  {formatCurrency(summary.itemsTotal, locale)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#596B5E] dark:text-[#A6B7AA]">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#244B2B] dark:text-[#E5C358]" />
                  {t('deliveryFee')}
                </span>
                <span className="font-semibold text-[#1C261E] dark:text-[#F5F2EA]">
                  {summary.deliveryFee === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{t('free')}</span>
                  ) : (
                    formatCurrency(summary.deliveryFee, locale)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-[#E9E5DD] dark:border-[#28392B] flex items-baseline justify-between">
                <span className="text-base font-bold text-[#1C261E] dark:text-[#F5F2EA]">{tc('total')}</span>
                <span className="font-serif font-black text-2xl sm:text-3xl text-[#244B2B] dark:text-[#E5C358]">
                  {formatCurrency(summary.finalTotal, locale)}
                </span>
              </div>
            </div>

            {/* Bayramona bepul sovg'a belgisi */}
            <div className="p-3 rounded-2xl bg-[#D4AF37]/10 dark:bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center gap-2.5 text-xs text-[#1C261E] dark:text-[#F5F2EA]">
              <Gift className="w-4 h-4 text-[#AA820A] dark:text-[#E5C358] flex-shrink-0" />
              <span className="text-[11px] leading-snug">
                {locale === 'ru'
                  ? 'К каждому заказу мы бесплатно дарим праздничную свечу и открытку 🎁'
                  : 'Har bir buyurtmaga bepul bayramona shamcha va tabriknoma qo‘shib beriladi 🎁'}
              </span>
            </div>

            {/* Minimal buyurtma ogohlantirishi */}
            {!summary.isMinOrderMet && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-300 text-xs flex gap-3 items-start">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">
                    {t('minOrderNotice', { amount: formatCurrency(minOrderAmount, locale) })}
                  </div>
                  <div className="text-[11px] text-amber-800 dark:text-amber-400">
                    {t('minOrderRemaining', { amount: formatCurrency(summary.minOrderRemaining, locale) })}
                  </div>
                </div>
              </div>
            )}

            {/* Rasmiylashtirish tugmasi */}
            <Link
              href={summary.isMinOrderMet ? `/${locale}/checkout` : `/${locale}/catalog`}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm sm:text-base shadow-md transition-all active:scale-98 ${
                summary.isMinOrderMet
                  ? 'bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] hover:bg-[#1A3720] dark:hover:bg-[#E5C358] hover:shadow-xl'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
            >
              {summary.isMinOrderMet ? (
                <>
                  <span>{t('checkout')}</span>
                  <ArrowRight className="w-4 h-4 text-[#D4AF37] dark:text-[#0F1712]" />
                </>
              ) : (
                <>
                  <span>
                    {locale === 'ru'
                      ? `Добавить товаров еще на ${formatCurrency(summary.minOrderRemaining, locale)}`
                      : `Yana ${formatCurrency(summary.minOrderRemaining, locale)} qo‘shish`}
                  </span>
                  <Plus className="w-4 h-4" />
                </>
              )}
            </Link>

            <p className="text-[11px] text-[#596B5E] dark:text-[#A6B7AA] text-center leading-tight flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{locale === 'ru' ? 'Безопасное оформление заказа' : 'Xavfsiz rasmiylashtirish'}</span>
            </p>
          </div>
        </div>

      </div>

      {/* "Birga olinadi" Tavsiyalar bloki */}
      {items.length > 0 && (
        <div className="mt-14">
          <RecommendationsSection
            currentSlug={items[0]?.slug}
            locale={locale}
            title={locale === 'ru' ? 'Рекомендуем добавить к заказу' : 'Buyurtmangizga qo‘shishni tavsiya etamiz'}
            limit={4}
          />
        </div>
      )}

      {/* Mobil Doimiy Harakat Paneli (Sticky Bottom Bar) */}
      {items.length > 0 && (
        <div className="lg:hidden fixed bottom-[57px] left-0 right-0 z-30 bg-white/95 dark:bg-[#141F17]/95 backdrop-blur-xl border-t border-[#E9E5DD] dark:border-[#28392B] px-4 py-3 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2">
          <div className="min-w-0">
            <span className="text-[10px] text-[#596B5E] dark:text-[#A6B7AA] uppercase font-bold block">
              {tc('total')}
            </span>
            <div className="font-serif font-black text-base text-[#244B2B] dark:text-[#E5C358] leading-tight truncate">
              {formatCurrency(summary.finalTotal, locale)}
            </div>
          </div>

          <Link
            href={summary.isMinOrderMet ? `/${locale}/checkout` : `/${locale}/catalog`}
            className={`py-3 px-5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all whitespace-nowrap ${
              summary.isMinOrderMet
                ? 'bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712]'
                : 'bg-amber-600 text-white shadow-amber-600/30'
            }`}
          >
            {summary.isMinOrderMet ? (
              <>
                <span>{t('checkout')}</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37] dark:text-[#0F1712]" />
              </>
            ) : (
              <>
                <span>
                  {locale === 'ru'
                    ? `+ Еще ${formatCurrency(summary.minOrderRemaining, locale)}`
                    : `+ Yana ${formatCurrency(summary.minOrderRemaining, locale)}`}
                </span>
              </>
            )}
          </Link>
        </div>
      )}

    </div>
  );
}

export default CartView;