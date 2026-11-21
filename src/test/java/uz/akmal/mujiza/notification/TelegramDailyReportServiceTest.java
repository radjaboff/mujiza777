package uz.akmal.mujiza.notification;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import uz.akmal.mujiza.report.dto.AnalyticsSummaryResponse;
import uz.akmal.mujiza.report.dto.TopProductResponse;
import uz.akmal.mujiza.report.service.AnalyticsService;
import uz.akmal.mujiza.report.service.VisitTracker;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.Mockito.*;

class TelegramDailyReportServiceTest {

    private final TelegramClient telegramClient = mock(TelegramClient.class);
    private final AnalyticsService analyticsService = mock(AnalyticsService.class);
    private final VisitTracker visitTracker = mock(VisitTracker.class);

    private final TelegramDailyReportService service =
            new TelegramDailyReportService(telegramClient, analyticsService, visitTracker);

    @Test
    @DisplayName("buildReportHtml generates clean formatted HTML with all key business metrics")
    void buildReportHtmlGeneratesCorrectStructure() {
        LocalDate today = LocalDate.of(2026, 11, 10);

        AnalyticsSummaryResponse summary = new AnalyticsSummaryResponse(
                today, today, 1, 28, 22, 2, 4,
                4_850_000L, 500_000L, 220_454L,
                7, 18, 3, 2, 140_000L, null
        );

        when(analyticsService.getSummary(today, today)).thenReturn(summary);
        when(analyticsService.getTopProducts(today, today, 3)).thenReturn(List.of(
                new TopProductResponse(101L, "Mo‘jiza 777 Maxsus Torti", "PIECE", java.math.BigDecimal.valueOf(8), 1_440_000L),
                new TopProductResponse(102L, "Qizil Baxmal", "KG", java.math.BigDecimal.valueOf(5), 725_000L)
        ));
        when(visitTracker.getStats(today)).thenReturn(new VisitTracker.VisitStats(1450, 5230, 86));

        String html = service.buildReportHtml(today);

        assertThat(html)
                .contains("MO‘JIZA 777 — KUNLIK SAVDO VA ANALITIKA")
                .contains("1 450")      // unique visitors formatted
                .contains("5 230")      // page views formatted
                .contains("86")         // cart adds
                .contains("28 ta")      // total orders
                .contains("22 ta")      // completed
                .contains("4 850 000")  // revenue formatted
                .contains("220 454")    // average order value
                .contains("140 000")    // discounts
                .contains("Mo‘jiza 777 Maxsus Torti");
    }

    @Test
    @DisplayName("sendScheduledDailyReport sends report when telegram is enabled")
    void sendScheduledDailyReportWhenEnabled() {
        LocalDate today = LocalDate.now();
        when(telegramClient.isEnabled()).thenReturn(true);
        AnalyticsSummaryResponse summary = new AnalyticsSummaryResponse(
                today, today, 1, 10, 8, 1, 1,
                1_000_000L, 100_000L, 125_000L,
                3, 7, 0, 0, 0L, null
        );
        when(analyticsService.getSummary(any(), any())).thenReturn(summary);
        when(visitTracker.getStats(any())).thenReturn(new VisitTracker.VisitStats(100, 250, 15));

        service.sendScheduledDailyReport();

        verify(telegramClient).sendToAdmin(contains("MO‘JIZA 777 — KUNLIK SAVDO VA ANALITIKA"));
    }

    @Test
    @DisplayName("sendScheduledDailyReport does not send when telegram is disabled")
    void sendScheduledDailyReportWhenDisabled() {
        when(telegramClient.isEnabled()).thenReturn(false);

        service.sendScheduledDailyReport();

        verify(telegramClient, never()).sendToAdmin(any());
    }
}
