import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Truck, Store, Clock, CreditCard, Banknote, ShieldCheck, ChevronRight, CheckCircle2 } from 'lucide-react';

export async function generateMetadata(
  props: {
    params: Promise<{ lang: 'uz' | 'ru' }>;
  }
): Promise<Metadata> {
  const params = await props.params;

  const {
    lang
  } = params;

  const isRu = lang === 'ru';
  return {
    title: isRu ? 'Доставка и оплата' : 'Yetkazib berish va to‘lov',
    description: isRu
      ? 'Условия доставки по Карши, стоимость, минимальный заказ и способы оплаты в кондитерской Mujiza 777'
      : "Mo'jiza 777 da yetkazib berish shartlari, narxlari va to'lov turlari.",
  };
}

export default async function DeliveryPaymentPage(
  props: {
    params: Promise<{ lang: 'uz' | 'ru' }>;
  }
) {
  const params = await props.params;

  const {
    lang
  } = params;

  unstable_setRequestLocale(lang);
  const isRu = lang === 'ru';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-12 sm:pb-16 space-y-8 sm:space-y-12">
      
      {/* Breadcrumb navigatsiya */}
      <nav className="flex items-center gap-2 text-xs font-medium text-[#8C9B90] dark:text-[#889B8C]">
        <Link href={`/${lang}`} className="hover:text-[#244B2B] dark:hover:text-[#E5C358] transition-colors">
          {isRu ? 'Главная' : 'Bosh sahifa'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#C4BCB0]" />
        <span className="text-[#244B2B] dark:text-[#E5C358] font-bold">
          {isRu ? 'Доставка и оплата' : 'Yetkazib berish va to‘lov'}
        </span>
      </nav>

      {/* Sarlavha */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-[#D4AF37] dark:text-[#E5C358] block mb-2">
          {isRu ? 'Информация для клиентов' : 'Mijozlar uchun ma‘lumot'}
        </span>
        <h1 className="font-serif font-black text-2xl sm:text-4xl text-[#1C261E] dark:text-[#F5F2EA] tracking-tight">
          {isRu ? 'Доставка и оплата' : 'Yetkazib berish va to‘lov'}
        </h1>
        <p className="text-xs sm:text-sm text-[#596B5E] dark:text-[#A6B7AA] mt-2 sm:mt-3 leading-relaxed">
          {isRu
            ? 'Все, что нужно знать о получении свежих десертов и расчетах в городе Карши'
            : 'Qarshi shahri bo‘ylab tezkor yetkazish, filialdan olib ketish va qulay to‘lov qoidalari'}
        </p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        
        {/* 1. Yetkazib berish shartlari */}
        <div className="bg-white dark:bg-[#1A281E] rounded-2xl sm:rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] p-5 sm:p-9 shadow-xs">
          <div className="flex items-center gap-3.5 mb-5 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#244B2B] text-[#D4AF37] flex items-center justify-center flex-shrink-0 shadow-xs">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="font-serif font-black text-lg sm:text-2xl text-[#1C261E] dark:text-[#F5F2EA]">
                {isRu ? 'Курьерская доставка по Карши' : 'Qarshi shahri bo‘ylab kuryerlik yetkazish'}
              </h2>
              <span className="text-[11px] sm:text-xs text-[#596B5E] dark:text-[#A6B7AA]">
                {isRu ? 'Быстро, аккуратно и в термосумках' : 'Maxsus termosumkalarda, xavfsiz va tez'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FBF9F4] dark:bg-[#141F17] border border-[#E9E5DD] dark:border-[#28392B]">
              <span className="text-[11px] sm:text-xs text-[#596B5E] dark:text-[#A6B7AA] block mb-1">
                {isRu ? 'Стоимость доставки' : 'Yetkazish narxi'}
              </span>
              <span className="text-base sm:text-xl font-black text-[#244B2B] dark:text-[#E5C358]">
                15 000 {isRu ? 'сум' : 'so‘m'}
              </span>
              <p className="text-[10px] sm:text-[11px] text-[#596B5E] dark:text-[#8C9B90] mt-1">
                {isRu ? 'Фиксированная по городу Карши' : 'Shahar bo‘ylab qat’iy narx'}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#FBF9F4] dark:bg-[#141F17] border border-[#E9E5DD] dark:border-[#28392B]">
              <span className="text-[11px] sm:text-xs text-[#596B5E] dark:text-[#A6B7AA] block mb-1">
                {isRu ? 'Бесплатная доставка' : 'Bepul yetkazib berish'}
              </span>
              <span className="text-base sm:text-xl font-black text-[#D4AF37] dark:text-[#F5E7B2]">
                150 000 {isRu ? 'сум+' : 'so‘m+'}
              </span>
              <p className="text-[10px] sm:text-[11px] text-[#596B5E] dark:text-[#8C9B90] mt-1">
                {isRu ? 'При заказе от 150 тыс. сум' : '150 000 so‘mdan oshganda bepul'}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#FBF9F4] dark:bg-[#141F17] border border-[#E9E5DD] dark:border-[#28392B]">
              <span className="text-[11px] sm:text-xs text-[#596B5E] dark:text-[#A6B7AA] block mb-1">
                {isRu ? 'Минимальный заказ' : 'Minimal buyurtma'}
              </span>
              <span className="text-base sm:text-xl font-black text-[#1C261E] dark:text-[#F5F2EA]">
                40 000 {isRu ? 'сум' : 'so‘m'}
              </span>
              <p className="text-[10px] sm:text-[11px] text-[#596B5E] dark:text-[#8C9B90] mt-1">
                {isRu ? 'Для оформления доставки' : 'Yetkazish xizmati uchun min. summa'}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs sm:text-sm text-[#596B5E] dark:text-[#A6B7AA] leading-relaxed pt-2 border-t border-[#E9E5DD] dark:border-[#28392B]">
            <p className="flex items-start gap-2">
              <span className="text-[#D4AF37] font-bold">•</span>
              <span>
                <strong className="text-[#1C261E] dark:text-[#F5F2EA]">{isRu ? 'Время доставки:' : 'Yetkazish vaqti:'}</strong>{' '}
                {isRu
                  ? 'Обычно в течение 35–60 минут с момента подтверждения заказа, в зависимости от локации и времени приготовления десертов.'
                  : 'Odatda buyurtma tasdiqlangandan so‘ng 35–60 daqiqa ichida yetkaziladi.'}
              </span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-[#D4AF37] font-bold">•</span>
              <span>
                <strong className="text-[#1C261E] dark:text-[#F5F2EA]">{isRu ? 'Ish vaqti:' : 'Yetkazish tartibi:'}</strong>{' '}
                {isRu ? 'Ежедневно с 09:00 до 22:00 без выходных.' : 'Har kuni soat 09:00 dan 22:00 gacha dam olish kunlarisiz.'}
              </span>
            </p>
          </div>
        </div>

        {/* 2. Olib ketish (Pickup) */}
        <div className="bg-white dark:bg-[#1A281E] rounded-2xl sm:rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] p-5 sm:p-9 shadow-xs">
          <div className="flex items-center gap-3.5 mb-5 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#D4AF37] text-[#1C261E] flex items-center justify-center flex-shrink-0 shadow-xs">
              <Store className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="font-serif font-black text-lg sm:text-2xl text-[#1C261E] dark:text-[#F5F2EA]">
                {isRu ? 'Самовывоз из филиалов' : 'Filialdan o‘zi olib ketish'}
              </h2>
              <span className="text-[11px] sm:text-xs text-[#596B5E] dark:text-[#A6B7AA]">
                {isRu ? 'Бесплатно и без очередей' : 'Mutlaqo bepul va navbatsiz'}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#596B5E] dark:text-[#A6B7AA] leading-relaxed mb-4">
            {isRu
              ? 'Вы можете оформить заказ на сайте и забрать его в любом удобном филиале Mo‘jiza 777 без очереди. Это абсолютно бесплатно, а минимальная сумма заказа отсутствует.'
              : 'Saytimiz orqali oldindan buyurtma berib, o‘zingizga qulay bo‘lgan filialdan navbatsiz olib ketishingiz mumkin. Bu mutlaqo bepul va hech qanday minimal summa talab etilmaydi.'}
          </p>

          <div className="p-4 rounded-2xl bg-[#244B2B]/5 dark:bg-[#244B2B]/20 border border-[#244B2B]/20 text-xs text-[#244B2B] dark:text-[#E5C358] flex items-start gap-2.5">
            <span className="text-base flex-shrink-0">💡</span>
            <div>
              <strong>{isRu ? 'Как получить заказ в филиале:' : 'Filialda buyurtmani qabul qilish:'}</strong>{' '}
              {isRu
                ? 'При оформлении сайт выдаст вам уникальный 4-значный PIN-код. Назовите его сотруднику на кассе, и ваш упакованный заказ сразу передадут вам.'
                : 'Saytda buyurtma bergach, sizga 4 xonali maxsus PIN-kod beriladi. Filial kassasiga ushbu kodni aytishingiz bilan qadoqlangan buyurtmangiz tezda topshiriladi.'}
            </div>
          </div>
        </div>

        {/* 3. To'lov usullari */}
        <div className="bg-white dark:bg-[#1A281E] rounded-2xl sm:rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] p-5 sm:p-9 shadow-xs">
          <div className="flex items-center gap-3.5 mb-5 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#244B2B] text-[#D4AF37] flex items-center justify-center flex-shrink-0 shadow-xs">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="font-serif font-black text-lg sm:text-2xl text-[#1C261E] dark:text-[#F5F2EA]">
                {isRu ? 'Способы оплаты' : 'To‘lov usullari'}
              </h2>
              <span className="text-[11px] sm:text-xs text-[#596B5E] dark:text-[#A6B7AA]">
                {isRu ? 'Удобные и безопасные расчеты' : 'Xavfsiz va tezkor to‘lov imkoniyatlari'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FBF9F4] dark:bg-[#141F17] border border-[#E9E5DD] dark:border-[#28392B]">
              <div className="flex items-center gap-2.5 mb-2">
                <Banknote className="w-5 h-5 text-[#244B2B] dark:text-[#E5C358]" />
                <h3 className="font-bold text-sm sm:text-base text-[#1C261E] dark:text-[#F5F2EA]">
                  {isRu ? 'Наличный расчет' : 'Naqd pul'}
                </h3>
              </div>
              <p className="text-xs text-[#596B5E] dark:text-[#A6B7AA] leading-relaxed">
                {isRu
                  ? 'Оплата курьеру наличными при получении заказа или на кассе филиала.'
                  : 'Buyurtmani qabul qilib olganda kuryerga yoki filial kassasida naqd pul to‘lashingiz mumkin.'}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#FBF9F4] dark:bg-[#141F17] border border-[#E9E5DD] dark:border-[#28392B]">
              <div className="flex items-center gap-2.5 mb-2">
                <CreditCard className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-sm sm:text-base text-[#1C261E] dark:text-[#F5F2EA]">
                  {isRu ? 'Click / Payme (по согласованию)' : 'Click / Karta (Telefon orqali)'}
                </h3>
              </div>
              <p className="text-xs text-[#596B5E] dark:text-[#A6B7AA] leading-relaxed">
                {isRu
                  ? 'После оформления заказа сотрудник Mo‘jiza 777 свяжется с вами. Если вы хотите оплатить через Click или карту, он предоставит реквизиты и поможет быстро оплатить.'
                  : 'Buyurtma tushgach, Mo‘jiza 777 xodimi telefon qilib bog‘lanadi. Agar Click yoki kartaga o‘tkazib to‘lamoqchi bo‘lsangiz, operator karta raqamini beradi va to‘lovni kelishib qabul qiladi.'}
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
