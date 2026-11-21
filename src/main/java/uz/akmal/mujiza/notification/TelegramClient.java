package uz.akmal.mujiza.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.net.http.HttpClient;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Telegram Bot API bilan ishlaydigan klass: xabar yuborish, rasm yuborish, tahrirlash, tugma bosilishini qabul qilish.
 * Xatolik bo'lsa (internet yo'q, token noto'g'ri) dastur to'xtamaydi, faqat logga yoziladi.
 * Token logga hech qachon chiqmaydi.
 *
 * @Component: Spring bu klassdan o'zi bitta obyekt yaratib, kerakli joyga beradi.
 */
@Slf4j
@Component
public class TelegramClient {

    /**
     * Telegram serverining manzili.
     */
    private static final String API_BASE = "https://api.telegram.org";

    /**
     * Telegram yoqilganmi va to'liq sozlanganmi (token va chat id berilgan).
     */
    private final boolean enabled;

    /**
     * Botning tokeni (xatolarni logga yozishdan oldin yashirish uchun saqlanadi).
     */
    private final String botToken;

    /**
     * Xabar boradigan chat (shaxsiy chat yoki guruh) raqami.
     */
    private final String chatId;

    /**
     * Rasmlar saqlanadigan papka yo'li (namuna rasmlarni Telegram'ga yuborish uchun).
     */
    private final String storagePath;

    /**
     * Telegram serveriga so'rov yuboruvchi. Sozlanmagan bo'lsa null.
     */
    private final RestClient restClient;

    /**
     * Yangi hodisalarni so'rash hozir xatoga uchrayaptimi (bir xil xatoni logga qayta-qayta yozmaslik uchun).
     */
    private final AtomicBoolean pollFailing = new AtomicBoolean(false);

