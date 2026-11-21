package uz.akmal.mujiza.catalog.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.SQLRestriction;
import uz.akmal.mujiza.catalog.enums.Allergen;
import uz.akmal.mujiza.catalog.enums.DietTag;
import uz.akmal.mujiza.catalog.enums.UnitType;
import uz.akmal.mujiza.common.BaseEntity;
import uz.akmal.mujiza.common.ShopTime;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Mahsulot (tort, pishiriq, konfet va hokazo).
 * Bazadagi "products" jadvaliga mos keladi.
 * id, createdAt va updatedAt maydonlari BaseEntity'dan meros bo'lib keladi.
 */
@Entity
@Table(name = "products")
@SQLRestriction("is_deleted = false")
@BatchSize(size = 50)
@Getter
@Setter
public class Product extends BaseEntity {

    /**
     * Mahsulot qaysi kategoriyaga tegishli.
     * LAZY: kategoriya kerak bo'lgandagina bazadan yuklanadi.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    /** Mahsulot nomi o'zbek tilida. */
    @Column(name = "name_uz", nullable = false, length = 200)
    private String nameUz;

    /** Mahsulot nomi rus tilida. */
    @Column(name = "name_ru", nullable = false, length = 200)
    private String nameRu;

    /**
     * Sayt manzilida ko'rinadigan qisqa nom (masalan, "napoleon-torti").
     * O'chirilmagan mahsulotlar orasida takrorlanmaydi.
     */
    @Column(name = "slug", nullable = false, length = 230)
    private String slug;

    /** Tavsif o'zbek tilida (ixtiyoriy, uzun matn). */
    @Column(name = "description_uz", columnDefinition = "TEXT")
    private String descriptionUz;

    /** Tavsif rus tilida (ixtiyoriy, uzun matn). */
    @Column(name = "description_ru", columnDefinition = "TEXT")
    private String descriptionRu;

    /**
     * Hozirgi sotuv narxi, so'mda (butun son).
     * Aksiya bo'lsa, bu chegirmali narx hisoblanadi.
     */
    @Column(name = "price", nullable = false)
    private Long price;

    /**
     * Chegirmadan oldingi odatiy narx (ixtiyoriy).
     * Saytda eski narx chizilgan holda ko'rsatiladi. Aksiya tugagach narx shunga qaytadi.
     */
    @Column(name = "old_price")
    private Long oldPrice;

    /**
     * Chegirma qachon tugashi (ixtiyoriy). Shu vaqtgacha taymer ko'rsatiladi.
     */
    @Column(name = "discount_ends_at")
    private LocalDateTime discountEndsAt;

    /** Vazn yoki o'lcham yozuvi, masalan "1 kg", "6 dona", "500 g". */
    @Column(name = "weight_label", length = 50)
    private String weightLabel;

    /** Asosiy rasm manzili (rasm hali yuklanmagan bo'lsa null). */
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    /** Tarkib o'zbek tilida (ixtiyoriy). */
    @Column(name = "ingredients_uz", columnDefinition = "TEXT")
    private String ingredientsUz;

    /** Tarkib rus tilida (ixtiyoriy). */
    @Column(name = "ingredients_ru", columnDefinition = "TEXT")
    private String ingredientsRu;

    /** Kaloriya, 100 grammga (ixtiyoriy). */
    @Column(name = "calories")
    private Integer calories;

    /** Saqlash muddati, soatlarda (ixtiyoriy). Masalan, 72 soat. */
    @Column(name = "shelf_life_hours")
    private Integer shelfLifeHours;

    /**
     * Tayyorlanish vaqti, daqiqalarda. 0 bo'lsa mahsulot hozir tayyor.
     * Savatda eng uzoq tayyorlanish vaqti hisoblanadi.
     */
    @Column(name = "prep_time_minutes", nullable = false)
    private Integer prepTimeMinutes = 0;

    /**
     * Hozir sotuvda bormi. false bo'lsa saytda "mavjud emas" belgisi chiqadi
     * va uni buyurtma qilib bo'lmaydi. Standart qiymati true.
     */
    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;

    /** Bosh sahifadagi "Mashhur" blokida ko'rsatilsinmi. Standart false. */
    @Column(name = "is_popular", nullable = false)
    private Boolean isPopular = false;

    /** Bosh sahifadagi "Yangi" blokida ko'rsatilsinmi. Standart false. */
    @Column(name = "is_new", nullable = false)
    private Boolean isNew = false;


