package uz.akmal.mujiza.cake.enums;

/**
 * Tort variantlarining guruhi. Har bir guruhning qoidalari (majburiyligi va eng ko'p tanlov soni) shu yerda.
 * Bazada matn ko'rinishida saqlanadi (masalan, "FLAVOR").
 */
public enum CakeOptionKind {

    /** Qatlam ta'mi: majburiy, ko'pi bilan 2 ta */
    FLAVOR(true, 2, "Qatlam ta'mi"),
    /** Krem: majburiy, bitta */
    CREAM(true, 1, "Krem"),
    /** Bezak: ixtiyoriy, ko'pi bilan 5 ta */
    DECOR(false, 5, "Bezak"),
    /** Qo'shimcha xizmatlar (yozuv, rasm bosish va h.k.): ixtiyoriy, ko'pi bilan 5 ta */
    EXTRA(false, 5, "Qo'shimcha xizmat");

    /** Guruhdan kamida bitta variant tanlash majburiymi (guruhda faol variant bo'lsagina). */
    private final boolean required;

    /** Guruhdan eng ko'pi bilan nechta variant tanlash mumkin. */
    private final int maxChoices;

    /** Guruhning o'zbekcha nomi (xato xabarlari uchun). */
    private final String labelUz;

    /**
     * Har bir qiymatga qoidalarni biriktiradi.
     *
     * @param required   majburiymi
     * @param maxChoices eng ko'p tanlov soni
     * @param labelUz    o'zbekcha nomi
     */
    CakeOptionKind(boolean required, int maxChoices, String labelUz) {
        this.required = required;
        this.maxChoices = maxChoices;
        this.labelUz = labelUz;
    }

    /**
     * @return tanlash majburiymi
     */
    public boolean isRequired() {
        return required;
    }

    /**
     * @return eng ko'p tanlov soni
     */
    public int getMaxChoices() {
        return maxChoices;
    }

    /**
     * @return guruhning o'zbekcha nomi
     */
    public String getLabelUz() {
        return labelUz;
    }
}