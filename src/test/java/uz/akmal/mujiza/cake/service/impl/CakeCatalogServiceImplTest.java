package uz.akmal.mujiza.cake.service.impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import uz.akmal.mujiza.cake.dto.CakeQuote;
import uz.akmal.mujiza.cake.entity.CakeOption;
import uz.akmal.mujiza.cake.entity.CakeType;
import uz.akmal.mujiza.cake.enums.CakeOptionKind;
import uz.akmal.mujiza.cake.enums.CakePriceType;
import uz.akmal.mujiza.cake.repository.CakeOptionRepository;
import uz.akmal.mujiza.cake.repository.CakeTypeRepository;
import uz.akmal.mujiza.common.exception.BusinessException;
import uz.akmal.mujiza.shop.repository.ShopSettingsRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/**
 * CakeCatalogServiceImpl.quote: tort tanlovini tekshirish va narxni hisoblash qoidalari.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CakeCatalogServiceImplTest {

    @Mock
    private CakeTypeRepository typeRepository;

    @Mock
    private CakeOptionRepository optionRepository;

    @Mock
    private ShopSettingsRepository settingsRepository;

    private CakeCatalogServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new CakeCatalogServiceImpl(typeRepository, optionRepository, settingsRepository);
        // Tort turi: 1 kg = 150 000 so'm, 1 dan 5 kg gacha, 0.5 kg qadam bilan
        CakeType type = new CakeType();
        type.setId(1L);
        type.setNameUz("Yumaloq tort");
        type.setNameRu("Круглый торт");
        type.setBasePricePerKg(150_000L);
        type.setMinWeightKg(new BigDecimal("1.00"));
        type.setMaxWeightKg(new BigDecimal("5.00"));
        type.setWeightStep(new BigDecimal("0.50"));
        when(typeRepository.findByIdAndIsDeletedFalse(1L)).thenReturn(Optional.of(type));
    }

    /**
     * Yordamchi metod: faol variantlar ro'yxatini repository qaytaradigan qiladi.
     */
    private void activeOptions(CakeOption... options) {
        when(optionRepository.findAllByIsDeletedFalseAndIsActiveTrueOrderBySortOrderAscIdAsc())
                .thenReturn(List.of(options));
    }

    private CakeOption option(long id, CakeOptionKind kind, CakePriceType priceType, long price) {
        CakeOption option = new CakeOption();
        option.setId(id);
        option.setKind(kind);
        option.setNameUz("V" + id);
        option.setNameRu("V" + id);
        option.setPriceType(priceType);
        option.setPriceValue(price);
        return option;
    }

    @Test
    void calculatesTotalFromBaseAndOptions() {
        activeOptions(
                option(10, CakeOptionKind.FLAVOR, CakePriceType.PER_KG, 20_000),
                option(20, CakeOptionKind.CREAM, CakePriceType.PER_KG, 0),
                option(30, CakeOptionKind.DECOR, CakePriceType.FIXED, 30_000),
                option(40, CakeOptionKind.EXTRA, CakePriceType.FIXED, 15_000));

        CakeQuote quote = service.quote(1L, new BigDecimal("1.5"), List.of(40L, 30L, 20L, 10L));

        // Tort: 150 000 x 1.5 = 225 000; ta'm: 20 000 x 1.5 = 30 000; krem 0; bezak 30 000; yozuv 15 000
        assertThat(quote.baseAmount()).isEqualTo(225_000);
        assertThat(quote.optionAmounts()).containsExactly(30_000L, 0L, 30_000L, 15_000L);
        assertThat(quote.total()).isEqualTo(300_000);
    }

    @Test
    void roundsEachLineHalfUp() {
        activeOptions(
                option(10, CakeOptionKind.FLAVOR, CakePriceType.PER_KG, 3_333),
                option(20, CakeOptionKind.CREAM, CakePriceType.PER_KG, 0));
        CakeQuote quote = service.quote(1L, new BigDecimal("1.5"), List.of(10L, 20L));
        // 3 333 x 1.5 = 4 999.5 -> 5 000
        assertThat(quote.optionAmounts().get(0)).isEqualTo(5_000);
        assertThat(quote.total()).isEqualTo(quote.baseAmount() + 5_000);
    }

    @Test
    void rejectsWeightNotMatchingStep() {
        activeOptions(option(10, CakeOptionKind.FLAVOR, CakePriceType.PER_KG, 0));
        assertThatThrownBy(() -> service.quote(1L, new BigDecimal("1.7"), List.of(10L)))
                .isInstanceOf(BusinessException.class).hasMessageContaining("0.5 kg qadam");
    }

    @Test
    void rejectsWeightOutOfRange() {
        activeOptions(option(10, CakeOptionKind.FLAVOR, CakePriceType.PER_KG, 0));
        assertThatThrownBy(() -> service.quote(1L, new BigDecimal("6"), List.of(10L)))
                .isInstanceOf(BusinessException.class).hasMessageContaining("ko'pi bilan 5 kg");
        assertThatThrownBy(() -> service.quote(1L, new BigDecimal("0.5"), List.of(10L)))
                .isInstanceOf(BusinessException.class).hasMessageContaining("kamida 1 kg");
    }

    @Test
    void requiresFlavorWhenFlavorOptionsExist() {
        activeOptions(
                option(10, CakeOptionKind.FLAVOR, CakePriceType.PER_KG, 0),
                option(30, CakeOptionKind.DECOR, CakePriceType.FIXED, 30_000));
        assertThatThrownBy(() -> service.quote(1L, new BigDecimal("1.5"), List.of(30L)))
                .isInstanceOf(BusinessException.class).hasMessageContaining("Qatlam ta'mi tanlanishi kerak");
    }

    @Test
    void doesNotRequireGroupWithoutActiveOptions() {
        // Kremda faol variant yo'q: krem tanlash majburiy emas
        activeOptions(option(10, CakeOptionKind.FLAVOR, CakePriceType.PER_KG, 0));
        assertThat(service.quote(1L, new BigDecimal("1.5"), List.of(10L)).total()).isEqualTo(225_000);
    }

    @Test
    void rejectsTooManyFlavors() {
        activeOptions(
                option(10, CakeOptionKind.FLAVOR, CakePriceType.PER_KG, 0),
                option(11, CakeOptionKind.FLAVOR, CakePriceType.PER_KG, 0),
                option(12, CakeOptionKind.FLAVOR, CakePriceType.PER_KG, 0));
        assertThatThrownBy(() -> service.quote(1L, new BigDecimal("1.5"), List.of(10L, 11L, 12L)))
                .isInstanceOf(BusinessException.class).hasMessageContaining("ko'pi bilan 2 ta");
    }

    @Test
    void rejectsUnknownOption() {
        activeOptions(option(10, CakeOptionKind.FLAVOR, CakePriceType.PER_KG, 0));
        assertThatThrownBy(() -> service.quote(1L, new BigDecimal("1.5"), List.of(10L, 999L)))
                .isInstanceOf(BusinessException.class).hasMessageContaining("mavjud emas");
    }

    @Test
    void duplicateOptionIdsCountOnce() {
        activeOptions(option(10, CakeOptionKind.FLAVOR, CakePriceType.PER_KG, 20_000));
        CakeQuote quote = service.quote(1L, new BigDecimal("1.5"), List.of(10L, 10L));
        assertThat(quote.options()).hasSize(1);
    }
}