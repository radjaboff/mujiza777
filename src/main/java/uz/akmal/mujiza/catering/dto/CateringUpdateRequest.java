package uz.akmal.mujiza.catering.dto;

import jakarta.validation.constraints.Size;
import uz.akmal.mujiza.catering.enums.CateringStatus;

/**
 * Admin so'rov holatini yoki izohini o'zgartirganda yuboradigan ma'lumot.
 *
 * @param status    yangi holat (ixtiyoriy)
 * @param adminNote admin izohi (ixtiyoriy, 500 belgigacha)
 */
public record CateringUpdateRequest(
        CateringStatus status,

        @Size(max = 500, message = "Izoh 500 belgidan oshmasligi kerak")
        String adminNote
) {
}
