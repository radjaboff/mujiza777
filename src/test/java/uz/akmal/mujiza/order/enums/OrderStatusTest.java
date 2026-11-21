package uz.akmal.mujiza.order.enums;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * OrderStatus: holatlar o'rtasidagi ruxsat etilgan o'tishlar.
 */
class OrderStatusTest {

    @Test
    void newOrderCanOnlyBeConfirmedOrCancelled() {
        assertThat(OrderStatus.NEW.canMoveTo(OrderStatus.CONFIRMED, OrderType.PICKUP)).isTrue();
        assertThat(OrderStatus.NEW.canMoveTo(OrderStatus.CANCELLED, OrderType.PICKUP)).isTrue();
        assertThat(OrderStatus.NEW.canMoveTo(OrderStatus.PREPARING, OrderType.PICKUP)).isFalse();
        assertThat(OrderStatus.NEW.canMoveTo(OrderStatus.COMPLETED, OrderType.PICKUP)).isFalse();
    }

    @Test
    void cakeOrderWaitingForPriceCanBeConfirmed() {
        assertThat(OrderStatus.PRICE_PENDING.canMoveTo(OrderStatus.CONFIRMED, OrderType.PICKUP)).isTrue();
        assertThat(OrderStatus.PRICE_PENDING.canMoveTo(OrderStatus.PREPARING, OrderType.PICKUP)).isFalse();
    }

    @Test
    void normalFlowMovesStepByStep() {
        assertThat(OrderStatus.CONFIRMED.canMoveTo(OrderStatus.PREPARING, OrderType.DELIVERY)).isTrue();
        assertThat(OrderStatus.PREPARING.canMoveTo(OrderStatus.READY, OrderType.DELIVERY)).isTrue();
        assertThat(OrderStatus.CONFIRMED.canMoveTo(OrderStatus.READY, OrderType.DELIVERY)).isFalse();
    }

    @Test
    void readyPickupGoesStraightToCompleted() {
        assertThat(OrderStatus.READY.canMoveTo(OrderStatus.COMPLETED, OrderType.PICKUP)).isTrue();
        assertThat(OrderStatus.READY.canMoveTo(OrderStatus.DELIVERING, OrderType.PICKUP)).isFalse();
    }

    @Test
    void readyDeliveryGoesThroughDelivering() {
        assertThat(OrderStatus.READY.canMoveTo(OrderStatus.DELIVERING, OrderType.DELIVERY)).isTrue();
        assertThat(OrderStatus.READY.canMoveTo(OrderStatus.COMPLETED, OrderType.DELIVERY)).isFalse();
        assertThat(OrderStatus.DELIVERING.canMoveTo(OrderStatus.COMPLETED, OrderType.DELIVERY)).isTrue();
    }

    @Test
    void finalStatesCannotChange() {
        for (OrderStatus target : OrderStatus.values()) {
            assertThat(OrderStatus.COMPLETED.canMoveTo(target, OrderType.PICKUP)).isFalse();
            assertThat(OrderStatus.CANCELLED.canMoveTo(target, OrderType.PICKUP)).isFalse();
        }
    }
}