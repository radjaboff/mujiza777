package uz.akmal.mujiza.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Admin tizimga kirishda yuboradigan ma'lumot.
 *
 * @param username kirish nomi (majburiy, 50 belgigacha)
 * @param password parol (majburiy, 100 belgigacha)
 */
public record LoginRequest(

        @NotBlank(message = "Login kiritilishi kerak")
        @Size(max = 50, message = "Login 50 belgidan oshmasligi kerak")
        String username,

        @NotBlank(message = "Parol kiritilishi kerak")
        @Size(max = 100, message = "Parol 100 belgidan oshmasligi kerak")
        String password
) {
}