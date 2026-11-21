package uz.akmal.mujiza.order.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * Buyurtmadagi bitta mahsulot (mijoz savatidagi qator).
 * Narx bu yerda yo'q: uni server mahsulotning haqiqiy narxidan o'zi hisoblaydi.
 * Miqdor kasr son bo'lishi mumkin (masalan, 1.5 kg). Mahsulotning eng kam miqdori va qadamiga
 * mosligi Service'da tekshiriladi.
 *
 * @param productId mahsulotning raqami (majburiy)
 * @param quantity  miqdori: donalik mahsulotda soni, kg mahsulotda kilogramm (majburiy, 0 dan katta, 100 gacha)
 */
public record OrderItemRequest(

        @NotNull(message = "Mahsulot tanlanishi kerak")
        Long productId,

        @NotNull(message = "Mahsulot miqdori kiritilishi kerak")
        @DecimalMin(value = "0.001", message = "Miqdor noldan katta bo'lishi kerak")
        @DecimalMax(value = "100", message = "Bitta mahsulotdan ko'pi bilan 100 ta (yoki 100 kg) buyurtma qilish mumkin")
        @Digits(integer = 3, fraction = 3, message = "Miqdor ko'pi bilan 3 xona kasr bilan kiritilishi kerak")
        BigDecimal quantity
) {
}