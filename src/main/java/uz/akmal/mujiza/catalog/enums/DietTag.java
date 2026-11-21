package uz.akmal.mujiza.catalog.enums;

/**
 * Mahsulotning parhez belgilari.
 * Mijoz saytda "shakarsiz" kabi filtrlarni shu qiymatlar bo'yicha tanlaydi.
 * Bazada matn ko'rinishida saqlanadi (masalan, "SUGAR_FREE").
 */
public enum DietTag {
    /** Shakarsiz */
    SUGAR_FREE,
    /** Glutensiz */
    GLUTEN_FREE,
    /** Laktozasiz (sut shakarisiz) */
    LACTOSE_FREE,
    /** Vegan (hayvon mahsulotlarisiz) */
    VEGAN
}