package uz.akmal.mujiza.notification;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import uz.akmal.mujiza.common.exception.BusinessException;
import uz.akmal.mujiza.common.exception.ResourceNotFoundException;
import uz.akmal.mujiza.order.dto.OrderResponse;
import uz.akmal.mujiza.order.dto.OrderStatusUpdateRequest;
import uz.akmal.mujiza.order.enums.OrderStatus;
import uz.akmal.mujiza.order.service.OrderService;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Telegram'dagi buyurtma xabari ostidagi tugma bosilganda nima qilishni hal qiladi:
 * keyingi holatga o'tkazadi, bekor qilishni tasdiqlashni so'raydi yoki xabarni yangilaydi.
 * Tugmalarni faqat do'konning ishchi chatidan bosish mumkin, boshqa joydan bosilsa rad etiladi.
 */
@Slf4j
@Component
public class TelegramCallbackHandler {

    /**
     * Tarixga yoziladigan nomning eng uzun qismi (bazadagi changed_by ustuni 50 belgigacha).
     */
    private static final int MAX_CHANGED_BY_LENGTH = 50;

    /**
     * Do'kon Telegram orqali bekor qilganda yoziladigan sabab.
     */
    private static final String CANCEL_NOTE = "Do'kon bekor qildi (Telegram orqali)";

    /**
     * Telegram bilan ishlovchi.
     */
    private final TelegramClient telegramClient;

    /**
     * Buyurtmalar bilan ishlash qoidalari (admin paneldagi bilan bir xil: bir xil tekshiruvlar ishlaydi).
     */
    private final OrderService orderService;

    /**
     * Xabar matnini tayyorlovchi.
     */
    private final OrderNotificationMessageBuilder messageBuilder;

    /**
     * Sozlangan chat guruhmi (guruh id manfiy).
     */
    private final boolean groupChat;

    /**
     * Guruhda tugma bosishi mumkin bo'lgan Telegram foydalanuvchilari. Shaxsiy chatda ishlatilmaydi.
     */
    private final Set<Long> allowedUserIds;

    /**
     * Konstruktor: guruh chatida ruxsat etilgan foydalanuvchilar ro'yxatini o'qiydi.
     *
     * @param telegramClient  Telegram bilan ishlovchi
     * @param orderService    buyurtmalar bilan ishlash qoidalari
     * @param messageBuilder  xabar matnini tayyorlovchi
     * @param adminChatId     do'kon chati (app.telegram.admin-chat-id)
     * @param allowedUserIds  vergul bilan yozilgan Telegram user id lar (app.telegram.allowed-user-ids)
     */
    public TelegramCallbackHandler(TelegramClient telegramClient,
                                   OrderService orderService,
                                   OrderNotificationMessageBuilder messageBuilder,
                                   @Value("${app.telegram.admin-chat-id:}") String adminChatId,
                                   @Value("${app.telegram.allowed-user-ids:}") String allowedUserIds) {
        this.telegramClient = telegramClient;
        this.orderService = orderService;
        this.messageBuilder = messageBuilder;
        this.groupChat = isNegativeChatId(adminChatId);
        this.allowedUserIds = parseUserIds(allowedUserIds);
    }

    /**
     * Guruh sozlangan, lekin ruxsat etilgan foydalanuvchilar yo'q bo'lsa, tugmalar ishlamaydi.
     * Xabar yuborish bundan mustaqil va davom etadi.
     */
    @PostConstruct
    void warnWhenGroupHasNoAllowlist() {
        if (groupChat && allowedUserIds.isEmpty()) {
            log.error("TELEGRAM_CHAT_ID guruh, lekin TELEGRAM_ALLOWED_USER_IDS bo'sh: tugmalar qabul qilinmaydi");
        }
    }

