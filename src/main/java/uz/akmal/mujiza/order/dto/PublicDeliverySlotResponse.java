package uz.akmal.mujiza.order.dto;

import java.time.LocalTime;

/**
 * Mijozga ko'rsatiladigan vaqt oynasi: band yoki bo'shligi bilan.
 *
 * @param id                  oynaning raqami (buyurtmada slotId sifatida yuboriladi)
 * @param startTime           boshlanish soati
 * @param endTime             tugash soati
 * @param available           tanlash mumkinmi
 * @param remaining           qolgan bo'sh joylar soni
 * @param unavailableReason   tanlab bo'lmasa sababi: "FULL" (band) yoki "TOO_SOON" (tayyorlanishga vaqt yetmaydi); mumkin bo'lsa null
 */
public record PublicDeliverySlotResponse(
        Long id,
        LocalTime startTime,
        LocalTime endTime,
        boolean available,
        int remaining,
        String unavailableReason
) {
}