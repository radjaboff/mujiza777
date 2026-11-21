package uz.akmal.mujiza.cake.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Tort narxi hisob-kitobi (mijozga qatorlar bilan ko'rsatiladi).
 *
 * @param weightKg vazn, kg da
 * @param servings taxminiy porsiya soni (tort turida ko'rsatilmagan bo'lsa null)
 * @param total    jami narx, so'mda (qatorlar yig'indisiga teng)
 * @param lines    narx qatorlari (tort turi va har bir variant)
 */
public record CakePriceResponse(
        BigDecimal weightKg,
        Integer servings,
        long total,
        List<Line> lines
) {

    /**
     * Narxning bitta qatori.
     *
     * @param label  qator yozuvi (masalan, "Shokoladli (20 000 so'm/kg)")
     * @param amount qator summasi, so'mda
     */
    public record Line(String label, long amount) {
    }
}