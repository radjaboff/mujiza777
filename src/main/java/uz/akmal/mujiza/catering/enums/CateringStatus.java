package uz.akmal.mujiza.catering.enums;

/**
 * Keytering so'rovining holati. Bazada matn ko'rinishida saqlanadi.
 */
public enum CateringStatus {

    /** Yangi so'rov, hali ko'rilmagan */
    NEW,
    /** Mijoz bilan bog'lanildi */
    CONTACTED,
    /** Buyurtma kelishildi va bajarildi */
    DONE,
    /** Rad etildi yoki mijoz rad qildi */
    REJECTED
}