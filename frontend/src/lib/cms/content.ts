'use client';

import { useState, useEffect } from 'react';

export interface HeroSlide {
  id: string;
  titleUz: string;
  titleRu: string;
  subtitleUz: string;
  subtitleRu: string;
  tagUz: string;
  tagRu: string;
  imageUrl?: string;
  bgGradient: string;
  link: string;
  buttonTextUz: string;
  buttonTextRu: string;
  isActive: boolean;
}

export interface GuaranteeItem {
  id: string;
  badgeUz: string;
  badgeRu: string;
  titleUz: string;
  titleRu: string;
  descUz: string;
  descRu: string;
  highlightUz: string;
  highlightRu: string;
  iconType: 'truck' | 'shield' | 'sparkles' | 'gift' | 'clock' | 'heart' | 'award';
}

export interface AtmosphereItem {
  id: string;
  titleUz: string;
  titleRu: string;
  descUz: string;
  descRu: string;
  tagUz: string;
  tagRu: string;
  imageUrl?: string;
}

export interface AtmosphereSectionContent {
  badgeUz: string;
  badgeRu: string;
  titleUz: string;
  titleRu: string;
  subtitleUz: string;
  subtitleRu: string;
  items: AtmosphereItem[];
}

export interface WeddingPerkItem {
  id: string;
  titleUz: string;
  titleRu: string;
  descUz: string;
  descRu: string;
}

export interface WeddingSectionContent {
  badgeUz: string;
  badgeRu: string;
  titleUz: string;
  titleRu: string;
  descUz: string;
  descRu: string;
  phone: string;
  telegramUrl: string;
  imageUrl?: string;
  perks: WeddingPerkItem[];
}

export interface AboutStatItem {
  id: string;
  valueUz: string;
  valueRu: string;
  labelUz: string;
  labelRu: string;
  descUz: string;
  descRu: string;
  badgeUz: string;
  badgeRu: string;
}

export interface AboutPageContent {
  titleUz: string;
  titleRu: string;
  subtitleUz: string;
  subtitleRu: string;
  storyTitleUz: string;
  storyTitleRu: string;
  storyTextUz: string;
  storyTextRu: string;
  teamPhotoUrl?: string;
  stats: AboutStatItem[];
}

export interface CakeShowcaseItem {
  id: string;
  shapeId: number; // 1 = Dumaloq, 2 = Yurakcha, 3 = To'rtburchak, 4 = Ko'p yarusli, 0 = Barchasi
  titleUz: string;
  titleRu: string;
  tagUz: string;
  tagRu: string;
  imageUrl: string;
}

export interface SiteCmsContent {
  heroSlides: HeroSlide[];
  guarantees: GuaranteeItem[];
  atmosphere: AtmosphereSectionContent;
  wedding: WeddingSectionContent;
  about: AboutPageContent;
  cakeShowcase: CakeShowcaseItem[];
  lastUpdated: string;
}

