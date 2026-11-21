package uz.akmal.mujiza.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Token solinadigan cookie'ni yasaydi va tozalaydi.
 * Cookie xavfsizligi:
 * httpOnly: JavaScript cookie'ni o'qiy olmaydi (zararli skript tokenni o'g'irlay olmaydi).
 * secure: faqat HTTPS orqali yuboriladi (jonli serverda yoqiladi).
 * SameSite=Strict: boshqa saytdan kelgan so'rovlarga cookie qo'shilmaydi (CSRF hujumidan himoya).
 */
@Component
public class JwtCookieService {

    /**
     * Cookie nomi (app.jwt.cookie-name).
     */
    private final String cookieName;

    /**
     * Faqat HTTPS orqali yuborilsinmi (app.jwt.cookie-secure).
     */
    private final boolean secure;

    /**
     * Cookie muddatini tokenning muddatiga tenglash uchun.
     */
    private final JwtService jwtService;

    /**
     * Konstruktor.
     *
     * @param cookieName cookie nomi
     * @param secure     faqat HTTPS orqali yuborilsinmi
     * @param jwtService token xizmati (muddatni olish uchun)
     */
    public JwtCookieService(@Value("${app.jwt.cookie-name:MUJIZA_TOKEN}") String cookieName,
                            @Value("${app.jwt.cookie-secure:false}") boolean secure,
                            JwtService jwtService) {
        this.cookieName = cookieName;
        this.secure = secure;
        this.jwtService = jwtService;
    }

    /**
     * Tokenni o'z ichiga olgan cookie yasaydi (login paytida brauzerga beriladi).
     *
     * @param token JWT token
     * @return tayyor cookie
     */
    public ResponseCookie create(String token) {
        return ResponseCookie.from(cookieName, token)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Strict")
                .path("/")
                .maxAge(jwtService.getLifetime())
                .build();
    }

    /**
     * Cookie'ni o'chiradigan "bo'sh" cookie yasaydi (logout paytida brauzerga beriladi).
     *
     * @return o'chiruvchi cookie
     */
    public ResponseCookie clear() {
        return ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite("Strict")
                .path("/")
                .maxAge(Duration.ZERO)
                .build();
    }

    /**
     * Cookie nomini qaytaradi (keyingi qadamda cookie'dan tokenni o'qiganda kerak bo'ladi).
     *
     * @return cookie nomi
     */
    public String getCookieName() {
        return cookieName;
    }
}