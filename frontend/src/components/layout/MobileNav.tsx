'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Home, Grid, ShoppingBag, ClipboardList, Heart } from 'lucide-react';
import { useCartStore } from '../../stores/cart';
import { useFavoritesStore } from '../../stores/favorites';

interface MobileNavProps {
  locale: 'uz' | 'ru';
}

export const MobileNav: React.FC<MobileNavProps> = ({ locale }) => {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.getItemCount());
  const favoritesCount = useFavoritesStore((s) => s.slugs.length);

  const items = [
    { href: `/${locale}`, label: t('home'), icon: Home },
    { href: `/${locale}/catalog`, label: t('catalog'), icon: Grid },
    {
      href: `/${locale}/cart`,
      label: t('cart'),
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : null,
    },
    { href: `/${locale}/favorites`, label: t('favorites'), icon: Heart, badge: favoritesCount > 0 ? favoritesCount : null },
    { href: `/${locale}/orders`, label: t('myOrders'), icon: ClipboardList },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 w-full max-w-full overflow-hidden z-40 bg-[#FBF9F4]/95 dark:bg-[#141F17]/95 backdrop-blur-lg border-t border-[#E9E5DD] dark:border-[#293B2D] shadow-lg px-1 sm:px-2 py-1.5 safe-area-bottom">
      <div className="flex items-center justify-around w-full max-w-full">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== `/${locale}` && pathname.startsWith(item.href));

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
                isActive 
                  ? 'text-[#244B2B] dark:text-[#E5C358] font-bold' 
                  : 'text-[#596B5E] dark:text-[#9EB0A1] hover:text-[#1C261E] dark:hover:text-[#F5F2EA]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {item.badge != null && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-[#B83A3A] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight truncate max-w-full text-center ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 bg-[#244B2B] dark:bg-[#E5C358] rounded-full mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
