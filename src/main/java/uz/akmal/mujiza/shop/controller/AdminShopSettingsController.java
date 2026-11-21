package uz.akmal.mujiza.shop.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.akmal.mujiza.shop.dto.ShopSettingsRequest;
import uz.akmal.mujiza.shop.dto.ShopSettingsResponse;
import uz.akmal.mujiza.shop.service.ShopSettingsService;

/**
 * Admin panel uchun do'kon sozlamalarini boshqarish endpoint'lari.
 * Faqat ADMIN roli (do'kon egasi) kira oladi (SecurityConfig'da belgilangan).
 */
@RestController
@RequestMapping("/api/admin/settings")
@Tag(name = "Sozlamalar (admin)")
@RequiredArgsConstructor
public class AdminShopSettingsController {

    /**
     * Sozlamalar bo'yicha biznes mantiq.
     */
    private final ShopSettingsService shopSettingsService;

    /**
     * Joriy sozlamalarni qaytaradi.
     * Manzil: GET /api/admin/settings
     *
     * @return barcha sozlamalar
     */
    @GetMapping
    @Operation(summary = "Do'kon sozlamalarini olish (admin)")
    public ShopSettingsResponse get() {
        return shopSettingsService.get();
    }

    /**
     * Sozlamalarni yangilaydi. Hamma maydon to'liq yuboriladi.
     * Manzil: PUT /api/admin/settings
     * @Valid: ShopSettingsRequest'dagi validation qoidalari tekshiriladi, buzilsa 400 xatosi qaytadi.
     *
     * @param request yangi sozlamalar (JSON)
     * @return yangilangan sozlamalar
     */
    @PutMapping
    @Operation(summary = "Do'kon sozlamalarini yangilash (admin)")
    public ShopSettingsResponse update(@Valid @RequestBody ShopSettingsRequest request) {
        return shopSettingsService.update(request);
    }
}