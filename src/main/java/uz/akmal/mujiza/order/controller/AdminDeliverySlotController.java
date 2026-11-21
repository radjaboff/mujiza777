package uz.akmal.mujiza.order.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import uz.akmal.mujiza.order.dto.DeliverySlotRequest;
import uz.akmal.mujiza.order.dto.DeliverySlotResponse;
import uz.akmal.mujiza.order.service.DeliverySlotService;

import java.util.List;

/**
 * Admin panel uchun vaqt oynalarini boshqarish endpoint'lari. Faqat ADMIN roli (SecurityConfig'da belgilanadi).
 */
@RestController
@RequestMapping("/api/admin/delivery-slots")
@Tag(name = "Vaqt oynalari (admin)")
@RequiredArgsConstructor
public class AdminDeliverySlotController {

    /**
     * Vaqt oynalari bo'yicha biznes mantiq.
     */
    private final DeliverySlotService slotService;

    /**
     * Barcha o'chirilmagan oynalar. Manzil: GET /api/admin/delivery-slots
     *
     * @return oynalar ro'yxati
     */
    @GetMapping
    @Operation(summary = "Barcha vaqt oynalari (admin)")
    public List<DeliverySlotResponse> getAll() {
        return slotService.getAll();
    }

    /**
     * Yangi oyna yaratadi. Manzil: POST /api/admin/delivery-slots
     *
     * @param request admin yuborgan ma'lumot
     * @return yaratilgan oyna (201)
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Yangi vaqt oynasi yaratish")
    public DeliverySlotResponse create(@Valid @RequestBody DeliverySlotRequest request) {
        return slotService.create(request);
    }

    /**
     * Oynani tahrirlaydi. Manzil: PUT /api/admin/delivery-slots/{id}
     *
     * @param id      oynaning raqami
     * @param request yangi ma'lumot
     * @return yangilangan oyna
     */
    @PutMapping("/{id}")
    @Operation(summary = "Vaqt oynasini tahrirlash")
    public DeliverySlotResponse update(@PathVariable Long id, @Valid @RequestBody DeliverySlotRequest request) {
        return slotService.update(id, request);
    }

    /**
     * Oynani o'chiradi (soft delete). Manzil: DELETE /api/admin/delivery-slots/{id}
     *
     * @param id oynaning raqami
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Vaqt oynasini o'chirish")
    public void delete(@PathVariable Long id) {
        slotService.delete(id);
    }
}