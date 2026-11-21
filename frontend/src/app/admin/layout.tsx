'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Layers, 
  Store, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Bell, 
  BellOff, 
  Menu, 
  X,
  Volume2,
  Palette,
  ChefHat,
  Cake,
  Camera,
  Flame,
  Sparkles,
  Briefcase,
  Crown,
  Tag,
  Clock,
  BarChart3,
  Sliders,
  Users,
  ScrollText,
  ChevronRight
} from 'lucide-react';
import { LogoEmblem } from '../../components/ui/Logo';
import { playNewOrderChime } from '../../lib/audio';
import { apiClient } from '../../lib/api/client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ username: string; fullName: string; role: string } | null>(null);

  useEffect(() => {
    if (pathname === '/admin/login') return;
    // Admin ma'lumotlarini tekshirish
    apiClient<{ username: string; fullName: string; role: string }>('/api/admin/auth/me')
      .then((data) => {
        if (data && data.username) setUser(data);
      })
      .catch(() => {
        router.replace('/admin/login');
      });
  }, [pathname, router]);

  // Mobil menyu ochilganda orqa fon skrollini to'xtatish
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

  const handleLogout = async () => {
    try {
      await apiClient('/api/admin/auth/logout', { method: 'POST' });
    } catch {}
    router.push('/admin/login');
  };

  const isAdmin = user?.role === 'ADMIN';

  const navItems = [
    { href: '/admin', label: 'Buyurtmalar (Live)', icon: <ShoppingBag className="w-5 h-5" /> },
    { href: '/admin/catering-requests', label: 'To‘y va marosimlar', icon: <Crown className="w-5 h-5 text-[#D4AF37]" /> },
    { href: '/admin/products', label: 'Mahsulotlar', icon: <ChefHat className="w-5 h-5" /> },
    { href: '/admin/categories', label: 'Toifalar', icon: <Layers className="w-5 h-5" /> },
    { href: '/admin/promotions', label: 'Aksiyalar va bannerlar', icon: <Sparkles className="w-5 h-5 text-[#D4AF37]" /> },
    { href: '/admin/content', label: 'Sayt dizayni va rasmlar', icon: <Palette className="w-5 h-5 text-amber-300" /> },
    { href: '/admin/vacancies', label: 'Vakansiyalar (Karyera)', icon: <Briefcase className="w-5 h-5" /> },
    ...(isAdmin ? [
      { href: '/admin/analytics', label: 'Tahlil va Statistika', icon: <BarChart3 className="w-5 h-5 text-emerald-300" /> },
      { href: '/admin/promo-codes', label: 'Promokodlar', icon: <Tag className="w-5 h-5" /> },
      { href: '/admin/delivery-slots', label: 'Vaqt oynalari', icon: <Clock className="w-5 h-5" /> },
      { href: '/admin/cake/types', label: 'Tort turlari', icon: <Cake className="w-5 h-5" /> },
      { href: '/admin/cake/options', label: 'Tort qo‘shimchalari', icon: <Sliders className="w-5 h-5" /> },
      { href: '/admin/cake/showcase', label: 'Tort rasmlari (Vitrina)', icon: <Camera className="w-5 h-5 text-[#D4AF37]" /> },
      { href: '/admin/staff', label: 'Xodimlar', icon: <Users className="w-5 h-5" /> },
      { href: '/admin/branches', label: 'Filiallar', icon: <Store className="w-5 h-5" /> },
      { href: '/admin/audit-log', label: 'Audit jurnali', icon: <ScrollText className="w-5 h-5" /> },
      { href: '/admin/settings', label: 'Sozlamalar', icon: <Settings className="w-5 h-5" /> },
    ] : []),
  ];

  // Mobil pastki navigatsiya uchun asosiy tugmalar
  const bottomNavItems = [
    { href: '/admin', label: 'Buyurtma', icon: ShoppingBag },
    { href: '/admin/products', label: 'Mahsulot', icon: ChefHat },
    { href: '/admin/catering-requests', label: 'To‘ylar', icon: Crown },
    ...(isAdmin ? [{ href: '/admin/analytics', label: 'Tahlil', icon: BarChart3 }] : [{ href: '/admin/categories', label: 'Toifalar', icon: Layers }]),
  ];

  if (pathname === '/admin/login') return <>{children}</>;

  if (!user) {
    return <main className="min-h-screen grid place-items-center text-sm font-semibold text-[#244B2B]">Sessiya tekshirilmoqda…</main>;
  }

  return (
    <div className="min-h-screen bg-[#F4EFE6] flex flex-col md:flex-row">
      
      {/* 1. Mobil Header (Sticky tepa qator) */}
      <header className="md:hidden bg-[#244B2B] text-white px-4 py-3 flex items-center justify-between border-b border-[#345B3A] sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white transition-all focus:outline-none"
            aria-label="Menyuni ochish"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 flex-shrink-0">
              <LogoEmblem size={28} />
            </div>
            <div>
              <div className="font-black text-xs tracking-wide leading-tight text-white">Mo‘jiza 777</div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-[#D4AF37] font-bold">Admin Panel</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href="/uz"
            target="_blank"
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Saytga o‘tish"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playNewOrderChime();
            }}
            className={`p-2 rounded-xl transition-all active:scale-95 ${
              soundEnabled ? 'text-[#D4AF37] bg-white/10' : 'text-white/40 bg-transparent'
            }`}
            title="Ovozli bildirishnomalar"
          >
            {soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. Mobil fon parda (Overlay) */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-xs animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* 3. Sidebar (Desktop barqaror + Mobil uchun suzuvchi Drawer) */}
      <aside
        className={`${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } fixed md:static inset-y-0 left-0 z-50 w-72 max-w-[85vw] md:w-64 bg-[#244B2B] text-white flex flex-col justify-between transition-transform duration-300 ease-out border-r border-[#345B3A] shadow-2xl md:shadow-none h-full max-h-screen`}
      >
        {/* Drawer Bosh qismi */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#345B3A] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex-shrink-0">
              <LogoEmblem size={36} />
            </div>
            <div>
              <div className="font-black text-sm tracking-wide text-white">Mo‘jiza 777</div>
              <div className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">Boshqaruv Paneli</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Menyuni yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Menyu bo'limlari */}
        <nav className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1 scrollbar-thin overscroll-contain">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-[0.98] ${
                  isActive
                    ? 'bg-[#D4AF37] text-[#1C261E] shadow-md font-extrabold'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={isActive ? 'text-[#1C261E]' : 'text-[#D4AF37] flex-shrink-0'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-[#1C261E] flex-shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* Foydalanuvchi ma'lumoti va Chiqish (Pastki fiksirlangan panel) */}
        <div className="p-4 border-t border-[#345B3A] space-y-3 bg-[#1D3C23]/60 flex-shrink-0">
          <div className="flex items-center justify-between px-1">
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate max-w-[170px]">{user.fullName}</div>
              <div className="text-[10px] text-[#D4AF37] font-medium tracking-wide">{user.role}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playNewOrderChime();
              }}
              className={`p-2 rounded-xl transition-colors ${soundEnabled ? 'text-[#D4AF37] bg-white/10' : 'text-white/40'}`}
              title="Tovush holati"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </button>
          </div>

          <div className="pt-2 border-t border-[#345B3A]/60 flex items-center justify-between text-xs">
            <Link
              href="/uz"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-white/75 hover:text-[#D4AF37] transition-colors py-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Saytga o‘tish</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 font-semibold transition-colors py-1 active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Chiqish</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 4. Asosiy kontent maydoni */}
      <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* 5. Mobil Pastki Navigatsiya Paneli (Bottom Tab Bar) */}
      <nav
        aria-label="Mobil tezkor navigatsiya"
        className="md:hidden fixed bottom-0 inset-x-0 bg-[#1D3C23]/95 backdrop-blur-md border-t border-[#345B3A] z-40 px-2 py-1.5 flex items-center justify-around text-white shadow-2xl safe-area-bottom"
      >
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[58px] active:scale-90 ${
                isActive
                  ? 'text-[#D4AF37] font-black'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-[#D4AF37]/20 scale-110' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#D4AF37]' : 'text-white/80'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[62px]">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Barcha bo'limlar menyusi (Drawer ochgich) */}
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[58px] active:scale-90 ${
            mobileSidebarOpen ? 'text-[#D4AF37]' : 'text-white/70 hover:text-white'
          }`}
        >
          <div className="p-1 rounded-xl hover:bg-white/10">
            <Menu className="w-5 h-5 text-white/80" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Menyu</span>
        </button>
      </nav>

    </div>
  );
}
