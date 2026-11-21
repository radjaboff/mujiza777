package uz.akmal.mujiza.cake.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Admin tort turini yaratganda yoki tahrirlaganda yuboradigan ma'lumot.
 * Murakkab qoidalar (eng ko'p vazn eng kamdan katta, qadamga karralilik) Service'da tekshiriladi.
 *
 * @param nameUz         nomi o'zbek tilida (majburiy)
 * @param nameRu         nomi rus tilida (majburiy)
 * @param imageUrl       rasm manzili (ixtiyoriy)
 * @param basePricePerKg 1 kg uchun asosiy narx, so'mda (majburiy)
 * @param minWeightKg    eng kam vazn, kg da (majburiy)
 * @param maxWeightKg    eng ko'p vazn, kg da (majburiy)
 * @param weightStep     vazn qadami, kg da (majburiy)
 * @param servingsPerKg  1 kg dan taxminiy porsiya soni (ixtiyoriy)
 * @param sortOrder      ko'rsatish tartibi; yuborilmasa eski qiymat (yangida 0)
 * @param isActive       mijozlarga ko'rinadimi; yuborilmasa eski qiymat (yangida true)
 */
public record CakeTypeRequest(

        @NotBlank(message = "O'zbekcha nom bo'sh bo'lmasligi kerak")
        @Size(max = 150, message = "O'zbekcha nom 150 belgidan oshmasligi kerak")
        String nameUz,

        @NotBlank(message = "Ruscha nom bo'sh bo'lmasligi kerak")
        @Size(max = 150, message = "Ruscha nom 150 belgidan oshmasligi kerak")
        String nameRu,

        @Size(max = 500, message = "Rasm manzili 500 belgidan oshmasligi kerak")
        String imageUrl,

        @NotNull(message = "1 kg narxi kiritilishi kerak")
        @Positive(message = "Narx noldan katta bo'lishi kerak")
        Long basePricePerKg,

        @NotNull(message = "Eng kam vazn kiritilishi kerak")
        @DecimalMin(value = "0.01", message = "Eng kam vazn noldan katta bo'lishi kerak")
        @DecimalMax(value = "100", message = "Eng kam vazn 100 kg dan oshmasligi kerak")
        @Digits(integer = 3, fraction = 2, message = "Vazn ko'pi bilan 2 xona kasr bilan kiritilishi kerak")
        BigDecimal minWeightKg,

        @NotNull(message = "Eng ko'p vazn kiritilishi kerak")
        @DecimalMin(value = "0.01", message = "Eng ko'p vazn noldan katta bo'lishi kerak")
        @DecimalMax(value = "100", message = "Eng ko'p vazn 100 kg dan oshmasligi kerak")
        @Digits(integer = 3, fraction = 2, message = "Vazn ko'pi bilan 2 xona kasr bilan kiritilishi kerak")
        BigDecimal maxWeightKg,

        @NotNull(message = "Vazn qadami kiritilishi kerak")
        @DecimalMin(value = "0.01", message = "Qadam noldan katta bo'lishi kerak")
        @DecimalMax(value = "100", message = "Qadam 100 dan oshmasligi kerak")
        @Digits(integer = 3, fraction = 2, message = "Qadam ko'pi bilan 2 xona kasr bilan kiritilishi kerak")
        BigDecimal weightStep,

        @Positive(message = "Porsiya soni noldan katta bo'lishi kerak")
        @Max(value = 50, message = "1 kg dan porsiya soni 50 dan oshmasligi kerak")
        Integer servingsPerKg,

        @PositiveOrZero(message = "Tartib raqami manfiy bo'lmasligi kerak")
        Integer sortOrder,

        Boolean isActive
) {
}