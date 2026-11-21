package uz.akmal.mujiza.cake.entity;

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
import uz.akmal.mujiza.cake.enums.CakeOptionKind;
import uz.akmal.mujiza.cake.enums.CakePriceType;
import uz.akmal.mujiza.common.BaseEntity;

/**
 * Tort buyurtmasida tanlangan variant (nom va narx buyurtma paytidagi nusxa: keyin katalog o'zgarsa ham
 * eski buyurtma o'zgarmaydi). Bazadagi "cake_request_options" jadvaliga mos keladi.
 */
@Entity
@Table(name = "cake_request_options")
@Getter
@Setter
public class CakeRequestOption extends BaseEntity {

    /** Qaysi tort buyurtmasiga tegishli. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cake_request_id", nullable = false)
    private CakeRequest cakeRequest;

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

    /** Narx turi (har 1 kg uchun yoki aniq summa). */
    @Enumerated(EnumType.STRING)
    @Column(name = "price_type", nullable = false, length = 10)
    private CakePriceType priceType;

    /** Variantning birlik narxi, so'mda. */
    @Column(name = "price_value", nullable = false)
    private Long priceValue;

    /** Shu variantning shu tortdagi summasi, so'mda (vaznga qarab hisoblangan). */
    @Column(name = "amount", nullable = false)
    private Long amount;
}