'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  Plus, 
  Layers, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Upload, 
  X, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { Category } from '../../../lib/api/types';
import { apiClient } from '../../../lib/api/client';
import { uploadImageFile } from '../../../lib/api/upload';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  // Forma parametrlari
  const [nameUz, setNameUz] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [slug, setSlug] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = async () => {
    try {
      const data = await apiClient<Array<Category & { nameUz: string; nameRu: string; sortOrder: number; isActive: boolean }>>('/api/admin/categories');
      setCategories(data.map((item) => ({ ...item, name: item.nameUz })));
    } catch (error) {
      setCategories([]);
      window.alert((error as { message?: string })?.message || 'Toifalarni serverdan yuklab bo‘lmadi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCat(null);
    setNameUz('');
    setNameRu('');
    setSlug('');
    setImageUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCat(cat);
    setNameUz(cat.nameUz || cat.name);
    setNameRu(cat.nameRu || cat.name);
    setSlug(cat.slug);
    setImageUrl(cat.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImageFile(file, 'CATEGORIES');
      setImageUrl(url);
    } catch (err) {
      console.error('Toifa rasmini yuklashda xatolik:', err);
      alert('Rasmni yuklashda xatolik yuz berdi');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Haqiqatan ham bu toifani o'chirmoqchimisiz?")) return;
    try {
      await apiClient(`/api/admin/categories/${id}`, { method: 'DELETE' });
      fetchCategories();
    } catch (error) {
      window.alert((error as { message?: string })?.message || 'Toifani o‘chirib bo‘lmadi.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nameUz,
      nameRu: nameRu || nameUz,
      slug: slug || nameUz.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `cat-${Date.now()}`,
      imageUrl: imageUrl || null,
      sortOrder: editingCat?.sortOrder || 0,
      isActive: editingCat?.isActive ?? true,
    };

    try {
      if (editingCat) {
        await apiClient(`/api/admin/categories/${editingCat.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            nameUz: payload.nameUz,
            nameRu: payload.nameRu,
            slug: payload.slug,
            imageUrl: payload.imageUrl,
            sortOrder: payload.sortOrder,
            isActive: payload.isActive,
          }),
        });
      } else {
        await apiClient('/api/admin/categories', {
          method: 'POST',
          body: JSON.stringify({
            nameUz: payload.nameUz,
            nameRu: payload.nameRu,
            slug: payload.slug,
            imageUrl: payload.imageUrl,
            sortOrder: payload.sortOrder,
            isActive: payload.isActive,
          }),
        });
      }
      await fetchCategories();
      setIsModalOpen(false);
    } catch (error) {
      window.alert((error as { message?: string })?.message || 'Toifani saqlab bo‘lmadi.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Sarlavha va Yangi toifa qo'shish */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E9E5DD]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C261E] tracking-tight">
            Mahsulot toifalari
          </h1>
          <p className="text-xs sm:text-sm text-[#596B5E] mt-0.5">
            Katalogdagi toifalar va Safia uslubidagi yumaloq fotosuratlar
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#244B2B] text-white hover:bg-[#1A3720] font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Yangi toifa qo‘shish</span>
        </button>
      </div>

      {/* Toifalar Ro‘yxati (Mobil Kartochkalar + Desktop Jadval) */}
      <div className="bg-white rounded-3xl border border-[#E9E5DD] overflow-hidden shadow-sm">
        
        {/* Mobil uchun ixcham kartochkalar (md:hidden) */}
        <div className="md:hidden divide-y divide-[#E9E5DD]">
          {categories.map((cat) => (
            <div key={cat.id} className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full bg-[#F4EFE6] border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                  {cat.imageUrl ? (
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <Layers className="w-5 h-5 text-[#244B2B]" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-[#1C261E] truncate">{cat.name}</div>
                  <div className="font-mono text-xs text-[#596B5E] truncate">/{cat.slug}</div>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => openEditModal(cat)}
                  className="p-2 text-[#596B5E] hover:text-[#244B2B] rounded-xl hover:bg-[#F4EFE6] active:scale-95 transition-all"
                  title="Tahrirlash"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-2 text-[#B83A3A] hover:text-red-700 rounded-xl hover:bg-rose-50 active:scale-95 transition-all"
                  title="O‘chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Jadval (hidden md:table) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FBF9F4] text-[#596B5E] text-[11px] uppercase tracking-wider border-b border-[#E9E5DD]">
              <tr>
                <th className="py-4 px-6">Toifa fotosurati va nomi</th>
                <th className="py-4 px-4">Havola (Slug)</th>
                <th className="py-4 px-6 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E5DD]">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#FBF9F4]/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-[#1C261E]">
                    <div className="flex items-center gap-3">
                      {/* Dumaloq toifa rasmi (Safia kapsulasi namunasi) */}
                      <div className="w-12 h-12 rounded-full bg-[#F4EFE6] border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                        {cat.imageUrl ? (
                          <Image
                            src={cat.imageUrl}
                            alt={cat.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <Layers className="w-5 h-5 text-[#244B2B]" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#1C261E]">{cat.name}</div>
                        <span className="text-[11px] text-[#8C9B90] font-normal">
                          Katalog bo'limi
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono text-xs text-[#596B5E]">
                    /{cat.slug}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-2 text-[#596B5E] hover:text-[#244B2B] rounded-lg hover:bg-[#F4EFE6] transition-colors cursor-pointer"
                        title="Tahrirlash va rasmini o'zgartirish"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2 text-[#596B5E] hover:text-[#B83A3A] rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="O‘chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yangi Toifa Qo‘shish / Tahrirlash Modali */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E9E5DD]">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E5DD] mb-5">
              <h3 className="text-xl font-bold text-[#1C261E]">
                {editingCat ? 'Toifani tahrirlash' : 'Yangi toifa qo‘shish'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-[#596B5E] hover:text-[#1C261E] hover:bg-[#F4EFE6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              {/* TOIFA RASMINI YUKLASH (Safia kapsulasi uchun dumaloq namuna bilan) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#1C261E]">
                  Toifa fotosurati (Safia uslubidagi dumaloq rasm)
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />

                {imageUrl ? (
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#FBF9F4] border border-[#E9E5DD]">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-white">
                      <Image
                        src={imageUrl}
                        alt="Toifa rasmi"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-[#1C261E] block">
                        Rasm tanlandi
                      </span>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 rounded-lg bg-white border border-[#E9E5DD] text-[11px] font-bold text-[#244B2B] hover:bg-[#F4EFE6]"
                        >
                          Almashtirish
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 text-[11px] font-bold text-[#B83A3A] hover:bg-rose-100"
                        >
                          O‘chirish
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 rounded-2xl border-2 border-dashed border-[#D4AF37]/50 hover:border-[#244B2B] bg-[#FDFBF7] hover:bg-[#F9F6EE] transition-all flex flex-col items-center justify-center cursor-pointer p-4 text-center group"
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2 text-[#244B2B]">
                        <Loader2 className="w-7 h-7 animate-spin" />
                        <span className="text-xs font-bold">Rasm yuklanmoqda...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-[#244B2B]/10 group-hover:bg-[#244B2B]/20 flex items-center justify-center text-[#244B2B] mb-1.5 transition-colors">
                          <Upload className="w-5 h-5 text-[#244B2B]" />
                        </div>
                        <span className="text-xs font-bold text-[#1C261E] group-hover:text-[#244B2B]">
                          Kompyuterdan toifa rasmini tanlang
                        </span>
                        <span className="text-[11px] text-[#8C9B90] mt-0.5">
                          Tort, ekler yoki rulet rasmi (JPG, PNG)
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Havola (URL) orqali kiritish */}
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Yoki to'g'ridan-to'g'ri rasm URL manzilini kiriting..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E9E5DD] text-[11px] text-[#596B5E] focus:outline-none focus:border-[#244B2B] bg-white"
                />
              </div>

              {/* Toifa nomi */}
              <div>
                <label className="block text-xs font-bold text-[#1C261E] mb-1">
                  Toifa nomi *
                </label>
                <input
                  type="text"
                  required
                  value={nameUz}
                  onChange={(e) => setNameUz(e.target.value)}
                  placeholder="Masalan: Yumaloq tortlar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-xs sm:text-sm focus:outline-none focus:border-[#244B2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C261E] mb-1">Toifa nomi (ruscha) *</label>
                <input type="text" required value={nameRu} onChange={(e) => setNameRu(e.target.value)} placeholder="Например: Торты" className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-xs sm:text-sm focus:outline-none focus:border-[#244B2B]" />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-bold text-[#1C261E] mb-1">
                  Havola (Slug) — ixtiyoriy
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="masalan: yumaloq-tortlar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-xs sm:text-sm focus:outline-none focus:border-[#244B2B]"
                />
              </div>

              {/* Tugmalar */}
              <div className="flex gap-3 pt-3 border-t border-[#E9E5DD]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#E9E5DD] text-xs font-bold text-[#1C261E] hover:bg-[#F4EFE6] cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#244B2B] text-white hover:bg-[#1A3720] text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {editingCat ? 'Saqlash' : 'Qo‘shish'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
