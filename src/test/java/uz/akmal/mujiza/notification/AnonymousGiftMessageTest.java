package uz.akmal.mujiza.notification;

import org.junit.jupiter.api.Test;
import uz.akmal.mujiza.order.entity.CustomerOrder;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Anonim sovg'a Telegram matnida xaridor ismi va telefoni chiqmaydi.
 */
class AnonymousGiftMessageTest {

    private final OrderNotificationMessageBuilder builder = new OrderNotificationMessageBuilder(null, null);

    @Test
    void anonymousGiftShowsRecipientOnly() {
        CustomerOrder order = order();
        order.setIsAnonymousGift(true);

        String text = contact(order);

        assertThat(text).contains("Dilnoza").contains("+998907776655").contains("Anonim");
        assertThat(text).doesNotContain("Akmal").doesNotContain("+998901112233");
    }

    @Test
    void namedOrderShowsBuyer() {
        String text = contact(order());

        assertThat(text).contains("Akmal").contains("+998901112233");
        assertThat(text).doesNotContain("Dilnoza");
    }

    private String contact(CustomerOrder order) {
        StringBuilder sb = new StringBuilder();
        builder.appendCustomerContact(sb, order);
        return sb.toString();
    }

    private static CustomerOrder order() {
        CustomerOrder order = new CustomerOrder();
        order.setCustomerName("Akmal");
        order.setCustomerPhone("+998901112233");
        order.setRecipientName("Dilnoza");
        order.setRecipientPhone("+998907776655");
        order.setIsAnonymousGift(false);
        return order;
    }
}
