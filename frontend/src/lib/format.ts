/**
 * Ma'lumotlarni formatlash uchun yordamchi funksiyalar (TZ 3.6 bo'yicha)
 */

/**
 * Pul summasini formatlaydi: 360 000 so'm / 360 000 сум
 * Ming ajratgich: oddiy probel. Kasr yo'q.
 */
export function formatCurrency(amount: number | null | undefined, locale: 'uz' | 'ru' = 'uz'): string {
  if (amount == null || isNaN(amount)) {
    return `0 ${locale === 'ru' ? 'сум' : "so'm"}`;
  }

  const rounded = Math.round(amount);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} ${locale === 'ru' ? 'сум' : "so'm"}`;
}

/**
 * Miqdorni formatlaydi: oxiridagi ortiqcha nollarni olib tashlaydi.
 * Masalan: 1.500 -> "1.5 kg", 2.0 -> "2 dona"
 */
export function formatQuantity(
  quantity: number | null | undefined,
  unitType: 'PIECE' | 'KG' = 'PIECE',
  locale: 'uz' | 'ru' = 'uz'
): string {
  if (quantity == null || isNaN(quantity)) {
    return `0 ${unitType === 'KG' ? (locale === 'ru' ? 'кг' : 'kg') : (locale === 'ru' ? 'шт' : 'dona')}`;
  }

  // Float nollarni olib tashlash (1.500 -> 1.5, 2.000 -> 2)
  const cleanNumber = Number(Number(quantity).toFixed(3));
  const unitLabel =
    unitType === 'KG' ? (locale === 'ru' ? 'кг' : 'kg') : (locale === 'ru' ? 'шт' : 'dona');

  return `${cleanNumber} ${unitLabel}`;
}

/**
 * Tayyorlanish vaqtini chiroyli matnga aylantiradi:
 * 0 -> "Hozir tayyor" / "Готово сейчас"
 * 120 -> "2 soat" / "2 часа"
 */
export function formatPrepTime(minutes: number | null | undefined, locale: 'uz' | 'ru' = 'uz'): string {
  if (!minutes || minutes <= 0) {
    return locale === 'ru' ? 'Готово сейчас' : 'Hozir tayyor';
  }

  if (minutes < 60) {
    return locale === 'ru' ? `${minutes} мин` : `${minutes} daqiqa`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return locale === 'ru' ? `${hours} ч` : `${hours} soat`;
  }

  return locale === 'ru'
    ? `${hours} ч ${remainingMinutes} мин`
    : `${hours} soat ${remainingMinutes} daqiqa`;
}

/**
 * Saqlash muddatini (soat) kun/soatga aylantiradi
 */
export function formatShelfLife(hours: number | null | undefined, locale: 'uz' | 'ru' = 'uz'): string {
  if (!hours || hours <= 0) return '';

  if (hours < 24) {
    return locale === 'ru' ? `${hours} часов` : `${hours} soat`;
  }

  const days = Math.floor(hours / 24);
  const remHours = hours % 24;

  if (remHours === 0) {
    return locale === 'ru' ? `${days} дня(-ей)` : `${days} kun`;
  }

  return locale === 'ru'
    ? `${days} д ${remHours} ч`
    : `${days} kun ${remHours} soat`;
}

/**
 * Toshkent vaqtini (UTC+5) qisqa formatda ko'rsatish
 */
export function formatTashkentTime(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}
