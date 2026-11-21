package uz.akmal.mujiza.order.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import uz.akmal.mujiza.common.BaseEntity;
import uz.akmal.mujiza.order.enums.OrderStatus;

/**
 * Buyurtma holatining o'zgarish yozuvi. Bazadagi "order_status_history" jadvaliga mos keladi.
 * Yozuv yaratilgan vaqt (createdAt) holat o'zgargan vaqt hisoblanadi.
 */
@Entity
@Table(name = "order_status_history")
@Getter
@Setter
public class OrderStatusHistory extends BaseEntity {

    /** Qaysi buyurtmaga tegishli. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private CustomerOrder order;

    /** Qaysi holatga o'tgani. */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private OrderStatus status;

    /** Kim o'zgartirgani: admin logini, "customer" (mijoz) yoki "system" (tizim). */
    @Column(name = "changed_by", nullable = false, length = 50)
    private String changedBy;

    /** Izoh (masalan, bekor qilish sababi). Yo'q bo'lsa null. */
    @Column(name = "note", length = 300)
    private String note;
}