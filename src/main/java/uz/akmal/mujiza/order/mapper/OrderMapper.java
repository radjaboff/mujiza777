package uz.akmal.mujiza.order.mapper;

import org.springframework.stereotype.Component;
import uz.akmal.mujiza.cake.dto.CakeOrderDetailsResponse;
import uz.akmal.mujiza.order.dto.OrderHistoryResponse;
import uz.akmal.mujiza.order.dto.OrderItemResponse;
import uz.akmal.mujiza.order.dto.OrderListItemResponse;
import uz.akmal.mujiza.order.dto.OrderResponse;
import uz.akmal.mujiza.order.dto.PublicOrderResponse;
import uz.akmal.mujiza.order.dto.PublicOrderTimelineEntry;
import uz.akmal.mujiza.order.entity.CustomerOrder;
import uz.akmal.mujiza.order.entity.OrderItem;
import uz.akmal.mujiza.shop.entity.Branch;

import java.util.List;

/**
 * Buyurtma entity'sini DTO'larga aylantiradi.
 *
 * Eslatma: bu klass lazy (kerak bo'lganda yuklanadigan) maydonlarni o'qiydi (filial, mahsulotlar, tarix),
 * shuning uchun faqat Service'ning @Transactional metodlari ichida chaqirilishi kerak.
 */
@Component
public class OrderMapper {

    /**
     * Buyurtmadan mijoz uchun javob yasaydi (nomlar so'ralgan tilda, telefon raqamisiz).
     *
     * @param order bazadan olingan buyurtma
     * @param lang  til kodi: "ru" bo'lsa ruscha, boshqa hamma holatda o'zbekcha
     * @return mijozga qaytariladigan DTO
     */
    public PublicOrderResponse toPublicResponse(CustomerOrder order, String lang, CakeOrderDetailsResponse cake) {
        boolean ru = "ru".equalsIgnoreCase(lang);
        // Olib ketish filiali (yetkazishda yo'q)
        Branch branch = order.getBranch();
        return new PublicOrderResponse(
                order.getOrderNumber(),
                order.getTrackingToken(),
                order.getStatus(),
                order.getOrderType(),
                order.getCustomerName(),
                branch == null ? null : (ru ? branch.getNameRu() : branch.getNameUz()),
                branch == null ? null : (ru ? branch.getAddressRu() : branch.getAddressUz()),
                order.getDeliveryAddress(),
                order.getPaymentMethod(),
                order.getComment(),
                itemResponses(order, ru),
                order.getItemsTotal(),
                order.getDeliveryFee(),
                order.getTotalAmount(),
                order.getPickupCode(),
                order.getEstimatedReadyAt(),
                order.getCancelReason(),
                // Faqat holat va vaqt: kim o'zgartirgani mijozga ko'rsatilmaydi
                order.getHistory().stream()
                        .map(entry -> new PublicOrderTimelineEntry(entry.getStatus(), entry.getCreatedAt()))
                        .toList(),
                order.getCreatedAt(),
                order.getPromoCode(),
                order.getDiscountAmount()                ,
                order.getScheduledDate(),
                order.getSlotStart(),
                order.getSlotEnd(),
                order.getIsGift(),
                order.getIsAnonymousGift(),
                order.getRecipientName(),
                order.getGiftMessage(),
                cake
        );
    }

    /**
     * Buyurtmadan admin panel uchun to'liq javob yasaydi (o'zbekcha nomlar, telefon, tarix bilan).
     *
     * @param order bazadan olingan buyurtma
     * @return admin panelga qaytariladigan DTO
     */
    public OrderResponse toResponse(CustomerOrder order, CakeOrderDetailsResponse cake) {
        Branch branch = order.getBranch();
        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getTrackingToken(),
                order.getStatus(),
                order.getOrderType(),
                order.getCustomerName(),
                order.getCustomerPhone(),
                branch == null ? null : branch.getId(),
                branch == null ? null : branch.getNameUz(),
                order.getDeliveryAddress(),
                order.getLatitude(),
                order.getLongitude(),
                order.getPaymentMethod(),
                order.getComment(),
                itemResponses(order, false),
                order.getItemsTotal(),
                order.getDeliveryFee(),
                order.getTotalAmount(),
                order.getPickupCode(),
                order.getEstimatedReadyAt(),
                order.getCancelReason(),
                order.getHistory().stream()
                        .map(entry -> new OrderHistoryResponse(
                                entry.getStatus(), entry.getChangedBy(), entry.getNote(), entry.getCreatedAt()))
                        .toList(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                order.getPromoCode(),
                order.getDiscountAmount()                ,
                order.getScheduledDate(),
                order.getSlotStart(),
                order.getSlotEnd(),
                order.getIsGift(),
                order.getIsAnonymousGift(),
                order.getRecipientName(),
                order.getRecipientPhone(),
                order.getGiftMessage(),
                cake
        );
    }

    /**
     * Buyurtmadan admin ro'yxati uchun qisqa qator yasaydi.
     *
     * @param order bazadan olingan buyurtma
     * @return ro'yxatdagi qator uchun DTO
     */
    public OrderListItemResponse toListItem(CustomerOrder order, int itemsCount) {
        return new OrderListItemResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getStatus(),
                order.getOrderType(),
                order.getCustomerName(),
                order.getCustomerPhone(),
                order.getPaymentMethod(),
                order.getTotalAmount(),
                itemsCount,
                order.getCreatedAt(),
                order.getScheduledDate(),
                order.getSlotStart(),
                order.getSlotEnd(),
                order.getIsGift(),
                order.getIsCakeOrder()
        );
    }

    /**
     * Yordamchi metod: buyurtmadagi mahsulot qatorlarini javob ko'rinishiga aylantiradi.
     *
     * @param order buyurtma
     * @param ru    true bo'lsa ruscha nom, aks holda o'zbekcha
     * @return mahsulot qatorlari ro'yxati
     */
    private List<OrderItemResponse> itemResponses(CustomerOrder order, boolean ru) {
        return order.getItems().stream().map(item -> toItemResponse(item, ru)).toList();
    }

    /**
     * Yordamchi metod: bitta mahsulot qatorini javob ko'rinishiga aylantiradi.
     *
     * @param item mahsulot qatori
     * @param ru   true bo'lsa ruscha nom, aks holda o'zbekcha
     * @return qator uchun DTO
     */
    private OrderItemResponse toItemResponse(OrderItem item, boolean ru) {
        return new OrderItemResponse(
                item.getProductId(),
                ru ? item.getProductNameRu() : item.getProductNameUz(),
                item.getQuantity(),
                item.getUnitType(),
                item.getUnitPrice(),
                item.getLineTotal()
        );
    }
}