'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { checkoutIdempotencyKey, clearCheckoutIdempotencyKey } from '@/lib/api/client';
import { 
  Truck, 
  Store, 
  MapPin, 
  CreditCard, 
  Banknote, 
  Phone, 
  User, 
  Navigation, 
  Gift, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  Loader2,
  Tag,
  Check,
  Calendar,
  Sparkles,
  X,
  MessageSquare,
  Cake,
  HeartHandshake
} from 'lucide-react';
import { useCartStore } from '../../stores/cart';
import { useMyOrdersStore } from '../../stores/my-orders';
import { formatCurrency, formatQuantity } from '../../lib/format';
import { calculateOrderSummary, isOrderTotalExceeded } from '../../lib/pricing';
import { 
  PublicSettings, 
  Branch, 
  OrderCreate, 
  OrderType, 
  PaymentMethod, 
  Order,
  DeliverySlot,
  PromoValidateResult
} from '../../lib/api/types';
import { apiClient } from '../../lib/api/client';

interface CheckoutViewProps {
  locale: 'uz' | 'ru';
  settings?: PublicSettings;
  branches: Branch[];
}

export function CheckoutView({ locale, settings, branches }: CheckoutViewProps) {
  const t = useTranslations('Checkout');
  const tc = useTranslations('Common');
  const isRu = locale === 'ru';
  const router = useRouter();

  const { items, clearCart } = useCartStore();
  const { addToken } = useMyOrdersStore();

  // 1. Mijoz kontaktlari
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+998 ');

  // 2. Yetkazish turi va manzili
  const [orderType, setOrderType] = useState<OrderType>('DELIVERY');
  const [selectedBranchId, setSelectedBranchId] = useState<number | undefined>(branches[0]?.id);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [isLocating, setIsLocating] = useState(false);

  // 3. Vaqt oynalari (Delivery slots)
  const todayStr = new Date().toISOString().split('T')[0];
  const maxSlotDate = new Date();
  maxSlotDate.setDate(maxSlotDate.getDate() + 14);
  const maxSlotDateStr = maxSlotDate.toISOString().split('T')[0];

  const [scheduledDate, setScheduledDate] = useState<string>(todayStr);
  const [selectedSlotId, setSelectedSlotId] = useState<number | undefined>();
  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const prepMinutes = items.reduce((maximum, item) => Math.max(maximum, item.prepTimeMinutes || 0), 0);

  // 4. Sovg'a rejimi (Gift mode)
  const [isGift, setIsGift] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('+998 ');
  const [giftMessage, setGiftMessage] = useState('');
  const [isAnonymousGift, setIsAnonymousGift] = useState(false);

  // 5. Promo kod
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  // 6. To'lov va izoh
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Saqlangan mijoz ma'lumotlarini yuklash
  useEffect(() => {
    try {
      const savedInfo = localStorage.getItem('mujiza-customer-info');
      if (savedInfo) {
        const parsed = JSON.parse(savedInfo);
        if (parsed.name) setCustomerName(parsed.name);
        if (parsed.phone) setCustomerPhone(parsed.phone);
        if (parsed.address) setDeliveryAddress(parsed.address);
      }
    } catch {}
  }, []);

  // Vaqt oynalarini olish (GET /api/public/delivery/slots?date=...)
  useEffect(() => {
    let active = true;
    async function fetchSlots() {
      if (!scheduledDate) return;
      setSlotsLoading(true);
      try {
        const slots = await apiClient<DeliverySlot[]>('/api/public/delivery/slots', {
          params: { date: scheduledDate, prepMinutes },
        });
        if (active) {
          const availableSlots = Array.isArray(slots) ? slots : [];
          setDeliverySlots(availableSlots);
          setSelectedSlotId(availableSlots.find((s) => s.available)?.id);
          return;
        }
      } catch {
        if (active) {
          setDeliverySlots([]);
          setSelectedSlotId(undefined);
        }
      } finally {
        if (active) setSlotsLoading(false);
      }

    }

    fetchSlots();
    return () => { active = false; };
  }, [scheduledDate, prepMinutes]);

  const deliveryFee = settings?.deliveryFee ?? 15000;
  const freeDeliveryFrom = settings?.freeDeliveryFrom ?? 150000;
  const minOrderAmount = settings?.minOrderAmount ?? 40000;

  const summary = calculateOrderSummary(
    items.map((i) => ({ productId: i.productId, price: i.price, quantity: i.quantity })),
    { deliveryFee, freeDeliveryFrom, minOrderAmount },
    orderType
  );

  // Yakuniy summa (chegirma hisobga olingan holda)
  const finalCalculatedTotal = Math.max(0, summary.itemsTotal - discountAmount) + (orderType === 'DELIVERY' ? summary.deliveryFee : 0);

  // Promokodni tekshirish va qo'llash
  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError(null);

    const cleanPhone = customerPhone.replace(/[^\d+]/g, '');

    try {
      const res = await apiClient<PromoValidateResult>('/api/public/promo/validate', {
        method: 'POST',
        body: JSON.stringify({
          code: promoInput.trim().toUpperCase(),
          itemsTotal: summary.itemsTotal,
          customerPhone: cleanPhone.length >= 13 ? cleanPhone : undefined,
        }),
      });

      if (res && res.valid) {
        setAppliedPromo(res.code);
        setDiscountAmount(res.discountAmount);
        setPromoError(null);
      } else {
        setPromoError(res?.message || (isRu ? 'Промокод недействителен' : 'Promokod yaroqsiz yoki muddati o‘tgan'));
      }
    } catch (error) {
      setAppliedPromo(null);
      setDiscountAmount(0);
      setPromoError((error as { message?: string })?.message || (isRu ? 'Не удалось проверить промокод. Попробуйте позже.' : 'Promokodni tekshirib bo‘lmadi. Keyinroq urinib ko‘ring.'));
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setPromoInput('');
    setPromoError(null);
  };

  // Telefon formati (+998...)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    let val = e.target.value.replace(/[^\d+]/g, '');
    if (!val.startsWith('+998')) {
      val = '+998';
    }
    if (val.length > 13) {
      val = val.slice(0, 13);
    }
    setter(val);
  };

  // Geo-joylashuv
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert(isRu ? 'Геолокация не поддерживается вашим браузером' : 'Brauzeringiz geolokatsiyani qo‘llab-quvvatlamaydi');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        if (!deliveryAddress) {
          setDeliveryAddress(isRu ? 'Локация определена по GPS' : 'GPS orqali joylashuv aniqlandi');
        }
      },
      () => {
        setIsLocating(false);
        alert(isRu ? 'Не удалось определить местоположение. Введите адрес вручную.' : "Joylashuvingizni aniqlab bo'lmadi. Iltimos, manzilni kiriting.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Buyurtmani yuborish
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage(isRu ? 'Корзина пуста!' : "Savatingiz bo'sh!");
      return;
    }

    if (isOrderTotalExceeded(summary.itemsTotal)) {
      setErrorMessage(
        isRu
          ? 'Сумма заказа превышает допустимый максимум (500 000 000 сум)!'
          : "Buyurtma summasi ruxsat etilgan maksimal miqdordan (500 000 000 so'm) oshib ketdi!"
      );
      return;
    }

    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMessage(isRu ? 'Пожалуйста, укажите ваше имя' : "Iltimos, ismingizni kiriting");
      return;
    }

    const cleanPhone = customerPhone.replace(/[^\d+]/g, '');
    if (cleanPhone.length < 13) {
      setErrorMessage(isRu ? 'Пожалуйста, введите корректный номер телефона (+998...)' : "Iltimos, to'liq telefon raqamingizni kiriting (+998...)");
      return;
    }

    if (orderType === 'DELIVERY' && (!deliveryAddress || deliveryAddress.trim().length < 5)) {
      setErrorMessage(isRu ? 'Пожалуйста, укажите точный адрес доставки' : "Iltimos, yetkazib berish manzilini to'liq kiriting");
      return;
    }
    if (orderType === 'DELIVERY' && !selectedSlotId) {
      setErrorMessage(isRu ? 'Выберите доступное время доставки.' : 'Mavjud yetkazib berish vaqtini tanlang.');
      return;
    }
    if (orderType === 'PICKUP' && !selectedBranchId) {
      setErrorMessage(isRu ? 'Выберите филиал для самовывоза.' : 'Olib ketish uchun filialni tanlang.');
      return;
    }

    if (isGift) {
      if (!recipientName.trim()) {
        setErrorMessage(isRu ? 'Укажите имя получателя подарка' : 'Sovg‘a qabul qiluvchining ismini kiriting');
        return;
      }
      const cleanRecPhone = recipientPhone.replace(/[^\d+]/g, '');
      if (cleanRecPhone.length < 13) {
        setErrorMessage(isRu ? 'Укажите корректный телефон получателя подарка' : 'Sovg‘a qabul qiluvchining telefon raqamini to‘liq kiriting');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Profilni saqlash
      localStorage.setItem(
        'mujiza-customer-info',
        JSON.stringify({ name: customerName, phone: customerPhone, address: deliveryAddress })
      );

      const orderPayload: OrderCreate = {
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        orderType,
        branchId: orderType === 'PICKUP' ? selectedBranchId : undefined,
        deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress.trim() : undefined,
        latitude: orderType === 'DELIVERY' ? latitude : undefined,
        longitude: orderType === 'DELIVERY' ? longitude : undefined,
        paymentMethod,
        comment: comment.trim() || undefined,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        promoCode: appliedPromo || undefined,
        scheduledDate: orderType === 'DELIVERY' ? scheduledDate || undefined : undefined,
        slotId: orderType === 'DELIVERY' ? selectedSlotId : undefined,
        isGift: isGift || undefined,
        isAnonymousGift: isGift ? isAnonymousGift : undefined,
        recipientName: isGift ? recipientName.trim() : undefined,
        recipientPhone: isGift ? recipientPhone.replace(/[^\d+]/g, '') : undefined,
        giftMessage: isGift && giftMessage.trim() ? giftMessage.trim() : undefined,
      };

      const idempotencyKey = checkoutIdempotencyKey('mujiza-order-idempotency', orderPayload);
      const createdOrder = await apiClient<Order>('/api/public/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
        headers: { 'Idempotency-Key': idempotencyKey },
      });

      if (!createdOrder.trackingToken) throw new Error('Server kuzatuv tokenini qaytarmadi.');
      const token = createdOrder.trackingToken;
      const selectedBranch = branches.find((b) => b.id === selectedBranchId);
      addToken(token, {
        orderNumber: createdOrder.orderNumber,
        totalAmount: createdOrder.totalAmount || finalCalculatedTotal,
        orderType: createdOrder.orderType,
        status: createdOrder.status,
        items: items.map((it) => ({
          productId: it.productId,
          slug: it.slug,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          imageUrl: it.imageUrl,
          unitType: it.unitType,
        })),
        branchName: selectedBranch?.name,
        deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress : undefined,
      });

      clearCart();
      clearCheckoutIdempotencyKey('mujiza-order-idempotency');
      router.push(`/${locale}/order/${token}`);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(
        err?.message ||
          (isRu
            ? 'Ошибка при оформлении заказа. Пожалуйста, попробуйте еще раз.'
            : 'Buyurtmani rasmiylashtirishda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.')
      );
    }
  };

  // Agar savat bo'sh bo'lsa
  if (items.length === 0) {
    return (
      <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-16 text-center">
        <div className="w-24 h-24 rounded-3xl bg-[#244B2B]/10 dark:bg-[#244B2B]/30 flex items-center justify-center text-[#244B2B] dark:text-[#E5C358] mx-auto mb-5 shadow-inner">
          <Cake className="w-12 h-12" />
        </div>
        <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#1C261E] dark:text-[#F5F2EA] mb-2">
          {isRu ? 'Ваша корзина пуста' : 'Savatingiz bo‘sh'}
        </h2>
        <p className="text-xs sm:text-sm text-[#596B5E] dark:text-[#A6B7AA] max-w-sm mx-auto mb-6">
          {isRu
            ? 'Для оформления заказа добавьте вкусные десерты из нашего каталога'
            : 'Buyurtmani rasmiylashtirish uchun avval shirinliklarimizdan savatga qo‘shing'}
        </p>
        <Link
          href={`/${locale}/catalog`}
          className="inline-flex items-center gap-2 py-3.5 px-6 rounded-2xl bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all"
        >
          <span>{isRu ? 'В каталог' : 'Katalogga o‘tish'}</span>
          <ArrowRight className="w-4 h-4 text-[#D4AF37] dark:text-[#0F1712]" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-4 sm:pt-8 pb-36 sm:pb-16">
      
      {/* Sarlavha & Ishonch xabari */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-6 border-b border-[#E9E5DD] dark:border-[#28392B] gap-2">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#1C261E] dark:text-[#F5F2EA] tracking-tight">
            {t('title')}
          </h1>
          <p className="text-xs sm:text-sm text-[#596B5E] dark:text-[#A6B7AA] mt-0.5">
            {isRu ? 'Быстрое и безопасное оформление заказа' : 'Tez, ishonchli va xavfsiz buyurtma berish'}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#244B2B] dark:text-[#E5C358] bg-[#244B2B]/5 dark:bg-[#D4AF37]/10 px-3.5 py-1.5 rounded-full border border-[#244B2B]/15 dark:border-[#D4AF37]/20">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{isRu ? '100% гарантия свежести' : '100% yangilik kafolati'}</span>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-300 text-xs sm:text-sm flex items-center gap-3 shadow-xs animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 dark:text-red-400" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 mt-6">
        
        {/* Chap qism: 3 qadamli interaktiv forma */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* QADAM 1: Mijoz ma'lumotlari */}
          <div className="bg-white dark:bg-[#1A281E] rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-[#244B2B] to-[#1A3720] dark:from-[#2F4735] dark:to-[#1B291F] text-[#D4AF37] dark:text-[#E5C358] font-black text-sm flex items-center justify-center shadow-xs">
                1
              </div>
              <div>
                <h2 className="font-serif font-black text-base sm:text-lg text-[#1C261E] dark:text-[#F5F2EA]">
                  {t('stepContact')}
                </h2>
                <span className="text-[11px] text-[#596B5E] dark:text-[#A6B7AA] block">
                  {isRu ? 'Укажите, как к вам обращаться' : 'Buyurtmachi haqida asosiy ma’lumotlar'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="block text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] mb-1.5">
                  {t('name')} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8C9B90] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={t('namePlaceholder')}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E9E5DD] dark:border-[#28392B] text-sm focus:outline-none focus:border-[#244B2B] dark:focus:border-[#D4AF37] focus:ring-2 focus:ring-[#244B2B]/10 dark:focus:ring-[#D4AF37]/20 bg-[#FBF9F4]/40 dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] mb-1.5">
                  {t('phone')} *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8C9B90] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => handlePhoneChange(e, setCustomerPhone)}
                    placeholder="+998 (90) 123-45-67"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E9E5DD] dark:border-[#28392B] text-sm font-semibold focus:outline-none focus:border-[#244B2B] dark:focus:border-[#D4AF37] focus:ring-2 focus:ring-[#244B2B]/10 dark:focus:ring-[#D4AF37]/20 bg-[#FBF9F4]/40 dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] transition-all font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* QADAM 2: Olish usuli va Yetkazish vaqti */}
          <div className="bg-white dark:bg-[#1A281E] rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-[#244B2B] to-[#1A3720] dark:from-[#2F4735] dark:to-[#1B291F] text-[#D4AF37] dark:text-[#E5C358] font-black text-sm flex items-center justify-center shadow-xs">
                2
              </div>
              <div>
                <h2 className="font-serif font-black text-base sm:text-lg text-[#1C261E] dark:text-[#F5F2EA]">
                  {t('stepDelivery')}
                </h2>
                <span className="text-[11px] text-[#596B5E] dark:text-[#A6B7AA] block">
                  {isRu ? 'Курьерская доставка или самовывоз из филиала' : 'Yetkazib berish yoki filialdan olib ketish'}
                </span>
              </div>
            </div>

            {/* Yetkazib berish yoki Olib ketish (2 ta ko'rkam karta) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType('DELIVERY')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                  orderType === 'DELIVERY'
                    ? 'border-[#244B2B] dark:border-[#D4AF37] bg-[#244B2B]/5 dark:bg-[#D4AF37]/10 ring-2 ring-[#244B2B] dark:ring-[#D4AF37] shadow-xs'
                    : 'border-[#E9E5DD] dark:border-[#28392B] bg-[#FBF9F4]/40 dark:bg-[#141F17] hover:border-[#D4AF37]'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${orderType === 'DELIVERY' ? 'bg-[#244B2B] text-[#D4AF37]' : 'bg-[#E9E5DD]/60 dark:bg-[#203024] text-[#596B5E]'}`}>
                  <Truck className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#1C261E] dark:text-[#F5F2EA]">
                      {t('delivery')}
                    </span>
                    {orderType === 'DELIVERY' && <CheckCircle2 className="w-4 h-4 text-[#244B2B] dark:text-[#E5C358]" />}
                  </div>
                  <p className="text-[11px] text-[#596B5E] dark:text-[#A6B7AA] mt-0.5">
                    {isRu ? 'Доставка до двери по Карши' : 'Qarshi bo‘ylab eshikkacha yetkazish'}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('PICKUP')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                  orderType === 'PICKUP'
                    ? 'border-[#244B2B] dark:border-[#D4AF37] bg-[#244B2B]/5 dark:bg-[#D4AF37]/10 ring-2 ring-[#244B2B] dark:ring-[#D4AF37] shadow-xs'
                    : 'border-[#E9E5DD] dark:border-[#28392B] bg-[#FBF9F4]/40 dark:bg-[#141F17] hover:border-[#D4AF37]'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${orderType === 'PICKUP' ? 'bg-[#244B2B] text-[#D4AF37]' : 'bg-[#E9E5DD]/60 dark:bg-[#203024] text-[#596B5E]'}`}>
                  <Store className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#1C261E] dark:text-[#F5F2EA]">
                      {t('pickup')}
                    </span>
                    {orderType === 'PICKUP' && <CheckCircle2 className="w-4 h-4 text-[#244B2B] dark:text-[#E5C358]" />}
                  </div>
                  <p className="text-[11px] text-[#596B5E] dark:text-[#A6B7AA] mt-0.5">
                    {isRu ? 'Бесплатно из филиала' : 'Filialdan olib ketish (0 so‘m)'}
                  </p>
                </div>
              </button>
            </div>

            {/* Manzil yoki Filial tanlash */}
            {orderType === 'DELIVERY' ? (
              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA]">
                      {t('address')} *
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isLocating}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#244B2B] dark:text-[#E5C358] hover:underline"
                    >
                      <Navigation className={`w-3.5 h-3.5 text-[#D4AF37] ${isLocating ? 'animate-spin' : ''}`} />
                      <span>{isLocating ? (isRu ? 'Определяем...' : 'Aniqlanmoqda...') : t('useMyLocation')}</span>
                    </button>
                  </div>

                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#8C9B90] absolute left-3.5 top-3.5" />
                    <textarea
                      required
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder={t('addressPlaceholder')}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E9E5DD] dark:border-[#28392B] text-sm focus:outline-none focus:border-[#244B2B] dark:focus:border-[#D4AF37] focus:ring-2 focus:ring-[#244B2B]/10 dark:focus:ring-[#D4AF37]/20 bg-[#FBF9F4]/40 dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] transition-all"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <label className="block text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA]">
                  {t('selectBranch')} *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {branches.map((branch) => {
                    const isSelected = selectedBranchId === branch.id;
                    return (
                      <div
                        key={branch.id}
                        onClick={() => setSelectedBranchId(branch.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#244B2B] dark:border-[#D4AF37] bg-[#244B2B]/10 dark:bg-[#244B2B]/30 ring-1 ring-[#244B2B] dark:ring-[#D4AF37]'
                            : 'border-[#E9E5DD] dark:border-[#28392B] hover:border-[#D4AF37] bg-[#FBF9F4]/30 dark:bg-[#141F17]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-[#1C261E] dark:text-[#F5F2EA]">{branch.name}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#244B2B] dark:text-[#E5C358]" />}
                        </div>
                        <p className="text-xs text-[#596B5E] dark:text-[#A6B7AA] mb-2">{branch.address}</p>
                        <div className="text-[11px] text-[#8C9B90] dark:text-[#889B8C] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{branch.workHours || '09:00 - 22:00'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sana va Vaqt oraliqlari (Delivery Slots) */}
            <div className="pt-4 border-t border-[#E9E5DD] dark:border-[#28392B] space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1C261E] dark:text-[#F5F2EA] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  <span>{isRu ? 'Дата и время доставки:' : 'Yetkazish kuni va vaqt oralig‘i:'}</span>
                </label>
                <input
                  type="date"
                  min={todayStr}
                  max={maxSlotDateStr}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#E9E5DD] dark:border-[#28392B] text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] bg-[#FBF9F4] dark:bg-[#141F17] focus:outline-none focus:border-[#244B2B] dark:focus:border-[#D4AF37]"
                />
              </div>

              {/* Oynalar ro'yxati */}
              {slotsLoading ? (
                <div className="p-4 text-center text-xs text-[#596B5E] dark:text-[#A6B7AA]">
                  {isRu ? 'Загрузка доступных интервалов...' : 'Bo‘sh vaqtlar yuklanmoqda...'}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {deliverySlots.map((slot) => {
                    const isSelected = selectedSlotId === slot.id;
                    const timeRange = `${slot.startTime.slice(0, 5)} – ${slot.endTime.slice(0, 5)}`;

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all ${
                          !slot.available
                            ? 'opacity-40 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed text-gray-500'
                            : isSelected
                            ? 'border-[#244B2B] dark:border-[#D4AF37] bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] shadow-sm font-bold scale-102'
                            : 'border-[#E9E5DD] dark:border-[#28392B] bg-[#FBF9F4] dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] hover:border-[#D4AF37]'
                        }`}
                      >
                        <div className="text-xs font-semibold">{timeRange}</div>
                        {!slot.available && (
                          <span className="text-[10px] block mt-0.5 text-red-500 font-bold">
                            {slot.unavailableReason === 'FULL'
                              ? (isRu ? 'Занято' : 'Band')
                              : (isRu ? 'Не успеем' : 'Ulgurmaymiz')}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sovg'a rejimi (Gift Mode) */}
            {orderType === 'DELIVERY' && (
              <div className="pt-4 border-t border-[#E9E5DD] dark:border-[#28392B] space-y-3">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isGift}
                    onChange={(e) => setIsGift(e.target.checked)}
                    className="w-4 h-4 rounded text-[#244B2B] focus:ring-[#244B2B] border-gray-300"
                  />
                  <span className="text-xs sm:text-sm font-bold text-[#1C261E] dark:text-[#F5F2EA] flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#D4AF37]" />
                    <span>{isRu ? 'Отправить как подарок (сюрприз)' : 'Sovg‘a sifatida yuborish (syurpriz)'}</span>
                  </span>
                </label>

                {isGift && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#D4AF37]/10 dark:bg-[#D4AF37]/15 border border-[#D4AF37]/35 space-y-3 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#1C261E] dark:text-[#F5F2EA] mb-1">
                          {isRu ? 'Имя получателя *' : 'Qabul qiluvchining ismi *'}
                        </label>
                        <input
                          type="text"
                          required={isGift}
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          placeholder={isRu ? 'Кому доставляем' : 'Masalan: Malika'}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#E9E5DD] dark:border-[#28392B] bg-white dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] focus:outline-none focus:border-[#244B2B]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#1C261E] dark:text-[#F5F2EA] mb-1">
                          {isRu ? 'Телефон получателя *' : 'Qabul qiluvchining telefoni *'}
                        </label>
                        <input
                          type="tel"
                          required={isGift}
                          value={recipientPhone}
                          onChange={(e) => handlePhoneChange(e, setRecipientPhone)}
                          placeholder="+998 90 123 45 67"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#E9E5DD] dark:border-[#28392B] bg-white dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] focus:outline-none focus:border-[#244B2B]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#1C261E] dark:text-[#F5F2EA] mb-1">
                        {isRu ? 'Текст поздравления на открытке (до 300 символов)' : 'Tabriknoma matni (otkritkaga qo‘lda yoziladi, 300 belgigacha)'}
                      </label>
                      <textarea
                        rows={2}
                        maxLength={300}
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        placeholder={isRu ? 'Например: С днем рождения, дорогая!' : 'Masalan: Tug‘ilgan kuningiz bilan! Chin dildan eng ezgu tilaklar bilan...'}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#E9E5DD] dark:border-[#28392B] bg-white dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] focus:outline-none focus:border-[#244B2B] resize-none"
                      />
                      <span className="text-[10px] text-[#8C9B90] dark:text-[#889B8C] block text-right">
                        {giftMessage.length} / 300
                      </span>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={isAnonymousGift}
                        onChange={(e) => setIsAnonymousGift(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-[#244B2B]"
                      />
                      <span className="text-xs text-[#596B5E] dark:text-[#A6B7AA]">
                        {isRu
                          ? 'Анонимный подарок (получателю не будет названо ваше имя)'
                          : 'Anonim yuborish (qabul qiluvchiga sizning ismingiz aytilmaydi)'}
                      </span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* QADAM 3: To'lov usuli va Izoh */}
          <div className="bg-white dark:bg-[#1A281E] rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-[#244B2B] to-[#1A3720] dark:from-[#2F4735] dark:to-[#1B291F] text-[#D4AF37] dark:text-[#E5C358] font-black text-sm flex items-center justify-center shadow-xs">
                3
              </div>
              <div>
                <h2 className="font-serif font-black text-base sm:text-lg text-[#1C261E] dark:text-[#F5F2EA]">
                  {t('stepPayment')}
                </h2>
                <span className="text-[11px] text-[#596B5E] dark:text-[#A6B7AA] block">
                  {isRu ? 'Оплата при получении или по согласованию с оператором' : 'Qabul qilib olganda yoki operator bilan kelishuv asosida'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`relative flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all cursor-pointer active:scale-98 ${
                  paymentMethod === 'CASH'
                    ? 'border-[#244B2B] dark:border-[#D4AF37] bg-[#244B2B]/5 dark:bg-[#D4AF37]/10 ring-2 ring-[#244B2B] dark:ring-[#D4AF37] shadow-sm'
                    : 'border-[#E9E5DD] dark:border-[#28392B] bg-[#FBF9F4]/40 dark:bg-[#141F17] hover:border-[#D4AF37]/60'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${paymentMethod === 'CASH' ? 'bg-[#244B2B] text-[#D4AF37]' : 'bg-[#E9E5DD]/60 dark:bg-[#203024] text-[#596B5E]'}`}>
                  <Banknote className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <div className="font-bold text-sm text-[#1C261E] dark:text-[#F5F2EA]">
                    {isRu ? 'Наличными' : 'Naqd pulda'}
                  </div>
                  <div className="text-[11px] text-[#596B5E] dark:text-[#A6B7AA] mt-0.5">
                    {orderType === 'DELIVERY'
                      ? (isRu ? 'Курьеру при получении' : 'Qabul qilib olganda kuryerga')
                      : (isRu ? 'На кассе филиала' : 'Filial kassasida')}
                  </div>
                </div>
                {paymentMethod === 'CASH' && (
                  <CheckCircle2 className="w-4 h-4 text-[#244B2B] dark:text-[#E5C358] absolute top-3.5 right-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`relative flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all cursor-pointer active:scale-98 ${
                  paymentMethod === 'CARD'
                    ? 'border-[#244B2B] dark:border-[#D4AF37] bg-[#244B2B]/5 dark:bg-[#D4AF37]/10 ring-2 ring-[#244B2B] dark:ring-[#D4AF37] shadow-sm'
                    : 'border-[#E9E5DD] dark:border-[#28392B] bg-[#FBF9F4]/40 dark:bg-[#141F17] hover:border-[#D4AF37]/60'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${paymentMethod === 'CARD' ? 'bg-[#244B2B] text-[#D4AF37]' : 'bg-[#E9E5DD]/60 dark:bg-[#203024] text-[#596B5E]'}`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <div className="font-bold text-sm text-[#1C261E] dark:text-[#F5F2EA]">
                    {isRu ? 'Click / Перевод на карту' : 'Click / Karta o‘tkazmasi'}
                  </div>
                  <div className="text-[11px] text-[#596B5E] dark:text-[#A6B7AA] mt-0.5">
                    {isRu ? 'Оператор позвонит и предоставит реквизиты' : 'Operator telefon qilib kelishadi'}
                  </div>
                </div>
                {paymentMethod === 'CARD' && (
                  <CheckCircle2 className="w-4 h-4 text-[#244B2B] dark:text-[#E5C358] absolute top-3.5 right-3.5" />
                )}
              </button>
            </div>

            {/* Operator bog'lanishi haqida eslatma */}
            <div className="p-3.5 rounded-2xl bg-[#244B2B]/5 dark:bg-[#203024]/60 border border-[#244B2B]/15 dark:border-[#334D3A] flex items-start gap-3 text-xs text-[#244B2B] dark:text-[#C5D7C9]">
              <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#244B2B] dark:text-[#D4AF37]" />
              <div className="leading-relaxed">
                <strong className="text-[#1C261E] dark:text-[#F5F2EA]">{isRu ? 'Звонок сотрудника Mo‘jiza 777:' : 'Mo‘jiza 777 xodimi bog‘lanishi:'}</strong>{' '}
                {isRu
                  ? 'Сразу после оформления заказа наш оператор позвонит вам. Вы сможете подтвердить заказ и оплатить удобным способом — наличными при получении или перевести через Click/Payme.'
                  : 'Buyurtma tushishi bilan botga qaraydigan xodimimiz sizga telefon qilib bog‘lanadi. To‘lovni xohlasangiz kuryerga naqd berasiz, xohlasangiz o‘sha vaqtda Click orqali kelishib o‘tkazib beraverasiz.'}
              </div>
            </div>

            {/* Qo'shimcha izoh */}
            <div>
              <label className="block text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{t('comment')}</span>
              </label>
              <textarea
                rows={2}
                maxLength={500}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('commentPlaceholder')}
                className="w-full px-4 py-3 rounded-2xl border border-[#E9E5DD] dark:border-[#28392B] text-xs sm:text-sm focus:outline-none focus:border-[#244B2B] dark:focus:border-[#D4AF37] focus:ring-2 focus:ring-[#244B2B]/10 dark:focus:ring-[#D4AF37]/20 bg-[#FBF9F4]/40 dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] transition-all"
              />
            </div>
          </div>

        </div>

        {/* O'ng qism: Buyurtma xulosasi va Promokod */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-28 bg-[#FBF9F4] dark:bg-[#1A281E] rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] p-5 sm:p-6 shadow-sm space-y-5">
            <h2 className="font-serif font-black text-lg sm:text-xl text-[#1C261E] dark:text-[#F5F2EA]">
              {t('orderSummary')}
            </h2>

            {/* Savatdagi mahsulotlar qisqacha ro'yxati */}
            <div className="max-h-60 overflow-y-auto divide-y divide-[#E9E5DD] dark:divide-[#28392B] pr-1 scrollbar-thin">
              {items.map((item) => (
                <div key={item.productId} className="py-2.5 flex items-center justify-between text-xs gap-3">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#F4EFE6] dark:bg-[#141F17] flex-shrink-0 border border-[#E9E5DD]/60">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="40px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px]">🍰</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-[#1C261E] dark:text-[#F5F2EA] truncate">{item.name}</div>
                    <div className="text-[11px] text-[#596B5E] dark:text-[#A6B7AA]">
                      {formatQuantity(item.quantity, item.unitType, locale)} × {formatCurrency(item.price, locale)}
                    </div>
                  </div>
                  <div className="font-serif font-black text-xs text-[#244B2B] dark:text-[#E5C358] flex-shrink-0">
                    {formatCurrency(item.price * item.quantity, locale)}
                  </div>
                </div>
              ))}
            </div>

            {/* Promokod kiritish bloki */}
            <div className="pt-3 border-t border-[#E9E5DD] dark:border-[#28392B] space-y-2">
              <label className="block text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{isRu ? 'Промокод на скидку:' : 'Chegirma promokodi:'}</span>
              </label>
              
              {appliedPromo ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <strong className="tracking-wider">{appliedPromo}</strong>
                      <span className="block text-[10px] text-emerald-700 dark:text-emerald-400">
                        {isRu ? `Скидка: -${formatCurrency(discountAmount, locale)}` : `Chegirma: -${formatCurrency(discountAmount, locale)}`}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg text-emerald-600 dark:text-emerald-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="Masalan: MUJIZA777"
                    className="flex-1 px-3 py-2 text-xs uppercase font-bold rounded-xl border border-[#E9E5DD] dark:border-[#28392B] bg-white dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] focus:outline-none focus:border-[#244B2B] dark:focus:border-[#D4AF37]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={promoLoading || !promoInput.trim()}
                    className="px-4 py-2 rounded-xl bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] text-xs font-bold hover:bg-[#1A3720] dark:hover:bg-[#E5C358] disabled:opacity-40 transition-all shadow-xs"
                  >
                    {promoLoading ? '...' : (isRu ? 'Применить' : 'Qo‘llash')}
                  </button>
                </div>
              )}

              {promoError && (
                <span className="text-[11px] text-[#B83A3A] block font-medium">{promoError}</span>
              )}
            </div>

            {/* Summalar */}
            <div className="pt-3 border-t border-[#E9E5DD] dark:border-[#28392B] space-y-2 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-[#596B5E] dark:text-[#A6B7AA]">
                <span>{isRu ? 'Стоимость товаров:' : 'Mahsulotlar:'}</span>
                <span className="font-semibold text-[#1C261E] dark:text-[#F5F2EA]">{formatCurrency(summary.itemsTotal, locale)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                  <span>{isRu ? 'Скидка по промокоду:' : 'Promokod chegirmasi:'}</span>
                  <span>-{formatCurrency(discountAmount, locale)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[#596B5E] dark:text-[#A6B7AA]">
                <span>{isRu ? 'Доставка:' : 'Yetkazib berish:'}</span>
                <span className="font-semibold text-[#1C261E] dark:text-[#F5F2EA]">
                  {orderType === 'PICKUP' ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{isRu ? 'Самовывоз (0 сум)' : 'Olib ketish (0 so‘m)'}</span>
                  ) : summary.deliveryFee === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{isRu ? 'Бесплатно' : 'Bepul'}</span>
                  ) : (
                    formatCurrency(summary.deliveryFee, locale)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-[#E9E5DD] dark:border-[#28392B] flex items-baseline justify-between">
                <span className="text-base font-bold text-[#1C261E] dark:text-[#F5F2EA]">{tc('total')}</span>
                <span className="font-serif font-black text-2xl sm:text-3xl text-[#244B2B] dark:text-[#E5C358]">
                  {formatCurrency(finalCalculatedTotal, locale)}
                </span>
              </div>
            </div>

            {/* Yuborish tugmasi */}
            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="w-full py-4 rounded-2xl bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] hover:bg-[#1A3720] dark:hover:bg-[#E5C358] font-bold text-sm sm:text-base shadow-lg hover:shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37] dark:text-[#0F1712]" />
                  <span>{t('submitting')}</span>
                </>
              ) : (
                <>
                  <span>{t('submitOrder')}</span>
                  <ArrowRight className="w-5 h-5 text-[#D4AF37] dark:text-[#0F1712]" />
                </>
              )}
            </button>

            <div className="flex items-center gap-1.5 text-[11px] text-[#596B5E] dark:text-[#A6B7AA] justify-center pt-1 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{t('disclaimer')}</span>
            </div>
          </div>
        </div>

      </form>

      {/* Mobil Doimiy Harakat Paneli (Sticky Bottom Bar) */}
      <div className="lg:hidden fixed bottom-[57px] left-0 right-0 z-30 bg-white/95 dark:bg-[#141F17]/95 backdrop-blur-xl border-t border-[#E9E5DD] dark:border-[#28392B] px-4 py-3 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2">
        <div className="min-w-0">
          <span className="text-[10px] text-[#596B5E] dark:text-[#A6B7AA] uppercase font-bold block">
            {tc('total')}
          </span>
          <div className="font-serif font-black text-base text-[#244B2B] dark:text-[#E5C358] leading-tight truncate">
            {formatCurrency(finalCalculatedTotal, locale)}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmitOrder}
          disabled={isSubmitting || items.length === 0}
          className="py-3 px-6 rounded-2xl bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg active:scale-95 transition-all whitespace-nowrap disabled:bg-gray-300"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37] dark:text-[#0F1712]" />
              <span>{isRu ? 'Оформляем...' : 'Yuborilmoqda...'}</span>
            </>
          ) : (
            <>
              <span>{isRu ? 'Подтвердить заказ' : 'Buyurtmani tasdiqlash'}</span>
              <ArrowRight className="w-4 h-4 text-[#D4AF37] dark:text-[#0F1712]" />
            </>
          )}
        </button>
      </div>

    </div>
  );
}

export default CheckoutView;

