package uz.akmal.mujiza.notification;

import org.junit.jupiter.api.Test;
import uz.akmal.mujiza.order.dto.OrderResponse;
import uz.akmal.mujiza.order.dto.OrderStatusUpdateRequest;
import uz.akmal.mujiza.order.enums.OrderStatus;
import uz.akmal.mujiza.order.enums.OrderType;
import uz.akmal.mujiza.order.service.OrderService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Guruhda tugma faqat ruxsat etilgan foydalanuvchidan qabul qilinadi. Shaxsiy chatda ro'yxat shart emas.
 */
class TelegramCallbackHandlerTest {

    @Test
    void groupRejectsUserOutsideTheAllowlist() {
        TelegramClient client = mock(TelegramClient.class);
        OrderService orders = mock(OrderService.class);
        when(client.isAdminChat(-100L)).thenReturn(true);
        TelegramCallbackHandler handler = handler(client, orders, "-100", "42");

        handler.handle(callback("-100", 99));

        verify(orders, never()).updateStatus(any(), any(), any());
        verify(client).answerCallback("cb", "Sizda bu amal uchun ruxsat yo'q", true);
    }

    @Test
    void groupAcceptsListedUser() {
        TelegramClient client = mock(TelegramClient.class);
        OrderService orders = mock(OrderService.class);
        when(client.isAdminChat(-100L)).thenReturn(true);
        stubRefresh(orders);
        TelegramCallbackHandler handler = handler(client, orders, "-100", "42");

        handler.handle(callback("-100", 42));

        verify(orders).updateStatus(eq(5L), any(OrderStatusUpdateRequest.class), any());
    }

    @Test
    void privateChatAcceptsAnyMemberWhenAllowlistIsEmpty() {
        TelegramClient client = mock(TelegramClient.class);
        OrderService orders = mock(OrderService.class);
        when(client.isAdminChat(12345L)).thenReturn(true);
        stubRefresh(orders);
        TelegramCallbackHandler handler = handler(client, orders, "12345", "");

        handler.handle(callback("12345", 7));

        verify(orders).updateStatus(eq(5L), any(OrderStatusUpdateRequest.class), any());
    }

    private static void stubRefresh(OrderService orders) {
        OrderResponse response = new OrderResponse(
                5L, "MJ-1005", "tok-5", OrderStatus.NEW, OrderType.DELIVERY,
                "Ali", "+998901234567", null, null, "Toshkent", null, null,
                uz.akmal.mujiza.order.enums.PaymentMethod.CASH, null, java.util.List.of(), 100_000L, 20_000L, 120_000L,
                null, null, null, java.util.List.of(), java.time.LocalDateTime.now(), java.time.LocalDateTime.now(),
                null, 0L, null, null, null, false, false, null, null, null, null
        );
        when(orders.getById(5L)).thenReturn(response);
    }

    private static TelegramCallbackHandler handler(TelegramClient client, OrderService orders,
                                                   String chatId, String allowlist) {
        OrderNotificationMessageBuilder builder = mock(OrderNotificationMessageBuilder.class);
        when(builder.buildOrderMessageWithStatus(5L)).thenReturn("ok");
        return new TelegramCallbackHandler(client, orders, builder, chatId, allowlist);
    }

    private static TelegramModels.CallbackQuery callback(String chatId, long userId) {
        return new TelegramModels.CallbackQuery(
                "cb",
                new TelegramModels.User(userId, "staff", "Staff"),
                new TelegramModels.Message(1, new TelegramModels.Chat(Long.parseLong(chatId))),
                "go:5:CONFIRMED");
    }
}
