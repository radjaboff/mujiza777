package uz.akmal.mujiza.order.enums;

/**
 * To'lov usuli. Onlayn to'lov (Click, Payme) keyingi versiyada qo'shiladi.
 * Bazada matn ko'rinishida saqlanadi.
 */
public enum PaymentMethod {

    /** Naqd pul: kuryerga yoki do'konda */
    CASH,
    /** Karta orqali: kuryerdagi yoki do'kondagi terminalda */
    CARD
}