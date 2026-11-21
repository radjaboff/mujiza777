'use client';

import React, { useState, useEffect } from 'react';
import { Briefcase, Phone, Send, ArrowRight, DollarSign, MapPin, Sparkles } from 'lucide-react';
import { Vacancy } from '../../lib/api/types';
import { getStoredVacancies, DEFAULT_VACANCIES } from '../../lib/vacancies';
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer';
import { ScrollReveal } from '../ui/ScrollReveal';

interface VacanciesSectionProps {
  locale: 'uz' | 'ru';
}

export const VacanciesSection: React.FC<VacanciesSectionProps> = ({ locale }) => {
  const isRu = locale === 'ru';
  const [vacancies, setVacancies] = useState<Vacancy[]>(DEFAULT_VACANCIES);

  const loadVacancies = () => {
    setVacancies(getStoredVacancies());
  };

  useEffect(() => {
    loadVacancies();

    const handleUpdate = () => loadVacancies();
    window.addEventListener('mujiza_vacancies_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('mujiza_vacancies_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const activeVacancies = vacancies.filter((v) => v.isActive);

  return (
    <section id="vacancies" className="bg-[#FBF9F4] dark:bg-[#141F17] rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] p-4 sm:p-8 lg:p-12 space-y-4 sm:space-y-8 scroll-mt-20">
      
      {/* Sarlavha qatori */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#AA820A] dark:text-[#E5C358] uppercase tracking-wider mb-1">
            <Briefcase className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{isRu ? 'Карьера в Mo‘jiza 777' : 'Karyera va jamoa'}</span>
          </div>
          <h2 className="font-serif font-black text-2xl sm:text-4xl text-[#1C261E] dark:text-[#F5F2EA]">
            {isRu ? 'Открытые вакансии в Карши' : 'Mo‘jiza 777 jamoasiga qo‘shiling'}
          </h2>
          <p className="text-xs sm:text-sm text-[#596B5E] dark:text-[#A6B7AA] mt-1 max-w-xl">
            {isRu
              ? 'Мы всегда рады талантливым кондитерам, пекарям и бариста, влюбленным в сладкое искусство.'
              : 'Biz o‘z kasbini sevadigan mohir qandolatchilar, xushmuomala sotuvchilar va chaqqon kuryerlarni kutmoqdamiz.'}
          </p>
        </div>

        <a
          href="tel:+998937067321"
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] hover:bg-[#1A3720] dark:hover:bg-[#E5C358] text-xs font-bold transition-all shadow-md self-start sm:self-auto"
        >
          <Phone className="w-4 h-4 text-[#D4AF37] dark:text-[#0F1712]" />
          <span>+998 93 706 73 21</span>
        </a>
      </div>

      {/* Faol vakansiyalar kartochkalari - Mobilda 1 qatorda 2 ta (2x2 grid) */}
      {activeVacancies.length > 0 ? (
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {activeVacancies.map((vac) => {
            const displayTitle = isRu && vac.titleRu ? vac.titleRu : vac.title;
            const displayType = isRu && vac.typeRu ? vac.typeRu : vac.type;
            const displayLocation = isRu && vac.locationRu ? vac.locationRu : vac.location;
            const displayDesc = isRu && vac.descriptionRu ? vac.descriptionRu : vac.description;

            const telegramMsg = isRu
              ? `Здравствуйте! Я по поводу вакансии «${displayTitle}» в Mo‘jiza 777. Хочу отправить свое резюме.`
              : `Assalomu alaykum! Men Mo‘jiza 777 qandolat uyidagi «${displayTitle}» vakansiyasi bo‘yicha rezyume yubormoqchiman.`;

            const telegramUrl = `https://t.me/${vac.telegramUsername}?text=${encodeURIComponent(telegramMsg)}`;

            return (
              <StaggerItem key={vac.id}>
              <div
                className="bg-white dark:bg-[#1A281E] rounded-2xl sm:rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] p-3 sm:p-6 flex flex-col justify-between space-y-2.5 sm:space-y-4 hover:border-[#D4AF37] dark:hover:border-[#E5C358] hover:shadow-xl transition-all duration-300 group"
              >
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                    <span className="text-[9px] sm:text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border dark:border-emerald-800/40 w-fit">
                      {displayType}
                    </span>
                    <span className="text-[9.5px] sm:text-[11px] text-[#8C9B90] dark:text-[#889B8C] flex items-center gap-1 truncate">
                      <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#244B2B] dark:text-[#E5C358] flex-shrink-0" />
                      <span className="truncate">{displayLocation}</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-xs sm:text-base text-[#1C261E] dark:text-[#F5F2EA] group-hover:text-[#244B2B] dark:group-hover:text-[#E5C358] transition-colors leading-snug line-clamp-2">
                    {displayTitle}
                  </h3>

                  <p className="text-[10.5px] sm:text-xs text-[#596B5E] dark:text-[#A6B7AA] leading-snug sm:leading-relaxed line-clamp-2 sm:line-clamp-3">
                    {displayDesc}
                  </p>

                  {vac.salary && (
                    <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2 text-[10.5px] sm:text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA]">
                      <span className="text-[9.5px] sm:text-[11px] text-[#8C9B90] dark:text-[#889B8C] font-normal">
                        {isRu ? 'Оплата:' : 'Maosh:'}
                      </span>
                      <span className="text-[#244B2B] dark:text-[#E5C358] bg-[#244B2B]/5 dark:bg-[#244B2B]/30 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs leading-tight font-bold truncate">
                        {vac.salary}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2.5 sm:pt-4 border-t border-[#E9E5DD] dark:border-[#28392B] flex items-center justify-between gap-1.5 sm:gap-2">
                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 sm:py-2.5 px-2 sm:px-4 rounded-xl bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] hover:bg-[#1A3720] dark:hover:bg-[#E5C358] text-[10.5px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 shadow-xs"
                  >
                    <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37] dark:text-[#0F1712] flex-shrink-0" />
                    <span className="truncate">
                      {isRu ? 'Отклик' : 'Rezyume'}
                    </span>
                  </a>

                  <a
                    href={`tel:${vac.contactPhone.replace(/\s+/g, '')}`}
                    className="p-1.5 sm:p-2.5 rounded-xl border border-[#E9E5DD] dark:border-[#28392B] hover:border-[#244B2B] dark:hover:border-[#D4AF37] text-[#1C261E] dark:text-[#F5F2EA] hover:bg-[#F4EFE6] dark:hover:bg-[#141F17] transition-colors flex-shrink-0"
                    title={isRu ? 'Позвонить' : 'Qo‘ng‘iroq qilish'}
                  >
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </a>
                </div>
              </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      ) : (
        <div className="bg-white dark:bg-[#1A281E] rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] p-10 text-center space-y-3">
          <Sparkles className="w-10 h-10 text-[#D4AF37] mx-auto" />
          <h4 className="font-bold text-base text-[#1C261E] dark:text-[#F5F2EA]">
            {isRu ? 'На данный момент все вакансии закрыты' : 'Hozirda barcha shtatlar to‘liq'}
          </h4>
          <p className="text-xs text-[#596B5E] dark:text-[#A6B7AA] max-w-md mx-auto">
            {isRu
              ? 'Однако мы всегда рады талантливым специалистам. Отправьте ваше резюме нашему менеджеру в Telegram.'
              : 'Ammo biz doimo iqtidorli qandolatchi va baristalarni jamoamizda ko‘rishdan xursandmiz. Rezyumengizni Telegram orqali yuborishingiz mumkin.'}
          </p>
          <a
            href="https://t.me/mojiza777_admin"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] text-xs font-bold shadow-md hover:bg-[#1A3720] dark:hover:bg-[#E5C358] transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-[#D4AF37] dark:text-[#0F1712]" />
            <span>{isRu ? 'Написать в Telegram' : 'Telegramda rezyume qoldirish'}</span>
          </a>
        </div>
      )}

    </section>
  );
};

export default VacanciesSection;
