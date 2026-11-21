package uz.akmal.mujiza.cake.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import uz.akmal.mujiza.cake.enums.CakeOptionKind;
import uz.akmal.mujiza.cake.enums.CakePriceType;
import uz.akmal.mujiza.common.BaseEntity;

/**
 * Tort varianti (qatlam ta'mi, krem, bezak yoki qo'shimcha xizmat). Bazadagi "cake_options" jadvaliga mos keladi.
 */
@Entity
@Table(name = "cake_options")
@Getter
@Setter
public class CakeOption extends BaseEntity {

    /** Variant guruhi. */
    @Enumerated(EnumType.STRING)
    @Column(name = "kind", nullable = false, length = 10)
    private CakeOptionKind kind;

    /** Nomi o'zbek tilida. */
    @Column(name = "name_uz", nullable = false, length = 150)
    private String nameUz;

    /** Nomi rus tilida. */
    @Column(name = "name_ru", nullable = false, length = 150)
    private String nameRu;

    /** Rasm manzili (ixtiyoriy). */
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    /** Narx turi: har 1 kg uchun yoki aniq summa. */
    @Enumerated(EnumType.STRING)
    @Column(name = "price_type", nullable = false, length = 10)
    private CakePriceType priceType;

    /** Qo'shimcha narx, so'mda (0 bo'lsa, bepul variant). */
    @Column(name = "price_value", nullable = false)
    private Long priceValue = 0L;

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