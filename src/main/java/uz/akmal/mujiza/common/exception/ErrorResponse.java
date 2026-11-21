package uz.akmal.mujiza.common.exception;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Mijozga qaytariladigan xato javobining shakli (JSON ga aylanadi).
 * Frontend (Antigravity) hamma xatoni shu bir xil formatda oladi.
 *
 * @param timestamp xato yuz bergan vaqt
 * @param status    HTTP status kodi (masalan, 404)
 * @param error     status nomi (masalan, "Not Found")
 * @param message   tushunarli xato matni
 * @param path      qaysi manzilga so'rov yuborilganida xato chiqqani (masalan, /api/public/products/5)
 * @param fieldErrors validation xatolarida: maydon nomi va uning xatosi (masalan, name: "bo'sh bo'lmasligi kerak"). Boshqa xatolarda bo'sh (null) bo'ladi.
 */
public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> fieldErrors
) {
}