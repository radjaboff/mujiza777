package uz.akmal.mujiza.catering.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uz.akmal.mujiza.catering.dto.CateringResponse;
import uz.akmal.mujiza.catering.dto.CateringUpdateRequest;
import uz.akmal.mujiza.catering.enums.CateringStatus;
import uz.akmal.mujiza.catering.service.CateringService;
import uz.akmal.mujiza.common.PageResponse;

/**
 * Admin panel uchun keytering so'rovlarini boshqarish endpoint'lari (ADMIN va STAFF).
 */
@RestController
@RequestMapping("/api/admin/catering-requests")
@Tag(name = "Keytering (admin)")
@RequiredArgsConstructor
public class AdminCateringController {

    /**
     * Keytering so'rovlari bo'yicha biznes mantiq.
     */
    private final CateringService cateringService;

    /**
     * So'rovlar ro'yxati, eng yangisi birinchi. Manzil: GET /api/admin/catering-requests?status=NEW
     *
     * @param status holat bo'yicha filtr (ixtiyoriy)
     * @param page   sahifa raqami, 0 dan (standart 0)
     * @param size   sahifa hajmi (standart 20, ko'pi bilan 50)
     * @return sahifalangan so'rovlar
     */
    @GetMapping
    @Operation(summary = "Keytering so'rovlari ro'yxati")
    public PageResponse<CateringResponse> getAll(@RequestParam(required = false) CateringStatus status,
                                                 @RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "20") int size) {
        return cateringService.getAll(status, page, size);
    }

    /**
     * Bitta so'rovni qaytaradi. Manzil: GET /api/admin/catering-requests/{id}
     *
     * @param id so'rovning raqami
     * @return so'rov (topilmasa 404)
     */
    @GetMapping("/{id}")
    @Operation(summary = "Keytering so'rovini olish")
    public CateringResponse getById(@PathVariable Long id) {
        return cateringService.getById(id);
    }

    /**
     * So'rov holati va izohini o'zgartiradi. Manzil: PATCH /api/admin/catering-requests/{id}
     *
     * @param id      so'rovning raqami
     * @param request yangi holat va izoh
     * @return yangilangan so'rov
     */
    @PatchMapping("/{id}")
    @Operation(summary = "Keytering so'rovi holatini o'zgartirish")
    public CateringResponse update(@PathVariable Long id, @Valid @RequestBody CateringUpdateRequest request) {
        return cateringService.update(id, request);
    }
}