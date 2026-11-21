package uz.akmal.mujiza.order.dto;

import uz.akmal.mujiza.order.enums.OrderStatus;

import java.time.LocalDateTime;

/**
 * Mijoz kuzatuv sahifasidagi bitta bosqich (qachon qaysi holatga o'tgani).
 * Kim o'zgartirgani (admin logini) mijozga ko'rsatilmaydi.
 *
 * @param status holat
 * @param at     shu holatga o'tgan vaqt
 */
public record PublicOrderTimelineEntry(
        OrderStatus status,
        LocalDateTime at
) {
}