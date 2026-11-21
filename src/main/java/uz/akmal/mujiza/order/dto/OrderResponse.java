package uz.akmal.mujiza.order.dto;

import uz.akmal.mujiza.cake.dto.CakeOrderDetailsResponse;
import uz.akmal.mujiza.order.enums.OrderStatus;
import uz.akmal.mujiza.order.enums.OrderType;
import uz.akmal.mujiza.order.enums.PaymentMethod;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * Admin panelga qaytariladigan buyurtmaning to'liq ma'lumoti.
 *
 * @param id               buyurtmaning noyob raqami
 * @param orderNumber      buyurtma raqami (masalan, MJ-1001)
 * @param trackingToken    kuzatuv kaliti (mijozga havola yuborish uchun)
 * @param status           hozirgi holat
 * @param orderType        olib ketish yoki yetkazib berish
 * @param customerName     mijozning ismi
 * @param customerPhone    mijozning telefon raqami
 * @param branchId         olib ketish filialining raqami (yetkazishda null)
 * @param branchName       olib ketish filialining nomi (yetkazishda null)
 * @param deliveryAddress  yetkazib berish manzili
 * @param latitude         yetkazish joyining kengligi
 * @param longitude        yetkazish joyining uzunligi
 * @param paymentMethod    to'lov usuli
 * @param comment          mijozning izohi
 * @param items            buyurtmadagi mahsulotlar
 * @param itemsTotal       mahsulotlar summasi, so'mda
 * @param deliveryFee      yetkazib berish narxi, so'mda
 * @param totalAmount      jami summa, so'mda
 * @param pickupCode       olib ketish kodi
 * @param estimatedReadyAt taxminiy tayyor bo'lish vaqti
 * @param cancelReason     bekor qilish sababi
 * @param history          holatlar tarixi (kim, qachon, nima)
 * @param createdAt        buyurtma berilgan vaqt
 * @param updatedAt        oxirgi o'zgartirilgan vaqt
 * @param promoCode        qo'llangan promo kod (yo'q bo'lsa null)
 * @param discountAmount   promo kod bergan chegirma, so'mda (yo'q bo'lsa 0)
 */
public record OrderResponse(
        Long id,
        String orderNumber,
        String trackingToken,
        OrderStatus status,
        OrderType orderType,
        String customerName,
        String customerPhone,
        Long branchId,
        String branchName,
        String deliveryAddress,
        Double latitude,
        Double longitude,
        PaymentMethod paymentMethod,
        String comment,
        List<OrderItemResponse> items,
        Long itemsTotal,
        Long deliveryFee,
        Long totalAmount,
        String pickupCode,
        LocalDateTime estimatedReadyAt,
        String cancelReason,
        List<OrderHistoryResponse> history,
        LocalDateTime createdAt,
        LocalDateTime updatedAt ,
        String promoCode,
        Long discountAmount        ,
        LocalDate scheduledDate,
        LocalTime slotStart,
        LocalTime slotEnd,
        Boolean isGift,
        Boolean isAnonymousGift,
        String recipientName,
        String recipientPhone,
        String giftMessage        ,
        CakeOrderDetailsResponse cake
) {
}