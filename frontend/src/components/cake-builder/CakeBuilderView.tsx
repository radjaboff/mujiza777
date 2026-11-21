'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Check, 
  Calendar, 
  Camera, 
  X, 
  Loader2, 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  Cake, 
  Heart, 
  Square, 
  Crown,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ScrollReveal } from '../ui/ScrollReveal';
import { apiClient, checkoutIdempotencyKey, clearCheckoutIdempotencyKey } from '../../lib/api/client';
import { 
  CakeConfig, 
  CakeOrderCreate, 
  Order, 
  Branch, 
  OrderType 
} from '../../lib/api/types';
import { useMyOrdersStore } from '../../stores/my-orders';
import { useCmsContent, DEFAULT_CMS_CONTENT } from '../../lib/cms/content';

interface CakeBuilderViewProps {
  locale: 'uz' | 'ru';
}

interface ShapeOption {
  id: number;
  name: string;
  desc: string;
  badge: string;
  icon: typeof Cake;
  imageUrl: string;
}

interface FlavorOption {
  id: number;
  name: string;
  desc: string;
  emoji: string;
}

interface DecorOption {
  id: number;
  name: string;
  desc: string;
  emoji: string;
}

export function CakeBuilderView({ locale }: CakeBuilderViewProps) {
  const isRu = locale === 'ru';
  const router = useRouter();
  const { addToken } = useMyOrdersStore();

  // 1. Asosiy shakllar (Hayotiy eng mashhurlari)
  const SHAPES: ShapeOption[] = [
    {
      id: 1,
      name: isRu ? 'Круглый (Классический)' : 'Dumaloq (Klassik)',
      desc: isRu ? 'Идеально для дней рождений и семейных праздников' : 'Tug‘ilgan kun va oilaviy bayramlar uchun eng mashhur tanlov',
      badge: isRu ? 'Хит' : 'Eng ommabop',
      icon: Cake,
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1000&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      name: isRu ? 'В форме сердца (Романтический)' : 'Yurakcha (Romantik)',
      desc: isRu ? 'Для признания в любви, годовщин и романтических дат' : 'Sevgi izhori, yubileylar va romantik unutilmas kunlar uchun',
      badge: isRu ? 'Романтика' : 'Romantika',
      icon: Heart,
      imageUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=1000&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      name: isRu ? 'Прямоугольный (Праздничный)' : 'To‘rtburchak (Bayramona)',
      desc: isRu ? 'Удобная нарезка для больших компаний и корпоративов' : 'Katta do‘stlar davrasi, korporativ va jamoaviy bayramlar uchun',
      badge: isRu ? 'Большой' : 'Tantanali',
      icon: Square,
      imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=1000&auto=format&fit=crop&q=80',
    },
    {
      id: 4,
      name: isRu ? 'Многоярусный (Свадебный)' : 'Ko‘p yarusli (To‘y va Marosim)',
      desc: isRu ? 'Роскошный многоуровневый торт для свадеб и пышных торжеств' : 'To‘y, fotiha va yirik tantanalar uchun hashamatli yarusli tort',
      badge: isRu ? 'Премиум' : 'To‘y uchun',
      icon: Crown,
      imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=1000&auto=format&fit=crop&q=80',
    },
  ];

  // 2. Ichi qanaqa bo'lsin (Ta'mlar)
  const FLAVORS: FlavorOption[] = [
    {
      id: 101,
      name: isRu ? 'Пломбирный крем (Нежный классический)' : 'Plombir qaymoqli (Klassik nozik ta‘m)',
      desc: isRu ? 'Воздушный сливочный вкус с лёгкими нотками натуральной ванили' : 'Yengil qaymoqli, ko‘pchilik sevib iste‘mol qiladigan shirin lazzat',
      emoji: '🍦',
    },
    {
      id: 102,
      name: isRu ? 'Шоколадный ганаш (Богатый шоколад)' : 'Shokoladli ganash (Haqiqiy to‘yimli shokolad)',
      desc: isRu ? 'Глубокий шоколадный бисквит с тающим во рту шоколадным кремом' : 'Haqiqiy qora va sutli shokolad shinavandalari uchun ajoyib boy ta‘m',
      emoji: '🍫',
    },
    {
      id: 103,
      name: isRu ? 'Сникерс (Карамель и арахис)' : 'Snikers (Karamel, yeryong‘oq va shokolad)',
      desc: isRu ? 'Домашняя солёная карамель, жареный арахис и крем-нуга' : 'Quyuq karamel, qovurilgan yong‘oq va qalin shokolad qatlamlari',
      emoji: '🥜',
    },
    {
      id: 104,
      name: isRu ? 'Красный бархат (Red Velvet)' : 'Qizil baxmal (Red Velvet - nafis biskvit)',
      desc: isRu ? 'Изумительный бархатный бисквит с нежным сырным кремом' : 'Nafis qizil biskvit va yumshoq pishloqli krem-chiz uyg‘unligi',
      emoji: '🍰',
    },
    {
      id: 105,
      name: isRu ? 'Ягодно-фруктовый (Освежающий)' : 'Mevali va rezavorli (Barra va yengil)',
      desc: isRu ? 'Свежие ягоды, фруктовая прослойка и лёгкий сливочный мусс' : 'Mavsumiy mevalar, rezavorli konfi va mevali barra ta‘m',
      emoji: '🍓',
    },
  ];

  // 3. Ustki bezaklari (Dizayn)
  const DECORS: DecorOption[] = [
    {
      id: 201,
      name: isRu ? 'Свежие ягоды и фрукты' : 'Yangi barra mevalar va qulupnay',
      desc: isRu ? 'Клубника, голубика и сезонные ягоды с лёгким блеском' : 'Qulupnay, rezavor mevalar va barra shirinliklar bilan bezatilgan',
      emoji: '🍓',
    },
    {
      id: 202,
      name: isRu ? 'Шоколадные подтёки и сладости' : 'Shokolad oqmalari (podtyok) va shirinliklar',
      desc: isRu ? 'Глянцевый шоколад, конфеты, печенье и хрустящий декор' : 'Ishtahaochar shokolad oqmalari, pechenye va shokolad bo‘laklari',
      emoji: '🍫',
    },
    {
      id: 203,
      name: isRu ? 'Золотая пыльца и нежные цветы' : 'Oltin zar va nafis gullar (Hashamatli)',
      desc: isRu ? 'Элегантные живые или кремовые цветы с золотыми акцентами' : 'To‘y va tantanalar uchun oltin jilo va nafis gul kompozitsiyasi',
      emoji: '✨',
    },
    {
      id: 204,
      name: isRu ? 'Детский яркий дизайн' : 'Bolalar bayrami uchun quvnoq dizayn',
      desc: isRu ? 'Яркие праздничные цвета, леденцы, безе и сказочный стиль' : 'Rang-barang shirinliklar, bezelar va quvnoq bayramona ko‘rinish',
      emoji: '🎈',
    },
    {
      id: 205,
      name: isRu ? 'Минималистичный стильный крем' : 'Minimalist nafis krem naqshlari',
      desc: isRu ? 'Чистые ровные линии, сдержанная элегантность и утончённость' : 'Jiddiy, ortiqcha narsalarsiz, zamonaviy va silliq estetik ko‘rinish',
      emoji: '🌿',
    },
  ];

  // State
  const [selectedShapeId, setSelectedShapeId] = useState<number>(1);
  const [selectedFlavorId, setSelectedFlavorId] = useState<number>(101);
  const [flavorNote, setFlavorNote] = useState<string>('');
  const [selectedDecorId, setSelectedDecorId] = useState<number>(201);
  const [decorNote, setDecorNote] = useState<string>('');
  const [inscription, setInscription] = useState<string>('');

  // Rasm yuklash
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  // Aloqa va yetkazish
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('+998 ');
  const [orderType, setOrderType] = useState<OrderType>('DELIVERY');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState<number | undefined>();
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Ertangi kunni standart sana qilib olish
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduledDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // Filiallarni yuklash
  useEffect(() => {
    let active = true;
    apiClient<Branch[]>('/api/public/branches', { lang: locale })
      .then((data) => {
        if (!active) return;
        const available = data.filter((branch) => branch.isPickupAvailable);
        setBranches(available);
        setBranchId(available[0]?.id);
      })
      .catch(() => { if (active) setBranches([]); });
    return () => { active = false; };
  }, [locale]);

  const selectedShape = SHAPES.find((s) => s.id === selectedShapeId) || SHAPES[0];
  const selectedFlavor = FLAVORS.find((f) => f.id === selectedFlavorId) || FLAVORS[0];
  const selectedDecor = DECORS.find((d) => d.id === selectedDecorId) || DECORS[0];

  // CMS dan olinadigan haqiqiy Mo‘jiza 777 tortlari galereyasi
  const { content } = useCmsContent();
  const showcaseItems = content.cakeShowcase || DEFAULT_CMS_CONTENT.cakeShowcase;
  
  // Tanlangan shaklga mos fotosuratlar
  const shapePhotos = showcaseItems.filter((item) => item.shapeId === selectedShapeId);
  const activePhotos = shapePhotos.length > 0
    ? shapePhotos
    : [{
        id: `def-${selectedShape.id}`,
        shapeId: selectedShape.id,
        titleUz: selectedShape.name,
        titleRu: selectedShape.name,
        tagUz: selectedShape.badge,
        tagRu: selectedShape.badge,
        imageUrl: selectedShape.imageUrl,
      }];

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Shakl o‘zgarganda birinchi slaydga o‘tkazish
  useEffect(() => {
    setActivePhotoIndex(0);
  }, [selectedShapeId]);

  // Karusel avtomatik tezroq aylanib turishi (3.2 soniyada)
  useEffect(() => {
    if (activePhotos.length <= 1) return;
    const interval = setInterval(() => {
      setActivePhotoIndex((prev) => (prev + 1) % activePhotos.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [activePhotos.length, selectedShapeId]);

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev - 1 + activePhotos.length) % activePhotos.length);
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev + 1) % activePhotos.length);
  };

  const currentPhoto = activePhotos[activePhotoIndex] || activePhotos[0];

  // Rasm yuklash funksiyasi
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert(isRu ? 'Файл не должен превышать 8 МБ' : 'Fayl hajmi 8 MB dan oshmasligi kerak');
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/public/files/cake-reference', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setReferenceImageUrl(data.url);
      } else {
        setReferenceImageUrl(URL.createObjectURL(file));
      }
    } catch {
      setReferenceImageUrl(URL.createObjectURL(file));
    } finally {
      setUploadingImage(false);
    }
  };

  // Arizani topshirish (POST /api/public/cake-orders)
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const cleanPhone = customerPhone.replace(/[^\d+]/g, '');
    if (!customerName.trim()) {
      setSubmitError(isRu ? 'Укажите ваше имя' : 'Iltimos, ismingizni kiriting');
      return;
    }
    if (cleanPhone.length < 13) {
      setSubmitError(isRu ? 'Введите корректный номер телефона (+998...)' : 'Telefon raqamingizni to‘liq kiriting (+998...)');
      return;
    }
    if (orderType === 'DELIVERY' && (!deliveryAddress || deliveryAddress.trim().length < 5)) {
      setSubmitError(isRu ? 'Укажите адрес доставки в Карши' : 'Qarshi shahridagi yetkazib berish manzilini kiriting');
      return;
    }
    if (orderType === 'PICKUP' && !branchId) {
      setSubmitError(isRu ? 'Выберите филиал для самовывоза' : 'Olib ketish uchun filialni tanlang');
      return;
    }

    setIsSubmitting(true);

    // Barcha izohlarni bitta qulay matnga jamlaymiz
    const commentParts: string[] = [];
    commentParts.push(`Shakl: ${selectedShape.name}`);
    commentParts.push(`Ichi (Ta'mi): ${selectedFlavor.name}`);
    if (flavorNote.trim()) commentParts.push(`Ichki izoh: ${flavorNote.trim()}`);
    commentParts.push(`Bezak: ${selectedDecor.name}`);
    if (decorNote.trim()) commentParts.push(`Bezak izohi: ${decorNote.trim()}`);
    const fullComment = commentParts.join(' | ');

    const payload: CakeOrderCreate = {
      customerName: customerName.trim(),
      customerPhone: cleanPhone,
      orderType,
      branchId: orderType === 'PICKUP' ? branchId : undefined,
      deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress.trim() : undefined,
      paymentMethod: 'CASH',
      comment: fullComment,
      scheduledDate,
      cakeTypeId: selectedShape.id,
      weightKg: 2.0, // Standart boshlang'ich vazn (narx xodim bilan kelishiladi)
      optionIds: [selectedFlavor.id, selectedDecor.id],
      inscription: inscription.trim() || undefined,
      referenceImageUrl: referenceImageUrl && referenceImageUrl.startsWith('/uploads/') ? referenceImageUrl : undefined,
    };

    try {
      const idempotencyKey = checkoutIdempotencyKey('mujiza-cake-order-inquiry', payload);
      const createdOrder = await apiClient<Order>('/api/public/cake-orders', {
        method: 'POST',
        body: JSON.stringify(payload),
        lang: locale,
        headers: { 'Idempotency-Key': idempotencyKey },
      });

      if (!createdOrder.trackingToken) throw new Error('Server ariza tokenini qaytarmadi.');
      const token = createdOrder.trackingToken;
      addToken(token, {
        orderNumber: createdOrder.orderNumber,
        totalAmount: 0,
        orderType: createdOrder.orderType,
        status: createdOrder.status,
        items: [{
          name: `${selectedShape.name} — Maxsus tort`,
          price: 0,
          quantity: 1,
          imageUrl: selectedShape.imageUrl,
        }],
      });

      clearCheckoutIdempotencyKey('mujiza-cake-order-inquiry');
      router.push(`/${locale}/order/${token}`);
    } catch (error) {
      setSubmitError((error as { message?: string })?.message || (isRu ? 'Не удалось отправить заявку. Попробуйте снова.' : 'Ariza yuborilmadi. Iltimos, keyinroq qayta urinib ko‘ring.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-3.5 sm:px-8 lg:px-12 pt-4 pb-28 sm:py-12">
      
      {/* Sarlavha (Editorial Luxury Intro) */}
      <ScrollReveal variant="fade-up">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/15 dark:bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#9C7514] dark:text-[#E5C358] text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>{isRu ? 'Mo‘jiza 777 · Индивидуальный заказ' : 'Mo‘jiza 777 · Maxsus buyurtma'}</span>
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-5xl text-[#1C261E] dark:text-[#F5F2EA] tracking-tight">
            {isRu ? 'Создайте торт своей мечты' : 'O‘zingiz istagan maxsus tortni yarating'}
          </h1>
          <p className="text-sm sm:text-base text-[#596B5E] dark:text-[#A6B7AA] leading-relaxed max-w-2xl mx-auto">
            {isRu
              ? 'Выберите форму, начинку и стиль декора. Отправьте заявку — наш мастер свяжется с вами для согласования всех деталей и точной цены!'
              : 'Shakl, ichki ta‘m va bezaklarni tanlang. Arizani yuboring — qandolatchi ustamiz siz bilan bog‘lanib, barcha detallar va narxni kelishib oladi!'}
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Chap ustun (7 ustun): Bosqichma-bosqich tanlov shakli - Mobilda to'liq kenglikda va ixcham */}
        <div className="w-full max-w-2xl mx-auto lg:max-w-none lg:col-span-7 space-y-4 sm:space-y-7">
          
          {/* 1-QADAM: Tort shakli */}
          <div className="bg-white dark:bg-[#1A281E] rounded-2xl sm:rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] p-4 sm:p-7 shadow-sm space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E9E5DD]/60 dark:border-[#28392B]/60">
              <h2 className="text-sm sm:text-lg font-bold text-[#1C261E] dark:text-[#F5F2EA] flex items-center gap-2 sm:gap-2.5">
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#244B2B] text-[#D4AF37] text-[11px] sm:text-xs font-black flex items-center justify-center shadow-sm">
                  1
                </span>
                <span>{isRu ? 'Выберите форму торта' : 'Tort shaklini tanlang'}</span>
              </h2>
              <span className="text-[11px] sm:text-xs text-[#8C9B90] dark:text-[#889B8C]">
                {isRu ? '4 основных вида' : '4 ta asosiy shakl'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3.5 pt-1">
              {SHAPES.map((shape) => {
                const isSelected = selectedShapeId === shape.id;
                const IconComponent = shape.icon;
                return (
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    key={shape.id}
                    type="button"
                    onClick={() => setSelectedShapeId(shape.id)}
                    className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all relative flex flex-col justify-between h-full cursor-pointer ${
                      isSelected
                        ? 'border-[#244B2B] dark:border-[#D4AF37] bg-[#244B2B]/5 dark:bg-[#244B2B]/30 ring-2 ring-[#244B2B] dark:ring-[#D4AF37] shadow-md'
                        : 'border-[#E9E5DD] dark:border-[#28392B] bg-[#FBF9F4]/40 dark:bg-[#141F17] hover:border-[#D4AF37]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-2">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-[#244B2B] text-[#D4AF37]' : 'bg-[#D4AF37]/15 text-[#8A6232] dark:text-[#D4AF37]'}`}>
                          <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#8A6232] dark:text-[#F5E6B3] whitespace-nowrap">
                            {shape.badge}
                          </span>
                          {isSelected && (
                            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#244B2B] text-[#D4AF37] flex items-center justify-center shadow-sm flex-shrink-0">
                              <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-[#1C261E] dark:text-[#F5F2EA] leading-tight block">
                        {shape.name}
                      </span>
                      <p className="text-[10px] sm:text-xs text-[#596B5E] dark:text-[#A6B7AA] leading-snug sm:leading-relaxed line-clamp-2 mt-1">
                        {shape.desc}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* 2-QADAM: Ichi qanaqa bo'lsin? (Ta'm va nachinka) */}
          <div className="bg-white dark:bg-[#1A281E] rounded-2xl sm:rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] p-4 sm:p-7 shadow-sm space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E9E5DD]/60 dark:border-[#28392B]/60">
              <h2 className="text-sm sm:text-lg font-bold text-[#1C261E] dark:text-[#F5F2EA] flex items-center gap-2 sm:gap-2.5">
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#244B2B] text-[#D4AF37] text-[11px] sm:text-xs font-black flex items-center justify-center shadow-sm">
                  2
                </span>
                <span>{isRu ? 'Какой будет начинка внутри?' : 'Ichi qanaqa bo‘lsin? (Ta‘mi va nachinkasi)'}</span>
              </h2>
            </div>

            {/* Tayyor ta'm variantlari - Mobilda 2 tadan */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
              {FLAVORS.map((flavor) => {
                const isSelected = selectedFlavorId === flavor.id;
                return (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    key={flavor.id}
                    type="button"
                    onClick={() => setSelectedFlavorId(flavor.id)}
                    className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left transition-all relative flex flex-col justify-between h-full cursor-pointer ${
                      isSelected
                        ? 'border-[#244B2B] dark:border-[#D4AF37] bg-[#244B2B]/5 dark:bg-[#244B2B]/30 ring-2 ring-[#244B2B] dark:ring-[#D4AF37] shadow-sm'
                        : 'border-[#E9E5DD] dark:border-[#28392B] bg-[#FBF9F4]/40 dark:bg-[#141F17] hover:border-[#D4AF37]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                        <span className="text-lg sm:text-2xl">{flavor.emoji}</span>
                        {isSelected && (
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#244B2B] text-[#D4AF37] flex items-center justify-center shadow-sm">
                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-xs sm:text-sm text-[#1C261E] dark:text-[#F5F2EA] leading-tight">
                        {flavor.name}
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-[#596B5E] dark:text-[#A6B7AA] mt-1 leading-snug line-clamp-2">
                        {flavor.desc}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* O'z xohishingiz bo'lsa izoh yozish joyi */}
            <div className="pt-1.5">
              <label className="block text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] mb-1.5">
                ✍️ {isRu ? 'Особые пожелания по начинке (необязательно)' : 'Ichki qatlam bo‘yicha qo‘shimcha istagingiz (ixtiyoriy)'}
              </label>
              <input
                type="text"
                value={flavorNote}
                onChange={(e) => setFlavorNote(e.target.value)}
                placeholder={isRu ? 'Например: Без орехов (аллергия), меньше сахара, больше бананов...' : 'Masalan: Yong‘oq solinmasin (allergiya bor), kam shakarli, banan ko‘proq bo‘lsin...'}
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-[#E9E5DD] dark:border-[#28392B] text-xs sm:text-sm bg-[#FBF9F4] dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] focus:outline-none focus:border-[#244B2B] dark:focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* 3-QADAM: Ustki bezaklari (Dizayn va ko'rinish) */}
          <div className="bg-white dark:bg-[#1A281E] rounded-2xl sm:rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] p-4 sm:p-7 shadow-sm space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E9E5DD]/60 dark:border-[#28392B]/60">
              <h2 className="text-sm sm:text-lg font-bold text-[#1C261E] dark:text-[#F5F2EA] flex items-center gap-2 sm:gap-2.5">
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#244B2B] text-[#D4AF37] text-[11px] sm:text-xs font-black flex items-center justify-center shadow-sm">
                  3
                </span>
                <span>{isRu ? 'Стиль декора и внешнее оформление' : 'Ustki bezaklari (Dizayn va ko‘rinishi)'}</span>
              </h2>
            </div>

            {/* Bezak variantlari - Mobilda 2 tadan */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
              {DECORS.map((decor) => {
                const isSelected = selectedDecorId === decor.id;
                return (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    key={decor.id}
                    type="button"
                    onClick={() => setSelectedDecorId(decor.id)}
                    className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left transition-all relative flex flex-col justify-between h-full cursor-pointer ${
                      isSelected
                        ? 'border-[#244B2B] dark:border-[#D4AF37] bg-[#244B2B]/5 dark:bg-[#244B2B]/30 ring-2 ring-[#244B2B] dark:ring-[#D4AF37] shadow-sm'
                        : 'border-[#E9E5DD] dark:border-[#28392B] bg-[#FBF9F4]/40 dark:bg-[#141F17] hover:border-[#D4AF37]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                        <span className="text-lg sm:text-2xl">{decor.emoji}</span>
                        {isSelected && (
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#244B2B] text-[#D4AF37] flex items-center justify-center shadow-sm">
                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-xs sm:text-sm text-[#1C261E] dark:text-[#F5F2EA] leading-tight">
                        {decor.name}
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-[#596B5E] dark:text-[#A6B7AA] mt-1 leading-snug line-clamp-2">
                        {decor.desc}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Bezak bo'yicha qo'shimcha izoh */}
            <div className="pt-1.5">
              <label className="block text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] mb-1.5">
                ✍️ {isRu ? 'Пожелания по декору и цветовой гамме' : 'Bezak va ranglar bo‘yicha qo‘shimcha taklifingiz'}
              </label>
              <input
                type="text"
                value={decorNote}
                onChange={(e) => setDecorNote(e.target.value)}
                placeholder={isRu ? 'Например: Золотые тона, нежные розовые оттенки, цифра 25...' : 'Masalan: Zumrad va oltin ranglar, pushti bezaklar, 25 raqami bo‘lsin...'}
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-[#E9E5DD] dark:border-[#28392B] text-xs sm:text-sm bg-[#FBF9F4] dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] focus:outline-none focus:border-[#244B2B] dark:focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* 4-QADAM: Tabrik yozuvi va Namuna rasm yuklash */}
          <div className="bg-white dark:bg-[#1A281E] rounded-2xl sm:rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] p-4 sm:p-7 shadow-sm space-y-5 sm:space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-[#E9E5DD]/60 dark:border-[#28392B]/60">
              <h2 className="text-sm sm:text-lg font-bold text-[#1C261E] dark:text-[#F5F2EA] flex items-center gap-2 sm:gap-2.5">
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#244B2B] text-[#D4AF37] text-[11px] sm:text-xs font-black flex items-center justify-center shadow-sm">
                  4
                </span>
                <span>{isRu ? 'Надпись и фото-образец' : 'Tabrik yozuvi va namuna rasm'}</span>
              </h2>
            </div>

            {/* Yozuv */}
            <div>
              <label className="block text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] mb-1.5 sm:mb-2">
                🎂 {isRu ? 'Надпись на торте (до 100 символов)' : 'Tort ustiga nima deb yozilsin? (100 belgigacha)'}
              </label>
              <input
                type="text"
                maxLength={100}
                value={inscription}
                onChange={(e) => setInscription(e.target.value)}
                placeholder={isRu ? 'Например: С Днем Рождения, Азиза!' : 'Masalan: Tug‘ilgan kuningiz bilan, Onajon!'}
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl border border-[#E9E5DD] dark:border-[#28392B] text-xs sm:text-sm bg-[#FBF9F4] dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] focus:outline-none focus:border-[#244B2B] dark:focus:border-[#D4AF37]"
              />
            </div>

            {/* Namuna rasm (Pinterest / Instagram) */}
            <div>
              <label className="block text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] mb-1.5 sm:mb-2">
                📸 {isRu ? 'Фото-образец желаемого торта (Instagram / Pinterest)' : 'O‘zingiz istagan tort namunasi (Instagram yoki Pinterest’dan rasm)'}
              </label>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {referenceImageUrl ? (
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-lg">
                  <Image src={referenceImageUrl} alt="Namuna rasm" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setReferenceImageUrl(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-all cursor-pointer shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-1.5 left-2 right-2 text-center py-0.5 bg-black/60 rounded-md text-[10px] text-white font-semibold">
                    {isRu ? 'Образец прикреплён' : 'Namuna biriktirildi ✓'}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-5 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-dashed border-[#E9E5DD] dark:border-[#28392B] hover:border-[#D4AF37] dark:hover:border-[#E5C358] bg-[#FBF9F4]/50 dark:bg-[#141F17] flex flex-col items-center justify-center gap-2 sm:gap-2.5 transition-all cursor-pointer text-center group"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin text-[#244B2B] dark:text-[#D4AF37]" />
                  ) : (
                    <>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#D4AF37]/15 flex items-center justify-center text-[#9C7514] dark:text-[#E5C358] group-hover:scale-110 transition-transform">
                        <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-[#1C261E] dark:text-[#F5F2EA] block">
                          {isRu ? 'Нажмите, чтобы прикрепить фото торта' : 'Tort rasmini yuklash uchun bu yerni bosing'}
                        </span>
                        <span className="text-[10px] sm:text-xs text-[#8C9B90] dark:text-[#889B8C] mt-0.5 sm:mt-1 block">
                          {isRu ? '«Сделайте точно так же» — покажите желаемый дизайн' : '«Xuddi shunga o‘xshatib pishirib bering» degan namunangiz'}
                        </span>
                      </div>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* 5-QADAM: Bog'lanish va Yetkazish formasi */}
          <form onSubmit={handleSubmitOrder} className="bg-white dark:bg-[#1A281E] rounded-2xl sm:rounded-3xl border border-[#E9E5DD] dark:border-[#28392B] p-4 sm:p-7 shadow-sm space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-[#E9E5DD]/60 dark:border-[#28392B]/60">
              <h2 className="text-sm sm:text-lg font-bold text-[#1C261E] dark:text-[#F5F2EA] flex items-center gap-2 sm:gap-2.5">
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#244B2B] text-[#D4AF37] text-[11px] sm:text-xs font-black flex items-center justify-center shadow-sm">
                  5
                </span>
                <span>{isRu ? 'Контакты и дата готовности' : 'Bog‘lanish va qabul qilish'}</span>
              </h2>
            </div>

            {submitError && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-300 text-xs sm:text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] mb-1.5">
                  {isRu ? 'Ваше имя *' : 'Ismingiz *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8C9B90] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Masalan: Sardor"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E9E5DD] dark:border-[#28392B] text-xs sm:text-sm bg-[#FBF9F4] dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] focus:outline-none focus:border-[#244B2B] dark:focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] mb-1.5">
                  {isRu ? 'Телефон для связи *' : 'Telefon raqamingiz *'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8C9B90] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+998 (90) 123-45-67"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E9E5DD] dark:border-[#28392B] text-xs sm:text-sm bg-[#FBF9F4] dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] focus:outline-none focus:border-[#244B2B] dark:focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] mb-1.5">
                  {isRu ? 'Дата готовности торта *' : 'Tort qaysi sanaga kerak? *'}
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#8C9B90] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E9E5DD] dark:border-[#28392B] text-xs sm:text-sm bg-[#FBF9F4] dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] focus:outline-none focus:border-[#244B2B] dark:focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] mb-1.5">
                  {isRu ? 'Способ получения' : 'Qabul qilish turi'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType('DELIVERY')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      orderType === 'DELIVERY'
                        ? 'bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] border-[#244B2B] dark:border-[#D4AF37] shadow-sm'
                        : 'bg-[#FBF9F4] dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] border-[#E9E5DD] dark:border-[#28392B]'
                    }`}
                  >
                    {isRu ? 'Доставка' : 'Yetkazib berish'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('PICKUP')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      orderType === 'PICKUP'
                        ? 'bg-[#244B2B] dark:bg-[#D4AF37] text-white dark:text-[#0F1712] border-[#244B2B] dark:border-[#D4AF37] shadow-sm'
                        : 'bg-[#FBF9F4] dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] border-[#E9E5DD] dark:border-[#28392B]'
                    }`}
                  >
                    {isRu ? 'Самовывоз' : 'Olib ketish'}
                  </button>
                </div>
              </div>
            </div>

            {orderType === 'PICKUP' && (
              <div>
                <label className="block text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] mb-1.5">
                  {isRu ? 'Выберите филиал' : 'Filialni tanlang'}
                </label>
                <select
                  required
                  value={branchId || ''}
                  onChange={(e) => setBranchId(Number(e.target.value) || undefined)}
                  className="w-full rounded-xl border border-[#E9E5DD] bg-[#FBF9F4] px-3.5 py-3 text-xs sm:text-sm dark:border-[#28392B] dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA]"
                >
                  <option value="">{isRu ? 'Выберите филиал' : 'Filialni tanlang'}</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nameUz || b.name} — {b.addressUz || b.address}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {orderType === 'DELIVERY' && (
              <div>
                <label className="block text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA] mb-1.5">
                  {isRu ? 'Адрес доставки в Карши *' : 'Qarshi shahridagi yetkazib berish manzili *'}
                </label>
                <textarea
                  rows={2}
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder={isRu ? 'Улица, дом, квартира, ориентир...' : 'Ko‘cha, uy raqami, mo‘ljal...'}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E9E5DD] dark:border-[#28392B] text-xs sm:text-sm bg-[#FBF9F4] dark:bg-[#141F17] text-[#1C261E] dark:text-[#F5F2EA] focus:outline-none focus:border-[#244B2B] dark:focus:border-[#D4AF37]"
                />
              </div>
            )}

            {/* Mobil foydalanuvchilar uchun ixcham tanlov xulosasi (Summary) */}
            <div className="lg:hidden p-3.5 rounded-2xl bg-[#244B2B]/5 dark:bg-[#244B2B]/30 border border-[#D4AF37]/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#1C261E] dark:text-[#F5F2EA]">
                <span className="flex items-center gap-1.5 text-[#9C7514] dark:text-[#E5C358]">
                  <Sparkles className="w-3.5 h-3.5" />
                  {isRu ? 'Ваш выбор' : 'Sizning tanlovingiz'}:
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#8A6232] dark:text-[#F5E6B3]">
                  {isRu ? 'Бесплатная заявка' : 'Ariza bepul'}
                </span>
              </div>
              <div className="text-[11px] space-y-1 text-[#2B3B2F] dark:text-[#D5E2D7]">
                <div className="flex justify-between items-center">
                  <span className="text-[#6D8072] dark:text-[#8C9E90]">{isRu ? 'Форма' : 'Shakl'}:</span>
                  <span className="font-semibold text-right">{selectedShape.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6D8072] dark:text-[#8C9E90]">{isRu ? 'Начинка' : 'Ta‘m'}:</span>
                  <span className="font-semibold text-right truncate max-w-[180px]">{selectedFlavor.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6D8072] dark:text-[#8C9E90]">{isRu ? 'Декор' : 'Bezak'}:</span>
                  <span className="font-semibold text-right truncate max-w-[180px]">{selectedDecor.name}</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-[#E9E5DD]/60 dark:border-[#28392B] font-bold text-[#9C7514] dark:text-[#E5C358]">
                  <span>{isRu ? 'Цена' : 'Narx'}:</span>
                  <span>{isRu ? 'Согласовывается с кондитером' : 'Usta bilan kelishiladi'}</span>
                </div>
              </div>
            </div>

            {/* Shaffof va nufuzli xabarnoma */}
            <div className="p-4 rounded-2xl bg-[#D4AF37]/10 dark:bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#1C261E] dark:text-[#F5F2EA] text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#9C7514] dark:text-[#E5C358]">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>{isRu ? 'Индивидуальное согласование' : 'Individual kelishuv va tasdiq'}</span>
              </div>
              <p className="text-[11px] text-[#596B5E] dark:text-[#C5D2C7] leading-relaxed">
                {isRu
                  ? 'Точная цена рассчитывается кондитером в зависимости от веса и сложности декора. После отправки заявки наш специалист перезвонит вам в течение 15 минут.'
                  : 'Tortning yakuniy narxi og‘irligi va tanlangan dizayn murakkabligiga qarab usta tomonidan belgilanadi. Ariza qoldirganingizdan so‘ng, qandolatchi xodimimiz siz bilan 15 daqiqada bog‘lanib, barcha detallarni tasdiqlaydi.'}
              </p>
            </div>

            {/* Yuborish tugmasi */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#1C261E] font-black text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#1C261E]" />
                  <span>{isRu ? 'Отправка заявки мастеру...' : 'Ariza yuborilmoqda...'}</span>
                </>
              ) : (
                <>
                  <Cake className="w-5 h-5 text-[#1C261E]" />
                  <span>{isRu ? 'Оформить заявку на торт' : '🎂 Maxsus tort arizasini yuborish'}</span>
                </>
              )}
            </motion.button>
          </form>

        </div>

        {/* O'ng ustun (5 ustun): Jonli Real Vitrina (Live Real-Cake Showcase) - Faqat kompyuter/planshetda (Desktop) ko'rinadi, Mobilda yashiriladi */}
        <div className="hidden lg:block lg:col-span-5">
          <div className="sticky top-28 space-y-5">
            
            <div className="bg-gradient-to-b from-[#244B2B] to-[#122416] dark:from-[#1A281E] dark:to-[#0F1712] rounded-3xl p-6 sm:p-7 text-white shadow-2xl relative overflow-hidden border border-[#D4AF37]/40">
              
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-black tracking-wide text-white">MO‘JIZA 777</span>
                    <span className="block text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider">
                      {isRu ? 'Индивидуальный эскиз' : 'Maxsus tayyorlanadigan tort'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-[#1C261E]">
                  Boutique
                </span>
              </div>

              {/* Foydalanuvchi namuna rasm yuklagan bo‘lsa, tepada alohida ko'rsatiladi */}
              {referenceImageUrl && (
                <div className="my-3 p-3 rounded-2xl bg-amber-500/20 border border-[#D4AF37]/60 flex items-center gap-3 shadow-md">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#D4AF37] flex-shrink-0 shadow-md">
                    <Image src={referenceImageUrl} alt="Mijoz namunasi" fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-amber-200 block truncate">
                      📸 {isRu ? 'Ваш прикреплённый образец' : 'Siz biriktirgan namuna'}
                    </span>
                    <span className="text-[10px] text-[#DDE8DF] block">
                      {isRu ? 'Мастер приготовит торт на основе этого фото' : 'Ustamiz ushbu namunaga asoslanib tayyorlaydi'}
                    </span>
                  </div>
                </div>
              )}

              {/* Haqiqiy Mo‘jiza 777 tort fotosuratlari Karuseli */}
              <div className="relative w-full h-64 sm:h-72 my-4 rounded-2xl overflow-hidden border border-white/20 shadow-xl group">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${selectedShapeId}-${currentPhoto.id}`}
                    initial={{ opacity: 0.3, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0.3 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={currentPhoto.imageUrl}
                      alt={isRu ? currentPhoto.titleRu : currentPhoto.titleUz}
                      fill
                      sizes="(max-width: 768px) 100vw, 450px"
                      className="object-cover"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
                
                {/* Qorong'i parda va tabrik lentasi */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                {/* Ustidagi tabrik yozuvi (Topper / Lenta) */}
                {inscription && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-3 left-3 right-3 text-center z-10"
                  >
                    <div className="inline-block px-3.5 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-[#D4AF37]/80 text-[#F5E6B3] text-xs font-serif font-bold italic shadow-lg">
                      «{inscription}»
                    </div>
                  </motion.div>
                )}

                {/* Karusel navigatsiya o'qlari (Chap va O'ng) */}
                {activePhotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevPhoto}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm border border-white/30 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
                      aria-label="Oldingi rasm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextPhoto}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm border border-white/30 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
                      aria-label="Keyingi rasm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Pastdagi rasm ma'lumotlari va slayder nuqtalari */}
                <div className="absolute bottom-2.5 left-3 right-3 z-10 flex items-end justify-between text-white">
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-extrabold block text-white drop-shadow-md truncate">
                      {isRu ? currentPhoto.titleRu : currentPhoto.titleUz}
                    </span>
                    <span className="text-[10px] text-[#D4AF37] font-semibold block">
                      {isRu ? currentPhoto.tagRu : currentPhoto.tagUz} · Mo‘jiza 777 asari
                    </span>
                  </div>

                  {/* Slayd nuqtalari */}
                  {activePhotos.length > 1 && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {activePhotos.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setActivePhotoIndex(idx); }}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            activePhotoIndex === idx ? 'w-5 bg-[#D4AF37]' : 'w-1.5 bg-white/40'
                          }`}
                          aria-label={`Rasm ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tanlovlar xulosasi */}
              <div className="space-y-2.5 text-xs border-t border-white/10 pt-4">
                <div className="flex items-center justify-between text-[#DDE8DF]">
                  <span>{isRu ? 'Форма:' : 'Tort shakli:'}</span>
                  <span className="font-bold text-white">{selectedShape.name}</span>
                </div>
                <div className="flex items-center justify-between text-[#DDE8DF]">
                  <span>{isRu ? 'Начинка внутри:' : 'Ichki ta‘mi:'}</span>
                  <span className="font-bold text-[#F5E6B3]">{selectedFlavor.name}</span>
                </div>
                <div className="flex items-center justify-between text-[#DDE8DF]">
                  <span>{isRu ? 'Стиль декора:' : 'Ustki bezagi:'}</span>
                  <span className="font-bold text-[#F5E6B3]">{selectedDecor.name}</span>
                </div>
                {referenceImageUrl && (
                  <div className="flex items-center justify-between text-[#DDE8DF]">
                    <span>{isRu ? 'Образец дизайна:' : 'Namuna rasm:'}</span>
                    <span className="font-bold text-emerald-300">Biriktirilgan ✓</span>
                  </div>
                )}
              </div>

              {/* Narx qatori: PUL ARALASHTIRILMAYDI! */}
              <div className="mt-5 pt-4 border-t border-white/15 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#DDE8DF]/80 block">
                    {isRu ? 'Стоимость заказа:' : 'Buyurtma narxi:'}
                  </span>
                  <span className="text-base sm:text-lg font-black text-[#D4AF37]">
                    {isRu ? 'Индивидуально' : 'Usta bilan kelishiladi'}
                  </span>
                </div>
                <span className="text-[10px] text-[#F5E6B3] bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-3 py-1.5 rounded-full font-bold">
                  {isRu ? 'Бесплатная заявка' : 'Ariza topshirish bepul'}
                </span>
              </div>

            </div>

            {/* Ishonch va jarayon bloki */}
            <div className="bg-[#FBF9F4] dark:bg-[#1A281E] rounded-2xl p-4 border border-[#E9E5DD] dark:border-[#28392B] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-xs text-[#596B5E] dark:text-[#A6B7AA]">
                <span className="font-bold text-[#1C261E] dark:text-[#F5F2EA] block">
                  {isRu ? 'Быстрый обратный звонок' : 'Tezkor qayta qo‘ng‘iroq'}
                </span>
                {isRu ? 'После отправки заявки вам позвонят для уточнения всех деталей.' : 'Arizangiz tushishi bilan xodimimiz sizga telefon qilib, hamma narsani aniqlashtiradi.'}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default CakeBuilderView;
