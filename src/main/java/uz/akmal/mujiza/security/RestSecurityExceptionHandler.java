package uz.akmal.mujiza.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerExceptionResolver;

/**
 * Xavfsizlik filtrlarida chiqqan xatolarni (kirmagan yoki ruxsati yo'q foydalanuvchi) ushlaydi
 * va GlobalExceptionHandler'ga uzatadi, shunda javob boshqa xatolar bilan bir xil JSON formatida qaytadi.
 *
 * AuthenticationEntryPoint: foydalanuvchi tizimga kirmagan bo'lsa chaqiriladi (401).
 * AccessDeniedHandler: foydalanuvchi kirgan, lekin bu amalga ruxsati yo'q bo'lsa chaqiriladi (403).
 */
@Component
public class RestSecurityExceptionHandler implements AuthenticationEntryPoint, AccessDeniedHandler {

    /**
     * Xatoni mos @ExceptionHandler metodiga yo'naltiruvchi Spring vositasi.
     */
    private final HandlerExceptionResolver resolver;

    /**
     * Konstruktor.
     *
     * @param resolver Spring'ning umumiy xato yo'naltiruvchisi
     */
    public RestSecurityExceptionHandler(
            @Qualifier("handlerExceptionResolver") HandlerExceptionResolver resolver) {
        this.resolver = resolver;
    }

    /**
     * Kirmagan foydalanuvchi himoyalangan manzilga kirganda chaqiriladi.
     *
     * @param request   joriy so'rov
     * @param response  javob
     * @param exception kirish xatosi
     */
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException exception) {
        resolver.resolveException(request, response, null, exception);
    }

    /**
     * Kirgan, lekin ruxsati yo'q foydalanuvchi uchun chaqiriladi.
     *
     * @param request   joriy so'rov
     * @param response  javob
     * @param exception ruxsat yo'qligi xatosi
     */
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException exception) {
        resolver.resolveException(request, response, null, exception);
    }
}