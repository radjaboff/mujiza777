package uz.akmal.mujiza.order.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uz.akmal.mujiza.order.dto.PublicDeliverySlotResponse;
import uz.akmal.mujiza.order.service.DeliverySlotService;

import java.time.LocalDate;
import java.util.List;

/**
 * Mijoz sayti uchun vaqt oynalari endpoint'i (login talab qilinmaydi).
 */
@RestController
@RequestMapping("/api/public/delivery")
@Tag(name = "Vaqt oynalari (mijoz)")
@RequiredArgsConstructor
public class PublicDeliverySlotController {

    /**
     * Vaqt oynalari bo'yicha biznes mantiq.
     */
    private final DeliverySlotService slotService;

    /**
     * Berilgan sanadagi vaqt oynalari: qaysilari bo'sh, qaysilari band yoki juda yaqin.
     * Manzil: GET /api/public/delivery/slots?date=2026-10-30&prepMinutes=120
     *
     * @param date        sana (YYYY-MM-DD), bugundan boshlab 14 kun ichida
     * @param prepMinutes savatdagi mahsulotlarning eng uzoq tayyorlanish vaqti, daqiqalarda (standart 0)
     * @return oynalar ro'yxati
     */
    @GetMapping("/slots")
    @Operation(summary = "Sana bo'yicha vaqt oynalari")
    public List<PublicDeliverySlotResponse> getSlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "0") int prepMinutes) {
        return slotService.getPublicSlots(date, prepMinutes);
    }
}