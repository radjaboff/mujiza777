'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, User, AlertCircle, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { LogoEmblem } from '../../../components/ui/Logo';
import { apiClient } from '../../../lib/api/client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await apiClient('/api/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password }),
      });
      router.push('/admin');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Login yoki parol noto‘g‘ri kiritildi.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EFE6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-4">
          <LogoEmblem size={64} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#1C261E] tracking-tight">
          Mo‘jiza 777 Boshqaruv Paneli
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#596B5E]">
          Xodimlar va administratorlar uchun kirish tizimi
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-[#E9E5DD]">
          
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#1C261E] mb-1.5">
                Foydalanuvchi nomi (Login)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8C9B90] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E9E5DD] text-sm focus:outline-none focus:border-[#244B2B] bg-[#FBF9F4]/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C261E] mb-1.5">
                Maxfiy parol
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C9B90] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E9E5DD] text-sm focus:outline-none focus:border-[#244B2B] bg-[#FBF9F4]/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#244B2B] text-white hover:bg-[#1A3720] font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:bg-gray-400"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  <span>Tekshirilmoqda...</span>
                </>
              ) : (
                <>
                  <span>Tizimga kirish</span>
                  <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E9E5DD] flex items-center justify-between text-xs text-[#596B5E]">
            <Link href="/uz" className="hover:text-[#244B2B] font-semibold">
              ← Saytga qaytish
            </Link>
            <span className="flex items-center gap-1 text-[#244B2B] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Himoyalangan tizim</span>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
