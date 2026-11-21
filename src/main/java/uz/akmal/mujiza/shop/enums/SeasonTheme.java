package uz.akmal.mujiza.shop.enums;

/**
 * Saytning mavsumiy rang mavzusi. Admin bayramga mos mavzuni tanlaydi, frontend ranglarni shunga qarab o'zgartiradi.
 * Bazada matn ko'rinishida saqlanadi (masalan, "NAVRUZ").
 */
public enum SeasonTheme {

    /** Oddiy ko'rinish (mavzu yoqilmagan) */
    DEFAULT,
    /** Navro'z bayrami */
    NAVRUZ,
    /** Hayit bayramlari */
    HAYIT,
    /** 8-mart */
    MARCH_8,
    /** Yangi yil */
    NEW_YEAR
}