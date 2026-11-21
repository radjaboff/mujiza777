package uz.akmal.mujiza.marketing.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;
import uz.akmal.mujiza.common.BaseEntity;

import java.time.LocalDateTime;

/**
 * Aksiya yoki yangilik (shu jumladan bosh sahifadagi banner).
 * Bazadagi "promotions" jadvaliga mos keladi.
 * id, createdAt va updatedAt maydonlari BaseEntity'dan meros bo'lib keladi.
 */
@Entity
@Table(name = "promotions")
@SQLRestriction("is_deleted = false")
@Getter
@Setter
public class Promotion extends BaseEntity {

    /** Sarlavha o'zbek tilida. */
    @Column(name = "title_uz", nullable = false, length = 200)
    private String titleUz;

    /** Sarlavha rus tilida. */
    @Column(name = "title_ru", nullable = false, length = 200)
    private String titleRu;

    /** Sayt manzilida ko'rinadigan qisqa nom (masalan, "navroz-aksiyasi"). O'chirilmaganlar orasida takrorlanmaydi. */
    @Column(name = "slug", nullable = false, length = 230)
    private String slug;

    /** Qisqa tavsif o'zbek tilida (kartochkada ko'rinadi). */
    @Column(name = "summary_uz", length = 300)
    private String summaryUz;

    /** Qisqa tavsif rus tilida. */
    @Column(name = "summary_ru", length = 300)
    private String summaryRu;

    /** To'liq matn o'zbek tilida (aksiya sahifasida ko'rinadi). */
    @Column(name = "description_uz", columnDefinition = "TEXT")
    private String descriptionUz;

    /** To'liq matn rus tilida. */
    @Column(name = "description_ru", columnDefinition = "TEXT")
    private String descriptionRu;

    /** Kompyuter uchun rasm manzili. */
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    /** Telefon uchun rasm manzili (bo'lmasa, kompyuter rasmi ishlatiladi). */
    @Column(name = "mobile_image_url", length = 500)
    private String mobileImageUrl;

    /** Bosilganda olib boradigan manzil (sayt ichidagi yo'l yoki to'liq havola). */
    @Column(name = "link_url", length = 500)
    private String linkUrl;

    /** Bosh sahifadagi bannerlarda ko'rsatilsinmi. Standart false. */
    @Column(name = "show_on_home", nullable = false)
    private Boolean showOnHome = false;

    /** Ko'rinish boshlanadigan vaqt. Bo'sh bo'lsa, darrov ko'rinadi. */
    @Column(name = "active_from")
    private LocalDateTime activeFrom;

    /** Ko'rinish tugaydigan vaqt. Bo'sh bo'lsa, cheksiz. */
    @Column(name = "active_to")
    private LocalDateTime activeTo;

    /** Ko'rsatish tartibi: kichik raqam birinchi chiqadi. Standart 0. */
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    /** Qo'lda yoqilganmi (false bo'lsa, vaqtidan qat'i nazar ko'rinmaydi). Standart true. */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    /** O'chirilganmi (soft delete). Standart false. */
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;
}