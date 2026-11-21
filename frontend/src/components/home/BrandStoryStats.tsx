'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowRight, 
  Users, 
  Cake, 
  ShieldCheck, 
  Clock, 
  Store, 
  Award,
  Briefcase,
  ChevronRight,
  Heart
} from 'lucide-react';

interface BrandStoryStatsProps {
  locale: 'uz' | 'ru';
  showTimeline?: boolean;
  showCareers?: boolean;
}

export const BrandStoryStats: React.FC<BrandStoryStatsProps> = ({ 
  locale,
  showTimeline = true,
  showCareers = true
}) => {
  const isRu = locale === 'ru';
  const [activeTab, setActiveTab] = useState<'stats' | 'timeline'>('stats');

  const stats = [
    {
      value: '50 000+',
      label: isRu ? 'Довольных семей' : 'Mamnun mijozlar',
      desc: isRu ? 'Доверили свои праздники и юбилеи' : 'Bayram va quvonchli kunlarida bizni tanlagan oilalar',
      icon: Users,
      badge: isRu ? 'Доверие' : 'Ishonch',
    },
    {
      value: '150+',
      label: isRu ? 'Авторских десертов' : 'Shirinlik turlari',
      desc: isRu ? 'Торты, пирожные, рулеты и бенто' : 'Mualliflik tortlari, pirojniy, rulet va shirinliklar',
      icon: Cake,
      badge: isRu ? 'Ассортимент' : 'Assortiment',
    },
    {
      value: '100%',
      label: isRu ? 'Натуральные ингредиенты' : 'Tabiiy masalliqlar',
      desc: isRu ? 'Сливочное масло 82.5%, шоколад и ягоды' : 'Halol, haqiqiy sariyog‘, Belgiya shokoladi va mevalar',
      icon: ShieldCheck,
      badge: isRu ? 'Качество' : 'Halol & Toza',
    },
    {
      value: isRu ? '10+ лет' : '10+ yil',
      label: isRu ? 'Сладких традиций' : 'Yillik tajriba',
      desc: isRu ? 'Безупречного качества с 2016 года' : '2016-yildan buyon Qarshida uzluksiz xizmat',
      icon: Clock,
      badge: isRu ? 'С 2016 года' : '2016-yildan beri',
    },
    {
      value: '2',
      label: isRu ? 'Уютных филиала' : 'Shinam filiallar',
      desc: isRu ? 'В сердце города Карши (Центр и Насаф)' : 'Qarshi shahrida (Markaziy va Nasaf)',
      icon: Store,
      badge: isRu ? 'Карши' : 'Qarshi shahri',
    },
    {
      value: '30+',
      label: isRu ? 'Мастеров-кондитеров' : 'Mohir ustalar',
      desc: isRu ? 'Команда профессионалов с любовью к делу' : 'Mehnatsevar va o‘z kasbining ustalari jamoasi',
      icon: Award,
      badge: isRu ? 'Команда' : 'Bizning jamoa',
    },
  ];

  const timelineMilestones = [
    {
      year: '2016',
      title: isRu ? 'Основание бренда Mo‘jiza 777' : '«Mo‘jiza 777» brendiga asos solindi',
      desc: isRu
        ? 'Создание бренда Mo‘jiza 777. Открытие первого семейного кондитерского цеха в городе Карши с душой и любовью к выпечке.'
        : '«Mo‘jiza 777» brendi yaratildi. Qarshi shahrida ilk oilaviy qandolatchilik sexi sifatida mehr va katta orzular bilan faoliyat boshlandi.',
    },
    {
      year: '2018',
      title: isRu ? 'Расширение ассортимента' : 'Retseptlar va ilk mashhurlik',
      desc: isRu
        ? 'Меню расширилось до 50+ авторских десертов и индивидуальных тортов. Первое широкое признание.'
        : 'Assortiment 50+ dan ortiq mualliflik retseptlariga yetdi va shaharda keng e’tirof qozonildi.',
    },
    {
      year: '2020',
      title: isRu ? 'Открытие Главного филиала' : 'Markaziy filial ochilishi',
      desc: isRu
        ? 'Открытие просторного центрального филиала. Расширение меню до 100+ эксклюзивных десертов и запуск заказных тортов.'
        : 'Qarshi markazida shinam qandolat uyi ochildi. Assortimentimiz 100+ dan ortiq eksklyuziv tort va shirinliklarga yetdi.',
    },
    {
      year: '2022',
      title: isRu ? 'Филиал Насаф и фабрика' : 'Nasaf filiali va zamonaviy sex',
      desc: isRu
        ? 'Открытие филиала Насаф. Модернизация производства с современным европейским оборудованием для безупречного вкуса.'
        : 'Nasaf filiali ishga tushdi va ishlab chiqarish quvvati zamonaviy Italiya hamda Turkiya pechlari bilan kengaytirildi.',
    },
    {
      year: '2024',
      title: isRu ? 'Бенто-тренды и доставка' : 'Bento-tortlar va tezkor yetkazish',
      desc: isRu
        ? 'Запуск популярной линейки бенто-тортов, авторских макарунов и быстрой курьерской доставки по всему городу Карши.'
        : 'Mualliflik bento-tortlari, fransuzcha desertlar va butun shahar bo‘ylab navbatsiz yetkazib berish xizmati yo‘lga qo‘yildi.',
    },
    {
      year: '2026',
      title: isRu ? '10 лет лидерства' : '10 yillik yubiley & №1 maskan',
      desc: isRu
        ? 'Сегодня Mo‘jiza 777 — это символ праздника и эталон домашнего уюта и премиального вкуса в Кашкадарье.'
        : 'Bugun «Mo‘jiza 777» — 10 yillik tajribaga ega, Qarshi va viloyat ahlining eng sevimli, toza va halol shirinliklar uyi.',
    },
  ];

  return (
    <section className="space-y-12 sm:space-y-16 pt-2">
      
      {/* ================= 1. BIZNING TARIXIMIZ (Safia Uslubidagi Xronologiya) ================= */}
      {showTimeline && (
        <div className="space-y-6">
          
          {/* Sarlavha: Safia uslubidagi yirik badiiy tipografika */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#E9E5DD]">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#AA820A] dark:text-[#E5C358] uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{isRu ? 'Наш путь' : 'Mo‘jizali an‘analar'}</span>
              </div>
              <h2 className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl text-[#1C261E] dark:text-[#F5F2EA] tracking-tight leading-none">
                <span>{isRu ? 'Наша ' : 'Bizning '}</span>
                <span className="text-[#D4AF37] relative inline-block drop-shadow-sm">
                  {isRu ? 'история' : 'tariximiz'}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-[#596B5E] dark:text-[#A6B7AA] mt-2 max-w-xl">
                {isRu 
                  ? 'От маленькой семейной мечты до ведущего кондитерского дома города Карши' 
                  : 'Kichik oilaviy orzudan Qarshi shahrining eng sevimli qandolat maskanigacha bo‘lgan yo‘l'}
              </p>
            </div>

            <Link
              href={`/${locale}/about`}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#244B2B] dark:text-[#E5C358] hover:text-[#D4AF37] transition-colors self-start md:self-auto"
            >
              <span>{isRu ? 'Читать полную историю' : 'To‘liq hikoyani o‘qish'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Gorizontal Xronologik Kartochkalar (Safia uslubida suriluvchi) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {timelineMilestones.map((item, index) => (
              <div
                key={item.year}
                className="bg-[#FBF9F4] dark:bg-[#162319] rounded-3xl border border-[#E9E5DD]/80 dark:border-[#28392B] p-6 flex flex-col justify-between min-h-[220px] sm:min-h-[250px] hover:shadow-lg hover:border-[#D4AF37] transition-all duration-300 group relative overflow-hidden"
              >
                {/* Yengil bezak chizig'i */}
                <div className="w-8 h-1 bg-[#D4AF37] rounded-full mb-4 group-hover:w-14 transition-all" />

                <div className="space-y-2">
                  <h4 className="font-bold text-sm sm:text-base text-[#1C261E] dark:text-[#F5F2EA] group-hover:text-[#244B2B] dark:group-hover:text-[#E5C358] transition-colors leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#596B5E] dark:text-[#A6B7AA] leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* Yirik yil raqami (Safia kartochkasi kabi pastda) */}
                <div className="pt-6 border-t border-[#E9E5DD]/50 dark:border-[#28392B]/60 mt-4 flex items-end justify-between">
                  <span className="font-serif font-black text-3xl sm:text-4xl text-[#1C261E] dark:text-[#F5F2EA] group-hover:text-[#D4AF37] transition-colors tracking-tight">
                    {item.year}
                  </span>
                  <span className="text-[10px] font-bold text-[#8C9B90] dark:text-[#A6B7AA] uppercase tracking-wider">
                    {index === timelineMilestones.length - 1 ? (isRu ? 'Сегодня' : 'Bugun') : `${index + 1}-bosqich`}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ================= 2. OILAMIZDA BO'LING (Statistika va Raqamlar) ================= */}
      <div className="space-y-6">
        
        {/* Sarlavha va Vakansiyalar tugmalari (Safia 2-rasm uslubida) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E9E5DD] dark:border-[#28392B]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#244B2B] dark:text-[#4ADE80] uppercase tracking-wider mb-1">
              <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{isRu ? 'В цифрах' : 'Raqamlarda Mo‘jiza 777'}</span>
            </div>
            <h2 className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl text-[#1C261E] dark:text-[#F5F2EA] tracking-tight leading-none">
              <span>{isRu ? 'В нашей ' : 'Oilamizda '}</span>
              <span className="text-[#D4AF37] relative inline-block drop-shadow-sm">
                {isRu ? 'семье' : 'bo‘ling'}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#596B5E] dark:text-[#A6B7AA] mt-2 max-w-xl">
              {isRu
                ? 'Наши достижения и масштаб любви к сладкому искусству'
                : 'Yillar davomida erishgan nufuzimiz va xalqimizga ko‘rsatilgan xizmatlar sarhisobi'}
            </p>
          </div>

          {/* O'ng tomondagi Safia uslubidagi tabletka tugmalar */}
          {showCareers && (
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <a
                href="https://t.me/mojiza777_admin"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-[#1A281E] border border-[#E9E5DD] dark:border-[#28392B] hover:border-[#244B2B] dark:hover:border-[#D4AF37] text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] hover:bg-[#F4EFE6] dark:hover:bg-[#223326] transition-all shadow-sm"
              >
                <span>{isRu ? 'Вакансии' : 'Vakansiyalar'}</span>
                <span>👩‍🍳</span>
              </a>

              <Link
                href={`/${locale}/about`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#244B2B] text-white hover:bg-[#1A3720] text-xs font-bold transition-all shadow-sm"
              >
                <span>{isRu ? 'О нас' : 'Biz haqimizda'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* 6 ta Yirik Statistika Kartochkalari (Safia uslubidagi yirik raqamlar) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-[#FBF9F4] dark:bg-[#162319] rounded-3xl border border-[#E9E5DD]/80 dark:border-[#28392B] p-5 sm:p-6 flex flex-col justify-between hover:bg-white dark:hover:bg-[#1E2E22] hover:border-[#D4AF37] hover:shadow-lg transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8C9B90] dark:text-[#A6B7AA] group-hover:text-[#244B2B] dark:group-hover:text-[#E5C358] transition-colors">
                      {s.badge}
                    </span>
                    <Icon className="w-4 h-4 text-[#D4AF37] opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Safia uslubidagi ulkan raqam */}
                  <div className="font-serif font-black text-3xl sm:text-4xl lg:text-5xl text-[#1C261E] dark:text-[#F5F2EA] group-hover:text-[#D4AF37] transition-colors leading-none tracking-tight">
                    {s.value}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E9E5DD]/50 dark:border-[#28392B]/60 mt-4">
                  <div className="font-bold text-xs sm:text-sm text-[#1C261E] dark:text-[#F5F2EA] leading-tight">
                    {s.label}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-[#596B5E] dark:text-[#A6B7AA] mt-0.5 line-clamp-2 leading-snug">
                    {s.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </section>
  );
};

export default BrandStoryStats;
