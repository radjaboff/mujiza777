'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { 
  Camera, 
  Plus, 
  Trash2, 
  Sparkles, 
  Cake, 
  Heart, 
  Square, 
  Crown, 
  Upload, 
  Loader2, 
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCmsContent, CakeShowcaseItem, DEFAULT_CMS_CONTENT } from '../../../../lib/cms/content';

const SHAPES = [
  { id: 1, name: 'Dumaloq (Klassik)', icon: Cake },
  { id: 2, name: 'Yurakcha (Romantik)', icon: Heart },
  { id: 3, name: 'To‘rtburchak (Bayramona)', icon: Square },
  { id: 4, name: 'Ko‘p yarusli (To‘y va Marosim)', icon: Crown },
];

export default function AdminCakeShowcasePage() {
  const { content, updateContent } = useCmsContent();
  const [selectedShapeFilter, setSelectedShapeFilter] = useState<number>(0);
  const [isAdding, setIsAdding] = useState(false);

  // Yangi rasm qo'shish formasi
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [newShapeId, setNewShapeId] = useState<number>(1);
  const [newTitleUz, setNewTitleUz] = useState('');
  const [newTitleRu, setNewTitleRu] = useState('');
  const [newTagUz, setNewTagUz] = useState('Yangi asar');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const showcaseItems = content.cakeShowcase || DEFAULT_CMS_CONTENT.cakeShowcase;

  const filteredItems = selectedShapeFilter === 0 
    ? showcaseItems 
    : showcaseItems.filter((item) => item.shapeId === selectedShapeFilter);

  // Fayl yuklash
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Rasm hajmi 8 MB dan oshmasligi kerak');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/public/files/cake-reference', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setNewImageUrl(data.url);
      } else {
        alert('Serverga rasm yuklab bo‘lmadi, URL manzilini qo‘lda kiriting.');
      }
    } catch {
      alert('Rasm yuklashda xatolik yuz berdi.');
    } finally {
      setUploading(false);
    }
  };

  // Yangi rasmni saqlash
  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) {
      alert('Iltimos, rasm yuklang yoki uning URL manzilini kiriting!');
      return;
    }

    const newItem: CakeShowcaseItem = {
      id: `cs-${Date.now()}`,
      shapeId: newShapeId,
      titleUz: newTitleUz.trim() || 'Mo‘jiza 777 maxsus torti',
      titleRu: newTitleRu.trim() || newTitleUz.trim() || 'Торт Mo‘jiza 777',
      tagUz: newTagUz.trim() || 'Maxsus asar',
      tagRu: 'Авторский торт',
      imageUrl: newImageUrl.trim(),
    };

    const updated = [newItem, ...showcaseItems];
    updateContent({ ...content, cakeShowcase: updated });

    // Formani tozalash
    setNewTitleUz('');
    setNewTitleRu('');
    setNewImageUrl('');
    setIsAdding(false);
    setStatusMessage('Yangi tort rasmi muvaffaqiyatli qo‘shildi!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Rasmni o'chirish
  const handleDelete = (id: string) => {
    if (!confirm('Haqiqatan ham bu rasmni vitrinadan o‘chirmoqchimisiz?')) return;
    const updated = showcaseItems.filter((item) => item.id !== id);
    updateContent({ ...content, cakeShowcase: updated });
    setStatusMessage('Rasm o‘chirildi!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Standart holatga qaytarish
  const handleReset = () => {
    if (!confirm('Barcha rasmlarni standart Mo‘jiza 777 rasmlariga qaytarmoqchimisiz?')) return;
    updateContent({ ...content, cakeShowcase: DEFAULT_CMS_CONTENT.cakeShowcase });
    setStatusMessage('Standart rasmlar tiklandi!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
      
      {/* Sarlavha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E9E5DD]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#8A6232] text-xs font-bold uppercase mb-1">
            <Camera className="w-3.5 h-3.5" />
            <span>Tort yasash vitrinasi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C261E]">
            Tort rasmlari karuseli
          </h1>
          <p className="text-xs sm:text-sm text-[#596B5E] mt-1">
            «Tort yasash» bo‘limining o‘ng tomonidagi karuselda aylanib turadigan haqiqiy Mo‘jiza 777 tortlari rasmlarini boshqarish.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all cursor-pointer"
            title="Standart rasmlarga qaytarish"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Asliga qaytarish</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#244B2B] hover:bg-[#1E3D24] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi rasm qo‘shish</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Yangi rasm qo'shish formasi */}
      {isAdding && (
        <form onSubmit={handleSaveNew} className="p-5 sm:p-6 rounded-2xl border-2 border-[#D4AF37] bg-white shadow-lg space-y-4">
          <h2 className="text-base font-bold text-[#1C261E] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>Yangi tort fotosurati qo‘shish</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Qaysi shakl uchun? *
              </label>
              <select
                value={newShapeId}
                onChange={(e) => setNewShapeId(Number(e.target.value))}
                className="w-full rounded-xl border p-2.5 text-xs sm:text-sm bg-gray-50 font-medium"
              >
                {SHAPES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Yorliq / Kategoriya (masalan: To‘y torti, Tug‘ilgan kun)
              </label>
              <input
                type="text"
                value={newTagUz}
                onChange={(e) => setNewTagUz(e.target.value)}
                placeholder="Tug‘ilgan kun"
                className="w-full rounded-xl border p-2.5 text-xs sm:text-sm bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Tort nomi / tavsifi (UZ)
              </label>
              <input
                type="text"
                value={newTitleUz}
                onChange={(e) => setNewTitleUz(e.target.value)}
                placeholder="Masalan: Qulupnayli shokoladli shohona tort"
                className="w-full rounded-xl border p-2.5 text-xs sm:text-sm bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Tort nomi (RU) - ixtiyoriy
              </label>
              <input
                type="text"
                value={newTitleRu}
                onChange={(e) => setNewTitleRu(e.target.value)}
                placeholder="Например: Клубнично-шоколадный торт"
                className="w-full rounded-xl border p-2.5 text-xs sm:text-sm bg-gray-50"
              />
            </div>
          </div>

          {/* Rasm tanlash / Yuklash */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Tort fotosurati *
            </label>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-dashed border-[#244B2B] bg-[#244B2B]/5 hover:bg-[#244B2B]/10 text-[#244B2B] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Yuklanmoqda...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Kompyuterdan rasm yuklash</span>
                  </>
                )}
              </button>

              <span className="text-xs text-gray-500 font-bold">yoki URL manzilini kiriting:</span>

              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://... yoki /uploads/cakes/..."
                className="flex-1 w-full rounded-xl border p-2.5 text-xs bg-gray-50"
              />
            </div>

            {newImageUrl && (
              <div className="mt-3 relative w-24 h-24 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md">
                <Image src={newImageUrl} alt="Preview" fill className="object-cover" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl border text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#244B2B] text-white text-xs font-bold hover:bg-[#1E3D24] shadow-md cursor-pointer"
            >
              Saqlash va Vitrinaga qo‘shish
            </button>
          </div>
        </form>
      )}

      {/* Shakl bo'yicha filter tugmalari */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setSelectedShapeFilter(0)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedShapeFilter === 0
              ? 'bg-[#244B2B] text-white shadow-sm'
              : 'bg-white border text-gray-700 hover:bg-gray-50'
          }`}
        >
          Barchasi ({showcaseItems.length})
        </button>

        {SHAPES.map((shape) => {
          const count = showcaseItems.filter((i) => i.shapeId === shape.id).length;
          const isSelected = selectedShapeFilter === shape.id;
          return (
            <button
              key={shape.id}
              type="button"
              onClick={() => setSelectedShapeFilter(shape.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#244B2B] text-white shadow-sm'
                  : 'bg-white border text-gray-700 hover:bg-gray-50'
              }`}
            >
              {shape.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Rasmlar panjarasi (Gallery Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const shapeObj = SHAPES.find((s) => s.id === item.shapeId);
          return (
            <div
              key={item.id}
              className="group rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.titleUz}
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-bold text-[#F5E6B3]">
                  {shapeObj?.name.split(' ')[0] || 'Tort'}
                </span>
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-[#244B2B]/90 text-[10px] font-semibold text-white">
                  {item.tagUz}
                </span>
              </div>

              <div className="p-3.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-gray-900 truncate">
                    {item.titleUz}
                  </span>
                  <span className="block text-[10px] text-gray-500 truncate">
                    ID: {item.id}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer flex-shrink-0"
                  title="O‘chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </main>
  );
}
