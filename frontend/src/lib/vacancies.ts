import { Vacancy } from './api/types';

export const DEFAULT_VACANCIES: Vacancy[] = [
  {
    id: 1,
    title: 'Usta-qandolatchi (Tort bezatuvchi)',
    titleRu: 'Мастер-кондитер (Декоратор тортов)',
    type: 'To‘liq stavka',
    typeRu: 'Полная занятость',
    location: 'Markaziy filial (Qarshi)',
    locationRu: 'Главный филиал (Карши)',
    salary: '4 000 000 – 7 000 000 so‘m',
    description: 'Biskvitlar, kremlar va bayramona eksklyuziv bezaklar bilan ishlash tajribasi talab etiladi.',
    descriptionRu: 'Опыт работы с бисквитами, нежными кремами и праздничным эксклюзивным декором.',
    contactPhone: '+998 93 706 73 21',
    telegramUsername: 'mojiza777_admin',
    isActive: true,
    createdAt: '2026-01-15',
  },
  {
    id: 2,
    title: 'Sotuvchi-barista & Maslahatchi',
    titleRu: 'Продавец-консультант / Бариста',
    type: 'Smenali grafik',
    typeRu: 'Сменный график',
    location: 'Nasaf filiali (Qarshi)',
    locationRu: 'Филиал Насаф (Карши)',
    salary: '3 000 000 – 4 500 000 so‘m',
    description: 'Xushmuomalalik, mehmondo‘stlik, kofe tayyorlash va mijozlarga shirinliklarni samimiy tavsiya qilish.',
    descriptionRu: 'Приветливость, любовь к сладостям, приготовление кофе и теплое обслуживание гостей.',
    contactPhone: '+998 93 706 73 21',
    telegramUsername: 'mojiza777_admin',
    isActive: true,
    createdAt: '2026-02-01',
  },
  {
    id: 3,
    title: 'Tezkor yetkazib beruvchi kuryer',
    titleRu: 'Курьер быстрой доставки',
    type: 'Moslashuvchan grafik',
    typeRu: 'Гибкий график',
    location: 'Qarshi shahri bo‘ylab',
    locationRu: 'По городу Карши',
    salary: '3 500 000 – 6 000 000 so‘m',
    description: 'Tort va nozik desertlarni buyurtmachining manziliga o‘z vaqtida, ehtiyotkorlik bilan yetkazish.',
    descriptionRu: 'Бережная и своевременная доставка праздничных тортов и десертов до двери клиента.',
    contactPhone: '+998 93 706 73 21',
    telegramUsername: 'mojiza777_admin',
    isActive: true,
    createdAt: '2026-02-10',
  },
  {
    id: 4,
    title: 'Pishiriqlar & Pech ustasi',
    titleRu: 'Пекарь слоеных изделий и выпечки',
    type: 'Smenali grafik',
    typeRu: 'Сменный график',
    location: 'Nasaf filiali sexi',
    locationRu: 'Цех филиала Насаф',
    salary: '3 500 000 – 5 500 000 so‘m',
    description: 'Konveksion pechlarda qatlama piroglar, kruassan va pishiriqlarni sifatli tayyorlash.',
    descriptionRu: 'Приготовление слоеных изделий, круассанов и свежей выпечки в современных печах.',
    contactPhone: '+998 93 706 73 21',
    telegramUsername: 'mojiza777_admin',
    isActive: true,
    createdAt: '2026-02-15',
  },
];

const STORAGE_KEY = 'mujiza_vacancies';

export function getStoredVacancies(): Vacancy[] {
  if (typeof window === 'undefined') {
    return DEFAULT_VACANCIES;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_VACANCIES));
      return DEFAULT_VACANCIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length >= DEFAULT_VACANCIES.length) {
      return parsed;
    }
    // Update local cache if defaults expanded
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_VACANCIES));
    return DEFAULT_VACANCIES;
  } catch {
    return DEFAULT_VACANCIES;
  }
}

export function saveStoredVacancies(vacancies: Vacancy[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vacancies));
    window.dispatchEvent(new Event('mujiza_vacancies_updated'));
  } catch {}
}
