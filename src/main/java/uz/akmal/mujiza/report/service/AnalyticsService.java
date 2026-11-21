package uz.akmal.mujiza.report.service;

import uz.akmal.mujiza.report.dto.AnalyticsSummaryResponse;
import uz.akmal.mujiza.report.dto.DailyPointResponse;
import uz.akmal.mujiza.report.dto.HourPointResponse;
import uz.akmal.mujiza.report.dto.TopProductResponse;

import java.time.LocalDate;
import java.util.List;

/**
 * Admin statistikasi qoidalari. Davr berilmasa, oxirgi 30 kun olinadi; davr ko'pi bilan 366 kun.
 */
public interface AnalyticsService {

    /**
     * Davr bo'yicha umumiy ko'rsatkichlar va oldingi davr bilan taqqoslash.
     *
     * @param from davr boshi (ixtiyoriy)
     * @param to   davr oxiri (ixtiyoriy)
     * @return umumiy statistika
     */
    AnalyticsSummaryResponse getSummary(LocalDate from, LocalDate to);

    /**
     * Kunlar bo'yicha buyurtmalar va tushum (buyurtma bo'lmagan kunlar nol bilan to'ldiriladi).
     *
     * @param from davr boshi (ixtiyoriy)
     * @param to   davr oxiri (ixtiyoriy)
     * @return kunlik nuqtalar
     */
    List<DailyPointResponse> getDaily(LocalDate from, LocalDate to);

    /**
     * Soatlar bo'yicha buyurtmalar (0 dan 23 gacha, har doim 24 ta nuqta).
     *
     * @param from davr boshi (ixtiyoriy)
     * @param to   davr oxiri (ixtiyoriy)
     * @return soatlik nuqtalar
     */
    List<HourPointResponse> getHourly(LocalDate from, LocalDate to);

    /**
     * Eng ko'p sotilgan mahsulotlar.
     *
     * @param from  davr boshi (ixtiyoriy)
     * @param to    davr oxiri (ixtiyoriy)
     * @param limit eng ko'p nechta mahsulot (1 dan 50 gacha)
     * @return mahsulotlar ro'yxati
     */
    List<TopProductResponse> getTopProducts(LocalDate from, LocalDate to, int limit);
}