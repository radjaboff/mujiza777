'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  Send, 
  MapPin, 
  Clock, 
  DollarSign, 
  X,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Vacancy } from '../../../lib/api/types';
import { getStoredVacancies, saveStoredVacancies, DEFAULT_VACANCIES } from '../../../lib/vacancies';

export default function AdminVacanciesPage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);

  // Forma ma'lumotlari
  const [title, setTitle] = useState('');
  const [titleRu, setTitleRu] = useState('');
  const [type, setType] = useState('To‘liq stavka');
  const [location, setLocation] = useState('Markaziy filial (Qarshi)');
  const [salary, setSalary] = useState('4 000 000 – 7 000 000 so‘m');
  const [description, setDescription] = useState('');
  const [descriptionRu, setDescriptionRu] = useState('');
  const [contactPhone, setContactPhone] = useState('+998 93 706 73 21');
  const [telegramUsername, setTelegramUsername] = useState('mojiza777_admin');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    setVacancies(getStoredVacancies());
  }, []);

  const openCreateModal = () => {
    setEditingVacancy(null);
    setTitle('');
    setTitleRu('');
    setType('To‘liq stavka');
    setLocation('Markaziy filial (Qarshi)');
    setSalary('4 000 000 – 7 000 000 so‘m');
    setDescription('');
    setDescriptionRu('');
    setContactPhone('+998 93 706 73 21');
    setTelegramUsername('mojiza777_admin');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (vac: Vacancy) => {
    setEditingVacancy(vac);
    setTitle(vac.title);
    setTitleRu(vac.titleRu || '');
    setType(vac.type);
    setLocation(vac.location);
    setSalary(vac.salary || '');
    setDescription(vac.description);
    setDescriptionRu(vac.descriptionRu || '');
    setContactPhone(vac.contactPhone);
    setTelegramUsername(vac.telegramUsername);
    setIsActive(vac.isActive);
    setIsModalOpen(true);
  };

  const handleToggleActive = (id: number) => {
    const updated = vacancies.map((v) =>
      v.id === id ? { ...v, isActive: !v.isActive } : v
    );
    setVacancies(updated);
    saveStoredVacancies(updated);
  };

  const handleDelete = (id: number, titleName: string) => {
    if (!confirm(`Haqiqatan ham "${titleName}" vakansiyasini o‘chirmoqchimisiz?`)) return;
    const updated = vacancies.filter((v) => v.id !== id);
    setVacancies(updated);
    saveStoredVacancies(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Iltimos, lavozim nomini kiriting!');
      return;
    }

    const payload: Vacancy = {
      id: editingVacancy ? editingVacancy.id : Date.now(),
      title: title.trim(),
      titleRu: titleRu.trim() || undefined,
      type,
      location,
      salary: salary.trim() || null,
      description: description.trim(),
      descriptionRu: descriptionRu.trim() || undefined,
      contactPhone: contactPhone.trim(),
      telegramUsername: telegramUsername.trim().replace(/^@/, ''),
      isActive,
      createdAt: editingVacancy?.createdAt || new Date().toISOString().split('T')[0],
    };

    let updated: Vacancy[];
    if (editingVacancy) {
      updated = vacancies.map((v) => (v.id === editingVacancy.id ? payload : v));
    } else {
      updated = [payload, ...vacancies];
    }

    setVacancies(updated);
    saveStoredVacancies(updated);
    setIsModalOpen(false);
  };

  const filteredVacancies = vacancies.filter((v) => {
    const matchesSearch = 
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.location.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? v.isActive :
      !v.isActive;

    return matchesSearch && matchesStatus;
  });

  const activeCount = vacancies.filter((v) => v.isActive).length;
  const inactiveCount = vacancies.length - activeCount;

  return (
    <div className="space-y-8">
      
      {/* 1. Sarlavha qatori */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E9E5DD]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <Briefcase className="w-4 h-4 text-[#D4AF37]" />
            <span>Karyera va Jamoa boshqaruvi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C261E] tracking-tight mt-0.5">
            Ochiq vakansiyalar
          </h1>
          <p className="text-xs sm:text-sm text-[#596B5E] mt-0.5">
            «Biz haqimizda» sahifasida ko‘rinadigan barcha bo‘sh ish o‘rinlarini boshqarish
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#244B2B] text-white hover:bg-[#1A3720] font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Yangi vakansiya qo‘shish</span>
        </button>
      </div>

      {/* 2. Statistika paneli (Mobil uchun qulay 3-ustun) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E9E5DD] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-[#8C9B90] uppercase tracking-wider block">Jami</span>
            <span className="text-base sm:text-3xl font-black text-[#1C261E]">{vacancies.length} ta</span>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#F4EFE6] flex items-center justify-center text-[#244B2B] flex-shrink-0">
            <Briefcase className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E9E5DD] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-emerald-700 uppercase tracking-wider block">Faol</span>
            <span className="text-base sm:text-3xl font-black text-emerald-800">{activeCount} ta</span>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E9E5DD] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-[#8C9B90] uppercase tracking-wider block">Yopiq</span>
            <span className="text-base sm:text-3xl font-black text-[#8C9B90]">{inactiveCount} ta</span>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-neutral-100 flex items-center justify-center text-[#8C9B90] flex-shrink-0">
            <XCircle className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* 3. Filtr va Qidiruv */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E9E5DD] shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C9B90] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Vakansiya nomi, filial yoki talablar bo‘yicha qidiring..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm outline-none bg-neutral-50 border border-transparent focus:border-[#244B2B] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-[#244B2B] text-white shadow-sm'
                : 'text-[#596B5E] hover:bg-[#F4EFE6]'
            }`}
          >
            Barchasi ({vacancies.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-[#596B5E] hover:bg-emerald-50'
            }`}
          >
            Faol ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === 'inactive'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-[#596B5E] hover:bg-neutral-100'
            }`}
          >
            Yopiq ({inactiveCount})
          </button>
        </div>
      </div>

      {/* 4. Vakansiyalar ro'yxati (Kartochkalar) */}
      {filteredVacancies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVacancies.map((vac) => (
            <div
              key={vac.id}
              className={`bg-white rounded-3xl border p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative ${
                vac.isActive ? 'border-[#E9E5DD]' : 'border-neutral-200 opacity-60 bg-neutral-50/70'
              }`}
            >
              <div className="space-y-3">
                
                {/* Tepasi: Nishon va Holat */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                    {vac.type}
                  </span>

                  <button
                    onClick={() => handleToggleActive(vac.id)}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full transition-colors cursor-pointer ${
                      vac.isActive
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                    }`}
                    title={vac.isActive ? "Saytda yashirish (Yopish)" : "Saytda faollashtirish"}
                  >
                    {vac.isActive ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Faol</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Yopiq</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Sarlavha */}
                <div>
                  <h3 className="font-bold text-lg text-[#1C261E] leading-snug">
                    {vac.title}
                  </h3>
                  {vac.titleRu && (
                    <span className="text-xs text-[#8C9B90] block mt-0.5">
                      {vac.titleRu}
                    </span>
                  )}
                </div>

                {/* Tavsif */}
                <p className="text-xs text-[#596B5E] leading-relaxed line-clamp-3">
                  {vac.description}
                </p>

                {/* Ma'lumotlar ro'yxati */}
                <div className="space-y-1.5 pt-3 border-t border-[#E9E5DD] text-xs text-[#596B5E]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#244B2B] flex-shrink-0" />
                    <span>{vac.location}</span>
                  </div>

                  {vac.salary && (
                    <div className="flex items-center gap-2 font-bold text-[#1C261E]">
                      <DollarSign className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                      <span>{vac.salary}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#244B2B] flex-shrink-0" />
                    <a href={`tel:${vac.contactPhone.replace(/\s+/g, '')}`} className="hover:underline">
                      {vac.contactPhone}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-[#244B2B]">
                    <Send className="w-3.5 h-3.5 flex-shrink-0 text-[#244B2B]" />
                    <a
                      href={`https://t.me/${vac.telegramUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline font-bold"
                    >
                      @{vac.telegramUsername}
                    </a>
                  </div>
                </div>

              </div>

              {/* Pastki Harakatlar */}
              <div className="pt-3 border-t border-[#E9E5DD] flex items-center justify-between">
                <span className="text-[10px] text-[#8C9B90]">
                  Qo‘shildi: {vac.createdAt || '2026'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(vac)}
                    className="p-2 rounded-xl text-[#596B5E] hover:text-[#244B2B] hover:bg-[#F4EFE6] transition-colors cursor-pointer"
                    title="Tahrirlash"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(vac.id, vac.title)}
                    className="p-2 rounded-xl text-[#596B5E] hover:text-[#B83A3A] hover:bg-rose-50 transition-colors cursor-pointer"
                    title="O‘chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E9E5DD] p-12 text-center space-y-4">
          <Briefcase className="w-12 h-12 text-[#D4AF37] mx-auto opacity-70" />
          <h3 className="font-bold text-lg text-[#1C261E]">
            Hech qanday vakansiya topilmadi
          </h3>
          <p className="text-xs text-[#596B5E] max-w-sm mx-auto">
            Qidiruv shartlarini o‘zgartiring yoki yangi bo‘sh ish o‘rni qo‘shing.
          </p>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-2xl bg-[#244B2B] text-white font-bold text-xs shadow-md cursor-pointer"
          >
            Yangi vakansiya qo‘shish
          </button>
        </div>
      )}

      {/* ================= 5. QO'SHISH / TAHRIRLASH MODALI ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#E9E5DD] max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E5DD] mb-5">
              <h3 className="text-lg font-bold text-[#1C261E] flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#D4AF37]" />
                <span>{editingVacancy ? 'Vakansiyani tahrirlash' : 'Yangi vakansiya qo‘shish'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-[#596B5E] hover:text-[#1C261E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Lavozim nomi */}
              <div>
                <label className="block text-xs font-bold text-[#1C261E] mb-1">
                  Lavozim nomi (O‘zbekcha) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="masalan: Usta-qandolatchi (Tort bezatuvchi)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-xs sm:text-sm font-semibold outline-none focus:border-[#244B2B]"
                />
              </div>

              {/* Ruscha nomi (ixtiyoriy) */}
              <div>
                <label className="block text-xs font-bold text-[#596B5E] mb-1">
                  Lavozim nomi (Ruscha versiyasi)
                </label>
                <input
                  type="text"
                  value={titleRu}
                  onChange={(e) => setTitleRu(e.target.value)}
                  placeholder="masalan: Мастер-кондитер (Декоратор)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-xs sm:text-sm font-semibold outline-none focus:border-[#244B2B]"
                />
              </div>

              {/* Ish turi va Filial */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C261E] mb-1">
                    Ish tartibi *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E9E5DD] text-xs sm:text-sm font-semibold bg-white"
                  >
                    <option value="To‘liq stavka">To‘liq stavka</option>
                    <option value="Smenali grafik">Smenali grafik</option>
                    <option value="Moslashuvchan grafik">Moslashuvchan grafik</option>
                    <option value="Yarim stavka">Yarim stavka</option>
                    <option value="Amaliyot / Stajirovka">Amaliyot / Stajirovka</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C261E] mb-1">
                    Filial / Joylashuv *
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E9E5DD] text-xs sm:text-sm font-semibold bg-white"
                  >
                    <option value="Markaziy filial (Qarshi)">Markaziy filial (Qarshi)</option>
                    <option value="Nasaf filiali (Qarshi)">Nasaf filiali (Qarshi)</option>
                    <option value="Qarshi shahri bo‘ylab">Qarshi shahri bo‘ylab</option>
                    <option value="Barcha filiallar">Barcha filiallar</option>
                  </select>
                </div>
              </div>

              {/* Oylik maosh */}
              <div>
                <label className="block text-xs font-bold text-[#1C261E] mb-1">
                  Oylik maosh (ixtiyoriy)
                </label>
                <input
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="masalan: 4 000 000 – 7 000 000 so‘m yoki Kelishilgan holda"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-xs sm:text-sm font-semibold outline-none focus:border-[#244B2B]"
                />
              </div>

              {/* Tavsif va Talablar */}
              <div>
                <label className="block text-xs font-bold text-[#1C261E] mb-1">
                  Tavsif va talablar (Qisqacha) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nomzod nimalarni bilishi va qanday vazifalarni bajarishi kerak..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-xs sm:text-sm outline-none focus:border-[#244B2B]"
                />
              </div>

              {/* Aloqa: Telefon va Telegram */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C261E] mb-1">
                    Aloqa telefoni *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+998 93 706 73 21"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-xs sm:text-sm font-semibold outline-none focus:border-[#244B2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C261E] mb-1">
                    Telegram username (Rezyume uchun) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8C9B90]">@</span>
                    <input
                      type="text"
                      required
                      value={telegramUsername}
                      onChange={(e) => setTelegramUsername(e.target.value)}
                      placeholder="mojiza777_admin"
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-xs sm:text-sm font-semibold outline-none focus:border-[#244B2B]"
                    />
                  </div>
                </div>
              </div>

              {/* Holati (Faollik) */}
              <div className="p-3.5 rounded-2xl bg-[#FBF9F4] border border-[#E9E5DD] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#1C261E] block">Saytda darhol e’lon qilish</span>
                  <span className="text-[11px] text-[#596B5E]">«Biz haqimizda» sahifasidagi vakansiyalar blokida ko‘rinadi</span>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 accent-[#244B2B] rounded cursor-pointer"
                />
              </div>

              {/* Tugmalar */}
              <div className="flex gap-3 pt-3 border-t border-[#E9E5DD]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-[#E9E5DD] text-xs font-bold text-[#1C261E] hover:bg-[#F4EFE6]"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#244B2B] text-white hover:bg-[#1A3720] text-xs font-bold shadow-md cursor-pointer"
                >
                  {editingVacancy ? 'O‘zgarishlarni saqlash' : 'Vakansiyani e’lon qilish'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
