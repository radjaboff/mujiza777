package uz.akmal.mujiza.catalog.enums;

/**
 * Mahsulotdagi allergen turlari.
 * Mijoz saytda "yong'oqsiz" kabi filtr tanlaganda, aynan shu qiymatlar bo'yicha qidiriladi.
 * Bazada matn ko'rinishida saqlanadi (masalan, "NUTS").
 */
public enum Allergen {
    /** Yong'oq turlari (yong'oq, bodom, funduq va hokazo) */
    NUTS,
    /** Yer yong'oq (araxis) */
    PEANUTS,
    /** Sut va sut mahsulotlari */
    MILK,
    /** Gluten (bug'doy, javdar, arpa uni) */
    GLUTEN,
    /** Tuxum */
    EGG,
    /** Soya */
    SOY,
    /** Kunjut */
    SESAME
}