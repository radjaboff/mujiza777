package uz.akmal.mujiza.cake.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import uz.akmal.mujiza.common.BaseEntity;
import uz.akmal.mujiza.order.entity.CustomerOrder;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Tort buyurtmasining tafsilotlari (tur, vazn, variantlar, yozuv, narx).
 * Bazadagi "cake_requests" jadvaliga mos keladi. Har bir tort buyurtmasiga bitta qator.
 */
@Entity
@Table(name = "cake_requests")
@Getter
@Setter
public class CakeRequest extends BaseEntity {

    /** Qaysi buyurtmaga tegishli. */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private CustomerOrder order;

    /** Tanlangan tort turining raqami. */
    @Column(name = "cake_type_id")
    private Long cakeTypeId;

    /** Tort turi nomi o'zbek tilida (buyurtma paytidagi nusxa). */
    @Column(name = "type_name_uz", nullable = false, length = 150)
    private String typeNameUz;

    /** Tort turi nomi rus tilida (buyurtma paytidagi nusxa). */
    @Column(name = "type_name_ru", nullable = false, length = 150)
    private String typeNameRu;

    /** Vazn, kg da. */
    @Column(name = "weight_kg", nullable = false, precision = 6, scale = 2)
    private BigDecimal weightKg;

    /** Tortga yoziladigan yozuv. */
    @Column(name = "inscription", length = 100)
    private String inscription;

    /** Mijoz yuklagan namuna rasm manzili. */
    @Column(name = "reference_image_url", length = 500)
    private String referenceImageUrl;

    /** Server hisoblagan narx, so'mda. */
    @Column(name = "calculated_price", nullable = false)
    private Long calculatedPrice;

    /** Do'kon tasdiqlagan yakuniy narx. Tasdiqlangunga qadar null. */
    @Column(name = "final_price")
    private Long finalPrice;

    /** Narx haqida izoh (mijozga ham ko'rinadi). */
    @Column(name = "admin_note", length = 300)
    private String adminNote;

    /** Tanlangan variantlar (guruh va tartib bo'yicha). */
    @OneToMany(mappedBy = "cakeRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    @org.hibernate.annotations.BatchSize(size = 50)
    @OrderBy("id ASC")
    private List<CakeRequestOption> options = new ArrayList<>();

    /**
     * Tortga variant qo'shadi va variant qaysi tortga tegishli ekanini ham o'zi belgilaydi.
     *
     * @param option qo'shiladigan variant nusxasi
     */
    public void addOption(CakeRequestOption option) {
        option.setCakeRequest(this);
        this.options.add(option);
    }
}