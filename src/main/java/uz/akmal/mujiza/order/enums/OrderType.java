package uz.akmal.mujiza.order.enums;

/**
 * Buyurtma qanday qabul qilinishi.
 * Bazada matn ko'rinishida saqlanadi (masalan, "PICKUP").
 */
public enum OrderType {

    /** Mijoz buyurtmani filialdan o'zi olib ketadi */
    PICKUP,
    /** Buyurtma mijozning manziliga yetkazib beriladi */
    DELIVERY
}