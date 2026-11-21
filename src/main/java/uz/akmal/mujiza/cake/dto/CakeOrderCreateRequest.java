package uz.akmal.mujiza.cake.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import uz.akmal.mujiza.order.enums.OrderType;
import uz.akmal.mujiza.order.enums.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Mijoz tort buyurtmasi berganda yuboradigan ma'lumot.
 * Oddiy qoidalar shu yerda; murakkab qoidalar (vazn va variant qoidalari, vaqt, filial, manzil) Service'da tekshiriladi.
 *
 * @param customerName      mijozning ismi (majburiy)
 * @param customerPhone     telefon raqami, +998 va 9 raqam (majburiy)
 * @param orderType         olib ketish yoki yetkazib berish (majburiy)
 * @param branchId          olib ketishda filial (olib ketishda majburiy)
 * @param deliveryAddress   yetkazish manzili (yetkazishda majburiy)
 * @param latitude          yetkazish joyining kengligi (ixtiyoriy)
 * @param longitude         yetkazish joyining uzunligi (ixtiyoriy)
 * @param paymentMethod     to'lov usuli (majburiy)
 * @param comment           izoh (ixtiyoriy)
 * @param scheduledDate     tort kerak bo'ladigan sana (majburiy)
 * @param slotId            vaqt oynasi (yetkazishda faol oyna bo'lsa majburiy)
 * @param cakeTypeId        tort turi (majburiy)
 * @param weightKg          vazn, kg da (majburiy)
 * @param optionIds         tanlangan variantlar (ixtiyoriy)
 * @param inscription       tortga yoziladigan yozuv (ixtiyoriy, 100 belgigacha)
 * @param referenceImageUrl namuna rasm: faqat /api/public/files/cake-reference orqali yuklangan manzil (ixtiyoriy)
 */
public record CakeOrderCreateRequest(

        @NotBlank(message = "Ism kiritilishi kerak")
        @Size(max = 100, message = "Ism 100 belgidan oshmasligi kerak")
        String customerName,

        @NotBlank(message = "Telefon raqami kiritilishi kerak")
        @Pattern(regexp = "^\\+998\\d{9}$", message = "Telefon +998901234567 ko'rinishida bo'lishi kerak")
        String customerPhone,

        @NotNull(message = "Buyurtma turi (olib ketish yoki yetkazib berish) tanlanishi kerak")
        OrderType orderType,

        Long branchId,

        @Size(max = 300, message = "Manzil 300 belgidan oshmasligi kerak")
        String deliveryAddress,

        @DecimalMin(value = "-90.0", message = "Kenglik -90 dan kam bo'lmasligi kerak")
        @DecimalMax(value = "90.0", message = "Kenglik 90 dan oshmasligi kerak")
        Double latitude,

        @DecimalMin(value = "-180.0", message = "Uzunlik -180 dan kam bo'lmasligi kerak")
        @DecimalMax(value = "180.0", message = "Uzunlik 180 dan oshmasligi kerak")
        Double longitude,

        @NotNull(message = "To'lov usuli tanlanishi kerak")
        PaymentMethod paymentMethod,

        @Size(max = 500, message = "Izoh 500 belgidan oshmasligi kerak")
        String comment,

        @NotNull(message = "Tort qaysi sanaga kerakligi ko'rsatilishi kerak")
        LocalDate scheduledDate,

        Long slotId,

        @NotNull(message = "Tort turi tanlanishi kerak")
        Long cakeTypeId,

        @NotNull(message = "Vazn kiritilishi kerak")
        @DecimalMin(value = "0.01", message = "Vazn noldan katta bo'lishi kerak")
        @DecimalMax(value = "100", message = "Vazn 100 kg dan oshmasligi kerak")
        @Digits(integer = 3, fraction = 2, message = "Vazn ko'pi bilan 2 xona kasr bilan kiritilishi kerak")
        BigDecimal weightKg,

        @Size(max = 20, message = "Variantlar soni 20 tadan oshmasligi kerak")
        List<Long> optionIds,

        @Size(max = 100, message = "Yozuv 100 belgidan oshmasligi kerak")
        String inscription,

        @Size(max = 500, message = "Rasm manzili 500 belgidan oshmasligi kerak")
        @Pattern(regexp = "^(/uploads/cakes/[A-Za-z0-9._-]+|https?://\\S+/cakes/[A-Za-z0-9._-]+)$",
                message = "Namuna rasm faqat bizning serverga yuklangan rasm bo'lishi mumkin")
        String referenceImageUrl
) {
}