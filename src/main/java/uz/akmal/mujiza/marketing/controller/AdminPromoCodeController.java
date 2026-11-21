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
import uz.akmal.mujiza.common.RateLimiter;
import uz.akmal.mujiza.marketing.dto.PromoCodeRequest;
import uz.akmal.mujiza.marketing.dto.PromoCodeResponse;
import uz.akmal.mujiza.marketing.service.PromoCodeService;

import java.util.List;

/**
 * Admin panel uchun promo kodlarni boshqarish endpoint'lari.
 * Faqat ADMIN roli (do'kon egasi) kira oladi (SecurityConfig'da belgilangan): promo kod daromadga ta'sir qiladi.
 */
@RestController
@RequestMapping("/api/admin/promo-codes")
@Tag(name = "Promo kodlar (admin)")
@RequiredArgsConstructor
public class AdminPromoCodeController {

    /**
     * Promo kodlar bo'yicha biznes mantiq.
     */
    private final PromoCodeService promoCodeService;

    /**
     * So'rovlarni cheklash vositasi (promo kodlarni ketma-ket sinab topishdan himoya).
     */
    private final RateLimiter rateLimiter;

    /**
     * Barcha o'chirilmagan promo kodlar.
     * Manzil: GET /api/admin/promo-codes
     *
     * @return kodlar ro'yxati (har birida "usableNow": hozir ishlatib bo'ladimi)
     */
    @GetMapping
    @Operation(summary = "Barcha promo kodlar (admin)")
    public List<PromoCodeResponse> getAll() {
        return promoCodeService.getAll();
    }

    /**
     * Bitta promo kodni id bo'yicha qaytaradi.
     * Manzil: GET /api/admin/promo-codes/{id}
     *
     * @param id kodning raqami
     * @return kod ma'lumoti (topilmasa 404)
     */
    @GetMapping("/{id}")
    @Operation(summary = "Promo kodni id bo'yicha olish")
    public PromoCodeResponse getById(@PathVariable Long id) {
        return promoCodeService.getById(id);
    }

    /**
     * Yangi promo kod yaratadi.
     * Manzil: POST /api/admin/promo-codes
     *
     * @param request admin yuborgan ma'lumot (JSON)
     * @return yaratilgan kod (201)
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Yangi promo kod yaratish")
    public PromoCodeResponse create(@Valid @RequestBody PromoCodeRequest request) {
        return promoCodeService.create(request);
    }

    /**
     * Promo kodni tahrirlaydi (kod matnidan tashqari hammasini).
     * Manzil: PUT /api/admin/promo-codes/{id}
     *
     * @param id      tahrirlanayotgan kodning raqami
     * @param request yangi ma'lumot (code maydoni o'zgarishsiz yuboriladi)
     * @return yangilangan kod
     */
    @PutMapping("/{id}")
    @Operation(summary = "Promo kodni tahrirlash")
    public PromoCodeResponse update(@PathVariable Long id, @Valid @RequestBody PromoCodeRequest request) {
        return promoCodeService.update(id, request);
    }

    /**
     * Promo kodni o'chiradi (soft delete). Muvaffaqiyatli bo'lsa 204 (javob tanasi yo'q) qaytadi.
     * Manzil: DELETE /api/admin/promo-codes/{id}
     *
     * @param id o'chiriladigan kodning raqami
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Promo kodni o'chirish")
    public void delete(@PathVariable Long id) {
        promoCodeService.delete(id);
    }
}