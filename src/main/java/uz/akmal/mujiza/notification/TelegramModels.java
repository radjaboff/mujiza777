package uz.akmal.mujiza.notification;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Telegram Bot API javoblarining shakllari (faqat bizga kerak maydonlar).
 * @JsonIgnoreProperties(ignoreUnknown = true): Telegram yuboradigan, bizga kerak bo'lmagan maydonlar e'tiborsiz qoldiriladi.
 */
public final class TelegramModels {

    /**
     * Obyekt yaratishni taqiqlaydi: klass faqat ichki shakllarni (record) saqlash uchun.
     */
    private TelegramModels() {
    }

    /**
     * getUpdates so'rovining javobi: yangi hodisalar ro'yxati.
     *
     * @param ok     so'rov muvaffaqiyatli bo'ldimi
     * @param result yangi hodisalar (bo'sh bo'lishi mumkin)
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record UpdatesResponse(boolean ok, List<Update> result) {
    }

    /**
     * Bitta hodisa. Tugma bosilishi (callback_query) yoki yangi xabar (message).
     *
     * @param updateId      hodisaning tartib raqami (keyingi so'rovda "shundan keyingisini ber" deyish uchun)
     * @param callbackQuery tugma bosilgan bo'lsa, shu haqida ma'lumot (aks holda null)
     * @param message       yangi xabar kelgan bo'lsa, shu haqida ma'lumot (aks holda null)
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Update(@JsonProperty("update_id") long updateId,
                         @JsonProperty("callback_query") CallbackQuery callbackQuery,
                         @JsonProperty("message") Message message) {
        public Update(long updateId, CallbackQuery callbackQuery) {
            this(updateId, callbackQuery, null);
        }
    }

    /**
     * Tugma bosilishi haqida ma'lumot.
     *
     * @param id      bosilishning noyob raqami (javob qaytarish uchun kerak)
     * @param from    tugmani bosgan odam
     * @param message tugma joylashgan xabar
     * @param data    tugmaga yashirilgan ma'lumot (masalan, "go:12:CONFIRMED")
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CallbackQuery(String id, User from, Message message, String data) {
    }

    /**
     * Telegram foydalanuvchisi.
     *
     * @param id        foydalanuvchining Telegram raqami
     * @param username  foydalanuvchi nomi (@siz, bo'lmasligi mumkin)
     * @param firstName ismi
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record User(long id, String username, @JsonProperty("first_name") String firstName) {
    }

    /**
     * Xabar haqida ma'lumot.
     *
     * @param messageId xabarning raqami (uni tahrirlash uchun kerak)
     * @param chat      xabar joylashgan chat
     * @param text      xabar matni
     * @param from      xabarni yuborgan foydalanuvchi
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Message(@JsonProperty("message_id") long messageId,
                          Chat chat,
                          String text,
                          User from) {
        public Message(long messageId, Chat chat) {
            this(messageId, chat, null, null);
        }
    }

    /**
     * Chat (shaxsiy chat yoki guruh).
     *
     * @param id chatning raqami
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Chat(long id) {
    }
}
