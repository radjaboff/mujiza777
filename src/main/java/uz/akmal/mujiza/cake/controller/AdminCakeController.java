package uz.akmal.mujiza.cake.controller;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import uz.akmal.mujiza.cake.dto.CakeOptionRequest;
import uz.akmal.mujiza.cake.dto.CakeOptionResponse;
import uz.akmal.mujiza.cake.dto.CakeTypeRequest;
import uz.akmal.mujiza.cake.dto.CakeTypeResponse;
import uz.akmal.mujiza.cake.enums.CakeOptionKind;
import uz.akmal.mujiza.cake.service.CakeCatalogService;

import java.util.List;

/**
 * Admin panel uchun tort konstruktori katalogini boshqarish endpoint'lari.
 * Faqat ADMIN roli (do'kon egasi) kira oladi: bu narxlarga ta'sir qiladi (SecurityConfig'da belgilanadi).
 */
@RestController
@RequestMapping("/api/admin/cake")
@Tag(name = "Tort konstruktori (admin)")
@RequiredArgsConstructor
public class AdminCakeController {

    /**
     * Tort katalogi bo'yicha biznes mantiq.
     */
    private final CakeCatalogService cakeCatalogService;

    /**
     * Barcha o'chirilmagan tort turlari. Manzil: GET /api/admin/cake/types
     *
     * @return turlar ro'yxati
     */
    @GetMapping("/types")
    @Operation(summary = "Tort turlari (admin)")
    public List<CakeTypeResponse> getTypes() {
        return cakeCatalogService.getTypes();
    }

    /**
     * Yangi tort turi yaratadi. Manzil: POST /api/admin/cake/types
     *
     * @param request admin yuborgan ma'lumot
     * @return yaratilgan tur (201)
     */
    @PostMapping("/types")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Yangi tort turi yaratish")
    public CakeTypeResponse createType(@Valid @RequestBody CakeTypeRequest request) {
        return cakeCatalogService.createType(request);
    }

    /**
     * Tort turini tahrirlaydi. Manzil: PUT /api/admin/cake/types/{id}
     *
     * @param id      turning raqami
     * @param request yangi ma'lumot
     * @return yangilangan tur
     */
    @PutMapping("/types/{id}")
    @Operation(summary = "Tort turini tahrirlash")
    public CakeTypeResponse updateType(@PathVariable Long id, @Valid @RequestBody CakeTypeRequest request) {
        return cakeCatalogService.updateType(id, request);
    }

    /**
     * Tort turini o'chiradi (soft delete). Manzil: DELETE /api/admin/cake/types/{id}
     *
     * @param id turning raqami
     */
    @DeleteMapping("/types/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Tort turini o'chirish")
    public void deleteType(@PathVariable Long id) {
        cakeCatalogService.deleteType(id);
    }

    /**
     * Tort variantlari, ixtiyoriy ravishda bitta guruh bo'yicha. Manzil: GET /api/admin/cake/options?kind=FLAVOR
     *
     * @param kind guruh (ixtiyoriy)
     * @return variantlar ro'yxati
     */
    @GetMapping("/options")
    @Operation(summary = "Tort variantlari (admin)")
    public List<CakeOptionResponse> getOptions(@RequestParam(required = false) CakeOptionKind kind) {
        return cakeCatalogService.getOptions(kind);
    }

    /**
     * Yangi variant yaratadi. Manzil: POST /api/admin/cake/options
     *
     * @param request admin yuborgan ma'lumot
     * @return yaratilgan variant (201)
     */
    @PostMapping("/options")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Yangi tort varianti yaratish")
    public CakeOptionResponse createOption(@Valid @RequestBody CakeOptionRequest request) {
        return cakeCatalogService.createOption(request);
    }

    /**
     * Variantni tahrirlaydi. Manzil: PUT /api/admin/cake/options/{id}
     *
     * @param id      variantning raqami
     * @param request yangi ma'lumot
     * @return yangilangan variant
     */
    @PutMapping("/options/{id}")
    @Operation(summary = "Tort variantini tahrirlash")
    public CakeOptionResponse updateOption(@PathVariable Long id, @Valid @RequestBody CakeOptionRequest request) {
        return cakeCatalogService.updateOption(id, request);
    }

    /**
     * Variantni o'chiradi (soft delete). Manzil: DELETE /api/admin/cake/options/{id}
     *
     * @param id variantning raqami
     */
    @DeleteMapping("/options/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Tort variantini o'chirish")
    public void deleteOption(@PathVariable Long id) {
        cakeCatalogService.deleteOption(id);
    }
}