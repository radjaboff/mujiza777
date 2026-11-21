package uz.akmal.mujiza.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/**
 * Admin kategoriya yaratganda yoki tahrirlaganda yuboradigan ma'lumot.
 * Validation qoidalari shu yerda turadi, controller'da @Valid bilan tekshiriladi.
 *
 * @param nameUz    kategoriya nomi o'zbek tilida (majburiy, 150 belgigacha)
 * @param nameRu    kategoriya nomi rus tilida (majburiy, 150 belgigacha)
 * @param slug      URL uchun qisqa nom, faqat kichik lotin harflari, raqamlar va chiziqcha
 *                  (masalan, "tug-ilgan-kun-tortlari"). Yuborilmasa (null), nomdan avtomatik yasaladi.
 * @param imageUrl  kategoriya rasmining manzili (ixtiyoriy, 500 belgigacha)
 * @param sortOrder saytda ko'rsatish tartibi, 0 yoki undan katta. Yuborilmasa 0 bo'ladi.
 * @param isActive  mijozlarga ko'rinadimi. Yuborilmasa true (ko'rinadi) bo'ladi.
 */
public record CategoryRequest(

        @NotBlank(message = "O'zbekcha nom bo'sh bo'lmasligi kerak")
        @Size(max = 150, message = "O'zbekcha nom 150 belgidan oshmasligi kerak")
        String nameUz,

        @NotBlank(message = "Ruscha nom bo'sh bo'lmasligi kerak")
        @Size(max = 150, message = "Ruscha nom 150 belgidan oshmasligi kerak")
        String nameRu,

        @Size(max = 180, message = "Slug 180 belgidan oshmasligi kerak")
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                message = "Slug faqat kichik lotin harflari, raqamlar va chiziqchadan iborat bo'lishi kerak")
        String slug,

        @Size(max = 500, message = "Rasm manzili 500 belgidan oshmasligi kerak")
        String imageUrl,

        @PositiveOrZero(message = "Tartib raqami manfiy bo'lmasligi kerak")
        Integer sortOrder,

        Boolean isActive
) {
}