package uz.akmal.mujiza.order.dto;

import uz.akmal.mujiza.order.enums.OrderStatus;

import java.time.LocalDateTime;

/**
 * Admin panelda ko'rinadigan holat o'zgarishi yozuvi (kim, qachon, nimaga o'zgartirgani).
 *
 * @param status    qaysi holatga o'tgani
 * @param changedBy kim o'zgartirgani: admin logini, "customer" yoki "system"
 * @param note      izoh (masalan, bekor qilish sababi), yo'q bo'lsa null
 * @param at        o'zgarish vaqti
 */
public record OrderHistoryResponse(
        OrderStatus status,
        String changedBy,
        String note,
        LocalDateTime at
) {
}