package uz.akmal.mujiza.report.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.akmal.mujiza.common.exception.BusinessException;
import uz.akmal.mujiza.common.ShopTime;
import uz.akmal.mujiza.report.dto.AnalyticsSummaryResponse;
import uz.akmal.mujiza.report.dto.DailyPointResponse;
import uz.akmal.mujiza.report.dto.HourPointResponse;
import uz.akmal.mujiza.report.dto.TopProductResponse;
import uz.akmal.mujiza.report.repository.AnalyticsRepository;
import uz.akmal.mujiza.report.repository.AnalyticsRepository.DailyRow;
import uz.akmal.mujiza.report.repository.AnalyticsRepository.HourRow;
import uz.akmal.mujiza.report.repository.AnalyticsRepository.PeriodStats;
import uz.akmal.mujiza.report.service.AnalyticsService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin statistikasi qoidalarining amaldagi ijrosi.
 */
@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    /**
     * Davr berilmasa, oxirgi necha kun olinadi.
     */
    private static final int DEFAULT_DAYS = 30;

    /**
     * Davrning eng uzun ruxsat etilgan uzunligi, kunlarda.
     */
    private static final int MAX_DAYS = 366;

    /**
     * Eng ko'p sotilgan mahsulotlar ro'yxatining eng katta hajmi.
     */
    private static final int MAX_TOP = 50;

    /**
     * Statistika so'rovlari.
     */
    private final AnalyticsRepository repository;

    /**
     * Tekshirilgan davr: boshlanish va tugash sanalari (ikkalasi ham davrga kiradi).
     *
     * @param from boshlanish sanasi
     * @param to   tugash sanasi
     */
    private record DateRange(LocalDate from, LocalDate to) {

        /**
         * @return davr boshlanadigan vaqt (boshlanish kunining 00:00)
         */
        LocalDateTime fromAt() {
            return from.atStartOfDay();
        }

        /**
         * @return davr tugaydigan vaqt (tugash kunidan keyingi kunning 00:00, o'zi kirmaydi)
         */
        LocalDateTime toAt() {
            return to.plusDays(1).atStartOfDay();
        }

        /**
         * @return davrdagi kunlar soni
         */
        long days() {
            return ChronoUnit.DAYS.between(from, to) + 1;
        }
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse getSummary(LocalDate from, LocalDate to) {
        DateRange range = resolve(from, to);
        PeriodStats current = repository.periodStats(range.fromAt(), range.toAt());

        // Oldingi davr: xuddi shu uzunlikdagi, joriy davrdan darrov oldingi oraliq
        LocalDate previousTo = range.from().minusDays(1);
        LocalDate previousFrom = previousTo.minusDays(range.days() - 1);
        PeriodStats previous = repository.periodStats(
                previousFrom.atStartOfDay(), previousTo.plusDays(1).atStartOfDay());

        long average = current.completed() > 0 ? current.revenue() / current.completed() : 0L;
        return new AnalyticsSummaryResponse(
                range.from(), range.to(), range.days(),
                current.total(), current.completed(), current.cancelled(), current.active(),
                current.revenue(), current.inProgress(), average,
                current.pickup(), current.delivery(), current.cake(), current.gift(), current.discountTotal(),
                new AnalyticsSummaryResponse.Comparison(previous.total(), previous.revenue(),
                        percentChange(current.total(), previous.total()),
                        percentChange(current.revenue(), previous.revenue())));
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public List<DailyPointResponse> getDaily(LocalDate from, LocalDate to) {
        DateRange range = resolve(from, to);
        // Bazadan faqat buyurtma bor kunlar keladi: sana -> natija
        Map<LocalDate, DailyRow> byDate = new HashMap<>();
        repository.daily(range.fromAt(), range.toAt()).forEach(row -> byDate.put(row.date(), row));
        // Buyurtma bo'lmagan kunlarni nol bilan to'ldiramiz (grafik uzluksiz chiqishi uchun)
        List<DailyPointResponse> result = new ArrayList<>();
        for (LocalDate day = range.from(); !day.isAfter(range.to()); day = day.plusDays(1)) {
            DailyRow row = byDate.get(day);
            result.add(new DailyPointResponse(day, row == null ? 0 : row.orders(), row == null ? 0 : row.revenue()));
        }
        return result;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public List<HourPointResponse> getHourly(LocalDate from, LocalDate to) {
        DateRange range = resolve(from, to);
        Map<Integer, Long> byHour = new HashMap<>();
        for (HourRow row : repository.hourly(range.fromAt(), range.toAt())) {
            byHour.put(row.hour(), row.orders());
        }
        // Har doim 24 ta nuqta (buyurtma bo'lmagan soatlar nol)
        List<HourPointResponse> result = new ArrayList<>();
        for (int hour = 0; hour < 24; hour++) {
            result.add(new HourPointResponse(hour, byHour.getOrDefault(hour, 0L)));
        }
        return result;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public List<TopProductResponse> getTopProducts(LocalDate from, LocalDate to, int limit) {
        DateRange range = resolve(from, to);
        int safeLimit = Math.min(Math.max(limit, 1), MAX_TOP);
        return repository.topProducts(range.fromAt(), range.toAt(), safeLimit).stream()
                .map(row -> new TopProductResponse(row.productId(), row.name(), row.unitType(),
                        row.quantity(), row.revenue()))
                .toList();
    }

    /**
     * Yordamchi metod: davrni aniqlaydi va tekshiradi. Berilmagan tomoni standart bo'yicha to'ldiriladi
     * (tugash: bugun, boshlanish: tugashdan 29 kun oldin). Boshlanish tugashdan keyin bo'lmasligi va davr
     * MAX_DAYS dan uzun bo'lmasligi kerak.
     *
     * @param from boshlanish sanasi (ixtiyoriy)
     * @param to   tugash sanasi (ixtiyoriy)
     * @return tekshirilgan davr
     */
    private DateRange resolve(LocalDate from, LocalDate to) {
        LocalDate end = to != null ? to : ShopTime.today();
        LocalDate start = from != null ? from : end.minusDays(DEFAULT_DAYS - 1L);
        if (start.isAfter(end)) {
            throw new BusinessException("Boshlanish sanasi tugash sanasidan keyin bo'lishi mumkin emas");
        }
        if (ChronoUnit.DAYS.between(start, end) + 1 > MAX_DAYS) {
            throw new BusinessException("Davr " + MAX_DAYS + " kundan oshmasligi kerak");
        }
        return new DateRange(start, end);
    }

    /**
     * Yordamchi metod: ikki qiymat o'rtasidagi o'zgarishni foizda hisoblaydi (bir xona kasr bilan).
     *
     * @param current  hozirgi qiymat
     * @param previous oldingi qiymat
     * @return o'zgarish foizi; oldingi qiymat 0 bo'lsa hisoblab bo'lmaydi (null)
     */
    private Double percentChange(long current, long previous) {
        if (previous == 0) {
            return null;
        }
        return Math.round((current - previous) * 1000.0 / previous) / 10.0;
    }
}
