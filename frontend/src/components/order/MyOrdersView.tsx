'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  Package, 
  ArrowRight, 
  Clock, 
  Trash2, 
  Truck, 
  Store,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin,
  Receipt
} from 'lucide-react';
import { useMyOrdersStore, SavedOrderRef, SavedOrderItem } from '../../stores/my-orders';
import { useCartStore } from '../../stores/cart';
import { formatCurrency } from '../../lib/format';

interface MyOrdersViewProps {
  locale: 'uz' | 'ru';
}

export function MyOrdersView({ locale }: MyOrdersViewProps) {
  const t = useTranslations('MyOrders');
  const ts = useTranslations('Status');
  const tc = useTranslations('Common');
  const router = useRouter();
  const isRu = locale === 'ru';

  const { orders, tokens, removeToken } = useMyOrdersStore();
  const { addItem } = useCartStore();

  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [reorderedToken, setReorderedToken] = useState<string | null>(null);

  const rawOrders: SavedOrderRef[] = useMemo(() => {
    if (orders.length > 0) return orders;
    if (tokens.length > 0) {
      return tokens.map((token) => ({
        token,
        orderNumber: `#${token.slice(0, 6).toUpperCase()}`,
        createdAt: new Date().toISOString(),
        status: 'NEW',
        totalAmount: undefined,
        orderType: undefined,
      }));
    }
    return [];
  }, [orders, tokens]);

  // Filtrlash
  const filteredOrders = useMemo(() => {
    return rawOrders.filter((ord) => {
      const isCompleted = ord.status === 'DELIVERED' || ord.status === 'COMPLETED' || ord.status === 'CANCELLED';
      if (activeTab === 'ACTIVE') return !isCompleted;
      if (activeTab === 'COMPLETED') return isCompleted;
      return true;
    });
  }, [rawOrders, activeTab]);

  const toggleExpand = (token: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [token]: !prev[token],
    }));
  };

  // 🔁 QAYTA BUYURTMA BERISH (REORDER) FUNKSIYASI
  const handleReorder = (order: SavedOrderRef) => {
    if (!order.items || order.items.length === 0) {
      router.push(`/${locale}/catalog`);
      return;
    }

    // Barcha mahsulotlarni savatga yuklash
    order.items.forEach((item) => {
      addItem({
        productId: item.productId || Math.floor(100 + Math.random() * 900),
        slug: item.slug || 'product',
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        unitType: item.unitType || 'PIECE',
        minQuantity: 1,
        quantityStep: 1,
        isAvailable: true,
      });
    });

    setReorderedToken(order.token);
    setTimeout(() => {
      setReorderedToken(null);
    }, 4000);
  };

  // Status vizual chiplari
  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case 'DELIVERING':
      case 'ON_WAY':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isRu ? 'Курьер в пути 🛵' : 'Kuryer yo‘lda 🛵'}</span>
          </span>
        );
      case 'PREPARING':
      case 'COOKING':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>{isRu ? 'Готовится в печи 👨‍🍳' : 'Pechda tayyorlanmoqda 👨‍🍳'}</span>
          </span>
        );
      case 'READY_FOR_PICKUP':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-[#D4AF37]/20 text-[#AA820A] dark:text-[#E5C358] border border-[#D4AF37]/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{isRu ? 'Готов к выдаче в филиале' : 'Filialda olib ketishga tayyor'}</span>
          </span>
        );
      case 'DELIVERED':
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-[#244B2B]/10 dark:bg-[#244B2B]/30 text-[#244B2B] dark:text-[#86EFAC] border border-[#244B2B]/20 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isRu ? 'Доставлен' : 'Yetkazildi'}</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            {isRu ? 'Отменен' : 'Bekor qilingan'}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            {isRu ? 'Принят' : 'Qabul qilindi'}
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-6 sm:pb-10 space-y-4 sm:space-y-6">
      
      {/* Breadcrumb navigatsiya */}
      <nav className="flex items-center gap-2 text-xs font-medium text-[#8C9B90] dark:text-[#889B8C]">
        <Link href={`/${locale}`} className="hover:text-[#244B2B] dark:hover:text-[#E5C358] transition-colors">
          {isRu ? 'Главная' : 'Bosh sahifa'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#C4BCB0]" />
        <span className="text-[#244B2B] dark:text-[#E5C358] font-bold">
          {isRu ? 'Мои заказы' : 'Mening buyurtmalarim'}
        </span>
      </nav>

      {/* Sarlavha bloki */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-5 border-b border-[#E9E5DD] dark:border-[#28392B]">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#1C261E] dark:text-[#F5F2EA] tracking-tight flex items-center gap-2.5">
            <span>{isRu ? 'История моих заказов' : 'Mening buyurtmalarim'}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#244B2B] dark:text-[#E5C358] font-bold">
              {rawOrders.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#596B5E] dark:text-[#A6B7AA] mt-1">
            {isRu 
              ? 'Отслеживайте текущие доставки и повторяйте любимые десерты в один клик' 
              : 'Buyurtmalaringiz holatini kuzating va yoqqan shirinliklarni 1 bosishda qayta buyurtma bering'}
          </p>
        </div>

        <Link
          href={`/${locale}/catalog`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] font-bold text-xs hover:bg-[#1A3720] dark:hover:bg-[#E5C358] transition-all shadow-xs self-start sm:self-auto"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{isRu ? 'Новый заказ' : 'Yangi buyurtma'}</span>
        </Link>
      </div>

      {/* Reorder muvaffaqiyat bildirishnomasi (Toast banner) */}
      {reorderedToken && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 dark:bg-[#15291B] border border-emerald-300 dark:border-emerald-700/50 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300 shadow-md">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>
              {isRu 
                ? 'Блюда из заказа добавлены в вашу корзину!' 
                : 'Ushbu buyurtmadagi shirinliklar savatingizga muvaffaqiyatli qo‘shildi!'}
            </span>
          </div>
          <Link
            href={`/${locale}/cart`}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-700 transition-colors whitespace-nowrap shadow-xs flex items-center gap-1"
          >
            <span>{isRu ? 'В корзину' : 'Savatga o‘tish'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Filtr tablari (Barchasi, Faol, Yakunlangan) */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'ALL'
              ? 'bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] shadow-xs'
              : 'bg-white dark:bg-[#1A281E] text-[#596B5E] dark:text-[#A6B7AA] border border-[#E9E5DD] dark:border-[#28392B]'
          }`}
        >
          {isRu ? 'Все заказы' : 'Barchasi'} ({rawOrders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ACTIVE')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'ACTIVE'
              ? 'bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] shadow-xs'
              : 'bg-white dark:bg-[#1A281E] text-[#596B5E] dark:text-[#A6B7AA] border border-[#E9E5DD] dark:border-[#28392B]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{isRu ? 'Активные' : 'Faol buyurtmalar'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'COMPLETED'
              ? 'bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] shadow-xs'
              : 'bg-white dark:bg-[#1A281E] text-[#596B5E] dark:text-[#A6B7AA] border border-[#E9E5DD] dark:border-[#28392B]'
          }`}
        >
          {isRu ? 'Завершенные' : 'Yakunlanganlar'}
        </button>
      </div>

      {/* Buyurtmalar ro'yxati (Professional kartochkalar) */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-[#1A281E] rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] p-8 sm:p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#244B2B]/10 dark:bg-[#244B2B]/20 text-[#244B2B] dark:text-[#E5C358] flex items-center justify-center mx-auto text-2xl">
            📦
          </div>
          <h3 className="font-serif font-black text-lg text-[#1C261E] dark:text-[#F5F2EA]">
            {isRu ? 'Заказов в этой категории нет' : 'Ushbu bo‘limda buyurtmalar topilmadi'}
          </h3>
          <p className="text-xs text-[#596B5E] dark:text-[#A6B7AA] max-w-sm mx-auto">
            {isRu 
              ? 'Вы можете выбрать свежие десерты и авторские торты прямо сейчас в нашем каталоге.' 
              : 'Katalogimizdagi barra pishiriqlar va bayram tortlarini hoziroq ko‘rishingiz mumkin.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5 sm:space-y-5">
          {filteredOrders.map((ord) => {
            const dateStr = new Date(ord.createdAt).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'uz-UZ', {
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            });

            const isExpanded = !!expandedOrders[ord.token];
            const items = ord.items || [];
            const displayItems = isExpanded ? items : items.slice(0, 2);
            const remainingCount = items.length - 2;

            return (
              <div
                key={ord.token}
                className="bg-white dark:bg-[#1A281E] rounded-2xl sm:rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] p-4 sm:p-6 shadow-xs hover:shadow-md transition-all duration-300 space-y-4"
              >
                {/* 1. Karta yuqori qatori: Raqam, Status va Sana */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[#E9E5DD] dark:border-[#28392B]">
                  <div className="flex items-center gap-2.5">
                    <span className="font-serif font-black text-base sm:text-lg text-[#1C261E] dark:text-[#F5F2EA]">
                      {ord.orderNumber}
                    </span>
                    {renderStatusBadge(ord.status)}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-[#596B5E] dark:text-[#A6B7AA]">
                    <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{dateStr}</span>
                  </div>
                </div>

                {/* 2. Yetkazish turi va Manzil/Filial */}
                <div className="text-xs text-[#596B5E] dark:text-[#A6B7AA] flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 font-semibold text-[#1C261E] dark:text-[#F5F2EA]">
                    {ord.orderType === 'DELIVERY' ? (
                      <Truck className="w-4 h-4 text-[#244B2B] dark:text-[#E5C358]" />
                    ) : (
                      <Store className="w-4 h-4 text-[#D4AF37]" />
                    )}
                    <span>
                      {ord.orderType === 'DELIVERY'
                        ? (isRu ? 'Доставка курьером' : 'Kuryer orqali yetkazish')
                        : (isRu ? 'Самовывоз из филиала' : 'Filialdan olib ketish')}
                    </span>
                  </div>

                  {(ord.deliveryAddress || ord.branchName) && (
                    <span className="text-[11px] text-[#8C9B90] dark:text-[#889B8C] flex items-center gap-1 truncate max-w-xs">
                      <MapPin className="w-3 h-3 text-[#D4AF37] flex-shrink-0" />
                      <span className="truncate">{ord.deliveryAddress || ord.branchName}</span>
                    </span>
                  )}
                </div>

                {/* 3. Tarkibidagi Mahsulotlar (Mini-vitrina) */}
                {items.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#8C9B90] dark:text-[#889B8C] block">
                      {isRu ? 'Состав заказа:' : 'Buyurtma tarkibi:'}
                    </span>

                    <div className="divide-y divide-[#E9E5DD]/60 dark:divide-[#28392B]/60 bg-[#FBF9F4] dark:bg-[#141F17] rounded-2xl p-2.5 sm:p-3.5 border border-[#E9E5DD] dark:border-[#28392B]">
                      {displayItems.map((item, idx) => (
                        <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {item.imageUrl ? (
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden relative flex-shrink-0 border border-[#E9E5DD] dark:border-[#28392B]">
                                <Image
                                  src={item.imageUrl}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#244B2B]/10 dark:bg-[#244B2B]/20 flex items-center justify-center text-lg flex-shrink-0">
                                🍰
                              </div>
                            )}

                            <div className="min-w-0">
                              <span className="text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] truncate block">
                                {item.name}
                              </span>
                              <span className="text-[11px] text-[#596B5E] dark:text-[#A6B7AA]">
                                {item.quantity} × {formatCurrency(item.price, locale)}
                              </span>
                            </div>
                          </div>

                          <span className="font-extrabold text-xs text-[#244B2B] dark:text-[#E5C358] whitespace-nowrap">
                            {formatCurrency(item.price * item.quantity, locale)}
                          </span>
                        </div>
                      ))}

                      {/* Yana ko'rsatish / yig'ish akkordeoni */}
                      {remainingCount > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(ord.token)}
                          className="pt-2 w-full text-center text-xs font-bold text-[#244B2B] dark:text-[#E5C358] hover:underline flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              <span>{isRu ? 'Свернуть' : 'Yopish'}</span>
                              <ChevronUp className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <>
                              <span>
                                {isRu 
                                  ? `Еще ${remainingCount} позиции...` 
                                  : `Yana ${remainingCount} ta mahsulot...`}
                              </span>
                              <ChevronDown className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Pastki qator: Jami summa va Amallar (🔁 Reorder & 📍 Tracking) */}
                <div className="pt-3 border-t border-[#E9E5DD] dark:border-[#28392B] flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-[#8C9B90] dark:text-[#889B8C] block uppercase tracking-wider font-semibold">
                      {isRu ? 'Итоговая сумма' : 'Umumiy summa'}
                    </span>
                    <span className="font-serif font-black text-base sm:text-xl text-[#244B2B] dark:text-[#E5C358]">
                      {ord.totalAmount != null ? formatCurrency(ord.totalAmount, locale) : '—'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    
                    {/* 🔁 Qayta buyurtma berish (Reorder) tugmasi */}
                    {items.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleReorder(ord)}
                        className="py-2 px-3 sm:px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#1C261E] font-black text-xs shadow-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                        title={isRu ? 'Добавить все блюда в корзину' : 'Barcha mahsulotlarni yana savatga solish'}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{isRu ? 'Повторить заказ' : 'Qayta buyurtma'}</span>
                      </button>
                    )}

                    {/* 📍 Buyurtma holatini kuzatish (Tracking) */}
                    <Link
                      href={`/${locale}/order/${ord.token}`}
                      className="py-2 px-3 sm:px-4 rounded-xl bg-[#244B2B] dark:bg-[#1A281E] border border-[#244B2B] dark:border-[#D4AF37] text-white dark:text-[#E5C358] hover:bg-[#1A3720] dark:hover:bg-[#28392B] text-xs font-bold transition-all shadow-xs flex items-center gap-1 active:scale-95"
                    >
                      <Receipt className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{isRu ? 'Отследить' : 'Kuzatish'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    {/* Ro'yxatdan o'chirish */}
                    <button
                      type="button"
                      onClick={() => removeToken(ord.token)}
                      className="p-2 text-[#8C9B90] dark:text-[#889B8C] hover:text-[#B83A3A] dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                      title={isRu ? 'Удалить из истории' : 'Tarixdan o‘chirish'}
                      aria-label="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default MyOrdersView;
