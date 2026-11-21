package uz.akmal.mujiza.catalog.specification;

import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;
import uz.akmal.mujiza.catalog.dto.ProductFilter;
import uz.akmal.mujiza.catalog.entity.Category;
import uz.akmal.mujiza.catalog.entity.Product;
import uz.akmal.mujiza.common.ShopTime;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Mahsulotlarni qidirish shartlari to'plami.
 * Har bir metod bitta kichik shartni qaytaradi (masalan, "narx 100 000 dan katta"),
 * pastdagi ikkita asosiy metod esa kerakli shartlarni bir-biriga ulab beradi.
 * Faqat statik metodlar bor, shuning uchun obyekt yaratilmaydi.
 */
public final class ProductSpecifications {

    /**
     * Obyekt yaratishni taqiqlaydi (private konstruktor), klass faqat statik ishlatiladi.
     */
    private ProductSpecifications() {
    }

    /**
     * Mijoz sayti uchun shartlar: o'chirilmagan mahsulot, ko'rinadigan (faol, o'chirilmagan) kategoriyada,
     * va filtrdagi qolgan shartlar.
     *
     * @param filter mijoz yuborgan filtr shartlari
     * @return birlashtirilgan shart
     */
    public static Specification<Product> forPublic(ProductFilter filter) {
        List<Specification<Product>> specs = new ArrayList<>();
        // Har doim: mahsulot o'chirilmagan va kategoriyasi mijozga ko'rinadigan bo'lishi kerak
        specs.add(notDeleted());
        specs.add(categoryVisible());
        // Filtrdagi qolgan shartlarni qo'shamiz
        addFilterConditions(specs, filter);
        return Specification.allOf(specs);
    }

    /**
     * Admin panel uchun shartlar: faqat o'chirilmagan mahsulotlar (yashirin kategoriyadagilari ham ko'rinadi)
     * va filtrdagi qolgan shartlar.
     *
     * @param filter admin yuborgan filtr shartlari
     * @return birlashtirilgan shart
     */
    public static Specification<Product> forAdmin(ProductFilter filter) {
        List<Specification<Product>> specs = new ArrayList<>();
        // Har doim: mahsulot o'chirilmagan bo'lishi kerak
        specs.add(notDeleted());
        // Filtrdagi qolgan shartlarni qo'shamiz
        addFilterConditions(specs, filter);
        return Specification.allOf(specs);
    }

    /**
     * Filtrda berilgan shartlarni ro'yxatga qo'shadi. Berilmagan (null) shartlar o'tkazib yuboriladi.
     *
     * @param specs  shartlar ro'yxati (shunga qo'shiladi)
     * @param filter filtr shartlari
     */
    private static void addFilterConditions(List<Specification<Product>> specs, ProductFilter filter) {
        // Filtr umuman yuborilmagan bo'lsa, qo'shadigan narsa yo'q
        if (filter == null) {
            return;
        }
        if (filter.categoryId() != null) {
            specs.add(inCategoryId(filter.categoryId()));
        }
        if (filter.categorySlug() != null && !filter.categorySlug().isBlank()) {
            specs.add(inCategorySlug(filter.categorySlug()));
        }
        if (filter.search() != null && !filter.search().isBlank()) {
            specs.add(nameContains(filter.search()));
        }
        if (filter.minPrice() != null) {
            specs.add(priceAtLeast(filter.minPrice()));
        }
        if (filter.maxPrice() != null) {
            specs.add(priceAtMost(filter.maxPrice()));
        }
        // Har bir istisno qilingan allergen uchun alohida shart: mahsulotda u bo'lmasligi kerak
        if (filter.excludeAllergens() != null) {
            filter.excludeAllergens().forEach(allergen -> specs.add(withoutAllergen(allergen)));
        }
        // Har bir so'ralgan parhez belgisi uchun alohida shart: mahsulotda u bo'lishi kerak
        if (filter.diets() != null) {
            filter.diets().forEach(diet -> specs.add(withDietTag(diet)));
        }
        if (filter.popular() != null) {
            specs.add(flagEquals("isPopular", filter.popular()));
        }
        if (filter.isNew() != null) {
            specs.add(flagEquals("isNew", filter.isNew()));
        }
        if (filter.available() != null) {
            specs.add(flagEquals("isAvailable", filter.available()));
        }
        // Faqat true bo'lsa chegirmadagilar so'raladi (false "hammasi" degani, alohida shart kerak emas)
        if (Boolean.TRUE.equals(filter.discounted())) {
            specs.add(discountActive());
        }
    }

