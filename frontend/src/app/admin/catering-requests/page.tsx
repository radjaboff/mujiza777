'use client';

import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Calendar, 
  Users, 
  Phone, 
  User, 
  DollarSign, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  Filter,
  Check,
  Search
} from 'lucide-react';
import { apiClient } from '../../../lib/api/client';
import { CateringRequestItem } from '../../../lib/api/types';
import { formatCurrency } from '../../../lib/format';

export default function AdminCateringRequestsPage() {
  const [requests, setRequests] = useState<CateringRequestItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await apiClient<{ content: CateringRequestItem[] }>('/api/admin/catering-requests');
      setRequests(res?.content || []);
    } catch (error) {
      setRequests([]);
      window.alert((error as { message?: string })?.message || 'Arizalarni yuklab bo‘lmadi.');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleUpdateStatus = async (id: number, newStatus: CateringRequestItem['status']) => {
    try {
      await apiClient(`/api/admin/catering-requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      await loadRequests();
    } catch (error) { window.alert((error as { message?: string })?.message || 'Ariza holatini saqlab bo‘lmadi.'); }
  };

  const handleSaveNote = async (id: number) => {
    try {
      await apiClient(`/api/admin/catering-requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ adminNote: noteInput }),
      });
      await loadRequests();
      setActiveNoteId(null);
    } catch (error) { window.alert((error as { message?: string })?.message || 'Izohni saqlab bo‘lmadi.'); }
  };

  const filtered = requests.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.eventType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Sarlavha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E9E5DD]">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-[#D4AF37]" />
            <h1 className="text-2xl font-bold text-[#1C261E]">To‘y va Marosimlar Arizalari</h1>
          </div>
          <p className="text-xs text-[#596B5E] mt-1">
            Katta to‘ylar, banketlar va Candy Bar bo‘yicha tushgan maxsus arizalar
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full bg-[#244B2B] text-white text-xs font-bold">
            Jami: {requests.length} ta ariza
          </span>
        </div>
      </div>

      {/* Filtrlar va Qidiruv (Mobil uchun gorizontal scroll) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full w-full sm:w-auto scrollbar-none">
          {[
            { id: 'ALL', label: 'Barchasi' },
            { id: 'NEW', label: 'Yangi', count: requests.filter((r) => r.status === 'NEW').length },
            { id: 'CONTACTED', label: 'Bog‘lanildi' },
            { id: 'DONE', label: 'Bajarildi' },
            { id: 'REJECTED', label: 'Rad etildi' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 flex-shrink-0 ${
                statusFilter === tab.id
                  ? 'bg-[#244B2B] text-white shadow-sm'
                  : 'bg-white text-[#1C261E] border border-[#E9E5DD] hover:border-[#D4AF37]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#D4AF37] text-[#1C261E] text-[10px] font-extrabold flex items-center justify-center">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#8C9B90] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism, telefon..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E9E5DD] text-xs bg-white focus:outline-none focus:border-[#244B2B]"
          />
        </div>
      </div>

      {/* Arizalar ro'yxati */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((req) => {
          const isNew = req.status === 'NEW';
          const isContacted = req.status === 'CONTACTED';
          const isDone = req.status === 'DONE';

          return (
            <div
              key={req.id}
              className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-sm space-y-4 transition-all ${
                isNew ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/50' : 'border-[#E9E5DD]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/20 text-[#AA820A] uppercase tracking-wider mb-1">
                    {req.eventType}
                  </span>
                  <h3 className="font-bold text-base text-[#1C261E]">{req.name}</h3>
                </div>

                <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                  isNew
                    ? 'bg-amber-100 text-amber-800 animate-pulse'
                    : isContacted
                    ? 'bg-blue-100 text-blue-800'
                    : isDone
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {req.status === 'NEW'
                    ? 'Yangi ariza'
                    : req.status === 'CONTACTED'
                    ? 'Bog‘lanildi'
                    : req.status === 'DONE'
                    ? 'Bajarildi'
                    : 'Rad etildi'}
                </span>
              </div>

              {/* Tafsilotlar paneli */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#FBF9F4] text-xs text-[#596B5E]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Sana: <strong>{req.eventDate}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#244B2B]" />
                  <span>Mehmonlar: <strong>{req.guestCount} kishi</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#244B2B]" />
                  <a href={`tel:${req.phone}`} className="font-bold text-[#244B2B] hover:underline">
                    {req.phone}
                  </a>
                </div>
                {req.budget && (
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Byudjet: <strong>{formatCurrency(req.budget)}</strong></span>
                  </div>
                )}
              </div>

              {/* Istaklar / Izoh */}
              {req.comment && (
                <div className="p-3 rounded-xl bg-white border border-[#E9E5DD] text-xs text-[#1C261E]">
                  <strong className="text-[#596B5E] block text-[10px] uppercase tracking-wider mb-0.5">Mijoz istagi:</strong>
                  <p>{req.comment}</p>
                </div>
              )}

              {/* Admin qaydi (Note) */}
              <div>
                {activeNoteId === req.id ? (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      autoFocus
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="Admin qaydi (masalan: telefon qilindi)..."
                      className="flex-1 px-3 py-1.5 rounded-xl border border-[#E9E5DD] text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveNote(req.id)}
                      className="px-3 py-1.5 bg-[#244B2B] text-white rounded-xl text-xs font-bold"
                    >
                      Saqlash
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveNoteId(null)}
                      className="px-2 py-1.5 bg-gray-100 rounded-xl text-xs"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs text-[#596B5E] pt-1">
                    <span className="italic">{req.adminNote ? `Qayd: ${req.adminNote}` : 'Qayd yo‘q'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveNoteId(req.id);
                        setNoteInput(req.adminNote || '');
                      }}
                      className="text-[#244B2B] font-bold hover:underline"
                    >
                      {req.adminNote ? 'Tahrirlash' : '+ Qayd qo‘shish'}
                    </button>
                  </div>
                )}
              </div>

              {/* Holatni o'zgartirish tugmalari */}
              <div className="pt-3 border-t border-[#E9E5DD] flex items-center justify-between gap-2">
                <a
                  href={`tel:${req.phone}`}
                  className="px-3 py-1.5 rounded-xl bg-[#244B2B] text-white text-xs font-bold hover:bg-[#1A3720] flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Qo‘ng‘iroq</span>
                </a>

                <div className="flex items-center gap-1.5">
                  {req.status !== 'CONTACTED' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(req.id, 'CONTACTED')}
                      className="px-2.5 py-1.5 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 text-[11px] font-bold"
                    >
                      Bog‘lanildi
                    </button>
                  )}
                  {req.status !== 'DONE' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(req.id, 'DONE')}
                      className="px-2.5 py-1.5 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-[11px] font-bold"
                    >
                      ✓ Bajarildi
                    </button>
                  )}
                  {req.status !== 'REJECTED' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                      className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[11px]"
                    >
                      Rad
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
