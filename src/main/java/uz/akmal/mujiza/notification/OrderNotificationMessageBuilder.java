package uz.akmal.mujiza.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.akmal.mujiza.cake.entity.CakeRequest;
import uz.akmal.mujiza.cake.entity.CakeRequestOption;
import uz.akmal.mujiza.cake.enums.CakeOptionKind;
import uz.akmal.mujiza.cake.repository.CakeRequestRepository;
import uz.akmal.mujiza.common.exception.ResourceNotFoundException;
import uz.akmal.mujiza.order.entity.CustomerOrder;
import uz.akmal.mujiza.order.entity.OrderItem;
import uz.akmal.mujiza.order.enums.OrderStatus;
import uz.akmal.mujiza.order.enums.OrderType;
import uz.akmal.mujiza.order.enums.PaymentMethod;
import uz.akmal.mujiza.order.event.OrderStatusChangedEvent;
import uz.akmal.mujiza.order.repository.CustomerOrderRepository;
import uz.akmal.mujiza.shop.entity.Branch;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Buyurtma haqidagi Telegram xabarlarining matnini tayyorlaydi (HTML ko'rinishida).
 * Buyurtmani bazadan o'zi o'qiydi, shuning uchun alohida oqimdan ham xavfsiz chaqiriladi.
 */
@Service
@RequiredArgsConstructor
public class OrderNotificationMessageBuilder {

    /**
     * Taxminiy tayyor bo'lish vaqtining ko'rinishi, masalan "26.10 14:30".
     */
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("dd.MM HH:mm");

    /**
     * Xabarda ko'rsatiladigan mahsulot qatorlarining eng ko'p soni (Telegram xabari uzunligi cheklangan: 4096 belgi).
     */
    private static final int MAX_ITEM_LINES = 20;

    /**
     * Mahsulot nomining xabardagi eng ko'p uzunligi.
     */
    private static final int MAX_NAME_LENGTH = 60;

    /**
     * Buyurtmalarni o'qish uchun.
     */
    private final CustomerOrderRepository orderRepository;

    /**
     * Tort tafsilotlarini o'qish uchun.
     */
    private final CakeRequestRepository cakeRequestRepository;

    /**
     * Saytning ochiq manzili (namuna rasm havolasini to'liq qilish uchun).
     */
    @Value("${app.public-base-url:http://localhost:8081}")
    private String publicBaseUrl;

    /**
     * Sana ko'rinishi, masalan "30.10.2026".
     */
    private static final DateTimeFormatter DAY_FORMAT = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    /**
     * Soat ko'rinishi, masalan "14:00".
     */
    private static final DateTimeFormatter HOUR_FORMAT = DateTimeFormatter.ofPattern("HH:mm");

    /**
     * Tort buyurtmasiga yuklangan namuna rasm manzilini topadi.
     *
     * @param orderId buyurtma raqami
     * @return rasm manzili yoki null
     */
    @Transactional(readOnly = true)
    public String findReferenceImageUrl(Long orderId) {
        return cakeRequestRepository.findByOrderId(orderId)
                .map(CakeRequest::getReferenceImageUrl)
                .orElse(null);
    }

    /**
     * Yangi buyurtma haqidagi xabar matnini tayyorlaydi (oddiy yoki tort buyurtmasi).
     *
     * @param orderId buyurtmaning raqami
     * @return tayyor HTML matn
     */
    @Transactional(readOnly = true)
    public String buildNewOrderMessage(Long orderId) {
        CustomerOrder order = findOrder(orderId);
        CakeRequest cake = Boolean.TRUE.equals(order.getIsCakeOrder())
                ? cakeRequestRepository.findByOrderId(orderId).orElse(null)
                : null;
        StringBuilder sb = new StringBuilder();

        sb.append(cake != null ? "🎂 <b>Yangi MAXSUS TORT arizasi " : "🆕 <b>Yangi buyurtma ")
                .append(escape(order.getOrderNumber())).append("</b>\n\n");
        appendCustomerContact(sb, order);
        sb.append('\n');

        // Olib ketish yoki yetkazib berish tafsilotlari
        if (order.getOrderType() == OrderType.PICKUP) {
            sb.append("📦 <b>Qabul qilish:</b> Olib ketish");
            Branch branch = order.getBranch();
            if (branch != null) {
                sb.append(" (").append(escape(branch.getNameUz())).append(")");
            }
            if (order.getPickupCode() != null) {
                sb.append("\n🔑 <b>Olib ketish kodi:</b> <code>").append(escape(order.getPickupCode())).append("</code>");
            }
            sb.append('\n');
        } else {
            sb.append("🚚 <b>Qabul qilish:</b> Yetkazib berish\n");
            sb.append("📍 <b>Manzil:</b> ").append(escape(order.getDeliveryAddress())).append('\n');
            if (order.getLatitude() != null && order.getLongitude() != null) {
                sb.append("🗺 <a href=\"https://www.google.com/maps?q=")
                        .append(order.getLatitude()).append(',').append(order.getLongitude())
                        .append("\">Xaritada ochish</a>\n");
            }
        }
        sb.append("💳 <b>To'lov usuli:</b> ").append(order.getPaymentMethod() == PaymentMethod.CASH ? "Naqd to‘lov" : "Karta orqali").append('\n');

        // Tanlangan sana va vaqt oynasi
        if (order.getScheduledDate() != null) {
            sb.append("📅 <b>Kerakli sana:</b> ").append(order.getScheduledDate().format(DAY_FORMAT));
            if (order.getSlotStart() != null) {
                sb.append(", ").append(order.getSlotStart().format(HOUR_FORMAT)).append('-')
                        .append(order.getSlotEnd().format(HOUR_FORMAT));
            }
            sb.append('\n');
        }

        // Sovg'a: qabul qiluvchi va tabrik; anonim bo'lsa ogohlantirish
        if (Boolean.TRUE.equals(order.getIsGift())) {
            if (!Boolean.TRUE.equals(order.getIsAnonymousGift())) {
                sb.append("🎁 <b>SOVG'A:</b> ").append(escape(order.getRecipientName()))
                        .append(", ").append(escape(order.getRecipientPhone())).append('\n');
            }
            if (order.getGiftMessage() != null) {
                sb.append("💌 ").append(escape(order.getGiftMessage())).append('\n');
            }
            if (Boolean.TRUE.equals(order.getIsAnonymousGift())) {
                sb.append("⚠️ <b>Anonim:</b> qabul qiluvchiga xaridor nomini aytmang\n");
            }
        }

        if (cake != null) {
            // Tort tafsilotlari: tur, vazn, variantlar, yozuv va namuna rasm
            sb.append("\n🎂 <b>TORT TAFSILOTLARI:</b>\n");
            sb.append("📐 <b>Shakli:</b> ").append(escape(cake.getTypeNameUz())).append('\n');
            if (cake.getOptions() != null && !cake.getOptions().isEmpty()) {
                for (CakeRequestOption opt : cake.getOptions()) {
                    String prefix = opt.getKind() == CakeOptionKind.FLAVOR ? "🍦 <b>Ichki ta‘mi:</b> " :
                            (opt.getKind() == CakeOptionKind.DECOR ? "🎨 <b>Ustki bezagi:</b> " : "✨ <b>Qo‘shimcha:</b> ");
                    sb.append(prefix).append(escape(opt.getNameUz())).append('\n');
                }
            }
            if (cake.getInscription() != null && !cake.getInscription().isBlank()) {
                sb.append("✍️ <b>Tabrik yozuvi:</b> «").append(escape(cake.getInscription())).append("»\n");
            }
            if (cake.getReferenceImageUrl() != null && !cake.getReferenceImageUrl().isBlank()) {
                String fullImgUrl = cake.getReferenceImageUrl().startsWith("http")
                        ? cake.getReferenceImageUrl()
                        : (publicBaseUrl.endsWith("/") ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1) : publicBaseUrl)
                                + cake.getReferenceImageUrl();
                sb.append("📸 <b>Namuna rasm:</b> <a href=\"").append(fullImgUrl).append("\">Ko‘rish</a> (Fayl yuqorida yuborildi)\n");
            }

            // Izohlarni chiroyli va tartibli ajratish
            if (order.getComment() != null && !order.getComment().isBlank()) {
                String[] parts = order.getComment().split("\\s*\\|\\s*");
                List<String> customNotes = new ArrayList<>();
                for (String part : parts) {
                    if (part.startsWith("Shakl:") || part.startsWith("Ichi (Ta'mi):") || part.startsWith("Bezak:")) {
                        continue;
                    }
                    customNotes.add(part);
                }
                if (!customNotes.isEmpty()) {
                    sb.append("\n💬 <b>Mijoz istaklari va izohlar:</b>\n");
                    for (String note : customNotes) {
                        sb.append("• ").append(escape(note)).append('\n');
                    }
                }
            }

            // Narx
            sb.append("\n💰 <b>Narx:</b> ");
            if (cake.getFinalPrice() != null) {
                sb.append(formatMoney(cake.getFinalPrice())).append(" so'm (Tasdiqlangan)\n");
            } else {
                sb.append("⏳ <b>Usta bilan kelishiladi</b> (Mijoz bilan telefon orqali)\n");
            }
        } else {
            // Oddiy buyurtma izohi
            if (order.getComment() != null && !order.getComment().isBlank()) {
                sb.append("💬 ").append(escape(order.getComment())).append('\n');
            }

            // Mahsulotlar ro'yxati (juda ko'p bo'lsa, birinchi qismi va qolganlari soni)
            sb.append("\n🛒 <b>Mahsulotlar:</b>\n");
            List<OrderItem> items = order.getItems();
            for (int i = 0; i < items.size() && i < MAX_ITEM_LINES; i++) {
                OrderItem item = items.get(i);
                sb.append("• ").append(escape(shorten(item.getProductNameUz())))
                        .append(" × ").append(item.getQuantity().stripTrailingZeros().toPlainString())
                        .append(' ').append(item.getUnitType().label(false))
                        .append(" = ").append(formatMoney(item.getLineTotal())).append('\n');
            }
            if (items.size() > MAX_ITEM_LINES) {
                sb.append("... va yana ").append(items.size() - MAX_ITEM_LINES).append(" ta mahsulot\n");
            }

            // Summalar
            sb.append("\n💰 Mahsulotlar: ").append(formatMoney(order.getItemsTotal())).append(" so'm\n");
            if (order.getDiscountAmount() != null && order.getDiscountAmount() > 0) {
                sb.append("🏷 Promo kod ").append(escape(order.getPromoCode()))
                        .append(": -").append(formatMoney(order.getDiscountAmount())).append(" so'm\n");
            }
            if (order.getOrderType() == OrderType.DELIVERY) {
                sb.append("🚚 Yetkazish: ").append(formatMoney(order.getDeliveryFee())).append(" so'm\n");
            }
            sb.append("<b>Jami: ").append(formatMoney(order.getTotalAmount())).append(" so'm</b>\n");
        }

        if (order.getEstimatedReadyAt() != null) {
            sb.append("⏱ <b>Taxminiy tayyor:</b> ").append(order.getEstimatedReadyAt().format(TIME_FORMAT)).append('\n');
        }
        return sb.toString();
    }

    /**
     * Buyurtma xabarini hozirgi holati ko'rsatilgan holda qayta tayyorlaydi
     * (tugma bosilgandan keyin xabarni yangilash uchun).
     *
     * @param orderId buyurtmaning raqami
     * @return tayyor HTML matn (oxirida "Holat: ..." qatori bilan)
     */
    @Transactional(readOnly = true)
    public String buildOrderMessageWithStatus(Long orderId) {
        CustomerOrder order = findOrder(orderId);
        StringBuilder sb = new StringBuilder(buildNewOrderMessage(orderId));
        sb.append("\n📌 <b>Holat: ").append(statusLabel(order.getStatus())).append("</b>");
        // Bekor qilingan bo'lsa, sababini ham ko'rsatamiz
        if (order.getStatus() == OrderStatus.CANCELLED && order.getCancelReason() != null) {
            sb.append("\nSabab: ").append(escape(order.getCancelReason()));
        }
        return sb.toString();
    }

    /**
     * Sayt admin panelidan holat o'zgartirilganda Telegram chatiga boradigan xabar.
     *
     * @param event holat o'zgargani hodisasi
     * @return tayyor HTML matn
     */
    @Transactional(readOnly = true)
    public String buildStatusChangeNotification(OrderStatusChangedEvent event) {
        CustomerOrder order = findOrder(event.orderId());
        StringBuilder sb = new StringBuilder();
        sb.append("🔄 <b>Buyurtma holati yangilandi: ")
                .append(escape(order.getOrderNumber())).append("</b>\n\n");
        appendCustomerContact(sb, order);
        sb.append("📌 Yangi holat: <b>").append(statusLabel(event.newStatus())).append("</b>\n");
        if (event.changedBy() != null && !event.changedBy().isBlank()) {
            sb.append("👤 O‘zgartirdi: <code>").append(escape(event.changedBy())).append("</code>\n");
        }
        return sb.toString();
    }

    /**
     * Yordamchi metod: holatning o'zbekcha nomi.
     *
     * @param status buyurtma holati
     * @return o'zbekcha nom
     */
    public String statusLabel(OrderStatus status) {
        return switch (status) {
            case NEW -> "🆕 Yangi";
            case PRICE_PENDING -> "⏳ Kutilmoqda (Narx kelishiladi)";
            case CONFIRMED -> "✅ Qabul qilindi";
            case PREPARING -> "👨‍🍳 Tayyorlanmoqda";
            case READY -> "🎂 Tayyor bo‘ldi";
            case DELIVERING -> "🚚 Yetkazilmoqda (Yo‘lda)";
            case COMPLETED -> "🎉 Topshirildi (Yetkazildi)";
            case CANCELLED -> "❌ Bekor qilindi";
        };
    }

    /**
     * Mijoz buyurtmani o'zi bekor qilgani haqidagi xabar matnini tayyorlaydi.
     *
     * @param orderId buyurtmaning raqami
     * @return tayyor HTML matn
     */
    @Transactional(readOnly = true)
    public String buildCustomerCancelMessage(Long orderId) {
        CustomerOrder order = findOrder(orderId);
        StringBuilder sb = new StringBuilder();
        sb.append("❌ <b>Mijoz buyurtmani bekor qildi: ").append(escape(order.getOrderNumber())).append("</b>\n\n");
        appendCustomerContact(sb, order);
        sb.append("💰 ").append(formatMoney(order.getTotalAmount())).append(" so'm\n");
        if (order.getCancelReason() != null) {
            sb.append("Sabab: ").append(escape(order.getCancelReason())).append('\n');
        }
        return sb.toString();
    }

    /**
     * Anonim sovg'ada xaridor ismi va telefoni yozilmaydi. Qolgan buyurtmalarda xaridor ko'rsatiladi.
     */
    void appendCustomerContact(StringBuilder sb, CustomerOrder order) {
        if (Boolean.TRUE.equals(order.getIsAnonymousGift())) {
            sb.append("🎁 <b>Anonim sovg'a</b>\n");
            sb.append("👤 <b>Qabul qiluvchi:</b> ").append(escape(order.getRecipientName())).append('\n');
            sb.append("📞 <b>Telefon:</b> ").append(escape(order.getRecipientPhone())).append('\n');
            return;
        }
        sb.append("👤 <b>Mijoz:</b> ").append(escape(order.getCustomerName())).append('\n');
        sb.append("📞 <b>Telefon:</b> ").append(escape(order.getCustomerPhone())).append('\n');
    }

    private CustomerOrder findOrder(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyurtma", orderId));
    }

    /**
     * Yordamchi metod: matndagi maxsus belgilarni (& < >) tozalaydi. Telegram HTML rejimida bu belgilar
     * xabarni buzishi mumkin.
     *
     * @param text mijoz kiritgan yoki bazadan olingan matn
     * @return xavfsiz matn
     */
    private String escape(String text) {
        if (text == null) {
            return "";
        }
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    private String shorten(String text) {
        if (text.length() <= MAX_NAME_LENGTH) {
            return text;
        }
        return text.substring(0, MAX_NAME_LENGTH) + "...";
    }

    private String formatMoney(long amount) {
        return String.format(Locale.US, "%,d", amount).replace(',', ' ');
    }
}
