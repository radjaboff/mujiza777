package uz.akmal.mujiza.order.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import uz.akmal.mujiza.order.enums.OrderStatus;

/**
 * Admin buyurtma holatini o'zgartirganda yuboradigan ma'lumot.
 *
 * @param status yangi holat (majburiy)
 * @param note   izoh (ixtiyoriy, 300 belgigacha). Bekor qilishda sabab sifatida yoziladi va bekor qilishda majburiy.
 */
public record OrderStatusUpdateRequest(

        @NotNull(message = "Yangi holat ko'rsatilishi kerak")
        OrderStatus status,

        @Size(max = 300, message = "Izoh 300 belgidan oshmasligi kerak")
        String note
) {
}