    /**
     * Konstruktor: sozlamalarni tekshiradi va ulanishni tayyorlaydi.
     *
     * @param requested   sozlamada Telegram yoqilganmi (app.telegram.enabled)
     * @param botToken    bot tokeni (app.telegram.bot-token)
     * @param chatId      xabar boradigan chat (app.telegram.admin-chat-id)
     * @param storagePath rasmlar saqlanadigan joy (app.storage.local.path)
     */
    public TelegramClient(@Value("${app.telegram.enabled:false}") boolean requested,
                          @Value("${app.telegram.bot-token:}") String botToken,
                          @Value("${app.telegram.admin-chat-id:}") String chatId,
                          @Value("${app.storage.local.path:./uploads}") String storagePath) {
        boolean configured = !botToken.isBlank() && !chatId.isBlank();
        if (requested && !configured) {
            log.warn("Telegram yoqilgan, lekin TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID berilmagan: xabarlar yuborilmaydi");
        }
        this.enabled = requested && configured;
        this.botToken = botToken.trim();
        this.chatId = chatId.trim();
        this.storagePath = storagePath;

        if (this.enabled) {
            // Ulanish 5 soniyada, javob 10 soniyada kelmasa kutishni to'xtatamiz (oqim osilib qolmasligi uchun)
            HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
            JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);
            factory.setReadTimeout(Duration.ofSeconds(10));
            this.restClient = RestClient.builder()
                    .baseUrl(API_BASE + "/bot" + this.botToken)
                    .requestFactory(factory)
                    .build();
        } else {
            this.restClient = null;
        }
        log.info("Telegram bildirishnomalari: {}", this.enabled ? "yoqilgan" : "o'chirilgan");
    }

    /**
     * Telegram yoqilgan va tayyormi, shuni aytadi.
     *
     * @return tayyor bo'lsa true
     */
    public boolean isEnabled() {
        return enabled;
    }

    /**
     * Berilgan chat do'konning ishchi chati ekanini tekshiradi (tugmalarni faqat shu chatdan bosish mumkin).
     *
     * @param chat tekshiriladigan chat raqami
     * @return do'konning chati bo'lsa true
     */
    public boolean isAdminChat(long chat) {
        return enabled && Long.toString(chat).equals(chatId);
    }

    /**
     * Do'kon chatiga tugmasiz xabar yuboradi.
     *
     * @param htmlText xabar matni (HTML)
     */
    public void sendToAdmin(String htmlText) {
        sendToAdmin(htmlText, null);
    }

    /**
     * Berilgan aniq chatga xabar yuboradi, ixtiyoriy ravishda tugmalar bilan.
     *
     * @param targetChatId qaysi chatga yuborilishi
     * @param htmlText     xabar matni
     * @param replyMarkup  tugmalar (bo'lmasa null)
     */
    public void sendMessage(long targetChatId, String htmlText, Map<String, Object> replyMarkup) {
        if (!enabled) {
            return;
        }
        Map<String, Object> body = new HashMap<>();
        body.put("chat_id", targetChatId);
        body.put("text", htmlText);
        body.put("parse_mode", "HTML");
        body.put("disable_web_page_preview", true);
        if (replyMarkup != null) {
            body.put("reply_markup", replyMarkup);
        }
        post("sendMessage", body);
    }

    /**
     * Do'kon chatiga xabar yuboradi, ixtiyoriy ravishda tugmalar bilan.
     * Matn HTML ko'rinishida bo'lishi mumkin (<b>, <i>, <code>, <a>).
     * Xatolik chiqsa, istisno tashlanmaydi: faqat logga yoziladi.
     *
     * @param htmlText    xabar matni (foydalanuvchi kiritgan matnlar oldindan tozalangan bo'lishi kerak)
     * @param replyMarkup xabar ostidagi tugmalar (bo'lmasa null)
     */
    public void sendToAdmin(String htmlText, Map<String, Object> replyMarkup) {
        if (!enabled) {
            return;
        }
        try {
            sendMessage(Long.parseLong(chatId), htmlText, replyMarkup);
        } catch (NumberFormatException e) {
            Map<String, Object> body = new HashMap<>();
            body.put("chat_id", chatId);
            body.put("text", htmlText);
            body.put("parse_mode", "HTML");
            body.put("disable_web_page_preview", true);
            if (replyMarkup != null) {
                body.put("reply_markup", replyMarkup);
            }
            post("sendMessage", body);
        }
    }

    /**
     * Do'kon chatiga rasm yuboradi (mijoz yuklagan namuna rasm yoki mahsulot rasmi).
     * Agar internet havolasi (http:// yoki https://) bo'lsa, URL orqali yuboradi.
     * Agar lokal fayl (/uploads/...) bo'lsa, fayl baytlarini multipart orqali yuklab yuboradi.
     *
     * @param photoUrlOrPath rasm havolasi yoki lokal manzili
     * @param caption        rasm ostidagi qisqa tavsif (HTML)
     */
    public void sendPhotoToAdmin(String photoUrlOrPath, String caption) {
        if (!enabled || photoUrlOrPath == null || photoUrlOrPath.isBlank()) {
            return;
        }
        try {
            if (photoUrlOrPath.startsWith("http://") || photoUrlOrPath.startsWith("https://")) {
                Map<String, Object> body = new HashMap<>();
                body.put("chat_id", chatId);
                body.put("photo", photoUrlOrPath);
                if (caption != null && !caption.isBlank()) {
                    body.put("caption", caption);
                    body.put("parse_mode", "HTML");
                }
                post("sendPhoto", body);
                return;
            }

            // Mahalliy saqlangan fayl (/uploads/cakes/...)
            String rel = photoUrlOrPath;
            if (rel.startsWith("/uploads/")) {
                rel = rel.substring("/uploads/".length());
            } else if (rel.startsWith("uploads/")) {
                rel = rel.substring("uploads/".length());
            }
            Path filePath = Paths.get(storagePath).resolve(rel).toAbsolutePath().normalize();
            if (Files.exists(filePath) && Files.isRegularFile(filePath)) {
                byte[] bytes = Files.readAllBytes(filePath);
                MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
                parts.add("chat_id", chatId);
                if (caption != null && !caption.isBlank()) {
                    parts.add("caption", caption);
                    parts.add("parse_mode", "HTML");
                }
                parts.add("photo", new ByteArrayResource(bytes) {
                    @Override
                    public String getFilename() {
                        return filePath.getFileName().toString();
                    }
                });
                restClient.post()
                        .uri("/sendPhoto")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .body(parts)
                        .retrieve()
                        .toBodilessEntity();
                log.info("Telegram'ga namuna rasm muvaffaqiyatli yuborildi: {}", filePath.getFileName());
            } else {
                log.warn("Telegram'ga rasm yuborishda fayl diskda topilmadi: {}", filePath);
            }
        } catch (Exception e) {
            log.warn("Telegram'ga rasm yuborib bo'lmadi: {}", hideToken(e.getMessage()));
        }
    }

    /**
     * Mavjud xabarning matni va tugmalarini almashtiradi (tugma bosilgandan keyin holatni ko'rsatish uchun).
     *
     * @param chat        xabar joylashgan chat raqami
     * @param messageId   xabarning raqami
     * @param htmlText    yangi matn (HTML)
     * @param replyMarkup yangi tugmalar (null bo'lsa tugmalar olib tashlanadi)
     */
    public void editMessage(long chat, long messageId, String htmlText, Map<String, Object> replyMarkup) {
        if (!enabled) {
            return;
        }
        Map<String, Object> body = new HashMap<>();
        body.put("chat_id", chat);
        body.put("message_id", messageId);
        body.put("text", htmlText);
        body.put("parse_mode", "HTML");
        body.put("disable_web_page_preview", true);
        // Bo'sh tugmalar ro'yxati tugmalarni olib tashlaydi
        body.put("reply_markup", replyMarkup != null ? replyMarkup : Map.of("inline_keyboard", List.of()));
        post("editMessageText", body);
    }

    /**
     * Tugma bosilishiga javob beradi: bosgan odamga qisqa xabar ko'rsatiladi va tugmadagi "yuklanmoqda" belgisi yo'qoladi.
     *
     * @param callbackId bosilishning noyob raqami
     * @param text       ko'rsatiladigan qisqa matn (bo'sh bo'lishi mumkin)
     * @param alert      true bo'lsa oyna ko'rinishida (OK bilan), false bo'lsa tepada qisqa xabar
     */
    public void answerCallback(String callbackId, String text, boolean alert) {
        if (!enabled) {
            return;
        }
        Map<String, Object> body = new HashMap<>();
        body.put("callback_query_id", callbackId);
        body.put("text", text);
        body.put("show_alert", alert);
        post("answerCallbackQuery", body);
    }

    /**
     * Telegram'dan yangi tugma bosilishlarini so'raydi (qisqa so'rov: bor narsani darrov beradi).
     * Aloqa xatosi bo'lsa bo'sh ro'yxat qaytaradi. Xato logga faqat birinchi marta yoziladi (har soniyada to'lib ketmasligi uchun).
     *
     * @param offset shu raqamdan boshlab hodisalarni so'raydi (oldingi ko'rilganlarni qayta bermaydi)
     * @return yangi hodisalar ro'yxati
     */
    public List<TelegramModels.Update> getUpdates(long offset) {
        if (!enabled) {
            return List.of();
        }
        try {
            TelegramModels.UpdatesResponse response = restClient.post()
                    .uri("/getUpdates")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "offset", offset,
                            "timeout", 0,
                            "allowed_updates", List.of("callback_query")))
                    .retrieve()
                    .body(TelegramModels.UpdatesResponse.class);
            // Aloqa tiklangan bo'lsa, bir marta xabar beramiz
            if (pollFailing.compareAndSet(true, false)) {
                log.info("Telegram bilan aloqa tiklandi");
            }
            return response == null || response.result() == null ? List.of() : response.result();
        } catch (RestClientResponseException e) {
            logPollFailure("status=" + e.getStatusCode().value() + ", javob=" + e.getResponseBodyAsString());
            return List.of();
        } catch (RestClientException e) {
            logPollFailure(hideToken(e.getMessage()));
            return List.of();
        }
    }

    /**
     * Yordamchi metod: Telegram'ga POST so'rov yuboradi. Xatolik bo'lsa istisno tashlamaydi, faqat logga yozadi.
     *
     * @param method Telegram metodining nomi (masalan, "sendMessage")
     * @param body   so'rov tanasi
     */
    private void post(String method, Map<String, Object> body) {
        try {
            restClient.post()
                    .uri("/" + method)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException e) {
            String response = e.getResponseBodyAsString();
            // "Xabar o'zgarmagan" xatosi zararsiz (xuddi shu matn qayta yuborilgan), uni jim o'tkazamiz
            if (response != null && response.contains("message is not modified")) {
                log.debug("Telegram: xabar o'zgarmagan ({})", method);
                return;
            }
            log.warn("Telegram {} so'rovini qabul qilmadi: status={}, javob={}",
                    method, e.getStatusCode().value(), response);
        } catch (RestClientException e) {
            // Aloqa muammosi (internet yo'q yoki vaqt tugadi). Xato matnida token bo'lishi mumkin, shuning uchun yashiramiz
            log.warn("Telegram bilan bog'lanib bo'lmadi ({}): {}", method, hideToken(e.getMessage()));
        }
    }

    /**
     * Yordamchi metod: yangi hodisalarni so'rashdagi xatoni logga yozadi, lekin faqat birinchi marta.
     *
     * @param details xato haqida qisqa ma'lumot
     */
    private void logPollFailure(String details) {
        if (pollFailing.compareAndSet(false, true)) {
            log.warn("Telegram'dan tugma bosilishlarini olib bo'lmayapti: {}", details);
        }
    }

    /**
     * Yordamchi metod: matn ichidan bot tokenini yashiradi (xatolarni logga xavfsiz yozish uchun).
     *
     * @param message asl matn
     * @return token "***" bilan almashtirilgan matn
     */
    private String hideToken(String message) {
        if (message == null) {
            return "";
        }
        return message.replace(botToken, "***");
    }
}
