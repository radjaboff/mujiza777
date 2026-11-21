import React from 'react';
import type { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';

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
    title: isRu ? 'Политика конфиденциальности' : 'Maxfiylik siyosati',
    description: isRu
      ? 'Политика конфиденциальности и обработки персональных данных кондитерской Mujiza 777'
      : "Mo'jiza 777 ning shaxsiy ma'lumotlar maxfiyligi siyosati.",
  };
}

export default async function PrivacyPage(
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="bg-white rounded-3xl border border-[#E9E5DD] p-6 sm:p-12 shadow-sm space-y-6 text-xs sm:text-sm text-[#596B5E] leading-relaxed">
        <h1 className="text-2xl sm:text-3xl font-black text-[#1C261E] pb-4 border-b border-[#E9E5DD]">
          {isRu ? 'Политика конфиденциальности' : 'Maxfiylik siyosati'}
        </h1>

        <p>
          {isRu
            ? 'Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сайта кондитерского дома «Mo‘jiza 777» в соответствии с Законом Республики Узбекистан «О персональных данных».'
            : 'Ushbu Maxfiylik siyosati O‘zbekiston Respublikasining «Shaxsiy ma’lumotlar to‘g‘risida»gi Qonuniga muvofiq «Mo‘jiza 777» sayti foydalanuvchilarining ma’lumotlarini himoya qilish tartibini belgilaydi.'}
        </p>

        <h2 className="text-base sm:text-lg font-bold text-[#1C261E] pt-2">
          {isRu ? '1. Какие данные мы собираем' : '1. Biz qanday ma’lumotlarni yig‘amiz'}
        </h2>
        <p>
          {isRu
            ? 'При оформлении заказа мы запрашиваем ваше имя, номер телефона и адрес доставки исключительно для корректного выполнения заказа и связи курьера с вами.'
            : 'Buyurtma rasmiylashtirish jarayonida faqatgina buyurtmani yetkazib berish va siz bilan bog‘lanish maqsadida ismingiz, telefon raqamingiz va yetkazish manzilingiz olinadi.'}
        </p>

        <h2 className="text-base sm:text-lg font-bold text-[#1C261E] pt-2">
          {isRu ? '2. Защита и неразглашение' : '2. Xavfsizlik va uchinchi shaxslarga bermaslik'}
        </h2>
        <p>
          {isRu
            ? 'Мы гарантируем, что ваши персональные данные никогда не будут переданы сторонним лицам или организациям, кроме случаев, предусмотренных законодательством РУз.'
            : 'Biz shaxsiy ma’lumotlaringiz qonunda nazarda tutilgan holatlardan tashqari hech qachon uchinchi shaxslarga berilmasligini va qat’iy himoyalanishini kafolatlaymiz.'}
        </p>

        <h2 className="text-base sm:text-lg font-bold text-[#1C261E] pt-2">
          {isRu ? '3. Использование файлов Cookie' : '3. Cookie fayllari'}
        </h2>
        <p>
          {isRu
            ? 'Сайт использует технические файлы cookie для сохранения выбранного языка интерфейса и содержимого корзины.'
            : 'Sayt tanlangan til va savatdagi mahsulotlarni eslab qolish uchun texnik cookie fayllaridan foydalanadi.'}
        </p>
      </div>
    </div>
  );
}
