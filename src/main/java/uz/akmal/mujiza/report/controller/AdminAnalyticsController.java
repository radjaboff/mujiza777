package uz.akmal.mujiza.report.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uz.akmal.mujiza.report.dto.AnalyticsSummaryResponse;
import uz.akmal.mujiza.report.dto.DailyPointResponse;
import uz.akmal.mujiza.report.dto.HourPointResponse;
import uz.akmal.mujiza.report.dto.TopProductResponse;
import uz.akmal.mujiza.report.service.AnalyticsService;

import java.time.LocalDate;
import java.util.List;

/**
 * Admin dashboard uchun statistika endpoint'lari. Faqat ADMIN roli (tushum ma'lumoti: SecurityConfig'da belgilanadi).
 * Hamma endpoint'da davr ixtiyoriy: berilmasa oxirgi 30 kun olinadi, sana formati YYYY-MM-DD.
 */
@RestController
@RequestMapping("/api/admin/analytics")
@Tag(name = "Statistika (admin)")
@RequiredArgsConstructor
public class AdminAnalyticsController {

    /**
     * Statistika bo'yicha biznes mantiq.
     */
    private final AnalyticsService analyticsService;

    /**
     * Umumiy ko'rsatkichlar va oldingi davr bilan taqqoslash.
     * Manzil: GET /api/admin/analytics/summary?from=2026-10-01&to=2026-10-31
     *
     * @param from davr boshi (ixtiyoriy)
     * @param to   davr oxiri (ixtiyoriy)
     * @return umumiy statistika
     */
    @GetMapping("/summary")
    @Operation(summary = "Umumiy statistika")
    public AnalyticsSummaryResponse summary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return analyticsService.getSummary(from, to);
    }

    /**
     * Kunlar bo'yicha buyurtmalar va tushum. Manzil: GET /api/admin/analytics/daily
     *
     * @param from davr boshi (ixtiyoriy)
     * @param to   davr oxiri (ixtiyoriy)
     * @return kunlik nuqtalar
     */
    @GetMapping("/daily")
    @Operation(summary = "Kunlik statistika")
    public List<DailyPointResponse> daily(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return analyticsService.getDaily(from, to);
    }

    /**
     * Soatlar bo'yicha buyurtmalar. Manzil: GET /api/admin/analytics/hourly
     *
     * @param from davr boshi (ixtiyoriy)
     * @param to   davr oxiri (ixtiyoriy)
     * @return 24 ta soatlik nuqta
     */
    @GetMapping("/hourly")
    @Operation(summary = "Soatlik statistika")
    public List<HourPointResponse> hourly(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return analyticsService.getHourly(from, to);
    }

    /**
     * Eng ko'p sotilgan mahsulotlar. Manzil: GET /api/admin/analytics/top-products?limit=10
     *
     * @param from  davr boshi (ixtiyoriy)
     * @param to    davr oxiri (ixtiyoriy)
     * @param limit eng ko'p nechta mahsulot (standart 10, ko'pi bilan 50)
     * @return mahsulotlar ro'yxati
     */
    @GetMapping("/top-products")
    @Operation(summary = "Eng ko'p sotilgan mahsulotlar")
    public List<TopProductResponse> topProducts(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "10") int limit) {
        return analyticsService.getTopProducts(from, to, limit);
    }
}