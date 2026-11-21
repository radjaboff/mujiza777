package uz.akmal.mujiza.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import uz.akmal.mujiza.common.ShopTime;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Butun loyiha bo'yicha xatolarni bir joyda ushlab, hammasini bir xil JSON formatiga (ErrorResponse) aylantiradi.
 * Controller ichida xato chiqsa, Spring avtomatik shu klassdagi mos metodni chaqiradi.
 *
 * @RestControllerAdvice: bu klass barcha controller'larga tegishli xato ushlagich ekanini bildiradi.
 * @Slf4j (Lombok): "log" nomli o'zgaruvchini yaratadi, log.error(...) kabi yozuvlar yozish uchun.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Yozuv topilmaganda (ResourceNotFoundException) ishlaydi.
     * Mijozga 404 (Not Found) qaytaradi.
     *
     * @param ex      tashlangan xato (ichida xabar bor)
     * @param request joriy so'rov, qaysi manzilda xato chiqqanini bilish uchun
     * @return 404 statusli ErrorResponse
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex,
                                                        HttpServletRequest request) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request, null);
    }

    /**
     * Biznes qoidasi buzilganda (BusinessException) ishlaydi.
     * Status xatoning o'zidan olinadi (odatda 400, ba'zan 409).
     *
     * @param ex      tashlangan biznes xato
     * @param request joriy so'rov
     * @return xatoda belgilangan statusli ErrorResponse
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException ex,
                                                        HttpServletRequest request) {
        return buildResponse(ex.getStatus(), ex.getMessage(), request, null);
    }

    /**
     * DTO'dagi validation (@NotBlank, @Positive va h.k.) buzilganda ishlaydi.
     * Qaysi maydonda qanday xato borligini fieldErrors ichida qaytaradi.
     *
     * @param ex      validation xatosi, ichida barcha noto'g'ri maydonlar bor
     * @param request joriy so'rov
     * @return 400 statusli ErrorResponse (fieldErrors to'ldirilgan)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex,
                                                          HttpServletRequest request) {
        // Maydon nomi -> xato matni juftliklarini yig'adigan xarita
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> fieldErrors.put(error.getField(), error.getDefaultMessage()));

        return buildResponse(HttpStatus.BAD_REQUEST, "Kiritilgan ma'lumotlarda xatolik bor",
                request, fieldErrors);
    }

    /**
     * So'rovning tanasi (JSON) noto'g'ri yoki o'qib bo'lmaydigan bo'lsa ishlaydi
     * (masalan, vergul yetishmaydi yoki son o'rniga matn yuborilgan).
     *
     * @param ex      JSON o'qishdagi xato
     * @param request joriy so'rov
     * @return 400 statusli ErrorResponse
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadable(HttpMessageNotReadableException ex,
                                                          HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST,
                "So'rov ma'lumotlari noto'g'ri formatda yuborilgan", request, null);
    }

    /**
     * URL ichidagi yoki parametrdagi qiymat kutilgan turga mos kelmasa ishlaydi
     * (masalan, /products/abc, bu yerda id son bo'lishi kerak edi).
     *
     * @param ex      tur mos kelmaslik xatosi
     * @param request joriy so'rov
     * @return 400 statusli ErrorResponse
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex,
                                                            HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST,
                "'" + ex.getName() + "' parametrining qiymati noto'g'ri", request, null);
    }

    /**
     * Baza qoidasi buzilganda ishlaydi: masalan, unikal qiymat takrorlangan
     * yoki boshqa yozuvlar bog'langan narsani o'chirishga urinilgan.
     *
     * @param ex      bazadan kelgan xato
     * @param request joriy so'rov
     * @return 409 (Conflict) statusli ErrorResponse
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex,
                                                             HttpServletRequest request) {
        // Texnik tafsilot faqat logga yoziladi, mijozga chiqmaydi
        log.warn("Ma'lumotlar yaxlitligi xatosi: {}", ex.getMostSpecificCause().getMessage());
        return buildResponse(HttpStatus.CONFLICT,
                "Amalni bajarib bo'lmaydi: ma'lumot takrorlangan yoki boshqa yozuvlar bilan bog'langan",
                request, null);
    }

    /**
     * Mavjud bo'lmagan manzil yoki statik fayl so'ralganda ishlaydi (masalan, /favicon.ico).
     * Bu xatoni ushlamasak, Spring uni 500 deb qaytarib yuboradi, aslida 404 bo'lishi kerak.
     *
     * @param ex      topilmagan resurs xatosi
     * @param request joriy so'rov
     * @return 404 statusli ErrorResponse
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResource(NoResourceFoundException ex,
                                                          HttpServletRequest request) {
        return buildResponse(HttpStatus.NOT_FOUND, "Manzil topilmadi", request, null);
    }

    /**
     * Yuklanayotgan fayl ruxsat etilgan hajmdan katta bo'lsa ishlaydi (sozlamada 5 MB).
     * Mijozga 413 (Content Too Large) qaytaradi.
     *
     * @param ex      hajm oshib ketgani haqidagi xato
     * @param request joriy so'rov
     * @return 413 statusli ErrorResponse
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSize(MaxUploadSizeExceededException ex,
                                                             HttpServletRequest request) {
        return buildResponse(HttpStatus.valueOf(413), "Fayl hajmi 5 MB dan oshmasligi kerak", request, null);
    }

    /**
     * So'rovda majburiy qism (fayl) yoki parametr (masalan, folder) yuborilmasa ishlaydi.
     * Mijozga 400 (Bad Request) qaytaradi.
     *
     * @param ex      yetishmayotgan qism yoki parametr haqidagi xato
     * @param request joriy so'rov
     * @return 400 statusli ErrorResponse
     */
    @ExceptionHandler({MissingServletRequestPartException.class, MissingServletRequestParameterException.class})
    public ResponseEntity<ErrorResponse> handleMissingPart(Exception ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST,
                "So'rovda majburiy ma'lumot yetishmayapti (fayl yoki folder)", request, null);
    }

    /**
     * Foydalanuvchi tizimga kirmagan (yoki tokeni yaroqsiz) bo'lib himoyalangan manzilga kirsa ishlaydi.
     * Mijozga 401 (Unauthorized) qaytaradi.
     *
     * @param ex      kirish xatosi
     * @param request joriy so'rov
     * @return 401 statusli ErrorResponse
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(AuthenticationException ex,
                                                              HttpServletRequest request) {
        log.warn("Tizimga kirilmagan so'rov: {}", request.getRequestURI());
        return buildResponse(HttpStatus.UNAUTHORIZED, "Tizimga kirish talab qilinadi", request, null);
    }

    /**
     * Foydalanuvchi kirgan, lekin bu amalga ruxsati yo'q bo'lsa ishlaydi.
     * Mijozga 403 (Forbidden) qaytaradi.
     *
     * @param ex      ruxsat yo'qligi xatosi
     * @param request joriy so'rov
     * @return 403 statusli ErrorResponse
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex,
                                                            HttpServletRequest request) {
        log.warn("Ruxsat yo'q: {}", request.getRequestURI());
        return buildResponse(HttpStatus.FORBIDDEN, "Bu amal uchun ruxsatingiz yo'q", request, null);
    }



    /**
     * Boshqa hamma kutilmagan xatolarni ushlaydi (oxirgi himoya chizig'i).
     * Texnik tafsilot mijozga CHIQMAYDI (xavfsizlik uchun), faqat logga yoziladi.
     *
     * @param ex      kutilmagan xato
     * @param request joriy so'rov
     * @return 500 statusli ErrorResponse
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex, HttpServletRequest request) {
        // To'liq xato (stack trace) bilan logga yozamiz, dasturchi sababni topa olsin
        log.error("Kutilmagan xato: {}", request.getRequestURI(), ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                "Serverda kutilmagan xatolik yuz berdi", request, null);
    }

    /**
     * Yordamchi metod: yuqoridagi barcha handler'lar uchun ErrorResponse'ni bir joyda yig'adi,
     * kod takrorlanmasligi uchun.
     *
     * @param status      qaytariladigan HTTP status
     * @param message     mijozga ko'rsatiladigan xato matni
     * @param request     joriy so'rov (manzilni olish uchun)
     * @param fieldErrors maydon xatolari (validation bo'lmasa null)
     * @return tayyor ResponseEntity
     */
    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String message,
                                                        HttpServletRequest request,
                                                        Map<String, String> fieldErrors) {
        // Javob tanasi: vaqt, status raqami, status nomi, xabar, manzil va maydon xatolari
        ErrorResponse body = new ErrorResponse(
                ShopTime.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI(),
                fieldErrors
        );
        return ResponseEntity.status(status).body(body);
    }
}
