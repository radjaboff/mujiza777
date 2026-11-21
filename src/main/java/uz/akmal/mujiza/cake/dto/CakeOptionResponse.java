package uz.akmal.mujiza.cake.dto;

import uz.akmal.mujiza.cake.enums.CakeOptionKind;
import uz.akmal.mujiza.cake.enums.CakePriceType;

import java.time.LocalDateTime;

/**
 * Admin panelga qaytariladigan tort varianti ma'lumoti (ikkala til bilan).
 *
 * @param id         variantning raqami
 * @param kind       guruhi
 * @param nameUz     nomi o'zbek tilida
 * @param nameRu     nomi rus tilida
 * @param imageUrl   rasm manzili
 * @param priceType  narx turi
 * @param priceValue qo'shimcha narx
 * @param sortOrder  ko'rsatish tartibi
 * @param isActive   mijozlarga ko'rinadimi
 * @param createdAt  yaratilgan vaqt
 * @param updatedAt  oxirgi o'zgartirilgan vaqt
 */
public record CakeOptionResponse(
        Long id,
        CakeOptionKind kind,
        String nameUz,
        String nameRu,
        String imageUrl,
        CakePriceType priceType,
        Long priceValue,
        Integer sortOrder,
        Boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}