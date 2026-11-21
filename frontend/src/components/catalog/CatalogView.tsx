'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal, 
  ArrowUpDown, 
  RotateCcw, 
  Sparkles, 
  Flame, 
  ChevronRight, 
  Check 
} from 'lucide-react';
import { ProductCard } from './ProductCard';
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer';
import { ScrollReveal } from '../ui/ScrollReveal';
import { Category, ProductCard as ProductCardType, Allergen, DietTag } from '../../lib/api/types';

interface CatalogViewProps {
  locale: 'uz' | 'ru';
  categories: Category[];
  initialProducts: ProductCardType[];
  totalElements: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  tortlar: '🎂',
  'mini-tortlar': '🧁',
  ruletlar: '🍥',
  pirojniylar: '🍰',
  pishiriqlar: '🥐',
  shirinliklar: '🍪',
  ichimliklar: '☕',
};

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  tortlar: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150&auto=format&fit=crop&q=80',
  'mini-tortlar': 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=150&auto=format&fit=crop&q=80',
  ruletlar: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=150&auto=format&fit=crop&q=80',
  pirojniylar: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop&q=80',
  pishiriqlar: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=150&auto=format&fit=crop&q=80',
  shirinliklar: 'https://images.unsplash.com/photo-1569864321398-34823a9d9e4a?w=150&auto=format&fit=crop&q=80',
  ichimliklar: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150&auto=format&fit=crop&q=80',
};