export const DEFAULT_CMS_CONTENT: SiteCmsContent = {
  heroSlides: [
    {
      id: 'slide-1',
      titleUz: "Sizning mo‘jizaviy shirinliklaringiz",
      titleRu: "Ваши волшебные сладости",
      subtitleUz: "Qarshi shahrida 200 dan ortiq sara tortlar, yangi pishiriqlar va nozik qo‘l mehnati shirinliklari",
      subtitleRu: "Более 200 видов эксклюзивных тортов, свежей выпечки и десертов ручной работы в городе Карши",
      tagUz: "Brend 777 · Sinalgan sifat",
      tagRu: "Бренд 777 · Проверенное качество",
      imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&auto=format&fit=crop&q=80",
      bgGradient: "from-[#1B3820] via-[#244B2B] to-[#122416]",
      link: "/catalog",
      buttonTextUz: "Katalogga o‘tish",
      buttonTextRu: "Смотреть каталог",
      isActive: true,
    },
    {
      id: 'slide-2',
      titleUz: "Istalgan dizayndagi maxsus tortlar",
      titleRu: "Торты на заказ любой сложности",
      subtitleUz: "To‘y, tug‘ilgan kun va bayramlar uchun nafis tortlar. O‘zingiz orzu qilgan ta’m va dizaynni tanlang",
      subtitleRu: "Свадебные, юбилейные и праздничные торты. Соберите торт своей мечты в нашем конструкторе",
      tagUz: "Maxsus buyurtmalar",
      tagRu: "Индивидуальный заказ",
      imageUrl: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=1200&auto=format&fit=crop&q=80",
      bgGradient: "from-[#2A3F29] via-[#1E3320] to-[#111F13]",
      link: "/cake-builder",
      buttonTextUz: "Tort yasash",
      buttonTextRu: "Собрать торт",
      isActive: true,
    },
    {
      id: 'slide-3',
      titleUz: "Qarshi bo‘ylab tezkor yetkazib berish",
      titleRu: "Быстрая доставка по городу",
      subtitleUz: "Do‘konimizning maxsus zumrad qutisi shirinligingizni xuddi yangi uzilgandek yetkazadi",
      subtitleRu: "Фирменная изумрудная упаковка сохранит свежесть и красоту вашего десерта до самого стола",
      tagUz: "Yetkazib berish xizmati",
      tagRu: "Служба доставки",
      imageUrl: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=1200&auto=format&fit=crop&q=80",
      bgGradient: "from-[#19321E] via-[#24482C] to-[#142618]",
      link: "/catalog",
      buttonTextUz: "Hozir buyurtma berish",
      buttonTextRu: "Заказать сейчас",
      isActive: true,
    },
  ],

  guarantees: [
    {
      id: 'g-1',
      badgeUz: 'TEZKOR YETKAZISH',
      badgeRu: 'БЫСТРАЯ ДОСТАВКА',
      titleUz: '45 daqiqada yetkazish',
      titleRu: 'Доставка за 45 минут',
      descUz: 'Qarshi shahri bo‘ylab maxsus termobokslarda shirinlik shakli va mayinligi buzilmasdan eshigingizgacha yetkaziladi.',
      descRu: 'Бережная доставка по городу Карши в термобоксах с сохранением идеального вида и прохлады десертов.',
      highlightUz: 'Qarshi bo‘ylab',
      highlightRu: 'По Карши',
      iconType: 'truck',
    },
    {
      id: 'g-2',
      badgeUz: 'HALOL & 100% TABIIY',
      badgeRu: 'ХАЛЯЛЬ И 100% НАТУРАЛЬНО',
      titleUz: 'Sof tabiiy masalliqlar',
      titleRu: 'Только натуральные ингредиенты',
      descUz: 'Haqiqiy 82.5% li sariyog‘, Belgiya shokoladi va yangi mevalar. Sun‘iy margarin va spredlar ishlatilmaydi.',
      descRu: 'Настоящее сливочное масло 82.5%, бельгийский шоколад и свежие ягоды. Никакого маргарина и вредных спредов.',
      highlightUz: '82.5% sariyog‘',
      highlightRu: '82.5% масло',
      iconType: 'shield',
    },
    {
      id: 'g-3',
      badgeUz: 'KAFOLATLANGAN YANGILIK',
      badgeRu: 'ГАРАНТИЯ СВЕЖЕСТИ',
      titleUz: 'Har tong yangi pishiriladi',
      titleRu: 'Свежая выпечка каждое утро',
      descUz: 'Kechagi qolgan mahsulot sotilmaydi. Har kuni tonggi soat 07:00 dan noldan pishirilgan yangi partiya chiqadi.',
      descRu: 'Мы не продаем вчерашние десерты. Каждое утро с 07:00 выпекается исключительно свежая партия.',
      highlightUz: 'Har kuni 07:00',
      highlightRu: 'Каждый день',
      iconType: 'sparkles',
    },
    {
      id: 'g-4',
      badgeUz: 'BAYRAMONA SOVG‘A',
      badgeRu: 'ПОДАРОК К ЗАКАЗУ',
      titleUz: 'Har bir tortga bayram sovg‘asi',
      titleRu: 'Подарок к каждому торту',
      descUz: 'Har bir buyurtma bilan birga maxsus bayramona shamcha va xushbo‘y tilaknoma bepul taqdim etiladi.',
      descRu: 'К каждому праздничному заказу мы бесплатно дарим стильную свечу и дизайнерскую открытку с пожеланиями.',
      highlightUz: 'Bepul taqdim',
      highlightRu: 'Бесплатно',
      iconType: 'gift',
    },
  ],

  atmosphere: {
    badgeUz: 'Bizning qandolat uyi',
    badgeRu: 'Наш кондитерский дом',
    titleUz: "Mo‘jiza 777 Atmosferasi",
    titleRu: "Атмосфера Mo‘jiza 777",
    subtitleUz: "Qarshi shahridagi shinam do‘konimizga tashrif buyuring yoki sevimli shirinliklaringizni buyurtma qiling",
    subtitleRu: "Посетите наш уютный магазин в Карши или закажите любимые сладости с доставкой",
    items: [
      {
        id: 'atm-1',
        titleUz: 'Shinam va mehrli muhit',
        titleRu: 'Светлая атмосфера тепла и уюта',
        descUz: "Oq arkalar, yashillik va yangi pishgan nozik tortlarning xushbo‘y ifori har bir mehmonni quchoq ochib kutib oladi",
        descRu: 'Белоснежные арки, натуральная зелень и аромат свежеиспеченных тортов встречают каждого гостя',
        tagUz: 'Do‘konimiz ichki ko‘rinishi',
        tagRu: 'Интерьер магазина',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'atm-2',
        titleUz: 'Maxsus zumrad qadoqlar',
        titleRu: 'Фирменные изумрудные коробки',
        descUz: "Har bir tort Mo‘jiza 777 ning tillarang zar bilan bezatilgan afsonaviy zumrad qutisiga ehtiyotkorlik bilan joylanadi",
        descRu: 'Каждый торт бережно упаковывается в легендарную зеленую коробку Mo‘jiza 777 с золотым тиснением',
        tagUz: 'Brend qadoqlash',
        tagRu: 'Фирменная упаковка',
        imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'atm-3',
        titleUz: 'Har kuni yangi va barra vitrinalar',
        titleRu: 'Свежайшие витрины каждый день',
        descUz: "200 dan ziyod sara lazzatlar: klassik Napoleondan tortib eksklyuziv pista va shokoladli shirinliklargacha",
        descRu: 'Более 200 видов десертов: от классического Наполеона до авторских фисташковых шедевров',
        tagUz: 'Har doim barra',
        tagRu: 'Всегда свежее',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
      },
    ],
  },

  wedding: {
    badgeUz: 'To‘y va Marosimlar',
    badgeRu: 'Свадьбы и Торжества',
    titleUz: 'Katta to‘y va marosimlar: shohona tortlar, pishiriqlar va milliy lazzatlar',
    titleRu: 'Свадьбы и банкеты: роскошные торты, выпечка и горячая самса',
    descUz: 'Qarshi shahrida to‘y oqshomi, fotiha, banket yoki tantana rejalashtiryapsizmi? «Mo‘jiza 777» shohona to‘y tortlari, sarpo pishiriqlari assortisi, tandir somsa va chuchvara bilan dasturxoningizni bezaydi.',
    descRu: 'Планируете свадьбу, помолвку или банкет в Карши? «Mo‘jiza 777» украсит ваш дастархан роскошными тортами, десятками килограммов свежей выпечки, тандырной самсой и чучварой.',
    phone: '+998 93 706 73 21',
    telegramUrl: 'https://t.me/mujizashirinliklari777',
    imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=1000&auto=format&fit=crop&q=80',
    perks: [
      {
        id: 'wp-1',
        titleUz: 'Shohona to‘y tortlari',
        titleRu: 'Роскошные свадебные торты',
        descUz: '3–5 qavatli mualliflik to‘y tortlari, individual dizayn va bepul degustatsiya.',
        descRu: '3–5 ярусные свадебные шедевры, авторский дизайн и дегустация.',
      },
      {
        id: 'wp-2',
        titleUz: 'Sarpo va to‘y pishiriqlari',
        titleRu: 'Свадебная выpeчка на заказ',
        descUz: 'Katta marosimlar uchun o‘nlab kg barra va sara pishiriqlar assortisi.',
        descRu: 'Десятки килограммов отборной весовой выпечки для праздничных столов.',
      },
      {
        id: 'wp-3',
        titleUz: 'Tandir somsa va chuchvara',
        titleRu: 'Тандырная самса и чучвара',
        descUz: 'Yuzlab dona issiq, mazali tandir somsa va toza go‘shtli sifatli chuchvara.',
        descRu: 'Горячая сочная самса сотнями штук и домашняя мясная чучвара.',
      },
      {
        id: 'wp-4',
        titleUz: 'Restoranga xavfsiz yetkazish',
        titleRu: 'Доставка прямо в банкетный зал',
        descUz: 'Belgilangan aniq vaqtda maxsus sovutilgan holda butun va xavfsiz yetkaziladi.',
        descRu: 'Точно в назначенный час в охлаждаемом фургоне с гарантией свежести.',
      },
    ],
  },

  about: {
    titleUz: "«Mo‘jiza 777» shirinliklar uyi haqida",
    titleRu: "О кондитерском доме Mo‘jiza 777",
    subtitleUz: "Qarshi shahrida har bir oila xursandchiligiga shirin mehr ulashayotgan qandolat dargohi",
    subtitleRu: "Кондитерский дом, дарящий сладкую радость каждой семье города Карши",
    storyTitleUz: "Bizning tariximiz va sifat falsafamiz",
    storyTitleRu: "Наша история и философия качества",
    storyTextUz: "«Mo‘jiza 777» brendi o‘z faoliyatini kichik oilaviy qandolatxona sifatida boshlagan. Bugungi kunga kelib esa u Qarshi shahrining eng taniqli va sevimli qandolat maskanlaridan biriga aylandi. Biz har tong 100% tabiiy va halol masalliqlar, haqiqiy sariyog‘ va sara mevalardan foydalanib eng barra shirinliklarni xaridoringizga taqdim etamiz.",
    storyTextRu: "Бренд Mo‘jiza 777 начинал свой путь как небольшая семейная кондитерская. Сегодня это один из самых любимых и узнаваемых брендов города Карши. Каждое утро мы выпекаем свежайшие десерты исключительно из 100% натуральных ингредиентов, чистого сливочного масла и отборных ягод.",
    teamPhotoUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1000&auto=format&fit=crop&q=80",
    stats: [
      {
        id: 's-1',
        valueUz: '50 000+',
        valueRu: '50 000+',
        labelUz: 'Mamnun oilalar',
        labelRu: 'Довольных семей',
        descUz: 'Bayram va to‘ylarida bizni tanlagan xaridorlar',
        descRu: 'Доверили свои праздники и семейные торжества',
        badgeUz: 'Ishonch',
        badgeRu: 'Доверие',
      },
      {
        id: 's-2',
        valueUz: '200+',
        valueRu: '200+',
        labelUz: 'Shirinlik turlari',
        labelRu: 'Видов десертов',
        descUz: 'Mualliflik tortlari, pirojniy, rulet va qandolatlar',
        descRu: 'Торты, пирожные, рулеты и праздничная выпечка',
        badgeUz: 'Assortiment',
        badgeRu: 'Ассортимент',
      },
      {
        id: 's-3',
        valueUz: '100%',
        valueRu: '100%',
        labelUz: 'Tabiiy masalliqlar',
        labelRu: 'Натуральные ингредиенты',
        descUz: '82.5% haqiqiy sariyog‘, margarinsiz halol sifat',
        descRu: 'Сливочное масло 82.5%, без маргарина и добавок',
        badgeUz: 'Halol & Toza',
        badgeRu: 'Качество',
      },
      {
        id: 's-4',
        valueUz: '10+ yil',
        valueRu: '10+ лет',
        labelUz: 'Yillik tajriba',
        labelRu: 'Лет опыта',
        descUz: '2016-yildan buyon Qarshida sinalgan mehr',
        descRu: 'Безупречного качества с 2016 года в Карши',
        badgeUz: '2016-yildan',
        badgeRu: 'С 2016 года',
      },
      {
        id: 's-5',
        valueUz: '2 ta',
        valueRu: '2',
        labelUz: 'Shinam filial',
        labelRu: 'Уютных филиала',
        descUz: 'Qarshi shahrida: Markaziy va Nasaf filiallari',
        descRu: 'В центре города Карши: Центральный и Насаф',
        badgeUz: 'Filiallar',
        badgeRu: 'Локации',
      },
      {
        id: 's-6',
        valueUz: '35+',
        valueRu: '35+',
        labelUz: 'Mohir ustalar',
        labelRu: 'Мастеров своего дела',
        descUz: 'O‘z kasbini sevadigan tajribali qandolatchilar',
        descRu: 'Команда профессионалов с искренней любовью к выпечке',
        badgeUz: 'Jamoa',
        badgeRu: 'Команда',
      },
    ],
  },

  cakeShowcase: [
    // Dumaloq (Shape 1)
    {
      id: 'cs-1',
      shapeId: 1,
      titleUz: 'Shokoladli va qulupnayli shohona tort',
      titleRu: 'Шоколадно-клубничный торт',
      tagUz: 'Tug‘ilgan kun',
      tagRu: 'День рождения',
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1000&auto=format&fit=crop&q=80',
    },
    {
      id: 'cs-2',
      shapeId: 1,
      titleUz: 'Yangi mevali krem-chizli klassik tort',
      titleRu: 'Классический ягодный крем-чиз',
      tagUz: 'Eng ommabop',
      tagRu: 'Хит',
      imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1000&auto=format&fit=crop&q=80',
    },
    {
      id: 'cs-3',
      shapeId: 1,
      titleUz: 'Oq kremli nozik biskvit va malinali konfi',
      titleRu: 'Белоснежный торт с малиновым конфи',
      tagUz: 'Oilaviy bayram',
      tagRu: 'Семейный праздник',
      imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=1000&auto=format&fit=crop&q=80',
    },
    // Yurakcha (Shape 2)
    {
      id: 'cs-4',
      shapeId: 2,
      titleUz: 'Qizil baxmal romantik yurak torti',
      titleRu: 'Красный бархат в форме сердца',
      tagUz: 'Romantika',
      tagRu: 'Романтика',
      imageUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=1000&auto=format&fit=crop&q=80',
    },
    {
      id: 'cs-5',
      shapeId: 2,
      titleUz: 'Nozik pushti gulli va marvaridli yurakcha',
      titleRu: 'Нежный розовый торт с цветами',
      tagUz: 'Sevgi izhori',
      tagRu: 'Признание в любви',
      imageUrl: 'https://images.unsplash.com/photo-1518047601542-450d4bc045b1?w=1000&auto=format&fit=crop&q=80',
    },
    {
      id: 'cs-6',
      shapeId: 2,
      titleUz: 'Oltin zarlar bilan bezatilgan shokolad yurak',
      titleRu: 'Шоколадное сердце с золотыми искрами',
      tagUz: 'Yubiley',
      tagRu: 'Юбилей',
      imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=1000&auto=format&fit=crop&q=80',
    },
    // To'rtburchak (Shape 3)
    {
      id: 'cs-7',
      shapeId: 3,
      titleUz: 'Katta tantanalar uchun to‘rtburchak bayram torti',
      titleRu: 'Большой праздничный торт',
      tagUz: 'Tantanali',
      tagRu: 'Торжественный',
      imageUrl: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=1000&auto=format&fit=crop&q=80',
    },
    {
      id: 'cs-8',
      shapeId: 3,
      titleUz: 'Karamel va yong‘oqli korporativ shohona tort',
      titleRu: 'Карамельно-ореховый корпоративный торт',
      tagUz: 'Korporativ',
      tagRu: 'Корпоратив',
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=1000&auto=format&fit=crop&q=80',
    },
    {
      id: 'cs-9',
      shapeId: 3,
      titleUz: 'Mavsumiy yangi mevali qatlamli biskvit',
      titleRu: 'Слоеный бисквит с сезонными ягодами',
      tagUz: 'Katta davra',
      tagRu: 'Большая компания',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1000&auto=format&fit=crop&q=80',
    },
    // Ko'p yarusli (Shape 4)
    {
      id: 'cs-10',
      shapeId: 4,
      titleUz: '3 qavatli hashamatli to‘y torti',
      titleRu: '3-х ярусный роскошный свадебный торт',
      tagUz: 'To‘y torti',
      tagRu: 'Свадебный',
      imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=1000&auto=format&fit=crop&q=80',
    },
    {
      id: 'cs-11',
      shapeId: 4,
      titleUz: 'Oq marvarid va nafis tirik gulli marosim torti',
      titleRu: 'Свадебный торт с белыми цветами',
      tagUz: 'Fotiha va To‘y',
      tagRu: 'Помолвка и свадьба',
      imageUrl: 'https://images.unsplash.com/photo-1525255877101-3934c45a574e?w=1000&auto=format&fit=crop&q=80',
    },
    {
      id: 'cs-12',
      shapeId: 4,
      titleUz: 'Oltin zarlar bilan ishlangan 4 qavatli imperator torti',
      titleRu: '4-х ярусный торт с золотом',
      tagUz: 'Shohona',
      tagRu: 'Роскошный',
      imageUrl: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=1000&auto=format&fit=crop&q=80',
    },
  ],

  lastUpdated: new Date().toISOString(),
};

