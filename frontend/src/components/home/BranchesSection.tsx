'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Clock, Navigation, Store, ArrowRight, Car } from 'lucide-react';
import { Branch } from '../../lib/api/types';

interface BranchesSectionProps {
  locale: 'uz' | 'ru';
  branches?: Branch[];
}

export const BranchesSection: React.FC<BranchesSectionProps> = ({ locale, branches }) => {
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [localBranches, setLocalBranches] = useState<Branch[] | null>(null);

  useEffect(() => {
    const handleBranchesUpdated = (event: Event) => {
      const next = (event as CustomEvent<Branch[]>).detail;
      if (Array.isArray(next)) setLocalBranches(next);
    };
    window.addEventListener('mujiza_branches_updated', handleBranchesUpdated);
    return () => window.removeEventListener('mujiza_branches_updated', handleBranchesUpdated);
  }, []);

  const defaultBranches: Branch[] = [
    {
      id: 1,
      name: locale === 'ru' ? 'Главный (Центр)' : 'Markaziy (Markaz)',
      address: locale === 'ru' ? 'г. Карши, ул. Ислама Каримова, 14' : "Qarshi sh., Islom Karimov ko'chasi 14",
      phone: '+998 93 706 73 21',
      workHours: '09:00 - 22:00',
      latitude: 38.8354,
      longitude: 65.7923,
      imageUrl: null,
      isPickupAvailable: true,
    },
    {
      id: 2,
      name: locale === 'ru' ? 'Филиал Насаф' : 'Nasaf filiali',
      address: locale === 'ru' ? 'г. Карши, ул. Насаф, 48' : "Qarshi sh., Nasaf ko'chasi 48",
      phone: '+998 93 706 73 22',
      workHours: '09:00 - 21:00',
      latitude: 38.8451,
      longitude: 65.8012,
      imageUrl: null,
      isPickupAvailable: true,
    },
  ];

  const items = localBranches && localBranches.length > 0
    ? localBranches
    : (branches && branches.length > 0 ? branches : defaultBranches);
  const activeBranch = items.find((b) => b.id === selectedBranchId);

  // Barcha filiallar nuqtalarini dinamik yig'ish (kelajakda 3-4 ta filial qo'shilsa hammasi xaritada ko'rinadi)
  const allPoints = items
    .filter((b) => b.latitude && b.longitude)
    .map((b) => `${b.longitude},${b.latitude},pm2rdm`)
    .join('~');
  const pointsParam = allPoints || '65.7923,38.8354,pm2rdm~65.8012,38.8451,pm2rdm';

  // Xarita URL manzili: filial tanlanganda yaqinlashadi, bo'lmasa barcha filiallarni umumiy ko'rsatadi
  const mapSrc = activeBranch && activeBranch.latitude && activeBranch.longitude
    ? `https://yandex.uz/map-widget/v1/?ll=${activeBranch.longitude}%2C${activeBranch.latitude}&z=16&pt=${activeBranch.longitude},${activeBranch.latitude},pm2rdm`
    : `https://yandex.uz/map-widget/v1/?ll=65.7967%2C38.8402&z=13&pt=${pointsParam}`;

  return (
    <section id="branches" className="space-y-3.5 sm:space-y-6 pt-2 sm:pt-4">
      {/* Sarlavha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E9E5DD] dark:border-[#28392B]">
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-[#244B2B] dark:text-[#4ADE80] uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37]" />
            <span>{locale === 'ru' ? 'Наши адреса' : 'Bizning manzillar'}</span>
          </div>
          <h2 className="font-serif font-bold text-lg sm:text-3xl text-[#1C261E] dark:text-[#F5F2EA] mt-0.5">
            {locale === 'ru' ? 'Филиалы в городе Карши' : 'Qarshi shahridagi filiallarimiz'}
          </h2>
          <p className="text-[11px] sm:text-sm text-[#596B5E] dark:text-[#A6B7AA] mt-0.5">
            {locale === 'ru'
              ? 'Приходите за свежими сладостями или забирайте заказы самовывозом'
              : 'Shinam qandolat uylarimizga tashrif buyuring yoki buyurtmangizni navbatsiz olib keting'}
          </p>
        </div>

        <Link
          href={`/${locale}/branches`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#244B2B] dark:text-[#E5C358] hover:text-[#D4AF37] transition-colors self-start sm:self-auto"
        >
          <span>{locale === 'ru' ? 'Все филиалы на карте' : 'Barcha filiallar xaritada'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Filiallar kartochkalari va Xarita gridi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 items-stretch">
        
        {/* Filiallar ro'yxati: 1 qatorda doim 2 tadan (avtomatik 2x2 grid shaklida qo'shiladi) */}
        <div className={`lg:col-span-5 grid grid-cols-2 ${items.length > 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-2.5 sm:gap-4 content-start`}>
          {items.map((branch) => {
            const isSelected = selectedBranchId === branch.id;
            const routeUrl = branch.latitude && branch.longitude
              ? `https://maps.yandex.ru/?rtext=~${branch.latitude},${branch.longitude}&rtt=auto`
              : `https://yandex.com/maps/?text=${encodeURIComponent(branch.address)}`;
            const taxiUrl = branch.latitude && branch.longitude
              ? `https://3.redirect.appmetrica.yandex.com/route?end-lat=${branch.latitude}&end-lon=${branch.longitude}&app=ytaxi`
              : null;

            return (
              <div
                key={branch.id}
                onClick={() => setSelectedBranchId(isSelected ? null : branch.id)}
                className={`rounded-2xl sm:rounded-3xl border p-2.5 sm:p-5 transition-all flex flex-col justify-between cursor-pointer relative group ${
                  isSelected
                    ? 'bg-gradient-to-br from-amber-50/50 via-white to-white dark:from-[#1D2B20] dark:via-[#19271D] dark:to-[#19271D] border-[#D4AF37] shadow-md ring-2 ring-[#D4AF37]/40'
                    : 'bg-white dark:bg-[#1A281E] border-[#E9E5DD] dark:border-[#28392B] shadow-xs hover:shadow-md hover:border-[#244B2B]/30'
                }`}
              >
                <div className="space-y-2">
                  {/* Filial sarlavhasi va ochiqlik indikatori */}
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#244B2B] text-white shadow-xs'
                          : 'bg-[#244B2B]/10 text-[#244B2B] group-hover:bg-[#244B2B] group-hover:text-white'
                      }`}>
                        <Store className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-xs sm:text-base text-[#1C261E] dark:text-[#F5F2EA] truncate leading-tight">
                          {branch.name}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-full mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{locale === 'ru' ? 'Открыто' : 'Ochiq'}</span>
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="text-[9px] sm:text-[10px] font-bold text-[#D4AF37] bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-700/50 flex-shrink-0">
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Manzil, Vaqt va Telefon */}
                  <div className="space-y-1 text-xs text-[#596B5E] dark:text-[#A6B7AA] pt-1.5 border-t border-[#E9E5DD]/70 dark:border-[#28392B]/70">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#244B2B] dark:text-[#4ADE80] flex-shrink-0 mt-0.5" />
                      <span className="font-medium text-[#1C261E] dark:text-[#F5F2EA] text-[10px] sm:text-xs leading-snug line-clamp-2">
                        {branch.address}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37] flex-shrink-0" />
                      <span className="text-[10px] sm:text-xs truncate">
                        <strong className="text-[#1C261E] dark:text-[#F5F2EA]">{branch.workHours || '09:00 – 22:00'}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#244B2B] dark:text-[#4ADE80] flex-shrink-0" />
                      <a
                        href={`tel:${branch.phone.replace(/\s+/g, '')}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-bold text-[#244B2B] dark:text-[#E5C358] hover:underline text-[10px] sm:text-xs truncate"
                      >
                        {branch.phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Tugmalar qatori */}
                <div className="pt-2 flex items-center gap-1 sm:gap-2" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={routeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 sm:py-2 px-2 rounded-xl bg-[#244B2B] text-white hover:bg-[#1A3720] text-[10px] sm:text-xs font-bold transition-all text-center flex items-center justify-center gap-1 shadow-xs active:scale-95"
                  >
                    <Navigation className="w-3 h-3 text-[#D4AF37]" />
                    <span>{locale === 'ru' ? 'Маршрут' : 'Yo‘nalish'}</span>
                  </a>

                  {taxiUrl && (
                    <a
                      href={taxiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={locale === 'ru' ? 'Вызвать такси в Yandex Go' : 'Yandex Go orqali taksi chaqirish'}
                      className="hidden sm:flex py-1.5 sm:py-2 px-2.5 rounded-xl bg-[#F4EFE6] dark:bg-[#141F17] hover:bg-[#EAE4D7] dark:hover:bg-[#1D2B20] text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] transition-colors items-center gap-1 active:scale-95"
                    >
                      <Car className="w-3.5 h-3.5 text-[#244B2B] dark:text-[#4ADE80]" />
                      <span className="hidden md:inline">Yandex Go</span>
                    </a>
                  )}

                  <a
                    href={`tel:${branch.phone.replace(/\s+/g, '')}`}
                    className="py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-xl border border-[#E9E5DD] dark:border-[#28392B] bg-white dark:bg-[#1A281E] hover:border-[#244B2B] text-[10px] sm:text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] transition-colors active:scale-95 flex items-center justify-center flex-shrink-0"
                    title={locale === 'ru' ? 'Позвонить' : 'Qo‘ng‘iroq qilish'}
                  >
                    <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#244B2B] dark:text-[#4ADE80]" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* O'ng tomondagi Xarita Vidjeti - Reklamalardan 100% tozalangan */}
        <div className="lg:col-span-7 bg-[#F5F2EB] dark:bg-[#121A13] rounded-2xl sm:rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] overflow-hidden shadow-xs h-[240px] sm:h-[450px] lg:h-auto min-h-[240px] lg:min-h-[460px] relative flex flex-col">
          
          {/* Yuqori brend paneli (Floating Bar) */}
          <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-3 sm:left-3 sm:right-3 z-10 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto bg-white/95 dark:bg-[#1A281E]/95 backdrop-blur-md px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-xs border border-[#E9E5DD] dark:border-[#28392B] flex items-center gap-1.5 sm:gap-2">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] sm:text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] truncate max-w-[200px] sm:max-w-none">
                {activeBranch ? activeBranch.name : (locale === 'ru' ? `${items.length} филиала Mo'jiza 777` : `Mo‘jiza 777 — ${items.length} ta filial`)}
              </span>
            </div>

            {selectedBranchId !== null && (
              <button
                type="button"
                onClick={() => setSelectedBranchId(null)}
                className="pointer-events-auto bg-[#244B2B] text-white hover:bg-[#1A3720] text-[11px] sm:text-xs font-bold px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl shadow-xs transition-all active:scale-95"
              >
                {locale === 'ru' ? 'Все' : 'Barchasi'}
              </button>
            )}
          </div>

          {/* Reklamani qirqib tashlovchi konteyner (Yandex'ning pastki tijoriy bannerlarini 100% yashiradi) */}
          <div className="relative w-full h-[calc(100%+88px)] -mb-[88px] overflow-hidden flex-1">
            <iframe
              key={mapSrc}
              src={mapSrc}
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              title="Mo'jiza 777 filiallari xaritasi"
              className="w-full h-full border-0"
            />
          </div>

          {/* Pastki qismdagi hashamatli brend paneli */}
          <div className="relative z-10 bg-white/95 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 border-t border-[#E9E5DD] dark:border-[#28392B] flex items-center justify-between text-xs text-[#596B5E] dark:text-[#A6B7AA]">
            <span className="flex items-center gap-1.5 font-medium text-[11px] sm:text-xs">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              <strong className="text-[#1C261E] dark:text-[#F5F2EA]">Mo‘jiza 777</strong> • {locale === 'ru' ? 'Карши' : 'Qarshi sh.'}
            </span>
            <span className="text-[11px] font-semibold text-[#244B2B] dark:text-[#E5C358] hidden sm:inline">
              {locale === 'ru' ? 'Нажмите на филиал слева для приближения' : 'Yaqinlashtirish uchun filial ustiga bosing'}
            </span>
          </div>

        </div>

      </div>
    </section>
  );
};

export default BranchesSection;
