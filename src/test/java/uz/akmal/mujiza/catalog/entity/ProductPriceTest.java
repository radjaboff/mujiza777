package uz.akmal.mujiza.catalog.entity;

import org.junit.jupiter.api.Test;
import uz.akmal.mujiza.common.ShopTime;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Product: chegirma va amaldagi narx qoidalari.
 */
class ProductPriceTest {

    /**
     * Yordamchi metod: berilgan narx bilan mahsulot yaratadi.
     */
    private Product product(long price, Long oldPrice, LocalDateTime endsAt) {
        Product product = new Product();
        product.setPrice(price);
        product.setOldPrice(oldPrice);
        product.setDiscountEndsAt(endsAt);
        return product;
    }

    @Test
    void noOldPriceMeansNoDiscount() {
        Product product = product(150_000, null, null);
        assertThat(product.isDiscountActive()).isFalse();
        assertThat(product.getEffectivePrice()).isEqualTo(150_000);
    }

    @Test
    void discountWithoutEndTimeIsPermanent() {
        Product product = product(150_000, 200_000L, null);
        assertThat(product.isDiscountActive()).isTrue();
        assertThat(product.getEffectivePrice()).isEqualTo(150_000);
    }

    @Test
    void discountBeforeEndTimeIsActive() {
        Product product = product(150_000, 200_000L, ShopTime.now().plusHours(1));
        assertThat(product.isDiscountActive()).isTrue();
        assertThat(product.getEffectivePrice()).isEqualTo(150_000);
    }

    @Test
    void expiredDiscountReturnsToOldPrice() {
        Product product = product(150_000, 200_000L, ShopTime.now().minusHours(1));
        assertThat(product.isDiscountActive()).isFalse();
        assertThat(product.getEffectivePrice()).isEqualTo(200_000);
    }

    @Test
    void oldPriceNotHigherThanPriceIsNotADiscount() {
        Product product = product(150_000, 100_000L, null);
        assertThat(product.isDiscountActive()).isFalse();
        assertThat(product.getEffectivePrice()).isEqualTo(150_000);
    }
}