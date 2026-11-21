'use client';

import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  AlertCircle, 
  Percent, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { apiClient } from '../../../lib/api/client';
import { formatCurrency } from '../../../lib/format';

interface PromoCodeItem {
  id: number;
  code: string;
  description: string | null;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number;
  maxUses: number | null;
  usedCount: number;
  firstOrderOnly: boolean;
  validFrom: string | null;
  validTo: string | null;
  isActive: boolean;
  usableNow: boolean;
}

export default function AdminPromoCodesPage() {
  const [promos, setPromos] = useState<PromoCodeItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>('50000');
  const [minOrderAmount, setMinOrderAmount] = useState<string>('100000');
  const [maxUses, setMaxUses] = useState<string>('500');
  const [firstOrderOnly, setFirstOrderOnly] = useState(false);
  const [validTo, setValidTo] = useState('2026-12-31');

  const loadPromos = async () => {
    try {
      const res = await apiClient<PromoCodeItem[]>('/api/admin/promo-codes');
      setPromos(Array.isArray(res) ? res : []);
    } catch (error) {
      setPromos([]);
      window.alert((error as { message?: string })?.message || 'Promokodlarni yuklab bo‘lmadi.');
    }
  };

  useEffect(() => {
    loadPromos();
  }, []);

  const handleToggleActive = async (id: number) => {
    const promo = promos.find((p) => p.id === id);
    if (!promo) return;
    const newActive = !promo.isActive;

    try {
      await apiClient(`/api/admin/promo-codes/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          code: promo.code, description: promo.description, discountType: promo.discountType,
          discountValue: promo.discountValue, maxDiscountAmount: promo.maxDiscountAmount,
          minOrderAmount: promo.minOrderAmount, maxUses: promo.maxUses,
          firstOrderOnly: promo.firstOrderOnly, validFrom: promo.validFrom,
          validTo: promo.validTo, isActive: newActive,
        }),
      });
      await loadPromos();
    } catch (error) { window.alert((error as { message?: string })?.message || 'Promokod holatini saqlab bo‘lmadi.'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Ushbu promokodni o‘chirmoqchimisiz?')) return;
    try {
      await apiClient(`/api/admin/promo-codes/${id}`, { method: 'DELETE' });
      await loadPromos();
    } catch (error) { window.alert((error as { message?: string })?.message || 'Promokodni o‘chirib bo‘lmadi.'); }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const newPromo = {
      code: code.trim().toUpperCase(),
      description: description.trim() || null,
      discountType,
      discountValue: Number(discountValue),
      maxDiscountAmount: discountType === 'PERCENT' && maxDiscountAmount ? Number(maxDiscountAmount) : null,
      minOrderAmount: Number(minOrderAmount) || 0,
      maxUses: maxUses ? Number(maxUses) : null,
      firstOrderOnly,
      validFrom: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 19),
      validTo: validTo ? `${validTo}T23:59:59` : null,
      isActive: true,
    };

    try {
      await apiClient('/api/admin/promo-codes', {
        method: 'POST',
        body: JSON.stringify(newPromo),
      });
      await loadPromos();
      setModalOpen(false);
      setCode('');
      setDescription('');
    } catch (error) { window.alert((error as { message?: string })?.message || 'Promokodni yaratib bo‘lmadi.'); }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Sarlavha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E9E5DD]">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-6 h-6 text-[#244B2B]" />
            <h1 className="text-2xl font-bold text-[#1C261E]">Promokodlar Boshqaruvi</h1>
          </div>
          <p className="text-xs text-[#596B5E] mt-1">
            Sayt xaridorlari uchun chegirma kodlarini yaratish va monitoring qilish
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#244B2B] hover:bg-[#1A3720] text-white text-xs font-bold flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Yangi Promokod</span>
        </button>
      </div>

      {/* Promokodlar Jadvali */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos.map((p) => (
          <div
            key={p.id}
            className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition-all ${
              p.isActive ? 'border-[#E9E5DD]' : 'opacity-60 bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-lg tracking-wider text-[#244B2B] bg-[#244B2B]/5 px-3 py-1 rounded-xl border border-[#244B2B]/20">
                {p.code}
              </span>
              <button
                type="button"
                onClick={() => handleToggleActive(p.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {p.isActive ? 'Faol' : 'Nofaol'}
              </button>
            </div>

            <p className="text-xs text-[#596B5E] leading-relaxed line-clamp-2">
              {p.description || 'Chegirma kodi'}
            </p>

            <div className="p-3 rounded-xl bg-[#FBF9F4] text-xs space-y-1.5 text-[#1C261E]">
              <div className="flex justify-between">
                <span className="text-[#596B5E]">Chegirma hajmi:</span>
                <strong className="text-[#D4AF37]">
                  {p.discountType === 'PERCENT' ? `${p.discountValue}%` : formatCurrency(p.discountValue)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#596B5E]">Min. buyurtma:</span>
                <strong>{formatCurrency(p.minOrderAmount)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#596B5E]">Ishlatilgan:</span>
                <span>{p.usedCount} {p.maxUses ? `/ ${p.maxUses} ta` : 'marta'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E9E5DD] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#8C9B90]">
                {p.validTo ? `Amal qiladi: ${p.validTo.slice(0, 10)}` : 'Muddatsiz'}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(p.id)}
                className="text-[#B83A3A] hover:text-red-700 p-1"
                title="O‘chirish"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Yangi Promokod Modali */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#E9E5DD] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E5DD]">
              <h3 className="font-bold text-lg text-[#1C261E]">Yangi Promokod Yaratish</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-[#596B5E]" />
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1C261E] mb-1">Kod (Katta harflarda) *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Masalan: NAVRUZ2026"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E9E5DD] font-mono font-bold tracking-wider uppercase text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1C261E] mb-1">Tavsif</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mijozga ko‘rinadigan chegirma maqsadi"
                  className="w-full px-3 py-2 rounded-xl border border-[#E9E5DD]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1C261E] mb-1">Turi</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E9E5DD] bg-white"
                  >
                    <option value="PERCENT">Foizli (%)</option>
                    <option value="FIXED">Qat’iy summa (so‘m)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1C261E] mb-1">
                    Qiymat {discountType === 'PERCENT' ? '(%)' : '(so‘m)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E9E5DD]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1C261E] mb-1">Min. buyurtma (so‘m)</label>
                  <input
                    type="number"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E9E5DD]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1C261E] mb-1">Tugash sanasi</label>
                  <input
                    type="date"
                    value={validTo}
                    onChange={(e) => setValidTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E9E5DD]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={firstOrderOnly}
                  onChange={(e) => setFirstOrderOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-[#244B2B]"
                />
                <span className="text-[#596B5E]">Faqat birinchi xarid uchun amal qilsin</span>
              </label>

              <div className="pt-4 border-t border-[#E9E5DD] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#596B5E] hover:bg-gray-100 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#244B2B] text-white font-bold hover:bg-[#1A3720]"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
