package uz.akmal.mujiza.shop.controller;

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
import uz.akmal.mujiza.shop.dto.BranchRequest;
import uz.akmal.mujiza.shop.dto.BranchResponse;
import uz.akmal.mujiza.shop.service.BranchService;

import java.util.List;

/**
 * Admin panel uchun filiallarni boshqarish endpoint'lari.
 * Faqat ADMIN roli bilan ishlaydi (SecurityConfig'da belgilangan).
 */
@RestController
@RequestMapping("/api/admin/branches")
@Tag(name = "Filiallar (admin)")
@RequiredArgsConstructor
public class AdminBranchController {

    /**
     * Filiallar bo'yicha biznes mantiq.
     */
    private final BranchService branchService;

    /**
     * Barcha o'chirilmagan filiallar (yashirinlari ham).
     * Manzil: GET /api/admin/branches
     *
     * @return filiallar ro'yxati
     */
    @GetMapping
    @Operation(summary = "Barcha filiallar (admin)")
    public List<BranchResponse> getAll() {
        return branchService.getAll();
    }

    /**
     * Bitta filialni id bo'yicha qaytaradi.
     * Manzil: GET /api/admin/branches/{id}
     *
     * @param id filialning raqami (manzildan olinadi)
     * @return filial ma'lumoti (topilmasa 404)
     */
    @GetMapping("/{id}")
    @Operation(summary = "Filialni id bo'yicha olish")
    public BranchResponse getById(@PathVariable Long id) {
        return branchService.getById(id);
    }

    /**
     * Yangi filial yaratadi.
     * Manzil: POST /api/admin/branches
     * @Valid: BranchRequest'dagi validation qoidalari tekshiriladi, buzilsa 400 xatosi qaytadi.
     *
     * @param request admin yuborgan ma'lumot (JSON)
     * @return yaratilgan filial (201)
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Yangi filial yaratish")
    public BranchResponse create(@Valid @RequestBody BranchRequest request) {
        return branchService.create(request);
    }

    /**
     * Filialni tahrirlaydi.
     * Manzil: PUT /api/admin/branches/{id}
     *
     * @param id      tahrirlanayotgan filialning raqami
     * @param request yangi ma'lumot
     * @return yangilangan filial
     */
    @PutMapping("/{id}")
    @Operation(summary = "Filialni tahrirlash")
    public BranchResponse update(@PathVariable Long id, @Valid @RequestBody BranchRequest request) {
        return branchService.update(id, request);
    }

    /**
     * Filialni o'chiradi (soft delete). Muvaffaqiyatli bo'lsa 204 (javob tanasi yo'q) qaytadi.
     * Manzil: DELETE /api/admin/branches/{id}
     *
     * @param id o'chiriladigan filialning raqami
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Filialni o'chirish")
    public void delete(@PathVariable Long id) {
        branchService.delete(id);
    }
}