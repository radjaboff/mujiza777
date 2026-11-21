package uz.akmal.mujiza.order.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;
import uz.akmal.mujiza.common.BaseEntity;
import uz.akmal.mujiza.order.enums.OrderStatus;
import uz.akmal.mujiza.order.enums.OrderType;
import uz.akmal.mujiza.order.enums.PaymentMethod;
import uz.akmal.mujiza.shop.entity.Branch;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Mijozning buyurtmasi. Bazadagi "orders" jadvaliga mos keladi.
 * (Nomi "Order" emas: bu so'z SQL va JPQL'da zaxiralangan, xatolarga olib kelishi mumkin.)
 * id, createdAt va updatedAt maydonlari BaseEntity'dan meros bo'lib keladi.
 */
@Entity
@Table(name = "orders")
@Getter
@Setter
public class CustomerOrder extends BaseEntity {

    /** Mijozga ko'rinadigan buyurtma raqami (masalan, "MJ-1001"). Takrorlanmaydi. */
    @Column(name = "order_number", nullable = false, length = 20)
    private String orderNumber;

    /** Buyurtmani kuzatish uchun taxmin qilib bo'lmaydigan tasodifiy kalit (UUID). Takrorlanmaydi. */
    @Column(name = "tracking_token", nullable = false, length = 36)
    private String trackingToken;

    /** Client-generated idempotency key: protects against retries and double submits. */
    @Column(name = "idempotency_key", length = 36, unique = true)
    private String idempotencyKey;

    /** Mijozning ismi. */
    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;

    /** Mijozning telefon raqami, +998901234567 ko'rinishida. */
    @Column(name = "customer_phone", nullable = false, length = 20)
    private String customerPhone;

    /** Buyurtma turi: olib ketish yoki yetkazib berish. */
    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", nullable = false, length = 20)
    private OrderType orderType;

    /** Olib ketish bo'lsa, qaysi filialdan. Yetkazib berishda null. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    /** Yetkazib berish manzili. Olib ketishda null. */
    @Column(name = "delivery_address", length = 300)
    private String deliveryAddress;

    /** Yetkazib berish joyining xaritadagi kengligi (ixtiyoriy). */
    @Column(name = "latitude")
    private Double latitude;

    /** Yetkazib berish joyining xaritadagi uzunligi (ixtiyoriy). */
    @Column(name = "longitude")
    private Double longitude;

    /** To'lov usuli. */
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    /** Mijozning izohi (ixtiyoriy). */
    @Column(name = "comment", length = 500)
    private String comment;

    /** Buyurtmaning hozirgi holati. */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private OrderStatus status;

    /** Mahsulotlarning umumiy summasi, so'mda. */
    @Column(name = "items_total", nullable = false)
    private Long itemsTotal;

    /** Yetkazib berish narxi, so'mda (olib ketishda 0). */
    @Column(name = "delivery_fee", nullable = false)
    private Long deliveryFee = 0L;

    /** Buyurtmaga qo'llangan promo kod (KATTA harflarda). Kod ishlatilmagan bo'lsa null. */
    @Column(name = "promo_code", length = 30)
    private String promoCode;

    /** Promo kod bergan chegirma, so'mda (mahsulotlar summasidan ayriladi). Kod bo'lmasa 0. */
    @Column(name = "discount_amount", nullable = false)
    private Long discountAmount = 0L;

    /** Bu tort buyurtmasimi (tafsilotlari cake_requests jadvalida). Standart false. */
    @Column(name = "is_cake_order", nullable = false)
    private Boolean isCakeOrder = false;

    /** Mijoz tanlagan sana (vaqt oynasi tanlangan bo'lsa). */
    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;

    /** Tanlangan vaqt oynasining raqami (oyna band joyni sanash uchun). */
    @Column(name = "slot_id")
    private Long slotId;

    /** Tanlangan oynaning boshlanish soati (buyurtma paytidagi nusxa). */
    @Column(name = "slot_start")
    private LocalTime slotStart;

    /** Tanlangan oynaning tugash soati (buyurtma paytidagi nusxa). */
    @Column(name = "slot_end")
    private LocalTime slotEnd;

    /** Buyurtma sovg'ami. Standart false. */
    @Column(name = "is_gift", nullable = false)
    private Boolean isGift = false;

    /** Anonim sovg'a: qabul qiluvchiga xaridor nomi aytilmaydi. Standart false. */
    @Column(name = "is_anonymous_gift", nullable = false)
    private Boolean isAnonymousGift = false;

    /** Sovg'a qabul qiluvchining ismi. */
    @Column(name = "recipient_name", length = 100)
    private String recipientName;

    /** Sovg'a qabul qiluvchining telefoni. */
    @Column(name = "recipient_phone", length = 20)
    private String recipientPhone;

    /** Tabrik matni. */
    @Column(name = "gift_message", length = 300)
    private String giftMessage;

    /** Mijoz to'laydigan jami summa: mahsulotlar minus chegirma plyus yetkazib berish. */
    @Column(name = "total_amount", nullable = false)
    private Long totalAmount;

    /** Olib ketishda do'konda ko'rsatiladigan 4 xonali kod. Yetkazib berishda null. */
    @Column(name = "pickup_code", length = 4)
    private String pickupCode;

    /** Taxminiy tayyor bo'lish vaqti. */
    @Column(name = "estimated_ready_at")
    private LocalDateTime estimatedReadyAt;

    /** Bekor qilingan bo'lsa, sababi. */
    @Column(name = "cancel_reason", length = 300)
    private String cancelReason;

    /**
     * Buyurtmadagi mahsulotlar (qo'yilish tartibida).
     * cascade ALL: buyurtma saqlansa, mahsulot qatorlari ham saqlanadi.
     */
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 50)
    @OrderBy("id ASC")
    private List<OrderItem> items = new ArrayList<>();

    /**
     * Holatlar tarixi (qachon qaysi holatga o'tgani), vaqt tartibida.
     */
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 50)
    @OrderBy("id ASC")
    private List<OrderStatusHistory> history = new ArrayList<>();

    /**
     * Buyurtmaga mahsulot qatorini qo'shadi va qator qaysi buyurtmaga tegishli ekanini ham o'zi belgilaydi.
     *
     * @param item qo'shiladigan qator
     */
    public void addItem(OrderItem item) {
        item.setOrder(this);
        this.items.add(item);
    }

    /**
     * Holatlar tarixiga yangi yozuv qo'shadi.
     *
     * @param status    qaysi holatga o'tgani
     * @param changedBy kim o'zgartirgani (admin logini, "customer" yoki "system")
     * @param note      izoh (ixtiyoriy, bo'lmasa null)
     */
    public void addHistory(OrderStatus status, String changedBy, String note) {
        OrderStatusHistory entry = new OrderStatusHistory();
        entry.setOrder(this);
        entry.setStatus(status);
        entry.setChangedBy(changedBy);
        entry.setNote(note);
        this.history.add(entry);
    }
}
