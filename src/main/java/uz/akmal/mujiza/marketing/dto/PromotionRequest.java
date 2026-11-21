package uz.akmal.mujiza.marketing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * Admin aksiya yaratganda yoki tahrirlaganda yuboradigan ma'lumot.
 * Tugash vaqti boshlanish vaqtidan keyin bo'lishi Service'da tekshiriladi.
 *
 * @param titleUz        sarlavha o'zbek tilida (majburiy)
 * @param titleRu        sarlavha rus tilida (majburiy)
 * @param slug           URL uchun qisqa nom (ixtiyoriy, yuborilmasa sarlavhadan yasaladi)
 * @param summaryUz      qisqa tavsif o'zbek tilida (ixtiyoriy, 300 belgigacha)
 * @param summaryRu      qisqa tavsif rus tilida (ixtiyoriy, 300 belgigacha)
 * @param descriptionUz  to'liq matn o'zbek tilida (ixtiyoriy)
 * @param descriptionRu  to'liq matn rus tilida (ixtiyoriy)
 * @param imageUrl       kompyuter uchun rasm manzili (ixtiyoriy)
 * @param mobileImageUrl telefon uchun rasm manzili (ixtiyoriy)
 * @param linkUrl        bosilganda olib boradigan manzil: "/" bilan boshlanadigan sayt yo'li yoki http(s):// havola (ixtiyoriy)
 * @param showOnHome     bosh sahifada ko'rsatilsinmi; yuborilmasa eski qiymat (yangida false)
 * @param activeFrom     ko'rinish boshlanadigan vaqt (ixtiyoriy)
 * @param activeTo       ko'rinish tugaydigan vaqt (ixtiyoriy)
 * @param sortOrder      ko'rsatish tartibi; yuborilmasa eski qiymat (yangida 0)
 * @param isActive       yoqilganmi; yuborilmasa eski qiymat (yangida true)
 */
public record PromotionRequest(

        @NotBlank(message = "O'zbekcha sarlavha bo'sh bo'lmasligi kerak")
        @Size(max = 200, message = "O'zbekcha sarlavha 200 belgidan oshmasligi kerak")
        String titleUz,

        @NotBlank(message = "Ruscha sarlavha bo'sh bo'lmasligi kerak")
        @Size(max = 200, message = "Ruscha sarlavha 200 belgidan oshmasligi kerak")
        String titleRu,

        @Size(max = 230, message = "Slug 230 belgidan oshmasligi kerak")
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                message = "Slug faqat kichik lotin harflari, raqamlar va chiziqchadan iborat bo'lishi kerak")
        String slug,

        @Size(max = 300, message = "O'zbekcha qisqa tavsif 300 belgidan oshmasligi kerak")
        String summaryUz,

        @Size(max = 300, message = "Ruscha qisqa tavsif 300 belgidan oshmasligi kerak")
        String summaryRu,

        @Size(max = 10000, message = "O'zbekcha matn 10000 belgidan oshmasligi kerak")
        String descriptionUz,

        @Size(max = 10000, message = "Ruscha matn 10000 belgidan oshmasligi kerak")
        String descriptionRu,

        @Size(max = 500, message = "Rasm manzili 500 belgidan oshmasligi kerak")
        String imageUrl,

        @Size(max = 500, message = "Telefon rasmi manzili 500 belgidan oshmasligi kerak")
        String mobileImageUrl,

        @Size(max = 500, message = "Havola 500 belgidan oshmasligi kerak")
        @Pattern(regexp = "^(/|https?://).+",
                message = "Havola '/' bilan boshlanadigan sayt yo'li yoki http:// yoki https:// havola bo'lishi kerak")
        String linkUrl,

        Boolean showOnHome,
        LocalDateTime activeFrom,
        LocalDateTime activeTo,

        @PositiveOrZero(message = "Tartib raqami manfiy bo'lmasligi kerak")
        Integer sortOrder,

        Boolean isActive
) {
}