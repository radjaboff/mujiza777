package uz.akmal.mujiza.catalog.dto;

import uz.akmal.mujiza.catalog.enums.Allergen;
import uz.akmal.mujiza.catalog.enums.DietTag;
import uz.akmal.mujiza.catalog.enums.UnitType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * Mijoz saytidagi mahsulot sahifasi uchun to'liq ma'lumot.
 * Nom, tavsif va tarkib so'ralgan tilda (uz yoki ru) qaytadi.
 *
 * @param id              mahsulotning noyob raqami
 * @param categoryId      kategoriyaning raqami
 * @param categoryName    kategoriya nomi so'ralgan tilda
 * @param categorySlug    kategoriyaning slug'i (yo'l ko'rsatgich/breadcrumb uchun)
 * @param name            nomi so'ralgan tilda
 * @param slug            URL uchun qisqa nom
 * @param description     tavsif so'ralgan tilda
 * @param price           HOZIR amal qiladigan narx
 * @param oldPrice        chizilgan eski narx; chegirma amal qilmayotgan bo'lsa null
 * @param discountEndsAt  chegirma tugash vaqti (taymer uchun)
 * @param weightLabel     vazn yoki o'lcham yozuvi
 * @param imageUrl        asosiy rasm manzili
 * @param imageUrls       qo'shimcha rasmlar manzillari (galereya)
 * @param ingredients     tarkib so'ralgan tilda
 * @param calories        kaloriya, 100 grammga
 * @param shelfLifeHours  saqlash muddati, soatlarda
 * @param prepTimeMinutes tayyorlanish vaqti, daqiqalarda
 * @param isAvailable     sotuvda bormi
 * @param isPopular       "Mashhur" belgisi
 * @param isNew           "Yangi" belgisi
 * @param allergens       allergenlar to'plami
 * @param dietTags        parhez belgilari to'plami
 */
public record PublicProductDetailResponse(
        Long id,
        Long categoryId,
        String categoryName,
        String categorySlug,
        String name,
        String slug,
        String description,
        Long price,
        Long oldPrice,
        LocalDateTime discountEndsAt,
        String weightLabel,
        String imageUrl,
        List<String> imageUrls,
        String ingredients,
        Integer calories,
        Integer shelfLifeHours,
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