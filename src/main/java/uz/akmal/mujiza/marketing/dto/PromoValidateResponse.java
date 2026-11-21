package uz.akmal.mujiza.marketing.dto;

/**
 * Promo kod tekshiruvining natijasi (mijoz uchun).
 *
 * @param valid          kod hozir ishlatib bo'ladimi
 * @param code           kod KATTA harflarda (ko'rsatish uchun)
 * @param discountAmount shu summada bo'ladigan chegirma, so'mda (yaroqsiz bo'lsa 0)
 * @param message        yaroqsiz bo'lsa sababi (yaroqli bo'lsa null)
 */
public record PromoValidateResponse(
        boolean valid,
        String code,
        long discountAmount,
        String message
) {
}