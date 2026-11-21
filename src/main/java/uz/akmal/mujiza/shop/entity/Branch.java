package uz.akmal.mujiza.shop.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;
import uz.akmal.mujiza.common.BaseEntity;

/**
 * Do'kon filiali (bitta manzildagi savdo nuqtasi).
 * Bazadagi "branches" jadvaliga mos keladi.
 * id, createdAt va updatedAt maydonlari BaseEntity'dan meros bo'lib keladi.
 */
@Entity
@Table(name = "branches")
@SQLRestriction("is_deleted = false")
@Getter
@Setter
public class Branch extends BaseEntity {

    /** Filial nomi o'zbek tilida. */
    @Column(name = "name_uz", nullable = false, length = 150)
    private String nameUz;

    /** Filial nomi rus tilida. */
    @Column(name = "name_ru", nullable = false, length = 150)
    private String nameRu;

    /** Manzil o'zbek tilida. */
    @Column(name = "address_uz", nullable = false, length = 300)
    private String addressUz;

    /** Manzil rus tilida. */
    @Column(name = "address_ru", nullable = false, length = 300)
    private String addressRu;

    /** Telefon raqami, +998901234567 ko'rinishida. */
    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    /** Ish vaqti matn ko'rinishida (masalan, "09:00 - 22:00"). Kiritilmagan bo'lsa null. */
    @Column(name = "work_hours", length = 100)
    private String workHours;

    /** Xaritadagi kenglik (latitude). Kiritilmagan bo'lsa null. */
    @Column(name = "latitude")
    private Double latitude;

    /** Xaritadagi uzunlik (longitude). Kiritilmagan bo'lsa null. */
    @Column(name = "longitude")
    private Double longitude;

    /** Filial rasmining manzili. Kiritilmagan bo'lsa null. */
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    /** Shu filialdan buyurtmani olib ketish mumkinmi. Standart true. */
    @Column(name = "is_pickup_available", nullable = false)
    private Boolean isPickupAvailable = true;

    /** Mijozlarga ko'rinadimi (false bo'lsa yashiriladi, lekin o'chmaydi). Standart true. */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    /** Saytda ko'rsatish tartibi: kichik raqam birinchi chiqadi. Standart 0. */
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    /**
     * O'chirilganmi (soft delete). true bo'lsa yozuv bazada qoladi, lekin hech qayerda ko'rsatilmaydi,
     * shunda eski buyurtmalar buzilmaydi. Standart false.
     */
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;
}