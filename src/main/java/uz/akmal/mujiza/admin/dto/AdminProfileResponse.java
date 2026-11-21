package uz.akmal.mujiza.admin.dto;

import uz.akmal.mujiza.admin.enums.AdminRole;

/**
 * Tizimga kirgan adminning ochiq ma'lumoti (admin panelda "Salom, Akmal" ko'rsatish uchun).
 * Parol va shifrlangan parol bu yerda hech qachon bo'lmaydi.
 *
 * @param username kirish nomi
 * @param fullName to'liq ismi
 * @param role     roli (ADMIN, STAFF, COURIER)
 */
public record AdminProfileResponse(
        String username,
        String fullName,
        AdminRole role
) {
}