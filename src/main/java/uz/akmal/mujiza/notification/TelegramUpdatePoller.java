package uz.akmal.mujiza.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Telegram'dan yangi tugma bosilishlari va bot buyruqlarini doimiy so'rab turadi va ularni qayta ishlaydi.
 * Telegram yoqilmagan bo'lsa hech narsa qilmaydi.
 */
@Slf4j
@Component
public class TelegramUpdatePoller {

    private final TelegramClient telegramClient;
    private final TelegramCallbackHandler callbackHandler;
    private final TelegramDailyReportService dailyReportService;
    private final String webAppUrl;

    private final AtomicLong nextOffset = new AtomicLong(0);

    public TelegramUpdatePoller(TelegramClient telegramClient,
                                TelegramCallbackHandler callbackHandler,
                                TelegramDailyReportService dailyReportService,
                                @Value("${app.telegram.webapp-url:https://mujiza.uz}") String webAppUrl) {
        this.telegramClient = telegramClient;
        this.callbackHandler = callbackHandler;
        this.dailyReportService = dailyReportService;
        this.webAppUrl = webAppUrl;
    }

    /**
     * Har 1.5 soniyada yangi hodisalarni so'raydi va qayta ishlaydi.
     */
    @Scheduled(fixedDelay = 1500, initialDelay = 5000)
    public void poll() {
        if (!telegramClient.isEnabled()) {
            return;
        }
        for (TelegramModels.Update update : telegramClient.getUpdates(nextOffset.get())) {
            nextOffset.set(Math.max(nextOffset.get(), update.updateId() + 1));

            // 1. Tugma bosilishini qayta ishlash
            if (update.callbackQuery() != null) {
                try {
                    callbackHandler.handle(update.callbackQuery());
                } catch (RuntimeException e) {
                    log.error("Telegram hodisasini qayta ishlashda xato", e);
                }
            }

            // 2. Yangi xabar / buyruq kelganda
            if (update.message() != null && update.message().text() != null && update.message().chat() != null) {
                handleCommand(update.message());
            }
        }
    }

    private void handleCommand(TelegramModels.Message message) {
        String text = message.text().trim().toLowerCase();
        long chatId = message.chat().id();

        // 1. /start buyrug'i — Telegram WebApp (Mini App) ochish tugmasini beradi
        if (text.startsWith("/start")) {
            sendStartWelcome(chatId, message.from());
            return;
        }

        // 2. /bugun, /stats, /statistika buyrug'i — kunlik hisobotni chiqaradi
        if (text.startsWith("/bugun") || text.startsWith("/stats") || text.startsWith("/statistika") || text.startsWith("/hisobot")) {
            if (telegramClient.isAdminChat(chatId)) {
                log.info("Admin tomonidan '{}' buyrug'i yuborildi, hisobot jo'natilmoqda...", text);
                try {
                    dailyReportService.sendScheduledDailyReport();
                } catch (Exception e) {
                    log.error("Telegram buyrug'i hisobotini yuborishda xatolik", e);
                }
            }
        }
    }

    private void sendStartWelcome(long chatId, TelegramModels.User from) {
        String name = from != null && from.firstName() != null ? from.firstName() : "Qadrli mijoz";
        String welcomeText = "🍰 <b>Assalomu alaykum, " + escapeHtml(name) + "!</b>\n\n"
                + "<b>Mo‘jiza 777</b> qandolat uyining rasmiy botiga xush kelibsiz! ✨\n\n"
                + "Bizda 200 dan ortiq sara shirinliklar, to‘y va tug‘ilgan kun tortlari, "
                + "bento-tortlar, eklerlar va issiq kruassanlar mavjud.\n\n"
                + "Quyidagi <b>«🎂 Do‘konni ochish»</b> tugmasini bosing va "
                + "to‘g‘ridan-to‘g‘ri Telegram ichida qulay buyurtma bering! 👇";

        // WebApp ochish uchun tugmalar
        Map<String, Object> webAppButton = Map.of(
                "text", "🎂 Do‘konni ochish (Buyurtma berish)",
                "web_app", Map.of("url", webAppUrl)
        );

        Map<String, Object> inlineMarkup = Map.of(
                "inline_keyboard", List.of(
                        List.of(webAppButton),
                        List.of(
                                Map.of("text", "📍 Saytga o‘tish", "url", webAppUrl),
                                Map.of("text", "📞 Aloqa", "url", webAppUrl + "/contact")
                        )
                )
        );

        telegramClient.sendMessage(chatId, welcomeText, inlineMarkup);
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }
}
