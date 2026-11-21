/**
 * Mujiza 777 - Backend API tiplari (TZ v2 bo'yicha to'liq)
 */

export type UnitType = 'PIECE' | 'KG';

export type OrderStatus =
  | 'NEW'
  | 'PRICE_PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERING'
  | 'COMPLETED'
  | 'CANCELLED';

export type OrderType = 'PICKUP' | 'DELIVERY';

export type PaymentMethod = 'CASH' | 'CARD';

export type Allergen =
  | 'NUTS'
  | 'PEANUTS'
  | 'MILK'
  | 'GLUTEN'
  | 'EGG'
  | 'SOY'
  | 'SESAME';

export type DietTag =
  | 'HALAL'
  | 'SUGAR_FREE'
  | 'GLUTEN_FREE'
  | 'LACTOSE_FREE'
  | 'VEGAN';

export type SeasonTheme = 'DEFAULT' | 'NAVRUZ' | 'HAYIT' | 'MARCH_8' | 'NEW_YEAR';

export interface Category {
  id: number;
  name: string;
  nameUz?: string;
  nameRu?: string;
  slug: string;
  imageUrl: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ProductCard {
  id: number;
  name: string;
  nameUz?: string;
  nameRu?: string;
  slug: string;
  categorySlug: string;
  price: number; // HOZIR amal qiladigan narx: 1 dona yoki 1 kg uchun
  oldPrice: number | null; // Chegirmada bo'lsa chizilgan eski narx
  discountEndsAt: string | null; // Taymer uchun ISO vaqt
  weightLabel: string | null; // masalan '1 kg', '6 dona'
  imageUrl: string | null;
  prepTimeMinutes: number; // 0 = hozir tayyor
  isAvailable: boolean;
  isPopular: boolean;
  isNew: boolean;
  allergens: Allergen[];
  dietTags: DietTag[];
  unitType: UnitType;
  minQuantity: number;
  quantityStep: number;
}

export interface ProductDetail extends Omit<ProductCard, 'categorySlug'> {
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  description: string | null;
  descriptionUz?: string | null;
  descriptionRu?: string | null;
  ingredients: string | null;
  ingredientsUz?: string | null;
  ingredientsRu?: string | null;
  imageUrls: string[]; // galereya
  calories: number | null;
  shelfLifeHours: number | null;
}

export interface Branch {
  id: number;
  name: string;
  nameUz?: string;
  nameRu?: string;
  address: string;
  addressUz?: string;
  addressRu?: string;
  phone: string;
  workHours: string | null;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
  images?: string[];
  isPickupAvailable: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface PublicSettings {
  phone: string;
  openTime: string; // 'HH:mm:ss'
  closeTime: string;
  isOpenNow: boolean; // do'kon hozir ochiqmi (server hisoblaydi)
  acceptingOrders: boolean; // false: buyurtma vaqtincha yopiq
  deliveryEnabled: boolean; // false: faqat olib ketish
  deliveryFee: number;
  freeDeliveryFrom: number | null;
  minOrderAmount: number; // 0 = cheklov yo'q
  cakeMinAdvanceHours: number;
  telegramUrl: string | null;
  instagramUrl: string | null;
  seasonTheme?: SeasonTheme;
}

export interface Vacancy {
  id: number;
  title: string;
  titleRu?: string;
  type: string; // masalan: "To‘liq stavka", "Smenali grafik"
  typeRu?: string;
  location: string; // masalan: "Markaziy filial", "Nasaf filiali", "Qarshi shahri"
  locationRu?: string;
  salary: string | null; // masalan: "4 000 000 – 7 000 000 so‘m"
  description: string;
  descriptionRu?: string;
  requirements?: string[];
  contactPhone: string;
  telegramUsername: string; // masalan: "mojiza777_admin"
  isActive: boolean;
  createdAt?: string;
}

export interface Promotion {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  imageUrl: string | null;
  mobileImageUrl: string | null;
  linkUrl: string | null;
  activeTo: string | null;
  badge?: string;
  promoCode?: string;
  category?: 'DISCOUNT' | 'GIFT' | 'DELIVERY' | 'COMBO';
}

/* =========================================================================
 * TZ v2: Vaqt oynalari (Delivery slots) va Promokod
 * ========================================================================= */

export interface DeliverySlot {
  id: number;
  startTime: string; // 'HH:mm:ss'
  endTime: string;
  available: boolean;
  remaining: number;
  unavailableReason: 'FULL' | 'TOO_SOON' | null;
}

export interface PromoValidateResult {
  valid: boolean;
  code: string;
  discountAmount: number;
  message: string | null;
}

/* =========================================================================
 * TZ v2: Tort Konstruktori tiplari
 * ========================================================================= */

export type CakeOptionKind = 'FLAVOR' | 'CREAM' | 'DECOR' | 'EXTRA';

export interface CakeTypeItem {
  id: number;
  name: string;
  imageUrl: string | null;
  basePricePerKg: number;
  minWeightKg: number;
  maxWeightKg: number;
  weightStep: number;
  servingsPerKg: number | null;
}

export interface CakeOptionItem {
  id: number;
  name: string;
  imageUrl: string | null;
  priceType: 'PER_KG' | 'FIXED';
  priceValue: number;
}

export interface CakeOptionGroup {
  kind: CakeOptionKind;
  required: boolean;
  maxChoices: number;
  options: CakeOptionItem[];
}

export interface CakeConfig {
  cakeMinAdvanceHours: number;
  types: CakeTypeItem[];
  groups: CakeOptionGroup[];
}

export interface CakePriceLine {
  label: string;
  amount: number;
}

export interface CakePrice {
  weightKg: number;
  servings: number | null;
  total: number;
  lines: CakePriceLine[];
}

export interface CakeDetails {
  typeName: string;
  weightKg: number;
  options: { kind: CakeOptionKind; name: string; amount: number }[];
  inscription: string | null;
  referenceImageUrl: string | null;
  calculatedPrice: number;
  finalPrice: number | null;
  priceConfirmed: boolean;
  priceNote: string | null;
}

export interface CakeOrderCreate {
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  branchId?: number;
  deliveryAddress?: string;
  latitude?: number;
  longitude?: number;
  paymentMethod: PaymentMethod;
  comment?: string;
  scheduledDate: string; // majburiy (YYYY-MM-DD)
  slotId?: number;
  cakeTypeId: number;
  weightKg: number;
  optionIds?: number[];
  inscription?: string; // <= 100 belgi
  referenceImageUrl?: string;
}

/* =========================================================================
 * TZ v2: Keytering so'rovlari (Catering requests)
 * ========================================================================= */

export interface CateringRequestCreate {
  name: string;
  phone: string;
  eventType: string; // 'To\'y' | 'Tug\'ilgan kun' | 'Korporativ' | 'Boshqa'
  eventDate: string; // YYYY-MM-DD
  guestCount: number; // 1-5000
  budget?: number;
  comment?: string;
}

export interface CateringRequestItem extends CateringRequestCreate {
  id: number;
  status: 'NEW' | 'CONTACTED' | 'DONE' | 'REJECTED';
  adminNote?: string | null;
  createdAt: string;
}

/* =========================================================================
 * Buyurtma va qatorlar (v2 qo'shimchalari bilan)
 * ========================================================================= */

export interface OrderItemRequest {
  productId: number;
  quantity: number; // kasr (1.5) yoki butun (2)
}

export interface OrderCreate {
  customerName: string;
  customerPhone: string; // +998901234567
  orderType: OrderType;
  branchId?: number;
  deliveryAddress?: string;
  latitude?: number;
  longitude?: number;
  paymentMethod: PaymentMethod;
  comment?: string;
  items: OrderItemRequest[]; // NARX YUBORILMAYDI (faqat server hisoblaydi)

