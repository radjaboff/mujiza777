import { redirect } from 'next/navigation';

export default async function CategoryCatalogRoute(
  props: {
    params: Promise<{ lang: 'uz' | 'ru'; categorySlug: string }>;
  }
) {
  const params = await props.params;
  redirect(`/${params.lang}/catalog?categorySlug=${encodeURIComponent(params.categorySlug)}`);
}
