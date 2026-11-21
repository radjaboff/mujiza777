package uz.akmal.mujiza.order.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import uz.akmal.mujiza.cake.dto.CakeOrderCreateRequest;
import uz.akmal.mujiza.common.RateLimiter;
import uz.akmal.mujiza.order.dto.PublicOrderResponse;
import uz.akmal.mujiza.order.service.OrderService;

import java.time.Duration;
import java.util.UUID;

/**
 * Mijoz sayti uchun tort buyurtmasi endpoint'i (login talab qilinmaydi).
 */
@RestController
@RequestMapping("/api/public/cake-orders")
@Tag(name = "Tort buyurtmasi (mijoz)")
@RequiredArgsConstructor
public class PublicCakeOrderController {

    /**
     * Buyurtmalar bo'yicha biznes mantiq.
     */
    private final OrderService orderService;

    /**
     * So'rovlarni cheklash vositasi.
     */
    private final RateLimiter rateLimiter;

    /**
     * Tort buyurtmasi beradi. Buyurtma "PRICE_PENDING" holatida tushadi: do'kon narxni tasdiqlaguncha kutiladi.
     * Bir IP dan soatiga ko'pi bilan 5 ta buyurtma qabul qilinadi.
     * Manzil: POST /api/public/cake-orders?lang=ru
     *
     * @param request mijoz yuborgan ma'lumot (tort tanlovi va buyurtma tafsilotlari)
     * @param lang    javob tili: "uz" (standart) yoki "ru"
     * @param http    joriy so'rov (IP manzilni bilish uchun)
     * @return yaratilgan buyurtma (201), ichida "cake" tafsilotlari bor
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Tort buyurtmasi berish")
    public PublicOrderResponse create(@Valid @RequestBody CakeOrderCreateRequest request,
                                      @RequestParam(defaultValue = "uz") String lang,
                                      @RequestHeader("Idempotency-Key") UUID idempotencyKey,
                                      HttpServletRequest http) {
        rateLimiter.acquireOrThrow("cake-order:" + http.getRemoteAddr(), 5, Duration.ofHours(1));
        return orderService.createCakeOrder(request, lang, idempotencyKey);
    }
}
