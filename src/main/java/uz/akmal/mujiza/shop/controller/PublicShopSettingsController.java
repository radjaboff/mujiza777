package uz.akmal.mujiza.shop.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.akmal.mujiza.shop.dto.PublicShopSettingsResponse;
import uz.akmal.mujiza.shop.service.ShopSettingsService;

/**
 * Mijoz sayti uchun do'kon sozlamalari endpoint'i (login talab qilinmaydi).
 */
@RestController
@RequestMapping("/api/public/settings")
@Tag(name = "Sozlamalar (mijoz)")
@RequiredArgsConstructor
public class PublicShopSettingsController {

    /**
     * Sozlamalar bo'yicha biznes mantiq.
     */
    private final ShopSettingsService shopSettingsService;

    /**
     * Mijozga ko'rinadigan sozlamalar: telefon, ish vaqti, do'kon hozir ochiqmi,
     * yetkazib berish narxi va boshqalar.
     * Manzil: GET /api/public/settings
     *
     * @return ochiq sozlamalar
     */
    @GetMapping
    @Operation(summary = "Do'kon sozlamalari (ochiq qismi)")
    public PublicShopSettingsResponse get() {
        return shopSettingsService.getPublic();
    }
}