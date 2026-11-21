package uz.akmal.mujiza.catalog.controller;

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
import uz.akmal.mujiza.catalog.dto.CategoryRequest;
import uz.akmal.mujiza.catalog.dto.CategoryResponse;
import uz.akmal.mujiza.catalog.service.CategoryService;

import java.util.List;

/**
 * Admin panel uchun kategoriyalarni boshqarish endpoint'lari.
 * Hozircha ochiq, 3-bosqichda Spring Security bilan faqat adminlarga yopamiz.
 */
@RestController
@RequestMapping("/api/admin/categories")
@Tag(name = "Kategoriyalar (admin)")
@RequiredArgsConstructor
public class AdminCategoryController {

    /**
     * Kategoriyalar bo'yicha biznes mantiq.
     */
    private final CategoryService categoryService;

    /**
     * Barcha o'chirilmagan kategoriyalar (yashirinlari ham).
     * Manzil: GET /api/admin/categories
     *
     * @return kategoriyalar ro'yxati
     */
    @GetMapping
    @Operation(summary = "Barcha kategoriyalar (admin)")
    public List<CategoryResponse> getAll() {
        return categoryService.getAll();
    }

    /**
     * Bitta kategoriyani id bo'yicha qaytaradi.
     * Manzil: GET /api/admin/categories/{id}
     *
     * @param id kategoriyaning raqami (manzildan olinadi)
     * @return kategoriya ma'lumoti (topilmasa 404)
     */
    @GetMapping("/{id}")
    @Operation(summary = "Kategoriyani id bo'yicha olish")
    public CategoryResponse getById(@PathVariable Long id) {
        return categoryService.getById(id);
    }

    /**
     * Yangi kategoriya yaratadi.
     * Manzil: POST /api/admin/categories
     * @Valid: CategoryRequest'dagi validation qoidalari tekshiriladi, buzilsa 400 xatosi qaytadi.
     * @ResponseStatus(CREATED): muvaffaqiyatli yaratilganda 201 status qaytadi.
     *
     * @param request admin yuborgan ma'lumot (JSON)
     * @return yaratilgan kategoriya
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Yangi kategoriya yaratish")
    public CategoryResponse create(@Valid @RequestBody CategoryRequest request) {
        return categoryService.create(request);
    }

    /**
     * Kategoriyani tahrirlaydi.
     * Manzil: PUT /api/admin/categories/{id}
     *
     * @param id      tahrirlanayotgan kategoriyaning raqami
     * @param request yangi ma'lumot
     * @return yangilangan kategoriya
     */
    @PutMapping("/{id}")
    @Operation(summary = "Kategoriyani tahrirlash")
    public CategoryResponse update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return categoryService.update(id, request);
    }

    /**
     * Kategoriyani o'chiradi (soft delete). Muvaffaqiyatli bo'lsa 204 (javob tanasi yo'q) qaytadi.
     * Manzil: DELETE /api/admin/categories/{id}
     *
     * @param id o'chiriladigan kategoriyaning raqami
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Kategoriyani o'chirish")
    public void delete(@PathVariable Long id) {
        categoryService.delete(id);
    }
}