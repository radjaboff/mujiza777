package uz.akmal.mujiza.report.service;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.LongAdder;

/**
 * Saytga tashrif buyuruvchilar va sahifa ko'rishlarni xotirada xavfsiz va yengil sanovchi xizmat.
 * Ma'lumotlar bazasini ortiqcha so'rovlar bilan band qilmaydi.
 */
@Component
public class VisitTracker {

    private static final ZoneId TASHKENT_ZONE = ZoneId.of("Asia/Tashkent");

    private final ConcurrentHashMap<LocalDate, Set<String>> dailyIps = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<LocalDate, LongAdder> dailyPageViews = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<LocalDate, LongAdder> dailyCartAdds = new ConcurrentHashMap<>();

    /**
     * Yangi sahifa ochilganda yoki saytga kirilganda hisobga oladi.
     *
     * @param clientIp tashrif buyuruvchining IP manzili
     */
    public void recordPageView(String clientIp) {
        LocalDate today = LocalDate.now(TASHKENT_ZONE);
        dailyPageViews.computeIfAbsent(today, k -> new LongAdder()).increment();
        if (clientIp != null && !clientIp.isBlank()) {
            dailyIps.computeIfAbsent(today, k -> Collections.newSetFromMap(new ConcurrentHashMap<>()))
                    .add(clientIp.trim());
        }
        cleanupOldDates(today);
    }

    /**
     * Foydalanuvchi savatga mahsulot qo'shganda hisobga oladi.
     */
    public void recordCartAdd() {
        LocalDate today = LocalDate.now(TASHKENT_ZONE);
        dailyCartAdds.computeIfAbsent(today, k -> new LongAdder()).increment();
        cleanupOldDates(today);
    }

    /**
     * Berilgan kundagi tashrif statistikasini qaytaradi.
     *
     * @param date sana
     * @return tashrif ko'rsatkichlari
     */
    public VisitStats getStats(LocalDate date) {
        Set<String> ips = dailyIps.get(date);
        long uniqueVisitors = ips != null ? ips.size() : 0L;

        LongAdder views = dailyPageViews.get(date);
        long pageViews = views != null ? views.sum() : 0L;

        LongAdder cartAdds = dailyCartAdds.get(date);
        long carts = cartAdds != null ? cartAdds.sum() : 0L;

        return new VisitStats(uniqueVisitors, pageViews, carts);
    }

    /**
     * Xotirani toza saqlash uchun 7 kundan eski ma'lumotlarni o'chiradi.
     */
    private void cleanupOldDates(LocalDate today) {
        if (dailyIps.size() > 7) {
            LocalDate cutoff = today.minusDays(7);
            dailyIps.keySet().removeIf(d -> d.isBefore(cutoff));
            dailyPageViews.keySet().removeIf(d -> d.isBefore(cutoff));
            dailyCartAdds.keySet().removeIf(d -> d.isBefore(cutoff));
        }
    }

    /**
     * Tashrif statistikasi ma'lumoti.
     *
     * @param uniqueVisitors unikal tashrif buyuruvchilar soni
     * @param pageViews      ko'rilgan sahifalar soni
     * @param cartAdds       savatga mahsulot qo'shishlar soni
     */
    public record VisitStats(long uniqueVisitors, long pageViews, long cartAdds) {
    }
}
