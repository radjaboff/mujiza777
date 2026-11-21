package uz.akmal.mujiza.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import uz.akmal.mujiza.catering.event.CateringCreatedEvent;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Yangi keytering so'rovi kelganda do'konga Telegram xabarini yuboradi.
 * AFTER_COMMIT: faqat so'rov bazaga saqlangandan keyin; @Async: alohida oqimda.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TelegramCateringListener {

    /**
     * Sana ko'rinishi, masalan "30.10.2026".
     */
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    /**
     * Telegram'ga yuboruvchi.
     */
    private final TelegramClient telegramClient;

    /**
     * Yangi so'rov haqida xabar yuboradi.
     *
     * @param event yangi keytering so'rovi hodisasi
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onCreated(CateringCreatedEvent event) {
        if (!telegramClient.isEnabled()) {
            return;
        }
        try {
            StringBuilder sb = new StringBuilder();
            sb.append("🎉 <b>Yangi keytering so'rovi #").append(event.id()).append("</b>\n\n");
            sb.append("👤 ").append(escape(event.name())).append('\n');
            sb.append("📞 ").append(escape(event.phone())).append("\n\n");
            sb.append("🎊 Tadbir: ").append(escape(event.eventType())).append('\n');
            sb.append("📅 Sana: ").append(event.eventDate().format(DATE_FORMAT)).append('\n');
            sb.append("👥 Mehmonlar: ").append(event.guestCount()).append('\n');
            if (event.budget() != null) {
                sb.append("💰 Byudjet: ").append(formatMoney(event.budget())).append(" so'm\n");
            }
            if (event.comment() != null) {
                sb.append("💬 ").append(escape(event.comment())).append('\n');
            }
            telegramClient.sendToAdmin(sb.toString());
        } catch (RuntimeException e) {
            log.warn("Keytering xabarini tayyorlab bo'lmadi: {}", e.getMessage());
        }
    }

    /**
     * Yordamchi metod: matndagi maxsus belgilarni (& < >) tozalaydi (Telegram HTML rejimi buzilmasligi uchun).
     *
     * @param text mijoz kiritgan matn (null bo'lishi mumkin)
     * @return xavfsiz matn
     */
    private String escape(String text) {
        if (text == null) {
            return "";
        }
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    /**
     * Yordamchi metod: summani o'qishga qulay ko'rinishga keltiradi (masalan, 5000000 -> "5 000 000").
     *
     * @param amount summa, so'mda
     * @return bo'sh joy bilan ajratilgan summa
     */
    private String formatMoney(long amount) {
        return String.format(Locale.US, "%,d", amount).replace(',', ' ');
    }
}