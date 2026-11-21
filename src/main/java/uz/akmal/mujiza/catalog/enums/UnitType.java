package uz.akmal.mujiza.catalog.enums;

/**
 * Mahsulot qanday o'lchov birligida sotilishi.
 * Bazada matn ko'rinishida saqlanadi (masalan, "KG").
 */
public enum UnitType {

    /** Dona bilan sotiladi (tortlar va kam sotiladigan donalik shirinliklar) */
    PIECE("dona", "шт"),
    /** Kilogramm bilan sotiladi (pishiriqlar). Narx 1 kg uchun */
    KG("kg", "кг");

    /** Birlikning o'zbekcha nomi. */
    private final String labelUz;

    /** Birlikning ruscha nomi. */
    private final String labelRu;

    /**
     * Har bir qiymatga o'zbekcha va ruscha nomni biriktiradi.
     *
     * @param labelUz o'zbekcha nom
     * @param labelRu ruscha nom
     */
    UnitType(String labelUz, String labelRu) {
        this.labelUz = labelUz;
        this.labelRu = labelRu;
    }

    /**
     * Birlik nomini so'ralgan tilda qaytaradi.
     *
     * @param ru true bo'lsa ruscha, aks holda o'zbekcha
     * @return birlik nomi (masalan, "kg")
     */
    public String label(boolean ru) {
        return ru ? labelRu : labelUz;
    }
}