    /**
     * Shart: mahsulot o'chirilmagan.
     */
    private static Specification<Product> notDeleted() {
        return (root, query, cb) -> cb.isFalse(root.get("isDeleted"));
    }

    /**
     * Shart: mahsulotning kategoriyasi o'chirilmagan va faol (mijozga ko'rinadigan).
     */
    private static Specification<Product> categoryVisible() {
        return (root, query, cb) -> {
            // Mahsulotni kategoriyasi bilan bog'laymiz
            Join<Product, Category> category = root.join("category");
            return cb.and(
                    cb.isFalse(category.get("isDeleted")),
                    cb.isTrue(category.get("isActive"))
            );
        };
    }

    /**
     * Shart: mahsulot berilgan raqamli kategoriyada.
     *
     * @param categoryId kategoriyaning raqami
     */
    private static Specification<Product> inCategoryId(Long categoryId) {
        return (root, query, cb) -> cb.equal(root.get("category").get("id"), categoryId);
    }

    /**
     * Shart: mahsulot berilgan slug'li kategoriyada.
     *
     * @param slug kategoriyaning slug'i
     */
    private static Specification<Product> inCategorySlug(String slug) {
        return (root, query, cb) -> {
            Join<Product, Category> category = root.join("category");
            return cb.equal(category.get("slug"), slug);
        };
    }

    /**
     * Shart: o'zbekcha yoki ruscha nomning ichida qidiruv matni bor (katta-kichik harfga qaramaydi).
     *
     * @param text qidiruv matni
     */
    private static Specification<Product> nameContains(String text) {
        // Qidiruv matnini tozalaymiz va LIKE'ning maxsus belgilarini (% _ \) oddiy belgiga aylantiramiz,
        // shunda mijoz "%" yozib hamma narsani topib qo'ya olmaydi
        String escaped = text.trim().toLowerCase()
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
        String pattern = "%" + escaped + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("nameUz")), pattern, '\\'),
                cb.like(cb.lower(root.get("nameRu")), pattern, '\\')
        );
    }

    /**
     * Shart: narx berilgan summadan kam emas.
     * Eslatma: bazadagi narx bo'yicha solishtiriladi. Muddati tugagan chegirma narxi
     * bundan mustasno, bu kichik farq qidiruv uchun e'tiborga olinmaydi.
     *
     * @param min eng kam narx
     */
    private static Specification<Product> priceAtLeast(Long min) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.<Long>get("price"), min);
    }

    /**
     * Shart: narx berilgan summadan ko'p emas.
     *
     * @param max eng ko'p narx
     */
    private static Specification<Product> priceAtMost(Long max) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.<Long>get("price"), max);
    }

    /**
     * Shart: mahsulotda berilgan allergen YO'Q.
     *
     * @param allergen istisno qilinadigan allergen
     */
    private static Specification<Product> withoutAllergen(Enum<?> allergen) {
        return (root, query, cb) -> cb.isNotMember(allergen, root.get("allergens"));
    }

    /**
     * Shart: mahsulotda berilgan parhez belgisi BOR.
     *
     * @param diet kerakli parhez belgisi
     */
    private static Specification<Product> withDietTag(Enum<?> diet) {
        return (root, query, cb) -> cb.isMember(diet, root.get("dietTags"));
    }

    /**
     * Shart: mantiqiy (ha/yo'q) maydon berilgan qiymatga teng
     * (masalan, isPopular = true).
     *
     * @param field maydon nomi ("isPopular", "isNew" yoki "isAvailable")
     * @param value kerakli qiymat
     */
    private static Specification<Product> flagEquals(String field, Boolean value) {
        return (root, query, cb) -> cb.equal(root.get(field), value);
    }

    /**
     * Shart: mahsulotda hozir chegirma amal qilyapti
     * (eski narx hozirgidan katta va chegirma muddati tugamagan yoki belgilanmagan).
     * Product.isDiscountActive() bilan bir xil qoida, faqat bazada tekshiriladi.
     */
    private static Specification<Product> discountActive() {
        return (root, query, cb) -> cb.and(
                cb.isNotNull(root.get("oldPrice")),
                cb.greaterThan(root.<Long>get("oldPrice"), root.<Long>get("price")),
                cb.or(
                        cb.isNull(root.get("discountEndsAt")),
                        cb.greaterThan(root.<LocalDateTime>get("discountEndsAt"), ShopTime.now())
                )
        );
    }
}
