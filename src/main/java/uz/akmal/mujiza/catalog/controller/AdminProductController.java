package uz.akmal.mujiza.catalog.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import uz.akmal.mujiza.catalog.dto.ProductFilter;
import uz.akmal.mujiza.catalog.dto.ProductRequest;
import uz.akmal.mujiza.catalog.dto.ProductResponse;
import uz.akmal.mujiza.catalog.service.ProductService;
import uz.akmal.mujiza.common.PageResponse;

/**
 * Admin panel uchun mahsulotlarni boshqarish endpoint'lari.
 * Hozircha ochiq, 3-bosqichda Spring Security bilan faqat adminlarga yopamiz.
 */
@RestController
@RequestMapping("/api/admin/products")
@Tag(name = "Mahsulotlar (admin)")
@RequiredArgsConstructor
public class AdminProductController {

    /**
     * Mahsulotlar bo'yicha biznes mantiq.
     */
    private final ProductService productService;

    /**
     * Admin uchun mahsulotlar ro'yxati (filtr, saralash va sahifalash bilan).
     * Mijoz ro'yxatidan farqi: sotuvda yo'q va yashirin kategoriyadagi mahsulotlar ham ko'rinadi.
     * Manzil: GET /api/admin/products
     *
     * @param filter filtr shartlari (hammasi ixtiyoriy)
     * @param page   sahifa raqami, 0 dan boshlanadi (standart 0)
     * @param size   bir sahifadagi mahsulotlar soni (standart 20, ko'pi bilan 50)
     * @param sort   saralash: "price_asc", "price_desc", "newest"; bo'sh bo'lsa standart tartib
     * @return sahifalangan mahsulotlar
     */
    @GetMapping
    @Operation(summary = "Mahsulotlar ro'yxati (admin)")
    public PageResponse<ProductResponse> getAll(
            @ParameterObject ProductFilter filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sort) {
        return productService.getAll(filter, page, size, sort);
    }

    /**
     * Bitta mahsulotni id bo'yicha qaytaradi.
     * Manzil: GET /api/admin/products/{id}
     *
     * @param id mahsulotning raqami (manzildan olinadi)
     * @return mahsulot ma'lumoti (topilmasa 404)
     */
    @GetMapping("/{id}")
    @Operation(summary = "Mahsulotni id bo'yicha olish")
    public ProductResponse getById(@PathVariable Long id) {
        return productService.getById(id);
    }

    /**
     * Yangi mahsulot yaratadi.
     * Manzil: POST /api/admin/products
     * @Valid: ProductRequest'dagi validation qoidalari tekshiriladi, buzilsa 400 xatosi qaytadi.
     * @ResponseStatus(CREATED): muvaffaqiyatli yaratilganda 201 status qaytadi.
     *
     * @param request admin yuborgan ma'lumot (JSON)
     * @return yaratilgan mahsulot
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Yangi mahsulot yaratish")
    public ProductResponse create(@Valid @RequestBody ProductRequest request) {
        return productService.create(request);
    }

    /**
     * Mahsulotni tahrirlaydi.
     * Manzil: PUT /api/admin/products/{id}
     *
     * @param id      tahrirlanayotgan mahsulotning raqami
     * @param request yangi ma'lumot
     * @return yangilangan mahsulot
     */
    @PutMapping("/{id}")
    @Operation(summary = "Mahsulotni tahrirlash")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return productService.update(id, request);
    }

    /**
     * Mahsulotni tezkor "mavjud" yoki "mavjud emas" qiladi (tahrirlash oynasini ochmasdan).
     * Manzil: PATCH /api/admin/products/{id}/availability?available=false
     *
     * @param id        mahsulotning raqami
     * @param available true: sotuvda bor, false: mavjud emas
     * @return yangilangan mahsulot
     */
    @PatchMapping("/{id}/availability")
    @Operation(summary = "Mahsulotni mavjud / mavjud emas qilish")
    public ProductResponse updateAvailability(@PathVariable Long id, @RequestParam boolean available) {
        return productService.updateAvailability(id, available);
    }

    /**
     * Mahsulotni o'chiradi (soft delete). Muvaffaqiyatli bo'lsa 204 (javob tanasi yo'q) qaytadi.
     * Manzil: DELETE /api/admin/products/{id}
     *
     * @param id o'chiriladigan mahsulotning raqami
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Mahsulotni o'chirish")
    public void delete(@PathVariable Long id) {
        productService.delete(id);
    }
}