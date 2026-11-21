package uz.akmal.mujiza.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import uz.akmal.mujiza.admin.enums.AdminRole;

/**
 * Yangi xodim yaratishda yuboriladigan ma'lumot.
 *
 * @param username kirish nomi: lotin harflari, raqam, nuqta, chiziqcha va pastki chiziq, 3-50 belgi (kichik harfga o'tkaziladi)
 * @param password boshlang'ich parol, kamida 10 belgi
 * @param fullName to'liq ismi
 * @param role     roli: ADMIN, STAFF yoki COURIER
 */
public record StaffCreateRequest(

        @NotBlank(message = "Login kiritilishi kerak")
        @Pattern(regexp = "^[A-Za-z0-9._-]{3,50}$",
                message = "Login 3-50 belgi bo'lib, faqat lotin harflari, raqam, nuqta, chiziqcha va pastki chiziqdan iborat bo'lishi kerak")
        String username,

        @NotBlank(message = "Parol kiritilishi kerak")
        @Size(min = 10, max = 100, message = "Parol kamida 10 belgidan iborat bo'lishi kerak")
        String password,

        @NotBlank(message = "To'liq ism kiritilishi kerak")
        @Size(max = 150, message = "Ism 150 belgidan oshmasligi kerak")
        String fullName,

        @NotNull(message = "Rol tanlanishi kerak")
        AdminRole role
) {
}