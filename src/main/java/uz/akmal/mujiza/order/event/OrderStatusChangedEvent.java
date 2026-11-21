package uz.akmal.mujiza.order.event;

import uz.akmal.mujiza.order.enums.OrderStatus;

/**
 * "Buyurtma holati o'zgardi" hodisasi. O'zgarish bazaga saqlangandan keyin e'lon qilinadi.
 * Mijoz kuzatuv sahifasini real vaqtda yangilash va boshqa bildirishnomalar shu hodisaga obuna bo'ladi.
 *
 * @param orderId       buyurtmaning raqami
 * @param orderNumber   mijozga ko'rinadigan buyurtma raqami
 * @param trackingToken buyurtmaning kuzatuv kaliti (kuzatuv sahifasini topish uchun)
 * @param oldStatus     oldingi holat
 * @param newStatus     yangi holat
 * @param changedBy     kim o'zgartirgani: admin logini yoki "customer"
 */
public record OrderStatusChangedEvent(
        Long orderId,
        String orderNumber,
        String trackingToken,
        OrderStatus oldStatus,
        OrderStatus newStatus,
        String changedBy
) {
}