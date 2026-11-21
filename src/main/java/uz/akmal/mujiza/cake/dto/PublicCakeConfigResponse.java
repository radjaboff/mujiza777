package uz.akmal.mujiza.cake.dto;

import uz.akmal.mujiza.cake.enums.CakeOptionKind;
import uz.akmal.mujiza.cake.enums.CakePriceType;

import java.math.BigDecimal;
import java.util.List;

/**
 * Mijoz uchun tort konstruktori sozlamalari: tort turlari va variant guruhlari (nomlar so'ralgan tilda).
 * Variant yo'q guruhlar kiritilmaydi.
 *
 * @param cakeMinAdvanceHours tortga eng kamida necha soat oldin buyurtma berish kerak
 * @param types               tort turlari
 * @param groups              variant guruhlari (qatlam ta'mi, krem, bezak, qo'shimcha)
 */
public record PublicCakeConfigResponse(
        int cakeMinAdvanceHours,
        List<TypeItem> types,
        List<Group> groups
) {

    /**
     * Mijozga ko'rsatiladigan tort turi.
     *
     * @param id             turning raqami
     * @param name           nomi
     * @param imageUrl       rasm
     * @param basePricePerKg 1 kg uchun asosiy narx
     * @param minWeightKg    eng kam vazn
     * @param maxWeightKg    eng ko'p vazn
     * @param weightStep     vazn qadami
     * @param servingsPerKg  1 kg dan taxminiy porsiya soni (yo'q bo'lsa null)
     */
    public record TypeItem(Long id, String name, String imageUrl, long basePricePerKg, BigDecimal minWeightKg,
                           BigDecimal maxWeightKg, BigDecimal weightStep, Integer servingsPerKg) {
    }

    /**
     * Variant guruhi qoidalari bilan.
     *
     * @param kind       guruh
     * @param required   kamida bittasini tanlash majburiymi
     * @param maxChoices eng ko'pi bilan nechta tanlash mumkin
     * @param options    guruhdagi variantlar
     */
    public record Group(CakeOptionKind kind, boolean required, int maxChoices, List<OptionItem> options) {
    }

    /**
     * Mijozga ko'rsatiladigan variant.
     *
     * @param id         variantning raqami
     * @param name       nomi
     * @param imageUrl   rasm
     * @param priceType  narx turi (PER_KG yoki FIXED)
     * @param priceValue qo'shimcha narx, so'mda
     */
    public record OptionItem(Long id, String name, String imageUrl, CakePriceType priceType, long priceValue) {
    }
}