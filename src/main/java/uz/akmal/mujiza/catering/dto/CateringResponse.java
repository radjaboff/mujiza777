package uz.akmal.mujiza.catering.dto;

import uz.akmal.mujiza.catering.enums.CateringStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Admin panelga qaytariladigan keytering so'rovi.
 *
 * @param id         so'rovning raqami
 * @param name       mijozning ismi
 * @param phone      telefon raqami
 * @param eventType  tadbir turi
 * @param eventDate  tadbir sanasi
 * @param guestCount mehmonlar soni
 * @param budget     taxminiy byudjet (yo'q bo'lsa null)
 * @param comment    mijozning istaklari
 * @param status     holati
 * @param adminNote  admin izohi
 * @param createdAt  yuborilgan vaqt
 * @param updatedAt  oxirgi o'zgartirilgan vaqt
 */
public record CateringResponse(
        Long id,
        String name,
        String phone,
        String eventType,
        LocalDate eventDate,
        Integer guestCount,
        Long budget,
        String comment,
        CateringStatus status,
        String adminNote,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}