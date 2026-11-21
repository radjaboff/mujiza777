package uz.akmal.mujiza.cake.dto;

import uz.akmal.mujiza.cake.entity.CakeOption;
import uz.akmal.mujiza.cake.entity.CakeType;

import java.math.BigDecimal;
import java.util.List;

/**
 * Tort buyurtmasining tekshirilgan va hisoblangan natijasi (faqat ichki ishlatiladi, mijozga qaytmaydi).
 * Keyingi qadamda tort buyurtmasi yaratishda ham aynan shu hisoblash ishlatiladi.
 *
 * @param type          tanlangan tort turi
 * @param weightKg      vazn, kg da
 * @param options       tanlangan variantlar (guruh va tartib bo'yicha)
 * @param baseAmount    tort turining summasi (1 kg narxi x vazn), so'mda
 * @param optionAmounts har bir variantning summasi (options bilan bir xil tartibda), so'mda
 * @param total         jami narx: baseAmount + optionAmounts yig'indisi
 */
public record CakeQuote(
        CakeType type,
        BigDecimal weightKg,
        List<CakeOption> options,
        long baseAmount,
        List<Long> optionAmounts,
        long total
) {
}