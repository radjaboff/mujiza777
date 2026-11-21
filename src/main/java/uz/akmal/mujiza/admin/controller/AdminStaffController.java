package uz.akmal.mujiza.admin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import uz.akmal.mujiza.admin.dto.StaffCreateRequest;
import uz.akmal.mujiza.admin.dto.StaffResponse;
import uz.akmal.mujiza.admin.dto.StaffUpdateRequest;
import uz.akmal.mujiza.admin.service.AdminStaffService;

import java.util.List;

/**
 * Xodimlarni boshqarish endpoint'lari. Faqat ADMIN roli (SecurityConfig'da belgilanadi).
 */
@RestController
@RequestMapping("/api/admin/staff")
@Tag(name = "Xodimlar (admin)")
@RequiredArgsConstructor
public class AdminStaffController {

    /**
     * Xodimlar bo'yicha biznes mantiq.
     */
    private final AdminStaffService staffService;

    /**
     * Barcha xodimlar. Manzil: GET /api/admin/staff
     *
     * @return xodimlar ro'yxati
     */
    @GetMapping
    @Operation(summary = "Xodimlar ro'yxati")
    public List<StaffResponse> getAll() {
        return staffService.getAll();
    }

    /**
     * Yangi xodim yaratadi. Manzil: POST /api/admin/staff
     *
     * @param request xodim ma'lumoti va boshlang'ich parol
     * @return yaratilgan xodim (201)
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Yangi xodim yaratish")
    public StaffResponse create(@Valid @RequestBody StaffCreateRequest request) {
        return staffService.create(request);
    }

    /**
     * Xodimni tahrirlaydi (ism, rol, faollik, yangi parol). Manzil: PUT /api/admin/staff/{id}
     *
     * @param id             xodimning raqami
     * @param request        yangi ma'lumot (ixtiyoriy maydonlar)
     * @param authentication joriy admin (o'zini cheklash qoidalari uchun)
     * @return yangilangan xodim
     */
    @PutMapping("/{id}")
    @Operation(summary = "Xodimni tahrirlash")
    public StaffResponse update(@PathVariable Long id, @Valid @RequestBody StaffUpdateRequest request,
                                Authentication authentication) {
        return staffService.update(id, request, authentication.getName());
    }
}