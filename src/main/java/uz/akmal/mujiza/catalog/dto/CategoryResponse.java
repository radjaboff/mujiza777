package uz.akmal.mujiza.catalog.dto;

import java.time.LocalDateTime;

/**
 * Admin panelga qaytariladigan kategoriya ma'lumoti.
 * Ikkala tildagi nom ham bor, chunki admin ikkalasini ko'rishi va tahrirlashi kerak.
 *
 * @param id        kategoriyaning noyob raqami
 * @param nameUz    nomi o'zbek tilida
 * @param nameRu    nomi rus tilida
 * @param slug      URL uchun qisqa nom
 * @param imageUrl  rasm manzili (rasm bo'lmasa null)
 * @param sortOrder saytda ko'rsatish tartibi
 * @param isActive  mijozlarga ko'rinadimi
 * @param createdAt yaratilgan vaqt
 * @param updatedAt oxirgi o'zgartirilgan vaqt
 */
public record CategoryResponse(
        Long id,
        String nameUz,
        String nameRu,
        String slug,
        String imageUrl,
        Integer sortOrder,
        Boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}