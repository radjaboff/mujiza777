package uz.akmal.mujiza.cake.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.akmal.mujiza.cake.dto.CakeOptionRequest;
import uz.akmal.mujiza.cake.dto.CakeOptionResponse;
import uz.akmal.mujiza.cake.dto.CakePriceRequest;
import uz.akmal.mujiza.cake.dto.CakePriceResponse;
import uz.akmal.mujiza.cake.dto.CakeQuote;
import uz.akmal.mujiza.cake.dto.CakeTypeRequest;
import uz.akmal.mujiza.cake.dto.CakeTypeResponse;
import uz.akmal.mujiza.cake.dto.PublicCakeConfigResponse;
import uz.akmal.mujiza.cake.entity.CakeOption;
import uz.akmal.mujiza.cake.entity.CakeType;
import uz.akmal.mujiza.cake.enums.CakeOptionKind;
import uz.akmal.mujiza.cake.enums.CakePriceType;
import uz.akmal.mujiza.cake.repository.CakeOptionRepository;
import uz.akmal.mujiza.cake.repository.CakeTypeRepository;
import uz.akmal.mujiza.cake.service.CakeCatalogService;
import uz.akmal.mujiza.common.exception.BusinessException;
import uz.akmal.mujiza.common.exception.ResourceNotFoundException;
import uz.akmal.mujiza.config.CacheConfig;
import uz.akmal.mujiza.shop.entity.ShopSettings;
import uz.akmal.mujiza.shop.repository.ShopSettingsRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Tort konstruktori katalogi bilan ishlash qoidalarining amaldagi ijrosi.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CakeCatalogServiceImpl implements CakeCatalogService {

    /**
     * Tort turlarini o'qish va yozish uchun.
     */
    private final CakeTypeRepository typeRepository;

    /**
     * Variantlarni o'qish va yozish uchun.
     */
    private final CakeOptionRepository optionRepository;

    /**
     * Do'kon sozlamalarini o'qish uchun (tortga oldindan buyurtma muddati).
     */
    private final ShopSettingsRepository settingsRepository;

    // ---------------------------------------------------------------- Admin: tort turlari

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public List<CakeTypeResponse> getTypes() {
        return typeRepository.findAllByIsDeletedFalseOrderBySortOrderAscIdAsc().stream()
                .map(this::toTypeResponse).toList();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    @CacheEvict(cacheNames = CacheConfig.CAKE_CONFIG, allEntries = true)
    public CakeTypeResponse createType(CakeTypeRequest request) {
        validateTypeRules(request);
        CakeType type = new CakeType();
        applyType(type, request);
        CakeType saved = typeRepository.save(type);
        log.info("Tort turi yaratildi: id={}", saved.getId());
        return toTypeResponse(saved);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    @CacheEvict(cacheNames = CacheConfig.CAKE_CONFIG, allEntries = true)
    public CakeTypeResponse updateType(Long id, CakeTypeRequest request) {
        validateTypeRules(request);
        CakeType type = findTypeOrThrow(id);
        applyType(type, request);
        CakeType saved = typeRepository.save(type);
        log.info("Tort turi yangilandi: id={}", saved.getId());
        return toTypeResponse(saved);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    @CacheEvict(cacheNames = CacheConfig.CAKE_CONFIG, allEntries = true)
    public void deleteType(Long id) {
        CakeType type = findTypeOrThrow(id);
        type.setIsDeleted(true);
        typeRepository.save(type);
        log.info("Tort turi o'chirildi (soft delete): id={}", id);
    }

    // ---------------------------------------------------------------- Admin: variantlar

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public List<CakeOptionResponse> getOptions(CakeOptionKind kind) {
        List<CakeOption> options = kind == null
                ? optionRepository.findAllByIsDeletedFalseOrderByKindAscSortOrderAscIdAsc()
                : optionRepository.findAllByKindAndIsDeletedFalseOrderBySortOrderAscIdAsc(kind);
        return options.stream().map(this::toOptionResponse).toList();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    @CacheEvict(cacheNames = CacheConfig.CAKE_CONFIG, allEntries = true)
    public CakeOptionResponse createOption(CakeOptionRequest request) {
        CakeOption option = new CakeOption();
        applyOption(option, request);
        CakeOption saved = optionRepository.save(option);
        log.info("Tort varianti yaratildi: id={}, guruh={}", saved.getId(), saved.getKind());
        return toOptionResponse(saved);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    @CacheEvict(cacheNames = CacheConfig.CAKE_CONFIG, allEntries = true)
    public CakeOptionResponse updateOption(Long id, CakeOptionRequest request) {
        CakeOption option = findOptionOrThrow(id);
        applyOption(option, request);
        CakeOption saved = optionRepository.save(option);
        log.info("Tort varianti yangilandi: id={}", saved.getId());
        return toOptionResponse(saved);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    @CacheEvict(cacheNames = CacheConfig.CAKE_CONFIG, allEntries = true)
    public void deleteOption(Long id) {
        CakeOption option = findOptionOrThrow(id);
        option.setIsDeleted(true);
        optionRepository.save(option);
        log.info("Tort varianti o'chirildi (soft delete): id={}", id);
    }

    // ---------------------------------------------------------------- Mijoz: sozlamalar va narx

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = CacheConfig.CAKE_CONFIG, key = "'ru'.equalsIgnoreCase(#lang) ? 'ru' : 'uz'")
    public PublicCakeConfigResponse getPublicConfig(String lang) {
        boolean ru = "ru".equalsIgnoreCase(lang);
        int advanceHours = settingsRepository.findById(ShopSettings.SINGLE_ID)
                .map(ShopSettings::getCakeMinAdvanceHours).orElse(24);

        List<PublicCakeConfigResponse.TypeItem> types =
                typeRepository.findAllByIsDeletedFalseAndIsActiveTrueOrderBySortOrderAscIdAsc().stream()
                        .map(type -> new PublicCakeConfigResponse.TypeItem(type.getId(),
                                ru ? type.getNameRu() : type.getNameUz(), type.getImageUrl(),
                                type.getBasePricePerKg(), type.getMinWeightKg(), type.getMaxWeightKg(),
                                type.getWeightStep(), type.getServingsPerKg()))
                        .toList();

        // Faol variantlarni guruhlarga ajratamiz; variant yo'q guruhlar kiritilmaydi
        List<CakeOption> activeOptions =
                optionRepository.findAllByIsDeletedFalseAndIsActiveTrueOrderBySortOrderAscIdAsc();
        List<PublicCakeConfigResponse.Group> groups = new ArrayList<>();
        for (CakeOptionKind kind : CakeOptionKind.values()) {
            List<PublicCakeConfigResponse.OptionItem> items = activeOptions.stream()
                    .filter(option -> option.getKind() == kind)
                    .map(option -> new PublicCakeConfigResponse.OptionItem(option.getId(),
                            ru ? option.getNameRu() : option.getNameUz(), option.getImageUrl(),
                            option.getPriceType(), option.getPriceValue()))
                    .toList();
            if (!items.isEmpty()) {
                groups.add(new PublicCakeConfigResponse.Group(kind, kind.isRequired(), kind.getMaxChoices(), items));
            }
        }
        return new PublicCakeConfigResponse(advanceHours, types, groups);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public CakePriceResponse calculatePrice(CakePriceRequest request, String lang) {
        boolean ru = "ru".equalsIgnoreCase(lang);
        CakeQuote quote = quote(request.cakeTypeId(), request.weightKg(), request.optionIds());
        String perKg = ru ? "сум/кг" : "so'm/kg";

        // Narx qatorlari: avval tort turi, keyin har bir variant
        List<CakePriceResponse.Line> lines = new ArrayList<>();
        CakeType type = quote.type();
        lines.add(new CakePriceResponse.Line(
                (ru ? type.getNameRu() : type.getNameUz()) + " (" + formatMoney(type.getBasePricePerKg()) + " " + perKg + ")",
                quote.baseAmount()));
        for (int i = 0; i < quote.options().size(); i++) {
            CakeOption option = quote.options().get(i);
            String name = ru ? option.getNameRu() : option.getNameUz();
            String label = option.getPriceType() == CakePriceType.PER_KG && option.getPriceValue() > 0
                    ? name + " (" + formatMoney(option.getPriceValue()) + " " + perKg + ")"
                    : name;
            lines.add(new CakePriceResponse.Line(label, quote.optionAmounts().get(i)));
        }

        // Taxminiy porsiya soni (tort turida ko'rsatilgan bo'lsa)
        Integer servings = type.getServingsPerKg() == null ? null
                : quote.weightKg().multiply(BigDecimal.valueOf(type.getServingsPerKg()))
                .setScale(0, RoundingMode.HALF_UP).intValue();
        return new CakePriceResponse(quote.weightKg(), servings, quote.total(), lines);
    }

    /**
     * {@inheritDoc}
     * Qoidalar: tur faol bo'lishi; vazn chegarada va qadamga mos bo'lishi; variantlar faol bo'lishi;
     * har guruhdan ko'pi bilan ruxsat etilgancha tanlash; majburiy guruhdan (agar unda faol variant bo'lsa) kamida bittasi.
     * Har qator alohida butun so'mga yaxlitlanadi (0.5 va undan ko'p bo'lsa yuqoriga), jami qatorlar yig'indisi.
     */
    @Override
    @Transactional(readOnly = true)
    public CakeQuote quote(Long cakeTypeId, BigDecimal weightKg, List<Long> optionIds) {
        CakeType type = typeRepository.findByIdAndIsDeletedFalse(cakeTypeId)
                .filter(found -> Boolean.TRUE.equals(found.getIsActive()))
                .orElseThrow(() -> new BusinessException("Tanlangan tort turi mavjud emas"));
        validateWeight(type, weightKg);

        // Faol variantlar: raqam -> variant
        List<CakeOption> activeOptions =
                optionRepository.findAllByIsDeletedFalseAndIsActiveTrueOrderBySortOrderAscIdAsc();
        Map<Long, CakeOption> byId = activeOptions.stream()
                .collect(Collectors.toMap(CakeOption::getId, Function.identity()));

        // Takroriy raqamlarni olib tashlab, tanlangan variantlarni yig'amiz
        Set<Long> ids = optionIds == null ? Set.of() : new LinkedHashSet<>(optionIds);
        List<CakeOption> chosen = new ArrayList<>();
        for (Long id : ids) {
            CakeOption option = byId.get(id);
            if (option == null) {
                throw new BusinessException("Tanlangan variant mavjud emas (id = " + id + ")");
            }
            chosen.add(option);
        }
        // Tartib: guruh, keyin ko'rsatish tartibi
        chosen.sort(Comparator.comparing(CakeOption::getKind)
                .thenComparing(CakeOption::getSortOrder).thenComparing(CakeOption::getId));

        // Guruh qoidalari
        for (CakeOptionKind kind : CakeOptionKind.values()) {
            long count = chosen.stream().filter(option -> option.getKind() == kind).count();
            boolean groupHasOptions = activeOptions.stream().anyMatch(option -> option.getKind() == kind);
            if (kind.isRequired() && groupHasOptions && count == 0) {
                throw new BusinessException(kind.getLabelUz() + " tanlanishi kerak");
            }
            if (count > kind.getMaxChoices()) {
                throw new BusinessException(kind.getLabelUz() + " bo'yicha ko'pi bilan "
                        + kind.getMaxChoices() + " ta variant tanlash mumkin");
            }
        }

        // Narx: har qator alohida yaxlitlanadi, jami qatorlar yig'indisi
        long baseAmount = roundedAmount(type.getBasePricePerKg(), weightKg);
        List<Long> optionAmounts = new ArrayList<>();
        long total = baseAmount;
        for (CakeOption option : chosen) {
            long amount = option.getPriceType() == CakePriceType.PER_KG
                    ? roundedAmount(option.getPriceValue(), weightKg)
                    : option.getPriceValue();
            optionAmounts.add(amount);
            total += amount;
        }
        return new CakeQuote(type, weightKg, chosen, baseAmount, optionAmounts, total);
    }

    // ---------------------------------------------------------------- Yordamchi metodlar

    /**
     * Yordamchi metod: id bo'yicha o'chirilmagan tort turini topadi yoki 404 xatosini tashlaydi.
     *
     * @param id turning raqami
     * @return topilgan tur
     */
    private CakeType findTypeOrThrow(Long id) {
        return typeRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tort turi", id));
    }

    /**
     * Yordamchi metod: id bo'yicha o'chirilmagan variantni topadi yoki 404 xatosini tashlaydi.
     *
     * @param id variantning raqami
     * @return topilgan variant
     */
    private CakeOption findOptionOrThrow(Long id) {
        return optionRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tort varianti", id));
    }

    /**
     * Yordamchi metod: tort turining vazn qoidalari mantiqan to'g'ri ekanini tekshiradi:
     * eng ko'p vazn eng kamdan kichik emas; eng kam va eng ko'p vazn qadamga karrali.
     *
     * @param request admin yuborgan ma'lumot
     */
    private void validateTypeRules(CakeTypeRequest request) {
        if (request.maxWeightKg().compareTo(request.minWeightKg()) < 0) {
            throw new BusinessException("Eng ko'p vazn eng kam vazndan kichik bo'lishi mumkin emas");
        }
        if (request.minWeightKg().remainder(request.weightStep()).compareTo(BigDecimal.ZERO) != 0
                || request.maxWeightKg().remainder(request.weightStep()).compareTo(BigDecimal.ZERO) != 0) {
            throw new BusinessException(
                    "Eng kam va eng ko'p vazn qadamga karrali bo'lishi kerak (masalan, 1 kg, 5 kg va 0.5 kg qadam)");
        }
    }

    /**
     * Yordamchi metod: tanlangan vazn tort turi qoidalariga mosligini tekshiradi.
     *
     * @param type     tort turi
     * @param weightKg tanlangan vazn
     */
    private void validateWeight(CakeType type, BigDecimal weightKg) {
        if (weightKg.compareTo(type.getMinWeightKg()) < 0) {
            throw new BusinessException("Bu tortning vazni kamida "
                    + type.getMinWeightKg().stripTrailingZeros().toPlainString() + " kg bo'lishi kerak");
        }
        if (weightKg.compareTo(type.getMaxWeightKg()) > 0) {
            throw new BusinessException("Bu tortning vazni ko'pi bilan "
                    + type.getMaxWeightKg().stripTrailingZeros().toPlainString() + " kg bo'lishi mumkin");
        }
        if (weightKg.remainder(type.getWeightStep()).compareTo(BigDecimal.ZERO) != 0) {
            throw new BusinessException("Vazn "
                    + type.getWeightStep().stripTrailingZeros().toPlainString() + " kg qadam bilan tanlanishi kerak");
        }
    }

    /**
     * Yordamchi metod: 1 kg narxini vaznga ko'paytirib, butun so'mga yaxlitlaydi (0.5 va undan ko'p bo'lsa yuqoriga).
     * Pul hisobida double ishlatmaymiz, BigDecimal aniq hisoblaydi.
     *
     * @param pricePerKg 1 kg narxi, so'mda
     * @param weightKg   vazn, kg da
     * @return summa, so'mda
     */
    private long roundedAmount(long pricePerKg, BigDecimal weightKg) {
        return BigDecimal.valueOf(pricePerKg).multiply(weightKg).setScale(0, RoundingMode.HALF_UP).longValueExact();
    }

    /**
     * Yordamchi metod: admin yuborgan ma'lumotni tort turiga ko'chiradi
     * (sortOrder va isActive yuborilmasa, eski qiymat qoladi).
     *
     * @param type    to'ldiriladigan tur
     * @param request admin yuborgan ma'lumot
     */
    private void applyType(CakeType type, CakeTypeRequest request) {
        type.setNameUz(request.nameUz().trim());
        type.setNameRu(request.nameRu().trim());
        type.setImageUrl(blankToNull(request.imageUrl()));
        type.setBasePricePerKg(request.basePricePerKg());
        type.setMinWeightKg(request.minWeightKg());
        type.setMaxWeightKg(request.maxWeightKg());
        type.setWeightStep(request.weightStep());
        type.setServingsPerKg(request.servingsPerKg());
        if (request.sortOrder() != null) {
            type.setSortOrder(request.sortOrder());
        }
        if (request.isActive() != null) {
            type.setIsActive(request.isActive());
        }
    }

    /**
     * Yordamchi metod: admin yuborgan ma'lumotni variantga ko'chiradi
     * (sortOrder va isActive yuborilmasa, eski qiymat qoladi).
     *
     * @param option  to'ldiriladigan variant
     * @param request admin yuborgan ma'lumot
     */
    private void applyOption(CakeOption option, CakeOptionRequest request) {
        option.setKind(request.kind());
        option.setNameUz(request.nameUz().trim());
        option.setNameRu(request.nameRu().trim());
        option.setImageUrl(blankToNull(request.imageUrl()));
        option.setPriceType(request.priceType());
        option.setPriceValue(request.priceValue());
        if (request.sortOrder() != null) {
            option.setSortOrder(request.sortOrder());
        }
        if (request.isActive() != null) {
            option.setIsActive(request.isActive());
        }
    }

    /**
     * Yordamchi metod: tort turidan admin uchun javob yasaydi.
     *
     * @param type tort turi
     * @return javob DTO'si
     */
    private CakeTypeResponse toTypeResponse(CakeType type) {
        return new CakeTypeResponse(type.getId(), type.getNameUz(), type.getNameRu(), type.getImageUrl(),
                type.getBasePricePerKg(), type.getMinWeightKg(), type.getMaxWeightKg(), type.getWeightStep(),
                type.getServingsPerKg(), type.getSortOrder(), type.getIsActive(), type.getCreatedAt(),
                type.getUpdatedAt());
    }

    /**
     * Yordamchi metod: variantdan admin uchun javob yasaydi.
     *
     * @param option variant
     * @return javob DTO'si
     */
    private CakeOptionResponse toOptionResponse(CakeOption option) {
        return new CakeOptionResponse(option.getId(), option.getKind(), option.getNameUz(), option.getNameRu(),
                option.getImageUrl(), option.getPriceType(), option.getPriceValue(), option.getSortOrder(),
                option.getIsActive(), option.getCreatedAt(), option.getUpdatedAt());
    }

    /**
     * Yordamchi metod: matnni tozalaydi, bo'sh bo'lsa null qaytaradi.
     *
     * @param text tekshiriladigan matn
     * @return tozalangan matn yoki null
     */
    private String blankToNull(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        return text.trim();
    }

    /**
     * Yordamchi metod: summani o'qishga qulay ko'rinishga keltiradi (masalan, 150000 -> "150 000").
     *
     * @param amount summa, so'mda
     * @return bo'sh joy bilan ajratilgan summa
     */
    private String formatMoney(long amount) {
        return String.format(Locale.US, "%,d", amount).replace(',', ' ');
    }
}