export const CatalogView: React.FC<CatalogViewProps> = ({
  locale,
  categories,
  initialProducts,
  totalElements,
}) => {
  const t = useTranslations('Catalog');
  const tn = useTranslations('Navigation');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isRu = locale === 'ru';
  const mobileCapsuleRef = useRef<HTMLDivElement>(null);

  // URL query parametrlari
  const currentCategorySlug = searchParams.get('categorySlug') || '';
  const currentSearch = searchParams.get('search') || searchParams.get('q') || '';
  const currentSort = searchParams.get('sort') || '';
  const currentDiscounted = searchParams.get('discounted') === 'true';
  const currentAvailable = searchParams.get('available') === 'true';
  const currentPopular = searchParams.get('popular') === 'true';
  const currentNew = searchParams.get('new') === 'true';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentAllergens = searchParams.getAll('excludeAllergens');
  const currentDiets = searchParams.getAll('diets');

  // URL da toifa ko'rsatilmagan bo'lsa, avtomatik 1-toifa tanlanadi
  const selectedCategorySlug = currentCategorySlug || (categories.length > 0 ? categories[0].slug : 'tortlar');

  // Klient holatlari
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const isUserTypingRef = useRef(false);

  // Brauzer orqaga/oldinga (Back/Forward) bosilganda URL dagi qidiruvni input bilan sinxronlash
  useEffect(() => {
    if (!isUserTypingRef.current) {
      setSearchInput(currentSearch);
    }
  }, [currentSearch]);

  // Query yangilash
  const updateQuery = useCallback(
    (
      newParams: Record<string, string | number | boolean | string[] | undefined>,
      replace = false
    ) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '' || value === false) {
          params.delete(key);
        } else if (Array.isArray(value)) {
          params.delete(key);
          value.forEach((v) => params.append(key, v));
        } else {
          params.set(key, String(value));
        }
      });

      const nextUrl = `${pathname}?${params.toString()}`;
      if (replace) {
        router.replace(nextUrl, { scroll: false });
      } else {
        router.push(nextUrl, { scroll: false });
      }
    },
    [searchParams, pathname, router]
  );

  // Qidiruv debounce (350ms) - faqat foydalanuvchi klaviaturada yozganda URL ga o'tkaziladi
  useEffect(() => {
    if (!isUserTypingRef.current) return;
    const handler = setTimeout(() => {
      if (searchInput !== currentSearch) {
        updateQuery({ search: searchInput.trim() || undefined }, true);
      }
      isUserTypingRef.current = false;
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput, currentSearch, updateQuery]);

  // Filtrlarni tozalash
  const handleResetFilters = () => {
    isUserTypingRef.current = false;
    setSearchInput('');
    updateQuery({
      search: undefined,
      sort: undefined,
      discounted: undefined,
      available: undefined,
      popular: undefined,
      new: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      excludeAllergens: undefined,
      diets: undefined,
    });
    setFilterModalOpen(false);
  };

  // Tanlangan faol kategoriya
  const activeCategory = useMemo(() => {
    return categories.find((c) => c.slug === selectedCategorySlug) || categories[0] || null;
  }, [categories, selectedCategorySlug]);

  // Mobil karuselni tanlangan toifaga silliq surish
  useEffect(() => {
    if (mobileCapsuleRef.current) {
      const activeBtn = mobileCapsuleRef.current.querySelector<HTMLElement>(`[data-category="${selectedCategorySlug}"]`);
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedCategorySlug]);

  // Allergenlar ro'yxati
  const allergenList: { id: Allergen; labelUz: string; labelRu: string }[] = [
    { id: 'NUTS', labelUz: "Yong'oqsiz", labelRu: 'Без орехов' },
    { id: 'PEANUTS', labelUz: "Yer yong'oqsiz", labelRu: 'Без арахиса' },
    { id: 'MILK', labelUz: 'Sutsiz', labelRu: 'Без молока' },
    { id: 'GLUTEN', labelUz: 'Glutensiz', labelRu: 'Без глютена' },
    { id: 'EGG', labelUz: 'Tuxumsiz', labelRu: 'Без яиц' },
  ];

  // Parhez teglari
  const dietList: { id: DietTag; labelUz: string; labelRu: string }[] = [
    { id: 'HALAL', labelUz: 'Halol', labelRu: 'Халяль' },
    { id: 'SUGAR_FREE', labelUz: 'Shakarsiz', labelRu: 'Без сахара' },
    { id: 'GLUTEN_FREE', labelUz: 'Glutensiz', labelRu: 'Без глютена' },
    { id: 'LACTOSE_FREE', labelUz: 'Laktozasiz', labelRu: 'Без лактозы' },
    { id: 'VEGAN', labelUz: 'Vegan', labelRu: 'Веган' },
  ];

  const hasAdvancedFilters =
    Boolean(currentSearch) ||
    Boolean(currentSort) ||
    currentDiscounted ||
    currentAvailable ||
    currentPopular ||
    currentNew ||
    Boolean(currentMinPrice) ||
    Boolean(currentMaxPrice) ||
    currentAllergens.length > 0 ||
    currentDiets.length > 0;

  // Mahsulotlarni filtrlash va saralash
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // 1. Toifa bo'yicha filter
      if (selectedCategorySlug && product.categorySlug !== selectedCategorySlug) {
        return false;
      }
      // 2. Qidiruv
      if (currentSearch) {
        const query = currentSearch.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        if (!matchesName) return false;
      }
      // Chegirma
      if (currentDiscounted) {
        const hasDiscount = product.oldPrice != null && product.oldPrice > product.price;
        if (!hasDiscount) return false;
      }
      // Yangi
      if (currentNew && !product.isNew) {
        return false;
      }
      // Ommabop
      if (currentPopular && !product.isPopular) {
        return false;
      }
      // Faqat sotuvda mavjudlar
      if (currentAvailable && !product.isAvailable) {
        return false;
      }
      // Narx oralig'i
      if (currentMinPrice && product.price < Number(currentMinPrice)) {
        return false;
      }
      if (currentMaxPrice && product.price > Number(currentMaxPrice)) {
        return false;
      }
      // Allergenlar
      if (currentAllergens.length > 0) {
        const hasExcluded = product.allergens?.some((a) => currentAllergens.includes(a));
        if (hasExcluded) return false;
      }
      // Parhez
      if (currentDiets.length > 0) {
        const hasDiet = product.dietTags?.some((d) => currentDiets.includes(d));
        if (!hasDiet) return false;
      }
      return true;
    }).sort((a, b) => {
      if (currentSort === 'price_asc') return a.price - b.price;
      if (currentSort === 'price_desc') return b.price - a.price;
      if (currentSort === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return 0;
    });
  }, [
    initialProducts,
    selectedCategorySlug,
    currentSearch,
    currentDiscounted,
    currentNew,
    currentPopular,
    currentAvailable,
    currentMinPrice,
    currentMaxPrice,
    currentAllergens,
    currentDiets,
    currentSort,
  ]);

  // Har bir toifadagi mahsulotlar soni
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    initialProducts.forEach((p) => {
      counts[p.categorySlug] = (counts[p.categorySlug] || 0) + 1;
    });
    return counts;
  }, [initialProducts]);

  return (
    <div className="space-y-4 sm:space-y-6 pb-2 sm:pb-4">
      
      {/* 1. Breadcrumbs (Bosh sahifa > Katalog > Toifa) - Faqat Desktopda (Mobilda joy tejash uchun yashiriladi) */}
      <nav className="hidden lg:flex items-center gap-2 text-xs text-[#8C9B90] font-medium">
        <Link href={`/${locale}`} className="hover:text-[#244B2B] transition-colors">
          {tn('home')}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#C4BCB0]" />
        <span>{isRu ? 'Каталог' : 'Katalog'}</span>
        {activeCategory && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-[#C4BCB0]" />
            <span className="text-[#244B2B] dark:text-[#E5C358] font-bold">
              {activeCategory.name}
            </span>
          </>
        )}
      </nav>

      {/* 2. MOBIL HEADER: Qidiruv, Stories toifalar va Tezkor filtrlar (Faqat mobil qurilmalar - lg:hidden) */}
      <div className="lg:hidden space-y-3 pt-0.5">
        
        {/* Yuqori Qidiruv & Filtr tugmasi */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8C9B90] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                isUserTypingRef.current = true;
                setSearchInput(e.target.value);
              }}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-white dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#28392B] focus:border-[#244B2B] dark:focus:border-[#D4AF37] text-xs text-[#1C261E] dark:text-[#F5F2EA] outline-none shadow-2xs"
            />
            {searchInput && (
              <button
                onClick={() => {
                  isUserTypingRef.current = true;
                  setSearchInput('');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C9B90] hover:text-[#1C261E] dark:hover:text-[#F5F2EA] p-1"
                aria-label="Tozalash"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setFilterModalOpen(true)}
            className="p-2.5 rounded-2xl bg-white dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#28392B] hover:border-[#D4AF37] text-[#1C261E] dark:text-[#F5F2EA] flex items-center justify-center shadow-2xs relative cursor-pointer flex-shrink-0"
            title="Qo'shimcha filtrlar"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#244B2B] dark:text-[#E5C358]" />
            {hasAdvancedFilters && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#B83A3A] ring-2 ring-white" />
            )}
          </button>
        </div>

        {/* Safia Bakery Uslubidagi Stories / Dumaloq Toifalar Karuseli */}
        <div className="-mx-4 px-4 overflow-hidden">
          <div
            ref={mobileCapsuleRef}
            className="flex items-start gap-3.5 overflow-x-auto scrollbar-none no-scrollbar scroll-smooth py-1.5 pr-6"
          >
            {categories.map((cat) => {
              const isSelected = selectedCategorySlug === cat.slug;
              const imgSrc = cat.imageUrl || CATEGORY_DEFAULT_IMAGES[cat.slug];

              return (
                <button
                  key={cat.id}
                  data-category={cat.slug}
                  onClick={() => updateQuery({ categorySlug: cat.slug })}
                  className="flex-shrink-0 flex flex-col items-center gap-1.5 w-[76px] text-center cursor-pointer group focus:outline-none"
                >
                  {/* Yumaloq avatar (Safia uslubidagi oltin nurlanish halqasi bilan) */}
                  <div
                    className={`relative w-[54px] h-[54px] rounded-full p-[2px] transition-all duration-300 ${
                      isSelected
                        ? 'bg-gradient-to-tr from-[#D4AF37] via-[#F3E29F] to-[#244B2B] shadow-md scale-105'
                        : 'bg-transparent'
                    }`}
                  >
                    <div className="relative w-full h-full rounded-full overflow-hidden bg-white dark:bg-[#121B14] border-2 border-white dark:border-[#1A281E]">
                      {imgSrc ? (
                        <Image
                          src={imgSrc}
                          alt={cat.name}
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="54px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-base bg-[#FAF8F5] dark:bg-[#141F17]">
                          {CATEGORY_ICONS[cat.slug] || '🍰'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Toifa nomi (To'liq, ixcham 2 qatorda, so'zni bo'lmasdan) */}
                  <span
                    className={`text-[10.5px] leading-tight font-medium w-[76px] text-center line-clamp-2 break-normal transition-colors ${
                      isSelected
                        ? 'font-bold text-[#244B2B] dark:text-[#E5C358]'
                        : 'text-[#596B5E] dark:text-[#A6B7AA]'
                    }`}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tezkor filtrlar teglari (1 qatorli silliq gorizontal tasma - Swipeable) */}
        <div className="-mx-4 px-4 overflow-hidden pt-0.5">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none no-scrollbar pb-1 pr-6">
            
            {/* Barchasi */}
            <button
              onClick={() => updateQuery({ discounted: undefined, new: undefined, popular: undefined })}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                !currentDiscounted && !currentNew && !currentPopular
                  ? 'bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] shadow-xs'
                  : 'bg-white dark:bg-[#1A281E] text-[#1C261E] dark:text-[#F5F2EA] border border-[#E9E5DD] dark:border-[#28392B]'
              }`}
            >
              {isRu ? 'Все' : 'Barchasi'}
            </button>

            {/* Chegirmada */}
            <button
              onClick={() => updateQuery({ discounted: currentDiscounted ? undefined : true })}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentDiscounted
                  ? 'bg-[#B83A3A] text-white shadow-xs'
                  : 'bg-white dark:bg-[#1A281E] text-[#1C261E] dark:text-[#F5F2EA] border border-[#E9E5DD] dark:border-[#28392B]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>{isRu ? 'Скидки' : 'Chegirmada'}</span>
            </button>

            {/* Yangilar */}
            <button
              onClick={() => updateQuery({ new: currentNew ? undefined : true })}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentNew
                  ? 'bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] shadow-xs'
                  : 'bg-white dark:bg-[#1A281E] text-[#1C261E] dark:text-[#F5F2EA] border border-[#E9E5DD] dark:border-[#28392B]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isRu ? 'Новинки' : 'Yangilar'}</span>
            </button>

            {/* Mashhurlar */}
            <button
              onClick={() => updateQuery({ popular: currentPopular ? undefined : true })}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentPopular
                  ? 'bg-[#AA820A] text-white shadow-xs'
                  : 'bg-white dark:bg-[#1A281E] text-[#1C261E] dark:text-[#F5F2EA] border border-[#E9E5DD] dark:border-[#28392B]'
              }`}
            >
              <span>🌟</span>
              <span>{isRu ? 'Хиты' : 'Mashhurlar'}</span>
            </button>

            {/* Filtrlarni tozalash */}
            {hasAdvancedFilters && (
              <button
                onClick={handleResetFilters}
                className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#B83A3A] text-xs font-bold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t('resetFilter')}</span>
              </button>
            )}

          </div>
        </div>

        {/* Faol toifa sarlavhasi (Chapda) va Saralash (O'ngda) */}
        <div className="flex items-center justify-between pt-1 pb-0.5">
          <div className="flex items-baseline gap-2">
            <h2 className="font-serif font-black text-xl text-[#1C261E] dark:text-[#F5F2EA] tracking-tight">
              {activeCategory ? activeCategory.name : (isRu ? 'Каталог' : 'Katalog')}
            </h2>
            <span className="text-xs font-semibold text-[#AA820A] dark:text-[#D4AF37]">
              · {filteredProducts.length} {isRu ? 'видов' : 'xil'}
            </span>
          </div>

          {/* O'ng tomonda joylashgan qulay saralash tugmasi */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#28392B] text-xs font-semibold text-[#1C261E] dark:text-[#F5F2EA] shadow-2xs">
            <ArrowUpDown className="w-3 h-3 text-[#8C9B90]" />
            <select
              value={currentSort}
              onChange={(e) => updateQuery({ sort: e.target.value || undefined })}
              className="bg-transparent text-[11px] font-bold text-[#1C261E] dark:text-[#F5F2EA] outline-none cursor-pointer pr-0.5"
            >
              <option value="" className="dark:bg-[#1A281E]">{t('sortDefault')}</option>
              <option value="price_asc" className="dark:bg-[#1A281E]">{t('sortPriceAsc')}</option>
              <option value="price_desc" className="dark:bg-[#1A281E]">{t('sortPriceDesc')}</option>
              <option value="newest" className="dark:bg-[#1A281E]">{t('sortNewest')}</option>
            </select>
          </div>
        </div>

      </div>

      {/* 3. ASOSIY 2 USTUNLI TUZILISH:
          - Chap ustun (Desktop): Safia uslubidagi rasmli toifalar menyusi
          - O'ng ustun: Tartibli vitrina (Mobil: 2 ustun, Desktop: 3 ustun)
      */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* CHAP TOMON: SAFIA USLUBIDAGI RASMLI TOIFALAR MENYUSI (DESKTOP) */}
        <aside className="hidden lg:block w-72 xl:w-80 flex-shrink-0 sticky top-24 space-y-4">
          <div className="bg-[#FAF8F5] dark:bg-[#141F17] p-5 rounded-3xl border border-[#EAE6DD] dark:border-[#28392B] shadow-sm space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E4DFD5] dark:border-[#28392B]">
              <h2 className="font-serif font-black text-2xl text-[#1C261E] dark:text-[#F5F2EA] tracking-tight">
                {isRu ? 'Каталог' : 'Katalog'}
              </h2>
              <span className="text-xs font-bold text-[#AA820A] dark:text-[#E5C358] bg-[#D4AF37]/15 dark:bg-[#D4AF37]/25 px-2.5 py-1 rounded-full">
                {categories.length} toifa
              </span>
            </div>

            {/* Vertikal toifalar ro'yxati (Safia kabi oq hoshiyali yumaloq suratlar bilan) */}
            <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 scrollbar-none">
              {categories.map((cat) => {
                const isSelected = selectedCategorySlug === cat.slug;
                const imgSrc = cat.imageUrl || CATEGORY_DEFAULT_IMAGES[cat.slug];
                const count = categoryCounts[cat.slug] || 0;

                return (
                  <button
                    key={cat.id}
                    onClick={() => updateQuery({ categorySlug: cat.slug })}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-[#244B2B] text-white shadow-md scale-[1.01]'
                        : 'bg-white dark:bg-[#1A281E] hover:bg-[#F3EFE6] dark:hover:bg-[#223326] text-[#1C261E] dark:text-[#F5F2EA] border border-[#EAE6DD] dark:border-[#28392B]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Dumaloq fotosurat */}
                      <div className="relative w-11 h-11 rounded-full overflow-hidden flex-shrink-0 border-2 border-white dark:border-[#28392B] shadow-sm bg-white dark:bg-[#121B14]">
                        {imgSrc ? (
                          <Image
                            src={imgSrc}
                            alt={cat.name}
                            fill
                            unoptimized
                            className="object-cover"
                            sizes="44px"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#F4EFE6] dark:bg-[#121B14] flex items-center justify-center text-sm">
                            {CATEGORY_ICONS[cat.slug] || '🍰'}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <span className="font-bold text-sm block leading-tight truncate">
                          {cat.name}
                        </span>
                        <span className={`text-[11px] block mt-0.5 font-medium ${
                          isSelected ? 'text-[#D4AF37]' : 'text-[#8C9B90] dark:text-[#A6B7AA]'
                        }`}>
                          {count} {isRu ? 'видов' : 'ta tur'}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37] mr-2 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

          </div>
        </aside>

        {/* O'NG TOMON: VITRINA */}
        <main className="flex-1 min-w-0 space-y-5">
          
          {/* DESKTOP SARLAVHA VA BOSHQARUV PANELI (Faqat Desktop lg va undan yuqori qurilmalar uchun) */}
          <div className="hidden lg:block bg-white dark:bg-[#1A281E] p-6 rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] shadow-xs space-y-3.5">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="font-serif font-black text-xl sm:text-3xl text-[#1C261E] dark:text-[#F5F2EA] tracking-tight">
                  {activeCategory ? activeCategory.name : (isRu ? 'Каталог' : 'Katalog')}
                </h1>
                <p className="text-xs sm:text-sm text-[#596B5E] dark:text-[#A6B7AA] mt-0.5">
                  {filteredProducts.length} {isRu ? 'позиций доступно к заказу' : 'ta sara shirinlik buyurtma uchun tayyor'}
                </p>
              </div>

              {/* Qidiruv va Filtr ochish tugmasi */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-[#8C9B90] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => {
                      isUserTypingRef.current = true;
                      setSearchInput(e.target.value);
                    }}
                    placeholder={t('searchPlaceholder')}
                    className="w-full pl-9 pr-8 py-2 rounded-xl sm:rounded-2xl bg-[#FBF9F4] dark:bg-[#141F17] border border-[#E9E5DD] dark:border-[#28392B] focus:border-[#244B2B] dark:focus:border-[#D4AF37] text-xs sm:text-sm text-[#1C261E] dark:text-[#F5F2EA] outline-none"
                  />
                  {searchInput && (
                    <button
                      onClick={() => {
                        isUserTypingRef.current = true;
                        setSearchInput('');
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C9B90] hover:text-[#1C261E] dark:hover:text-[#F5F2EA]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filtr modali tugmasi */}
                <button
                  onClick={() => setFilterModalOpen(true)}
                  className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white dark:bg-[#141F17] border border-[#E9E5DD] dark:border-[#28392B] hover:border-[#244B2B] dark:hover:border-[#D4AF37] text-[#1C261E] dark:text-[#F5F2EA] hover:text-[#244B2B] flex items-center justify-center shadow-xs relative cursor-pointer"
                  title="Qo'shimcha filtrlar"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {hasAdvancedFilters && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#B83A3A] ring-2 ring-white" />
                  )}
                </button>
              </div>
            </div>

            {/* Safia uslubidagi Tezkor Filtr Teglari (Sub-filters) & Saralash */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-[#F4EFE6] dark:border-[#28392B]">
              
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {/* Safia uslubidagi "Barchasi" tugmasi */}
                <button
                  onClick={() => updateQuery({ discounted: undefined, new: undefined, popular: undefined })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    !currentDiscounted && !currentNew && !currentPopular
                      ? 'bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] shadow-xs'
                      : 'bg-[#FBF9F4] dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] border border-[#E9E5DD] dark:border-[#28392B] hover:bg-white dark:hover:bg-[#223326]'
                  }`}
                >
                  <span>{isRu ? 'Все' : 'Barchasi'}</span>
                </button>

                <button
                  onClick={() => updateQuery({ discounted: currentDiscounted ? undefined : true })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    currentDiscounted
                      ? 'bg-[#B83A3A] text-white shadow-xs'
                      : 'bg-[#FBF9F4] dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] border border-[#E9E5DD] dark:border-[#28392B] hover:bg-white dark:hover:bg-[#223326]'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isRu ? 'Скидки' : 'Chegirmada'}</span>
                </button>

                <button
                  onClick={() => updateQuery({ new: currentNew ? undefined : true })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    currentNew
                      ? 'bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] shadow-xs'
                      : 'bg-[#FBF9F4] dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] border border-[#E9E5DD] dark:border-[#28392B] hover:bg-white dark:hover:bg-[#223326]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isRu ? 'Новинки' : 'Yangilar'}</span>
                </button>

                <button
                  onClick={() => updateQuery({ popular: currentPopular ? undefined : true })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    currentPopular
                      ? 'bg-[#AA820A] text-white shadow-xs'
                      : 'bg-[#FBF9F4] dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] border border-[#E9E5DD] dark:border-[#28392B] hover:bg-white dark:hover:bg-[#223326]'
                  }`}
                >
                  <span>🌟</span>
                  <span>{isRu ? 'Хиты' : 'Mashhurlar'}</span>
                </button>

                {hasAdvancedFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-1 text-xs text-[#B83A3A] font-bold hover:underline ml-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t('resetFilter')}</span>
                  </button>
                )}
              </div>

              {/* Saralash tanlovi */}
              <div className="flex items-center gap-1.5 text-xs text-[#596B5E] dark:text-[#A6B7AA]">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <select
                  value={currentSort}
                  onChange={(e) => updateQuery({ sort: e.target.value || undefined })}
                  className="bg-transparent font-bold text-[#1C261E] dark:text-[#F5F2EA] outline-none cursor-pointer pr-1"
                >
                  <option value="" className="dark:bg-[#1A281E]">{t('sortDefault')}</option>
                  <option value="price_asc" className="dark:bg-[#1A281E]">{t('sortPriceAsc')}</option>
                  <option value="price_desc" className="dark:bg-[#1A281E]">{t('sortPriceDesc')}</option>
                  <option value="newest" className="dark:bg-[#1A281E]">{t('sortNewest')}</option>
                </select>
              </div>

            </div>

          </div>

          {/* Mahsulotlar Vitrinasi: Safia tartibli 2-ustunli mobil ko'rinishi + Tezkor buyurtma */}
          {filteredProducts.length > 0 ? (
            <StaggerContainer
              key={selectedCategorySlug}
              mode="mount"
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-5"
            >
              {filteredProducts.map((product, idx) => (
                <StaggerItem key={product.id}>
                  <ProductCard product={product} locale={locale} priority={idx < 6} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <div className="bg-white dark:bg-[#1A281E] rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] p-12 text-center space-y-4">
              <span className="text-5xl block">🧁</span>
              <h3 className="font-serif font-bold text-xl text-[#1C261E] dark:text-[#F5F2EA]">
                {t('emptyTitle')}
              </h3>
              <p className="text-xs text-[#596B5E] dark:text-[#A6B7AA] max-w-sm mx-auto">
                {t('emptySubtitle')}
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-2xl bg-[#244B2B] text-white text-xs font-bold hover:bg-[#1A3720] transition-colors cursor-pointer"
              >
                {t('resetFilter')}
              </button>
            </div>
          )}

        </main>

      </div>

      {/* 4. Qo'shimcha Filtrlar Modali (Narx, Allergenlar, Parhez) */}
      {filterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#FFFDF9] dark:bg-[#141F17] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-transparent dark:border-[#28392B] max-h-[88vh] overflow-y-auto p-6 space-y-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E5DD] dark:border-[#28392B]">
              <h3 className="font-serif font-bold text-lg text-[#1C261E] dark:text-[#F5F2EA] flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#244B2B] dark:text-[#4ADE80]" />
                <span>{t('filter')}</span>
              </h3>
              <button
                onClick={() => setFilterModalOpen(false)}
                className="p-1 rounded-full text-[#596B5E] dark:text-[#A6B7AA] hover:text-[#1C261E] dark:hover:text-[#F5F2EA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mavjudlik */}
            <div className="space-y-3 bg-white dark:bg-[#1A281E] p-4 rounded-2xl border border-[#E9E5DD] dark:border-[#28392B]">
              <label className="flex items-center justify-between text-xs sm:text-sm font-semibold text-[#1C261E] dark:text-[#F5F2EA] cursor-pointer">
                <span>{t('onlyAvailable')}</span>
                <input
                  type="checkbox"
                  checked={currentAvailable}
                  onChange={(e) => updateQuery({ available: e.target.checked || undefined })}
                  className="w-4 h-4 accent-[#244B2B] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs sm:text-sm font-semibold text-[#1C261E] dark:text-[#F5F2EA] cursor-pointer">
                <span>{t('onlyDiscounted')}</span>
                <input
                  type="checkbox"
                  checked={currentDiscounted}
                  onChange={(e) => updateQuery({ discounted: e.target.checked || undefined })}
                  className="w-4 h-4 accent-[#B83A3A] rounded cursor-pointer"
                />
              </label>
            </div>

            {/* Allergenlar */}
            <div className="bg-white dark:bg-[#1A281E] p-4 rounded-2xl border border-[#E9E5DD] dark:border-[#28392B] space-y-3">
              <h4 className="font-bold text-xs text-[#596B5E] dark:text-[#A6B7AA] uppercase tracking-wider">
                {t('allergens')}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {allergenList.map((a) => (
                  <label key={a.id} className="flex items-center gap-2 text-xs text-[#1C261E] dark:text-[#F5F2EA] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentAllergens.includes(a.id)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...currentAllergens, a.id]
                          : currentAllergens.filter((id) => id !== a.id);
                        updateQuery({ excludeAllergens: next.length ? next : undefined });
                      }}
                      className="w-4 h-4 accent-[#244B2B] rounded cursor-pointer"
                    />
                    <span>{locale === 'ru' ? a.labelRu : a.labelUz}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Parhez */}
            <div className="bg-white dark:bg-[#1A281E] p-4 rounded-2xl border border-[#E9E5DD] dark:border-[#28392B] space-y-3">
              <h4 className="font-bold text-xs text-[#596B5E] dark:text-[#A6B7AA] uppercase tracking-wider">
                {t('diets')}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {dietList.map((d) => (
                  <label key={d.id} className="flex items-center gap-2 text-xs text-[#1C261E] dark:text-[#F5F2EA] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentDiets.includes(d.id)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...currentDiets, d.id]
                          : currentDiets.filter((id) => id !== d.id);
                        updateQuery({ diets: next.length ? next : undefined });
                      }}
                      className="w-4 h-4 accent-[#244B2B] rounded cursor-pointer"
                    />
                    <span>{locale === 'ru' ? d.labelRu : d.labelUz}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tugmalar */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-3 rounded-2xl bg-[#E9E5DD] dark:bg-[#28392B] text-[#1C261E] dark:text-[#F5F2EA] font-bold text-xs hover:bg-[#DDD8CF] dark:hover:bg-[#344938] transition-colors cursor-pointer"
              >
                {t('resetFilter')}
              </button>
              <button
                onClick={() => setFilterModalOpen(false)}
                className="flex-1 py-3 rounded-2xl bg-[#244B2B] text-white font-bold text-xs shadow-md hover:bg-[#1C3A21] transition-colors cursor-pointer"
              >
                {isRu ? 'Применить' : 'Qo‘llash'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CatalogView;