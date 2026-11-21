package uz.akmal.mujiza.cake.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

/**
 * Mijoz tort narxini hisoblatganda yuboradigan ma'lumot (konstruktorning har bir o'zgarishida).
 *
 * @param cakeTypeId tanlangan tort turi (majburiy)
 * @param weightKg   vazn, kg da (majburiy)
 * @param optionIds  tanlangan variantlarning raqamlari (ixtiyoriy, ko'pi bilan 20 ta)
 */
public record CakePriceRequest(

        @NotNull(message = "Tort turi tanlanishi kerak")
        Long cakeTypeId,

        @NotNull(message = "Vazn kiritilishi kerak")
        @DecimalMin(value = "0.01", message = "Vazn noldan katta bo'lishi kerak")
        @DecimalMax(value = "100", message = "Vazn 100 kg dan oshmasligi kerak")
        @Digits(integer = 3, fraction = 2, message = "Vazn ko'pi bilan 2 xona kasr bilan kiritilishi kerak")
        BigDecimal weightKg,

        @Size(max = 20, message = "Variantlar soni 20 tadan oshmasligi kerak")
        List<Long> optionIds
) {
}