const STORAGE_KEY = 'mujiza_cms_content_v1';
const UPDATE_EVENT = 'mujiza_cms_updated';

export function getCmsContent(): SiteCmsContent {
  if (typeof window === 'undefined') {
    return DEFAULT_CMS_CONTENT;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_CMS_CONTENT,
        ...parsed,
        atmosphere: { ...DEFAULT_CMS_CONTENT.atmosphere, ...(parsed.atmosphere || {}) },
        wedding: { ...DEFAULT_CMS_CONTENT.wedding, ...(parsed.wedding || {}) },
        about: { ...DEFAULT_CMS_CONTENT.about, ...(parsed.about || {}) },
        cakeShowcase: parsed.cakeShowcase && parsed.cakeShowcase.length > 0 ? parsed.cakeShowcase : DEFAULT_CMS_CONTENT.cakeShowcase,
      };
    }
  } catch {}
  return DEFAULT_CMS_CONTENT;
}

export function saveCmsContent(content: SiteCmsContent): void {
  if (typeof window === 'undefined') return;
  try {
    const updated = { ...content, lastUpdated: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: updated }));
  } catch {}
}

export function useCmsContent(): {
  content: SiteCmsContent;
  updateContent: (newContent: SiteCmsContent) => void;
  resetToDefaults: () => void;
} {
  const [content, setContent] = useState<SiteCmsContent>(DEFAULT_CMS_CONTENT);

  useEffect(() => {
    setContent(getCmsContent());

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setContent(e.detail);
      } else {
        setContent(getCmsContent());
      }
    };

    window.addEventListener(UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const updateContent = (newContent: SiteCmsContent) => {
    saveCmsContent(newContent);
    setContent(newContent);
  };

  const resetToDefaults = () => {
    saveCmsContent(DEFAULT_CMS_CONTENT);
    setContent(DEFAULT_CMS_CONTENT);
  };

  return { content, updateContent, resetToDefaults };
}
