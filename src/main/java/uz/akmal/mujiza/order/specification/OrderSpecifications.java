package uz.akmal.mujiza.order.specification;

import org.springframework.data.jpa.domain.Specification;
import uz.akmal.mujiza.order.dto.OrderFilter;
import uz.akmal.mujiza.order.entity.CustomerOrder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Admin buyurtmalar ro'yxatini qidirish shartlari to'plami.
 * Har bir metod bitta kichik shartni qaytaradi, asosiy metod esa kerakli shartlarni bir-biriga ulaydi.
 * Faqat statik metodlar bor, shuning uchun obyekt yaratilmaydi.
 */
public final class OrderSpecifications {

    /**
     * Obyekt yaratishni taqiqlaydi (private konstruktor), klass faqat statik ishlatiladi.
     */
    private OrderSpecifications() {
    }

    /**
     * Filtrdagi berilgan shartlarni birlashtiradi. Berilmagan (null) shartlar o'tkazib yuboriladi.
     *
     * @param filter admin yuborgan filtr shartlari (null bo'lishi mumkin)
     * @return birlashtirilgan shart
     */
    public static Specification<CustomerOrder> from(OrderFilter filter) {
        List<Specification<CustomerOrder>> specs = new ArrayList<>();
        if (filter != null) {
            if (filter.status() != null) {
                specs.add(statusEquals(filter));
            }
            if (filter.orderType() != null) {
                specs.add(typeEquals(filter));
            }
            if (filter.search() != null && !filter.search().isBlank()) {
                specs.add(searchContains(filter.search()));
            }
            if (filter.dateFrom() != null) {
                specs.add(createdFrom(filter.dateFrom()));
            }
            if (filter.dateTo() != null) {
                specs.add(createdUntil(filter.dateTo()));
            }
        }
        return Specification.allOf(specs);
    }

    /**
     * Shart: buyurtma berilgan holatda.
     *
     * @param filter filtr (holat shu yerdan olinadi)
     */
    private static Specification<CustomerOrder> statusEquals(OrderFilter filter) {
        return (root, query, cb) -> cb.equal(root.get("status"), filter.status());
    }

    /**
     * Shart: buyurtma berilgan turda (olib ketish yoki yetkazib berish).
     *
     * @param filter filtr (tur shu yerdan olinadi)
     */
    private static Specification<CustomerOrder> typeEquals(OrderFilter filter) {
        return (root, query, cb) -> cb.equal(root.get("orderType"), filter.orderType());
    }

    /**
     * Shart: buyurtma raqami, mijoz ismi yoki telefon raqamining ichida qidiruv matni bor
     * (katta-kichik harfga qaramaydi).
     *
     * @param text qidiruv matni
     */
    private static Specification<CustomerOrder> searchContains(String text) {
        // LIKE'ning maxsus belgilarini (% _ \) oddiy belgiga aylantiramiz, shunda "%" yozib hamma narsani topib bo'lmaydi
        String escaped = text.trim().toLowerCase()
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
        String pattern = "%" + escaped + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("orderNumber")), pattern, '\\'),
                cb.like(cb.lower(root.get("customerName")), pattern, '\\'),
                cb.like(root.get("customerPhone"), pattern, '\\'),
                cb.equal(root.get("pickupCode"), text.trim())
        );
    }

    /**
     * Shart: buyurtma berilgan sanadan (shu kun ham kiradi, kun boshidan) keyin yaratilgan.
     *
     * @param date boshlang'ich sana
     */
    private static Specification<CustomerOrder> createdFrom(LocalDate date) {
        return (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.<LocalDateTime>get("createdAt"), date.atStartOfDay());
    }

    /**
     * Shart: buyurtma berilgan sanagacha (shu kun ham kiradi, ya'ni keyingi kun boshigacha) yaratilgan.
     *
     * @param date oxirgi sana
     */
    private static Specification<CustomerOrder> createdUntil(LocalDate date) {
        return (root, query, cb) ->
                cb.lessThan(root.<LocalDateTime>get("createdAt"), date.plusDays(1).atStartOfDay());
    }
}