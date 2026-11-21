package uz.akmal.mujiza.order.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import uz.akmal.mujiza.order.entity.OrderItem;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * OrderItem jadvali bilan ishlaydigan qatlam (hozircha faqat tavsiyalar uchun).
 */
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    /**
     * Berilgan mahsulot bilan bir buyurtmada eng ko'p birga olingan mahsulotlar raqamlarini topadi
     * (bekor qilingan buyurtmalar hisobga olinmaydi), eng ko'p uchraganidan boshlab.
     *
     * @param productId asosiy mahsulotning raqami
     * @param since     shu vaqtdan keyingi buyurtmalar hisobga olinadi
     * @param limit     eng ko'p nechta mahsulot qaytarilishi
     * @return birga olingan mahsulotlar raqamlari (mashhurlik tartibida)
     */
    @Query(value = """
            SELECT oi2.product_id
            FROM order_items oi1
            JOIN order_items oi2 ON oi2.order_id = oi1.order_id AND oi2.product_id <> oi1.product_id
            JOIN orders o ON o.id = oi1.order_id
            WHERE oi1.product_id = :productId
              AND o.status <> 'CANCELLED'
              AND o.created_at >= :since
            GROUP BY oi2.product_id
            ORDER BY COUNT(DISTINCT oi2.order_id) DESC, oi2.product_id
            LIMIT :limit
            """, nativeQuery = true)
    List<Long> findFrequentlyBoughtTogether(@Param("productId") Long productId,
                                            @Param("since") LocalDateTime since,
                                            @Param("limit") int limit);

    /**
     * Buyurtma ro'yxati uchun har bir buyurtmadagi qatorlar soni. Mahsulotlar yuklanmaydi.
     *
     * @param orderIds buyurtma raqamlari
     * @return buyurtma va uning qatorlar soni
     */
    @Query("select i.order.id as orderId, count(i.id) as itemCount from OrderItem i " +
            "where i.order.id in :orderIds group by i.order.id")
    List<OrderItemCount> countItemsByOrderIds(@Param("orderIds") Collection<Long> orderIds);

    interface OrderItemCount {
        Long getOrderId();

        Long getItemCount();
    }
}