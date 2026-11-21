/**
 * Savat va buyurtma summasini xavfsiz va aniq hisoblash (TZ 7.1 bo'yicha).
 * Float xatolaridan saqlanish uchun hisob-kitoblar ehtiyotkorlik bilan qilinadi.
 * Server ham aynan shunday hisoblaydi (Math.round / HALF_UP yaxlitlash).
 */

export interface PricingItem {
  productId: number;
  price: number; // 1 dona yoki 1 kg narxi
  quantity: number; // kasr son (1.5 kg) yoki butun son (2 dona)
}

/**
 * Xavfsiz narx va buyurtma chegaralari (arifmetik overflow'dan himoya)
 */
export const MAX_SAFE_PRICE = 1_000_000_000; // 1 milliard so'm
export const MAX_SAFE_ORDER_TOTAL = 500_000_000; // 500 million so'm

/**
 * Bitta mahsulot qatorining summasi: narx * miqdor (butun so'mga yaxlitlanadi)
 */
export function calculateLineTotal(price: number, quantity: number): number {
  if (!price || !quantity || price <= 0 || quantity <= 0) {
    return 0;
  }
  // Float xatolarini bartaraf etish uchun 1000 ga ko'paytirib hisoblash
  const exactPriceInCents = Math.round(price);
  const exactQuantityInMilli = Math.round(quantity * 1000);
  const totalRaw = (exactPriceInCents * exactQuantityInMilli) / 1000;
  return Math.round(totalRaw);
}

/**
 * Butun savatdagi mahsulotlarning jami summasi (haqiqiy aniq summa)
 */
export function calculateItemsTotal(items: PricingItem[]): number {
  return items.reduce((acc, item) => {
    return acc + calculateLineTotal(item.price, item.quantity);
  }, 0);
}

/**
 * Buyurtma summasi maksimal ruxsat etilgan biznes chegarasidan oshganligini tekshiradi
 */
export function isOrderTotalExceeded(itemsTotal: number): boolean {
  return itemsTotal > MAX_SAFE_ORDER_TOTAL;
}

/**
 * Yetkazib berish narxini hisoblaydi:
 * Agar jami summa freeDeliveryFrom ga yetsa -> 0 so'm, aks holda deliveryFee
 */
export function calculateDeliveryFee(
  itemsTotal: number,
  deliveryFee: number,
  freeDeliveryFrom: number | null | undefined,
  orderType: 'PICKUP' | 'DELIVERY'
): number {
  if (orderType === 'PICKUP') {
    return 0;
  }

  if (freeDeliveryFrom && freeDeliveryFrom > 0 && itemsTotal >= freeDeliveryFrom) {
    return 0;
  }

  return Math.max(0, deliveryFee || 0);
}

/**
 * Buyurtmaning umumiy yakuniy summasi (taxminiy, mijoz ko'rinishi uchun)
 */
export function calculateOrderSummary(
  items: PricingItem[],
  settings: {
    deliveryFee: number;
    freeDeliveryFrom?: number | null;
    minOrderAmount: number;
  },
  orderType: 'PICKUP' | 'DELIVERY'
) {
  const itemsTotal = calculateItemsTotal(items);
  const deliveryFee = calculateDeliveryFee(
    itemsTotal,
    settings.deliveryFee,
    settings.freeDeliveryFrom,
    orderType
  );
  const finalTotal = itemsTotal + deliveryFee;

  // Bepul yetkazishgacha qancha qolgani
  const freeDeliveryRemaining =
    settings.freeDeliveryFrom && settings.freeDeliveryFrom > 0 && settings.freeDeliveryFrom > itemsTotal
      ? settings.freeDeliveryFrom - itemsTotal
      : 0;

  // Minimal buyurtma summasi tekshiruvi
  const isMinOrderMet = settings.minOrderAmount <= 0 || itemsTotal >= settings.minOrderAmount;
  const minOrderRemaining =
    settings.minOrderAmount > 0 && itemsTotal < settings.minOrderAmount
      ? settings.minOrderAmount - itemsTotal
      : 0;

  return {
    itemsTotal,
    deliveryFee,
    finalTotal,
    freeDeliveryRemaining,
    isMinOrderMet,
    minOrderRemaining,
  };
}
