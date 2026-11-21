package uz.akmal.mujiza.order.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Buyurtma uchun band qilingan vaqt oynasi (faqat ichki ishlatiladi).
 *
 * @param slotId    oynaning raqami
 * @param date      tanlangan sana
 * @param startTime oyna boshlanish soati
 * @param endTime   oyna tugash soati
 * @param startAt   oyna boshlanadigan aniq vaqt (sana + soat)
 */
public record SlotReservation(
        Long slotId,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        LocalDateTime startAt
) {
}