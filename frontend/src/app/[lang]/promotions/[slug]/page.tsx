import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { apiClient } from '../../../../lib/api/client';
import { Promotion } from '../../../../lib/api/types';

type Props = { params: Promise<{ lang: 'uz' | 'ru'; slug: string }> };

async function getPromotion(lang: 'uz' | 'ru', slug: string) {
  try {
    return await apiClient<Promotion>(`/api/public/promotions/${encodeURIComponent(slug)}`, { lang });
  } catch {
    return null;
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const promotion = await getPromotion(params.lang, params.slug);
  return promotion
    ? { title: promotion.title, description: promotion.summary || promotion.title }
    : { title: params.lang === 'ru' ? 'Акция не найдена' : 'Aksiya topilmadi' };
}

export default async function PromotionDetailPage(props: Props) {
  const params = await props.params;
  unstable_setRequestLocale(params.lang);
  const promotion = await getPromotion(params.lang, params.slug);
  if (!promotion) notFound();
  const isRu = params.lang === 'ru';

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <Link href={`/${params.lang}/promotions`} className="text-sm font-semibold text-[#244B2B] hover:underline">
        ← {isRu ? 'Все акции' : 'Barcha aksiyalar'}
      </Link>
      <article className="mt-5 overflow-hidden rounded-3xl border border-[#E9E5DD] bg-white shadow-sm">
        {promotion.imageUrl && (
          <div className="relative aspect-[16/8] w-full bg-[#F4EFE6]">
            <Image src={promotion.imageUrl} alt={promotion.title} fill className="object-cover" priority />
          </div>
        )}
        <div className="space-y-4 p-5 sm:p-9">
          {promotion.badge && <span className="inline-flex rounded-full bg-[#D4AF37]/20 px-3 py-1 text-xs font-bold text-[#7A5A00]">{promotion.badge}</span>}
          <h1 className="text-2xl font-black text-[#1C261E] sm:text-4xl">{promotion.title}</h1>
          {promotion.summary && <p className="text-base text-[#596B5E]">{promotion.summary}</p>}
          {promotion.description && <div className="whitespace-pre-wrap leading-7 text-[#343B35]">{promotion.description}</div>}
          {promotion.promoCode && <div className="rounded-xl bg-[#F4EFE6] p-4 font-bold">{isRu ? 'Промокод:' : 'Promokod:'} {promotion.promoCode}</div>}
          {promotion.linkUrl && <Link className="inline-flex rounded-xl bg-[#244B2B] px-5 py-3 font-bold text-white" href={promotion.linkUrl}>{isRu ? 'Перейти' : 'O‘tish'}</Link>}
        </div>
      </article>
    </main>
  );
}
