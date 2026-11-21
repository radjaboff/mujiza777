'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  Plus, 
  Store, 
  Phone, 
  Clock, 
  MapPin, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Navigation, 
  Sparkles, 
  RefreshCw, 
  Car,
  AlertCircle,
  ExternalLink,
  Upload,
  Loader2,
  ImageIcon
} from 'lucide-react';
import { Branch } from '../../../lib/api/types';
import { apiClient } from '../../../lib/api/client';
import { uploadImageFile } from '../../../lib/api/upload';

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Forma parametrlari
  const [nameUz, setNameUz] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [addressUz, setAddressUz] = useState('');
  const [addressRu, setAddressRu] = useState('');
  const [phone, setPhone] = useState('+998 93 706 73 21');
  const [workHours, setWorkHours] = useState('09:00 - 22:00');
  const [latitude, setLatitude] = useState('38.8354');
  const [longitude, setLongitude] = useState('65.7923');
  const [imageUrl, setImageUrl] = useState('');
  const [isPickupAvailable, setIsPickupAvailable] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filiallarni yuklash
  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient<Array<Branch & { nameUz?: string; nameRu?: string; addressUz?: string; addressRu?: string }>>('/api/admin/branches');
      setBranches(Array.isArray(data) ? data.map((branch) => ({
        ...branch,
        name: branch.nameUz || branch.name || '',
        address: branch.addressUz || branch.address || '',
      })) : []);
    } catch (error) {
      setBranches([]);
      window.alert((error as { message?: string })?.message || 'Filiallarni serverdan yuklab bo‘lmadi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
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
      const url = await uploadImageFile(file, 'BRANCHES');
      setImageUrl(url);
    } catch {
      alert('Rasm yuklashda xatolik yuz berdi');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openCreateModal = () => {
    setEditingBranch(null);
    setNameUz('');
    setNameRu('');
    setAddressUz("Qarshi sh., ");
    setAddressRu("г. Карши, ");
    setPhone('+998 93 706 73 21');
    setWorkHours('09:00 - 22:00');
    setLatitude('38.8354');
    setLongitude('65.7923');
    setImageUrl('');
    setIsPickupAvailable(true);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (b: Branch) => {
    setEditingBranch(b);
    setNameUz(b.nameUz || b.name);
    setNameRu(b.nameRu || b.name);
    setAddressUz(b.addressUz || b.address);
    setAddressRu(b.addressRu || b.address);
    setPhone(b.phone || '+998 93 706 73 21');
    setWorkHours(b.workHours || '09:00 - 22:00');
    setLatitude(b.latitude ? String(b.latitude) : '38.8354');
    setLongitude(b.longitude ? String(b.longitude) : '65.7923');
    setImageUrl(b.imageUrl || '');
    setIsPickupAvailable(b.isPickupAvailable ?? true);
    setIsActive(b.isActive ?? true);
    setIsModalOpen(true);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameUz.trim() || !addressUz.trim()) {
      alert("Iltimos, filial nomi va manzilini to‘liq kiriting!");
      return;
    }

    setIsSaving(true);

    const payload = {
      nameUz,
      nameRu: nameRu || nameUz,
      addressUz,
      addressRu: addressRu || addressUz,
      phone: phone.replace(/\s/g, ''),
      workHours,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      imageUrl: imageUrl.trim() || null,
      isPickupAvailable,
      isActive,
      sortOrder: editingBranch ? editingBranch.sortOrder : branches.length + 1,
    };

    try {
      if (editingBranch) {
        await apiClient(`/api/admin/branches/${editingBranch.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiClient('/api/admin/branches', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      await fetchBranches();
      setIsModalOpen(false);
    } catch (error) {
      window.alert((error as { message?: string })?.message || 'Filialni saqlab bo‘lmadi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBranch = async (id: number) => {
    if (!window.confirm("Haqiqatan ham bu filialni o‘chirmoqchimisiz?")) return;

    try {
      await apiClient(`/api/admin/branches/${id}`, { method: 'DELETE' });
      await fetchBranches();
    } catch (error) {
      window.alert((error as { message?: string })?.message || 'Filialni o‘chirib bo‘lmadi.');
    }
  };

  const toggleBranchActive = async (b: Branch) => {
    try {
      await apiClient(`/api/admin/branches/${b.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          nameUz: b.nameUz || b.name,
          nameRu: b.nameRu || b.name,
          addressUz: b.addressUz || b.address,
          addressRu: b.addressRu || b.address,
          phone: (b.phone || '+998937067321').replace(/\s/g, ''),
          workHours: b.workHours || '09:00 - 22:00',
          latitude: b.latitude,
          longitude: b.longitude,
          imageUrl: b.imageUrl,
          isPickupAvailable: b.isPickupAvailable ?? true,
          isActive: !b.isActive,
          sortOrder: b.sortOrder || 0,
        }),
      });
      await fetchBranches();
    } catch (error) {
      window.alert((error as { message?: string })?.message || 'Holatni yangilab bo‘lmadi.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Sarlavha va Yangi Filial Qo'shish Tugmasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E9E5DD]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C261E] tracking-tight flex items-center gap-2">
            <Store className="w-7 h-7 text-[#D4AF37]" />
            Filiallar va Do‘konlar Boshqaruvi
          </h1>
          <p className="text-xs sm:text-sm text-[#596B5E] mt-0.5">
            Qarshi shahridagi qandolat uylari, manzillar, ish vaqti, fotosuratlar va xarita koordinatalari
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#244B2B] hover:bg-[#1B3820] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Yangi filial qo‘shish</span>
        </button>
      </div>

      {/* Filiallar Ro'yxati */}
      {isLoading ? (
        <div className="py-16 text-center text-[#596B5E]">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#244B2B]" />
          <p className="text-sm font-semibold">Filiallar yuklanmoqda...</p>
        </div>
      ) : branches.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-[#E9E5DD] p-8 space-y-3">
          <Store className="w-12 h-12 text-[#D4AF37] mx-auto opacity-50" />
          <h3 className="font-bold text-base text-[#1C261E]">Filiallar topilmadi</h3>
          <p className="text-xs text-[#596B5E] max-w-sm mx-auto">
            Hozircha hech qanday filial kiritilmagan. Yuqoridagi tugma orqali birinchi filialingizni qo‘shing.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {branches.map((b) => {
            const yandexCoord = b.latitude && b.longitude ? `${b.latitude},${b.longitude}` : '38.8354,65.7923';
            const routeUrl = `https://yandex.uz/maps/?rtext=~${yandexCoord}&rtt=auto`;

            return (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-[#E9E5DD] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Filial rasmi yoki ikonka */}
                  <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                    {b.imageUrl ? (
                      <Image
                        src={b.imageUrl}
                        alt={b.nameUz || b.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <Store className="w-10 h-10 opacity-30 text-[#244B2B] mb-1" />
                        <span className="text-xs">Rasm kiritilmagan</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                      <button
                        type="button"
                        onClick={() => toggleBranchActive(b)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm cursor-pointer transition-colors ${
                          b.isActive !== false
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-700 text-white'
                        }`}
                      >
                        {b.isActive !== false ? '● Faol' : '○ Yashirin'}
                      </button>
                    </div>
                  </div>

                  {/* Tepasi: Nomi */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base text-[#1C261E]">
                        {b.nameUz || b.name}
                      </h3>
                      {b.nameRu && (
                        <p className="text-[11px] text-[#8C9B90]">
                          {b.nameRu}
                        </p>
                      )}
                    </div>
                    {b.isPickupAvailable && (
                      <span className="text-[10px] font-semibold text-[#AA820A] bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                        Olib ketish bor
                      </span>
                    )}
                  </div>

                  {/* Tafsilotlar: Manzil, Ish vaqti, Telefon va Koordinata */}
                  <div className="space-y-2 text-xs text-[#596B5E] pt-2 border-t border-[#E9E5DD]">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#244B2B] flex-shrink-0 mt-0.5" />
                      <span className="font-medium text-[#1C261E] leading-snug">
                        {b.addressUz || b.address}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                      <span>Ish vaqti: <strong className="text-[#1C261E]">{b.workHours || '09:00 - 22:00'}</strong></span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-[#244B2B] flex-shrink-0" />
                      <a href={`tel:${b.phone}`} className="font-bold text-[#244B2B] hover:underline">
                        {b.phone}
                      </a>
                    </div>

                    {b.latitude && b.longitude && (
                      <div className="flex items-center gap-2.5 text-[11px] text-[#8C9B90] font-mono">
                        <Navigation className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                        <span>{b.latitude.toFixed(4)}, {b.longitude.toFixed(4)}</span>
                        <a
                          href={routeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto text-[#244B2B] font-sans font-semibold hover:underline flex items-center gap-0.5 text-[10px]"
                        >
                          <span>Xaritada</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pastki Harakat Tugmalari */}
                <div className="pt-3 border-t border-[#E9E5DD] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(b)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#F4EFE6] hover:bg-[#EAE4D7] text-[#1C261E] text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-[#AA820A]" />
                    <span>Tahrirlash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteBranch(b.id)}
                    className="py-2 px-3 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                    title="O‘chirish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filial Qo'shish / Tahrirlash Modali */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#E9E5DD] space-y-5 my-8">
            {/* Modal Sarlavhasi */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E5DD]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#244B2B] text-[#D4AF37] flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#1C261E]">
                    {editingBranch ? 'Filialni tahrirlash' : 'Yangi filial qo‘shish'}
                  </h3>
                  <p className="text-xs text-[#596B5E]">
                    Qarshi shahridagi Mo‘jiza 777 filiali ma’lumotlari
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Formasi */}
            <form onSubmit={handleSaveBranch} className="space-y-4">
              {/* Nomi (O'zbekcha va Ruscha) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C261E] mb-1">
                    Filial nomi (UZ) *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameUz}
                    onChange={(e) => setNameUz(e.target.value)}
                    placeholder="Markaziy filial"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-xs font-semibold focus:outline-none focus:border-[#244B2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C261E] mb-1">
                    Filial nomi (RU)
                  </label>
                  <input
                    type="text"
                    value={nameRu}
                    onChange={(e) => setNameRu(e.target.value)}
                    placeholder="Главный филиал"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-xs font-semibold focus:outline-none focus:border-[#244B2B]"
                  />
                </div>
              </div>

              {/* Manzil (O'zbekcha va Ruscha) */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C261E] mb-1">
                    Aniq manzil (UZ) *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressUz}
                    onChange={(e) => setAddressUz(e.target.value)}
                    placeholder="Qarshi sh., Islom Karimov ko'chasi 14"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-xs font-semibold focus:outline-none focus:border-[#244B2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C261E] mb-1">
                    Aniq manzil (RU)
                  </label>
                  <input
                    type="text"
                    value={addressRu}
                    onChange={(e) => setAddressRu(e.target.value)}
                    placeholder="г. Карши, ул. Ислама Каримова, 14"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-xs font-semibold focus:outline-none focus:border-[#244B2B]"
                  />
                </div>
              </div>

              {/* Telefon va Ish vaqti */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C261E] mb-1">
                    Telefon raqam *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 93 706 73 21"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-xs font-semibold focus:outline-none focus:border-[#244B2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C261E] mb-1">
                    Ish vaqti *
                  </label>
                  <input
                    type="text"
                    required
                    value={workHours}
                    onChange={(e) => setWorkHours(e.target.value)}
                    placeholder="09:00 - 22:00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-xs font-semibold focus:outline-none focus:border-[#244B2B]"
                  />
                </div>
              </div>

              {/* Rasm yuklash maydoni */}
              <div className="rounded-2xl border border-[#E9E5DD] p-3.5 bg-[#FBF9F4]">
                <label className="block text-xs font-bold text-[#1C261E] uppercase tracking-wider mb-2">
                  🏪 Filial fotosurati (Do‘kon binosi / Zali)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {imageUrl ? (
                    <div className="relative w-24 h-16 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm flex-shrink-0">
                      <Image
                        src={imageUrl}
                        alt="Filial rasmi"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 bg-white flex-shrink-0">
                      <ImageIcon className="w-6 h-6 opacity-40" />
                    </div>
                  )}

                  <div className="flex-1 min-w-[200px] space-y-1.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-600 text-emerald-700 bg-emerald-50 text-xs font-bold hover:bg-emerald-100 transition-colors"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Yuklanmoqda…
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          Kompyuter / Telefonda rasm tanlash
                        </>
                      )}
                    </button>
                    <input
                      type="text"
                      placeholder="Yoki to‘g‘ridan-to‘g‘ri rasm URL manzilini kiriting"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full rounded-lg border border-[#E9E5DD] p-1.5 text-xs text-gray-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Yandex Xarita Koordinatalari */}
              <div className="p-3.5 rounded-2xl bg-[#F8F6F0] border border-[#E9E5DD] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1C261E] flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Xarita koordinatalari (Yandex Maps uchun):</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-[#596B5E] mb-0.5">
                      Kenglik (Latitude):
                    </label>
                    <input
                      type="text"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="38.8354"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#E9E5DD] text-xs font-mono font-bold bg-white focus:outline-none focus:border-[#244B2B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-[#596B5E] mb-0.5">
                      Uzunlik (Longitude):
                    </label>
                    <input
                      type="text"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="65.7923"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#E9E5DD] text-xs font-mono font-bold bg-white focus:outline-none focus:border-[#244B2B]"
                    />
                  </div>
                </div>

                {/* Tezkor Qarshi koordinatalari shablonlari */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-[#596B5E]">Tezkor nuqta:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setLatitude('38.8354');
                      setLongitude('65.7923');
                    }}
                    className="px-2 py-0.5 rounded-md bg-white hover:bg-emerald-50 border border-[#E9E5DD] text-[10px] font-bold text-[#244B2B] transition-colors"
                  >
                    📍 Markaziy (Karimov ko‘chasi)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLatitude('38.8451');
                      setLongitude('65.8012');
                    }}
                    className="px-2 py-0.5 rounded-md bg-white hover:bg-emerald-50 border border-[#E9E5DD] text-[10px] font-bold text-[#244B2B] transition-colors"
                  >
                    📍 Nasaf ko‘chasi
                  </button>
                </div>
              </div>

              {/* Qo'shimcha Sozlamalar: Olib ketish va Faollik */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E9E5DD]">
                <label className="flex items-center gap-2 text-xs font-bold text-[#1C261E] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPickupAvailable}
                    onChange={(e) => setIsPickupAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-[#244B2B] focus:ring-[#244B2B]"
                  />
                  <span>Olib ketish (Samovivoz) mavjud</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-[#1C261E] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#244B2B] focus:ring-[#244B2B]"
                  />
                  <span>Saytda ko‘rinsin (Faol)</span>
                </label>
              </div>

              {/* Saqlash va Bekor Qilish Tugmalari */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9E5DD]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#E9E5DD] text-xs font-bold text-[#596B5E] hover:bg-gray-100 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#244B2B] hover:bg-[#1B3820] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saqlanmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Saqlash</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
