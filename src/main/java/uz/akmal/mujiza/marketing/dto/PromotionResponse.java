package uz.akmal.mujiza.marketing.dto;

import java.time.LocalDateTime;

/**
 * Admin panelga qaytariladigan aksiyaning to'liq ma'lumoti (ikkala til bilan).
 *
 * @param id             aksiyaning noyob raqami
 * @param titleUz        sarlavha o'zbek tilida
 * @param titleRu        sarlavha rus tilida
 * @param slug           URL uchun qisqa nom
 * @param summaryUz      qisqa tavsif o'zbek tilida
 * @param summaryRu      qisqa tavsif rus tilida
 * @param descriptionUz  to'liq matn o'zbek tilida
 * @param descriptionRu  to'liq matn rus tilida
 * @param imageUrl       kompyuter uchun rasm
 * @param mobileImageUrl telefon uchun rasm
 * @param linkUrl        bosilganda olib boradigan manzil
 * @param showOnHome     bosh sahifada ko'rsatiladimi
 * @param activeFrom     ko'rinish boshlanadigan vaqt
 * @param activeTo       ko'rinish tugaydigan vaqt
 * @param sortOrder      ko'rsatish tartibi
 * @param isActive       qo'lda yoqilganmi
 * @param visibleNow     HOZIR mijozlarga ko'rinyaptimi (yoqilgan va vaqt oralig'ida)
 * @param createdAt      yaratilgan vaqt
 * @param updatedAt      oxirgi o'zgartirilgan vaqt
 */
public record PromotionResponse(
        Long id,
        String titleUz,
        String titleRu,
        String slug,
        String summaryUz,
        String summaryRu,
        String descriptionUz,
        String descriptionRu,
        String imageUrl,
        String mobileImageUrl,
        String linkUrl,
        Boolean showOnHome,
        LocalDateTime activeFrom,
        LocalDateTime activeTo,
        Integer sortOrder,
        Boolean isActive,
        Boolean visibleNow,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}