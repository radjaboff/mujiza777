'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit, 
  Upload, 
  X, 
  Loader2, 
  Calendar, 
  Eye, 
  EyeOff, 
  ExternalLink,
  ImageIcon,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { apiClient } from '../../../lib/api/client';
import { uploadImageFile } from '../../../lib/api/upload';

type AdminPromotion = {
  id: number;
  titleUz: string;
  titleRu: string;
  slug: string;
  summaryUz: string | null;
  summaryRu: string | null;
  descriptionUz: string | null;
  descriptionRu: string | null;
  imageUrl: string | null;
  mobileImageUrl: string | null;
  linkUrl: string | null;
  showOnHome: boolean;
  activeFrom: string | null;
  activeTo: string | null;
  sortOrder: number;
  isActive: boolean;
  visibleNow?: boolean;
};

type PromotionForm = Omit<AdminPromotion, 'id' | 'visibleNow'>;

const empty: PromotionForm = {
  titleUz: '',
  titleRu: '',
  slug: '',
  summaryUz: '',
  summaryRu: '',
  descriptionUz: '',
  descriptionRu: '',
  imageUrl: '',
  mobileImageUrl: '',
  linkUrl: '/catalog',
  showOnHome: true,
  activeFrom: null,
  activeTo: null,
  sortOrder: 0,
  isActive: true,
};

const localDateTime = (value: string) => (value ? `${value}:00` : null);

