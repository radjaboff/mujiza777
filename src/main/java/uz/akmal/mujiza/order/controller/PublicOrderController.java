package uz.akmal.mujiza.order.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import uz.akmal.mujiza.common.RateLimiter;
import uz.akmal.mujiza.order.dto.CustomerCancelRequest;
import uz.akmal.mujiza.order.dto.OrderCreateRequest;
import uz.akmal.mujiza.order.dto.PublicOrderResponse;
import uz.akmal.mujiza.order.service.OrderService;
import uz.akmal.mujiza.order.stream.OrderStreamService;

import java.time.Duration;
import java.util.UUID;

/**
 * Mijoz sayti uchun buyurtma endpoint'lari (login talab qilinmaydi).
 */
@RestController
@RequestMapping("/api/public/orders")
@Tag(name = "Buyurtmalar (mijoz)")
@RequiredArgsConstructor
public class PublicOrderController {

    /**
     * Buyurtmalar bo'yicha biznes mantiq.
     */
    private final OrderService orderService;

    /**
     * So'rovlarni cheklash vositasi (buyurtma spamidan himoya).
     */
    private final RateLimiter rateLimiter;

    /**
     * Kuzatuv sahifalari bilan ochiq ulanishlarni boshqaruvchi.
     */
    private final OrderStreamService orderStreamService;

    /**
     * Yangi buyurtma beradi.
     * Manzil: POST /api/public/orders?lang=ru
     * @Valid: OrderCreateRequest'dagi validation qoidalari tekshiriladi, buzilsa 400 xatosi qaytadi.
     *
     * @param request mijoz yuborgan buyurtma (JSON)
     * @param lang    javob tili: "uz" (standart) yoki "ru"
     * @return yaratilgan buyurtma: raqami, kuzatuv kaliti, summalari (201)
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Buyurtma berish")
    public PublicOrderResponse create(@Valid @RequestBody OrderCreateRequest request,
                                      @RequestParam(defaultValue = "uz") String lang,
                                      @RequestHeader("Idempotency-Key") UUID idempotencyKey,
                                      HttpServletRequest http) {
        rateLimiter.acquireOrThrow("order-ip:" + http.getRemoteAddr(), 5, Duration.ofMinutes(1));
        rateLimiter.acquireOrThrow("order-phone:" + request.customerPhone(), 5, Duration.ofMinutes(1));
        return orderService.create(request, lang, idempotencyKey);
    }



    /**
     * Buyurtmani kuzatadi: hozirgi holati, mahsulotlari va holatlar tarixi.
     * Manzil: GET /api/public/orders/track/{token}?lang=ru
     *
     * @param token kuzatuv kaliti (buyurtma berilganda javobda keladi)
     * @param lang  javob tili: "uz" (standart) yoki "ru"
     * @return buyurtma ma'lumoti (kalit noto'g'ri bo'lsa 404)
     */
    @GetMapping("/track/{token}")
    @Operation(summary = "Buyurtmani kuzatish")
    public PublicOrderResponse track(@PathVariable String token,
                                     @RequestParam(defaultValue = "uz") String lang) {
        return orderService.track(token, lang);
    }

    /**
     * Mijoz buyurtmani o'zi bekor qiladi (faqat do'kon hali tasdiqlamagan bo'lsa).
     * Manzil: POST /api/public/orders/track/{token}/cancel
     * So'rov tanasi ixtiyoriy: sabab yozilsa yuboriladi, yozilmasa tanasiz yuborish mumkin.
     *
     * @param token   kuzatuv kaliti
     * @param request bekor qilish sababi (ixtiyoriy)
     * @param lang    javob tili: "uz" (standart) yoki "ru"
     * @return bekor qilingan buyurtma
     */
    @PostMapping("/track/{token}/cancel")
    @Operation(summary = "Buyurtmani bekor qilish (mijoz)")
    public PublicOrderResponse cancel(@PathVariable String token,
                                      @Valid @RequestBody(required = false) CustomerCancelRequest request,
                                      @RequestParam(defaultValue = "uz") String lang,
                                      HttpServletRequest http) {
        // Bir IP dan soatiga ko'pi bilan 20 ta bekor qilish urinishi
        rateLimiter.acquireOrThrow("order-cancel:" + http.getRemoteAddr(), 20, Duration.ofHours(1));
        return orderService.cancelByCustomer(token, request, lang);
    }


    /**
     * Buyurtma holati o'zgarishini real vaqtda kuzatish uchun uzluksiz ulanish ochadi (SSE).
     * Frontend: new EventSource(".../api/public/orders/track/{token}/stream"). Server "status" xabarini yuborganda
     * sahifa GET .../track/{token} orqali yangi ma'lumotni qayta oladi.
     * Manzil: GET /api/public/orders/track/{token}/stream
     *
     * @param token kuzatuv kaliti
     * @return ochiq ulanish (kalit noto'g'ri bo'lsa 404)
     */
    @GetMapping("/track/{token}/stream")
    @Operation(summary = "Buyurtma holatini real vaqtda kuzatish (SSE)")
    public SseEmitter stream(@PathVariable String token) {
        // Avval kalit mavjudligini tekshiramiz (noto'g'ri kalit uchun ulanish ochilmaydi)
        orderService.verifyTrackingToken(token);
        return orderStreamService.subscribe(token);
    }
}
