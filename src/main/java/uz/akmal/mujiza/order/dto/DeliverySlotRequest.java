package uz.akmal.mujiza.order.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

/**
 * Admin vaqt oynasi yaratganda yoki tahrirlaganda yuboradigan ma'lumot.
 * Tugash vaqti boshlanishdan keyin bo'lishi Service'da tekshiriladi.
 *
 * @param startTime boshlanish soati, masalan "14:00" (majburiy)
 * @param endTime   tugash soati, masalan "16:00" (majburiy)
 * @param capacity  bir sanada eng ko'p buyurtma soni, 1 dan 100 gacha (majburiy)
 * @param isActive  yoqilganmi; yuborilmasa eski qiymat (yangida true)
 */
public record DeliverySlotRequest(

        @NotNull(message = "Boshlanish vaqti kiritilishi kerak")
        LocalTime startTime,

        @NotNull(message = "Tugash vaqti kiritilishi kerak")
        LocalTime endTime,

        @NotNull(message = "Sig'im kiritilishi kerak")
        @Min(value = 1, message = "Sig'im kamida 1 bo'lishi kerak")
        @Max(value = 100, message = "Sig'im 100 dan oshmasligi kerak")
        Integer capacity,

        Boolean isActive
) {
}