export default function AdminPromotionsPage() {
  const [items, setItems] = useState<AdminPromotion[]>([]);
  const [form, setForm] = useState<PromotionForm>(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUploadingDesktop, setIsUploadingDesktop] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);

  const desktopFileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiClient<AdminPromotion[]>('/api/admin/promotions');
      setItems(data || []);
    } catch (e) {
      setItems([]);
      window.alert((e as { message?: string }).message || 'Aksiyalarni yuklab bo‘lmadi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMobile: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Rasm hajmi 10 MB dan oshmasligi kerak');
      return;
    }

    if (isMobile) {
      setIsUploadingMobile(true);
    } else {
      setIsUploadingDesktop(true);
    }

    try {
      const url = await uploadImageFile(file, 'BANNERS');
      if (isMobile) {
        setForm((prev) => ({ ...prev, mobileImageUrl: url }));
      } else {
        setForm((prev) => ({ ...prev, imageUrl: url }));
      }
    } catch {
      alert('Rasm yuklashda xatolik yuz berdi');
    } finally {
      if (isMobile) {
        setIsUploadingMobile(false);
        if (mobileFileInputRef.current) mobileFileInputRef.current.value = '';
      } else {
        setIsUploadingDesktop(false);
        if (desktopFileInputRef.current) desktopFileInputRef.current.value = '';
      }
    }
  };

  const startEdit = (item: AdminPromotion) => {
    setEditingId(item.id);
    setForm({
      ...item,
      activeFrom: item.activeFrom?.slice(0, 16) || null,
      activeTo: item.activeTo?.slice(0, 16) || null,
    });
    setOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      ...form,
      slug: form.slug.trim() || undefined,
      imageUrl: form.imageUrl || null,
      mobileImageUrl: form.mobileImageUrl || null,
      activeFrom: localDateTime(form.activeFrom || ''),
      activeTo: localDateTime(form.activeTo || ''),
    };

    try {
      await apiClient(`/api/admin/promotions${editingId ? `/${editingId}` : ''}`, {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      setOpen(false);
      setEditingId(null);
      setForm(empty);
      await load();
    } catch (e) {
      window.alert((e as { message?: string }).message || 'Aksiyani saqlab bo‘lmadi.');
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Haqiqatan ham bu aksiya/bannerni o‘chirasizmi?')) return;
    try {
      await apiClient(`/api/admin/promotions/${id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      window.alert((e as { message?: string }).message || 'Aksiyani o‘chirib bo‘lmadi.');
    }
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C261E] tracking-tight flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-[#D4AF37]" />
            Aksiyalar va Bosh Sahifa Bannerlari
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Saytning bosh sahifasidagi aylanuvchi asosiy bannerlar, maxsus aksiyalar va fotosuratlarni boshqaring.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setForm(empty);
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#244B2B] px-5 py-3 font-bold text-white shadow-md hover:bg-[#1B3820] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Yangi aksiya / banner
        </button>
      </header>

      {/* Ro'yxat */}
      {loading ? (
        <div className="p-8 text-center text-sm text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
          Aksiyalar yuklanmoqda…
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-gray-300 bg-white text-sm text-gray-500">
          Hozircha hech qanday aksiya yoki banner kiritilmagan.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Rasm preview */}
                <div className="relative w-full h-44 bg-gray-100 border-b border-gray-100">
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
                      <span className="text-xs">Rasm kiritilmagan</span>
                    </div>
                  )}

                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {item.showOnHome && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#244B2B] text-white shadow-sm">
                        Bosh sahifada faol
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm ${
                        item.isActive ? 'bg-emerald-600 text-white' : 'bg-gray-600 text-white'
                      }`}
                    >
                      {item.isActive ? 'Faol' : 'Nofaol'}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-base text-[#1C261E] line-clamp-1" title={item.titleUz}>
                    {item.titleUz}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-1" title={item.titleRu}>
                    {item.titleRu}
                  </p>
                  {item.summaryUz && (
                    <p className="text-xs text-gray-600 line-clamp-2">{item.summaryUz}</p>
                  )}
                  <div className="text-[11px] text-gray-500 flex items-center gap-1.5 pt-1">
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                    <span>Havola: {item.linkUrl || '/catalog'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 pt-2 border-t border-gray-100 text-xs">
                <span className="text-gray-500 font-medium">Tartib: #{item.sortOrder}</span>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => startEdit(item)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Tahrirlash
                  </button>
                  <button
                    onClick={() => remove(item.id)}
                    className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium"
                  >
                    O‘chirish
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal oynasi */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-3">
          <form
            onSubmit={save}
            className="max-h-[92vh] w-full max-w-3xl space-y-4 overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border border-gray-100"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#1C261E] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                {editingId ? 'Aksiyani tahrirlash' : 'Yangi aksiya / banner qo‘shish'}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Sarlavha (O‘zbekcha) *
                </label>
                <input
                  required
                  placeholder="Masalan: Bahoriy bayram aksiyasi"
                  value={form.titleUz}
                  onChange={(e) => setForm({ ...form, titleUz: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-[#244B2B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Sarlavha (Ruscha) *
                </label>
                <input
                  required
                  placeholder="Например: Весенняя праздничная акция"
                  value={form.titleRu}
                  onChange={(e) => setForm({ ...form, titleRu: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-[#244B2B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Havola (Bosilganda qayerga o‘tsin)
                </label>
                <input
                  placeholder="Masalan: /catalog yoki /cake-builder"
                  value={form.linkUrl || ''}
                  onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-[#244B2B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Tartib raqami (Kichik raqam birinchi chiqadi)
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-[#244B2B] focus:outline-none"
                />
              </div>

              {/* Desktop Banner rasmi */}
              <div className="sm:col-span-2 rounded-2xl border border-gray-200 p-4 bg-gray-50/50">
                <label className="block text-xs font-bold text-[#1C261E] uppercase tracking-wider mb-2">
                  🖥️ Asosiy Banner Fotosurati (Kompyuter va Planshet uchun)
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  {form.imageUrl ? (
                    <div className="relative w-36 h-20 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm flex-shrink-0">
                      <Image
                        src={form.imageUrl}
                        alt="Desktop rasm"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, imageUrl: '' })}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-36 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 bg-white flex-shrink-0">
                      <ImageIcon className="w-6 h-6 opacity-40" />
                    </div>
                  )}

                  <div className="flex-1 min-w-[220px] space-y-2">
                    <input
                      type="file"
                      ref={desktopFileInputRef}
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, false)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => desktopFileInputRef.current?.click()}
                      disabled={isUploadingDesktop}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-600 text-emerald-700 bg-emerald-50 text-xs font-bold hover:bg-emerald-100 transition-colors"
                    >
                      {isUploadingDesktop ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Yuklanmoqda…
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Kompyuter / Telefonda banner faylini tanlash
                        </>
                      )}
                    </button>
                    <input
                      type="text"
                      placeholder="Yoki to‘g‘ridan-to‘g‘ri rasm URL manzilini kiriting"
                      value={form.imageUrl || ''}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 p-2 text-xs text-gray-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Mobil Banner rasmi */}
              <div className="sm:col-span-2 rounded-2xl border border-gray-200 p-4 bg-gray-50/50">
                <label className="block text-xs font-bold text-[#1C261E] uppercase tracking-wider mb-2">
                  📱 Mobil Banner Fotosurati (Telefonlar uchun alohida rasm, ixtiyoriy)
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  {form.mobileImageUrl ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm flex-shrink-0">
                      <Image
                        src={form.mobileImageUrl}
                        alt="Mobil rasm"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, mobileImageUrl: '' })}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 bg-white flex-shrink-0">
                      <ImageIcon className="w-6 h-6 opacity-40" />
                    </div>
                  )}

                  <div className="flex-1 min-w-[220px] space-y-2">
                    <input
                      type="file"
                      ref={mobileFileInputRef}
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, true)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => mobileFileInputRef.current?.click()}
                      disabled={isUploadingMobile}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 bg-white text-xs font-bold hover:bg-gray-100 transition-colors"
                    >
                      {isUploadingMobile ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Yuklanmoqda…
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Mobil rasmni tanlash (ixtiyoriy)
                        </>
                      )}
                    </button>
                    <input
                      type="text"
                      placeholder="Mobil rasm URL manzili (bo‘sh bo‘lsa, asosiy rasm ishlatiladi)"
                      value={form.mobileImageUrl || ''}
                      onChange={(e) => setForm({ ...form, mobileImageUrl: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 p-2 text-xs text-gray-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Qisqa izoh (O‘zbekcha)
                </label>
                <textarea
                  rows={2}
                  placeholder="Banner tagidagi qisqa matn"
                  value={form.summaryUz || ''}
                  onChange={(e) => setForm({ ...form, summaryUz: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-[#244B2B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Qisqa izoh (Ruscha)
                </label>
                <textarea
                  rows={2}
                  placeholder="Краткий текст под баннером"
                  value={form.summaryRu || ''}
                  onChange={(e) => setForm({ ...form, summaryRu: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-[#244B2B] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-[#1C261E]">
                <input
                  type="checkbox"
                  checked={form.showOnHome}
                  onChange={(e) => setForm({ ...form, showOnHome: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                Bosh sahifa bosh bannerida ko‘rsatish
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-[#1C261E]">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                Aksiya faol
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#244B2B] text-white text-sm font-bold shadow-md hover:bg-[#1B3820] transition-colors"
              >
                {editingId ? 'Saqlash' : 'Aksiyani yaratish'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
