package uz.akmal.mujiza.admin.dto;

import uz.akmal.mujiza.admin.enums.AdminRole;

import java.time.LocalDateTime;

/**
 * Admin panelga qaytariladigan xodim ma'lumoti (parol va uning shifri hech qachon qaytarilmaydi).
 *
 * @param id          xodimning raqami
 * @param username    kirish nomi
 * @param fullName    to'liq ismi
 * @param role        roli
 * @param isActive    faolmi
 * @param lastLoginAt oxirgi kirgan vaqti (hali kirmagan bo'lsa null)
 * @param createdAt   yaratilgan vaqt
 */
public record StaffResponse(
        Long id,
        String username,
        String fullName,
        AdminRole role,
        Boolean isActive,
        LocalDateTime lastLoginAt,
        LocalDateTime createdAt
) {
}