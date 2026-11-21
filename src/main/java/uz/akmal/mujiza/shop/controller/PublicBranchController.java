package uz.akmal.mujiza.shop.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uz.akmal.mujiza.shop.dto.PublicBranchResponse;
import uz.akmal.mujiza.shop.service.BranchService;

import java.util.List;

/**
 * Mijoz sayti uchun filiallar endpoint'i (login talab qilinmaydi).
 */
@RestController
@RequestMapping("/api/public/branches")
@Tag(name = "Filiallar (mijoz)")
@RequiredArgsConstructor
public class PublicBranchController {

    /**
     * Filiallar bo'yicha biznes mantiq.
     */
    private final BranchService branchService;

    /**
     * Mijozga ko'rinadigan (faol, o'chirilmagan) filiallar ro'yxati.
     * Manzil: GET /api/public/branches?lang=ru
     *
     * @param lang til kodi: "uz" (standart) yoki "ru"
     * @return filiallar ro'yxati, saytda ko'rsatish tartibida
     */
    @GetMapping
    @Operation(summary = "Faol filiallar ro'yxati")
    public List<PublicBranchResponse> getAll(@RequestParam(defaultValue = "uz") String lang) {
        return branchService.getPublicAll(lang);
    }
}