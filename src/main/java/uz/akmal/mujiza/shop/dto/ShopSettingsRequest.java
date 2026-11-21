package uz.akmal.mujiza.shop.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import uz.akmal.mujiza.shop.enums.SeasonTheme;

import java.time.LocalTime;

/**
 * Admin sozlamalarni o'zgartirganda yuboradigan ma'lumot (hamma maydon to'liq yuboriladi).
 *
 * @param phone              do'konning telefon raqami, +998 va 9 raqam (majburiy)
 * @param openTime           ochilish soati, masalan "09:00" (majburiy)
 * @param closeTime          yopilish soati, masalan "22:00" (majburiy)
 * @param acceptingOrders    onlayn buyurtma qabul qilinyaptimi (majburiy)
 * @param deliveryEnabled    yetkazib berish yoqilganmi (majburiy)
 * @param deliveryFee        yetkazib berish narxi, so'mda, 0 yoki undan katta (majburiy)
 * @param freeDeliveryFrom   shu summadan yuqorida yetkazib berish bepul; bo'sh qoldirsa, bepul yetkazish yo'q
 * @param minOrderAmount     minimal buyurtma summasi, so'mda, 0 bo'lsa cheklov yo'q (majburiy)
 * @param cakeMinAdvanceHours tortga eng kamida necha soat oldin buyurtma berish kerak, 0 dan 720 gacha (majburiy)
 * @param telegramUrl        Telegram sahifasi manzili, http:// yoki https:// bilan boshlanishi kerak (ixtiyoriy)
 * @param instagramUrl       Instagram sahifasi manzili, http:// yoki https:// bilan boshlanishi kerak (ixtiyoriy)
 * @param seasonTheme        sayt mavsumiy mavzusi; yuborilmasa (null) hozirgi mavzu o'zgarmaydi
 */
public record ShopSettingsRequest(

        @NotBlank(message = "Telefon raqami kiritilishi kerak")
        @Pattern(regexp = "^\\+998\\d{9}$", message = "Telefon +998901234567 ko'rinishida bo'lishi kerak")
        String phone,

        @NotNull(message = "Ochilish vaqti kiritilishi kerak")
        LocalTime openTime,

        @NotNull(message = "Yopilish vaqti kiritilishi kerak")
        LocalTime closeTime,

        @NotNull(message = "Buyurtma qabul qilish holati ko'rsatilishi kerak")
        Boolean acceptingOrders,

        @NotNull(message = "Yetkazib berish holati ko'rsatilishi kerak")
        Boolean deliveryEnabled,

        @NotNull(message = "Yetkazib berish narxi kiritilishi kerak")
        @PositiveOrZero(message = "Yetkazib berish narxi manfiy bo'lmasligi kerak")
        @Max(value = 100_000_000L, message = "Yetkazib berish narxi 100 million so'mdan oshmasligi kerak")
        Long deliveryFee,

        @PositiveOrZero(message = "Bepul yetkazish chegarasi manfiy bo'lmasligi kerak")
        @Max(value = 500_000_000L, message = "Bepul yetkazish chegarasi 500 million so'mdan oshmasligi kerak")
        Long freeDeliveryFrom,

        @NotNull(message = "Minimal buyurtma summasi kiritilishi kerak")
        @PositiveOrZero(message = "Minimal buyurtma summasi manfiy bo'lmasligi kerak")
        @Max(value = 500_000_000L, message = "Minimal buyurtma summasi 500 million so'mdan oshmasligi kerak")
        Long minOrderAmount,

        @NotNull(message = "Tort uchun oldindan buyurtma muddati kiritilishi kerak")
        @Min(value = 0, message = "Muddat manfiy bo'lmasligi kerak")
        @Max(value = 720, message = "Muddat 720 soatdan (30 kun) oshmasligi kerak")
        Integer cakeMinAdvanceHours,

        @Size(max = 300, message = "Telegram manzili 300 belgidan oshmasligi kerak")
        @Pattern(regexp = "^https?://.+", message = "Telegram manzili http:// yoki https:// bilan boshlanishi kerak")
        String telegramUrl,

        @Size(max = 300, message = "Instagram manzili 300 belgidan oshmasligi kerak")
        @Pattern(regexp = "^https?://.+", message = "Instagram manzili http:// yoki https:// bilan boshlanishi kerak")
        String instagramUrl,

        SeasonTheme seasonTheme
) {
}