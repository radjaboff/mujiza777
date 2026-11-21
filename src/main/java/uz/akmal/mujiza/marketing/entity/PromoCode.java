package uz.akmal.mujiza.marketing.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import uz.akmal.mujiza.common.BaseEntity;
import uz.akmal.mujiza.marketing.enums.DiscountType;

import java.time.LocalDateTime;

/**
 * Promo kod (chegirma kodi). Bazadagi "promo_codes" jadvaliga mos keladi.
 * id, createdAt va updatedAt maydonlari BaseEntity'dan meros bo'lib keladi.
 */
@Entity
@Table(name = "promo_codes")
@Getter
@Setter
public class PromoCode extends BaseEntity {

    /** Kodning o'zi, doim KATTA harflarda saqlanadi (masalan, NAVROZ10). O'chirilmaganlar orasida takrorlanmaydi. */
    @Column(name = "code", nullable = false, length = 30)
    private String code;

    /** Admin uchun izoh (mijozga ko'rinmaydi). */
    @Column(name = "description", length = 200)
    private String description;

    /** Chegirma turi: foiz yoki aniq summa. */
    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 10)
    private DiscountType discountType;

    /** Chegirma qiymati: foizli kodda foiz (1-100), aniq summali kodda so'm. */
    @Column(name = "discount_value", nullable = false)
    private Long discountValue;

    /** Foizli kod uchun eng ko'p chegirma summasi, so'mda. Bo'sh bo'lsa, chegara yo'q. */
    @Column(name = "max_discount_amount")
    private Long maxDiscountAmount;

    /** Kod ishlashi uchun mahsulotlarning minimal summasi, so'mda. 0 bo'lsa, cheklov yo'q. */
    @Column(name = "min_order_amount", nullable = false)
    private Long minOrderAmount = 0L;

    /** Kodni eng ko'pi bilan necha marta ishlatish mumkin. Bo'sh bo'lsa, cheksiz. */
    @Column(name = "max_uses")
    private Integer maxUses;

    /** Hozirgacha necha marta ishlatilgani. */
    @Column(name = "used_count", nullable = false)
    private Integer usedCount = 0;

    /** Faqat birinchi buyurtma uchunmi. Standart false. */
    @Column(name = "first_order_only", nullable = false)
    private Boolean firstOrderOnly = false;

    /** Amal qilish boshlanadigan vaqt. Bo'sh bo'lsa, darrov. */
    @Column(name = "valid_from")
    private LocalDateTime validFrom;

    /** Amal qilish tugaydigan vaqt. Bo'sh bo'lsa, cheksiz. */
    @Column(name = "valid_to")
    private LocalDateTime validTo;

    /** Qo'lda yoqilganmi. Standart true. */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    /** O'chirilganmi (soft delete). Standart false. */
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;
}