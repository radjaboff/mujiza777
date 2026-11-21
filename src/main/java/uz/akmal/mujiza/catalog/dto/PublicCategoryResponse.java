package uz.akmal.mujiza.catalog.dto;

/**
 * Mijoz saytiga qaytariladigan kategoriya ma'lumoti.
 * Faqat kerakli narsalar bor: mijozga ichki maydonlar (tartib raqami, vaqtlar, faollik) ko'rinmaydi.
 * Nom bitta, so'ralgan tilda (uz yoki ru) qaytadi.
 *
 * @param id       kategoriyaning noyob raqami
 * @param name     kategoriya nomi so'ralgan tilda
 * @param slug     URL uchun qisqa nom (sayt manzilida ishlatiladi)
 * @param imageUrl rasm manzili (rasm bo'lmasa null)
 */
public record PublicCategoryResponse(
        Long id,
        String name,
        String slug,
        String imageUrl
) {
}