'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  PackageCheck, 
  Truck, 
  XCircle, 
  Phone, 
  Printer, 
  RefreshCw, 
  Filter, 
  AlertCircle,
  MapPin,
  Store,
  ChevronDown,
  Volume2,
  Gift,
  Cake,
  Tag,
  Calendar,
  Eye,
  FileSpreadsheet,
  Search,
  X,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { Order, OrderStatus, OrderType } from '../../lib/api/types';
import { formatCurrency, formatQuantity } from '../../lib/format';
import { playNewOrderChime } from '../../lib/audio';
import { apiClient } from '../../lib/api/client';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);

  // Price confirmation modal state
  const [confirmPriceModalOrder, setConfirmPriceModalOrder] = useState<Order | null>(null);
  const [finalPriceInput, setFinalPriceInput] = useState<string>('');
  const [priceNoteInput, setPriceNoteInput] = useState<string>('');
  const [isConfirmingPrice, setIsConfirmingPrice] = useState(false);

  // Image zoom preview state
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const prevOrderCountRef = useRef(0);

  // Buyurtmalarni yuklash
  const fetchOrders = async () => {
    try {
      const data = await apiClient<{ content: Order[] } | Order[]>('/api/admin/orders?size=100');
      const orderList: Order[] = Array.isArray(data) ? data : data?.content || [];
      
      // Yangi buyurtma kelgan bo'lsa ovoz chalish
      if (orderList.length > prevOrderCountRef.current && prevOrderCountRef.current > 0) {
        playNewOrderChime();
      }
      prevOrderCountRef.current = orderList.length;

      setOrders(orderList);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // 10 soniyada yangilab turish
    return () => clearInterval(interval);
  }, []);

  // Holatni o'zgartirish (Status transition)
  const handleUpdateStatus = async (order: Order, nextStatus: OrderStatus) => {
    if (!order.id) {
      window.alert('Buyurtma ID si topilmadi. Ro‘yxatni yangilang.');
      return;
    }
    try {
      await apiClient(`/api/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchOrders();
    } catch (error) {
      window.alert((error as { message?: string })?.message || 'Buyurtma holatini saqlab bo‘lmadi.');
    }
  };

  // Narxni tasdiqlash modalini ochish
  const openConfirmPriceModal = (order: Order) => {
    setConfirmPriceModalOrder(order);
    const initialPrice = order.cake?.calculatedPrice || order.totalAmount;
    setFinalPriceInput(initialPrice.toString());
    setPriceNoteInput(order.cake?.priceNote || '');
  };

  // Narxni tasdiqlash va buyurtmani CONFIRMED holatiga o'tkazish
  const handleConfirmPriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmPriceModalOrder) return;

    setIsConfirmingPrice(true);
    const finalAmount = Number(finalPriceInput) || confirmPriceModalOrder.cake?.calculatedPrice || confirmPriceModalOrder.totalAmount;

    if (!confirmPriceModalOrder.id) {
      window.alert('Buyurtma ID si topilmadi. Ro‘yxatni yangilang.');
      setIsConfirmingPrice(false);
      return;
    }

    try {
      await apiClient(`/api/admin/orders/${confirmPriceModalOrder.id}/confirm-price`, {
        method: 'PATCH',
        body: JSON.stringify({
          finalPrice: finalAmount,
          note: priceNoteInput.trim() || undefined,
        }),
      });
      fetchOrders();
      setConfirmPriceModalOrder(null);
    } catch (error) {
      window.alert((error as { message?: string })?.message || 'Tort narxini tasdiqlab bo‘lmadi.');
    } finally {
      setIsConfirmingPrice(false);
    }
  };

  // Excel eksport qilish
  const handleExportExcel = async () => {
    try {
      const query = activeTab !== 'ALL' ? `?status=${activeTab}` : '';
      const response = await fetch(`/api/admin/orders/export${query}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mujiza_orders_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }
    } catch {}

    // Fallback CSV eksport
    const rows = [
      ['Raqam', 'Sana', 'Mijoz', 'Telefon', 'Turi', 'Holat', 'Jami Summa', 'Promokod', 'Sovg\'a', 'Vaqt Oynasi'],
      ...filteredOrders.map((o) => [
        o.orderNumber,
        new Date(o.createdAt).toLocaleString('uz-UZ'),
        `"${o.customerName}"`,
        o.recipientPhone || '',
        o.orderType,
        o.status,
        o.totalAmount,
        o.promoCode || '',
        o.isGift ? 'Ha' : 'Yo\'q',
        o.scheduledDate ? `${o.scheduledDate} (${o.slotStart || ''}-${o.slotEnd || ''})` : '',
      ]),
    ];

    const csvContent = '\uFEFF' + rows.map((e) => e.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `mujiza_buyurtmalar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = (order: Order) => {
    setSelectedOrderForPrint(order);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Filtrlash va qidiruv
  const filteredOrders = orders.filter((o) => {
    if (activeTab !== 'ALL' && o.status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchCustomer = o.customerName.toLowerCase().includes(q);
      const matchRecipient = o.recipientName?.toLowerCase().includes(q);
      const matchAddress = o.deliveryAddress?.toLowerCase().includes(q);
      const matchCake = o.cake?.typeName.toLowerCase().includes(q);
      return matchNum || matchCustomer || matchRecipient || matchAddress || matchCake;
    }
    return true;
  });

  const newOrdersCount = orders.filter((o) => o.status === 'NEW').length;
  const pricePendingCount = orders.filter((o) => o.status === 'PRICE_PENDING').length;

  return (
    <div className="space-y-6">
      
      {/* Sarlavha, Excel yuklash va Yangilash */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E9E5DD]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#1C261E] tracking-tight">
              Buyurtmalar boshqaruvi
            </h1>
            {pricePendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-900 border border-purple-200 animate-pulse">
                {pricePendingCount} ta tort tasdiq kutilmoqda
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#596B5E] mt-0.5">
            Real vaqt rejimida barcha onlayn va maxsus buyurtmalar oqimi
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportExcel}
            className="p-2.5 rounded-xl bg-white border border-[#E9E5DD] text-[#244B2B] hover:bg-[#F4EFE6] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            title="Buyurtmalar ro‘yxatini Excel (.xlsx) formatida saqlash"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Excelga yuklash</span>
          </button>

          <button
            onClick={() => playNewOrderChime()}
            className="p-2.5 rounded-xl bg-white border border-[#E9E5DD] text-[#244B2B] hover:bg-[#F4EFE6] text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            title="Tovushni sinab ko'rish"
          >
            <Volume2 className="w-4 h-4 text-[#D4AF37]" />
            <span className="hidden sm:inline">Tovush</span>
          </button>

          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl bg-[#244B2B] text-white hover:bg-[#1A3720] shadow-sm flex items-center gap-2 text-xs font-bold transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Yangilash</span>
          </button>
        </div>
      </div>

      {/* Qidiruv qatori */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#8C9B90] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buyurtma raqami, mijoz ismi, sovg‘a oluvchi yoki manzil bo‘yicha qidirish..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#E9E5DD] text-xs sm:text-sm focus:outline-none focus:border-[#244B2B] shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Holatlar filtri (Status Tabs) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { key: 'ALL', label: 'Barchasi', count: orders.length },
          { key: 'NEW', label: 'Yangi', count: newOrdersCount, isHot: true },
          { key: 'PRICE_PENDING', label: 'Narx kutilmoqda', count: pricePendingCount, isPurple: true },
          { key: 'CONFIRMED', label: 'Qabul qilindi', count: orders.filter((o) => o.status === 'CONFIRMED').length },
          { key: 'PREPARING', label: 'Tayyorlanmoqda', count: orders.filter((o) => o.status === 'PREPARING').length },
          { key: 'READY', label: 'Tayyor', count: orders.filter((o) => o.status === 'READY').length },
          { key: 'DELIVERING', label: 'Yo‘lda', count: orders.filter((o) => o.status === 'DELIVERING').length },
          { key: 'COMPLETED', label: 'Topshirildi', count: orders.filter((o) => o.status === 'COMPLETED').length },
          { key: 'CANCELLED', label: 'Bekor qilindi', count: orders.filter((o) => o.status === 'CANCELLED').length },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold flex-shrink-0 transition-all ${
                isActive
                  ? 'bg-[#244B2B] text-white shadow-md'
                  : 'bg-white border border-[#E9E5DD] text-[#1C261E] hover:border-[#D4AF37]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  tab.isPurple && tab.count > 0
                    ? 'bg-purple-600 text-white animate-pulse'
                    : tab.isHot && tab.count > 0
                    ? 'bg-[#B83A3A] text-white animate-pulse'
                    : isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-[#F4EFE6] text-[#596B5E]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Buyurtmalar ro'yxati */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#E9E5DD]">
            <ShoppingBag className="w-12 h-12 text-[#8C9B90] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#1C261E]">Ushbu mezon bo‘yicha buyurtmalar topilmadi</h3>
            <p className="text-xs text-[#596B5E] mt-1">Filtr parametrlarini o‘zgartirib ko‘ring</p>
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const isNew = ord.status === 'NEW';
            const isPricePending = ord.status === 'PRICE_PENDING';
            const isDelivery = ord.orderType === 'DELIVERY';
            const hasCake = !!ord.cake;

            return (
              <div
                key={ord.orderNumber}
                className={`bg-white rounded-3xl border p-5 sm:p-6 shadow-sm transition-all ${
                  isPricePending
                    ? 'border-purple-300 ring-2 ring-purple-300/40 bg-purple-50/20'
                    : isNew
                    ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/30 bg-[#FDFBF7]'
                    : 'border-[#E9E5DD]'
                }`}
              >
                {/* Header bloki: Raqam, Belgilar va Narx */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E9E5DD]">
                  
                  {/* Buyurtma raqami va Mijoz */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                        isPricePending
                          ? 'bg-purple-600 text-white'
                          : isNew
                          ? 'bg-[#D4AF37] text-[#1C261E] animate-pulse'
                          : 'bg-[#244B2B] text-white'
                      }`}
                    >
                      {hasCake ? <Cake className="w-6 h-6" /> : isDelivery ? <Truck className="w-6 h-6" /> : <Store className="w-6 h-6" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base sm:text-lg font-black text-[#1C261E]">
                          {ord.orderNumber}
                        </span>

                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#244B2B]/10 text-[#244B2B]">
                          {isDelivery ? 'Yetkazib berish' : 'Olib ketish'}
                        </span>

                        {hasCake && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
                            <Cake className="w-3.5 h-3.5 text-purple-600" />
                            <span>Maxsus Tort</span>
                          </span>
                        )}

                        {ord.isGift && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                            <Gift className="w-3.5 h-3.5 text-rose-600" />
                            <span>Sovg‘a</span>
                          </span>
                        )}

                        {ord.scheduledDate && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-amber-700" />
                            <span>
                              {ord.scheduledDate} {ord.slotStart && `(${ord.slotStart} - ${ord.slotEnd})`}
                            </span>
                          </span>
                        )}

                        {ord.pickupCode && (
                          <span className="text-xs font-mono font-bold bg-[#D4AF37]/20 text-[#1C261E] px-2 py-0.5 rounded-md">
                            Kod: {ord.pickupCode}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-[#596B5E] mt-1.5 flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-[#1C261E]">Mijoz: {ord.customerName}</span>
                        {ord.customerPhone && (
                          <a
                            href={`tel:${ord.customerPhone.replace(/\s+/g, '')}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold hover:bg-emerald-100 active:scale-95 transition-all"
                            title="Mijozga qo‘ng‘iroq qilish"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{ord.customerPhone}</span>
                          </a>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#8C9B90]" />
                          <span>{new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(ord.createdAt).toLocaleDateString()})</span>
                        </span>
                        {ord.promoCode && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              <span>{ord.promoCode} (-{formatCurrency(ord.discountAmount || 0, 'uz')})</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Narx va Chek chiqarish */}
                  <div className="flex items-center justify-between lg:justify-end gap-4">
                    <div className="text-left lg:text-right">
                      <div className="text-[10px] uppercase font-bold text-[#8C9B90]">
                        {isPricePending ? 'Hisoblangan summa:' : 'Jami summa:'}
                      </div>
                      <div className={`text-lg sm:text-xl font-black ${isPricePending ? 'text-purple-700' : 'text-[#244B2B]'}`}>
                        {formatCurrency(ord.totalAmount, 'uz')}
                      </div>
                      {isPricePending && (
                        <span className="text-[10px] text-purple-600 font-bold">Tasdiq talab etiladi</span>
                      )}
                    </div>

                    <button
                      onClick={() => handlePrint(ord)}
                      className="p-2.5 rounded-xl border border-[#E9E5DD] hover:bg-[#F4EFE6] text-[#1C261E] flex items-center gap-1.5 text-xs font-bold shadow-sm"
                      title="80mm chek chiqarish"
                    >
                      <Printer className="w-4 h-4 text-[#244B2B]" />
                      <span className="hidden sm:inline">Chek</span>
                    </button>
                  </div>
                </div>

                {/* Tafsilotlar: Sovg'a bloki (agar sovg'a bo'lsa) */}
                {ord.isGift && (
                  <div className="mt-4 p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 text-xs text-rose-950 space-y-1.5">
                    <div className="font-black flex items-center gap-1.5 text-rose-800">
                      <Gift className="w-4 h-4 text-rose-600" />
                      <span>Sovg‘a buyurtmasi tafsilotlari</span>
                      {ord.isAnonymousGift && (
                        <span className="ml-2 px-2 py-0.5 rounded-md bg-rose-200/80 text-rose-900 text-[10px] font-bold">
                          Anonim jo‘natuvchi
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-rose-900">
                      <div>
                        <strong>Qabul qiluvchi:</strong> {ord.recipientName || 'Kiritilmagan'}
                      </div>
                      <div>
                        <strong>Telefon:</strong>{' '}
                        {ord.recipientPhone ? (
                          <a
                            href={`tel:${ord.recipientPhone.replace(/\s+/g, '')}`}
                            className="inline-flex items-center gap-1 font-bold text-rose-800 underline hover:text-rose-950 active:scale-95 transition-all"
                            title="Qabul qiluvchiga qo‘ng‘iroq qilish"
                          >
                            <Phone className="w-3 h-3 inline text-rose-600" />
                            <span>{ord.recipientPhone}</span>
                          </a>
                        ) : (
                          'Kiritilmagan'
                        )}
                      </div>
                    </div>
                    {ord.giftMessage && (
                      <div className="pt-1 italic border-t border-rose-200 text-rose-800">
                        &quot;{ord.giftMessage}&quot;
                      </div>
                    )}
                  </div>
                )}

                {/* Tafsilotlar: Maxsus Tort Bloki (agar tort bo'lsa) */}
                {ord.cake && (
                  <div className="mt-4 p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs text-purple-950 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="font-black flex items-center gap-1.5 text-purple-900">
                        <Cake className="w-4 h-4 text-purple-700" />
                        <span>Konstruktor orqali buyurtma qilingan maxsus tort</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {ord.cake.priceConfirmed ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Narx tasdiqlangan: {formatCurrency(ord.cake.finalPrice || 0, 'uz')}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">
                            Narx kutilmoqda (Hisoblangan: {formatCurrency(ord.cake.calculatedPrice, 'uz')})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <div className="text-purple-700 font-bold">Tort turi va vazni:</div>
                        <div className="font-black text-[#1C261E]">{ord.cake.typeName} ({ord.cake.weightKg} kg)</div>
                        {ord.cake.inscription && (
                          <div className="mt-1">
                            <span className="text-purple-700 font-bold">Yozuv:</span>{' '}
                            <span className="italic font-bold">&quot;{ord.cake.inscription}&quot;</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="text-purple-700 font-bold">Tanlangan parametrlar:</div>
                        <div className="space-y-0.5 mt-0.5">
                          {ord.cake.options.map((opt, idx) => (
                            <div key={idx} className="flex justify-between text-[#1C261E]">
                              <span>• {opt.name}</span>
                              <span className="font-semibold text-purple-800">
                                {opt.amount > 0 ? `+${formatCurrency(opt.amount, 'uz')}` : 'bepul'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {ord.cake.referenceImageUrl && (
                        <div>
                          <div className="text-purple-700 font-bold mb-1">Mijoz namunasi (Rasm):</div>
                          <div className="relative group w-20 h-20 rounded-xl overflow-hidden border border-purple-300 shadow-sm">
                            <Image
                              src={ord.cake.referenceImageUrl}
                              alt="Namuna"
                              fill
                              unoptimized
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setPreviewImage(ord.cake?.referenceImageUrl || null)}
                              className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                              title="Kattalashtirib ko‘rish"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {ord.cake.priceNote && (
                      <div className="p-2 rounded-lg bg-white/80 border border-purple-200 text-purple-900 text-[11px]">
                        <strong>Do‘kon izohi:</strong> {ord.cake.priceNote}
                      </div>
                    )}
                  </div>
                )}

                {/* Manzil va Standart Mahsulotlar jadvali */}
                <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-[#8C9B90] font-bold mb-1">Yetkazish manzili / Filial:</div>
                    <div className="text-[#1C261E] font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#244B2B] flex-shrink-0" />
                      <span>{isDelivery ? ord.deliveryAddress : ord.branchName}</span>
                    </div>

                    {ord.comment && (
                      <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                        <strong>Mijoz izohi:</strong> {ord.comment}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-[#8C9B90] font-bold mb-1">Tarkibi:</div>
                    <div className="space-y-1">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-[#1C261E]">
                          <span>
                            {item.name} × <strong>{formatQuantity(item.quantity, item.unitType, 'uz')}</strong>
                          </span>
                          <span className="font-semibold">{formatCurrency(item.lineTotal, 'uz')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Holat o'zgartirish va Harakatlar Paneli (Mobil uchun qulay moslashgan) */}
                <div className="pt-4 border-t border-[#E9E5DD] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs flex items-center justify-between sm:justify-start gap-2">
                    <span className="text-[#8C9B90]">Joriy bosqich: </span>
                    <strong className={`font-black px-2.5 py-1 rounded-xl text-xs ${
                      isPricePending 
                        ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                        : isNew
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-[#244B2B]/10 text-[#244B2B]'
                    }`}>
                      {ord.status}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                    {/* PRICE_PENDING: Narxni tasdiqlash tugmasi */}
                    {isPricePending && (
                      <button
                        onClick={() => openConfirmPriceModal(ord)}
                        className="w-full sm:w-auto justify-center py-2.5 px-4 rounded-xl bg-purple-600 text-white hover:bg-purple-700 font-bold text-xs shadow-md flex items-center gap-1.5 transition-all animate-pulse active:scale-95"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        <span>Narxni tasdiqlash</span>
                      </button>
                    )}

                    {/* NEW: Tasdiqlash */}
                    {ord.status === 'NEW' && (
                      <button
                        onClick={() => handleUpdateStatus(ord, 'CONFIRMED')}
                        className="w-full sm:w-auto justify-center py-2.5 px-4 rounded-xl bg-[#244B2B] text-white hover:bg-[#1A3720] font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Tasdiqlash</span>
                      </button>
                    )}

                    {/* CONFIRMED: Oshxonaga yuborish */}
                    {ord.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleUpdateStatus(ord, 'PREPARING')}
                        className="w-full sm:w-auto justify-center py-2.5 px-4 rounded-xl bg-[#AA820A] text-white hover:bg-[#8D6B08] font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Tayyorlashga yuborish</span>
                      </button>
                    )}

                    {/* PREPARING: Tayyor bo'ldi */}
                    {ord.status === 'PREPARING' && (
                      <button
                        onClick={() => handleUpdateStatus(ord, 'READY')}
                        className="w-full sm:w-auto justify-center py-2.5 px-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>Tayyor bo‘ldi</span>
                      </button>
                    )}

                    {/* READY (Yetkazish bo'lsa): Kuryer yo'lga chiqdi */}
                    {ord.status === 'READY' && isDelivery && (
                      <button
                        onClick={() => handleUpdateStatus(ord, 'DELIVERING')}
                        className="w-full sm:w-auto justify-center py-2.5 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Kuryer yo‘lga chiqdi</span>
                      </button>
                    )}

                    {/* READY yoki DELIVERING: Topshirildi (Yakunlash) */}
                    {(ord.status === 'READY' || ord.status === 'DELIVERING') && (
                      <button
                        onClick={() => handleUpdateStatus(ord, 'COMPLETED')}
                        className="w-full sm:w-auto justify-center py-2.5 px-4 rounded-xl bg-green-700 text-white hover:bg-green-800 font-bold text-xs shadow-sm transition-all active:scale-95"
                      >
                        Topshirildi (Yakunlash)
                      </button>
                    )}

                    {/* Bekor qilish */}
                    {ord.status !== 'COMPLETED' && ord.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleUpdateStatus(ord, 'CANCELLED')}
                        className="w-full sm:w-auto justify-center py-2 px-3 rounded-xl border border-red-200 text-[#B83A3A] hover:bg-red-50 font-bold text-xs transition-all active:scale-95"
                      >
                        Bekor qilish
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Narxni tasdiqlash Modali (Confirm Price Modal) */}
      {confirmPriceModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#E9E5DD] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E5DD]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1C261E]">Tort narxini tasdiqlash</h3>
                  <div className="text-xs text-[#596B5E]">Buyurtma #{confirmPriceModalOrder.orderNumber}</div>
                </div>
              </div>
              <button
                onClick={() => setConfirmPriceModalOrder(null)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Qisqacha tort ma'lumoti */}
            <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs text-purple-950 space-y-1">
              <div>
                <strong>Mijoz:</strong> {confirmPriceModalOrder.customerName}
              </div>
              <div>
                <strong>Tort:</strong> {confirmPriceModalOrder.cake?.typeName} ({confirmPriceModalOrder.cake?.weightKg} kg)
              </div>
              <div>
                <strong>Hisoblangan dastlabki narx:</strong>{' '}
                <span className="font-bold text-purple-700">
                  {formatCurrency(confirmPriceModalOrder.cake?.calculatedPrice || confirmPriceModalOrder.totalAmount, 'uz')}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmPriceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1C261E] mb-1.5">
                  Yakuniy narx (so‘m) *
                </label>
                <input
                  type="number"
                  required
                  value={finalPriceInput}
                  onChange={(e) => setFinalPriceInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-base font-black text-[#244B2B] focus:outline-none focus:border-[#244B2B]"
                  placeholder="Masalan: 450000"
                />
                <p className="text-[11px] text-[#596B5E] mt-1">
                  Mijoz kuzatuv sahifasida ushbu yakuniy summa ko‘rsatiladi va buyurtma &quot;Qabul qilindi&quot; (CONFIRMED) holatiga o‘tadi.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C261E] mb-1.5">
                  Mijoz uchun izoh (ixtiyoriy)
                </label>
                <textarea
                  rows={2}
                  value={priceNoteInput}
                  onChange={(e) => setPriceNoteInput(e.target.value)}
                  placeholder="Masalan: Murakkab marzipan shakllari va maxsus bezaklar hisobiga narx tasdiqlandi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-xs focus:outline-none focus:border-[#244B2B]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmPriceModalOrder(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#E9E5DD] text-xs font-bold text-[#596B5E] hover:bg-gray-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isConfirmingPrice}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isConfirmingPrice ? 'Tasdiqlanmoqda...' : 'Tasdiqlash va qabul qilish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rasm kattalashtirish Modali (Zoom Reference Image) */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-2xl w-full bg-white rounded-3xl p-4 shadow-2xl overflow-hidden">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="max-h-[80vh] overflow-auto rounded-2xl">
              <Image
                src={previewImage}
                alt="Namuna rasm"
                width={800}
                height={600}
                unoptimized
                className="w-full h-auto object-contain rounded-2xl"
              />
            </div>
            <div className="pt-3 text-center text-xs text-[#596B5E] font-medium">
              Mijoz tomonidan yuklangan maxsus tort namunasi
            </div>
          </div>
        </div>
      )}

      {/* 80mm Kvitansiya (Thermal Receipt Print Component) */}
      {selectedOrderForPrint && (
        <div id="receipt-print-area" className="hidden print:block font-mono text-black p-2 text-xs max-w-[80mm] mx-auto">
          <div className="text-center pb-2 border-b border-black">
            <div className="text-base font-bold">MO‘JIZA 777</div>
            <div>Qarshi shahri, Shirinliklar uyi</div>
            <div>Tel: +998 93 706 73 21</div>
          </div>

          <div className="py-2 border-b border-black">
            <div><strong>Buyurtma:</strong> {selectedOrderForPrint.orderNumber}</div>
            <div><strong>Sana:</strong> {new Date(selectedOrderForPrint.createdAt).toLocaleString()}</div>
            <div><strong>Mijoz:</strong> {selectedOrderForPrint.customerName}</div>
            <div><strong>Turi:</strong> {selectedOrderForPrint.orderType === 'DELIVERY' ? 'Yetkazish' : 'Olib ketish'}</div>
            {selectedOrderForPrint.pickupCode && <div><strong>KOD:</strong> {selectedOrderForPrint.pickupCode}</div>}
            {selectedOrderForPrint.deliveryAddress && <div><strong>Manzil:</strong> {selectedOrderForPrint.deliveryAddress}</div>}
            {selectedOrderForPrint.scheduledDate && (
              <div><strong>Vaqt:</strong> {selectedOrderForPrint.scheduledDate} ({selectedOrderForPrint.slotStart}-{selectedOrderForPrint.slotEnd})</div>
            )}
            {selectedOrderForPrint.isGift && (
              <div><strong>SOVG‘A:</strong> {selectedOrderForPrint.recipientName} ({selectedOrderForPrint.recipientPhone})</div>
            )}
          </div>

          <div className="py-2 border-b border-black">
            <div className="font-bold mb-1">TARKIBI:</div>
            {selectedOrderForPrint.items.map((i, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{i.name} ({formatQuantity(i.quantity, i.unitType, 'uz')})</span>
                <span>{formatCurrency(i.lineTotal, 'uz')}</span>
              </div>
            ))}
            {selectedOrderForPrint.cake && (
              <div className="mt-1 pt-1 border-t border-dashed border-black">
                <div>* Tort: {selectedOrderForPrint.cake.typeName} ({selectedOrderForPrint.cake.weightKg} kg)</div>
                {selectedOrderForPrint.cake.inscription && (
                  <div>* Yozuv: &quot;{selectedOrderForPrint.cake.inscription}&quot;</div>
                )}
              </div>
            )}
          </div>

          {selectedOrderForPrint.discountAmount && selectedOrderForPrint.discountAmount > 0 ? (
            <div className="py-1 flex justify-between text-xs">
              <span>Chegirma ({selectedOrderForPrint.promoCode}):</span>
              <span>-{formatCurrency(selectedOrderForPrint.discountAmount, 'uz')}</span>
            </div>
          ) : null}

          <div className="py-2 text-sm font-bold flex justify-between">
            <span>JAMI:</span>
            <span>{formatCurrency(selectedOrderForPrint.totalAmount, 'uz')}</span>
          </div>

          <div className="text-center pt-3 text-[10px]">
            <div>Xaridingiz uchun tashakkur!</div>
            <div>www.mujiza777.uz</div>
          </div>
        </div>
      )}

    </div>
  );
}
