'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Crown, 
  Send, 
  Calendar, 
  Users, 
  Phone, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  MessageSquare,
  Check,
  Loader2,
  Sparkles
} from 'lucide-react';
import { apiClient } from '../../lib/api/client';
import { CateringRequestCreate, ApiError } from '../../lib/api/types';
import { ScrollReveal } from '../ui/ScrollReveal';

interface CateringViewProps {
  locale: 'uz' | 'ru';
}

interface EventTypeOption {
  uz: string;
  ru: string;
  icon: string;
  descUz: string;
  descRu: string;
}

const EVENT_TYPES: EventTypeOption[] = [
  { 
    uz: "To‘y oqshomi", 
    ru: "Свадебное торжество", 
    icon: "💍",
    descUz: "Shohona to‘y torti va desertlar",
    descRu: "Роскошный торт и десерты"
  },
  { 
    uz: "Fotiha to‘yi / Kelin salom", 
    ru: "Помолвка / Фатиха", 
    icon: "🧕",
    descUz: "Milliy va zamonaviy shirinliklar",
    descRu: "Традиционные угощения"
  },
  { 
    uz: "Banket va Marosimlar", 
    ru: "Банкеты и Мероприятия", 
    icon: "🏛️",
    descUz: "Katta buyurtma va to‘liq xizmat",
    descRu: "Крупные заказы и выпечка"
  },
  { 
    uz: "Yubiley va Tantana", 
    ru: "Юбилей и Торжество", 
    icon: "🎂",
    descUz: "Bayramona tort va qandolat",
    descRu: "Праздничный сладкий стол"
  },
];

// Tezkor mehmon soni tugmalari (mobil uchun qulay)
const QUICK_GUEST_PRESETS = [50, 100, 200, 300, 500];

