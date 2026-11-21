package uz.akmal.mujiza.order.dto;

import uz.akmal.mujiza.order.enums.OrderStatus;
import uz.akmal.mujiza.order.enums.OrderType;
import uz.akmal.mujiza.order.enums.PaymentMethod;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Admin buyurtmalar ro'yxatidagi bitta qator (qisqa ma'lumot, to'liq ma'lumot alohida so'raladi).
 *
 * @param id            buyurtmaning noyob raqami
 * @param orderNumber   buyurtma raqami (masalan, MJ-1001)
 * @param status        hozirgi holat
 * @param orderType     olib ketish yoki yetkazib berish
 * @param customerName  mijozning ismi
 * @param customerPhone mijozning telefon raqami
 * @param paymentMethod to'lov usuli
 * @param totalAmount   jami summa, so'mda
 * @param itemsCount    buyurtmadagi mahsulot qatorlari soni
 * @param createdAt     buyurtma berilgan vaqt
 */
public record OrderListItemResponse(
        Long id,
        String orderNumber,
        OrderStatus status,
        OrderType orderType,
        String customerName,
        String customerPhone,
        PaymentMethod paymentMethod,
        Long totalAmount,
        Integer itemsCount,
        LocalDateTime createdAt        ,
        LocalDate scheduledDate,
        LocalTime slotStart,
        LocalTime slotEnd,
        Boolean isGift        ,
        Boolean isCakeOrder
) {
}