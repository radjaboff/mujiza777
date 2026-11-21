package uz.akmal.mujiza.shop.dto;

import java.time.LocalDateTime;

/**
 * Admin panelga qaytariladigan filialning to'liq ma'lumoti (ikkala til bilan).
 *
 * @param id                filialning noyob raqami
 * @param nameUz            nomi o'zbek tilida
 * @param nameRu            nomi rus tilida
 * @param addressUz         manzil o'zbek tilida
 * @param addressRu         manzil rus tilida
 * @param phone             telefon raqami
 * @param workHours         ish vaqti
 * @param latitude          xaritadagi kenglik
 * @param longitude         xaritadagi uzunlik
 * @param imageUrl          rasm manzili
 * @param isPickupAvailable olib ketish mumkinmi
 * @param isActive          mijozlarga ko'rinadimi
 * @param sortOrder         ko'rsatish tartibi
 * @param createdAt         yaratilgan vaqt
 * @param updatedAt         oxirgi o'zgartirilgan vaqt
 */
public record BranchResponse(
        Long id,
        String nameUz,
        String nameRu,
        String addressUz,
        String addressRu,
        String phone,
        String workHours,
        Double latitude,
        Double longitude,
        String imageUrl,
        Boolean isPickupAvailable,
        Boolean isActive,
        Integer sortOrder,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}