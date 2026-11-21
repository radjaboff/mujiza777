package uz.akmal.mujiza.cake.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Admin panelga qaytariladigan tort turi ma'lumoti (ikkala til bilan).
 *
 * @param id             turning raqami
 * @param nameUz         nomi o'zbek tilida
 * @param nameRu         nomi rus tilida
 * @param imageUrl       rasm manzili
 * @param basePricePerKg 1 kg uchun asosiy narx
 * @param minWeightKg    eng kam vazn
 * @param maxWeightKg    eng ko'p vazn
 * @param weightStep     vazn qadami
 * @param servingsPerKg  1 kg dan taxminiy porsiya soni
 * @param sortOrder      ko'rsatish tartibi
 * @param isActive       mijozlarga ko'rinadimi
 * @param createdAt      yaratilgan vaqt
 * @param updatedAt      oxirgi o'zgartirilgan vaqt
 */
public record CakeTypeResponse(
        Long id,
        String nameUz,
        String nameRu,
        String imageUrl,
        Long basePricePerKg,
        BigDecimal minWeightKg,
        BigDecimal maxWeightKg,
        BigDecimal weightStep,
        Integer servingsPerKg,
        Integer sortOrder,
        Boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}