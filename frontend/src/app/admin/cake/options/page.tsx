'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { 
  Sliders, 
  Plus, 
  Trash2, 
  Edit, 
  Upload, 
  X, 
  Loader2, 
  Cake, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ImageIcon
} from 'lucide-react';
import { apiClient } from '../../../../lib/api/client';
import { formatCurrency } from '../../../../lib/format';
import { uploadImageFile } from '../../../../lib/api/upload';

type OptionKind = 'FLAVOR' | 'CREAM' | 'DECOR' | 'EXTRA';

type CakeOption = {
  id: number;
  kind: OptionKind;
  nameUz: string;
  nameRu: string;
  imageUrl: string | null;
  priceType: 'PER_KG' | 'FIXED';
  priceValue: number;
  sortOrder: number;
  isActive: boolean;
};

const empty = {
  kind: 'FLAVOR' as OptionKind,
  nameUz: '',
  nameRu: '',
  imageUrl: '',
  priceType: 'PER_KG' as 'PER_KG' | 'FIXED',
  priceValue: 0,
  sortOrder: 0,
  isActive: true,
};

const KIND_LABELS: Record<OptionKind, { uz: string; badge: string }> = {
  FLAVOR: { uz: 'Biskvit ta’mi', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  CREAM: { uz: 'Krem turi', badge: 'bg-rose-100 text-rose-800 border-rose-200' },
  DECOR: { uz: 'Bezak & Mevalar', badge: 'bg-purple-100 text-purple-800 border-purple-200' },
  EXTRA: { uz: 'Qo‘shimcha xizmat', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
};

export default function AdminCakeOptionsPage() {
  const [items, setItems] = useState<CakeOption[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<number | null>(null);
  const [selectedKind, setSelectedKind] = useState<string>('ALL');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient<CakeOption[]>('/api/admin/cake/options');
      setItems(data || []);
    } catch (e) {
      window.alert((e as { message?: string }).message || 'Tort variantlarini yuklab bo‘lmadi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Rasm hajmi 8 MB dan oshmasligi kerak');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadImageFile(file, 'CAKES');
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch {
      alert('Rasm yuklashda xatolik yuz berdi');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await apiClient(`/api/admin/cake/options${editing ? `/${editing}` : ''}`, {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...form,
          imageUrl: form.imageUrl || null,
        }),
      });
      setEditing(null);
      setForm(empty);
      await load();
    } catch (e) {
      window.alert((e as { message?: string }).message || 'Variantni saqlab bo‘lmadi.');
    }
  };

  const startEdit = (item: CakeOption) => {
    setEditing(item.id);
    setForm({
      kind: item.kind,
      nameUz: item.nameUz,
      nameRu: item.nameRu,
      imageUrl: item.imageUrl || '',
      priceType: item.priceType,
      priceValue: item.priceValue,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id: number) => {
    if (!window.confirm('Haqiqatan ham bu variantni o‘chirasizmi?')) return;
    try {
      await apiClient(`/api/admin/cake/options/${id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      window.alert((e as { message?: string }).message || 'Variantni o‘chirib bo‘lmadi.');
    }
  };

  const filteredItems = selectedKind === 'ALL' 
    ? items 
    : items.filter((item) => item.kind === selectedKind);

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-4 sm:p-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1C261E] tracking-tight flex items-center gap-2">
          <Sliders className="w-7 h-7 text-[#D4AF37]" />
          Tort Konstruktori — Ta’mlar, Kremlar va Bezaklar
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Mijoz o‘z tortini yig‘ayotganda tanlaydigan barcha biskvit ta’mlari, nozik kremlar, bezaklar va fotosuratlarni boshqaring.
        </p>
      </div>

      {/* Tahrirlash yoki yangi qo'shish formasi */}
      <div className="rounded-2xl border border-amber-200/80 bg-white p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#1C261E] mb-4 flex items-center gap-2">
          {editing ? <Edit className="w-5 h-5 text-amber-600" /> : <Plus className="w-5 h-5 text-emerald-600" />}
          {editing ? 'Variantni tahrirlash' : 'Yangi variant qo‘shish'}
        </h2>

        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Bo‘lim turi (Guruhi)
              </label>
              <select
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value as OptionKind })}
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-[#244B2B] focus:outline-none"
              >
                <option value="FLAVOR">🍰 Biskvit ta’mi (Shokolad, Vanil, Qizil baxmal...)</option>
                <option value="CREAM">🧁 Krem turi (Krem-chiz, Shokoladli ganash, Mus...)</option>
                <option value="DECOR">🍓 Bezak & Mevalar (Rezavorlar, Shokolad sharlari...)</option>
                <option value="EXTRA">✨ Qo‘shimcha (Bayramona shamcha, Maxsus qadoq...)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Narxlash usuli
              </label>
              <select
                value={form.priceType}
                onChange={(e) => setForm({ ...form, priceType: e.target.value as typeof form.priceType })}
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-[#244B2B] focus:outline-none"
              >
                <option value="PER_KG">Har bir kg uchun (Vaznga qarab ko‘payadi)</option>
                <option value="FIXED">Bir martalik qat’iy narx (Vazndan qat’iy nazar)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Nomi (O‘zbekcha) *
              </label>
              <input
                required
                placeholder="Masalan: Shokoladli nozik biskvit"
                value={form.nameUz}
                onChange={(e) => setForm({ ...form, nameUz: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-[#244B2B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Nomi (Ruscha) *
              </label>
              <input
                required
                placeholder="Например: Нежный шоколадный бисквит"
                value={form.nameRu}
                onChange={(e) => setForm({ ...form, nameRu: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-[#244B2B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Qo‘shimcha narxi (so‘mda, 0 bo‘lsa bepul)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                required
                placeholder="Masalan: 15000"
                value={form.priceValue}
                onChange={(e) => setForm({ ...form, priceValue: Number(e.target.value) })}
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-[#244B2B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Tartib raqami (Sort order)
              </label>
              <input
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-[#244B2B] focus:outline-none"
              />
            </div>
          </div>

          {/* Rasm yuklash maydoni */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Variant fotosurati (Mijozga vizual ko‘rinishi uchun)
            </label>
            <div className="flex flex-wrap items-center gap-4">
              {form.imageUrl ? (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm">
                  <Image
                    src={form.imageUrl}
                    alt="Tanlangan rasm"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, imageUrl: '' })}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700"
                    title="Rasmni o‘chirish"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 bg-gray-50">
                  <ImageIcon className="w-8 h-8 opacity-40" />
                </div>
              )}

              <div className="flex-1 min-w-[200px] space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-600 text-emerald-700 bg-emerald-50 text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Yuklanmoqda…
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Kompyuter yoki telefondan rasm tanlash
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Yoki to‘g‘ridan-to‘g‘ri rasm URL manzilini kiriting"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 p-2 text-xs text-gray-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              Sayt konstruktorida faol ko‘rinsin
            </label>

            <div className="flex gap-2">
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setForm(empty);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Bekor qilish
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#244B2B] text-white text-sm font-bold shadow-md hover:bg-[#1B3820] transition-colors"
              >
                {editing ? 'Saqlash' : 'Variant qo‘shish'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Filtr tablari */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedKind('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            selectedKind === 'ALL'
              ? 'bg-[#244B2B] text-white'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Barchasi ({items.length})
        </button>
        {(['FLAVOR', 'CREAM', 'DECOR', 'EXTRA'] as OptionKind[]).map((kind) => {
          const count = items.filter((i) => i.kind === kind).length;
          return (
            <button
              key={kind}
              onClick={() => setSelectedKind(kind)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                selectedKind === kind
                  ? 'bg-[#244B2B] text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {KIND_LABELS[kind].uz} ({count})
            </button>
          );
        })}
      </div>

      {/* Variantlar ro'yxati */}
      {isLoading ? (
        <div className="p-8 text-center text-sm text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
          Variantlar yuklanmoqda…
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-gray-300 bg-white text-sm text-gray-500">
          Bu bo‘limda hozircha variantlar yo‘q. Yuqoridagi formadan qo‘shishingiz mumkin.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.nameUz}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Cake className="w-6 h-6 opacity-40" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border mb-1 ${KIND_LABELS[item.kind].badge}`}>
                    {KIND_LABELS[item.kind].uz}
                  </span>
                  <h3 className="font-bold text-sm text-[#1C261E] truncate" title={item.nameUz}>
                    {item.nameUz}
                  </h3>
                  <p className="text-xs text-gray-500 truncate" title={item.nameRu}>
                    {item.nameRu}
                  </p>
                  <p className="text-xs font-bold text-emerald-700 mt-1">
                    {item.priceValue === 0
                      ? 'Bepul (Standart)'
                      : `+${formatCurrency(item.priceValue)} ${item.priceType === 'PER_KG' ? '/ kg' : '(qayd)'}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 text-xs">
                <span className={item.isActive ? 'text-emerald-600 font-semibold flex items-center gap-1' : 'text-gray-400'}>
                  {item.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                  {item.isActive ? 'Faol' : 'O‘chirilgan'}
                </span>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => startEdit(item)}
                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Tahrirlash
                  </button>
                  <button
                    onClick={() => remove(item.id)}
                    className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium"
                  >
                    O‘chirish
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
