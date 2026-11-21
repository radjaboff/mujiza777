package uz.akmal.mujiza.common;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import uz.akmal.mujiza.common.exception.BusinessException;

import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;

/**
 * So'rovlar sonini cheklaydigan oddiy vosita (spam va suiiste'moldan himoya).
 * Har bir kalit (masalan, "catering:192.168.1.5") uchun oxirgi so'rovlar vaqti saqlanadi:
 * belgilangan vaqt oynasida ruxsat etilganidan ko'p so'rov kelsa, rad etiladi.
 * Ma'lumot serverning xotirasida turadi: server qayta ishga tushsa, hisob nolga qaytadi (bizga yetarli).
 */
@Component
public class RateLimiter {

    /**
     * Eski yozuvlarni tozalashda: shundan uzoq vaqt so'rov kelmagan kalitlar o'chiriladi (24 soat).
     */
    private static final long RETENTION_MS = Duration.ofHours(24).toMillis();

    /** Bounds memory if many distinct client keys hit public endpoints. */
    private static final long MAX_TRACKED_KEYS = 100_000;

    /**
     * Kalit -> shu kalitdan kelgan oxirgi so'rovlarning vaqtlari (millisekundlarda).
     */
    private final Cache<String, Deque<Long>> hits = Caffeine.newBuilder()
            .maximumSize(MAX_TRACKED_KEYS)
            .expireAfterAccess(Duration.ofHours(24))
            .build();

    /**
     * Shu kalit uchun yana bitta so'rovga ruxsat bormi, shuni tekshiradi va ruxsat bo'lsa hisobga yozadi.
     *
     * @param key         cheklash kaliti (amal nomi va IP, masalan "upload:1.2.3.4")
     * @param maxRequests vaqt oynasida ruxsat etilgan eng ko'p so'rov soni
     * @param window      vaqt oynasi (masalan, 1 soat)
     * @return ruxsat bo'lsa true, limit tugagan bo'lsa false
     */
    public boolean tryAcquire(String key, int maxRequests, Duration window) {
        long now = System.currentTimeMillis();
        long cutoff = now - window.toMillis();
        Deque<Long> queue = hits.get(key, ignored -> new ArrayDeque<>());
        synchronized (queue) {
            // Vaqt oynasidan eski so'rovlarni olib tashlaymiz
            while (!queue.isEmpty() && queue.peekFirst() < cutoff) {
                queue.pollFirst();
            }
            if (queue.size() >= maxRequests) {
                return false;
            }
            queue.addLast(now);
            return true;
        }
    }

    /**
     * Xuddi tryAcquire, lekin limit tugagan bo'lsa darrov 429 (Too Many Requests) xatosini tashlaydi.
     *
     * @param key         cheklash kaliti
     * @param maxRequests vaqt oynasida ruxsat etilgan eng ko'p so'rov soni
     * @param window      vaqt oynasi
     */
    public void acquireOrThrow(String key, int maxRequests, Duration window) {
        if (!tryAcquire(key, maxRequests, window)) {
            throw new BusinessException("Juda ko'p so'rov yuborildi. Iltimos, birozdan keyin urinib ko'ring",
                    HttpStatus.TOO_MANY_REQUESTS);
        }
    }

    /**
     * Har 10 daqiqada eski yozuvlarni tozalaydi (xotira to'lib ketmasligi uchun).
     */
    @Scheduled(fixedDelay = 600_000, initialDelay = 600_000)
    public void cleanup() {
        long cutoff = System.currentTimeMillis() - RETENTION_MS;
        hits.asMap().entrySet().removeIf(entry -> {
            Deque<Long> queue = entry.getValue();
            synchronized (queue) {
                return queue.isEmpty() || queue.peekLast() < cutoff;
            }
        });
    }
}