    /**
     * Bosilgan tugmani qayta ishlaydi.
     *
     * @param callback tugma bosilishi haqida Telegram yuborgan ma'lumot
     */
    public void handle(TelegramModels.CallbackQuery callback) {
        // Bosilishning raqami bo'lmasa, javob qaytarib bo'lmaydi
        if (callback == null || callback.id() == null) {
            return;
        }
        // Faqat do'konning ishchi chatidan bosilgan tugmalar qabul qilinadi
        if (callback.message() == null || callback.message().chat() == null
                || !telegramClient.isAdminChat(callback.message().chat().id())
                || !callerAllowed(callback.from())) {
            telegramClient.answerCallback(callback.id(), "Sizda bu amal uchun ruxsat yo'q", true);
            return;
        }

        long chatId = callback.message().chat().id();
        long messageId = callback.message().messageId();

        // Tugmadagi yashirin ma'lumotni ajratamiz: "go:12:CONFIRMED" -> amal, buyurtma raqami, qo'shimcha
        String[] parts = callback.data() == null ? new String[0] : callback.data().split(":");
        Long orderId = parseOrderId(parts);
        if (orderId == null) {
            telegramClient.answerCallback(callback.id(), "Noto'g'ri tugma", true);
            return;
        }
        String action = parts[0];
        String changedBy = changedByOf(callback.from());

        try {
            switch (action) {
                // Keyingi holatga o'tkazish
                case OrderTelegramKeyboards.ACTION_GO -> {
                    OrderStatus target = OrderStatus.valueOf(parts[2]);
                    orderService.updateStatus(orderId, new OrderStatusUpdateRequest(target, null), changedBy);
                    refresh(chatId, messageId, orderId, false);
                    telegramClient.answerCallback(callback.id(), "✅ Holat yangilandi", false);
                }
                // Bekor qilishni tasdiqlashni so'rash (buyurtma hali o'zgarmaydi)
                case OrderTelegramKeyboards.ACTION_ASK_CANCEL -> {
                    refresh(chatId, messageId, orderId, true);
                    telegramClient.answerCallback(callback.id(), "Bekor qilishni tasdiqlang", false);
                }
                // Bekor qilish tasdiqlandi
                case OrderTelegramKeyboards.ACTION_CANCEL -> {
                    orderService.updateStatus(orderId,
                            new OrderStatusUpdateRequest(OrderStatus.CANCELLED, CANCEL_NOTE), changedBy);
                    refresh(chatId, messageId, orderId, false);
                    telegramClient.answerCallback(callback.id(), "Buyurtma bekor qilindi", false);
                }
                // Bekor qilmaslik: oldingi tugmalarga qaytish
                case OrderTelegramKeyboards.ACTION_BACK -> {
                    refresh(chatId, messageId, orderId, false);
                    telegramClient.answerCallback(callback.id(), "", false);
                }
                default -> telegramClient.answerCallback(callback.id(), "Noto'g'ri tugma", true);
            }
        } catch (BusinessException e) {
            // Masalan, buyurtma allaqachon boshqa joydan o'zgartirilgan: sababini ko'rsatamiz va xabarni haqiqiy holatga keltiramiz
            telegramClient.answerCallback(callback.id(), e.getMessage(), true);
            refreshQuietly(chatId, messageId, orderId);
        } catch (ResourceNotFoundException e) {
            telegramClient.answerCallback(callback.id(), "Buyurtma topilmadi", true);
        } catch (RuntimeException e) {
            log.error("Telegram tugmasini qayta ishlashda xato: data={}", callback.data(), e);
            telegramClient.answerCallback(callback.id(), "Xatolik yuz berdi, birozdan keyin urinib ko'ring", true);
        }
    }

