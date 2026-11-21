package uz.akmal.mujiza.common.exception;

/**
 * "Kerakli yozuv topilmadi" xatosi.
 * Masalan: mahsulot, kategoriya yoki buyurtma bazadan topilmaganda tashlanadi.
 * GlobalExceptionHandler uni ushlab, mijozga 404 (Not Found) javobini qaytaradi.
 */
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Xabarni o'zimiz to'liq yozadigan oddiy konstruktor.
     *
     * @param message mijozga ko'rsatiladigan xato matni
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }

    /**
     * Qulay konstruktor: nima va qaysi id bilan topilmaganini o'zi chiroyli xabarga aylantiradi.
     * Misol: new ResourceNotFoundException("Mahsulot", 5) -> "Mahsulot topilmadi (id = 5)"
     *
     * @param resourceName topilmagan narsaning nomi (masalan, "Mahsulot")
     * @param id           qidirilgan yozuvning id si
     */
    public ResourceNotFoundException(String resourceName, Object id) {
        super(resourceName + " topilmadi (id = " + id + ")");
    }
}