package uz.akmal.mujiza.order.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Admin tort narxini tasdiqlaganda yuboradigan ma'lumot.
 *
 * @param finalPrice yakuniy narx, so'mda (ixtiyoriy: yuborilmasa, hisoblangan narx tasdiqlanadi)
 * @param note       narx haqida izoh (ixtiyoriy, 300 belgigacha; narx o'zgargan bo'lsa sababini yozish tavsiya etiladi)
 */
public record ConfirmPriceRequest(

        @Positive(message = "Narx noldan katta bo'lishi kerak")
        @Max(value = 50_000_000, message = "Narx 50 000 000 so'mdan oshmasligi kerak")
        Long finalPrice,

        @Size(max = 300, message = "Izoh 300 belgidan oshmasligi kerak")
        String note
) {
}