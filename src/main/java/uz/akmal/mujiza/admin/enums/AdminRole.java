package uz.akmal.mujiza.admin.enums;

/**
 * Admin panel foydalanuvchisining roli (kim nima qila oladi).
 * Bazada matn ko'rinishida saqlanadi (masalan, "ADMIN").
 */
public enum AdminRole {

    /** Do'kon egasi: hamma narsa, shu jumladan sozlamalar, xodimlar va hisobotlar */
    ADMIN,
    /** Xodim (operator): buyurtmalar, mahsulot mavjudligi, tort so'rovlari */
    STAFF,
    /** Kuryer: faqat o'ziga biriktirilgan buyurtmalar (keyingi versiyada) */
    COURIER
}