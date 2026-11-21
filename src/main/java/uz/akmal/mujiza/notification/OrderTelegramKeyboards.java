package uz.akmal.mujiza.notification;

import uz.akmal.mujiza.order.enums.OrderStatus;
import uz.akmal.mujiza.order.enums.OrderType;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Buyurtma xabari ostidagi tugmalarni (inline keyboard) yasaydi.
 * Tugma ichidagi yashirin ma'lumot (callback data) formati:
 * "go:{buyurtma}:{holat}"  keyingi holatga o'tkazish
 * "ask:{buyurtma}"         bekor qilishni tasdiqlashni so'rash
 * "cancel:{buyurtma}"      bekor qilishni tasdiqlash
 * "back:{buyurtma}"        bekor qilmaslik, oldingi tugmalarga qaytish
 */
public final class OrderTelegramKeyboards {

    /** Keyingi holatga o'tkazish amali. */
    public static final String ACTION_GO = "go";
    /** Bekor qilishni tasdiqlashni so'rash amali. */
    public static final String ACTION_ASK_CANCEL = "ask";
    /** Bekor qilishni tasdiqlash amali. */
    public static final String ACTION_CANCEL = "cancel";
    /** Oldingi tugmalarga qaytish amali. */
    public static final String ACTION_BACK = "back";

    /**
     * Obyekt yaratishni taqiqlaydi (private konstruktor), klass faqat statik ishlatiladi.
     */
    private OrderTelegramKeyboards() {
    }

    /**
     * Buyurtmaning hozirgi holatiga mos tugmalarni yasaydi: keyingi bosqichga o'tkazish va bekor qilish.
     *
     * @param orderId buyurtmaning raqami
     * @param status  buyurtmaning hozirgi holati
     * @param type    buyurtma turi (olib ketish yoki yetkazib berish)
     * @return tugmalar (yakunlangan buyurtma uchun null: tugma kerak emas)
     */
    public static Map<String, Object> forOrder(Long orderId, OrderStatus status, OrderType type) {
        OrderStatus next = nextStatus(status, type);
        if (next == null) {
            return null;
        }
        List<List<Map<String, String>>> rows = new ArrayList<>();
        // 1-qator: keyingi bosqichga o'tkazish tugmasi
        String firstLabel = (status == OrderStatus.PRICE_PENDING || status == OrderStatus.NEW)
                ? "✅ Qabul qilish"
                : label(next);
        rows.add(List.of(button(firstLabel, ACTION_GO + ":" + orderId + ":" + next.name())));
        // 2-qator: bekor qilish tugmasi (bosilganda darrov emas, avval tasdiqlash so'raladi)
        rows.add(List.of(button("❌ Bekor qilish", ACTION_ASK_CANCEL + ":" + orderId)));
        return Map.of("inline_keyboard", rows);
    }

    /**
     * Bekor qilishni tasdiqlash tugmalarini yasaydi (tasodifan bosib yuborishdan himoya).
     *
     * @param orderId buyurtmaning raqami
     * @return "Ha, bekor qilish" va "Yo'q, qaytish" tugmalari
     */
    public static Map<String, Object> confirmCancel(Long orderId) {
        List<List<Map<String, String>>> rows = List.of(List.of(
                button("Ha, bekor qilish", ACTION_CANCEL + ":" + orderId),
                button("Yo'q, qaytish", ACTION_BACK + ":" + orderId)));
        return Map.of("inline_keyboard", rows);
    }

    /**
     * Holatdan keyingi bosqichni aniqlaydi.
     *
     * @param status hozirgi holat
     * @param type   buyurtma turi
     * @return keyingi holat (yakunlangan bo'lsa null)
     */
    public static OrderStatus nextStatus(OrderStatus status, OrderType type) {
        return switch (status) {
            case NEW, PRICE_PENDING -> OrderStatus.CONFIRMED;
            case CONFIRMED -> OrderStatus.PREPARING;
            case PREPARING -> OrderStatus.READY;
            case READY -> type == OrderType.DELIVERY ? OrderStatus.DELIVERING : OrderStatus.COMPLETED;
            case DELIVERING -> OrderStatus.COMPLETED;
            case COMPLETED, CANCELLED -> null;
        };
    }

    /**
     * Keyingi bosqichga o'tkazish tugmasining yozuvi.
     *
     * @param next o'tiladigan holat
     * @return tugma yozuvi
     */
    private static String label(OrderStatus next) {
        return switch (next) {
            case CONFIRMED -> "✅ Qabul qilish";
            case PREPARING -> "👨‍🍳 Tayyorlashni boshlash";
            case READY -> "🎂 Tayyor bo‘ldi";
            case DELIVERING -> "🚚 Yetkazilmoqda (Yo‘lga chiqdi)";
            case COMPLETED -> "🎉 Topshirildi (Yetkazildi)";
            default -> next.name();
        };
    }

    /**
     * Bitta tugma yasaydi.
     *
     * @param text         tugmadagi yozuv
     * @param callbackData tugma bosilganda bizga qaytadigan yashirin ma'lumot
     * @return tugma
     */
    private static Map<String, String> button(String text, String callbackData) {
        return Map.of("text", text, "callback_data", callbackData);
    }
}
