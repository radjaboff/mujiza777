package uz.akmal.mujiza.marketing.service.impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import uz.akmal.mujiza.audit.service.AuditService;
import uz.akmal.mujiza.common.exception.BusinessException;
import uz.akmal.mujiza.marketing.dto.PromoApplication;
import uz.akmal.mujiza.marketing.dto.PromoValidateRequest;
import uz.akmal.mujiza.marketing.dto.PromoValidateResponse;
import uz.akmal.mujiza.marketing.entity.PromoCode;
import uz.akmal.mujiza.marketing.enums.DiscountType;
import uz.akmal.mujiza.marketing.mapper.PromoCodeMapper;
import uz.akmal.mujiza.marketing.repository.PromoCodeRepository;
import uz.akmal.mujiza.order.enums.OrderStatus;
import uz.akmal.mujiza.order.repository.CustomerOrderRepository;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * PromoCodeServiceImpl: chegirma hisoblash va kodni qo'llash qoidalari (baza o'rniga soxta repository bilan).
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PromoCodeServiceImplTest {

    private static final String PHONE = "+998901112233";

    @Mock
    private PromoCodeRepository promoRepository;

    @Mock
    private CustomerOrderRepository orderRepository;

    @Mock
    private AuditService auditService;

    private PromoCodeServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new PromoCodeServiceImpl(promoRepository, orderRepository, new PromoCodeMapper(), auditService);
    }

    /**
     * Yordamchi metod: NAVROZ10 kodini yaratadi va repository uni qaytaradigan qiladi.
     */
    private PromoCode promo(DiscountType type, long value) {
        PromoCode promo = new PromoCode();
        promo.setCode("NAVROZ10");
        promo.setDiscountType(type);
        promo.setDiscountValue(value);
        when(promoRepository.findByCodeAndIsDeletedFalse("NAVROZ10")).thenReturn(Optional.of(promo));
        when(promoRepository.findByCodeForUpdate("NAVROZ10")).thenReturn(Optional.of(promo));
        return promo;
    }

    private PromoValidateResponse validate(long itemsTotal, String phone) {
        return service.validate(new PromoValidateRequest("navroz10", itemsTotal, phone));
    }

    @Test
    void percentDiscountIsCalculatedFromItemsTotal() {
        promo(DiscountType.PERCENT, 10);
        PromoValidateResponse result = validate(360_000, null);
        assertThat(result.valid()).isTrue();
        assertThat(result.discountAmount()).isEqualTo(36_000);
    }

    @Test
    void percentDiscountRespectsMaxDiscountAmount() {
        PromoCode promo = promo(DiscountType.PERCENT, 10);
        promo.setMaxDiscountAmount(50_000L);
        assertThat(validate(800_000, null).discountAmount()).isEqualTo(50_000);
    }

    @Test
    void fixedDiscountNeverExceedsItemsTotal() {
        promo(DiscountType.FIXED, 20_000);
        assertThat(validate(10_000, null).discountAmount()).isEqualTo(10_000);
        assertThat(validate(100_000, null).discountAmount()).isEqualTo(20_000);
    }

    @Test
    void rejectsWhenBelowMinimumOrderAmount() {
        PromoCode promo = promo(DiscountType.PERCENT, 10);
        promo.setMinOrderAmount(100_000L);
        PromoValidateResponse result = validate(50_000, null);
        assertThat(result.valid()).isFalse();
        assertThat(result.message()).contains("100 000");
    }

    @Test
    void rejectsExpiredCode() {
        PromoCode promo = promo(DiscountType.PERCENT, 10);
        promo.setValidTo(LocalDateTime.now().minusDays(1));
        assertThat(validate(360_000, null).message()).contains("muddati tugagan");
    }

    @Test
    void rejectsCodeThatIsNotStartedYet() {
        PromoCode promo = promo(DiscountType.PERCENT, 10);
        promo.setValidFrom(LocalDateTime.now().plusDays(1));
        assertThat(validate(360_000, null).message()).contains("hali amal qilmaydi");
    }

    @Test
    void rejectsWhenUsageLimitReached() {
        PromoCode promo = promo(DiscountType.PERCENT, 10);
        promo.setMaxUses(2);
        promo.setUsedCount(2);
        assertThat(validate(360_000, null).message()).contains("limiti tugagan");
    }

    @Test
    void rejectsDisabledCodeAsNotFound() {
        PromoCode promo = promo(DiscountType.PERCENT, 10);
        promo.setIsActive(false);
        assertThat(validate(360_000, null).message()).contains("topilmadi");
    }

    @Test
    void unknownCodeIsNotFound() {
        when(promoRepository.findByCodeAndIsDeletedFalse("YOQ")).thenReturn(Optional.empty());
        PromoValidateResponse result = service.validate(new PromoValidateRequest("yoq", 100_000L, null));
        assertThat(result.valid()).isFalse();
        assertThat(result.message()).contains("topilmadi");
    }

    @Test
    void firstOrderOnlyRejectsCustomerWithPreviousOrder() {
        PromoCode promo = promo(DiscountType.PERCENT, 15);
        promo.setFirstOrderOnly(true);
        when(orderRepository.existsByCustomerPhoneAndStatusNot(PHONE, OrderStatus.CANCELLED)).thenReturn(true);
        PromoValidateResponse result = validate(360_000, PHONE);
        assertThat(result.valid()).isFalse();
        assertThat(result.message()).contains("birinchi buyurtma");
    }

    @Test
    void firstOrderOnlyAcceptsNewCustomer() {
        PromoCode promo = promo(DiscountType.PERCENT, 15);
        promo.setFirstOrderOnly(true);
        when(orderRepository.existsByCustomerPhoneAndStatusNot(PHONE, OrderStatus.CANCELLED)).thenReturn(false);
        assertThat(validate(360_000, PHONE).valid()).isTrue();
    }

    @Test
    void applyIncreasesUsageCounter() {
        PromoCode promo = promo(DiscountType.PERCENT, 10);
        PromoApplication result = service.apply("navroz10", 360_000, PHONE);
        assertThat(result.code()).isEqualTo("NAVROZ10");
        assertThat(result.discountAmount()).isEqualTo(36_000);
        assertThat(promo.getUsedCount()).isEqualTo(1);
        verify(promoRepository).save(promo);
    }

    @Test
    void applyRejectsInvalidCodeAndDoesNotChangeCounter() {
        PromoCode promo = promo(DiscountType.PERCENT, 10);
        promo.setValidTo(LocalDateTime.now().minusDays(1));
        assertThatThrownBy(() -> service.apply("navroz10", 360_000, PHONE)).isInstanceOf(BusinessException.class);
        assertThat(promo.getUsedCount()).isZero();
    }

    @Test
    void releaseDecreasesCounterButNeverBelowZero() {
        PromoCode promo = promo(DiscountType.PERCENT, 10);
        promo.setUsedCount(1);
        service.release("navroz10");
        assertThat(promo.getUsedCount()).isZero();
        service.release("navroz10");
        assertThat(promo.getUsedCount()).isZero();
    }
}