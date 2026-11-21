package uz.akmal.mujiza.catalog.dto;

import uz.akmal.mujiza.catalog.enums.Allergen;
import uz.akmal.mujiza.catalog.enums.DietTag;
import uz.akmal.mujiza.catalog.enums.UnitType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * Mijoz saytidagi katalogda (ro'yxatda) ko'rinadigan mahsulot kartochkasi.
 * Faqat kartochka uchun kerakli ma'lumot bor, tavsif va galereya mahsulot sahifasida keladi.
 * Nom so'ralgan tilda (uz yoki ru) qaytadi.
 *
 * @param id              mahsulotning noyob raqami
 * @param name            nomi so'ralgan tilda
 * @param slug            URL uchun qisqa nom
 * @param categorySlug    kategoriyaning slug'i
 * @param price           HOZIR amal qiladigan narx (chegirma tugagan bo'lsa, odatiy narx)
 * @param oldPrice        chizilgan eski narx; chegirma amal qilmayotgan bo'lsa null
 * @param discountEndsAt  chegirma tugash vaqti (taymer uchun); chegirma bo'lmasa null
 * @param weightLabel     vazn yoki o'lcham yozuvi
 * @param imageUrl        asosiy rasm manzili
 * @param prepTimeMinutes tayyorlanish vaqti (0 bo'lsa hozir tayyor)
 * @param isAvailable     sotuvda bormi (false bo'lsa "mavjud emas" belgisi chiqadi)
 * @param isPopular       "Mashhur" belgisi
 * @param isNew           "Yangi" belgisi
 * @param allergens       allergenlar (kartochkada belgi sifatida)
 * @param dietTags        parhez belgilari
 */
public record PublicProductResponse(
        Long id,
        String name,
        String slug,
        String categorySlug,
        Long price,
        Long oldPrice,
        LocalDateTime discountEndsAt,
        String weightLabel,
        String imageUrl,
        Integer prepTimeMinutes,
        Boolean isAvailable,
        Boolean isPopular,
        Boolean isNew,
        Set<Allergen> allergens,
        Set<DietTag> dietTags
        ,
        UnitType unitType,
        BigDecimal minQuantity,
        BigDecimal quantityStep
) {
}