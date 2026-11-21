package uz.akmal.mujiza.marketing.dto;

/**
 * Promo kod buyurtmaga qo'llanganining natijasi (faqat ichki ishlatiladi, mijozga to'g'ridan-to'g'ri qaytmaydi).
 *
 * @param code           kod KATTA harflarda (buyurtmada saqlanadi)
 * @param discountAmount hisoblangan chegirma summasi, so'mda
 */
public record PromoApplication(
        String code,
        long discountAmount
) {
}