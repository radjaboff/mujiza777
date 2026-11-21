package uz.akmal.mujiza.order.dto;

import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Admin panelga qaytariladigan vaqt oynasi ma'lumoti.
 *
 * @param id        oynaning noyob raqami
 * @param startTime boshlanish soati
 * @param endTime   tugash soati
 * @param capacity  bir sanada eng ko'p buyurtma soni
 * @param isActive  yoqilganmi
 * @param createdAt yaratilgan vaqt
 * @param updatedAt oxirgi o'zgartirilgan vaqt
 */
public record DeliverySlotResponse(
        Long id,
        LocalTime startTime,
        LocalTime endTime,
        Integer capacity,
        Boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}