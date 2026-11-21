package uz.akmal.mujiza.cake.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;
import uz.akmal.mujiza.common.BaseEntity;

import java.math.BigDecimal;

/**
 * Tort turi (yumaloq, to'rtburchak, yurak va h.k.). Bazadagi "cake_types" jadvaliga mos keladi.
 */
@Entity
@Table(name = "cake_types")
@SQLRestriction("is_deleted = false")
@Getter
@Setter
public class CakeType extends BaseEntity {

    /** Nomi o'zbek tilida. */
    @Column(name = "name_uz", nullable = false, length = 150)
    private String nameUz;

    /** Nomi rus tilida. */
    @Column(name = "name_ru", nullable = false, length = 150)
    private String nameRu;

    /** Rasm manzili (ixtiyoriy). */
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    /** 1 kg uchun asosiy narx, so'mda. */
    @Column(name = "base_price_per_kg", nullable = false)
    private Long basePricePerKg;

    /** Eng kam vazn, kg da. */
    @Column(name = "min_weight_kg", nullable = false, precision = 6, scale = 2)
    private BigDecimal minWeightKg;

    /** Eng ko'p vazn, kg da. */
    @Column(name = "max_weight_kg", nullable = false, precision = 6, scale = 2)
    private BigDecimal maxWeightKg;

    /** Vazn qadami, kg da (masalan, 0.5: 1, 1.5, 2...). */
    @Column(name = "weight_step", nullable = false, precision = 6, scale = 2)
    private BigDecimal weightStep;

    /** 1 kg tortdan taxminan nechta kishiga porsiya chiqadi (ixtiyoriy). */
    @Column(name = "servings_per_kg")
    private Integer servingsPerKg;

    /** Ko'rsatish tartibi (kichik raqam birinchi). */
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    /** Mijozlarga ko'rinadimi. Standart true. */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    /** O'chirilganmi (soft delete). Standart false. */
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;
}