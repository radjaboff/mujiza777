'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  X, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Check, 
  Sparkles, 
  Heart, 
  Clock, 
  ShieldCheck, 
  Flame, 
  ArrowRight,
  Info
} from 'lucide-react';
import { ProductCard as ProductCardType, ProductDetail } from '../../lib/api/types';
import { formatCurrency } from '../../lib/format';
import { useCartStore } from '../../stores/cart';
import { useFavoritesStore } from '../../stores/favorites';
import { apiClient } from '../../lib/api/client';
import { playSoftAddChime } from '../../lib/audio';

interface QuickViewModalProps {
  product: ProductCardType | null;
  isOpen: boolean;
  onClose: () => void;
  locale: 'uz' | 'ru';
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  locale,
}) => {
  const isRu = locale === 'ru';
  const { addItem } = useCartStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [fullDetails, setFullDetails] = useState<ProductDetail | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Klaviatura Esc bosilganda yopish
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Mahsulot o'zgarganda miqdorni tiklash
  useEffect(() => {
    if (product) {
      setQuantity(product.minQuantity || 1);
      setJustAdded(false);
      setImageError(false);
    }
  }, [product]);

  useEffect(() => {
    let active = true;
    if (!isOpen || !product) { setFullDetails(null); return; }
    apiClient<ProductDetail>(`/api/public/products/${product.slug}`, { lang: locale })
      .then((details) => { if (active) setFullDetails(details); })
      .catch(() => { if (active) setFullDetails(null); });
    return () => { active = false; };
  }, [isOpen, product, locale]);

  if (!isOpen || !product || !mounted) return null;

  const isFav = isFavorite(product.slug);
  const step = product.quantityStep || 1;
  const minQty = product.minQuantity || 1;

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(100, Number((prev + step).toFixed(2))));
  };

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(minQty, Number((prev - step).toFixed(2))));
  };

  const handleAddToCart = () => {
    if (!product.isAvailable) return;
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice,
        imageUrl: product.imageUrl,
        unitType: product.unitType,
        quantityStep: product.quantityStep,
        prepTimeMinutes: product.prepTimeMinutes,
        minQuantity: product.minQuantity,
        isAvailable: product.isAvailable,
      },
      quantity
    );

    setJustAdded(true);
    playSoftAddChime();
    setTimeout(() => setJustAdded(false), 1600);
  };

  const hasDiscount = product.oldPrice != null && product.oldPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.oldPrice!) * 100)
    : 0;

  const totalPrice = product.price * quantity;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      
      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="bg-white dark:bg-[#1A281E] rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#E9E5DD] dark:border-[#28392B] relative flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Yopish tugmasi */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 dark:bg-[#1A281E]/90 backdrop-blur-md border border-[#E9E5DD] dark:border-[#28392B] text-[#1C261E] dark:text-[#F5F2EA] hover:bg-[#F4EFE6] dark:hover:bg-[#223326] flex items-center justify-center transition-all shadow-sm"
          aria-label="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Chap tomon: Rasm */}
        <div className="relative w-full md:w-1/2 h-64 md:h-auto min-h-[240px] bg-[#F4EFE6] dark:bg-[#121B14] flex-shrink-0 overflow-hidden">
          {product.imageUrl && !imageError ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-[#596B5E]/40 dark:text-[#A6B7AA]/40">
              <span className="text-6xl mb-3">🍰</span>
              <span className="font-serif font-bold text-lg text-[#1C261E]/60 dark:text-[#F5F2EA]/60">Mo‘jiza 777</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
            {hasDiscount && (
              <span className="px-2.5 py-1 rounded-lg bg-[#B83A3A] text-white font-black text-xs shadow-md">
                -{discountPercent}%
              </span>
            )}
            {product.isNew && (
              <span className="px-2.5 py-1 rounded-lg bg-[#244B2B] text-white font-bold text-xs shadow-md">
                {isRu ? 'Новинка' : 'Yangi'}
              </span>
            )}
            <span className="px-2.5 py-1 rounded-lg bg-white/95 dark:bg-[#1A281E]/95 backdrop-blur-md text-[#244B2B] dark:text-[#4ADE80] font-bold text-xs shadow-md border border-[#244B2B]/20 dark:border-[#28392B] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>100% Halol</span>
            </span>
          </div>

          {/* Sevimlilar tugmasi */}
          <button
            onClick={() => toggleFavorite(product)}
            className="absolute bottom-4 left-4 z-10 w-10 h-10 rounded-full bg-white/90 dark:bg-[#1A281E]/90 backdrop-blur-md text-[#1C261E] dark:text-[#F5F2EA] hover:text-[#B83A3A] border border-[#E9E5DD] dark:border-[#28392B] flex items-center justify-center transition-all shadow-md"
            title={isFav ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
          >
            <Heart className={`w-5 h-5 ${isFav ? 'fill-[#B83A3A] text-[#B83A3A]' : ''}`} />
          </button>
        </div>

        {/* 2. O'ng tomon: Ma'lumotlar va tezkor xarid */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between overflow-y-auto">
          
          <div className="space-y-4">
            {/* Kategoriya va Og'irlik */}
            <div className="flex items-center justify-between text-xs text-[#596B5E] dark:text-[#A6B7AA]">
              <span className="font-semibold uppercase tracking-wider text-[#D4AF37]">
                {fullDetails?.categoryName || product.categorySlug}
              </span>
              {product.weightLabel && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#F4EFE6] dark:bg-[#141F17] font-bold text-[#1C261E] dark:text-[#F5F2EA]">
                  {product.weightLabel}
                </span>
              )}
            </div>

            {/* Mahsulot nomi */}
            <h3 className="font-serif font-black text-xl sm:text-2xl text-[#1C261E] dark:text-[#F5F2EA] leading-snug">
              {product.name}
            </h3>

            {/* Narx */}
            <div className="flex items-baseline gap-3 pt-1 flex-wrap">
              <span className="font-serif font-bold text-2xl sm:text-3xl text-[#244B2B] dark:text-[#E5C358] whitespace-nowrap">
                {formatCurrency(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-sm text-[#8C9B90] dark:text-[#A6B7AA] line-through font-medium whitespace-nowrap">
                  {formatCurrency(product.oldPrice)}
                </span>
              )}
            </div>

            {/* Tavsif */}
            <p className="text-xs sm:text-sm text-[#596B5E] dark:text-[#A6B7AA] leading-relaxed line-clamp-3">
              {fullDetails?.description || ''}
            </p>

            {/* Masalliqlar */}
            {fullDetails?.ingredients && (
              <div className="p-3 rounded-xl bg-[#FBF9F4] dark:bg-[#141F17] border border-[#E9E5DD] dark:border-[#28392B] text-xs text-[#596B5E] dark:text-[#A6B7AA]">
                <strong className="text-[#1C261E] dark:text-[#F5F2EA] block mb-1">
                  🌿 {isRu ? 'Ингредиенты:' : 'Tarkibi:'}
                </strong>
                <span className="line-clamp-2">{fullDetails.ingredients}</span>
              </div>
            )}

            {/* Xususiyatlar */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#596B5E] dark:text-[#A6B7AA] pt-1">
              {fullDetails?.calories && (
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-[#B83A3A]" />
                  <span>{fullDetails.calories} kkal / 100g</span>
                </span>
              )}
              {fullDetails?.shelfLifeHours && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#AA820A] dark:text-[#E5C358]" />
                  <span>{fullDetails.shelfLifeHours} {isRu ? 'ч. срок' : 'soat saqlanadi'}</span>
                </span>
              )}
            </div>
          </div>

          {/* Pastki qism: Miqdor va Savatga qo'shish */}
          <div className="pt-6 mt-6 border-t border-[#E9E5DD] dark:border-[#28392B] space-y-3">
            <div className="flex items-center gap-4">
              
              {/* Miqdor tanlash */}
              <div className="flex items-center border border-[#E9E5DD] dark:border-[#28392B] rounded-xl bg-[#FBF9F4] dark:bg-[#141F17] p-1">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={quantity <= minQty}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-[#1E2E22] text-[#1C261E] dark:text-[#F5F2EA] disabled:opacity-30 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-[#1C261E] dark:text-[#F5F2EA]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-[#1E2E22] text-[#1C261E] dark:text-[#F5F2EA] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Savatga qo'shish tugmasi */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.isAvailable}
                className={`flex-1 py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                  justAdded
                    ? 'bg-[#244B2B] text-[#D4AF37]'
                    : 'bg-[#244B2B] hover:bg-[#1A3720] text-white'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4 text-[#D4AF37]" />
                    <span>{isRu ? 'Добавлено в корзину!' : 'Savatga qo‘shildi!'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isRu ? 'В корзину' : 'Savatga qo‘shish'} • {formatCurrency(totalPrice)}</span>
                  </>
                )}
              </button>
            </div>

            {/* To'liq sahifaga o'tish havolasi */}
            <div className="text-center pt-1">
              <Link
                href={`/${locale}/product/${product.slug}`}
                onClick={onClose}
                className="text-xs font-bold text-[#244B2B] hover:text-[#D4AF37] inline-flex items-center gap-1 transition-colors"
              >
                <span>{isRu ? 'Перейти на страницу товара' : 'Batafsil sahifaga o‘tish'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </motion.div>
    </div>,
    document.body
  );
};
