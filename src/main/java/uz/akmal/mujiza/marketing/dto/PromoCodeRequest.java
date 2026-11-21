package uz.akmal.mujiza.marketing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import uz.akmal.mujiza.marketing.enums.DiscountType;

import java.time.LocalDateTime;

/**
 * Admin promo kod yaratganda yoki tahrirlaganda yuboradigan ma'lumot.
 * Murakkab qoidalar (foiz 1-100, eng ko'p chegirma faqat foizli kodda, muddat oralig'i, kod takrorlanmasligi)
 * Service'da tekshiriladi.
 *
 * @param code              kod matni: lotin harflari, raqam, chiziqcha va pastki chiziq, 3-30 belgi (KATTA harfga o'tkaziladi)
 * @param description       admin uchun izoh (ixtiyoriy, 200 belgigacha)
 * @param discountType      PERCENT yoki FIXED (majburiy)
 * @param discountValue     foizli kodda foiz (1-100), aniq summali kodda so'm (majburiy, noldan katta)
 * @param maxDiscountAmount foizli kod uchun eng ko'p chegirma summasi, so'mda (ixtiyoriy)
 * @param minOrderAmount    minimal buyurtma summasi, so'mda; yuborilmasa 0 (cheklov yo'q)
 * @param maxUses           eng ko'p foydalanish soni (ixtiyoriy, bo'sh bo'lsa cheksiz)
 * @param firstOrderOnly    faqat birinchi buyurtma uchunmi; yuborilmasa eski qiymat (yangi kodda false)
 * @param validFrom         amal qilish boshlanishi (ixtiyoriy)
 * @param validTo           amal qilish tugashi (ixtiyoriy)
 * @param isActive          yoqilganmi; yuborilmasa eski qiymat (yangi kodda true)
 */
public record PromoCodeRequest(

        @NotBlank(message = "Kod kiritilishi kerak")
        @Size(min = 3, max = 30, message = "Kod 3 dan 30 belgigacha bo'lishi kerak")
        @Pattern(regexp = "^[A-Za-z0-9_-]+$",
                message = "Kod faqat lotin harflari, raqam, chiziqcha va pastki chiziqdan iborat bo'lishi kerak")
        String code,

        @Size(max = 200, message = "Izoh 200 belgidan oshmasligi kerak")
        String description,

        @NotNull(message = "Chegirma turi tanlanishi kerak")
        DiscountType discountType,

        @NotNull(message = "Chegirma qiymati kiritilishi kerak")
        @Positive(message = "Chegirma qiymati noldan katta bo'lishi kerak")
        Long discountValue,

        @Positive(message = "Eng ko'p chegirma summasi noldan katta bo'lishi kerak")
        Long maxDiscountAmount,

        @PositiveOrZero(message = "Minimal summa manfiy bo'lmasligi kerak")
        Long minOrderAmount,

        @Positive(message = "Foydalanish soni noldan katta bo'lishi kerak")
        Integer maxUses,

        Boolean firstOrderOnly,
        LocalDateTime validFrom,
        LocalDateTime validTo,
        Boolean isActive
) {
}