package uz.akmal.mujiza.cake.dto;

import uz.akmal.mujiza.cake.enums.CakeOptionKind;

import java.math.BigDecimal;
import java.util.List;

/**
 * Buyurtmadagi tortning tafsilotlari (mijozga va adminga qaytariladi; matnlar so'ralgan tilda).
 *
 * @param typeName          tort turi nomi
 * @param weightKg          vazn, kg da
 * @param options           tanlangan variantlar
 * @param inscription       tortga yoziladigan yozuv (yo'q bo'lsa null)
 * @param referenceImageUrl namuna rasm manzili (yo'q bo'lsa null)
 * @param calculatedPrice   server hisoblagan narx, so'mda
 * @param finalPrice        do'kon tasdiqlagan yakuniy narx (hali tasdiqlanmagan bo'lsa null)
 * @param priceConfirmed    narx tasdiqlanganmi
 * @param priceNote         narx haqida izoh (yo'q bo'lsa null)
 */
public record CakeOrderDetailsResponse(
        String typeName,
        BigDecimal weightKg,
        List<Option> options,
        String inscription,
        String referenceImageUrl,
        long calculatedPrice,
        Long finalPrice,
        boolean priceConfirmed,
        String priceNote
) {

    /**
     * Tanlangan variant.
     *
     * @param kind   guruhi
     * @param name   nomi
     * @param amount shu variantning tortdagi summasi, so'mda
     */
    public record Option(CakeOptionKind kind, String name, long amount) {
    }
}