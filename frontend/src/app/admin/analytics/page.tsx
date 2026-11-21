'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Truck, 
  Store, 
  Cake, 
  Gift, 
  Clock, 
  Calendar, 
  RefreshCw,
  Award,
  ChevronRight
} from 'lucide-react';
import { AnalyticsSummary, DailyPoint, HourPoint, TopProduct } from '../../../lib/api/types';
import { formatCurrency, formatQuantity } from '../../../lib/format';
import { apiClient } from '../../../lib/api/client';

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<'today' | '7days' | '30days' | 'custom'>('30days');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [dailyData, setDailyData] = useState<DailyPoint[]>([]);
  const [hourlyData, setHourlyData] = useState<HourPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  // Calculate dates based on period
  const getDateRange = useCallback(() => {
    const to = new Date();
    const from = new Date();

    if (period === 'today') {
      // today
    } else if (period === '7days') {
      from.setDate(from.getDate() - 7);
    } else if (period === '30days') {
      from.setDate(from.getDate() - 30);
    } else if (period === 'custom') {
      return {
        from: customFrom || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
        to: customTo || new Date().toISOString().slice(0, 10),
      };
    }

    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    };
  }, [period, customFrom, customTo]);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    const { from, to } = getDateRange();

    try {
      const [sumRes, dailyRes, hourRes, topRes] = await Promise.all([
        apiClient<AnalyticsSummary>(`/api/admin/analytics/summary?from=${from}&to=${to}`),
        apiClient<DailyPoint[]>(`/api/admin/analytics/daily?from=${from}&to=${to}`),
        apiClient<HourPoint[]>(`/api/admin/analytics/hourly?from=${from}&to=${to}`),
        apiClient<TopProduct[]>(`/api/admin/analytics/top-products?limit=10`),
      ]);

      if (sumRes) setSummary(sumRes);
      if (Array.isArray(dailyRes)) setDailyData(dailyRes);
      if (Array.isArray(hourRes)) setHourlyData(hourRes);
      if (Array.isArray(topRes)) setTopProducts(topRes);
    } catch {
      setSummary(null);
      setDailyData([]);
      setHourlyData([]);
      setTopProducts([]);
      window.alert('Analitika ma’lumotlarini serverdan yuklab bo‘lmadi.');
    } finally {
      setIsLoading(false);
    }
  }, [getDateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const maxDailyRevenue = Math.max(...dailyData.map((d) => d.revenue), 1);
  const maxHourlyOrders = Math.max(...hourlyData.map((h) => h.orders), 1);

  return (
    <div className="space-y-6">
      
      {/* Sarlavha va Davr Tanlagich */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E9E5DD]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C261E] tracking-tight">
            Savdo tahlili va Statistika
          </h1>
          <p className="text-xs sm:text-sm text-[#596B5E] mt-0.5">
            Tushum, faol buyurtmalar dinamikasi va xaridlar oqimi hisoboti
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="bg-white p-1 rounded-2xl border border-[#E9E5DD] flex items-center shadow-sm overflow-x-auto max-w-full">
            {[
              { id: 'today', label: 'Bugun' },
              { id: '7days', label: '7 kun' },
              { id: '30days', label: '30 kun' },
              { id: 'custom', label: 'Boshqa' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setPeriod(t.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                  period === t.id
                    ? 'bg-[#244B2B] text-white shadow-sm'
                    : 'text-[#596B5E] hover:text-[#1C261E]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            className="p-2.5 rounded-2xl bg-white border border-[#E9E5DD] text-[#244B2B] hover:bg-[#F4EFE6] shadow-sm flex items-center gap-1.5 text-xs font-bold active:scale-95 flex-shrink-0"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Yangilash</span>
          </button>
        </div>
      </div>

      {/* Agar "Boshqa" tanlansa sana filtri */}
      {period === 'custom' && (
        <div className="p-4 rounded-2xl bg-white border border-[#E9E5DD] flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs flex-1 min-w-[130px]">
            <span className="font-bold text-[#1C261E]">Dan:</span>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-[#E9E5DD] text-xs focus:outline-none focus:border-[#244B2B]"
            />
          </div>
          <div className="flex items-center gap-2 text-xs flex-1 min-w-[130px]">
            <span className="font-bold text-[#1C261E]">Gacha:</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-[#E9E5DD] text-xs focus:outline-none focus:border-[#244B2B]"
            />
          </div>
          <button
            onClick={fetchAnalytics}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#244B2B] text-white text-xs font-bold hover:bg-[#1A3720] active:scale-95 transition-all"
          >
            Hisobotni shakllantirish
          </button>
        </div>
      )}

      {/* Asosiy KPI Kartochkalari (Mobil uchun 2x2 qulay ixcham grid) */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Sof Tushum */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E9E5DD] p-3.5 sm:p-5 shadow-sm space-y-1 sm:space-y-2">
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#596B5E] font-bold">
              <span className="truncate">Sof Tushum</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black text-[#244B2B] truncate">
              {formatCurrency(summary.revenue, 'uz')}
            </div>
            <div className="flex items-center gap-1 text-[10px] sm:text-xs">
              {summary.previous?.revenueChangePercent !== null && (
                <span className={`inline-flex items-center font-bold ${
                  (summary.previous?.revenueChangePercent ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {(summary.previous?.revenueChangePercent ?? 0) >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                  )}
                  {summary.previous?.revenueChangePercent}%
                </span>
              )}
              <span className="text-[#8C9B90] hidden sm:inline">oldingi davrga nisbatan</span>
            </div>
          </div>

          {/* Jami Buyurtmalar */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E9E5DD] p-3.5 sm:p-5 shadow-sm space-y-1 sm:space-y-2">
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#596B5E] font-bold">
              <span className="truncate">Buyurtmalar</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black text-[#1C261E]">
              {summary.ordersTotal} ta
            </div>
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-[#596B5E] truncate">
              <span className="font-bold text-emerald-700">{summary.completed} muvaffaqiyatli</span>
            </div>
          </div>

          {/* O'rtacha Chek */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E9E5DD] p-3.5 sm:p-5 shadow-sm space-y-1 sm:space-y-2">
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#596B5E] font-bold">
              <span className="truncate">O‘rtacha chek</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black text-[#1C261E] truncate">
              {formatCurrency(summary.averageOrderValue, 'uz')}
            </div>
            <div className="text-[10px] sm:text-xs text-[#596B5E] truncate">
              Faol: <strong>{formatCurrency(summary.inProgressAmount, 'uz')}</strong>
            </div>
          </div>

          {/* Maxsus toifalar: Tortlar va Sovg'alar */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E9E5DD] p-3.5 sm:p-5 shadow-sm space-y-1 sm:space-y-2">
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#596B5E] font-bold">
              <span className="truncate">Maxsus Tortlar</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
                <Cake className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black text-purple-900">
              {summary.cakeOrders} ta
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[#596B5E] truncate">
              <span className="text-rose-700 font-bold">{summary.giftOrders} sovg‘a</span>
            </div>
          </div>

        </div>
      )}

      {/* Yetkazish va Olib ketish ulushi */}
      {summary && (
        <div className="bg-white rounded-3xl border border-[#E9E5DD] p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3 text-xs font-bold text-[#1C261E]">
            <span className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#244B2B]" />
              <span>Yetkazib berish ({summary.deliveryOrders} ta)</span>
            </span>
            <span className="flex items-center gap-2">
              <Store className="w-4 h-4 text-[#D4AF37]" />
              <span>Olib ketish ({summary.pickupOrders} ta)</span>
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-[#F4EFE6] overflow-hidden flex">
            <div
              className="bg-[#244B2B] h-full transition-all"
              style={{
                width: `${(summary.deliveryOrders / (summary.ordersTotal || 1)) * 100}%`,
              }}
              title={`Yetkazish: ${Math.round((summary.deliveryOrders / (summary.ordersTotal || 1)) * 100)}%`}
            />
            <div
              className="bg-[#D4AF37] h-full transition-all"
              style={{
                width: `${(summary.pickupOrders / (summary.ordersTotal || 1)) * 100}%`,
              }}
              title={`Olib ketish: ${Math.round((summary.pickupOrders / (summary.ordersTotal || 1)) * 100)}%`}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#596B5E] mt-2 font-medium">
            <span>{Math.round((summary.deliveryOrders / (summary.ordersTotal || 1)) * 100)}% eshikkacha kuryer</span>
            <span>{Math.round((summary.pickupOrders / (summary.ordersTotal || 1)) * 100)}% do‘kondan olib ketish</span>
          </div>
        </div>
      )}

      {/* Grafiklar qatori */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Kunlik Tushum Bar-Grafigi */}
        <div className="bg-white rounded-3xl border border-[#E9E5DD] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-[#1C261E]">Kunlik Tushum Dinamikasi</h3>
              <p className="text-xs text-[#596B5E]">Har bir kundagi sotuvlar hajmi (so‘m)</p>
            </div>
            <BarChart3 className="w-5 h-5 text-[#244B2B]" />
          </div>

          <div className="h-56 flex items-end gap-2 pt-6 pb-2 border-b border-[#E9E5DD] overflow-x-auto">
            {dailyData.map((d, idx) => {
              const heightPct = Math.max(10, Math.round((d.revenue / maxDailyRevenue) * 100));
              return (
                <div key={idx} className="flex-1 min-w-[28px] flex flex-col items-center gap-1 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                    <div className="bg-[#1C261E] text-white text-[10px] font-bold py-1 px-2 rounded-lg whitespace-nowrap shadow-lg">
                      <div>{d.date}</div>
                      <div className="text-[#D4AF37]">{formatCurrency(d.revenue, 'uz')}</div>
                      <div>{d.orders} ta buyurtma</div>
                    </div>
                    <div className="w-2 h-2 bg-[#1C261E] rotate-45 -mt-1" />
                  </div>

                  {/* Ustun */}
                  <div
                    className="w-full bg-[#244B2B] hover:bg-[#D4AF37] rounded-t-lg transition-all cursor-pointer"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[9px] text-[#8C9B90] font-mono transform -rotate-45 mt-2 origin-top-left">
                    {d.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Soatlar bo'yicha buyurtmalar taqsimoti (Peak Hours) */}
        <div className="bg-white rounded-3xl border border-[#E9E5DD] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-[#1C261E]">Tig‘iz Soatlar Taqsimoti (24 soat)</h3>
              <p className="text-xs text-[#596B5E]">Buyurtmalar eng ko‘p tushayotgan vaqt oralig‘i</p>
            </div>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>

          <div className="h-56 flex items-end gap-1.5 pt-6 pb-2 border-b border-[#E9E5DD] overflow-x-auto">
            {hourlyData.map((h, idx) => {
              const heightPct = Math.max(4, Math.round((h.orders / maxHourlyOrders) * 100));
              const isPeak = h.orders >= maxHourlyOrders * 0.7 && h.orders > 0;

              return (
                <div key={idx} className="flex-1 min-w-[14px] flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                    <div className="bg-[#1C261E] text-white text-[10px] font-bold py-1 px-2 rounded-lg whitespace-nowrap shadow-lg">
                      <div>{h.hour}:00 - {h.hour + 1}:00</div>
                      <div className="text-amber-400">{h.orders} ta buyurtma</div>
                    </div>
                    <div className="w-2 h-2 bg-[#1C261E] rotate-45 -mt-1" />
                  </div>

                  <div
                    className={`w-full rounded-t-md transition-all cursor-pointer ${
                      isPeak ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-800/40 hover:bg-emerald-700'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                  {idx % 3 === 0 && (
                    <span className="text-[9px] text-[#8C9B90] font-mono mt-1">
                      {h.hour}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#596B5E] pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
              <span>Eng tig‘iz (Peak) vaqtlar</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-800/40 inline-block" />
              <span>O‘rtacha yuklanish</span>
            </span>
          </div>
        </div>

      </div>

      {/* Eng ko'p sotilgan mahsulotlar (Top Products) */}
      <div className="bg-white rounded-3xl border border-[#E9E5DD] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E9E5DD]">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-base font-black text-[#1C261E]">Eng ko‘p sotiladigan Top-10 Mahsulot</h3>
          </div>
          <span className="text-xs text-[#596B5E] font-medium">Daromad bo‘yicha saralangan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E9E5DD] text-[#8C9B90] font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Mahsulot</th>
                <th className="py-2.5 px-3 text-center">Sotilgan miqdor</th>
                <th className="py-2.5 px-3 text-right">Jami Tushum</th>
                <th className="py-2.5 px-3 text-right">Ulush</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E5DD]">
              {topProducts.map((p, idx) => {
                const totalTopRevenue = topProducts.reduce((sum, item) => sum + item.revenue, 0) || 1;
                const sharePct = Math.round((p.revenue / totalTopRevenue) * 100);

                return (
                  <tr key={p.productId} className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="py-3 px-3 font-black text-[#8C9B90]">{idx + 1}</td>
                    <td className="py-3 px-3 font-bold text-[#1C261E]">{p.name}</td>
                    <td className="py-3 px-3 text-center font-semibold text-[#596B5E]">
                      {formatQuantity(p.quantity, p.unitType, 'uz')}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-[#244B2B]">
                      {formatCurrency(p.revenue, 'uz')}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 rounded-full bg-[#F4EFE6] overflow-hidden">
                          <div
                            className="bg-[#D4AF37] h-full"
                            style={{ width: `${sharePct}%` }}
                          />
                        </div>
                        <span className="font-bold text-[11px] text-[#596B5E] min-w-[28px]">{sharePct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
