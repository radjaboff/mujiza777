'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  PackageCheck, 
  Truck, 
  AlertCircle, 
  Copy, 
  Phone, 
  Share2, 
  ArrowLeft,
  XCircle,
  MapPin,
  Sparkles,
  ShoppingBag,
  Gift,
  Send,
  Check,
  Receipt,
  ShieldCheck,
  Navigation,
  Calendar
} from 'lucide-react';
import { Order, OrderStatus, OrderType } from '../../lib/api/types';
import { formatCurrency, formatQuantity } from '../../lib/format';
import { apiClient } from '../../lib/api/client';

interface OrderTrackingViewProps {
  initialOrder: Order;
  token: string;
  locale: 'uz' | 'ru';
}

export function OrderTrackingView({ initialOrder, token, locale }: OrderTrackingViewProps) {
  const t = useTranslations('Tracking');
  const ts = useTranslations('Status');
  const tc = useTranslations('Common');
  const isRu = locale === 'ru';

  const [order, setOrder] = useState<Order>(initialOrder);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [connectionMode, setConnectionMode] = useState<'SSE' | 'POLLING'>('SSE');
  const sseFailuresRef = useRef(0);

  // SSE va Polling boshqaruvi
  useEffect(() => {
    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      return;
    }

    let eventSource: EventSource | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    const startPolling = () => {
      setConnectionMode('POLLING');
      pollInterval = setInterval(async () => {
        try {
          const updated = await apiClient<Order>(`/api/public/orders/track/${token}`, { lang: locale });
          if (updated) {
            setOrder(updated);
            if (updated.status === 'COMPLETED' || updated.status === 'CANCELLED') {
              if (pollInterval) clearInterval(pollInterval);
            }
          }
        } catch {}
      }, 15000);
    };

    if (typeof EventSource !== 'undefined' && connectionMode === 'SSE') {
      try {
        eventSource = new EventSource(`/api/public/orders/track/${token}/stream`);

        // Backend publishes a named `status` event with only the status enum.
        // Fetch the complete order so the tracking page reflects that change.
        eventSource.addEventListener('status', async () => {
          try {
            const updated = await apiClient<Order>(`/api/public/orders/track/${token}`, { lang: locale });
            setOrder(updated);
            sseFailuresRef.current = 0;
          } catch {}
        });

        eventSource.onerror = () => {
          sseFailuresRef.current += 1;
          if (sseFailuresRef.current >= 3) {
            if (eventSource) eventSource.close();
            startPolling();
          }
        };
      } catch {
        startPolling();
      }
    } else {
      startPolling();
    }

    return () => {
      if (eventSource) eventSource.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [token, locale, connectionMode, order.status]);

  // Nusxalash
  const handleCopyCode = () => {
    if (order.pickupCode) {
      navigator.clipboard.writeText(order.pickupCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Buyurtmani bekor qilish
  const handleCancelOrder = async () => {
    setIsCancelling(true);
    setCancelError(null);
    try {
      const updated = await apiClient<Order>(`/api/public/orders/track/${token}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: cancelReason || undefined }),
      });
      setOrder(updated);
      setIsCancelModalOpen(false);
    } catch (err: any) {
      setCancelError(
        err?.message ||
          (isRu
            ? 'Не удалось отменить заказ. Возможно, он уже готовится.'
            : "Buyurtmani bekor qilib bo'lmadi. Ehtimol tayyorlanish boshlangan.")
      );
    } finally {
      setIsCancelling(false);
    }
  };

  // Buyurtma holatlari ketma-ketligi
  const steps: { key: OrderStatus; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      key: 'NEW',
      label: ts('NEW'),
      icon: <Clock className="w-5 h-5" />,
      desc: isRu ? 'Заказ принят системой' : 'Buyurtma tizimga qabul qilindi',
    },
    {
      key: 'CONFIRMED',
      label: ts('CONFIRMED'),
      icon: <CheckCircle2 className="w-5 h-5" />,
      desc: isRu ? 'Менеджер подтвердил заказ' : 'Do‘kon buyurtmani tasdiqladi',
    },
    {
      key: 'PREPARING',
      label: ts('PREPARING'),
      icon: <ChefHat className="w-5 h-5" />,
      desc: isRu ? 'Кондитеры готовят ваш десерт' : 'Qandolatchilar buyurtmani pishirmoqda',
    },
    {
      key: 'READY',
      label: ts('READY'),
      icon: <PackageCheck className="w-5 h-5" />,
      desc: order.orderType === 'PICKUP'
        ? (isRu ? 'Готов к выдаче в филиале' : 'Filialda olib ketishga tayyor')
        : (isRu ? 'Упакован и ждет курьера' : 'Qadoqlandi va kuryer kutilmoqda'),
    },
  ];

  if (order.orderType === 'DELIVERY') {
    steps.push({
      key: 'DELIVERING',
      label: ts('DELIVERING'),
      icon: <Truck className="w-5 h-5" />,
      desc: isRu ? 'Курьер доставляет ваш заказ' : 'Kuryer manzilingizga yo‘lda',
    });
  }

  steps.push({
    key: 'COMPLETED',
    label: ts('COMPLETED'),
    icon: <Sparkles className="w-5 h-5" />,
    desc: isRu ? 'Заказ успешно выполнен' : 'Buyurtma muvaffaqiyatli topshirildi',
  });

  const statusOrderIndex: Record<OrderStatus, number> = {
    NEW: 0,
    PRICE_PENDING: 0,
    CONFIRMED: 1,
    PREPARING: 2,
    READY: 3,
    DELIVERING: order.orderType === 'DELIVERY' ? 4 : 3,
    COMPLETED: order.orderType === 'DELIVERY' ? 5 : 4,
    CANCELLED: -1,
  };

  const currentStepIndex = statusOrderIndex[order.status] ?? 0;
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-32 sm:pb-16">
      
      {/* Yuqori navigatsiya va Ulashish */}
      <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-[#E9E5DD] dark:border-[#28392B]">
        <Link
          href={`/${locale}/catalog`}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#244B2B] dark:text-[#E5C358] hover:text-[#1A3720] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isRu ? 'В каталог' : 'Katalogga qaytish'}</span>
        </Link>

        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-[#E9E5DD] dark:border-[#28392B] bg-white dark:bg-[#1A281E] text-[#1C261E] dark:text-[#F5F2EA] hover:bg-[#F4EFE6] dark:hover:bg-[#141F17] shadow-xs active:scale-95 transition-all"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />}
          <span>{copiedLink ? tc('copied') : t('copy')}</span>
        </button>
      </div>

      {/* Asosiy Buyurtma Karti */}
      <div className="relative mt-6 bg-white dark:bg-[#1A281E] rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] p-5 sm:p-8 shadow-sm space-y-6">
        {(order.status === 'NEW' || order.status === 'PRICE_PENDING') && (
          <span aria-hidden="true" className="pointer-events-none absolute -inset-2 rounded-[1.7rem] border border-[#D4AF37]/60 animate-gold-ring" />
        )}
        
        {/* Yuqori qism: Buyurtma raqami va PIN-kod */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E9E5DD] dark:border-[#28392B]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs uppercase tracking-wider font-extrabold text-[#D4AF37]">
                {order.orderType === 'DELIVERY' ? (isRu ? '🚚 Доставка' : '🚚 Yetkazib berish') : (isRu ? '🏪 Самовывоз' : '🏪 Filialdan olib ketish')}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E9E5DD] dark:bg-[#28392B]" />
              <span className="text-xs text-[#596B5E] dark:text-[#A6B7AA]">
                {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#1C261E] dark:text-[#F5F2EA] mt-1">
              {t('orderNumber')} <span className="text-[#244B2B] dark:text-[#E5C358]">{order.orderNumber}</span>
            </h1>
          </div>

          {/* Olib ketish kodi (Pickup PIN Code) */}
          {order.orderType === 'PICKUP' && order.pickupCode && (
            <div className="bg-gradient-to-r from-[#244B2B] to-[#1A3720] dark:from-[#253A2B] dark:to-[#17241B] text-white p-4 sm:p-5 rounded-2xl flex items-center justify-between sm:justify-start gap-4 shadow-lg border border-[#D4AF37]/30">
              <div>
                <div className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider">
                  {t('pickupCode')}
                </div>
                <div className="text-3xl sm:text-4xl font-black tracking-[0.2em] font-mono text-white">
                  {order.pickupCode}
                </div>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#D4AF37] active:scale-90 transition-all shadow-xs"
                title="Kodni nusxalash"
              >
                {copiedCode ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>

        {/* Bekor qilingan holat */}
        {isCancelled ? (
          <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-900 dark:text-red-300 flex items-start gap-4">
            <XCircle className="w-7 h-7 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold">{ts('CANCELLED')}</h3>
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-400 mt-1 leading-relaxed">
                {order.cancelReason || (isRu ? 'Заказ был отменен.' : 'Buyurtma bekor qilingan.')}
              </p>
            </div>
          </div>
        ) : (
          /* Live Status Timeline Stepper */
          <div className="py-2">
            
            {/* Desktop Stepper */}
            <div className="hidden md:grid grid-cols-5 gap-2 relative">
              {steps.map((s, idx) => {
                const isDone = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={s.key} className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                        isDone
                          ? 'bg-[#244B2B] dark:bg-[#253A2B] text-white shadow-sm border border-transparent dark:border-[#3A5640]'
                          : isCurrent
                          ? 'bg-[#D4AF37] text-[#0F1712] ring-4 ring-[#D4AF37]/30 scale-110 shadow-lg font-bold animate-pulse'
                          : 'bg-[#F4EFE6] dark:bg-[#141F17] text-[#8C9B90] dark:text-[#889B8C] border dark:border-[#28392B]'
                      }`}
                    >
                      {s.icon}
                    </div>

                    <span
                      className={`text-xs font-bold mt-3 ${
                        isCurrent ? 'text-[#244B2B] dark:text-[#E5C358]' : isDone ? 'text-[#1C261E] dark:text-[#F5F2EA]' : 'text-[#8C9B90] dark:text-[#889B8C]'
                      }`}
                    >
                      {s.label}
                    </span>
                    <span className="text-[10px] text-[#596B5E] dark:text-[#A6B7AA] mt-0.5 max-w-[130px] leading-tight">
                      {s.desc}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mobil Stepper (Vertikal, ulovchi chiziq bilan) */}
            <div className="md:hidden space-y-4 relative">
              {steps.map((s, idx) => {
                const isDone = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const isLast = idx === steps.length - 1;

                return (
                  <div key={s.key} className="flex items-start gap-3.5 relative">
                    {/* Ulovchi chiziq */}
                    {!isLast && (
                      <div
                        className={`absolute left-5 top-10 w-0.5 h-8 -ml-[1px] transition-colors ${
                          isDone ? 'bg-[#244B2B] dark:bg-[#3D5B44]' : 'bg-[#E9E5DD] dark:bg-[#28392B]'
                        }`}
                      />
                    )}

                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all z-10 ${
                        isDone
                          ? 'bg-[#244B2B] dark:bg-[#253A2B] text-white shadow-xs'
                          : isCurrent
                          ? 'bg-[#D4AF37] text-[#0F1712] ring-4 ring-[#D4AF37]/30 font-bold shadow-md animate-pulse'
                          : 'bg-[#F4EFE6] dark:bg-[#141F17] text-[#8C9B90] dark:text-[#889B8C] border dark:border-[#28392B]'
                      }`}
                    >
                      {s.icon}
                    </div>

                    <div className="flex-1 pt-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-bold ${
                            isCurrent ? 'text-[#244B2B] dark:text-[#E5C358]' : isDone ? 'text-[#1C261E] dark:text-[#F5F2EA]' : 'text-[#8C9B90] dark:text-[#889B8C]'
                          }`}
                        >
                          {s.label}
                        </span>
                        {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#244B2B] dark:text-[#E5C358]">
                            {isRu ? 'Сейчас' : 'Hozir'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#596B5E] dark:text-[#A6B7AA] mt-0.5 leading-snug">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* Manzil, Vaqt va To'lov ma'lumotlari */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FBF9F4] dark:bg-[#141F17] border border-[#E9E5DD] dark:border-[#28392B] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-[#8C9B90] dark:text-[#889B8C] font-semibold mb-1">
              {order.orderType === 'DELIVERY'
                ? (isRu ? 'Адрес доставки:' : 'Yetkazib berish manzili:')
                : (isRu ? 'Филиал получения:' : 'Olib ketiladigan filial:')}
            </div>
            <div className="font-bold text-[#1C261E] dark:text-[#F5F2EA] flex items-center gap-1.5 text-sm">
              <MapPin className="w-4 h-4 text-[#244B2B] dark:text-[#E5C358] flex-shrink-0" />
              <span>{order.orderType === 'DELIVERY' ? (order.deliveryAddress || 'Qarshi shahri') : (order.branchName || 'Markaziy filial')}</span>
            </div>
            {order.scheduledDate && (
              <div className="text-[11px] text-[#596B5E] dark:text-[#A6B7AA] mt-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>
                  {isRu ? 'Дата и интервал:' : 'Vaqt oralig‘i:'} {order.scheduledDate} {order.slotStart ? `(${order.slotStart.slice(0, 5)} – ${order.slotEnd?.slice(0, 5)})` : ''}
                </span>
              </div>
            )}
          </div>

          <div>
            <div className="text-[#8C9B90] dark:text-[#889B8C] font-semibold mb-1">
              {isRu ? 'Способ оплаты:' : 'To‘lov turi:'}
            </div>
            <div className="font-bold text-[#1C261E] dark:text-[#F5F2EA] text-sm">
              {order.paymentMethod === 'CASH'
                ? (isRu ? 'Наличными при получении' : 'Naqd pulda (qabul qilganda)')
                : (isRu ? 'Click / Карта (по звонку)' : 'Click / Karta (telefon orqali)')}
            </div>
            <div className="text-[11px] text-[#596B5E] dark:text-[#A6B7AA] mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isRu ? 'Оператор свяжется для согласования' : 'Operator bog‘lanib tasdiqlaydi'}</span>
            </div>
          </div>
        </div>

        {/* Sovg'a rejimi ma'lumotlari */}
        {order.isGift && (
          <div className="p-4 rounded-2xl bg-[#D4AF37]/10 dark:bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-start gap-3 text-xs">
            <Gift className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="font-bold text-[#1C261E] dark:text-[#F5F2EA] text-sm flex items-center gap-2">
                <span>{isRu ? 'Заказ оформлен как подарок' : 'Buyurtma sovg‘a sifatida rasmiylashtirilgan'}</span>
                {order.isAnonymousGift && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-[#1A281E] border border-[#D4AF37]/40 text-[#AA820A] dark:text-[#E5C358] font-semibold">
                    {isRu ? 'Анонимно' : 'Anonim'}
                  </span>
                )}
              </div>
              {order.recipientName && (
                <div className="text-[#596B5E] dark:text-[#A6B7AA] mt-1">
                  {isRu ? 'Получатель:' : 'Qabul qiluvchi:'} <strong>{order.recipientName}</strong>
                </div>
              )}
              {order.giftMessage && (
                <div className="text-[#1C261E] dark:text-[#F5F2EA] mt-1 italic bg-white/70 dark:bg-[#141F17]/80 p-2.5 rounded-xl border border-[#D4AF37]/20 leading-relaxed">
                  💌 &ldquo;{order.giftMessage}&rdquo;
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mahsulotlar cheki */}
        <div className="pt-2 space-y-3">
          <h3 className="text-base font-serif font-black text-[#1C261E] dark:text-[#F5F2EA] flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#D4AF37]" />
            <span>{isRu ? 'Состав заказа и чек' : 'Buyurtma tarkibi va chek'}</span>
          </h3>

          <div className="divide-y divide-[#E9E5DD] dark:divide-[#28392B] border-y border-[#E9E5DD] dark:border-[#28392B]">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                <div className="min-w-0 pr-2">
                  <div className="font-bold text-[#1C261E] dark:text-[#F5F2EA] truncate">{item.name}</div>
                  <div className="text-[#596B5E] dark:text-[#A6B7AA] text-xs">
                    {formatQuantity(item.quantity, item.unitType, locale)} × {formatCurrency(item.unitPrice, locale)}
                  </div>
                </div>
                <div className="font-serif font-black text-sm text-[#244B2B] dark:text-[#E5C358] flex-shrink-0">
                  {formatCurrency(item.lineTotal, locale)}
                </div>
              </div>
            ))}
          </div>

          {/* Summalar */}
          <div className="pt-2 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-[#596B5E] dark:text-[#A6B7AA]">
              <span>{isRu ? 'Товары:' : 'Mahsulotlar:'}</span>
              <span className="font-semibold text-[#1C261E] dark:text-[#F5F2EA]">{formatCurrency(order.itemsTotal, locale)}</span>
            </div>
            {order.discountAmount != null && order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                <span>{isRu ? 'Скидка по промокоду:' : 'Promokod chegirmasi:'}</span>
                <span>-{formatCurrency(order.discountAmount, locale)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#596B5E] dark:text-[#A6B7AA]">
              <span>{isRu ? 'Доставка:' : 'Yetkazib berish:'}</span>
              <span className="font-semibold text-[#1C261E] dark:text-[#F5F2EA]">
                {order.deliveryFee === 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{isRu ? 'Бесплатно' : 'Bepul'}</span>
                ) : (
                  formatCurrency(order.deliveryFee, locale)
                )}
              </span>
            </div>
            <div className="pt-3 border-t border-[#E9E5DD] dark:border-[#28392B] flex justify-between items-baseline">
              <span className="text-base font-bold text-[#1C261E] dark:text-[#F5F2EA]">{tc('total')}</span>
              <span className="font-serif font-black text-2xl text-[#244B2B] dark:text-[#E5C358]">
                {formatCurrency(order.totalAmount, locale)}
              </span>
            </div>
          </div>
        </div>

        {/* Bog'lanish tugmalari */}
        <div className="pt-4 border-t border-[#E9E5DD] dark:border-[#28392B] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="tel:+998937067321"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-[#244B2B] text-white hover:bg-[#1A3720] text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all text-center"
            >
              <Phone className="w-4 h-4 text-[#D4AF37]" />
              <span>{isRu ? 'Позвонить в кондитерскую' : 'Do‘konga qo‘ng‘iroq'}</span>
            </a>

            <a
              href="https://t.me/mujizashirinliklari777"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-[#2AABEE] text-white hover:opacity-95 shadow-md active:scale-95 transition-all"
              title="Telegram orqali bog‘lanish"
            >
              <Send className="w-4 h-4" />
            </a>
          </div>

          {/* Faqat NEW holatida bekor qilish mumkin */}
          {order.status === 'NEW' && !isCancelled && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="text-xs font-bold text-[#B83A3A] hover:text-red-700 hover:underline p-2"
            >
              {t('cancelOrder')}
            </button>
          )}
        </div>

      </div>

      {/* Bekor qilish modal dialogi */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1A281E] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#E9E5DD] dark:border-[#28392B] space-y-4">
            <h3 className="font-serif font-bold text-lg text-[#1C261E] dark:text-[#F5F2EA]">
              {t('cancelConfirm')}
            </h3>
            <p className="text-xs text-[#596B5E] dark:text-[#A6B7AA] leading-relaxed">
              {isRu
                ? 'Если заказ уже начали готовить, отмена может быть невозможна.'
                : "Agar buyurtma pishirilishni boshlagan bo‘lsa, uni bekor qilib bo‘lmaydi."}
            </p>

            {cancelError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 text-xs">
                {cancelError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] mb-1">
                {t('cancelReason')}
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={isRu ? 'Например: ошиблись адресом' : 'Masalan: boshqa manzil kiritildi'}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#E9E5DD] dark:border-[#28392B] bg-white dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] focus:outline-none focus:border-[#244B2B]"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-[#E9E5DD] dark:border-[#28392B] text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] hover:bg-[#F4EFE6] dark:hover:bg-[#141F17]"
              >
                {tc('cancel')}
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelOrder}
                className="flex-1 py-3 px-4 rounded-xl bg-[#B83A3A] text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 shadow-md active:scale-95 transition-all"
              >
                {isCancelling ? (isRu ? 'Отмена...' : 'Bekor qilinmoqda...') : t('cancelOrder')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default OrderTrackingView;

