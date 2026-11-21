package uz.akmal.mujiza.catalog.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.SQLRestriction;
import uz.akmal.mujiza.common.BaseEntity;

/**
 * Mahsulotlar kategoriyasi (masalan: Tortlar, Konfetlar, Pishiriqlar).
 * Bazadagi "categories" jadvaliga mos keladi.
 * id, createdAt va updatedAt maydonlari BaseEntity'dan meros bo'lib keladi.
 *
 * @Entity: bu klass bazadagi jadvalga bog'langan ekanini bildiradi.
 * @Table: aynan qaysi jadvalga bog'langanini ko'rsatadi.
 * @Getter, @Setter (Lombok): har bir maydon uchun get/set metodlarini avtomatik yaratadi.
 */
@Entity
@Table(name = "categories")
@SQLRestriction("is_deleted = false")
@BatchSize(size = 50)
@Getter
@Setter
public class Category extends BaseEntity {

    /**
     * Kategoriya nomi o'zbek tilida (masalan, "Tortlar").
     * Bazadagi ustun: name_uz, bo'sh bo'lishi mumkin emas.
     */
    @Column(name = "name_uz", nullable = false, length = 150)
    private String nameUz;

    /**
     * Kategoriya nomi rus tilida (masalan, "Торты").
     * Bazadagi ustun: name_ru, bo'sh bo'lishi mumkin emas.
     */
    @Column(name = "name_ru", nullable = false, length = 150)
    private String nameRu;

    /**
     * Sayt manzilida ko'rinadigan qisqa nom (masalan, "tortlar" -> /katalog/tortlar).
     * Google uchun ham foydali. O'chirilmagan kategoriyalar orasida takrorlanmaydi.
     */
    @Column(name = "slug", nullable = false, length = 180)
    private String slug;

    /**
     * Kategoriya rasmining manzili. Rasm hali yuklanmagan bo'lsa null bo'ladi.
     */
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    /**
     * Saytda ko'rsatish tartibi: kichik raqam birinchi chiqadi.
     * Standart qiymati 0.
     */
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    /**
     * Mijozlarga ko'rinadimi. false bo'lsa kategoriya sayтdan yashiriladi (lekin o'chmaydi).
     * Standart qiymati true.
     */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    /**
     * O'chirilganmi (soft delete). true bo'lsa yozuv bazada qoladi,
     * lekin hech qayerda ko'rsatilmaydi. Shunda eski buyurtmalar buzilmaydi.
     * Standart qiymati false.
     */
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;
}