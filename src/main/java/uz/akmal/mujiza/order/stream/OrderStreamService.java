package uz.akmal.mujiza.order.stream;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import uz.akmal.mujiza.common.exception.BusinessException;
import uz.akmal.mujiza.order.enums.OrderStatus;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Kuzatuv sahifalari bilan ochiq ulanishlarni (SSE) boshqaradi va ularga xabar yuboradi.
 * Har bir buyurtma kuzatuv kaliti (token) uchun bir nechta ulanish bo'lishi mumkin
 * (masalan, mijoz telefon va kompyuterda bir vaqtda ochgan).
 *
 * Eslatma: ulanishlar serverning xotirasida turadi. Server qayta ishga tushsa, ulanishlar uziladi va
 * brauzer o'zi qayta ulanadi (EventSource avtomatik qayta urinadi).
 */
@Slf4j
@Service
public class OrderStreamService {

    /**
     * Ulanish eng ko'pi bilan qancha vaqt ochiq turishi (30 daqiqa). Shundan keyin brauzer qayta ulanadi.
     */
    private static final long TIMEOUT_MS = 30L * 60 * 1000;

    /**
     * Bitta buyurtma uchun bir vaqtda ochiq bo'la oladigan eng ko'p ulanish soni.
     */
    private static final int MAX_CONNECTIONS_PER_ORDER = 5;

    /**
     * Butun server bo'yicha bir vaqtda ochiq bo'la oladigan eng ko'p ulanish soni (server yuklanib ketmasligi uchun).
     */
    private static final int MAX_TOTAL_CONNECTIONS = 2000;

    /**
     * Ochiq ulanishlar: kuzatuv kaliti -> shu buyurtmani kuzatayotgan ulanishlar ro'yxati.
     */
    private final Map<String, List<SseEmitter>> connections = new ConcurrentHashMap<>();

    /**
     * Hozir ochiq turgan ulanishlarning umumiy soni.
     */
    private final AtomicInteger totalConnections = new AtomicInteger();

    /**
     * Buyurtmani kuzatish uchun yangi ulanish ochadi.
     *
     * @param trackingToken buyurtmaning kuzatuv kaliti (mavjudligi oldindan tekshirilgan bo'lishi kerak)
     * @return ochiq ulanish (Spring uni brauzerga uzluksiz oqim sifatida beradi)
     * @throws BusinessException ulanishlar soni chegaradan oshib ketsa
     */
    public SseEmitter subscribe(String trackingToken) {
        // Global slot CAS bilan band qilinadi: parallel so'rovlar limitni chetlab o'tolmaydi.
        if (!reserveGlobalSlot()) {
            throw new BusinessException("Server band, iltimos birozdan keyin urinib ko'ring",
                    HttpStatus.SERVICE_UNAVAILABLE);
        }
        SseEmitter emitter = new SseEmitter(TIMEOUT_MS);
        AtomicBoolean accepted = new AtomicBoolean();
        try {
            // Per-key compute atomik: bir buyurtma uchun parallel ulanishlar limiti oshmaydi.
            connections.compute(trackingToken, (token, existing) -> {
                List<SseEmitter> list = existing == null ? new CopyOnWriteArrayList<>() : existing;
                if (list.size() >= MAX_CONNECTIONS_PER_ORDER) {
                    return existing;
                }
                list.add(emitter);
                accepted.set(true);
                return list;
            });
        } catch (RuntimeException e) {
            totalConnections.decrementAndGet();
            throw e;
        }
        if (!accepted.get()) {
            totalConnections.decrementAndGet();
            throw new BusinessException("Bu buyurtma uchun ochiq ulanishlar juda ko'p",
                    HttpStatus.TOO_MANY_REQUESTS);
        }

        // Ulanish tugaganda (mijoz sahifani yopdi, vaqt tugadi yoki xato) ro'yxatdan olib tashlaymiz
        emitter.onCompletion(() -> remove(trackingToken, emitter));
        emitter.onTimeout(emitter::complete);
        emitter.onError(error -> remove(trackingToken, emitter));

        // Ulanish ochilganini bildiruvchi birinchi xabar
        try {
            emitter.send(SseEmitter.event().name("connected").data("ok"));
        } catch (IOException | IllegalStateException e) {
            remove(trackingToken, emitter);
        }
        return emitter;
    }

    /**
     * Buyurtmani kuzatayotgan hamma ulanishga yangi holatni yuboradi.
     * Holat yakuniy bo'lsa (yakunlandi yoki bekor qilindi), ulanishlar yopiladi: boshqa o'zgarish bo'lmaydi.
     *
     * @param trackingToken buyurtmaning kuzatuv kaliti
     * @param status        buyurtmaning yangi holati
     */
    public void publish(String trackingToken, OrderStatus status) {
        List<SseEmitter> list = connections.get(trackingToken);
        if (list == null) {
            return;
        }
        for (SseEmitter emitter : list) {
            try {
                emitter.send(SseEmitter.event().name("status").data(status.name()));
                if (status.isFinal()) {
                    emitter.complete();
                }
            } catch (IOException | IllegalStateException e) {
                // Mijoz allaqachon uzilgan: ulanishni ro'yxatdan olib tashlaymiz
                remove(trackingToken, emitter);
            }
        }
    }

    /**
     * Har 25 soniyada hamma ulanishga "tirikman" belgisini yuboradi.
     * Bu bo'lmasa, oraliq serverlar (nginx, Cloudflare) jim turgan ulanishni uzib qo'yishi mumkin.
     * Uzilgan ulanishlar shu paytda aniqlanib, ro'yxatdan olib tashlanadi.
     */
    @Scheduled(fixedRate = 25_000)
    public void sendHeartbeat() {
        connections.forEach((token, list) -> {
            for (SseEmitter emitter : list) {
                try {
                    emitter.send(SseEmitter.event().comment("ping"));
                } catch (IOException | IllegalStateException e) {
                    remove(token, emitter);
                }
            }
        });
    }

    /**
     * Yordamchi metod: ulanishni ro'yxatdan olib tashlaydi va umumiy sonni kamaytiradi.
     * Ro'yxat bo'sh qolsa, kalitning o'zi ham o'chiriladi (xotira to'lib ketmasligi uchun).
     *
     * @param trackingToken buyurtmaning kuzatuv kaliti
     * @param emitter       olib tashlanadigan ulanish
     */
    private void remove(String trackingToken, SseEmitter emitter) {
        // compute ichida remove + bo'sh kalitni o'chirish bitta atomik qadam: subscribe bilan race bo'lmaydi.
        connections.computeIfPresent(trackingToken, (key, list) -> {
            if (list.remove(emitter)) {
                totalConnections.decrementAndGet();
            }
            return list.isEmpty() ? null : list;
        });
    }

    private boolean reserveGlobalSlot() {
        while (true) {
            int current = totalConnections.get();
            if (current >= MAX_TOTAL_CONNECTIONS) {
                return false;
            }
            if (totalConnections.compareAndSet(current, current + 1)) {
                return true;
            }
        }
    }
}
