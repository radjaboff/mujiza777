import React from 'react';
import type { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';
import { BranchesView } from '../../../components/branches/BranchesView';
import { apiClient } from '../../../lib/api/client';
import { Branch } from '../../../lib/api/types';

export const dynamic = 'force-dynamic';

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
    title: isRu ? 'Филиалы и адреса' : 'Filiallarimiz va manzillar',
    description: isRu
      ? 'Адреса, контакты и режим работы сети кондитерских Mujiza 777 в городе Карши'
      : "Mo'jiza 777 ning Qarshi shahridagi filiallari, manzillari, ish vaqti va telefon raqamlari.",
  };
}

export default async function BranchesPage(
  props: {
    params: Promise<{ lang: 'uz' | 'ru' }>;
  }
) {
  const params = await props.params;

  const {
    lang
  } = params;

  unstable_setRequestLocale(lang);

  const DEFAULT_BRANCHES: Branch[] = [
    {
      id: 1,
      name: lang === 'ru' ? 'Главный филиал (Центр)' : 'Markaziy filial (Markaz)',
      address: lang === 'ru' ? 'г. Карши, ул. Ислама Каримова, 14' : "Qarshi sh., Islom Karimov ko'chasi 14",
      phone: '+998 93 706 73 21',
      workHours: '08:00 – 23:00',
      latitude: 38.8354,
      longitude: 65.7923,
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80',
      ],
      isPickupAvailable: true,
    },
    {
      id: 2,
      name: lang === 'ru' ? 'Филиал Насаф' : 'Nasaf filiali',
      address: lang === 'ru' ? 'г. Карши, ул. Насаф, 48' : "Qarshi sh., Nasaf ko'chasi 48",
      phone: '+998 93 706 73 22',
      workHours: '08:30 – 22:30',
      latitude: 38.8451,
      longitude: 65.8012,
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&auto=format&fit=crop&q=80',
      ],
      isPickupAvailable: true,
    },
  ];

  let branches: Branch[] = [];
  try {
    branches = await apiClient<Branch[]>('/api/public/branches', { lang });
  } catch {
    branches = [];
  }

  if (!branches || branches.length === 0) {
    branches = DEFAULT_BRANCHES;
  }

  return <BranchesView branches={branches} locale={lang} />;
}
