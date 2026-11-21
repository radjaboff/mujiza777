package uz.akmal.mujiza.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Foydalanuvchi o'z parolini almashtirganda yuboradigan ma'lumot.
 *
 * @param currentPassword joriy parol (tasdiqlash uchun)
 * @param newPassword     yangi parol, kamida 10 belgi
 */
public record ChangePasswordRequest(

        @NotBlank(message = "Joriy parol kiritilishi kerak")
        @Size(max = 100, message = "Parol 100 belgidan oshmasligi kerak")
        String currentPassword,

        @NotBlank(message = "Yangi parol kiritilishi kerak")
        @Size(min = 10, max = 100, message = "Yangi parol kamida 10 belgidan iborat bo'lishi kerak")
        String newPassword
) {
}