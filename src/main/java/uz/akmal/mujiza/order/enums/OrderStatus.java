package uz.akmal.mujiza.order.enums;

/**
 * Buyurtmaning holati. Holatlar tartib bilan o'zgaradi, sakrab o'tib bo'lmaydi.
 * Oqim: NEW -> CONFIRMED -> PREPARING -> READY -> (DELIVERING) -> COMPLETED.
 * Istalgan tugallanmagan bosqichda CANCELLED (bekor qilish) mumkin.
 * Bazada matn ko'rinishida saqlanadi.
 */
public enum OrderStatus {

    /** Yangi buyurtma, hali ko'rilmagan */
    NEW,
    /** Tort so'rovi: yakuniy narx admin tomonidan tasdiqlanishi kutilmoqda (keyingi bosqichda ishlatiladi) */
    PRICE_PENDING,
    /** Qabul qilindi, tasdiqlandi */
    CONFIRMED,
    /** Tayyorlanmoqda */
    PREPARING,
    /** Tayyor: olib ketishga yoki yetkazishga tayyor */
    READY,
    /** Kuryer yo'lda (faqat yetkazib berishda) */
    DELIVERING,
    /** Topshirildi, buyurtma yakunlandi */
    COMPLETED,
    /** Bekor qilindi */
    CANCELLED;

    /**
     * Holat yakuniymi (shundan keyin boshqa holatga o'tib bo'lmaydi).
     *
     * @return COMPLETED yoki CANCELLED bo'lsa true
     */
    public boolean isFinal() {
        return this == COMPLETED || this == CANCELLED;
    }

    /**
     * Joriy holatdan berilgan holatga o'tish mumkinmi, shuni aytadi.
     * Qoidalar: yakuniy holatdan hech qayerga o'tilmaydi; bekor qilish har qanday tugallanmagan holatdan mumkin;
     * qolganlari faqat keyingi bosqichga (tayyor bo'lgach: yetkazishda DELIVERING, olib ketishda COMPLETED).
     *
     * @param target o'tilmoqchi bo'lgan holat
     * @param type   buyurtma turi (olib ketish yoki yetkazib berish)
     * @return o'tish mumkin bo'lsa true
     */
    public boolean canMoveTo(OrderStatus target, OrderType type) {
        // Yakunlangan buyurtma o'zgarmaydi
        if (this.isFinal()) {
            return false;
        }
        // Bekor qilish har qanday tugallanmagan holatdan mumkin
        if (target == CANCELLED) {
            return true;
        }
        return switch (this) {
            case NEW, PRICE_PENDING -> target == CONFIRMED;
            case CONFIRMED -> target == PREPARING;
            case PREPARING -> target == READY;
            case READY -> type == OrderType.DELIVERY ? target == DELIVERING : target == COMPLETED;
            case DELIVERING -> target == COMPLETED;
            default -> false;
        };
    }
}