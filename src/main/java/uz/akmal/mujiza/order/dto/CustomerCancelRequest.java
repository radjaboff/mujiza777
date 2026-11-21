package uz.akmal.mujiza.order.dto;

import jakarta.validation.constraints.Size;

/**
 * Mijoz buyurtmani o'zi bekor qilganda yuboradigan ma'lumot.
 * Butun so'rov tanasi ixtiyoriy: sabab yozilmasa, standart sabab yoziladi.
 *
 * @param reason bekor qilish sababi (ixtiyoriy, 300 belgigacha)
 */
public record CustomerCancelRequest(

        @Size(max = 300, message = "Sabab 300 belgidan oshmasligi kerak")
        String reason
) {
}