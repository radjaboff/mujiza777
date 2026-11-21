'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { 
  Cake, 
  Plus, 
  Trash2, 
  Edit, 
  Upload, 
  X, 
  Loader2, 
  Scale,
  Sparkles,
  CheckCircle2,
  ImageIcon
} from 'lucide-react';
import { apiClient } from '../../../../lib/api/client';
import { formatCurrency } from '../../../../lib/format';
import { uploadImageFile } from '../../../../lib/api/upload';

type CakeType = {
  id: number;
  nameUz: string;
  nameRu: string;
  imageUrl: string | null;
  basePricePerKg: number;
  minWeightKg: number;
  maxWeightKg: number;
  weightStep: number;
  servingsPerKg: number | null;
  sortOrder: number;
  isActive: boolean;
};

const empty = {
  nameUz: '',
  nameRu: '',
  imageUrl: '',
  basePricePerKg: 120000,
  minWeightKg: 1,
  maxWeightKg: 10,
  weightStep: 0.5,
  servingsPerKg: 6,
  sortOrder: 0,
  isActive: true,
};

export default function AdminCakeTypesPage() {
  const [items, setItems] = useState<CakeType[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient<CakeType[]>('/api/admin/cake/types');
      setItems(data || []);
    } catch (e) {
      window.alert((e as { message?: string }).message || 'Tort turlarini yuklab bo‘lmadi.');
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
      await apiClient(`/api/admin/cake/types${editing ? `/${editing}` : ''}`, {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...form,
          imageUrl: form.imageUrl || null,
        }),
      });
      setForm(empty);
      setEditing(null);
      await load();
    } catch (e) {
      window.alert((e as { message?: string }).message || 'Tort turini saqlab bo‘lmadi.');
    }
  };

  const startEdit = (item: CakeType) => {
    setEditing(item.id);
    setForm({
      nameUz: item.nameUz,
      nameRu: item.nameRu,
      imageUrl: item.imageUrl || '',
      basePricePerKg: item.basePricePerKg,
      minWeightKg: item.minWeightKg,
      maxWeightKg: item.maxWeightKg,
      weightStep: item.weightStep,
      servingsPerKg: item.servingsPerKg || 6,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id: number) => {
    if (!window.confirm('Haqiqatan ham bu tort turini o‘chirasizmi?')) return;
    try {
      await apiClient(`/api/admin/cake/types/${id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      window.alert((e as { message?: string }).message || 'Tort turini o‘chirib bo‘lmadi.');
    }
  };

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-4 sm:p-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1C261E] tracking-tight flex items-center gap-2">
          <Cake className="w-7 h-7 text-[#D4AF37]" />
          Tort Turlari, Vaznlari va Narxlari
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Bento tortlar, 1-qavatli, ko‘p qavatli va to‘y tortlari turlarini, har bir kg uchun boshlang‘ich narx va vazn chegaralarini boshqaring.
        </p>
      </div>

      {/* Forma */}
      <div className="rounded-2xl border border-amber-200/80 bg-white p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#1C261E] mb-4 flex items-center gap-2">
          {editing ? <Edit className="w-5 h-5 text-amber-600" /> : <Plus className="w-5 h-5 text-emerald-600" />}
          {editing ? 'Tort turini tahrirlash' : 'Yangi tort turi qo‘shish'}
        </h2>

        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Nomi (O‘zbekcha) *
              </label>
              <input
                required
                placeholder="Masalan: Bento tort (Mini)"
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
                placeholder="Например: Бенто торт (Мини)"
                value={form.nameRu}
                onChange={(e) => setForm({ ...form, nameRu: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-[#244B2B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                1 kg uchun asosiy narx (so‘mda) *
              </label>
              <input
                required
                type="number"
                min="1000"
                step="1000"
                placeholder="Masalan: 140000"
                value={form.basePricePerKg || ''}
                onChange={(e) => setForm({ ...form, basePricePerKg: Number(e.target.value) })}
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-[#244B2B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                1 kg uchun o‘rtacha porsiya soni (kishi)
              </label>
              <input
                type="number"
                min="1"
                placeholder="Masalan: 6"
                value={form.servingsPerKg || ''}
                onChange={(e) => setForm({ ...form, servingsPerKg: Number(e.target.value) })}
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-[#244B2B] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 sm:col-span-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Min vazn (kg) *
                </label>
                <input
                  required
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={form.minWeightKg}
                  onChange={(e) => setForm({ ...form, minWeightKg: Number(e.target.value) })}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-[#244B2B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Max vazn (kg) *
                </label>
                <input
                  required
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={form.maxWeightKg}
                  onChange={(e) => setForm({ ...form, maxWeightKg: Number(e.target.value) })}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-[#244B2B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Vazn qadami (kg) *
                </label>
                <input
                  required
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={form.weightStep}
                  onChange={(e) => setForm({ ...form, weightStep: Number(e.target.value) })}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-[#244B2B] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Rasm yuklash */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Tort turi fotosurati (Eskiz yoki namuna)
            </label>
            <div className="flex flex-wrap items-center gap-4">
              {form.imageUrl ? (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm">
                  <Image
                    src={form.imageUrl}
                    alt="Tort turi rasmi"
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
              Saytda buyurtma uchun faol
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
                {editing ? 'Saqlash' : 'Tort turini qo‘shish'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Ro'yxat */}
      {isLoading ? (
        <div className="p-8 text-center text-sm text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
          Yuklanmoqda…
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-gray-300 bg-white text-sm text-gray-500">
          Hozircha tort turlari yo‘q.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
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
                      <Cake className="w-8 h-8 opacity-40" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-[#1C261E] truncate" title={item.nameUz}>
                    {item.nameUz}
                  </h3>
                  <p className="text-xs text-gray-500 truncate" title={item.nameRu}>
                    {item.nameRu}
                  </p>
                  <p className="text-sm font-black text-[#244B2B] mt-1">
                    {formatCurrency(item.basePricePerKg)} <span className="text-xs font-normal text-gray-500">/ 1 kg</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-gray-400" />
                    Vazn: {item.minWeightKg}–{item.maxWeightKg} kg (qadam: {item.weightStep} kg)
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-4 border-t border-gray-100 text-xs">
                <span className={item.isActive ? 'text-emerald-600 font-semibold flex items-center gap-1' : 'text-gray-400'}>
                  {item.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                  {item.isActive ? 'Faol' : 'O‘chirilgan'}
                </span>

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
    </main>
  );
}
