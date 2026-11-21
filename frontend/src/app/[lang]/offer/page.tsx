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
    title: isRu ? 'Публичная оферта' : 'Ommaviy oferta',
    description: isRu
      ? 'Публичный договор-оферта на покупку и доставку кондитерских изделий Mujiza 777'
      : "Mo'jiza 777 mahsulotlarini sotib olish va yetkazib berish bo'yicha ommaviy oferta shartnomasi.",
  };
}

export default async function OfferPage(
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
          {isRu ? 'Публичная оферта' : 'Ommaviy oferta'}
        </h1>

        <p>
          {isRu
            ? 'Настоящий документ является официальным публичным предложением (офертой) кондитерского дома «Mo‘jiza 777» физическим и юридическим лицам заключить договор купли-продажи кондитерских изделий на нижеследующих условиях.'
            : 'Ushbu hujjat «Mo‘jiza 777» qandolat uyi tomonidan jismoniy va yuridik shaxslarga qandolat mahsulotlarini sotib olish va yetkazish bo‘yicha rasmiy ommaviy oferta hisoblanadi.'}
        </p>

        <h2 className="text-base sm:text-lg font-bold text-[#1C261E] pt-2">
          {isRu ? '1. Предмет оферты' : '1. Oferta predmeti'}
        </h2>
        <p>
          {isRu
            ? 'Продавец обязуется передать Покупателю кондитерские изделия надлежащего качества согласно оформленному на сайте заказу, а Покупатель обязуется принять и оплатить товар.'
            : 'Sotuvchi Xaridor tomonidan saytda rasmiylashtirilgan buyurtmaga muvofiq sifatli qandolat mahsulotlarini yetkazish yoki topshirishni, Xaridor esa mahsulotni qabul qilib to‘lovni amalga oshirishni o‘z zimmasiga oladi.'}
        </p>

        <h2 className="text-base sm:text-lg font-bold text-[#1C261E] pt-2">
          {isRu ? '2. Порядок оформления и оплаты' : '2. Buyurtma berish va to‘lov'}
        </h2>
        <p>
          {isRu
            ? 'Заказ считается оформленным после нажатия кнопки «Подтвердить заказ» на сайте. Оплата производится наличными деньгами либо картой курьеру / на кассе магазина.'
            : 'Buyurtma saytda «Buyurtmani tasdiqlash» tugmasi bosilgandan so‘ng rasmiylashtirilgan hisoblanadi. To‘lov kuryerga yoki kassada naqd pul yoxud bank kartasi orqali amalga oshiriladi.'}
        </p>

        <h2 className="text-base sm:text-lg font-bold text-[#1C261E] pt-2">
          {isRu ? '3. Качество и возврат' : '3. Sifat kafolati va qaytarish'}
        </h2>
        <p>
          {isRu
            ? 'Поскольку кондитерские изделия относятся к категории скоропортящихся пищевых продуктов, возврат возможен только в момент передачи товара при обнаружении несоответствия заказу.'
            : 'Qandolat mahsulotlari tez buziluvchi oziq-ovqat mahsulotlari turkumiga kirganligi sababli, qaytarish faqatgina mahsulot topshirilayotgan vaqtda nuqson aniqlangan holda amalga oshiriladi.'}
        </p>
      </div>
    </div>
  );
}
