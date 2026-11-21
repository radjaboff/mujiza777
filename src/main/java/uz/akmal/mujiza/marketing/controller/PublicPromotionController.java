package uz.akmal.mujiza.marketing.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import uz.akmal.mujiza.common.RateLimiter;
import uz.akmal.mujiza.marketing.dto.PromoValidateRequest;
import uz.akmal.mujiza.marketing.dto.PromoValidateResponse;
import uz.akmal.mujiza.marketing.dto.PublicPromotionResponse;
import uz.akmal.mujiza.marketing.service.PromoCodeService;
import uz.akmal.mujiza.marketing.service.PromotionService;

import java.time.Duration;
import java.util.List;

/**
 * Mijoz sayti uchun aksiyalar va bannerlar endpoint'lari (login talab qilinmaydi).
 */
@RestController
@RequestMapping("/api/public")
@Tag(name = "Aksiyalar va bannerlar (mijoz)")
@RequiredArgsConstructor
public class PublicPromotionController {

    /**
     * Aksiyalar bo'yicha biznes mantiq.
     */
    private final PromotionService promotionService;

    /**
     * So'rovlarni cheklash vositasi (promo kodlarni ketma-ket sinab topishdan himoya).
     */
    private final RateLimiter rateLimiter;

    private  final PromoCodeService promoCodeService;

    /**
     * Hozir ko'rinadigan barcha aksiyalar va yangiliklar (aksiyalar sahifasi uchun).
     * Manzil: GET /api/public/promotions?lang=ru
     *
     * @param lang til kodi: "uz" (standart) yoki "ru"
     * @return aksiyalar ro'yxati
     */
    @GetMapping("/promotions")
    @Operation(summary = "Aksiyalar va yangiliklar ro'yxati")
    public List<PublicPromotionResponse> getAll(@RequestParam(defaultValue = "uz") String lang) {
        return promotionService.getPublicAll(lang);
    }

    /**
     * Aksiya sahifasi: bitta aksiyaning to'liq ma'lumoti slug bo'yicha.
     * Manzil: GET /api/public/promotions/navroz-aksiyasi?lang=ru
     *
     * @param slug aksiyaning URL uchun qisqa nomi (manzildan olinadi)
     * @param lang til kodi: "uz" (standart) yoki "ru"
     * @return aksiya (hozir ko'rinmasa yoki topilmasa 404)
     */
    @GetMapping("/promotions/{slug}")
    @Operation(summary = "Aksiya sahifasi (slug bo'yicha)")
    public PublicPromotionResponse getBySlug(@PathVariable String slug,
                                             @RequestParam(defaultValue = "uz") String lang) {
        return promotionService.getPublicBySlug(slug, lang);
    }

    /**
     * Bosh sahifadagi katta bannerlar (slayder uchun), tartib bo'yicha.
     * Manzil: GET /api/public/banners?lang=ru
     *
     * @param lang til kodi: "uz" (standart) yoki "ru"
     * @return bannerlar ro'yxati
     */
    @GetMapping("/banners")
    @Operation(summary = "Bosh sahifa bannerlari")
    public List<PublicPromotionResponse> getBanners(@RequestParam(defaultValue = "uz") String lang) {
        return promotionService.getPublicHome(lang);
    }


    @PostMapping({"/promo/validate", "/validate"})
    @Operation(summary = "Promo kodni tekshirish (chegirmani oldindan ko'rish)")
    public PromoValidateResponse validate(@Valid @RequestBody PromoValidateRequest request,
                                          HttpServletRequest http) {
        rateLimiter.acquireOrThrow("promo-ip:" + http.getRemoteAddr(), 5, Duration.ofMinutes(1));
        if (request.customerPhone() != null && !request.customerPhone().isBlank()) {
            rateLimiter.acquireOrThrow("promo-phone:" + request.customerPhone(), 5, Duration.ofMinutes(1));
        }
        return promoCodeService.validate(request);
    }
}