    /**
     * Mahsulot qanday birlikda sotiladi: dona (PIECE) yoki kilogramm (KG).
     * Asosiy birlik KG; tort va donalab sotiladigan mahsulotlar uchun admin PIECE tanlaydi.
     * Narx (price) shu birlik uchun: KG bo'lsa 1 kg narxi, PIECE bo'lsa 1 dona narxi.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "unit_type", nullable = false, length = 10)
    private UnitType unitType = UnitType.KG;

    /**
     * Eng kam buyurtma miqdori (kg uchun standart 0.5, dona uchun 1).
     */
    @Column(name = "min_quantity", nullable = false, precision = 10, scale = 3)
    private BigDecimal minQuantity = new BigDecimal("0.5");

    /**
     * Miqdor qadami: kg uchun standart 0.5; admin boshqa qadamni sozlashi mumkin.
     */
    @Column(name = "quantity_step", nullable = false, precision = 10, scale = 3)
    private BigDecimal quantityStep = new BigDecimal("0.5");

    /** Katalogda ko'rsatish tartibi: kichik raqam birinchi chiqadi. */
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    /**
     * O'chirilganmi (soft delete). true bo'lsa yozuv bazada qoladi, lekin hech qayerda ko'rsatilmaydi,
     * shunda eski buyurtmalar buzilmaydi. Standart false.
     */
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    /**
     * Qo'shimcha rasmlar ro'yxati (galereya), sortOrder bo'yicha tartiblangan.
     * mappedBy: bog'lanishni ProductImage.product maydoni boshqaradi.
     * cascade ALL: mahsulot saqlansa rasmlari ham saqlanadi.
     * orphanRemoval: ro'yxatdan olib tashlangan rasm bazadan ham o'chadi.
     */
    @OneToMany(mappedBy = "product", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 50)
    @OrderBy("sortOrder ASC")
    private List<ProductImage> images = new ArrayList<>();

    /**
     * Mahsulotdagi allergenlar to'plami (takrorlanmaydi).
     * Alohida "product_allergens" jadvalida saqlanadi, matn ko'rinishida (masalan, "NUTS").
     */
    @ElementCollection(fetch = FetchType.LAZY)
    @BatchSize(size = 50)
    @CollectionTable(name = "product_allergens", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "allergen", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private Set<Allergen> allergens = new HashSet<>();

    /**
     * Mahsulotning parhez belgilari to'plami (takrorlanmaydi).
     * Alohida "product_diet_tags" jadvalida saqlanadi.
     */
    @ElementCollection(fetch = FetchType.LAZY)
    @BatchSize(size = 50)
    @CollectionTable(name = "product_diet_tags", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "diet_tag", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private Set<DietTag> dietTags = new HashSet<>();

    /**
     * Mahsulotga yangi rasm qo'shadi va rasmning "qaysi mahsulotniki" ekanini ham o'zi belgilaydi.
     * Ikkala tomonni bir yo'la bog'lash uchun shu metoddan foydalanamiz.
     *
     * @param image qo'shiladigan rasm
     */
    public void addImage(ProductImage image) {
        // Rasmga mahsulotni biriktiramiz
        image.setProduct(this);
        // Mahsulotning rasmlar ro'yxatiga qo'shamiz
        this.images.add(image);
    }

    /**
     * Mahsulotda hozir chegirma amal qilyaptimi, shuni aytadi.
     * Chegirma amal qiladi, agar: eski (odatiy) narx berilgan va u hozirgi narxdan katta bo'lsa,
     * hamda chegirma tugash vaqti belgilanmagan yoki hali kelmagan bo'lsa.
     *
     * @return chegirma hozir amal qilsa true
     */
    public boolean isDiscountActive() {
        // Eski narx yo'q yoki hozirgi narxdan katta emas bo'lsa, chegirmaning ma'nosi yo'q
        if (oldPrice == null || oldPrice <= price) {
            return false;
        }
        // Tugash vaqti belgilanmagan bo'lsa, chegirma doimiy; belgilangan bo'lsa, hali kelmagan bo'lishi kerak
        return discountEndsAt == null || discountEndsAt.isAfter(ShopTime.now());
    }

    /**
     * Mijoz hozir to'laydigan HAQIQIY narxni qaytaradi.
     * Chegirma amal qilayotgan bo'lsa, bazadagi "price" (chegirmali narx) qaytadi.
     * Chegirma muddati tugagan bo'lsa, narx avtomatik odatiy narxga (oldPrice) qaytadi.
     * Buyurtma yaratishda ham aynan shu metoddan foydalanamiz.
     *
     * @return amaldagi narx, so'mda
     */
    public Long getEffectivePrice() {
        // Chegirma muddati tugagan: eski narx bor, u katta, lekin chegirma endi amal qilmaydi
        if (oldPrice != null && oldPrice > price && !isDiscountActive()) {
            return oldPrice;
        }
        // Boshqa hamma holatda bazadagi narx amal qiladi
        return price;
    }




}
