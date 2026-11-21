'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Truck, 
  Phone, 
  Send, 
  Instagram,
  Power,
  Sparkles,
  Palette,
  ChefHat,
  ExternalLink,
  Eye
} from 'lucide-react';
import { PublicSettings, SeasonTheme } from '../../../lib/api/types';
import { apiClient } from '../../../lib/api/client';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PublicSettings>({
    phone: '+998 99 706 73 21',
    openTime: '09:00:00',
    closeTime: '22:00:00',
    isOpenNow: true,
    acceptingOrders: true,
    deliveryEnabled: true,
    deliveryFee: 15000,
    freeDeliveryFrom: 150000,
    minOrderAmount: 40000,
    cakeMinAdvanceHours: 24,
    telegramUrl: 'https://t.me/mujizashirinliklari777',
    instagramUrl: 'https://instagram.com/mujizashirinliklari777',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    // 1. Backenddan yuklash
    apiClient<PublicSettings>('/api/admin/settings')
      .then((data) => {
        if (data) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((error: { message?: string }) => window.alert(error.message || 'Sozlamalarni serverdan yuklab bo‘lmadi.'));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      await apiClient('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({
          phone: settings.phone.replace(/\s/g, ''),
          openTime: settings.openTime,
          closeTime: settings.closeTime,
          acceptingOrders: settings.acceptingOrders,
          deliveryEnabled: settings.deliveryEnabled,
          deliveryFee: settings.deliveryFee,
          freeDeliveryFrom: settings.freeDeliveryFrom,
          minOrderAmount: settings.minOrderAmount,
          cakeMinAdvanceHours: settings.cakeMinAdvanceHours,
          telegramUrl: settings.telegramUrl,
          instagramUrl: settings.instagramUrl,
          seasonTheme: settings.seasonTheme || 'DEFAULT',
        }),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      window.alert((error as { message?: string })?.message || 'Sozlamalarni saqlab bo‘lmadi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E9E5DD]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C261E] tracking-tight">
            Do‘kon sozlamalari
          </h1>
          <p className="text-xs sm:text-sm text-[#596B5E] mt-0.5">
            Yetkazib berish narxlari, ish vaqti va buyurtma holati
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Saqlandi!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* 1. Buyurtmalarni qabul qilish va Yetkazib berish kalitlari */}
        <div className="bg-white rounded-3xl border border-[#E9E5DD] p-6 sm:p-7 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-[#1C261E] mb-2 flex items-center gap-2">
            <Power className="w-5 h-5 text-[#244B2B]" />
            <span>Do‘kon faoliyat rejimlari</span>
          </h2>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FBF9F4] border border-[#E9E5DD]">
            <div>
              <div className="font-bold text-sm text-[#1C261E]">
                Sayt orqali buyurtma qabul qilish
              </div>
              <div className="text-xs text-[#596B5E] mt-0.5">
                {settings.acceptingOrders
                  ? "Hozir mijozlar erkin buyurtma bera olishadi"
                  : "Mijozlarga 'Buyurtmalar vaqtincha to‘xtatilgan' xabari ko‘rinadi"}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSettings({ ...settings, acceptingOrders: !settings.acceptingOrders })}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${
                settings.acceptingOrders ? 'bg-[#244B2B]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${
                  settings.acceptingOrders ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FBF9F4] border border-[#E9E5DD]">
            <div>
              <div className="font-bold text-sm text-[#1C261E]">
                Yetkazib berish xizmati (Kuryer)
              </div>
              <div className="text-xs text-[#596B5E] mt-0.5">
                {settings.deliveryEnabled
                  ? "Yetkazib berish faol (kuryer orqali eshikkacha)"
                  : "O‘chirilgan: mijozlar faqat do‘kondan olib ketish (Pick-up) bilan buyurtma beradi"}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSettings({ ...settings, deliveryEnabled: !settings.deliveryEnabled })}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${
                settings.deliveryEnabled ? 'bg-[#244B2B]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${
                  settings.deliveryEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 1.1. Mavsumiy Vizual Mavzu (Season Theme) */}
        <div className="bg-white rounded-3xl border border-[#E9E5DD] p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#1C261E] flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#D4AF37]" />
                <span>Mavsumiy dizayn mavzusi (Season Theme)</span>
              </h2>
              <p className="text-xs text-[#596B5E] mt-1">
                Saytni bir tugma bilan Navro‘z, 8-Mart, Hayit yoki Yangi Yil bayramona kayfiyatiga moslashtirish tizimi.
              </p>
            </div>
            <a
              href="/uz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E9E5DD] bg-[#FBF9F4] hover:bg-[#F4EFE6] text-xs font-bold text-[#1C261E] transition-all self-start sm:self-auto"
            >
              <Eye className="w-3.5 h-3.5 text-[#244B2B]" />
              <span>Saytda ko‘rish</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>

          {/* Mavzu variantlari */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { id: 'DEFAULT', name: 'Klassik Zumrad', desc: 'Asl brend yashil & tilla', color: 'bg-[#244B2B]' },
              { id: 'NAVRUZ', name: 'Bahor & Navro‘z', desc: 'Yangi yashil & bahor ruhi', color: 'bg-emerald-600' },
              { id: 'HAYIT', name: 'Ramazon & Hayit', desc: 'Muqaddas feruza & zumrad', color: 'bg-teal-700' },
              { id: 'MARCH_8', name: '8-Mart Nafis', desc: 'Atirgul & muloyim pushti', color: 'bg-rose-500' },
              { id: 'NEW_YEAR', name: 'Yangi Yil Sehri', desc: 'Qishki to‘q ko‘k & oltin', color: 'bg-slate-900' },
            ].map((theme) => {
              const isSelected = (settings.seasonTheme || 'DEFAULT') === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSettings({ ...settings, seasonTheme: theme.id as SeasonTheme })}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? 'border-[#244B2B] bg-[#F4EFE6] ring-2 ring-[#244B2B]/20 shadow-sm'
                      : 'border-[#E9E5DD] bg-white hover:border-[#D4AF37]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-3.5 h-3.5 rounded-full ${theme.color} ring-2 ring-white shadow-sm`} />
                    <span className="text-xs font-black text-[#1C261E]">{theme.name}</span>
                  </div>
                  <div className="text-[10px] text-[#596B5E] leading-relaxed">{theme.desc}</div>
                  {isSelected && (
                    <span className="absolute top-2 right-2 text-[#244B2B]">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Jonli Oldindan Ko'rish (Live Preview) */}
          <div className="rounded-2xl border border-[#E9E5DD] bg-[#FBF9F4] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#596B5E] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                Jonli Ko‘rinish (Mijoz saytida qanday ko‘rinadi):
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#E9E5DD] text-[#1C261E]">
                Tanlangan: {settings.seasonTheme || 'DEFAULT'}
              </span>
            </div>

            {/* Simulyatsiya qilingan bayramona lenta */}
            {settings.seasonTheme && settings.seasonTheme !== 'DEFAULT' ? (
              <div className="rounded-xl overflow-hidden shadow-sm">
                {settings.seasonTheme === 'MARCH_8' && (
                  <div className="bg-gradient-to-r from-[#8E24AA] via-[#D81B60] to-[#E91E63] text-white p-3 text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base animate-bounce">🌸</span>
                      <span>8-Mart Xotin-qizlar bayrami muborak! Aziz ayollarimiz uchun bayramona tortlar to‘plami 🌷</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/20 text-[11px] font-extrabold whitespace-nowrap">
                      Tortlarni ko‘rish →
                    </span>
                  </div>
                )}
                {settings.seasonTheme === 'NEW_YEAR' && (
                  <div className="bg-gradient-to-r from-[#0D2B45] via-[#1B3B6F] to-[#0D2B45] border-b border-[#D4AF37]/40 text-white p-3 text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base animate-pulse">❄️</span>
                      <span>Yangi Yil Mo‘jizasi! Bayram dasturxoni uchun sehrli qishki tortlar va sovg‘alar 🎄</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#D4AF37] text-[#1C261E] text-[11px] font-extrabold whitespace-nowrap">
                      Dasturxonga buyurtma →
                    </span>
                  </div>
                )}
                {settings.seasonTheme === 'HAYIT' && (
                  <div className="bg-gradient-to-r from-[#064E3B] via-[#0F766E] to-[#064E3B] border-b border-[#D4AF37]/50 text-white p-3 text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🌙</span>
                      <span>Ramazon va Hayit ayyomi muborak! Iftorlik va bayram dasturxoni uchun sara halol shirinliklar ✨</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#D4AF37] text-[#1C261E] text-[11px] font-extrabold whitespace-nowrap">
                      Shirinliklar menyusi →
                    </span>
                  </div>
                )}
                {settings.seasonTheme === 'NAVRUZ' && (
                  <div className="bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#388E3C] border-b border-amber-300/30 text-white p-3 text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base animate-bounce">🌱</span>
                      <span>Navro‘zi olam muborak! Bahoriy yangilanish, sumalakli desertlar va bayramona shirinliklar ☀️</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/20 text-[11px] font-extrabold whitespace-nowrap">
                      Yangi ta’mlar →
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-white border border-[#E9E5DD] text-xs text-[#596B5E] flex items-center gap-2">
                <span>👑</span>
                <span>Standart rejim faol: Bayram lentasi ko‘rsatilmaydi, sayt asl zumrad va tillarang brend palitrasida bo‘ladi.</span>
              </div>
            )}

            {/* Qayerlar o'zgaradi tushuntirish */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px] text-[#596B5E]">
              <div className="bg-white p-2.5 rounded-xl border border-[#E9E5DD]">
                <strong className="text-[#1C261E] block mb-0.5">1. Yuqori bayram lentasi</strong>
                Barcha sahifalarning eng tepasida bayram tabrigi va taklif lentasi chiqadi
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#E9E5DD]">
                <strong className="text-[#1C261E] block mb-0.5">2. Tugmalar va aksentlar</strong>
                Asosiy tugmalar va buyurtma aksentlari bayram rangiga moslashadi
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#E9E5DD]">
                <strong className="text-[#1C261E] block mb-0.5">3. Qulay o‘chirish</strong>
                Bayram o‘tgach, "Klassik Zumrad"ni tanlab saqlasangiz, sayt asl holiga qaytadi
              </div>
            </div>
          </div>
        </div>

        {/* 2. Ish vaqti */}
        <div className="bg-white rounded-3xl border border-[#E9E5DD] p-6 sm:p-7 shadow-sm">
          <h2 className="text-base font-bold text-[#1C261E] mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#244B2B]" />
            <span>Do‘kon ish vaqti</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1C261E] mb-1.5">Ochilish vaqti</label>
              <input
                type="text"
                value={settings.openTime}
                onChange={(e) => setSettings({ ...settings, openTime: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-sm focus:outline-none focus:border-[#244B2B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C261E] mb-1.5">Yopilish vaqti</label>
              <input
                type="text"
                value={settings.closeTime}
                onChange={(e) => setSettings({ ...settings, closeTime: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-sm focus:outline-none focus:border-[#244B2B]"
              />
            </div>
          </div>
        </div>

        {/* 3. Yetkazib berish parametrlari */}
        <div className="bg-white rounded-3xl border border-[#E9E5DD] p-6 sm:p-7 shadow-sm">
          <h2 className="text-base font-bold text-[#1C261E] mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#244B2B]" />
            <span>Yetkazib berish tariflari</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1C261E] mb-1.5">Yetkazish narxi (so‘m)</label>
              <input
                type="number"
                value={settings.deliveryFee}
                onChange={(e) => setSettings({ ...settings, deliveryFee: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-sm focus:outline-none focus:border-[#244B2B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C261E] mb-1.5">
                Bepul yetkazish chegarasi (0 bo‘lsa — chegara yo‘q, doim pullik)
              </label>
              <input
                type="number"
                min="0"
                value={settings.freeDeliveryFrom ?? 0}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                  setSettings({ ...settings, freeDeliveryFrom: val });
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-sm focus:outline-none focus:border-[#244B2B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C261E] mb-1.5">Minimal buyurtma summasi</label>
              <input
                type="number"
                value={settings.minOrderAmount}
                onChange={(e) => setSettings({ ...settings, minOrderAmount: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-sm focus:outline-none focus:border-[#244B2B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C261E] mb-1.5">Tort oldindan buyurtma (soat)</label>
              <input
                type="number"
                value={settings.cakeMinAdvanceHours || 24}
                onChange={(e) => setSettings({ ...settings, cakeMinAdvanceHours: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-sm focus:outline-none focus:border-[#244B2B]"
                title="Buyurtma tort uchun minimal necha soat oldin topshirilishi kerak (standart 24 soat)"
              />
            </div>
          </div>
        </div>

        {/* 4. Aloqa va Ijtimoiy tarmoqlar */}
        <div className="bg-white rounded-3xl border border-[#E9E5DD] p-6 sm:p-7 shadow-sm">
          <h2 className="text-base font-bold text-[#1C261E] mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#244B2B]" />
            <span>Aloqa va havolalar</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1C261E] mb-1.5">Telefon raqami</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-sm focus:outline-none focus:border-[#244B2B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C261E] mb-1.5">Telegram havola</label>
              <input
                type="text"
                value={settings.telegramUrl || ''}
                onChange={(e) => setSettings({ ...settings, telegramUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-sm focus:outline-none focus:border-[#244B2B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C261E] mb-1.5">Instagram havola</label>
              <input
                type="text"
                value={settings.instagramUrl || ''}
                onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-sm focus:outline-none focus:border-[#244B2B]"
              />
            </div>
          </div>
        </div>

        {/* Saqlash tugmasi */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#244B2B] text-white hover:bg-[#1A3720] font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4 text-[#D4AF37]" />
          <span>{isSaving ? 'Saqlanmoqda...' : 'O‘zgarishlarni saqlash'}</span>
        </button>

      </form>
    </div>
  );
}
