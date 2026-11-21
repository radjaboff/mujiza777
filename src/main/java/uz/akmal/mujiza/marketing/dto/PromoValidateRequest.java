package uz.akmal.mujiza.marketing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/**
 * Mijoz promo kodni tekshirganda yuboradigan ma'lumot (savatda "Qo'llash" tugmasi bosilganda).
 * Bu faqat oldindan ko'rish uchun: yakuniy chegirma buyurtma yaratilayotganda serverda qayta hisoblanadi.
 *
 * @param code          mijoz kiritgan kod (katta-kichik harfga qaramaydi)
 * @param itemsTotal    savatdagi mahsulotlarning taxminiy summasi, so'mda
 * @param customerPhone mijozning telefoni (faqat "birinchi buyurtma" shartini tekshirish uchun, ixtiyoriy)
 */
public record PromoValidateRequest(

        @NotBlank(message = "Promo kod kiritilishi kerak")
        @Size(max = 30, message = "Kod 30 belgidan oshmasligi kerak")
        String code,

        @NotNull(message = "Mahsulotlar summasi kiritilishi kerak")
        @PositiveOrZero(message = "Summa manfiy bo'lmasligi kerak")
        Long itemsTotal,

        @Pattern(regexp = "^\\+998\\d{9}$", message = "Telefon +998901234567 ko'rinishida bo'lishi kerak")
        String customerPhone
) {
}