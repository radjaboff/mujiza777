package uz.akmal.mujiza.file.enums;

/**
 * Rasmlar yuklanadigan ruxsat etilgan papkalar (bo'limlar).
 * Admin papka nomini erkin yoza olmaydi, faqat shu ro'yxatdan tanlaydi.
 * Bu xavfsizlik uchun muhim: noto'g'ri yoki xavfli yo'l kiritib bo'lmaydi.
 */
public enum UploadFolder {

    /** Mahsulot rasmlari */
    PRODUCTS("products"),
    /** Kategoriya rasmlari */
    CATEGORIES("categories"),
    /** Bosh sahifa bannerlari va aksiya rasmlari */
    BANNERS("banners"),
    /** Filial rasmlari */
    BRANCHES("branches"),
    /** Tort konstruktorida mijoz yuklagan namuna rasmlari */
    CAKES("cakes");

    /**
     * Diskdagi haqiqiy papka nomi (kichik harflarda).
     */
    private final String directory;

    /**
     * Har bir qiymatga papka nomini biriktiradi.
     *
     * @param directory diskdagi papka nomi
     */
    UploadFolder(String directory) {
        this.directory = directory;
    }

    /**
     * Diskdagi papka nomini qaytaradi.
     *
     * @return papka nomi (masalan, "products")
     */
    public String getDirectory() {
        return directory;
    }
}