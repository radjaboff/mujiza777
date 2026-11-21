'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  Palette, 
  Sparkles, 
  Upload, 
  X, 
  Loader2, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  ImageIcon, 
  Camera, 
  ShieldCheck, 
  Crown, 
  Info,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { 
  useCmsContent, 
  SiteCmsContent, 
  DEFAULT_CMS_CONTENT, 
  AtmosphereItem, 
  GuaranteeItem, 
  WeddingPerkItem 
} from '../../../lib/cms/content';
import { uploadImageFile } from '../../../lib/api/upload';

export default function AdminContentManagementPage() {
  const { content, updateContent, resetToDefaults } = useCmsContent();
  const [formData, setFormData] = useState<SiteCmsContent>(content);
  const [activeTab, setActiveTab] = useState<'atmosphere' | 'guarantees' | 'wedding' | 'about'>('atmosphere');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUploadTargetRef = useRef<{ type: string; id?: string; field?: string } | null>(null);

  useEffect(() => {
    setFormData(content);
  }, [content]);

  // Fayl yuklash boshqaruvchisi
  const triggerUpload = (target: { type: string; id?: string; field?: string }) => {
    currentUploadTargetRef.current = target;
    setUploadingField(target.id || target.field || target.type);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUploadTargetRef.current) {
      setUploadingField(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Rasm hajmi 10 MB dan oshmasligi kerak');
      setUploadingField(null);
      return;
    }

    try {
      const url = await uploadImageFile(file, 'BRANCHES');
      const target = currentUploadTargetRef.current;

      if (target.type === 'atmosphere' && target.id) {
        setFormData((prev) => ({
          ...prev,
          atmosphere: {
            ...prev.atmosphere,
            items: prev.atmosphere.items.map((item) =>
              item.id === target.id ? { ...item, imageUrl: url } : item
            ),
          },
        }));
      } else if (target.type === 'wedding') {
        setFormData((prev) => ({
          ...prev,
          wedding: {
            ...prev.wedding,
            imageUrl: url,
          },
        }));
      } else if (target.type === 'about_team') {
        setFormData((prev) => ({
          ...prev,
          about: {
            ...prev.about,
            teamPhotoUrl: url,
          },
        }));
      }
    } catch {
      alert('Rasm yuklashda xatolik yuz berdi');
    } finally {
      setUploadingField(null);
      currentUploadTargetRef.current = null;
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      updateContent(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      alert('Kontentni saqlashda xatolik yuz berdi');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Barcha rasmlar va matnlarni standart (boshlang‘ich) holatiga qaytarasizmi?")) {
      resetToDefaults();
      setFormData(DEFAULT_CMS_CONTENT);
      alert("Standart holatga qaytarildi!");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Sarlavha va Harakatlar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E9E5DD]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C261E] tracking-tight flex items-center gap-2">
            <Palette className="w-7 h-7 text-[#D4AF37]" />
            Sayt Kontenti, Rasmlari va Dizayni
          </h1>
          <p className="text-xs sm:text-sm text-[#596B5E] mt-0.5">
            Do‘kon atmosferasi rasmlari, sifat kafolatlari, to‘y marosimi va kompaniya ma’lumotlarini boshqaring
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saytda muvaffaqiyatli yangilandi!</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-all"
            title="Standart holatga qaytarish"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
            <span>Qayta tiklash</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#244B2B] hover:bg-[#1B3820] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saqlanmoqda...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#D4AF37]" />
                <span>O‘zgarishlarni saqlash</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tablar */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('atmosphere')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'atmosphere'
              ? 'bg-[#244B2B] text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Camera className="w-4 h-4 text-[#D4AF37]" />
          <span>1. Do‘kon Atmosferasi (4 ta fotosurat)</span>
        </button>

        <button
          onClick={() => setActiveTab('guarantees')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'guarantees'
              ? 'bg-[#244B2B] text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>2. Sifat va Ishonch Kafolatlari</span>
        </button>

        <button
          onClick={() => setActiveTab('wedding')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'wedding'
              ? 'bg-[#244B2B] text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Crown className="w-4 h-4 text-[#D4AF37]" />
          <span>3. To‘y va Marosimlar (VIP Catering)</span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'about'
              ? 'bg-[#244B2B] text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <HeartHandshake className="w-4 h-4 text-rose-500" />
          <span>4. "Biz haqimizda" va Jamoa</span>
        </button>
      </div>

      {/* ================= TAB 1: ATMOSPHERE ================= */}
      {activeTab === 'atmosphere' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#1C261E] flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#D4AF37]" />
              Bosh sahifadagi "Mo‘jiza 777 Atmosferasi" Fotosuratlari va Matnlari
            </h2>
            <p className="text-xs text-gray-600">
              Ushbu 4 ta fotosurat bosh sahifaning markazida slayd ko‘rinishida aylanib turadi. Har birining fotosuratini va matnini o‘zgartirishingiz mumkin.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-gray-100">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Bo‘lim bosh sarlavhasi (UZ)</label>
                <input
                  type="text"
                  value={formData.atmosphere.titleUz}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      atmosphere: { ...formData.atmosphere, titleUz: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-semibold focus:outline-none focus:border-[#244B2B]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Bo‘lim bosh sarlavhasi (RU)</label>
                <input
                  type="text"
                  value={formData.atmosphere.titleRu}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      atmosphere: { ...formData.atmosphere, titleRu: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-semibold focus:outline-none focus:border-[#244B2B]"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {formData.atmosphere.items.map((item, idx) => (
              <div
                key={item.id}
                className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-[#AA820A] text-xs font-bold border border-amber-200/60">
                      Foto #{idx + 1}: {item.tagUz}
                    </span>
                  </div>

                  {/* Rasm ko'rinishi va almashtirish tugmasi */}
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.titleUz}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
                        <span className="text-xs">Rasm yo‘q</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => triggerUpload({ type: 'atmosphere', id: item.id })}
                        disabled={uploadingField === item.id}
                        className="px-4 py-2 rounded-xl bg-white text-gray-900 text-xs font-bold shadow-lg hover:bg-gray-100 flex items-center gap-1.5"
                      >
                        {uploadingField === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        Rasmni yangilash
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => triggerUpload({ type: 'atmosphere', id: item.id })}
                      disabled={uploadingField === item.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-600 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
                    >
                      {uploadingField === item.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      Kompyuter / Telefonda yangi rasm yuklash
                    </button>
                  </div>

                  {/* Matnlar */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Sarlavha (UZ)</label>
                      <input
                        type="text"
                        value={item.titleUz}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            atmosphere: {
                              ...prev.atmosphere,
                              items: prev.atmosphere.items.map((i) =>
                                i.id === item.id ? { ...i, titleUz: val } : i
                              ),
                            },
                          }));
                        }}
                        className="w-full rounded-lg border border-gray-200 p-2 text-xs font-bold text-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Tavsif (UZ)</label>
                      <textarea
                        rows={2}
                        value={item.descUz}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            atmosphere: {
                              ...prev.atmosphere,
                              items: prev.atmosphere.items.map((i) =>
                                i.id === item.id ? { ...i, descUz: val } : i
                              ),
                            },
                          }));
                        }}
                        className="w-full rounded-lg border border-gray-200 p-2 text-xs text-gray-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2: GUARANTEES ================= */}
      {activeTab === 'guarantees' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-[#1C261E] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Sifat va Ishonch Kafolatlari (Bosh sahifa pastki qismi)
            </h2>
            <p className="text-xs text-gray-600">
              Xaridorlarga ishonch bag‘ishlovchi 4 ta asosiy kafolat bloklari (Yetkazish tezligi, Halollik va tabiiy masalliqlar, har kuni yangi pishirilishi, bepul sovg‘a).
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {formData.guarantees.map((g, idx) => (
              <div key={g.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Kafolat #{idx + 1}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">Belgi: {g.iconType}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Yuqori Nishon (Badge UZ)</label>
                    <input
                      type="text"
                      value={g.badgeUz}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          guarantees: prev.guarantees.map((item) =>
                            item.id === g.id ? { ...item, badgeUz: val } : item
                          ),
                        }));
                      }}
                      className="w-full rounded-lg border border-gray-200 p-2 text-xs font-bold text-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Sarlavha (UZ)</label>
                    <input
                      type="text"
                      value={g.titleUz}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          guarantees: prev.guarantees.map((item) =>
                            item.id === g.id ? { ...item, titleUz: val } : item
                          ),
                        }));
                      }}
                      className="w-full rounded-lg border border-gray-200 p-2 text-xs font-bold text-[#1C261E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Tavsif (UZ)</label>
                    <textarea
                      rows={2}
                      value={g.descUz}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          guarantees: prev.guarantees.map((item) =>
                            item.id === g.id ? { ...item, descUz: val } : item
                          ),
                        }));
                      }}
                      className="w-full rounded-lg border border-gray-200 p-2 text-xs text-gray-700"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: WEDDING & CATERING ================= */}
      {activeTab === 'wedding' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#1C261E] flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#D4AF37]" />
              To‘y, Marosim va VIP Keytering Bo‘limi
            </h2>
            <p className="text-xs text-gray-600">
              Katta tantanalar, to‘y tortlari va marosim dasturxoni bo‘yicha bosh sahifadagi hashamatli VIP blok.
            </p>

            {/* Rasm */}
            <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50/50 space-y-2">
              <label className="block text-xs font-bold text-[#1C261E] uppercase tracking-wider">
                👑 VIP Marosim va To‘y Torti Asosiy Fotosurati
              </label>
              <div className="flex flex-wrap items-center gap-4">
                {formData.wedding.imageUrl ? (
                  <div className="relative w-40 h-24 rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-sm flex-shrink-0">
                    <Image
                      src={formData.wedding.imageUrl}
                      alt="To‘y torti"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-40 h-24 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 bg-white flex-shrink-0">
                    <Crown className="w-8 h-8 opacity-30 text-[#D4AF37]" />
                  </div>
                )}

                <div className="flex-1 min-w-[220px] space-y-2">
                  <button
                    type="button"
                    onClick={() => triggerUpload({ type: 'wedding' })}
                    disabled={uploadingField === 'wedding'}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-600 text-emerald-700 bg-emerald-50 text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    {uploadingField === 'wedding' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Yuklanmoqda…
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        Kompyuter / Telefonda to‘y torti rasmini tanlash
                      </>
                    )}
                  </button>
                  <input
                    type="text"
                    placeholder="Rasm URL manzili"
                    value={formData.wedding.imageUrl || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        wedding: { ...formData.wedding, imageUrl: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 p-2 text-xs text-gray-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Bosh Sarlavha (UZ)</label>
                <input
                  type="text"
                  value={formData.wedding.titleUz}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      wedding: { ...formData.wedding, titleUz: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-bold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Aloqa Telefoni</label>
                <input
                  type="text"
                  value={formData.wedding.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      wedding: { ...formData.wedding, phone: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-bold text-[#244B2B]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tavsif (UZ)</label>
                <textarea
                  rows={2}
                  value={formData.wedding.descUz}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      wedding: { ...formData.wedding, descUz: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-700"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: ABOUT PAGE ================= */}
      {activeTab === 'about' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#1C261E] flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-rose-500" />
              "Biz haqimizda" Sahifasi va Jamoa Fotosurati
            </h2>

            {/* Jamoa fotosurati */}
            <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50/50 space-y-2">
              <label className="block text-xs font-bold text-[#1C261E] uppercase tracking-wider">
                👥 Qandolatchilar Jamoasi Fotosurati
              </label>
              <div className="flex flex-wrap items-center gap-4">
                {formData.about.teamPhotoUrl ? (
                  <div className="relative w-40 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-sm flex-shrink-0">
                    <Image
                      src={formData.about.teamPhotoUrl}
                      alt="Jamoa"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-40 h-24 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 bg-white flex-shrink-0">
                    <ImageIcon className="w-8 h-8 opacity-30 text-gray-400" />
                  </div>
                )}

                <div className="flex-1 min-w-[220px] space-y-2">
                  <button
                    type="button"
                    onClick={() => triggerUpload({ type: 'about_team' })}
                    disabled={uploadingField === 'about_team'}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-600 text-emerald-700 bg-emerald-50 text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    {uploadingField === 'about_team' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    Jamoa fotosuratini yuklash
                  </button>
                  <input
                    type="text"
                    placeholder="Rasm URL manzili"
                    value={formData.about.teamPhotoUrl || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        about: { ...formData.about, teamPhotoUrl: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 p-2 text-xs text-gray-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                  Do‘konimiz Hikoyasi Sarlavhasi (UZ)
                </label>
                <input
                  type="text"
                  value={formData.about.storyTitleUz}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      about: { ...formData.about, storyTitleUz: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-bold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                  Do‘kon Tarixi va Filosofiyasi Matni (UZ)
                </label>
                <textarea
                  rows={4}
                  value={formData.about.storyTextUz}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      about: { ...formData.about, storyTextUz: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-700 leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
