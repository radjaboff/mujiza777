package uz.akmal.mujiza.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import uz.akmal.mujiza.order.enums.OrderStatus;
import uz.akmal.mujiza.order.enums.OrderType;
import uz.akmal.mujiza.order.event.OrderCreatedEvent;
import uz.akmal.mujiza.order.event.OrderStatusChangedEvent;

/**
 * Buyurtma hodisalarini tinglab, do'konga Telegram xabarini yuboradi.
 * AFTER_COMMIT: faqat buyurtma bazaga muvaffaqiyatli saqlangandan keyin ishlaydi.
 *
 * @Async: alohida oqimda ishlaydi, shuning uchun mijoz javobni kutmaydi va Telegram xatosi unga ta'sir qilmaydi.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TelegramOrderListener {

    /**
     * Tarixda "mijozning o'zi o'zgartirdi" deb yoziladigan nom.
     */
    private static final String CHANGED_BY_CUSTOMER = "customer";

    /**
     * Xabar matnini tayyorlovchi.
     */
    private final OrderNotificationMessageBuilder messageBuilder;

    /**
     * Telegram'ga yuboruvchi.
     */
    private final TelegramClient telegramClient;

    /**
     * Yangi buyurtma yaratilganda do'konga xabar yuboradi.
     * Tort buyurtmasida mijoz namuna rasm yuklagan bo'lsa, avval rasm yuboriladi.
     *
     * @param event yangi buyurtma hodisasi
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderCreated(OrderCreatedEvent event) {
        if (!telegramClient.isEnabled()) {
            return;
        }
        try {
            // 1) Agar tort buyurtmasi bo'lsa va namuna rasm yuklangan bo'lsa, avval rasmni to'liq sifatda yuboramiz
            String referenceImageUrl = messageBuilder.findReferenceImageUrl(event.orderId());
            if (referenceImageUrl != null && !referenceImageUrl.isBlank()) {
                String photoCaption = "📸 <b>Buyurtma " + event.orderNumber() + " uchun mijoz yuklagan namuna rasm:</b>";
                telegramClient.sendPhotoToAdmin(referenceImageUrl, photoCaption);
            }

            // 2) Buyurtma tafsilotlari kartochkasi va interaktiv boshqaruv tugmalari
            telegramClient.sendToAdmin(
                    messageBuilder.buildNewOrderMessage(event.orderId()),
                    OrderTelegramKeyboards.forOrder(event.orderId(), event.status(), OrderType.PICKUP));
        } catch (RuntimeException e) {
            log.warn("Yangi buyurtma xabarini tayyorlab bo'lmadi: {}", e.getMessage());
        }
    }

    /**
     * Holat o'zgarganda xabar yuboradi.
     * Agar o'zgarish Telegram tugmasi orqali qilingan bo'lsa, xabar allaqachon Telegram'da refresh() bo'lgan (qayta xabar shart emas).
     * Sayt admin panelidan o'zgartirilsa yoki mijoz bekor qilsa, do'kon chatiga yangilangan holat haqida ma'lumot boradi.
     *
     * @param event holat o'zgargani hodisasi
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onStatusChanged(OrderStatusChangedEvent event) {
        if (!telegramClient.isEnabled()) {
            return;
        }
        // Agar o'zgarish Telegram tugmasi orqali qilingan bo'lsa, Telegram xabari allaqachon refresh() qilingan
        if (event.changedBy() != null && event.changedBy().startsWith("telegram:")) {
            return;
        }
        try {
            if (event.newStatus() == OrderStatus.CANCELLED && CHANGED_BY_CUSTOMER.equals(event.changedBy())) {
                telegramClient.sendToAdmin(messageBuilder.buildCustomerCancelMessage(event.orderId()));
            } else {
                // Sayt admin panelidan o'zgartirilganda ham Telegram chatiga xabar beriladi
                telegramClient.sendToAdmin(messageBuilder.buildStatusChangeNotification(event));
            }
        } catch (RuntimeException e) {
            log.warn("Holat o'zgarishi xabarini tayyorlab bo'lmadi: {}", e.getMessage());
        }
    }
}
