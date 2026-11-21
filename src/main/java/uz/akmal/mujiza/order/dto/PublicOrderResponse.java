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
 * Mijozga qaytariladigan buyurtma ma'lumoti (buyurtma bergandan keyin va kuzatuv sahifasida).
 * Telefon raqami ataylab yo'q, kuzatuv havolasi kimning qo'liga tushsa ham raqam ochilib qolmasligi uchun.
 * Matnlar (mahsulot nomi, filial nomi) so'ralgan tilda qaytadi.
 *
 * @param orderNumber      buyurtma raqami (masalan, MJ-1001)
 * @param trackingToken    kuzatuv kaliti (kuzatuv havolasida ishlatiladi)
 * @param status           hozirgi holat
 * @param orderType        olib ketish yoki yetkazib berish
 * @param customerName     mijozning ismi
 * @param branchName       olib ketish filialining nomi (yetkazishda null)
 * @param branchAddress    olib ketish filialining manzili (yetkazishda null)
 * @param deliveryAddress  yetkazib berish manzili (olib ketishda null)
 * @param paymentMethod    to'lov usuli
 * @param comment          mijozning izohi
 * @param items            buyurtmadagi mahsulotlar
 * @param itemsTotal       mahsulotlar summasi, so'mda
 * @param deliveryFee      yetkazib berish narxi, so'mda
 * @param totalAmount      jami summa, so'mda
 * @param pickupCode       olib ketish kodi (yetkazishda null)
 * @param estimatedReadyAt taxminiy tayyor bo'lish vaqti
 * @param cancelReason     bekor qilingan bo'lsa sababi
 * @param timeline         holatlar tarixi (vaqt tartibida)
 * @param createdAt        buyurtma berilgan vaqt
 * @param promoCode        qo'llangan promo kod (yo'q bo'lsa null)
 * @param discountAmount   promo kod bergan chegirma, so'mda (yo'q bo'lsa 0)
 */
public record PublicOrderResponse(
        String orderNumber,
        String trackingToken,
        OrderStatus status,
        OrderType orderType,
        String customerName,
        String branchName,
        String branchAddress,
        String deliveryAddress,
        PaymentMethod paymentMethod,
        String comment,
        List<OrderItemResponse> items,
        Long itemsTotal,
        Long deliveryFee,
        Long totalAmount,
        String pickupCode,
        LocalDateTime estimatedReadyAt,
        String cancelReason,
        List<PublicOrderTimelineEntry> timeline,
        LocalDateTime createdAt        ,
        String promoCode,
        Long discountAmount        ,
        LocalDate scheduledDate,
        LocalTime slotStart,
        LocalTime slotEnd,
        Boolean isGift,
        Boolean isAnonymousGift,
        String recipientName,
        String giftMessage        ,
        CakeOrderDetailsResponse cake
) {
}