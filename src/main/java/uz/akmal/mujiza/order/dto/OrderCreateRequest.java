package uz.akmal.mujiza.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import uz.akmal.mujiza.order.enums.OrderType;
import uz.akmal.mujiza.order.enums.PaymentMethod;

import java.time.LocalDate;
import java.util.List;

/**
 * Mijoz buyurtma berganda yuboradigan ma'lumot.
 * Oddiy qoidalar shu yerda tekshiriladi. Murakkab qoidalar (olib ketishda filial majburiy, yetkazishda manzil
 * majburiy, minimal summa, do'kon ochiqligi, mahsulot mavjudligi) Service'da tekshiriladi.
 *
 * @param customerName    mijozning ismi (majburiy, 100 belgigacha)
 * @param customerPhone   telefon raqami, +998 va 9 raqam (majburiy)
 * @param orderType       olib ketish yoki yetkazib berish (majburiy)
 * @param branchId        olib ketishda qaysi filialdan (olib ketishda majburiy)
 * @param deliveryAddress yetkazib berish manzili (yetkazishda majburiy, 300 belgigacha)
 * @param latitude        yetkazish joyining xaritadagi kengligi (ixtiyoriy)
 * @param longitude       yetkazish joyining xaritadagi uzunligi (ixtiyoriy)
 * @param paymentMethod   to'lov usuli (majburiy)
 * @param comment         mijozning izohi (ixtiyoriy, 500 belgigacha)
 * @param items           buyurtmadagi mahsulotlar, kamida 1 ta, ko'pi bilan 50 ta (majburiy)
 * @param promoCode       promo kod (ixtiyoriy, 30 belgigacha; katta-kichik harfga qaramaydi)
 */
public record OrderCreateRequest(

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


        @NotEmpty(message = "Savat bo'sh bo'lmasligi kerak")
        @Size(max = 50, message = "Bitta buyurtmada 50 tadan ortiq mahsulot bo'lmasligi kerak")
        List<@Valid @NotNull(message = "Mahsulot qatori bo'sh bo'lmasligi kerak") OrderItemRequest> items,

        @Size(max = 30, message = "Promo kod 30 belgidan oshmasligi kerak")
        String promoCode        ,
        LocalDate scheduledDate,
        Long slotId,
        Boolean isGift,
        Boolean isAnonymousGift,

        @Size(max = 100, message = "Qabul qiluvchi ismi 100 belgidan oshmasligi kerak")
        String recipientName,

        @Pattern(regexp = "^\\+998\\d{9}$", message = "Qabul qiluvchi telefoni +998901234567 ko'rinishida bo'lishi kerak")
        String recipientPhone,

        @Size(max = 300, message = "Tabrik matni 300 belgidan oshmasligi kerak")
        String giftMessage
) {
}