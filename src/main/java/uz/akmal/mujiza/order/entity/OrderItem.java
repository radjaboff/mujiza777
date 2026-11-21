package uz.akmal.mujiza.order.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import uz.akmal.mujiza.catalog.entity.Product;
import uz.akmal.mujiza.catalog.enums.UnitType;
import uz.akmal.mujiza.common.BaseEntity;

import java.math.BigDecimal;

/**
 * Buyurtmadagi bitta mahsulot qatori. Bazadagi "order_items" jadvaliga mos keladi.
 * Nom va narx buyurtma paytida nusxalab saqlanadi, shuning uchun keyin mahsulot nomi yoki narxi
 * o'zgarsa ham eski buyurtma o'zgarmaydi.
 */
@Entity
@Table(name = "order_items")
@Getter
@Setter
public class OrderItem extends BaseEntity {

    /** Bu qator qaysi buyurtmaga tegishli. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private CustomerOrder order;

    /** Qaysi mahsulot buyurtma qilingan. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /**
     * Mahsulot raqami, qatorning o'zidan. Javob yig'ishda Product entity yuklanmaydi.
     */
    @Column(name = "product_id", insertable = false, updatable = false)
    private Long productId;

    /** Mahsulot nomi o'zbek tilida (buyurtma paytidagi nusxa). */
    @Column(name = "product_name_uz", nullable = false, length = 200)
    private String productNameUz;

    /** Mahsulot nomi rus tilida (buyurtma paytidagi nusxa). */
    @Column(name = "product_name_ru", nullable = false, length = 200)
    private String productNameRu;

    /** Buyurtma miqdori: donalik mahsulotda soni, kg mahsulotda kilogramm (masalan, 1.500). */
    @Column(name = "quantity", nullable = false, precision = 10, scale = 3)
    private BigDecimal quantity;

    /** O'lchov birligi (buyurtma paytidagi nusxa): dona yoki kg. */
    @Enumerated(EnumType.STRING)
    @Column(name = "unit_type", nullable = false, length = 10)
    private UnitType unitType;

    /** Bitta mahsulotning buyurtma paytidagi narxi, so'mda. */
    @Column(name = "unit_price", nullable = false)
    private Long unitPrice;

    /** Shu qatorning summasi: narx * soni. */
    @Column(name = "line_total", nullable = false)
    private Long lineTotal;
}