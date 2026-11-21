package uz.akmal.mujiza.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Biznes qoidasi buzilganda tashlanadigan umumiy xato.
 * Masalan: "mahsulot mavjud emas", "promo kod muddati tugagan", "minimal buyurtma summasidan kam".
 * Odatda 400 (Bad Request) qaytadi, kerak bo'lsa boshqa status ham berish mumkin.
 */
public class BusinessException extends RuntimeException {

    /**
     * Mijozga qaytariladigan HTTP status kodi (masalan, 400 yoki 409).
     */
    private final HttpStatus status;

    /**
     * Oddiy holat: status 400 (Bad Request) bo'ladi.
     *
     * @param message mijozga ko'rsatiladigan xato matni
     */
    public BusinessException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST;
    }

    /**
     * Statusni o'zimiz tanlaydigan variant (masalan, to'qnashuv uchun 409 Conflict).
     *
     * @param message mijozga ko'rsatiladigan xato matni
     * @param status  qaytariladigan HTTP status
     */
    public BusinessException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    /**
     * Xatoning HTTP statusini qaytaradi, handler shundan foydalanadi.
     *
     * @return HTTP status
     */
    public HttpStatus getStatus() {
        return status;
    }
}