package uz.akmal.mujiza.order.event;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import uz.akmal.mujiza.order.stream.OrderStreamService;

/**
 * Buyurtma holati o'zgarganda kuzatuv sahifalariga real vaqtda xabar yuboradi.
 */
@Component
@RequiredArgsConstructor
public class OrderLiveUpdateListener {

    /**
     * Kuzatuv sahifalari bilan ochiq ulanishlarni boshqaruvchi.
     */
    private final OrderStreamService streamService;

    /**
     * Holat o'zgargani haqidagi hodisani qabul qiladi.
     * AFTER_COMMIT: faqat o'zgarish bazaga muvaffaqiyatli saqlangandan keyin ishlaydi,
     * shuning uchun sahifa yangilanganda baza allaqachon yangi holatni ko'rsatadi.
     *
     * @param event holat o'zgargani haqidagi hodisa
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onStatusChanged(OrderStatusChangedEvent event) {
        streamService.publish(event.trackingToken(), event.newStatus());
    }
}