  // TZ v2 qo'shimchalari:
  promoCode?: string;
  scheduledDate?: string;
  slotId?: number;
  isGift?: boolean;
  isAnonymousGift?: boolean;
  recipientName?: string;
  recipientPhone?: string;
  giftMessage?: string;
}

export interface OrderItemResponse {
  productId: number;
  name: string;
  quantity: number;
  unitType: UnitType;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderTimelineEntry {
  status: OrderStatus;
  at: string;
}

export interface Order {
  /** Database id is present on admin order endpoints; public tracking responses may omit it. */
  id?: number;
  orderNumber: string; // 'MJ-1001'
  trackingToken: string;
  status: OrderStatus;
  orderType: OrderType;
  customerName: string;
  customerPhone?: string;
  branchName: string | null;
  branchAddress: string | null;
  deliveryAddress: string | null;
  paymentMethod: PaymentMethod;
  comment: string | null;
  items: OrderItemResponse[];
  itemsTotal: number;
  deliveryFee: number;
  totalAmount: number;
  pickupCode: string | null; // 4 xonali kod
  estimatedReadyAt: string | null;
  cancelReason: string | null;
  timeline: OrderTimelineEntry[];
  createdAt: string;

  // TZ v2 qo'shimchalari:
  promoCode?: string | null;
  discountAmount?: number;
  scheduledDate?: string | null;
  slotStart?: string | null;
  slotEnd?: string | null;
  isGift?: boolean;
  isAnonymousGift?: boolean;
  recipientName?: string | null;
  recipientPhone?: string | null;
  giftMessage?: string | null;
  cake?: CakeDetails | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors: Record<string, string> | null;
}

/* =========================================================================
 * Admin Panel & Statistika (TZ 17.8 bo'yicha)
 * ========================================================================= */

export interface AdminUser {
  id?: number;
  username: string;
  fullName: string;
  role: 'ADMIN' | 'STAFF' | 'COURIER';
  isActive?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
}

export interface AnalyticsSummary {
  from: string;
  to: string;
  days: number;
  ordersTotal: number;
  completed: number;
  cancelled: number;
  active: number;
  revenue: number;
  inProgressAmount: number;
  averageOrderValue: number;
  pickupOrders: number;
  deliveryOrders: number;
  cakeOrders: number;
  giftOrders: number;
  discountTotal: number;
  previous: {
    ordersTotal: number;
    revenue: number;
    ordersChangePercent: number | null;
    revenueChangePercent: number | null;
  };
}

export interface DailyPoint {
  date: string;
  orders: number;
  revenue: number;
}

export interface HourPoint {
  hour: number;
  orders: number;
}

export interface TopProduct {
  productId: number;
  name: string;
  unitType: UnitType;
  quantity: number;
  revenue: number;
}

export interface AuditEntry {
  id: number;
  actor: string;
  action: string;
  entityType: string;
  entityId: number | null;
  details: string | null;
  createdAt: string;
}

export interface AdminOrderListItem extends Order {
  id: number;
  customerPhone: string;
}

export interface AdminProductCreate {
  nameUz: string;
  nameRu: string;
  slug: string;
  categoryId: number;
  descriptionUz?: string;
  descriptionRu?: string;
  price: number;
  oldPrice?: number | null;
  discountEndsAt?: string | null;
  weightLabel?: string | null;
  unitType: UnitType;
  minQuantity: number;
  quantityStep: number;
  prepTimeMinutes?: number | null;
  shelfLifeHours?: number | null;
  calories?: number | null;
  ingredientsUz?: string;
  ingredientsRu?: string;
  allergens?: Allergen[];
  dietTags?: DietTag[];
  isAvailable: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  sortOrder?: number;
  imageUrl?: string | null;
  imageUrls: string[];
}
