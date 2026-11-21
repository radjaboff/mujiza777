package uz.akmal.mujiza.catalog.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uz.akmal.mujiza.catalog.dto.ProductFilter;
import uz.akmal.mujiza.catalog.dto.PublicProductDetailResponse;
import uz.akmal.mujiza.catalog.dto.PublicProductResponse;
import uz.akmal.mujiza.catalog.service.ProductService;
import uz.akmal.mujiza.common.PageResponse;

import java.util.List;

/**
 * Mijoz sayti uchun mahsulotlar endpoint'lari (login talab qilinmaydi).
 *
 * @RestController: bu klass API so'rovlariga javob beradi, natija JSON bo'lib qaytadi.
 * @RequestMapping: bu klassdagi barcha endpoint'lar manzili shu yo'l bilan boshlanadi.
 * @Tag: Swagger'da endpoint'larni shu nom ostida guruhlaydi.
 * @RequiredArgsConstructor (Lombok): final maydonlar uchun konstruktor yaratadi, Spring service'ni o'zi beradi.
 */
@RestController
@RequestMapping("/api/public/products")
@Tag(name = "Mahsulotlar (mijoz)")
@RequiredArgsConstructor
public class PublicProductController {

    /**
     * Mahsulotlar bo'yicha biznes mantiq (controller faqat interfeysni biladi).
     */
    private final ProductService productService;

    /**
     * Katalog: mijozga ko'rinadigan mahsulotlar ro'yxati (filtr, saralash va sahifalash bilan).
     * Manzil misoli: GET /api/public/products?categorySlug=tortlar&maxPrice=300000&excludeAllergens=NUTS&sort=price_asc&lang=ru
     * @ParameterObject: filtr maydonlari (categorySlug, search, minPrice va h.k.) URL parametrlaridan yig'iladi
     * va Swagger'da alohida-alohida maydon bo'lib ko'rinadi.
     *
     * @param filter filtr shartlari (hammasi ixtiyoriy)
     * @param page   sahifa raqami, 0 dan boshlanadi (standart 0)
     * @param size   bir sahifadagi mahsulotlar soni (standart 12, ko'pi bilan 50)
     * @param sort   saralash: "price_asc", "price_desc", "newest"; bo'sh bo'lsa standart tartib
     * @param lang   til kodi: "uz" (standart) yoki "ru"
     * @return sahifalangan mahsulot kartochkalari
     */
    @GetMapping
    @Operation(summary = "Katalog: mahsulotlar ro'yxati (filtr va sahifalash bilan)")
    public PageResponse<PublicProductResponse> getAll(
            @ParameterObject ProductFilter filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "uz") String lang) {
        return productService.getPublicAll(filter, page, size, sort, lang);
    }

    /**
     * Mahsulot sahifasi: bitta mahsulotning to'liq ma'lumoti slug bo'yicha.
     * Manzil misoli: GET /api/public/products/napoleon-torti?lang=ru
     *
     * @param slug mahsulotning URL uchun qisqa nomi (manzildan olinadi)
     * @param lang til kodi: "uz" (standart) yoki "ru"
     * @return mahsulotning to'liq ma'lumoti (topilmasa 404)
     */
    @GetMapping("/{slug}")
    @Operation(summary = "Mahsulot sahifasi (slug bo'yicha)")
    public PublicProductDetailResponse getBySlug(@PathVariable String slug,
                                                 @RequestParam(defaultValue = "uz") String lang) {
        return productService.getPublicBySlug(slug, lang);
    }



    /**
     * "Birga olinadi" tavsiyalari: shu mahsulot bilan ko'pincha birga buyurtma qilinadigan mahsulotlar.
     * Manzil: GET /api/public/products/napoleon-torti/recommendations?limit=4&lang=ru
     *
     * @param slug  asosiy mahsulotning slug'i
     * @param lang  til kodi: "uz" (standart) yoki "ru"
     * @param limit eng ko'p nechta tavsiya (standart 4, ko'pi bilan 12)
     * @return tavsiyalar ro'yxati (bo'sh bo'lishi mumkin)
     */
    @GetMapping("/{slug}/recommendations")
    @Operation(summary = "Birga olinadi tavsiyalari")
    public List<PublicProductResponse> getRecommendations(@PathVariable String slug,
                                                          @RequestParam(defaultValue = "uz") String lang,
                                                          @RequestParam(defaultValue = "4") int limit) {
        return productService.getPublicRecommendations(slug, lang, limit);
    }
}