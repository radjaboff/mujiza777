package uz.akmal.mujiza.shop.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/**
 * Admin filial yaratganda yoki tahrirlaganda yuboradigan ma'lumot.
 * Kenglik va uzunlik birga berilishi kerakligi (yoki ikkalasi ham bo'sh) Service'da tekshiriladi.
 *
 * @param nameUz            filial nomi o'zbek tilida (majburiy)
 * @param nameRu            filial nomi rus tilida (majburiy)
 * @param addressUz         manzil o'zbek tilida (majburiy)
 * @param addressRu         manzil rus tilida (majburiy)
 * @param phone             telefon raqami, +998 va 9 raqam (majburiy)
 * @param workHours         ish vaqti matni, masalan "09:00 - 22:00" (ixtiyoriy)
 * @param latitude          xaritadagi kenglik, -90 dan 90 gacha (ixtiyoriy)
 * @param longitude         xaritadagi uzunlik, -180 dan 180 gacha (ixtiyoriy)
 * @param imageUrl          rasm manzili (ixtiyoriy)
 * @param isPickupAvailable olib ketish mumkinmi; yuborilmasa eski qiymat (yangi filialda true)
 * @param isActive          mijozlarga ko'rinadimi; yuborilmasa eski qiymat (yangi filialda true)
 * @param sortOrder         ko'rsatish tartibi; yuborilmasa eski qiymat (yangi filialda 0)
 */
public record BranchRequest(

        @NotBlank(message = "O'zbekcha nom bo'sh bo'lmasligi kerak")
        @Size(max = 150, message = "O'zbekcha nom 150 belgidan oshmasligi kerak")
        String nameUz,

        @NotBlank(message = "Ruscha nom bo'sh bo'lmasligi kerak")
        @Size(max = 150, message = "Ruscha nom 150 belgidan oshmasligi kerak")
        String nameRu,

        @NotBlank(message = "O'zbekcha manzil bo'sh bo'lmasligi kerak")
        @Size(max = 300, message = "O'zbekcha manzil 300 belgidan oshmasligi kerak")
        String addressUz,

        @NotBlank(message = "Ruscha manzil bo'sh bo'lmasligi kerak")
        @Size(max = 300, message = "Ruscha manzil 300 belgidan oshmasligi kerak")
        String addressRu,

        @NotBlank(message = "Telefon raqami kiritilishi kerak")
        @Pattern(regexp = "^\\+998\\d{9}$", message = "Telefon +998901234567 ko'rinishida bo'lishi kerak")
        String phone,

        @Size(max = 100, message = "Ish vaqti 100 belgidan oshmasligi kerak")
        String workHours,

        @DecimalMin(value = "-90.0", message = "Kenglik -90 dan kam bo'lmasligi kerak")
        @DecimalMax(value = "90.0", message = "Kenglik 90 dan oshmasligi kerak")
        Double latitude,

        @DecimalMin(value = "-180.0", message = "Uzunlik -180 dan kam bo'lmasligi kerak")
        @DecimalMax(value = "180.0", message = "Uzunlik 180 dan oshmasligi kerak")
        Double longitude,

        @Size(max = 500, message = "Rasm manzili 500 belgidan oshmasligi kerak")
        String imageUrl,

        Boolean isPickupAvailable,
        Boolean isActive,

        @PositiveOrZero(message = "Tartib raqami manfiy bo'lmasligi kerak")
        Integer sortOrder
) {
}