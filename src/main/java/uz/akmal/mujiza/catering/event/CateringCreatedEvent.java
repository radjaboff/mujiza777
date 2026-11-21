package uz.akmal.mujiza.catering.event;

import java.time.LocalDate;

/**
 * "Yangi keytering so'rovi keldi" hodisasi. So'rov bazaga saqlangandan keyin e'lon qilinadi;
 * Telegram bildirishnomasi shunga obuna bo'ladi. Xabar matni uchun kerakli ma'lumot hodisaning o'zida bor.
 *
 * @param id         so'rovning raqami
 * @param name       mijozning ismi
 * @param phone      telefon raqami
 * @param eventType  tadbir turi
 * @param eventDate  tadbir sanasi
 * @param guestCount mehmonlar soni
 * @param budget     taxminiy byudjet (yo'q bo'lsa null)
 * @param comment    istaklar (yo'q bo'lsa null)
 */
public record CateringCreatedEvent(
        Long id,
        String name,
        String phone,
        String eventType,
        LocalDate eventDate,
        int guestCount,
        Long budget,
        String comment
) {
}