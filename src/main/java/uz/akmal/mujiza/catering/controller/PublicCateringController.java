package uz.akmal.mujiza.catering.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import uz.akmal.mujiza.catering.dto.CateringCreateRequest;
import uz.akmal.mujiza.catering.dto.CateringReceivedResponse;
import uz.akmal.mujiza.catering.service.CateringService;
import uz.akmal.mujiza.common.RateLimiter;

import java.time.Duration;

/**
 * Mijoz sayti uchun keytering so'rovi endpoint'i (login talab qilinmaydi).
 */
@RestController
@RequestMapping("/api/public/catering-requests")
@Tag(name = "Keytering (mijoz)")
@RequiredArgsConstructor
public class PublicCateringController {

    /**
     * Keytering so'rovlari bo'yicha biznes mantiq.
     */
    private final CateringService cateringService;

    /**
     * So'rovlarni cheklash vositasi.
     */
    private final RateLimiter rateLimiter;

    /**
     * Keytering so'rovi yuboradi. Bir IP dan soatiga ko'pi bilan 5 ta so'rov qabul qilinadi.
     * Manzil: POST /api/public/catering-requests
     *
     * @param request mijoz to'ldirgan forma (JSON)
     * @param http    joriy so'rov (IP manzilni bilish uchun)
     * @return qabul qilingan so'rovning raqami (201)
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Keytering so'rovi yuborish")
    public CateringReceivedResponse create(@Valid @RequestBody CateringCreateRequest request,
                                           HttpServletRequest http) {
        rateLimiter.acquireOrThrow("catering:" + http.getRemoteAddr(), 5, Duration.ofHours(1));
        return cateringService.create(request);
    }
}