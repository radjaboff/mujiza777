package uz.akmal.mujiza.catering.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Mijoz keytering so'rovi yuborganda to'ldiradigan ma'lumot.
 * Sana oralig'i (bugundan 2 yil ichida) Service'da tekshiriladi.
 *
 * @param name       ismi (majburiy, 100 belgigacha)
 * @param phone      telefon raqami, +998 va 9 raqam (majburiy)
 * @param eventType  tadbir turi (majburiy, 100 belgigacha)
 * @param eventDate  tadbir sanasi (majburiy)
 * @param guestCount mehmonlar soni, 1 dan 5000 gacha (majburiy)
 * @param budget     taxminiy byudjet, so'mda (ixtiyoriy)
 * @param comment    istaklar (ixtiyoriy, 1000 belgigacha)
 */
public record CateringCreateRequest(

        @NotBlank(message = "Ism kiritilishi kerak")
        @Size(max = 100, message = "Ism 100 belgidan oshmasligi kerak")
        String name,

        @NotBlank(message = "Telefon raqami kiritilishi kerak")
        @Pattern(regexp = "^\\+998\\d{9}$", message = "Telefon +998901234567 ko'rinishida bo'lishi kerak")
        String phone,

        @NotBlank(message = "Tadbir turi kiritilishi kerak")
        @Size(max = 100, message = "Tadbir turi 100 belgidan oshmasligi kerak")
        String eventType,

        @NotNull(message = "Tadbir sanasi kiritilishi kerak")
        LocalDate eventDate,

        @NotNull(message = "Mehmonlar soni kiritilishi kerak")
        @Min(value = 1, message = "Mehmonlar soni kamida 1 bo'lishi kerak")
        @Max(value = 5000, message = "Mehmonlar soni 5000 dan oshmasligi kerak")
        Integer guestCount,

        @PositiveOrZero(message = "Byudjet manfiy bo'lmasligi kerak")
        Long budget,

        @Size(max = 1000, message = "Izoh 1000 belgidan oshmasligi kerak")
        String comment
) {
}