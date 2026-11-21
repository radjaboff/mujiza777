package uz.akmal.mujiza.marketing.dto;

import uz.akmal.mujiza.marketing.enums.DiscountType;

import java.time.LocalDateTime;

/**
 * Admin panelga qaytariladigan promo kod ma'lumoti.
 *
 * @param id                kodning noyob raqami
 * @param code              kod matni
 * @param description       admin uchun izoh
 * @param discountType      chegirma turi
 * @param discountValue     chegirma qiymati (foiz yoki so'm)
 * @param maxDiscountAmount foizli kod uchun eng ko'p chegirma summasi
 * @param minOrderAmount    minimal buyurtma summasi
 * @param maxUses           eng ko'p foydalanish soni (cheksiz bo'lsa null)
 * @param usedCount         hozirgacha necha marta ishlatilgani
 * @param firstOrderOnly    faqat birinchi buyurtma uchunmi
 * @param validFrom         amal qilish boshlanishi
 * @param validTo           amal qilish tugashi
 * @param isActive          qo'lda yoqilganmi
 * @param usableNow         HOZIR ishlatib bo'ladimi (yoqilgan, muddati ichida, limit tugamagan)
 * @param createdAt         yaratilgan vaqt
 * @param updatedAt         oxirgi o'zgartirilgan vaqt
 */
public record PromoCodeResponse(
        Long id,
        String code,
        String description,
        DiscountType discountType,
        Long discountValue,
        Long maxDiscountAmount,
        Long minOrderAmount,
        Integer maxUses,
        Integer usedCount,
        Boolean firstOrderOnly,
        LocalDateTime validFrom,
        LocalDateTime validTo,
        Boolean isActive,
        Boolean usableNow,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}