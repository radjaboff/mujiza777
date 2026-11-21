package uz.akmal.mujiza.cake.service;

import uz.akmal.mujiza.cake.dto.CakeOptionRequest;
import uz.akmal.mujiza.cake.dto.CakeOptionResponse;
import uz.akmal.mujiza.cake.dto.CakePriceRequest;
import uz.akmal.mujiza.cake.dto.CakePriceResponse;
import uz.akmal.mujiza.cake.dto.CakeQuote;
import uz.akmal.mujiza.cake.dto.CakeTypeRequest;
import uz.akmal.mujiza.cake.dto.CakeTypeResponse;
import uz.akmal.mujiza.cake.dto.PublicCakeConfigResponse;
import uz.akmal.mujiza.cake.enums.CakeOptionKind;

import java.math.BigDecimal;
import java.util.List;

/**
 * Tort konstruktori katalogi bilan ishlash qoidalari: turlar, variantlar va narx hisoblash.
 */
public interface CakeCatalogService {

    /**
     * Admin uchun: o'chirilmagan barcha tort turlari.
     *
     * @return turlar ro'yxati
     */
    List<CakeTypeResponse> getTypes();

    /**
     * Yangi tort turi yaratadi.
     *
     * @param request admin yuborgan ma'lumot
     * @return yaratilgan tur
     */
    CakeTypeResponse createType(CakeTypeRequest request);

    /**
     * Tort turini tahrirlaydi.
     *
     * @param id      turning raqami
     * @param request yangi ma'lumot
     * @return yangilangan tur
     */
    CakeTypeResponse updateType(Long id, CakeTypeRequest request);

    /**
     * Tort turini o'chiradi (soft delete).
     *
     * @param id turning raqami
     */
    void deleteType(Long id);

    /**
     * Admin uchun: o'chirilmagan variantlar, ixtiyoriy ravishda bitta guruh bo'yicha.
     *
     * @param kind guruh (null bo'lsa, hammasi)
     * @return variantlar ro'yxati
     */
    List<CakeOptionResponse> getOptions(CakeOptionKind kind);

    /**
     * Yangi variant yaratadi.
     *
     * @param request admin yuborgan ma'lumot
     * @return yaratilgan variant
     */
    CakeOptionResponse createOption(CakeOptionRequest request);

    /**
     * Variantni tahrirlaydi.
     *
     * @param id      variantning raqami
     * @param request yangi ma'lumot
     * @return yangilangan variant
     */
    CakeOptionResponse updateOption(Long id, CakeOptionRequest request);

    /**
     * Variantni o'chiradi (soft delete).
     *
     * @param id variantning raqami
     */
    void deleteOption(Long id);

    /**
     * Mijoz uchun: konstruktor sozlamalari (faol turlar va guruhlangan variantlar), nomlar so'ralgan tilda.
     *
     * @param lang til kodi ("uz" yoki "ru")
     * @return sozlamalar
     */
    PublicCakeConfigResponse getPublicConfig(String lang);

    /**
     * Mijoz uchun: tanlovga qarab narxni hisoblaydi va qatorlarini ko'rsatadi (hech narsa saqlanmaydi).
     *
     * @param request tanlov (tur, vazn, variantlar)
     * @param lang    til kodi ("uz" yoki "ru")
     * @return narx hisob-kitobi (qoida buzilsa BusinessException)
     */
    CakePriceResponse calculatePrice(CakePriceRequest request, String lang);

    /**
     * Tanlovni tekshiradi va narxni hisoblaydi (ichki ishlatish uchun: tort buyurtmasi yaratishda ham shu chaqiriladi).
     *
     * @param cakeTypeId tort turi
     * @param weightKg   vazn, kg da
     * @param optionIds  variantlar (null bo'lishi mumkin)
     * @return tekshirilgan va hisoblangan natija
     */
    CakeQuote quote(Long cakeTypeId, BigDecimal weightKg, List<Long> optionIds);
}