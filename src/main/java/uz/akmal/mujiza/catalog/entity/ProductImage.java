package uz.akmal.mujiza.catalog.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import uz.akmal.mujiza.common.BaseEntity;

/**
 * Mahsulotning qo'shimcha rasmi (galereya uchun).
 * Asosiy rasm Product'ning o'zida (imageUrl), qolgan rasmlar shu yerda saqlanadi.
 * Bazadagi "product_images" jadvaliga mos keladi.
 */
@Entity
@Table(name = "product_images")
@Getter
@Setter
public class ProductImage extends BaseEntity {

    /**
     * Bu rasm qaysi mahsulotga tegishli.
     * LAZY: mahsulot kerak bo'lgandagina bazadan yuklanadi (tezroq ishlaydi).
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /**
     * Rasm manzili (fayl yuklangach shu yerga yoziladi).
     */
    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    /**
     * Galereyada ko'rsatish tartibi: kichik raqam birinchi chiqadi.
     */
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;
}