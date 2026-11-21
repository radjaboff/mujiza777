'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, Plus, Minus, Clock, Sparkles, Check, Eye } from 'lucide-react';
import { ProductCard as ProductCardType } from '../../lib/api/types';
import { formatCurrency, formatQuantity, formatPrepTime } from '../../lib/format';
import { useCartStore } from '../../stores/cart';
import { useFavoritesStore } from '../../stores/favorites';
import { playSoftAddChime } from '../../lib/audio';
import { QuickViewModal } from './QuickViewModal';
import { WaxSealBadge } from '../ui/WaxSealBadge';

interface Props {
  product: ProductCardType;
  locale: 'uz' | 'ru';
  priority?: boolean;
}

export const ProductCard: React.FC<Props> = ({ product, locale, priority = false }) => {
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [favPopped, setFavPopped] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const cartQuantity = useCartStore((s) => s.getItemQuantity(product.id));
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  
  const isFav = useFavoritesStore((s) => s.isFavorite(product.slug));
  const toggleFav = useFavoritesStore((s) => s.toggleFavorite);

  const hasDiscount = product.oldPrice != null && product.oldPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.oldPrice!) * 100)
    : 0;

  const triggerAddFeedback = () => {
    setJustAdded(true);
    playSoftAddChime();
    setTimeout(() => setJustAdded(false), 900);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.isAvailable) return;
    triggerAddFeedback();
    addItem({
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
    });
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerAddFeedback();
    updateQuantity(product.id, 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, -1);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavPopped(true);
    setTimeout(() => setFavPopped(false), 350);
    toggleFav(product);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`group bg-white dark:bg-[#1A281E] rounded-2xl sm:rounded-3xl border transition-all duration-300 flex flex-col overflow-hidden relative w-full max-w-full ${
        justAdded 
          ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/50 shadow-md' 
          : 'border-[#E9E5DD] dark:border-[#28392B] hover:border-[#D4AF37] shadow-xs hover:shadow-[0_16px_36px_-12px_rgba(36,75,43,0.18)] dark:hover:shadow-[0_16px_36px_-12px_rgba(212,175,55,0.22)]'
      } ${!product.isAvailable ? 'opacity-75' : ''}`}
    >
      
      {/* 1. Rasm va Belgilar */}
      <Link href={`/${locale}/product/${product.slug}`} className="relative aspect-square w-full bg-[#F4EFE6] dark:bg-[#121B14] overflow-hidden block">
        {product.imageUrl && !imageError ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#596B5E]/40 dark:text-[#A6B7AA]/40 p-3 text-center">
            <span className="font-serif text-2xl sm:text-3xl font-bold opacity-30">🍰</span>
            <span className="text-[10px] sm:text-[11px] mt-1 font-medium opacity-60">Mo‘jiza 777</span>
          </div>
        )}

        {/* Nafis oyna yaltirashi (Luxury diagonal shimmer on hover) */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[250%] transition-transform duration-1000 ease-in-out pointer-events-none z-10" />

        {/* Zargarona oltin burchaklar (Luxury confectionery box corner accents on hover) */}
        <div className="hidden sm:block absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-[#D4AF37] rounded-tl-xs opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 -translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 shadow-xs" />
        <div className="hidden sm:block absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-[#D4AF37] rounded-tr-xs opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 shadow-xs" />
        <div className="hidden sm:block absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-[#D4AF37] rounded-bl-xs opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 -translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 shadow-xs" />
        <div className="hidden sm:block absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-[#D4AF37] rounded-br-xs opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 shadow-xs" />

        {/* Quick View tugmasi (Planshet va kompyuterda) */}
        <div className="hidden sm:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-[#1A281E]/95 hover:bg-white dark:hover:bg-[#223326] text-[#1C261E] dark:text-[#F5F2EA] font-bold text-xs shadow-md hover:shadow-xl border border-[#E9E5DD] dark:border-[#28392B] flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 active:scale-90 pointer-events-auto cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{locale === 'ru' ? 'Смотреть' : 'Ko‘rish'}</span>
          </button>
        </div>

        {/* Shohona Qandolat Mumi Muhri va Belgilar (Royal Wax Seal & Artisan Badges) */}
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex flex-col items-start gap-1 z-10 pointer-events-none">
          {hasDiscount ? (
            <WaxSealBadge
              variant="ruby"
              size="sm"
              label={`-${discountPercent}%`}
              sublabel="AKSIYA"
              className="transform -rotate-6 hover:rotate-0 transition-transform pointer-events-auto cursor-pointer"
            />
          ) : product.isPopular ? (
            <WaxSealBadge
              variant="gold"
              size="sm"
              label="777"
              sublabel="SARALANGAN"
              className="transform -rotate-6 hover:rotate-0 transition-transform pointer-events-auto cursor-pointer"
            />
          ) : null}

          {product.isNew && !hasDiscount && (
            <span className="px-2 py-0.5 rounded-full bg-[#244B2B] text-white font-bold text-[9px] sm:text-[10px] tracking-wider shadow-xs border border-[#D4AF37]/50 mt-0.5 pointer-events-auto">
              {locale === 'ru' ? 'Новинка' : 'Yangi'}
            </span>
          )}
        </div>

        {/* Sotuvda yo'q overlay */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-2 text-center z-10">
            <span className="px-2.5 py-1 rounded-lg bg-black/75 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              {locale === 'ru' ? 'Нет в наличии' : 'Mavjud emas'}
            </span>
          </div>
        )}

        {/* Sevimlilar tugmasi */}
        <motion.button
          whileTap={{ scale: 0.75 }}
          onClick={handleToggleFavorite}
          aria-label="Sevimlilarga qo'shish"
          className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 dark:bg-[#1A281E]/95 backdrop-blur-md text-[#1C261E] dark:text-[#F5F2EA] hover:text-[#B83A3A] flex items-center justify-center shadow-xs border border-transparent dark:border-[#28392B] transition-all duration-200 ${
            favPopped ? 'animate-heart-pop' : 'hover:scale-105'
          }`}
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
              isFav ? 'fill-[#B83A3A] text-[#B83A3A]' : ''
            }`}
          />
        </motion.button>

        {/* Tayyorlanish vaqti belgisi */}
        {product.isAvailable && (
          <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 z-10 px-1.5 sm:px-2 py-0.5 rounded-md bg-white/90 dark:bg-[#1A281E]/90 backdrop-blur-sm text-[#1C261E] dark:text-[#F5F2EA] text-[9px] sm:text-[10px] font-semibold flex items-center gap-1 shadow-xs border border-transparent dark:border-[#28392B]">
            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#244B2B] dark:text-[#4ADE80]" />
            <span>{formatPrepTime(product.prepTimeMinutes, locale)}</span>
          </div>
        )}
      </Link>

      {/* 2. Mahsulot ma'lumotlari */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
        <div>
          <Link href={`/${locale}/product/${product.slug}`}>
            <h3 className="font-serif font-bold text-xs sm:text-base text-[#1C261E] dark:text-[#F5F2EA] group-hover:text-[#244B2B] dark:group-hover:text-[#E5C358] transition-colors line-clamp-2 leading-tight sm:leading-snug min-h-[2rem] sm:min-h-[2.5rem]">
              {product.name}
            </h3>
          </Link>
          {product.weightLabel && (
            <span className="text-[10px] sm:text-[11px] text-[#596B5E] dark:text-[#A6B7AA] block mt-0.5 font-medium truncate">
              {product.weightLabel}
            </span>
          )}
        </div>

        {/* Narx va Qo'shish / Stepper */}
        <div className="pt-2 border-t border-[#F4EFE6] dark:border-[#28392B] flex items-center justify-between gap-1 relative">
          
          {/* Narx */}
          <div className="leading-tight min-w-0">
            {hasDiscount && (
              <span className="text-[10px] sm:text-[11px] text-[#596B5E] dark:text-[#A6B7AA] line-through block font-medium truncate">
                {formatCurrency(product.oldPrice, locale)}
              </span>
            )}
            <div className="flex items-baseline gap-0.5">
              <span className="font-bold text-xs sm:text-base text-[#244B2B] dark:text-[#E5C358] truncate">
                {formatCurrency(product.price, locale)}
              </span>
              {product.unitType === 'KG' && (
                <span className="text-[9px] sm:text-[10px] text-[#596B5E] dark:text-[#A6B7AA] font-medium">
                  {locale === 'ru' ? '/ кг' : '/ kg'}
                </span>
              )}
            </div>
          </div>

          {/* "+1 qo'shildi" suzuvchi xabarchasi */}
          {justAdded && (
            <span className="absolute -top-7 right-0 bg-[#244B2B] text-[#D4AF37] text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shadow-md animate-fade-in-up whitespace-nowrap z-20 pointer-events-none flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{locale === 'ru' ? '+1 в корзину' : '+1 qo‘shildi'}</span>
            </span>
          )}

          {/* Savatga qo'shish yoki Stepper */}
          {product.isAvailable ? (
            cartQuantity > 0 ? (
              <div className="flex items-center bg-[#244B2B] text-white rounded-lg sm:rounded-xl p-0.5 shadow-xs transition-all duration-200">
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={handleDecrement}
                  aria-label="Kamaytirish"
                  className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center hover:bg-[#1A3720] rounded-md transition-colors"
                >
                  <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </motion.button>
                <span className="px-1 sm:px-1.5 text-[11px] sm:text-xs font-bold min-w-[18px] sm:min-w-[24px] text-center">
                  {formatQuantity(cartQuantity, product.unitType, locale)}
                </span>
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={handleIncrement}
                  aria-label="Ko'paytirish"
                  className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center hover:bg-[#1A3720] rounded-md transition-colors"
                >
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                onClick={handleAddToCart}
                aria-label="Savatga qo'shish"
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shadow-xs transition-all duration-200 cursor-pointer flex-shrink-0 ${
                  justAdded 
                    ? 'bg-emerald-600 text-white scale-105' 
                    : 'bg-[#244B2B] text-white hover:bg-[#1A3720] group-hover:bg-[#1A3720]'
                }`}
              >
                {justAdded ? (
                  <Check className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                )}
              </motion.button>
            )
          ) : (
            <span className="text-[10px] sm:text-[11px] text-[#596B5E] italic">
              {locale === 'ru' ? 'Скоро' : 'Tez kunda'}
            </span>
          )}

        </div>

      </div>

      {/* Tezkor Ko'rish Modali (Quick View Modal) */}
      {quickViewOpen && (
        <QuickViewModal
          product={product}
          isOpen={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
          locale={locale}
        />
      )}

    </motion.div>
  );
};

export default ProductCard;
