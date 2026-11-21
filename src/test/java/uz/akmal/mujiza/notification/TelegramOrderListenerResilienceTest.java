package uz.akmal.mujiza.notification;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import uz.akmal.mujiza.order.enums.OrderStatus;
import uz.akmal.mujiza.order.enums.OrderType;
import uz.akmal.mujiza.order.event.OrderCreatedEvent;
import uz.akmal.mujiza.order.event.OrderStatusChangedEvent;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Verifies Telegram listener resilience against API timeouts, down services,
 * duplicate notifications, and admin web-to-bot status sync.
 */
class TelegramOrderListenerResilienceTest {

    private OrderNotificationMessageBuilder messageBuilder;
    private TelegramClient telegramClient;
    private TelegramOrderListener listener;

    @BeforeEach
    void setUp() {
        messageBuilder = mock(OrderNotificationMessageBuilder.class);
        telegramClient = mock(TelegramClient.class);
        listener = new TelegramOrderListener(messageBuilder, telegramClient);
    }

    @Test
    void whenTelegramIsDisabledNoCallsAreMade() {
        when(telegramClient.isEnabled()).thenReturn(false);

        listener.onOrderCreated(new OrderCreatedEvent(1L, "ORD-101", OrderStatus.NEW));

        verify(messageBuilder, never()).buildNewOrderMessage(anyLong());
        verify(telegramClient, never()).sendToAdmin(any(), any());
    }

    @Test
    void telegramFailureDoesNotThrowOrPropagateException() {
        when(telegramClient.isEnabled()).thenReturn(true);
        when(messageBuilder.findReferenceImageUrl(1L)).thenReturn(null);
        when(messageBuilder.buildNewOrderMessage(1L)).thenReturn("<b>New Order</b>");
        doThrow(new RuntimeException("Telegram network timeout"))
                .when(telegramClient).sendToAdmin(any(), any());

        assertThatCode(() -> listener.onOrderCreated(new OrderCreatedEvent(1L, "ORD-101", OrderStatus.NEW)))
                .doesNotThrowAnyException();
    }

    @Test
    void telegramOriginatedStatusChangeSkipsDuplicateNotification() {
        when(telegramClient.isEnabled()).thenReturn(true);

        OrderStatusChangedEvent event = new OrderStatusChangedEvent(
                1L, "ORD-101", "tok-123", OrderStatus.NEW, OrderStatus.CONFIRMED,
                "telegram:12345"
        );

        listener.onStatusChanged(event);

        verify(messageBuilder, never()).buildStatusChangeNotification(any());
        verify(telegramClient, never()).sendToAdmin(any());
    }

    @Test
    void adminPanelStatusChangeSendsNotificationToTelegram() {
        when(telegramClient.isEnabled()).thenReturn(true);
        when(messageBuilder.buildStatusChangeNotification(any())).thenReturn("<b>Status updated by Admin</b>");

        OrderStatusChangedEvent event = new OrderStatusChangedEvent(
                1L, "ORD-101", "tok-123", OrderStatus.NEW, OrderStatus.CONFIRMED,
                "admin_user"
        );

        listener.onStatusChanged(event);

        verify(messageBuilder).buildStatusChangeNotification(event);
        verify(telegramClient).sendToAdmin(eq("<b>Status updated by Admin</b>"));
    }
}
