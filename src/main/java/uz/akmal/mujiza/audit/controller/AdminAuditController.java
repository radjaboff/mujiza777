package uz.akmal.mujiza.audit.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uz.akmal.mujiza.audit.dto.AuditLogResponse;
import uz.akmal.mujiza.audit.service.AuditService;
import uz.akmal.mujiza.common.PageResponse;

/**
 * Admin panel uchun o'zgarishlar tarixi endpoint'i. Faqat ADMIN roli (SecurityConfig'da belgilanadi).
 */
@RestController
@RequestMapping("/api/admin/audit-log")
@Tag(name = "O'zgarishlar tarixi (admin)")
@RequiredArgsConstructor
public class AdminAuditController {

    /**
     * Tarix bo'yicha biznes mantiq.
     */
    private final AuditService auditService;

    /**
     * Tarix yozuvlari, eng yangisi birinchi. Manzil: GET /api/admin/audit-log?entityType=PRODUCT&actor=akmal017
     *
     * @param entityType nima o'zgargani bo'yicha filtr (ixtiyoriy)
     * @param actor      kim bajargani bo'yicha filtr (ixtiyoriy)
     * @param page       sahifa raqami, 0 dan (standart 0)
     * @param size       sahifa hajmi (standart 30, ko'pi bilan 100)
     * @return sahifalangan yozuvlar
     */
    @GetMapping
    @Operation(summary = "O'zgarishlar tarixi")
    public PageResponse<AuditLogResponse> search(@RequestParam(required = false) String entityType,
                                                 @RequestParam(required = false) String actor,
                                                 @RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "30") int size) {
        return auditService.search(entityType, actor, page, size);
    }
}