export const CateringView: React.FC<CateringViewProps> = ({ locale }) => {
  const isRu = locale === 'ru';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [eventType, setEventType] = useState(EVENT_TYPES[0].uz);
  const [eventDate, setEventDate] = useState('');
  const [guestCount, setGuestCount] = useState<number | ''>(100);
  const [comment, setComment] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Sana cheklovlari: Bugundan boshlab 2 yil ichida
  const todayStr = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 2);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+998')) {
      val = '+998 ';
    }
    setPhone(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    const rawPhone = phone.replace(/[^\d+]/g, '');
    if (rawPhone.length < 13) {
      setFieldErrors({ phone: isRu ? 'Введите корректный номер телефона (+998...)' : 'Telefon raqamini to‘liq kiriting (+998...)' });
      return;
    }

    if (!name.trim()) {
      setFieldErrors({ name: isRu ? 'Введите ваше имя' : 'Ismingizni kiriting' });
      return;
    }

    if (!eventDate) {
      setFieldErrors({ eventDate: isRu ? 'Выберите дату мероприятия' : 'Tadbir sanasini tanlang' });
      return;
    }

    const payload: CateringRequestCreate = {
      name: name.trim(),
      phone: rawPhone,
      eventType: eventType,
      eventDate: eventDate,
      guestCount: Number(guestCount) || 50,
      comment: comment.trim() || undefined,
    };

    setLoading(true);

    try {
      await apiClient<{ id: number }>('/api/public/catering-requests', {
        method: 'POST',
        body: JSON.stringify(payload),
        lang: locale,
      });

      setSubmitted(true);
    } catch (err: any) {
      if (err?.status === 429) {
        setErrorMsg(isRu ? 'Слишком много запросов. Пожалуйста, повторите чуть позже.' : 'Juda ko‘p so‘rov yuborildi. Iltimos, birozdan keyin qayta urinib ko‘ring.');
      } else if (err?.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        setErrorMsg(err?.message || (isRu ? 'Не удалось отправить заявку. Попробуйте позже.' : 'Ariza yuborilmadi. Keyinroq qayta urinib ko‘ring.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-16">
      
      <ScrollReveal variant="fade-up">
        {/* Sarlavha bloki - Telefonda ixcham, o'qishga qulay */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10 space-y-2.5 sm:space-y-3">
          <Link 
            href={`/${locale}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#596B5E] dark:text-[#A6B7AA] hover:text-[#244B2B] dark:hover:text-[#E5C358] mb-1 transition-colors px-2.5 py-1 rounded-full bg-[#E9E5DD]/50 dark:bg-[#28392B]/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isRu ? 'Назад на главную' : 'Bosh sahifaga qaytish'}</span>
          </Link>
          
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#AA820A] dark:text-[#E5C358] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{isRu ? 'Свадьбы и Торжества' : 'To‘y va Marosimlar'}</span>
            </div>
          </div>

          <h1 className="font-serif font-black text-2xl sm:text-4xl lg:text-5xl text-[#1C261E] dark:text-[#F5F2EA] tracking-tight leading-snug">
            {isRu ? 'Организация сладкого стола и свадебных тортов' : 'To‘y va marosimlar uchun shirinliklar stoli'}
          </h1>
          
          <p className="text-xs sm:text-sm text-[#596B5E] dark:text-[#A6B7AA] leading-relaxed max-w-lg mx-auto">
            {isRu
              ? 'Эксклюзивный свадебный торт, Candy Bar, весовая выпечка, самса и чучвара для ваших гостей. Оставьте заявку — наш шеф свяжется с вами.'
              : 'Shohona to‘y torti, qandolat stoli, tandir somsa, chuchvara va sarpo pishiriqlari. Ariza qoldiring — xodimimiz darhol bog‘lanib aniqlashtiradi.'}
          </p>
        </div>
      </ScrollReveal>

      {submitted ? (
        /* Muvaffaqiyat xabari - Telefonda to'liq markazlashgan va yorqin */
        <div className="bg-white dark:bg-[#1A281E] rounded-3xl border border-[#D4AF37]/40 p-6 sm:p-12 shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#244B2B]/10 dark:bg-[#244B2B]/30 text-[#244B2B] dark:text-[#E5C358] flex items-center justify-center mx-auto shadow-inner border border-[#244B2B]/20 dark:border-[#28392B]">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#244B2B] dark:text-[#E5C358]" />
          </div>
          
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="font-serif font-black text-xl sm:text-3xl text-[#1C261E] dark:text-[#F5F2EA]">
              {isRu ? 'Ваша заявка успешно принята!' : 'Arizangiz muvaffaqiyatli qabul qilindi!'}
            </h3>
            <p className="text-xs sm:text-sm text-[#596B5E] dark:text-[#A6B7AA] leading-relaxed">
              {isRu
                ? 'Благодарим вас за выбор Mo‘jiza 777! Наш сотрудник свяжется с вами по указанному телефону в течение 15–30 минут, чтобы согласовать точные объемы и цены.'
                : '«Mo‘jiza 777» ni tanlaganingiz uchun tashakkur! Xodimimiz 15–30 daqiqa ichida siz ko‘rsatgan raqamga qo‘ng‘iroq qilib, barcha tafsilotlarni kelishib oladi.'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 max-w-sm mx-auto text-xs text-[#1C261E] dark:text-[#F5F2EA] flex items-center gap-2.5 text-left">
            <Sparkles className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
            <span>{isRu ? 'Шеф-кондитер уже ознакомлен с деталями вашего торжества' : 'Katta usta sizning tadbiringiz tafsilotlari bilan tanishmoqda'}</span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href={`/${locale}`}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#244B2B] hover:bg-[#1A3720] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] text-center"
            >
              {isRu ? 'Вернуться на главную' : 'Bosh sahifaga qaytish'}
            </Link>
            <a
              href="https://t.me/mujizashirinliklari777"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#1C261E] dark:text-[#F5F2EA] font-bold text-sm border border-[#D4AF37]/40 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Send className="w-4 h-4 text-[#244B2B] dark:text-[#E5C358]" />
              <span>Telegram kanalimiz</span>
            </a>
          </div>
        </div>
      ) : (
        /* Asosiy Forma - Mobil qurilmalarga to'liq optimallashtirilgan */
        <ScrollReveal variant="fade-up">
          <form 
            onSubmit={handleSubmit}
            className="bg-white dark:bg-[#1A281E] rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] p-4 sm:p-8 lg:p-10 shadow-xl space-y-6 sm:space-y-7"
          >
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-[#B83A3A]/10 border border-[#B83A3A]/30 text-[#B83A3A] text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Tadbir turi tanlash (Kartochka ko'rinishida, teginishga juda qulay) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-[#1C261E] dark:text-[#F5F2EA]">
                  {isRu ? '1. Выберите тип мероприятия:' : '1. Tadbir turini tanlang:'}
                </label>
                <span className="text-[11px] font-semibold text-[#D4AF37]">
                  {isRu ? 'Обязательно' : 'Tanlandi'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                {EVENT_TYPES.map((et, idx) => {
                  const label = isRu ? et.ru : et.uz;
                  const desc = isRu ? et.descRu : et.descUz;
                  const isSelected = eventType === et.uz;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEventType(et.uz)}
                      className={`relative p-3 rounded-2xl text-left border transition-all flex flex-col justify-between min-h-[72px] sm:min-h-[82px] active:scale-[0.98] ${
                        isSelected
                          ? 'border-[#244B2B] dark:border-[#D4AF37] bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] shadow-md ring-2 ring-[#244B2B]/20 dark:ring-[#D4AF37]/30'
                          : 'border-[#E9E5DD] dark:border-[#28392B] bg-[#FBF9F4] dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] hover:border-[#D4AF37]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-lg leading-none">{et.icon}</span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-white/20 dark:bg-black/20 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white dark:text-[#0F1712]" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="block text-xs font-bold leading-tight">{label}</span>
                        <span className={`hidden sm:block text-[10px] mt-0.5 leading-tight ${
                          isSelected ? 'text-white/80 dark:text-[#0F1712]/80' : 'text-[#8C9B90]'
                        }`}>
                          {desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Aloqa ma'lumotlari: Ism va Telefon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Ism */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C261E] dark:text-[#F5F2EA] mb-1.5">
                  {isRu ? 'Ваше имя *' : 'Ismingiz *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8C9B90] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isRu ? 'Имя и фамилия' : 'Ismingizni kiriting'}
                    className={`w-full pl-10 pr-3.5 py-3 rounded-2xl border text-base sm:text-sm focus:outline-none bg-[#FBF9F4] dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] min-h-[46px] ${
                      fieldErrors.name 
                        ? 'border-[#B83A3A] ring-1 ring-[#B83A3A]' 
                        : 'border-[#E9E5DD] dark:border-[#28392B] focus:border-[#244B2B] dark:focus:border-[#D4AF37]'
                    }`}
                  />
                </div>
                {fieldErrors.name && (
                  <span className="text-[11px] text-[#B83A3A] mt-1 block">{fieldErrors.name}</span>
                )}
              </div>

              {/* Telefon raqam */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C261E] dark:text-[#F5F2EA] mb-1.5">
                  {isRu ? 'Номер телефона *' : 'Telefon raqamingiz *'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8C9B90] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    inputMode="tel"
                    required
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="+998 90 123 45 67"
                    className={`w-full pl-10 pr-3.5 py-3 rounded-2xl border text-base sm:text-sm focus:outline-none bg-[#FBF9F4] dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] min-h-[46px] ${
                      fieldErrors.phone 
                        ? 'border-[#B83A3A] ring-1 ring-[#B83A3A]' 
                        : 'border-[#E9E5DD] dark:border-[#28392B] focus:border-[#244B2B] dark:focus:border-[#D4AF37]'
                    }`}
                  />
                </div>
                {fieldErrors.phone && (
                  <span className="text-[11px] text-[#B83A3A] mt-1 block">{fieldErrors.phone}</span>
                )}
              </div>
            </div>

            {/* 3. Tadbir sanasi va Mehmonlar soni */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Sana */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C261E] dark:text-[#F5F2EA] mb-1.5">
                  {isRu ? 'Дата мероприятия *' : 'Tadbir sanasi *'}
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#8C9B90] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    required
                    min={todayStr}
                    max={maxDateStr}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className={`w-full pl-10 pr-3.5 py-3 rounded-2xl border text-base sm:text-sm focus:outline-none bg-[#FBF9F4] dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] min-h-[46px] ${
                      fieldErrors.eventDate 
                        ? 'border-[#B83A3A] ring-1 ring-[#B83A3A]' 
                        : 'border-[#E9E5DD] dark:border-[#28392B] focus:border-[#244B2B] dark:focus:border-[#D4AF37]'
                    }`}
                  />
                </div>
                {fieldErrors.eventDate && (
                  <span className="text-[11px] text-[#B83A3A] mt-1 block">{fieldErrors.eventDate}</span>
                )}
              </div>

              {/* Mehmonlar soni & Tezkor tugmachalar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1C261E] dark:text-[#F5F2EA]">
                    {isRu ? 'Число гостей' : 'Kutilayotgan mehmonlar'}
                  </label>
                  <span className="text-[11px] text-[#8C9B90]">
                    {guestCount ? `${guestCount} ${isRu ? 'чел.' : 'kishi'}` : ''}
                  </span>
                </div>

                <div className="relative">
                  <Users className="w-4 h-4 text-[#8C9B90] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="5000"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="100"
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-[#E9E5DD] dark:border-[#28392B] text-base sm:text-sm focus:outline-none focus:border-[#244B2B] dark:focus:border-[#D4AF37] bg-[#FBF9F4] dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] min-h-[46px]"
                  />
                </div>

                {/* Mobil tezkor tugmachalar */}
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-none">
                  {QUICK_GUEST_PRESETS.map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setGuestCount(cnt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
                        guestCount === cnt
                          ? 'bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712]'
                          : 'bg-[#E9E5DD]/60 dark:bg-[#28392B]/60 text-[#596B5E] dark:text-[#A6B7AA] hover:bg-[#E9E5DD]'
                      }`}
                    >
                      {cnt} {isRu ? 'чел' : 'ta'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Katta buyurtma tafsilotlari (Pishiriqlar, somsa, chuchvara, tort...) */}
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-black uppercase tracking-wider text-[#1C261E] dark:text-[#F5F2EA]">
                  {isRu
                    ? 'Заказ и пожелания (выпечка, самса, чучвара, торт...)'
                    : 'Qanday pishiriq, somsa, chuchvara yoki tort kerak? (ixtiyoriy)'}
                </label>
                <span className="text-[11px] text-[#8C9B90]">{comment.length} / 1000</span>
              </div>

              {/* Tushunarli va aniq izoh (description) */}
              <p className="text-xs text-[#596B5E] dark:text-[#A6B7AA] leading-relaxed">
                {isRu
                  ? 'Опишите в свободной форме, что требуется для вашего торжества: сколько кг выпечки, сколько штук самсы, сколько кг чучвары или какой торт вам нужен. Наш оператор перезвонит и точно рассчитает итоговый заказ.'
                  : 'Tadbir dasturxoni uchun kerakli mahsulotlarni erkin shaklda yozib qoldiring. Masalan: qancha kg pishiriqlar assortisi, necha dona tandir somsa, necha kg chuchvara yoki qanday to‘y torti kerakligini yozing. Xodimimiz qo‘ng‘iroq qilib, barchasini aniq hisoblab beradi.'}
              </p>

              <div className="relative">
                <MessageSquare className="w-4 h-4 text-[#8C9B90] absolute left-3.5 top-3.5 pointer-events-none" />
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    isRu
                      ? 'Например: 15 кг ассорти свадебной выпечки, 200 шт тандырной самсы, 10 кг замороженной чучвары, 3-ярусный торт...'
                      : 'Masalan: 15 kg sarpo pishiriqlari assortisi, 200 dona tandir somsa, 10 kg chuchvara, 3 qavatli to‘y torti...'
                  }
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-[#E9E5DD] dark:border-[#28392B] text-base sm:text-sm focus:outline-none focus:border-[#244B2B] dark:focus:border-[#D4AF37] bg-[#FBF9F4] dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] leading-relaxed resize-none"
                />
              </div>

              {/* Xodim bog'lanishi haqida ishonchli bildirishnoma */}
              <div className="p-3 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/25 flex items-start gap-2 text-xs text-[#1C261E] dark:text-[#F5F2EA]">
                <Sparkles className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span className="leading-tight">
                  {isRu
                    ? 'Заявка сразу поступает оператору — мы перезвоним вам в течение 15–30 минут.'
                    : 'Ariza darhol xodimimizga tushadi — 15–30 daqiqa ichida qo‘ng‘iroq qilib, buyurtmani tasdiqlaymiz.'}
                </span>
              </div>
            </div>

            {/* Yuborish tugmasi va xavfsizlik */}
            <div className="pt-3 border-t border-[#E9E5DD] dark:border-[#28392B] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] sm:text-xs text-[#596B5E] dark:text-[#A6B7AA] text-center sm:text-left order-2 sm:order-1">
                🔒 {isRu ? 'Данные строго конфиденциальны' : 'Ma‘lumotlaringiz xavfsiz va begonalarga berilmaydi'}
              </span>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-2xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#1C261E] font-black text-base sm:text-sm shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 order-1 sm:order-2 min-h-[48px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#1C261E]" />
                    <span>{isRu ? 'Отправка...' : 'Yuborilmoqda...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#1C261E]" />
                    <span>{isRu ? 'Arizani yuborish' : 'Arizani yuborish'}</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </ScrollReveal>
      )}

    </div>
  );
};

export default CateringView;
