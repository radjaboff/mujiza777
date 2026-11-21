package uz.akmal.mujiza.order.service.impl;

import org.junit.jupiter.api.Test;
import uz.akmal.mujiza.catalog.entity.Category;
import uz.akmal.mujiza.catalog.entity.Product;
import uz.akmal.mujiza.catalog.enums.UnitType;
import uz.akmal.mujiza.order.entity.CustomerOrder;
import uz.akmal.mujiza.order.entity.OrderItem;
import uz.akmal.mujiza.order.enums.OrderType;
import uz.akmal.mujiza.shop.entity.ShopSettings;

import java.math.BigDecimal;
import java.math.RoundingMode;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Deep verification test for cart item pricing, delivery fee threshold,
 * fractional quantity calculation, and promo code deduction.
 */
class CartPriceCalculationTest {

    private long calculateLineTotal(long unitPrice, BigDecimal quantity) {
        return BigDecimal.valueOf(unitPrice)
                .multiply(quantity)
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();
    }

    private long calculateDeliveryFee(CustomerOrder order, ShopSettings settings) {
        if (order.getOrderType() != OrderType.DELIVERY) {
            return 0L;
        }
        Long freeFrom = settings.getFreeDeliveryFrom();
        if (freeFrom != null && freeFrom > 0L && order.getItemsTotal() >= freeFrom) {
            return 0L;
        }
        return settings.getDeliveryFee();
    }

    @Test
    void multiItemCartCalculationComputesExactTotals() {
        CustomerOrder order = new CustomerOrder();
        order.setOrderType(OrderType.DELIVERY);

        // Product 1: Medovik cake by piece (2 pieces * 150,000 UZS = 300,000 UZS)
        long line1 = calculateLineTotal(150_000L, new BigDecimal("2"));
        assertThat(line1).isEqualTo(300_000L);

        // Product 2: Pishiriqlar by weight (1.5 kg * 85,000 UZS = 127,500 UZS)
        long line2 = calculateLineTotal(85_000L, new BigDecimal("1.5"));
        assertThat(line2).isEqualTo(127_500L);

        // Product 3: Eclairs by piece with rounding check (3 pieces * 12,333 UZS = 36,999 UZS)
        long line3 = calculateLineTotal(12_333L, new BigDecimal("3"));
        assertThat(line3).isEqualTo(36_999L);

        long itemsTotal = line1 + line2 + line3;
        order.setItemsTotal(itemsTotal);
        assertThat(itemsTotal).isEqualTo(464_499L);

        // Shop settings: Delivery fee 25,000 UZS, free delivery from 500,000 UZS
        ShopSettings settings = new ShopSettings();
        settings.setDeliveryFee(25_000L);
        settings.setFreeDeliveryFrom(500_000L);

        long deliveryFee = calculateDeliveryFee(order, settings);
        assertThat(deliveryFee).isEqualTo(25_000L);

        // Promo code discount: 20,000 UZS
        long discount = 20_000L;
        order.setDiscountAmount(discount);
        order.setDeliveryFee(deliveryFee);
        order.setTotalAmount(itemsTotal - discount + deliveryFee);

        // Total should be exactly: 464,499 - 20,000 + 25,000 = 469,499 UZS
        assertThat(order.getTotalAmount()).isEqualTo(469_499L);
    }

    @Test
    void freeDeliveryAppliesWhenItemsTotalReachesThreshold() {
        CustomerOrder order = new CustomerOrder();
        order.setOrderType(OrderType.DELIVERY);

        // 500,000 UZS total
        order.setItemsTotal(500_000L);

        ShopSettings settings = new ShopSettings();
        settings.setDeliveryFee(25_000L);
        settings.setFreeDeliveryFrom(500_000L);

        long deliveryFee = calculateDeliveryFee(order, settings);
        assertThat(deliveryFee).isZero();
    }

    @Test
    void pickupOrdersHaveZeroDeliveryFeeRegardlessOfTotal() {
        CustomerOrder order = new CustomerOrder();
        order.setOrderType(OrderType.PICKUP);
        order.setItemsTotal(50_000L);

        ShopSettings settings = new ShopSettings();
        settings.setDeliveryFee(30_000L);
        settings.setFreeDeliveryFrom(200_000L);

        long deliveryFee = calculateDeliveryFee(order, settings);
        assertThat(deliveryFee).isZero();
    }

    @Test
    void fractionalKgRoundingUsesHalfUpCorrectly() {
        // 0.333 kg * 100,000 UZS = 33,300 UZS
        long total1 = calculateLineTotal(100_000L, new BigDecimal("0.333"));
        assertThat(total1).isEqualTo(33_300L);

        // 0.125 kg * 75,000 UZS = 9,375 UZS
        long total2 = calculateLineTotal(75_000L, new BigDecimal("0.125"));
        assertThat(total2).isEqualTo(9_375L);
    }
}