    /**
     * Yordamchi metod: tugma ma'lumotidan buyurtma raqamini oladi.
     *
     * @param parts tugma ma'lumotining bo'laklari
     * @return buyurtma raqami (noto'g'ri bo'lsa null)
     */
    /**
     * Guruhda faqat ro'yxatdagi foydalanuvchi tugmani bosadi. Shaxsiy chatda ro'yxat tekshirilmaydi.
     *
     * @param user tugmani bosgan foydalanuvchi
     * @return ruxsat bo'lsa true
     */
    private boolean callerAllowed(TelegramModels.User user) {
        if (!groupChat) {
            return true;
        }
        return user != null && allowedUserIds.contains(user.id());
    }

    private static boolean isNegativeChatId(String adminChatId) {
        if (adminChatId == null || adminChatId.isBlank()) {
            return false;
        }
        try {
            return Long.parseLong(adminChatId.trim()) < 0;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private static Set<Long> parseUserIds(String raw) {
        Set<Long> ids = new HashSet<>();
        if (raw == null || raw.isBlank()) {
            return ids;
        }
        for (String part : raw.split(",")) {
            String token = part.trim();
            if (token.isEmpty()) {
                continue;
            }
            try {
                ids.add(Long.parseLong(token));
            } catch (NumberFormatException e) {
                log.error("TELEGRAM_ALLOWED_USER_IDS dagi qiymat son emas: {}", token);
            }
        }
        return ids;
    }

    private Long parseOrderId(String[] parts) {
        if (parts.length < 2) {
            return null;
        }
        try {
            return Long.valueOf(parts[1]);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * Yordamchi metod: tugmani bosgan odamdan tarixga yoziladigan nomni yasaydi (masalan, "telegram:@akmal").
     *
     * @param user tugmani bosgan Telegram foydalanuvchisi (null bo'lishi mumkin)
     * @return tarixga yoziladigan nom (50 belgidan oshmaydi)
     */
    private String changedByOf(TelegramModels.User user) {
        String name = "telegram";
        if (user != null) {
            if (user.username() != null && !user.username().isBlank()) {
                name = "telegram:@" + user.username();
            } else if (user.firstName() != null && !user.firstName().isBlank()) {
                name = "telegram:" + user.firstName();
            }
        }
        return name.length() > MAX_CHANGED_BY_LENGTH ? name.substring(0, MAX_CHANGED_BY_LENGTH) : name;
    }

    /**
     * Yordamchi metod: Telegram'dagi xabarni buyurtmaning haqiqiy holati bo'yicha qayta yozadi
     * (matn, holat qatori va mos tugmalar).
     *
     * @param chatId        xabar joylashgan chat
     * @param messageId     xabarning raqami
     * @param orderId       buyurtmaning raqami
     * @param confirmCancel true bo'lsa, tugmalar o'rniga "bekor qilishni tasdiqlash" tugmalari ko'rsatiladi
     */
    private void refresh(long chatId, long messageId, Long orderId, boolean confirmCancel) {
        OrderResponse order = orderService.getById(orderId);
        // Yakunlangan buyurtmada bekor qilish tasdig'i ma'nosiz: oddiy holat (tugmasiz) ko'rsatiladi
        Map<String, Object> keyboard = confirmCancel && !order.status().isFinal()
                ? OrderTelegramKeyboards.confirmCancel(orderId)
                : OrderTelegramKeyboards.forOrder(orderId, order.status(), order.orderType());
        telegramClient.editMessage(chatId, messageId, messageBuilder.buildOrderMessageWithStatus(orderId), keyboard);
    }

    /**
     * Yordamchi metod: xabarni yangilashga urinadi, xato bo'lsa jim o'tkazadi
     * (asosiy xatoning javobi allaqachon berilgan, qo'shimcha xato chiqmasligi kerak).
     *
     * @param chatId    xabar joylashgan chat
     * @param messageId xabarning raqami
     * @param orderId   buyurtmaning raqami
     */
    private void refreshQuietly(long chatId, long messageId, Long orderId) {
        try {
            refresh(chatId, messageId, orderId, false);
        } catch (RuntimeException e) {
            log.debug("Telegram xabarini yangilab bo'lmadi: {}", e.getMessage());
        }
    }
}