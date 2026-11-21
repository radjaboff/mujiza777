package uz.akmal.mujiza.marketing.controller;

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
import uz.akmal.mujiza.marketing.dto.PromotionRequest;
import uz.akmal.mujiza.marketing.dto.PromotionResponse;
import uz.akmal.mujiza.marketing.service.PromotionService;

import java.util.List;

/**
 * Admin panel uchun aksiyalarni boshqarish endpoint'lari.
 * Faqat tizimga kirgan ADMIN yoki STAFF roli bilan ishlaydi (SecurityConfig'da belgilangan).
 */
@RestController
@RequestMapping("/api/admin/promotions")
@Tag(name = "Aksiyalar (admin)")
@RequiredArgsConstructor
public class AdminPromotionController {

    /**
     * Aksiyalar bo'yicha biznes mantiq.
     */
    private final PromotionService promotionService;

    /**
     * Barcha o'chirilmagan aksiyalar (hali boshlanmagan va tugaganlari ham).
     * Manzil: GET /api/admin/promotions
     *
     * @return aksiyalar ro'yxati (har birida "visibleNow": hozir ko'rinyaptimi)
     */
    @GetMapping
    @Operation(summary = "Barcha aksiyalar (admin)")
    public List<PromotionResponse> getAll() {
        return promotionService.getAll();
    }

    /**
     * Bitta aksiyani id bo'yicha qaytaradi.
     * Manzil: GET /api/admin/promotions/{id}
     *
     * @param id aksiyaning raqami (manzildan olinadi)
     * @return aksiya ma'lumoti (topilmasa 404)
     */
    @GetMapping("/{id}")
    @Operation(summary = "Aksiyani id bo'yicha olish")
    public PromotionResponse getById(@PathVariable Long id) {
        return promotionService.getById(id);
    }

    /**
     * Yangi aksiya yaratadi.
     * Manzil: POST /api/admin/promotions
     * @Valid: PromotionRequest'dagi validation qoidalari tekshiriladi, buzilsa 400 xatosi qaytadi.
     *
     * @param request admin yuborgan ma'lumot (JSON)
     * @return yaratilgan aksiya (201)
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Yangi aksiya yaratish")
    public PromotionResponse create(@Valid @RequestBody PromotionRequest request) {
        return promotionService.create(request);
    }

    /**
     * Aksiyani tahrirlaydi.
     * Manzil: PUT /api/admin/promotions/{id}
     *
     * @param id      tahrirlanayotgan aksiyaning raqami
     * @param request yangi ma'lumot
     * @return yangilangan aksiya
     */
    @PutMapping("/{id}")
    @Operation(summary = "Aksiyani tahrirlash")
    public PromotionResponse update(@PathVariable Long id, @Valid @RequestBody PromotionRequest request) {
        return promotionService.update(id, request);
    }

    /**
     * Aksiyani o'chiradi (soft delete). Muvaffaqiyatli bo'lsa 204 (javob tanasi yo'q) qaytadi.
     * Manzil: DELETE /api/admin/promotions/{id}
     *
     * @param id o'chiriladigan aksiyaning raqami
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Aksiyani o'chirish")
    public void delete(@PathVariable Long id) {
        promotionService.delete(id);
    }
}