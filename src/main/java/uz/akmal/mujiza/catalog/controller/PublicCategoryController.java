package uz.akmal.mujiza.catalog.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uz.akmal.mujiza.catalog.dto.PublicCategoryResponse;
import uz.akmal.mujiza.catalog.service.CategoryService;

import java.util.List;

/**
 * Mijoz sayti uchun kategoriyalar endpoint'lari (login talab qilinmaydi).
 *
 * @RestController: bu klass API so'rovlariga javob beradi, natija JSON bo'lib qaytadi.
 * @RequestMapping: bu klassdagi barcha endpoint'lar manzili shu yo'l bilan boshlanadi.
 * @Tag: Swagger'da endpoint'larni shu nom ostida guruhlaydi.
 * @RequiredArgsConstructor (Lombok): final maydonlar uchun konstruktor yaratadi, Spring service'ni o'zi beradi.
 */
@RestController
@RequestMapping("/api/public/categories")
@Tag(name = "Kategoriyalar (mijoz)")
@RequiredArgsConstructor
public class PublicCategoryController {

    /**
     * Kategoriyalar bo'yicha biznes mantiq (controller faqat interfeysni biladi).
     */
    private final CategoryService categoryService;

    /**
     * Mijozga ko'rinadigan (faol, o'chirilmagan) kategoriyalar ro'yxatini qaytaradi.
     * Manzil: GET /api/public/categories?lang=ru
     *
     * @param lang til kodi: "uz" (standart) yoki "ru". Nomlar shu tilda qaytadi.
     * @return kategoriyalar ro'yxati, saytda ko'rsatish tartibida
     */
    @GetMapping
    @Operation(summary = "Faol kategoriyalar ro'yxati")
    public List<PublicCategoryResponse> getAll(@RequestParam(defaultValue = "uz") String lang) {
        return categoryService.getPublicAll(lang);
    }
}