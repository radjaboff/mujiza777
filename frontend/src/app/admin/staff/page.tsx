'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api/client';
import type { AdminUser } from '../../../lib/api/types';
import { Users, UserPlus, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

type Staff = AdminUser & { id: number; createdAt?: string };
type Role = 'ADMIN' | 'STAFF' | 'COURIER';

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [form, setForm] = useState({ username: '', fullName: '', password: '', role: 'STAFF' as Role });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async () => {
    try {
      const data = await apiClient<Staff[]>('/api/admin/staff');
      setStaff(data || []);
    } catch (e) {
      window.alert((e as { message?: string }).message || 'Xodimlar ro‘yxatini yuklab bo‘lmadi.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient('/api/admin/staff', { method: 'POST', body: JSON.stringify(form) });
      setForm({ username: '', fullName: '', password: '', role: 'STAFF' });
      await load();
    } catch (e) {
      window.alert((e as { message?: string }).message || 'Xodim hisobini yaratib bo‘lmadi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateActive = async (person: Staff) => {
    try {
      await apiClient(`/api/admin/staff/${person.id}`, { method: 'PUT', body: JSON.stringify({ isActive: !person.isActive }) });
      await load();
    } catch (e) {
      window.alert((e as { message?: string }).message || 'Xodim holatini o‘zgartirib bo‘lmadi.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="pb-4 border-b border-[#E9E5DD]">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-[#244B2B]" />
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C261E] tracking-tight">
            Xodimlar va rollar
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#596B5E] mt-0.5">
          Adminlar, do‘kon xodimlari va yetkazib beruvchi kuryerlar hisoblari boshqaruvi
        </p>
      </div>

      {/* Yangi xodim qo'shish formasi */}
      <div className="rounded-3xl border border-[#E9E5DD] bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-[#1C261E] flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-[#244B2B]" />
          <span>Yangi xodim hisobi yaratish</span>
        </h2>

        <form onSubmit={create} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-[#1C261E] mb-1">Login (Username) *</label>
            <input
              required
              minLength={3}
              maxLength={50}
              placeholder="masalan: kuryer_jasur"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full rounded-xl border border-[#E9E5DD] px-3.5 py-2.5 outline-none focus:border-[#244B2B]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1C261E] mb-1">To‘liq ism *</label>
            <input
              required
              placeholder="masalan: Jasur Rahimov"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full rounded-xl border border-[#E9E5DD] px-3.5 py-2.5 outline-none focus:border-[#244B2B]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1C261E] mb-1">Boshlang‘ich parol (kamida 10 belgi) *</label>
            <input
              required
              minLength={10}
              type="password"
              placeholder="••••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl border border-[#E9E5DD] px-3.5 py-2.5 outline-none focus:border-[#244B2B]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1C261E] mb-1">Tizimdagi roli *</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              className="w-full rounded-xl border border-[#E9E5DD] px-3.5 py-2.5 outline-none focus:border-[#244B2B] bg-white"
            >
              <option value="STAFF">Xodim (Oshxona / Operator)</option>
              <option value="COURIER">Kuryer (Yetkazib beruvchi)</option>
              <option value="ADMIN">Administrator (To‘liq huquq)</option>
            </select>
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto rounded-xl bg-[#244B2B] hover:bg-[#1A3720] px-6 py-3 font-bold text-white shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Qo‘shilmoqda...' : 'Xodim qo‘shish'}
            </button>
          </div>
        </form>
      </div>

      {/* Xodimlar ro'yxati */}
      <div className="rounded-3xl border border-[#E9E5DD] bg-white shadow-sm overflow-hidden divide-y divide-[#E9E5DD]">
        {staff.map((person) => (
          <div key={person.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4EFE6] text-[#244B2B] flex items-center justify-center font-black text-sm flex-shrink-0">
                {person.fullName ? person.fullName[0].toUpperCase() : 'U'}
              </div>
              <div>
                <div className="font-bold text-sm text-[#1C261E]">{person.fullName}</div>
                <div className="text-xs text-[#596B5E] flex items-center gap-2">
                  <span>@{person.username}</span>
                  <span>•</span>
                  <span className="font-bold text-[#D4AF37]">{person.role}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => updateActive(person)}
              className={`self-start sm:self-auto rounded-xl border px-3.5 py-2 text-xs font-bold transition-all active:scale-95 ${
                person.isActive
                  ? 'border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                  : 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100'
              }`}
            >
              {person.isActive ? '● Faol hisob' : '○ To‘xtatilgan'} · almashtirish
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
