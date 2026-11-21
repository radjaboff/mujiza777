package uz.akmal.mujiza.cake.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uz.akmal.mujiza.cake.dto.CakePriceRequest;
import uz.akmal.mujiza.cake.dto.CakePriceResponse;
import uz.akmal.mujiza.cake.dto.PublicCakeConfigResponse;
import uz.akmal.mujiza.cake.service.CakeCatalogService;

/**
 * Mijoz sayti uchun tort konstruktori endpoint'lari (login talab qilinmaydi).
 */
@RestController
@RequestMapping("/api/public/cake-builder")
@Tag(name = "Tort konstruktori (mijoz)")
@RequiredArgsConstructor
public class PublicCakeController {

    /**
     * Tort katalogi bo'yicha biznes mantiq.
     */
    private final CakeCatalogService cakeCatalogService;

    /**
     * Konstruktor sozlamalari: tort turlari, variant guruhlari va ularning qoidalari.
     * Manzil: GET /api/public/cake-builder/config?lang=ru
     *
     * @param lang til kodi: "uz" (standart) yoki "ru"
     * @return sozlamalar
     */
    @GetMapping("/config")
    @Operation(summary = "Tort konstruktori sozlamalari")
    public PublicCakeConfigResponse getConfig(@RequestParam(defaultValue = "uz") String lang) {
        return cakeCatalogService.getPublicConfig(lang);
    }

    /**
     * Tanlovga qarab tort narxini hisoblaydi (jonli narx uchun, har bir o'zgarishda chaqiriladi).
     * Hech narsa saqlanmaydi. Manzil: POST /api/public/cake-builder/price?lang=ru
     *
     * @param request tanlov (tur, vazn, variantlar)
     * @param lang    til kodi: "uz" (standart) yoki "ru"
     * @return narx hisob-kitobi qatorlari bilan
     */
    @PostMapping("/price")
    @Operation(summary = "Tort narxini hisoblash")
    public CakePriceResponse calculatePrice(@Valid @RequestBody CakePriceRequest request,
                                            @RequestParam(defaultValue = "uz") String lang) {
        return cakeCatalogService.calculatePrice(request, lang);
    }
}