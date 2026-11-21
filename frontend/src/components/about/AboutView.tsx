'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Award, 
  ShieldCheck, 
  Sparkles, 
  Send,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Store,
  Users,
  Truck,
  Clock,
  Phone,
  Star,
  ExternalLink
} from 'lucide-react';
import { LogoEmblem } from '../ui/Logo';
import { VacanciesSection } from './VacanciesSection';
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer';
import { ScrollReveal } from '../ui/ScrollReveal';
import { useCmsContent } from '../../lib/cms/content';

interface AboutViewProps {
  locale: 'uz' | 'ru';
}

export const AboutView: React.FC<AboutViewProps> = ({ locale }) => {
  const isRu = locale === 'ru';
  const { content } = useCmsContent();

  const stats = content.about.stats.map((s) => ({
    value: isRu && s.valueRu ? s.valueRu : s.valueUz,
    label: isRu && s.labelRu ? s.labelRu : s.labelUz,
    desc: isRu && s.descRu ? s.descRu : s.descUz,
    badge: isRu && s.badgeRu ? s.badgeRu : s.badgeUz,
  }));

  const timelineMilestones = [
    {
      year: '2016',
      title: isRu ? 'Создание бренда Mo‘jiza 777' : '«Mo‘jiza 777» brendiga asos solindi',
      desc: isRu
        ? 'Открытие первого семейного кондитерского цеха в городе Карши с искренней страстью к настоящей выпечке.'
        : 'Qarshi shahrida kichik oilaviy qandolatchilik sexi sifatida ilk faoliyat boshlandi.',
    },
    {
      year: '2018',
      title: isRu ? 'Расширение ассортимента' : 'Retseptlar va ilk mashhurlik',
      desc: isRu
        ? 'Меню расширилось до 50+ авторских десертов и индивидуальных тортов. Первое широкое признание.'
        : 'Assortiment 50+ dan ortiq mualliflik retseptlariga yetdi va shaharda e’tirof qozonildi.',
    },
    {
      year: '2020',
      title: isRu ? 'Центральный филиал' : 'Markaziy filial ochilishi',
      desc: isRu
        ? 'Открытие просторного центрального филиала. Расширение меню до 100+ эксклюзивных десертов.'
        : 'Qarshi markazida shinam qandolat uyi ochildi va assortiment 100+ taga yetkazildi.',
    },
    {
      year: '2022',
      title: isRu ? 'Филиал Насаф и фабрика' : 'Nasaf filiali va zamonaviy sex',
      desc: isRu
        ? 'Открытие филиала Насаф. Запуск фабрики выпечки с новейшим оборудованием из Италии и Турции.'
        : 'Nasaf filiali ishga tushdi va ishlab chiqarish zamonaviy Yevropa pechlari bilan jihozlandi.',
    },
    {
      year: '2024',
      title: isRu ? 'Бенто и доставка 35 мин' : 'Bento-tortlar va tezkor yetkazish',
      desc: isRu
        ? 'Линейка популярных бенто-тортов и запуск быстрой курьерской доставки за 35 минут по Карши.'
        : 'Mualliflik bento-tortlari va shahar bo‘ylab navbatsiz 35 daqiqada yetkazish yo‘lga qo‘yildi.',
    },
    {
      year: '2026',
      title: isRu ? '10 лет лидерства' : '10 yillik yubiley & №1 maskan',
      desc: isRu
        ? 'Сегодня Mo‘jiza 777 — это символ семейных праздников и эталон безупречного вкуса в Кашкадарье.'
        : 'Bugun «Mo‘jiza 777» — 10 yillik boy tajribaga ega, Qarshining eng sevimli 1-raqamli qandolat maskani.',
    },
  ];

  const brandPillars = [
    {
      image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80',
      icon: <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37]" />,
      badge: isRu ? '100% Халяль' : '100% Halol & Tabiiy',
      title: isRu ? 'Натуральные сливки и ягоды' : '100% Halol & Tabiiy masalliqlar',
      desc: isRu 
        ? 'Исключительно натуральные сливки, сливочное масло и отборные ягоды без растительных жиров.'
        : 'Haqiqiy quyuq qaymoq, sifatli sariyog‘ va barra mevalar. O‘simlik yog‘isiz sof va toza ta’m.',
    },
    {
      image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&auto=format&fit=crop&q=80',
      icon: <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37]" />,
      badge: isRu ? 'Мастерство' : 'Ustoz san’ati',
      title: isRu ? 'Искусство мастеров' : 'Ustoz qandolatchilar mehnati',
      desc: isRu
        ? 'Опытные мастера-кондитеры вкладывают тепло души и мастерство в каждый праздничный торт.'
        : 'Mohir ustalarning nozik didi, mahorati va har bir shirinlikka mehr bilan qilingan qo‘l mehnati.',
    },
    {
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
      icon: <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37]" />,
      badge: isRu ? 'Каждое утро свежее' : 'Har tong yangi',
      title: isRu ? 'Итальянские печи' : 'Italiya & Turkiya pechlari',
      desc: isRu
        ? 'Европейские конвекционные печи и стерильные цеха. Каждое утро только свежая выпечка.'
        : 'Yevropa konveksion pechlari va steril sexlarda har tong soat 06:00 dan pishiriladigan barra shirinliklar.',
    },
    {
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
      icon: <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37]" />,
      badge: isRu ? '35 минут' : '35 daqiqada',
      title: isRu ? 'Бережная доставка' : 'Tezkor & Butun yetkazish',
      desc: isRu
        ? 'Специальные коробки и термосумки сохраняют форму десертов до вашего праздничного стола.'
        : 'Maxsus zumrad qutilarda Qarshi bo‘ylab 35 daqiqada tort bezaklari butun va yangi holida yetadi.',
    },
  ];

  const branchesList = [
    {
      id: 1,
      name: isRu ? 'Центральный филиал' : 'Markaziy filial',
      address: isRu ? 'г. Карши, ул. Ислама Каримова, 14' : "Qarshi sh., Islom Karimov ko'chasi 14",
      landmark: isRu ? 'Шоколадный и бенто-зал, авторские торты' : 'Shirinliklar zali, mualliflik va to‘y tortlari',
      phone: '+998 93 706 73 21',
      workHours: '09:00 – 22:00',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      badge: isRu ? 'Главный' : 'Bosh filial',
      mapUrl: 'https://maps.google.com/?q=38.8354,65.7923',
    },
    {
      id: 2,
      name: isRu ? 'Филиал Насаф' : 'Nasaf filiali',
      address: isRu ? 'г. Карши, ул. Насаф, 48' : "Qarshi sh., Nasaf ko'chasi 48",
      landmark: isRu ? 'Европейские печи, горячая утренняя выпечка' : 'Yevropa pechlari, issiq barra pishiriqlar vitrinasi',
      phone: '+998 93 706 73 22',
      workHours: '09:00 – 21:00',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      badge: isRu ? 'Фабрика' : 'Vitrina & Sex',
      mapUrl: 'https://maps.google.com/?q=38.8451,65.8012',
    },
  ];


  const storyTitle = isRu && content.about.storyTitleRu ? content.about.storyTitleRu : content.about.storyTitleUz;
  const storyText = isRu && content.about.storyTextRu ? content.about.storyTextRu : content.about.storyTextUz;
  const teamPhoto = content.about.teamPhotoUrl || "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1000&auto=format&fit=crop&q=80";

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-2 sm:pt-6 pb-4 sm:pb-10 space-y-8 sm:space-y-14">
      
      {/* 1. Breadcrumbs (Faqat planshet va kompyuterda, mobilda joy tejash maqsadida yashirilgan) */}
      <nav className="hidden sm:flex items-center gap-2 text-xs font-medium text-[#8C9B90] dark:text-[#889B8C]">
        <Link href={`/${locale}`} className="hover:text-[#244B2B] dark:hover:text-[#E5C358] transition-colors">
          {isRu ? 'Главная' : 'Bosh sahifa'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#C4BCB0]" />
        <span className="text-[#244B2B] dark:text-[#E5C358] font-bold">
          {isRu ? 'О нас' : 'Biz haqimizda'}
        </span>
      </nav>

      <ScrollReveal variant="fade-up">
      {/* 2. Hashamatli Hero Boshlama (Desktopda 2 ustun, Mobilda qulay va lo'nda) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#162D1B] via-[#244B2B] to-[#102014] text-white p-5 sm:p-10 lg:p-14 shadow-xl border border-[#D4AF37]/35">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Chap ustun: Bosh matnlar va tugmalar */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 dark:bg-black/40 backdrop-blur-md border border-white/20 text-[#D4AF37] text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRu ? 'Кондитерский дом Mo‘jiza 777 · Карши' : 'Qandolat uyi Mo‘jiza 777 · Qarshi'}</span>
            </div>

            <h1 className="font-serif font-black text-2xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
              <span>{isRu ? 'Сладкая сказка ' : 'Qarshining '}</span>
              <span className="text-[#D4AF37] drop-shadow-md">
                {isRu ? 'города Карши' : 'shirin ertagi'}
              </span>
            </h1>

            <p className="text-xs sm:text-base text-[#E2EBE4] leading-relaxed max-w-2xl font-light">
              {isRu
                ? 'С 2016 года мы дарим тепло, безупречный вкус и праздничное настроение каждой семье города Карши. Настоящее сливочное масло, отборные ягоды и безграничная любовь к своему делу.'
                : '2016-yildan buyon Qarshi ahlini haqiqiy tabiiy shirinliklar, mehr va nozik did bilan quvontirib kelayotgan yetakchi qandolat uyi. Har bir tort — oilangiz bayramining unutilmas bezagi.'}
            </p>

            {/* Imtiyoz nishonlari */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] sm:text-xs text-[#E2EBE4]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{isRu ? '100% Халяль' : '100% Halol masalliqlar'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15">
                <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{isRu ? '10 лет традиций' : '10 yillik tajriba'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15">
                <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{isRu ? 'Доставка 35 мин' : '35 daqiqada yetkazish'}</span>
              </span>
            </div>

            {/* Tezkor havolalar (CTAs) */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Link
                href={`/${locale}/catalog`}
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#1C261E] font-bold text-xs sm:text-sm shadow-md hover:shadow-xl transition-all active:scale-95"
              >
                <span>{isRu ? 'Смотреть меню' : 'Shirinliklar menyusi'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <a
                href="#branches"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all"
              >
                <Store className="w-4 h-4 text-[#D4AF37]" />
                <span>{isRu ? 'Наши филиалы' : 'Filiallarimiz'}</span>
              </a>

              <a
                href="#vacancies"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all"
              >
                <Users className="w-4 h-4 text-[#D4AF37]" />
                <span>{isRu ? 'Вакансии' : 'Vakansiyalar'}</span>
              </a>
            </div>
          </div>

          {/* O'ng ustun: Hashamatli vizual vitrina kartochkasi (Desktopda bo'sh joyni mukammal to'ldiradi) */}
          <div className="hidden lg:block lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-[#D4AF37]/40 shadow-2xl bg-[#121B14] group">
              <div className="relative h-80 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80"
                  alt="Mo‘jiza 777 maxsus torti"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="400px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              </div>

              {/* Yuqori suzuvchi nishon */}
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#D4AF37]/60 text-[#D4AF37] text-xs font-bold shadow-lg">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isRu ? '10 Лет Доверия (2016–2026)' : '10 Yillik Tajriba (2016–2026)'}</span>
              </div>

              {/* Pastki ma'lumot qutisi */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-black/65 backdrop-blur-md border border-white/15 text-white flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">Mo‘jiza 777 Qandolat Uyi</h4>
                  <p className="text-[11px] text-[#D4AF37]">Qarshi shahrining 1-raqamli maskani</p>
                </div>
                <div className="flex items-center gap-1 text-[#D4AF37] text-xs font-bold bg-[#D4AF37]/15 px-2.5 py-1 rounded-lg border border-[#D4AF37]/30">
                  <Star className="w-3.5 h-3.5 fill-[#D4AF37]" />
                  <span>4.9</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
      </ScrollReveal>

      {/* 3. Bizning 4 ta Asosiy Qiymatimiz (Pillars) - Mobilda 2x2 qator, Kompyuterda 4 ta ustun */}
      <section className="space-y-4">
        <div className="text-center sm:text-left">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#AA820A] dark:text-[#E5C358] block mb-1">
            {isRu ? 'Наши принципы' : 'Sifat garovi'}
          </span>
          <h2 className="font-serif font-black text-xl sm:text-3xl text-[#1C261E] dark:text-[#F5F2EA]">
            {isRu ? 'Почему выбирают Mo‘jiza 777' : 'Nega aynan Mo‘jiza 777?'}
          </h2>
        </div>

        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {brandPillars.map((p, idx) => (
            <StaggerItem key={idx}>
              <div
                className="h-full bg-white dark:bg-[#1A281E] rounded-2xl sm:rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#D4AF37] transition-all duration-300 group flex flex-col justify-between"
              >
                {/* Fotosurat qismi */}
                <div className="relative h-28 sm:h-44 md:h-48 w-full overflow-hidden bg-[#F4EFE6] dark:bg-[#121B14]">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />
                  
                  {/* Oltin nishon / Badge */}
                  <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-black/65 backdrop-blur-md border border-[#D4AF37]/50 text-[#D4AF37] text-[10px] sm:text-[11px] font-bold">
                    {p.icon}
                    <span className="truncate max-w-[95px] sm:max-w-none">{p.badge}</span>
                  </div>
                </div>

                {/* Matn qismi */}
                <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-xs sm:text-base text-[#1C261E] dark:text-[#F5F2EA] group-hover:text-[#244B2B] dark:group-hover:text-[#E5C358] transition-colors leading-snug line-clamp-2">
                      {p.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-[#596B5E] dark:text-[#A6B7AA] leading-snug sm:leading-relaxed mt-1 sm:mt-1.5 line-clamp-3 sm:line-clamp-none">
                      {p.desc}
                    </p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* 4. Bizning 10 Yillik Tariximiz (Timeline: 2016-2026) */}
      <section className="space-y-4 sm:space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#AA820A] dark:text-[#E5C358] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{isRu ? 'Традиции и развитие с 2016 года' : '2016-yildan buyon bosqichma-bosqich'}</span>
          </div>
          <h2 className="font-serif font-black text-2xl sm:text-4xl lg:text-5xl text-[#1C261E] dark:text-[#F5F2EA] tracking-tight">
            <span>{isRu ? 'Наша ' : '10 yillik '}</span>
            <span className="text-[#D4AF37] drop-shadow-sm">
              {isRu ? 'история' : 'tariximiz'}
            </span>
          </h2>
          <p className="text-xs sm:text-base text-[#596B5E] dark:text-[#A6B7AA] mt-1.5 max-w-2xl">
            {isRu
              ? 'От маленькой семейной кондитерской до главного кондитерского дома Карши — 10 лет сладких традиций.'
              : 'Kichik oilaviy sexdan boshlab butun Qashqadaryo ahli sevadigan 1-raqamli qandolat maskanigacha bosib o‘tilgan 10 yillik yo‘l.'}
          </p>
        </div>

        {/* MOBIL TELEFONLAR UCHUN: Nafis Vertikal Bog'langan Yengil Timeline (sm:hidden) */}
        <div className="sm:hidden relative pl-5 space-y-2.5 before:content-[''] before:absolute before:left-2 before:top-2.5 before:bottom-2.5 before:w-[1.5px] before:bg-gradient-to-b before:from-[#D4AF37] before:via-[#244B2B] before:to-[#D4AF37]/30">
          {timelineMilestones.map((item, idx) => (
            <div key={item.year} className="relative group">
              {/* Halqa nuqta */}
              <div className="absolute -left-[20px] top-3 w-3 h-3 rounded-full bg-[#1C261E] dark:bg-[#121B14] border-2 border-[#D4AF37] flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#D4AF37]" />
              </div>

              {/* Ixcham Matn Qutisi */}
              <div className="bg-white dark:bg-[#1A281E] px-3.5 py-2.5 rounded-xl border border-[#E9E5DD]/80 dark:border-[#28392B] shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-black text-base text-[#D4AF37] leading-none">
                      {item.year}
                    </span>
                    <span className="text-[9.5px] font-bold text-[#8C9B90] dark:text-[#889B8C] uppercase tracking-wider">
                      • {idx === timelineMilestones.length - 1 ? (isRu ? '10 лет' : '10 yillik') : `${idx + 1}-bosqich`}
                    </span>
                  </div>
                </div>
                <h4 className="font-bold text-xs text-[#1C261E] dark:text-[#F5F2EA] leading-tight">
                  {item.title}
                </h4>
                <p className="text-[11px] text-[#596B5E] dark:text-[#A6B7AA] leading-snug">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* PLANSHT VA KOMPYUTER UCHUN: 6 Ustunli Gorizontal Kartalar (hidden sm:grid) */}
        <StaggerContainer className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {timelineMilestones.map((item, idx) => (
            <StaggerItem key={item.year}>
              <div
                className="h-full bg-[#FBF9F4] dark:bg-[#162319] rounded-2xl border border-[#E9E5DD]/80 dark:border-[#28392B] p-4 flex flex-col justify-between min-h-[210px] hover:shadow-xl hover:border-[#D4AF37] hover:bg-white dark:hover:bg-[#1C2C20] transition-all duration-300 group relative"
              >
                <div className="w-6 h-1 bg-[#D4AF37] rounded-full mb-3 group-hover:w-10 transition-all" />

                <div className="space-y-1.5">
                  <h3 className="font-bold text-xs sm:text-sm text-[#1C261E] dark:text-[#F5F2EA] group-hover:text-[#244B2B] dark:group-hover:text-[#E5C358] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-[#596B5E] dark:text-[#A6B7AA] leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E9E5DD]/60 dark:border-[#28392B] mt-3 flex items-end justify-between">
                  <span className="font-serif font-black text-2xl text-[#1C261E] dark:text-[#F5F2EA] group-hover:text-[#D4AF37] transition-colors tracking-tight">
                    {item.year}
                  </span>
                  <span className="text-[9px] font-bold text-[#8C9B90] dark:text-[#889B8C] uppercase tracking-wider">
                    {idx === timelineMilestones.length - 1 ? (isRu ? '10 лет' : '10 yil') : `${idx + 1}-bosqich`}
                  </span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <ScrollReveal variant="fade-up">
      {/* 5. Samimiy Hikoyamiz va Sifat Kafolati (Bo'sh joylarsiz, to'liq muvozanatlashgan) */}
      <section className="bg-white dark:bg-[#1A281E] rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] p-5 sm:p-10 lg:p-12 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#244B2B]/10 dark:bg-[#D4AF37]/20 text-[#244B2B] dark:text-[#E5C358] text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRu ? 'Философия вкуса' : 'Samimiy hikoyamiz'}</span>
            </div>

            <h2 className="font-serif font-black text-2xl sm:text-4xl text-[#1C261E] dark:text-[#F5F2EA] leading-tight">
              {storyTitle}
            </h2>
            
            <p className="text-xs sm:text-sm text-[#596B5E] dark:text-[#A6B7AA] leading-relaxed whitespace-pre-line">
              {storyText}
            </p>

            {/* Sifat kafolati va tamoyillar (Bo'shliqni yo'qotib, ishonchni oshiruvchi punktlar) */}
            <div className="space-y-2.5 pt-2 border-t border-[#F4EFE6] dark:border-[#28392B]">
              <div className="flex items-start gap-2.5 text-xs text-[#1C261E] dark:text-[#F5F2EA]">
                <CheckCircle2 className="w-4 h-4 text-[#244B2B] dark:text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span>{isRu ? 'Только натуральное сливочное масло 82.5%, чистые сливки и бельгийский шоколад.' : 'Faqat tabiiy 82.5% sariyog‘, toza quyuq qaymoq va sifatli Belgiya shokoladi.'}</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#1C261E] dark:text-[#F5F2EA]">
                <CheckCircle2 className="w-4 h-4 text-[#244B2B] dark:text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span>{isRu ? 'Строгий контроль свежести: каждое утро с 06:00 в печи отправляется новая партия.' : 'Qat’iy nazorat: har tong soat 06:00 dan boshlab Yevropa pechlarida yangi pishiriqlar pishiriladi.'}</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#1C261E] dark:text-[#F5F2EA]">
                <CheckCircle2 className="w-4 h-4 text-[#244B2B] dark:text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span>{isRu ? 'Индивидуальный подход к декору каждого праздничного и свадебного торта.' : 'Har bir to‘y va bayramona tort uchun individual nozik didli mualliflik bezaklari.'}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[#F4EFE6] dark:border-[#28392B]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#F4EFE6] dark:bg-[#141F17] border border-transparent dark:border-[#28392B] flex items-center justify-center flex-shrink-0 shadow-xs">
                  <LogoEmblem size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#1C261E] dark:text-[#F5F2EA]">Mo‘jiza 777 Qandolat Uyi</h4>
                  <p className="text-[11px] text-[#596B5E] dark:text-[#A6B7AA]">Qarshi shahri, Qashqadaryo</p>
                </div>
              </div>

              <Link
                href={`/${locale}/catalog`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] hover:bg-[#1A3720] dark:hover:bg-[#E5C358] text-xs font-bold transition-all shadow-xs"
              >
                <span>{isRu ? 'Выбрать десерт' : 'Shirinlik tanlash'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative h-72 sm:h-96 rounded-3xl overflow-hidden shadow-lg border border-[#E9E5DD] dark:border-[#28392B]">
            <Image
              src={teamPhoto}
              alt="Mo‘jiza 777 qandolat uyi sexi"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 500px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5 sm:p-6 text-white">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37] text-[#1C261E] text-xs font-bold w-fit mb-2 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>50 000+ tort pishirildi</span>
              </div>
              <p className="text-xs text-white/95 leading-relaxed font-light">
                Har bir qandolat mahsulotimiz mehr, toza vijdon va qo‘l mehnati bilan sayqallanadi.
              </p>
            </div>
          </div>

        </div>
      </section>
      </ScrollReveal>

      {/* 6. Raqamlar va Statistika (6 ta toza kvadrat bloklar) */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E9E5DD] dark:border-[#28392B]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#AA820A] dark:text-[#E5C358] uppercase tracking-wider mb-1">
              <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{isRu ? 'Масштаб и доверие' : 'Raqamlarda Mo‘jiza 777'}</span>
            </div>
            <h2 className="font-serif font-black text-2xl sm:text-4xl lg:text-5xl text-[#1C261E] dark:text-[#F5F2EA] tracking-tight">
              <span>{isRu ? 'В нашей ' : 'Oilamizda '}</span>
              <span className="text-[#D4AF37] drop-shadow-sm">
                {isRu ? 'семье' : 'bo‘ling'}
              </span>
            </h2>
          </div>

          <a
            href="https://t.me/mujizashirinliklari777"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] hover:bg-[#1A3720] dark:hover:bg-[#E5C358] text-xs font-bold transition-all shadow-xs self-start sm:self-auto"
          >
            <Send className="w-3.5 h-3.5 text-[#D4AF37] dark:text-[#0F1712]" />
            <span>{isRu ? 'Написать в Telegram' : 'Telegramda yozish'}</span>
          </a>
        </div>

        {/* 6 ta Ixcham Statistika Kartochkalari (Mobilda 2x3, Kompyuterda 1x6) */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
          {stats.map((s, idx) => (
            <StaggerItem key={idx}>
              <div
                className="h-full bg-white dark:bg-[#1A281E] rounded-2xl sm:rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] p-3.5 sm:p-5 flex flex-col justify-between hover:border-[#D4AF37] hover:shadow-lg transition-all duration-300 group"
              >
                <div>
                  <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#AA820A] dark:text-[#E5C358] block mb-1 truncate">
                    {s.badge}
                  </span>
                  <span className="font-serif font-black text-2xl sm:text-3xl text-[#244B2B] dark:text-[#E5C358] tracking-tight block">
                    {s.value}
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-[#1C261E] dark:text-[#F5F2EA] mt-1 line-clamp-1">
                    {s.label}
                  </h4>
                </div>
                <p className="text-[10px] text-[#596B5E] dark:text-[#A6B7AA] mt-2.5 pt-2 border-t border-[#F4EFE6] dark:border-[#28392B] leading-snug line-clamp-2">
                  {s.desc}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* 7. Bizning Filiallarimizga Xush Kelibsiz (2 ta shinam filial vitrinasi) */}
      <section id="branches" className="space-y-4 sm:space-y-6 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-[#E9E5DD] dark:border-[#28392B]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#AA820A] dark:text-[#E5C358] uppercase tracking-wider mb-1">
              <Store className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{isRu ? 'Наши кондитерские в Карши' : 'Qarshidagi filiallarimiz'}</span>
            </div>
            <h2 className="font-serif font-black text-2xl sm:text-4xl text-[#1C261E] dark:text-[#F5F2EA]">
              {isRu ? 'Приходите в гости' : 'Mehmonimiz bo‘ling'}
            </h2>
          </div>

          <Link
            href={`/${locale}/branches`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#244B2B] dark:text-[#E5C358] hover:text-[#D4AF37] transition-colors self-start sm:self-auto"
          >
            <span>{isRu ? 'Все филиалы на карте' : 'Barcha filiallar xaritada'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <StaggerContainer className="grid grid-cols-2 gap-2.5 sm:gap-6">
          {branchesList.map((branch) => (
            <StaggerItem key={branch.id}>
              <div
                className="h-full bg-white dark:bg-[#1A281E] rounded-2xl sm:rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] overflow-hidden hover:border-[#D4AF37] hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
              >
                {/* Fotosurat qismi */}
                <div className="relative h-28 sm:h-52 w-full overflow-hidden">
                  <Image
                    src={branch.image}
                    alt={branch.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />
                  
                  {/* Oltin nishon */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-black/65 backdrop-blur-md border border-[#D4AF37]/50 text-[#D4AF37] text-[9.5px] sm:text-[11px] font-bold">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>{branch.badge}</span>
                  </div>

                  {/* Rasm ustidagi sarlavha */}
                  <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 text-white">
                    <h3 className="font-bold text-xs sm:text-lg drop-shadow-sm leading-tight line-clamp-1">
                      {branch.name}
                    </h3>
                    <p className="hidden sm:block text-xs text-[#E2EBE4] drop-shadow-xs line-clamp-1 mt-0.5">
                      {branch.landmark}
                    </p>
                  </div>
                </div>

                {/* Matn va ma'lumotlar */}
                <div className="p-2.5 sm:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
                  <div className="space-y-1 sm:space-y-1.5 text-[10.5px] sm:text-xs text-[#596B5E] dark:text-[#A6B7AA]">
                    <div className="flex items-start gap-1 sm:gap-1.5">
                      <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#244B2B] dark:text-[#E5C358] flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-snug">{branch.address}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#244B2B] dark:text-[#E5C358] flex-shrink-0" />
                      <span className="truncate">{branch.workHours}</span>
                    </div>
                  </div>

                  {/* Tugmalar qatori */}
                  <div className="pt-2 border-t border-[#F4EFE6] dark:border-[#28392B] flex items-center justify-between gap-1.5 sm:gap-2">
                    <a
                      href={`tel:${branch.phone.replace(/\s+/g, '')}`}
                      className="flex-1 py-1.5 sm:py-2 px-1.5 sm:px-3 rounded-xl bg-[#244B2B]/10 dark:bg-[#244B2B]/40 hover:bg-[#244B2B]/20 text-[#244B2B] dark:text-[#E5C358] text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1"
                      title={branch.phone}
                    >
                      <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                      <span className="hidden sm:inline">{branch.phone}</span>
                      <span className="sm:hidden">{isRu ? 'Позвонить' : 'Tel'}</span>
                    </a>

                    <a
                      href={branch.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 sm:py-2 px-2 sm:px-3.5 rounded-xl bg-white dark:bg-[#141F17] border border-[#E9E5DD] dark:border-[#28392B] hover:border-[#D4AF37] text-[10px] sm:text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] transition-all flex items-center justify-center gap-1 flex-shrink-0"
                      title={isRu ? 'Навигация' : 'Xaritada ochish'}
                    >
                      <span className="hidden sm:inline">{isRu ? 'Навигация' : 'Xaritada ochish'}</span>
                      <span className="sm:hidden">{isRu ? 'Карта' : 'Xarita'}</span>
                      <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                    </a>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* 8. Vakansiyalar Bloki (Karyera va Jamoa) */}
      <VacanciesSection locale={locale} />

    </div>
  );
};

export default AboutView;