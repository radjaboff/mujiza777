package uz.akmal.mujiza.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import uz.akmal.mujiza.report.dto.AnalyticsSummaryResponse;
import uz.akmal.mujiza.report.dto.TopProductResponse;
import uz.akmal.mujiza.report.service.AnalyticsService;
import uz.akmal.mujiza.report.service.VisitTracker;

import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

/**
 * Har kuni soat 22:00 da admin Telegram guruhiga kunlik savdo, buyurtmalar va
 * sayt tashriflari hisobotini avtomatik yuboruvchi xizmat.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TelegramDailyReportService {

    private static final ZoneId TASHKENT_ZONE = ZoneId.of("Asia/Tashkent");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("d-MMMM yyyy", new Locale("uz"));
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final TelegramClient telegramClient;
    private final AnalyticsService analyticsService;
    private final VisitTracker visitTracker;

    /**
     * Har kuni Toshkent vaqti bilan soat 22:00 da avtomatik ishga tushadi.
     */
    @Scheduled(cron = "${app.telegram.daily-report-cron:0 0 22 * * *}", zone = "Asia/Tashkent")
    public void sendScheduledDailyReport() {
        if (!telegramClient.isEnabled()) {
            log.debug("Telegram o'chirilgan, kunlik hisobot yuborilmadi");
            return;
        }
        log.info("Kunlik Telegram hisoboti tayyorlanmoqda va yuborilmoqda...");
        try {
            LocalDate today = LocalDate.now(TASHKENT_ZONE);
            String reportHtml = buildReportHtml(today);
            telegramClient.sendToAdmin(reportHtml);
            log.info("Kunlik Telegram hisoboti muvaffaqiyatli yuborildi");
        } catch (Exception e) {
            log.error("Kunlik hisobotni Telegram'ga yuborishda xatolik", e);
        }
    }

    /**
     * Hisobot HTML xabarini hosil qiladi.
     *
     * @param date qaysi sana bo'yicha hisobot
     * @return Telegram HTML formati
     */
    public String buildReportHtml(LocalDate date) {
        AnalyticsSummaryResponse summary = analyticsService.getSummary(date, date);
        List<TopProductResponse> topProducts = analyticsService.getTopProducts(date, date, 3);
        VisitTracker.VisitStats visitStats = visitTracker.getStats(date);

        String dateStr = date.format(DATE_FORMATTER);
        String timeStr = LocalTime.now(TASHKENT_ZONE).format(TIME_FORMATTER);

        StringBuilder sb = new StringBuilder();
        sb.append("📊 <b>MO‘JIZA 777 — KUNLIK SAVDO VA ANALITIKA</b>\n");
        sb.append("📅 <i>").append(dateStr).append(", soat ").append(timeStr).append(" holatiga</i>\n");
        sb.append("────────────────────────\n\n");

        sb.append("👥 <b>Tashrif buyuruvchilar:</b> ~").append(formatNumber(visitStats.uniqueVisitors())).append(" ta\n");
        sb.append("👀 <b>Ko‘rilgan sahifalar:</b> ~").append(formatNumber(visitStats.pageViews())).append(" ta\n");
        sb.append("🛒 <b>Savatga qo‘shildi:</b> ").append(formatNumber(visitStats.cartAdds())).append(" marta\n\n");

        sb.append("📦 <b>BUYURTMALAR VA SAVDO:</b>\n");
        sb.append("• Jami buyurtmalar: <b>").append(summary.ordersTotal()).append(" ta</b>\n");
        sb.append("  ├ ✅ Yakunlangan: <b>").append(summary.completed()).append(" ta</b>\n");
        sb.append("  ├ ⏳ Jarayonda / Faol: <b>").append(summary.active()).append(" ta</b>\n");
        sb.append("  └ ❌ Bekor qilingan: <b>").append(summary.cancelled()).append(" ta</b>\n");
        sb.append("• Jami savdo tushumi: <b>").append(formatNumber(summary.revenue())).append(" UZS</b>\n");
        sb.append("• O‘rtacha chek: <b>").append(formatNumber(summary.averageOrderValue())).append(" UZS</b>\n");
        if (summary.discountTotal() > 0) {
            sb.append("• Berilgan chegirmalar (promo): <b>").append(formatNumber(summary.discountTotal())).append(" UZS</b>\n");
        }
        sb.append("\n");

        sb.append("🚚 <b>BUYURTMA TURLARI:</b>\n");
        sb.append("• Yetkazib berish (dostavka): <b>").append(summary.deliveryOrders()).append(" ta</b>\n");
        sb.append("• Do‘kondan olib ketish: <b>").append(summary.pickupOrders()).append(" ta</b>\n");
        if (summary.cakeOrders() > 0) {
            sb.append("• Maxsus tort (Cake Builder): <b>").append(summary.cakeOrders()).append(" ta</b>\n");
        }
        if (summary.giftOrders() > 0) {
            sb.append("• Sovg‘a buyurtmalari: <b>").append(summary.giftOrders()).append(" ta</b>\n");
        }

        if (topProducts != null && !topProducts.isEmpty()) {
            sb.append("\n🏆 <b>BUGUNGI TOP-3 MAHSULOT:</b>\n");
            int rank = 1;
            for (TopProductResponse p : topProducts) {
                String unit = "KG".equalsIgnoreCase(p.unitType()) ? " kg" : " dona";
                sb.append(rank++).append(". ").append(escapeHtml(p.name()))
                        .append(" — ").append(p.quantity()).append(unit)
                        .append(" (").append(formatNumber(p.revenue())).append(" UZS)\n");
            }
        }

        sb.append("────────────────────────\n");
        sb.append("<i>Ertangi kuningiz bundan ham barakali bo‘lsin! ✨</i>");

        return sb.toString();
    }

    private String formatNumber(long number) {
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.US);
        symbols.setGroupingSeparator(' ');
        DecimalFormat df = new DecimalFormat("#,###", symbols);
        return df.format(number);
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }
}
