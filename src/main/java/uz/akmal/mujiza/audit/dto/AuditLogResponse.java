package uz.akmal.mujiza.audit.dto;

import java.time.LocalDateTime;

/**
 * Admin panelga qaytariladigan tarix yozuvi.
 *
 * @param id         yozuvning raqami
 * @param actor      kim bajargan
 * @param action     amal kodi
 * @param entityType nima o'zgargan
 * @param entityId   o'zgargan yozuvning raqami
 * @param details    tafsilot
 * @param createdAt  qachon
 */
public record AuditLogResponse(
        Long id,
        String actor,
        String action,
        String entityType,
        Long entityId,
        String details,
        LocalDateTime createdAt
) {
}