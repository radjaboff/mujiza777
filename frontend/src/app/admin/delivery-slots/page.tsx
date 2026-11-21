'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Plus, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Truck
} from 'lucide-react';
import { apiClient } from '../../../lib/api/client';

interface DeliverySlotAdminItem {
  id: number;
  startTime: string; // 'HH:mm:ss'
  endTime: string;
  capacity: number;
  isActive: boolean;
}

export default function AdminDeliverySlotsPage() {
  const [slots, setSlots] = useState<DeliverySlotAdminItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [capacity, setCapacity] = useState(6);

  const loadSlots = async () => {
    try {
      const res = await apiClient<DeliverySlotAdminItem[]>('/api/admin/delivery-slots');
      setSlots(Array.isArray(res) ? res : []);
    } catch (error) {
      setSlots([]);
      window.alert((error as { message?: string })?.message || 'Vaqt oynalarini yuklab bo‘lmadi.');
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const handleToggleActive = async (id: number) => {
    const slot = slots.find((s) => s.id === id);
    if (!slot) return;
    const newActive = !slot.isActive;

    try {
      await apiClient(`/api/admin/delivery-slots/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...slot, isActive: newActive }),
      });
      await loadSlots();
    } catch (error) { window.alert((error as { message?: string })?.message || 'Vaqt oynasi holatini saqlab bo‘lmadi.'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Ushbu vaqt oralig‘ini o‘chirmoqchimisiz?')) return;
    try {
      await apiClient(`/api/admin/delivery-slots/${id}`, { method: 'DELETE' });
      await loadSlots();
    } catch (error) { window.alert((error as { message?: string })?.message || 'Vaqt oynasini o‘chirib bo‘lmadi.'); }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();

    const newSlot = {
      startTime: `${startTime}:00`,
      endTime: `${endTime}:00`,
      capacity: Number(capacity) || 6,
      isActive: true,
    };

    try {
      await apiClient('/api/admin/delivery-slots', {
        method: 'POST',
        body: JSON.stringify(newSlot),
      });
      await loadSlots();
      setModalOpen(false);
    } catch (error) { window.alert((error as { message?: string })?.message || 'Vaqt oynasini qo‘shib bo‘lmadi.'); }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
      
      {/* Sarlavha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E9E5DD]">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#244B2B]" />
            <h1 className="text-2xl font-bold text-[#1C261E]">Yetkazib Berish Vaqt Oynalari</h1>
          </div>
          <p className="text-xs text-[#596B5E] mt-1">
            Kuryerlik xizmati uchun rejalashtirilgan soat oraliqlari va buyurtma sig‘imi
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#244B2B] hover:bg-[#1A3720] text-white text-xs font-bold flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Yangi Oyna Qo‘shish</span>
        </button>
      </div>

      {/* Oynalar ro'yxati */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className={`bg-white rounded-2xl border p-5 shadow-sm space-y-3 transition-all ${
              slot.isActive ? 'border-[#E9E5DD]' : 'opacity-50 bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-base text-[#1C261E] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                <span>{slot.startTime.slice(0, 5)} – {slot.endTime.slice(0, 5)}</span>
              </span>
              <button
                type="button"
                onClick={() => handleToggleActive(slot.id)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  slot.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {slot.isActive ? 'Faol' : 'Nofaol'}
              </button>
            </div>

            <div className="text-xs text-[#596B5E] flex justify-between pt-1">
              <span>Maksimal sig‘im:</span>
              <strong className="text-[#1C261E]">{slot.capacity} ta buyurtma / oyna</strong>
            </div>

            <div className="pt-3 border-t border-[#E9E5DD] flex justify-end">
              <button
                type="button"
                onClick={() => handleDelete(slot.id)}
                className="text-xs text-[#B83A3A] hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>O‘chirish</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Yangi oyna qo'shish modali */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E9E5DD] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E5DD]">
              <h3 className="font-bold text-lg text-[#1C261E]">Yangi Vaqt Oynasi</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-[#596B5E]" />
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1C261E] mb-1">Boshlanish vaqti</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E9E5DD]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1C261E] mb-1">Tugash vaqti</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E9E5DD]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1C261E] mb-1">Buyurtma sig‘imi (capacity)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E9E5DD]"
                />
              </div>

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
