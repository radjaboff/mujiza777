package uz.akmal.mujiza.catalog.dto;

import jakarta.validation.constraints.*;
import uz.akmal.mujiza.catalog.enums.Allergen;
import uz.akmal.mujiza.catalog.enums.DietTag;
import uz.akmal.mujiza.catalog.enums.UnitType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * Admin mahsulot yaratganda yoki tahrirlaganda yuboradigan ma'lumot.
 * Oddiy qoidalar (bo'sh emas, musbat son) shu yerda tekshiriladi.
 * Murakkab qoidalar (masalan, eski narx yangisidan katta bo'lishi) Service'da tekshiriladi.
 *
 * @param categoryId      mahsulot qaysi kategoriyaga tegishli (majburiy)
 * @param nameUz          nomi o'zbek tilida (majburiy)
 * @param nameRu          nomi rus tilida (majburiy)
 * @param slug            URL uchun qisqa nom (ixtiyoriy, yuborilmasa nomdan avtomatik yasaladi)
 * @param descriptionUz   tavsif o'zbek tilida (ixtiyoriy)
 * @param descriptionRu   tavsif rus tilida (ixtiyoriy)
 * @param price           hozirgi sotuv narxi, so'mda (majburiy, musbat)
 * @param oldPrice        chegirmadan oldingi narx (ixtiyoriy, aksiya bo'lsa to'ldiriladi)
 * @param discountEndsAt  chegirma tugash vaqti (ixtiyoriy, taymer uchun)
 * @param weightLabel     vazn yoki o'lcham yozuvi, masalan "1 kg" (ixtiyoriy)
 * @param imageUrl        asosiy rasm manzili (ixtiyoriy)
 * @param imageUrls       qo'shimcha rasmlar manzillari, ko'pi bilan 10 ta (ixtiyoriy)
 * @param ingredientsUz   tarkib o'zbek tilida (ixtiyoriy)
 * @param ingredientsRu   tarkib rus tilida (ixtiyoriy)
 * @param calories        kaloriya, 100 grammga (ixtiyoriy)
 * @param shelfLifeHours  saqlash muddati, soatlarda (ixtiyoriy)
 * @param prepTimeMinutes tayyorlanish vaqti, daqiqalarda; yuborilmasa 0 (hozir tayyor)
 * @param isAvailable     sotuvda bormi; yuborilmasa true
 * @param isPopular       "Mashhur" blokida ko'rsatilsinmi; yuborilmasa false
 * @param isNew           "Yangi" blokida ko'rsatilsinmi; yuborilmasa false
 * @param sortOrder       katalogda ko'rsatish tartibi; yuborilmasa 0
 * @param allergens       allergenlar to'plami (ixtiyoriy)
 * @param dietTags        parhez belgilari to'plami (ixtiyoriy)
 * @param unitType        sotilish turi (ixtiyoriy, standart: KG; tort va donalik mahsulot uchun PIECE)
 * @param minQuantity     eng kam buyurtma miqdori (ixtiyoriy; KG uchun standart: 0.5, PIECE uchun: 1)
 * @param quantityStep    miqdor qadami (ixtiyoriy; KG uchun standart: 0.5, PIECE uchun: 1)
 */

public record ProductRequest(

        @NotNull(message = "Kategoriya tanlanishi kerak")
        Long categoryId,

        @NotBlank(message = "O'zbekcha nom bo'sh bo'lmasligi kerak")
        @Size(max = 200, message = "O'zbekcha nom 200 belgidan oshmasligi kerak")
        String nameUz,

        @NotBlank(message = "Ruscha nom bo'sh bo'lmasligi kerak")
        @Size(max = 200, message = "Ruscha nom 200 belgidan oshmasligi kerak")
        String nameRu,

        @Size(max = 230, message = "Slug 230 belgidan oshmasligi kerak")
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                message = "Slug faqat kichik lotin harflari, raqamlar va chiziqchadan iborat bo'lishi kerak")
        String slug,

        @Size(max = 5000, message = "O'zbekcha tavsif 5000 belgidan oshmasligi kerak")
        String descriptionUz,

        @Size(max = 5000, message = "Ruscha tavsif 5000 belgidan oshmasligi kerak")
        String descriptionRu,

        @NotNull(message = "Narx kiritilishi kerak")
        @Positive(message = "Narx noldan katta bo'lishi kerak")
        @Max(value = 1_000_000_000L, message = "Narx 1 milliard so'mdan oshmasligi kerak")
        Long price,

        @Positive(message = "Eski narx noldan katta bo'lishi kerak")
        @Max(value = 1_000_000_000L, message = "Eski narx 1 milliard so'mdan oshmasligi kerak")
        Long oldPrice,

        LocalDateTime discountEndsAt,

        @Size(max = 50, message = "Vazn yozuvi 50 belgidan oshmasligi kerak")
        String weightLabel,

        @Size(max = 500, message = "Rasm manzili 500 belgidan oshmasligi kerak")
        String imageUrl,

        @Size(max = 10, message = "Qo'shimcha rasmlar 10 tadan oshmasligi kerak")
        List<@Size(max = 500, message = "Rasm manzili 500 belgidan oshmasligi kerak") String> imageUrls,

        @Size(max = 5000, message = "O'zbekcha tarkib 5000 belgidan oshmasligi kerak")
        String ingredientsUz,

        @Size(max = 5000, message = "Ruscha tarkib 5000 belgidan oshmasligi kerak")
        String ingredientsRu,

        @PositiveOrZero(message = "Kaloriya manfiy bo'lmasligi kerak")
        Integer calories,

        @PositiveOrZero(message = "Saqlash muddati manfiy bo'lmasligi kerak")
        Integer shelfLifeHours,

        @PositiveOrZero(message = "Tayyorlanish vaqti manfiy bo'lmasligi kerak")
        Integer prepTimeMinutes,

        Boolean isAvailable,
        Boolean isPopular,
        Boolean isNew,

        @PositiveOrZero(message = "Tartib raqami manfiy bo'lmasligi kerak")
        Integer sortOrder,

        Set<Allergen> allergens,
        Set<DietTag> dietTags
        ,
        UnitType unitType,

        @DecimalMin(value = "0.001", message = "Eng kam miqdor noldan katta bo'lishi kerak")
        @DecimalMax(value = "100", message = "Eng kam miqdor 100 dan oshmasligi kerak")
        @Digits(integer = 3, fraction = 3, message = "Eng kam miqdor ko'pi bilan 3 xona kasr bilan kiritilishi kerak")
        BigDecimal minQuantity,

        @DecimalMin(value = "0.001", message = "Qadam noldan katta bo'lishi kerak")
        @DecimalMax(value = "100", message = "Qadam 100 dan oshmasligi kerak")
        @Digits(integer = 3, fraction = 3, message = "Qadam ko'pi bilan 3 xona kasr bilan kiritilishi kerak")
        BigDecimal quantityStep
) {
}
