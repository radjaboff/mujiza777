package uz.akmal.mujiza.admin.dto;

import jakarta.validation.constraints.Size;
import uz.akmal.mujiza.admin.enums.AdminRole;

/**
 * Xodimni tahrirlashda yuboriladigan ma'lumot. Hamma maydon ixtiyoriy: yuborilmaganlari o'zgarmaydi.
 *
 * @param fullName    yangi to'liq ism
 * @param role        yangi rol
 * @param isActive    faolmi (false bo'lsa, tizimga kira olmaydi)
 * @param newPassword yangi parol (kamida 10 belgi); belgilansa, xodimning parolini almashtiradi
 */
public record StaffUpdateRequest(

        @Size(max = 150, message = "Ism 150 belgidan oshmasligi kerak")
        String fullName,

        AdminRole role,
        Boolean isActive,

        @Size(min = 10, max = 100, message = "Parol kamida 10 belgidan iborat bo'lishi kerak")
        String newPassword
) {
}