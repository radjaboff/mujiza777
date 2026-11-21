package uz.akmal.mujiza.order.event;

import uz.akmal.mujiza.order.enums.OrderStatus;

/**
 * "Yangi buyurtma yaratildi" hodisasi. Buyurtma bazaga saqlangandan keyin e'lon qilinadi.
 * Telegram orqali do'konga xabar yuborish shu hodisaga obuna bo'ladi.
 *
 * @param orderId     buyurtmaning raqami
 * @param orderNumber mijozga ko'rinadigan buyurtma raqami (masalan, MJ-1001)
 * @param status      buyurtmaning boshlang'ich holati (oddiy buyurtmada NEW, tortda PRICE_PENDING)
 */
public record OrderCreatedEvent(
        Long orderId,
        String orderNumber,
        OrderStatus status
) {
}