'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '../../../lib/api/client';
import type { AuditEntry, PageResponse } from '../../../lib/api/types';
import { ScrollText, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminAuditLogPage() {
  const [items, setItems] = useState<AuditEntry[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [entityType, setEntityType] = useState('');
  const [actor, setActor] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (nextPage = page) => {
    setLoading(true);
    try {
      const data = await apiClient<PageResponse<AuditEntry>>('/api/admin/audit-log', {
        params: {
          page: nextPage,
          size: 30,
          entityType: entityType || undefined,
          actor: actor || undefined,
        },
      });
      setItems(data.content);
      setPage(data.number);
      setTotalPages(data.totalPages);
    } catch (e) {
      window.alert((e as { message?: string }).message || 'Audit jurnalini yuklab bo‘lmadi.');
    } finally {
      setLoading(false);
    }
  }, [page, entityType, actor]);

  useEffect(() => {
    load(0);
  }, [load]);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E9E5DD]">
        <div>
          <div className="flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-[#244B2B]" />
            <h1 className="text-2xl sm:text-3xl font-black text-[#1C261E] tracking-tight">
              Tizim o‘zgarishlari jurnali
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#596B5E] mt-0.5">
            Admin va xodimlar tomonidan amalga oshirilgan barcha muhim harakatlar qaydlari
          </p>
        </div>

        <button
          onClick={() => load(page)}
          className="p-2.5 rounded-xl border border-[#E9E5DD] bg-white hover:bg-[#F4EFE6] text-[#1C261E] self-start sm:self-auto flex items-center gap-1.5 text-xs font-bold active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Yangilash</span>
        </button>
      </div>

      {/* Qidiruv formasi */}
      <form
        className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E9E5DD] shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          load(0);
        }}
      >
        <input
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          placeholder="Obyekt turi (ORDER, PRODUCT...)"
          className="flex-1 rounded-xl border border-[#E9E5DD] px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#244B2B]"
        />
        <input
          value={actor}
          onChange={(e) => setActor(e.target.value)}
          placeholder="Xodim logini..."
          className="flex-1 rounded-xl border border-[#E9E5DD] px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#244B2B]"
        />
        <button className="rounded-xl bg-[#244B2B] hover:bg-[#1A3720] px-5 py-2.5 font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all">
          <Search className="w-4 h-4" />
          <span>Qidirish</span>
        </button>
      </form>

      {/* Audit Yozuvlari: Mobil Kartochkalar + Desktop Jadval */}
      <div className="rounded-3xl border border-[#E9E5DD] bg-white shadow-sm overflow-hidden">
        {/* Mobil ko'rinish (md:hidden) */}
        <div className="md:hidden divide-y divide-[#E9E5DD]">
          {items.map((item) => (
            <div key={item.id} className="p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#244B2B] bg-[#244B2B]/10 px-2 py-0.5 rounded-lg text-[11px]">
                  {item.action}
                </span>
                <span className="text-[10px] text-[#8C9B90]">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#1C261E]">
                <span>Xodim: <strong>{item.actor}</strong></span>
                <span>Obyekt: <strong>{item.entityType} #{item.entityId ?? '—'}</strong></span>
              </div>
              {item.details && (
                <div className="text-[11px] text-[#596B5E] bg-[#F4EFE6] p-2 rounded-xl break-all">
                  {item.details}
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && !loading && (
            <div className="p-8 text-center text-xs text-[#596B5E]">Audit yozuvlari topilmadi.</div>
          )}
        </div>

        {/* Desktop Jadval (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FBF9F4] text-[#596B5E] text-[11px] uppercase tracking-wider border-b border-[#E9E5DD]">
              <tr>
                {['Vaqt', 'Xodim', 'Amal', 'Obyekt', 'ID', 'Tafsilot'].map((x) => (
                  <th key={x} className="py-3 px-4 font-bold">{x}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E5DD]">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-[#FBF9F4]/60 transition-colors">
                  <td className="py-3 px-4 text-[#8C9B90] whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#1C261E]">{item.actor}</td>
                  <td className="py-3 px-4 font-bold text-[#244B2B]">{item.action}</td>
                  <td className="py-3 px-4">{item.entityType}</td>
                  <td className="py-3 px-4 text-[#8C9B90]">{item.entityId ?? '—'}</td>
                  <td className="py-3 px-4 text-[#596B5E] max-w-xs truncate">{item.details || '—'}</td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#596B5E]">
                    Audit yozuvlari topilmadi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sahifalash */}
      <div className="flex items-center justify-between text-xs pt-2">
        <span className="text-[#8C9B90]">
          Sahifa: {totalPages ? page + 1 : 0} / {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 0}
            onClick={() => load(page - 1)}
            className="rounded-xl border border-[#E9E5DD] bg-white px-3.5 py-2 font-bold text-[#1C261E] disabled:opacity-40 flex items-center gap-1 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Oldingi</span>
          </button>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => load(page + 1)}
            className="rounded-xl border border-[#E9E5DD] bg-white px-3.5 py-2 font-bold text-[#1C261E] disabled:opacity-40 flex items-center gap-1 active:scale-95"
          >
            <span>Keyingi</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
