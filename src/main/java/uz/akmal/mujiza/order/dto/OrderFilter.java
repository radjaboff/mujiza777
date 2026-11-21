package uz.akmal.mujiza.order.dto;

import org.springframework.format.annotation.DateTimeFormat;
import uz.akmal.mujiza.order.enums.OrderStatus;
import uz.akmal.mujiza.order.enums.OrderType;

import java.time.LocalDate;

/**
 * Admin buyurtmalar ro'yxatini filtrlash shartlari (URL parametrlaridan to'ldiriladi).
 * Hamma maydon ixtiyoriy: yuborilmagan (null) shart hisobga olinmaydi.
 * Misol: /api/admin/orders?status=NEW&dateFrom=2026-10-25&search=1001
 *
 * @param status   faqat shu holatdagi buyurtmalar
 * @param orderType faqat olib ketish yoki faqat yetkazib berish
 * @param search   buyurtma raqami (MJ-1001 yoki 1001), mijoz ismi yoki telefon raqamining bir qismi
 * @param dateFrom shu sanadan (shu kun ham kiradi), format: 2026-10-25
 * @param dateTo   shu sanagacha (shu kun ham kiradi), format: 2026-10-25
 */
public record OrderFilter(
        OrderStatus status,
        OrderType orderType,
        String search,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo
) {
}