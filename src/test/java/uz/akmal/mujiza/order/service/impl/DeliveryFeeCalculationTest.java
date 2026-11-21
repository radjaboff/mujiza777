package uz.akmal.mujiza.order.service.impl;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import uz.akmal.mujiza.order.entity.CustomerOrder;
import uz.akmal.mujiza.order.enums.OrderType;
import uz.akmal.mujiza.shop.entity.ShopSettings;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.CALLS_REAL_METHODS;
import static org.mockito.Mockito.mock;

class DeliveryFeeCalculationTest {

    private final OrderServiceImpl service = mock(OrderServiceImpl.class, CALLS_REAL_METHODS);

    @Test
    @DisplayName("Olib ketishda (PICKUP) yetkazish narxi har doim 0 bo'ladi")
    void pickupIsAlwaysFree() {
        CustomerOrder order = new CustomerOrder();
        order.setOrderType(OrderType.PICKUP);
        order.setItemsTotal(50_000L);

        ShopSettings settings = new ShopSettings();
        settings.setDeliveryFee(15_000L);
        settings.setFreeDeliveryFrom(100_000L);

        assertThat(service.calculateDeliveryFee(order, settings)).isZero();
    }

    @Test
    @DisplayName("Bepul yetkazish chegarasi 0 bo'lsa, chegarasiz deb hisoblanadi va yetkazish pullik bo'ladi")
    void zeroThresholdMeansNoFreeDelivery() {
        CustomerOrder order = new CustomerOrder();
        order.setOrderType(OrderType.DELIVERY);
        order.setItemsTotal(100_000L);

        ShopSettings settings = new ShopSettings();
        settings.setDeliveryFee(15_000L);
        settings.setFreeDeliveryFrom(0L); // 0 = chegara yo'q

        assertThat(service.calculateDeliveryFee(order, settings)).isEqualTo(15_000L);
    }

    @Test
    @DisplayName("Bepul yetkazish chegarasi null bo'lsa, yetkazish pullik bo'ladi")
    void nullThresholdMeansNoFreeDelivery() {
        CustomerOrder order = new CustomerOrder();
        order.setOrderType(OrderType.DELIVERY);
        order.setItemsTotal(100_000L);

        ShopSettings settings = new ShopSettings();
        settings.setDeliveryFee(15_000L);
        settings.setFreeDeliveryFrom(null);

        assertThat(service.calculateDeliveryFee(order, settings)).isEqualTo(15_000L);
    }

    @Test
    @DisplayName("Chegaraga yetmagan buyurtmalarda yetkazish to'lovi olinadi")
    void belowThresholdChargesDeliveryFee() {
        CustomerOrder order = new CustomerOrder();
        order.setOrderType(OrderType.DELIVERY);
        order.setItemsTotal(99_999L);

        ShopSettings settings = new ShopSettings();
        settings.setDeliveryFee(20_000L);
        settings.setFreeDeliveryFrom(100_000L);

        assertThat(service.calculateDeliveryFee(order, settings)).isEqualTo(20_000L);
    }

    @Test
    @DisplayName("Chegaraga teng yoki undan oshgan buyurtmada yetkazib berish bepul (0 so'm)")
    void atOrAboveThresholdIsFree() {
        CustomerOrder order = new CustomerOrder();
        order.setOrderType(OrderType.DELIVERY);
        order.setItemsTotal(100_000L);

        ShopSettings settings = new ShopSettings();
        settings.setDeliveryFee(20_000L);
        settings.setFreeDeliveryFrom(100_000L);

        assertThat(service.calculateDeliveryFee(order, settings)).isZero();

        order.setItemsTotal(150_000L);
        assertThat(service.calculateDeliveryFee(order, settings)).isZero();
    }
}
