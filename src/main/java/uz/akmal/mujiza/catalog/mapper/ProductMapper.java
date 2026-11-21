package uz.akmal.mujiza.catalog.mapper;

import org.springframework.stereotype.Component;
import uz.akmal.mujiza.catalog.dto.ProductRequest;
import uz.akmal.mujiza.catalog.dto.ProductResponse;
import uz.akmal.mujiza.catalog.dto.PublicProductDetailResponse;
import uz.akmal.mujiza.catalog.dto.PublicProductResponse;
import uz.akmal.mujiza.catalog.entity.Category;
import uz.akmal.mujiza.catalog.entity.Product;
import uz.akmal.mujiza.catalog.entity.ProductImage;
import uz.akmal.mujiza.catalog.enums.Allergen;
import uz.akmal.mujiza.catalog.enums.DietTag;
import uz.akmal.mujiza.catalog.enums.UnitType;

import java.math.BigDecimal;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

/**
 * Product entity bilan DTO'larni bir-biriga aylantiradi.
 * Narx va til bilan bog'liq qoidalar ham shu yerda.
 *
 * Eslatma: bu klass lazy (kerak bo'lganda yuklanadigan) maydonlarni o'qiydi,
 * shuning uchun faqat Service'ning @Transactional metodlari ichida chaqirilishi kerak.
 */
@Component
public class ProductMapper {

    /**
     * Admin yuborgan ma'lumotni Product'ga ko'chiradi (yaratish va tahrirlash uchun bitta metod).
     * Slug'ga tegmaydi (uni Service hal qiladi).
     *
     * Qoida: ixtiyoriy maydonlar (isAvailable, sortOrder, rasmlar, allergenlar va h.k.)
     * yuborilmasa (null), eski qiymat o'zgarmaydi. Rasmlar yoki allergenlarni butunlay tozalash uchun
     * bo'sh ro'yxat ([]) yuboriladi.
     *
     * @param product  to'ldiriladigan mahsulot (yangi bo'sh yoki mavjud)
     * @param request  admin yuborgan ma'lumot
     * @param category mahsulot tegishli kategoriya (Service uni bazadan topib beradi)
     */
    public void applyRequest(Product product, ProductRequest request, Category category) {
        // Asosiy ma'lumotlar har doim yangilanadi
        product.setCategory(category);
        product.setNameUz(request.nameUz());
        product.setNameRu(request.nameRu());
        product.setDescriptionUz(request.descriptionUz());
        product.setDescriptionRu(request.descriptionRu());
        product.setPrice(request.price());
        product.setOldPrice(request.oldPrice());
        product.setDiscountEndsAt(request.discountEndsAt());
        product.setWeightLabel(request.weightLabel());
        product.setImageUrl(request.imageUrl());
        product.setIngredientsUz(request.ingredientsUz());
        product.setIngredientsRu(request.ingredientsRu());
        product.setCalories(request.calories());
        product.setShelfLifeHours(request.shelfLifeHours());

        // O'lchov turi o'zgarsa, eng kam miqdor va qadam yangi turning standart qiymatlariga qaytadi
        // (kg uchun 0.5, dona uchun 1). Keyin admin alohida yuborgan qiymatlar ularni almashtiradi.
        if (request.unitType() != null && request.unitType() != product.getUnitType()) {
            product.setUnitType(request.unitType());
            BigDecimal defaultValue = request.unitType() == UnitType.KG ? new BigDecimal("0.5") : BigDecimal.ONE;
            product.setMinQuantity(defaultValue);
            product.setQuantityStep(defaultValue);
        }
        if (request.minQuantity() != null) {
            product.setMinQuantity(request.minQuantity());
        }
        if (request.quantityStep() != null) {
            product.setQuantityStep(request.quantityStep());
        }

        // Quyidagilar yuborilmasa eski (yoki standart) qiymat qoladi
        if (request.prepTimeMinutes() != null) {
            product.setPrepTimeMinutes(request.prepTimeMinutes());
        }
        if (request.isAvailable() != null) {
            product.setIsAvailable(request.isAvailable());
        }
        if (request.isPopular() != null) {
            product.setIsPopular(request.isPopular());
        }
        if (request.isNew() != null) {
            product.setIsNew(request.isNew());
        }
        if (request.sortOrder() != null) {
            product.setSortOrder(request.sortOrder());
        }

        // Qo'shimcha rasmlar: yuborilgan bo'lsa to'liq almashtiriladi
        if (request.imageUrls() != null) {
            // Eskilarini tozalaymiz (orphanRemoval bazadan ham o'chiradi)
            product.getImages().clear();
            // Yangilarini ketma-ket qo'shamiz, tartib raqami ro'yxatdagi o'rniga teng
            for (int i = 0; i < request.imageUrls().size(); i++) {
                ProductImage image = new ProductImage();
                image.setImageUrl(request.imageUrls().get(i));
                image.setSortOrder(i);
                product.addImage(image);
            }
        }

        // Allergenlar: yuborilgan bo'lsa to'liq almashtiriladi
        if (request.allergens() != null) {
            product.getAllergens().clear();
            product.getAllergens().addAll(request.allergens());
        }

        // Parhez belgilari: yuborilgan bo'lsa to'liq almashtiriladi
        if (request.dietTags() != null) {
            product.getDietTags().clear();
            product.getDietTags().addAll(request.dietTags());
        }
    }

    /**
     * Product'dan admin panel uchun to'liq javob yasaydi (ikkala til, vaqtlar, xom narx bilan).
     *
     * @param product bazadan olingan mahsulot
     * @return admin panelga qaytariladigan DTO
     */
    public ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getCategory().getId(),
                product.getCategory().getNameUz(),
                product.getNameUz(),
                product.getNameRu(),
                product.getSlug(),
                product.getDescriptionUz(),
                product.getDescriptionRu(),
                product.getPrice(),
                product.getOldPrice(),
                product.getDiscountEndsAt(),
                product.getWeightLabel(),
                product.getImageUrl(),
                imageUrlsOf(product),
                product.getIngredientsUz(),
                product.getIngredientsRu(),
                product.getCalories(),
                product.getShelfLifeHours(),
                product.getPrepTimeMinutes(),
                product.getIsAvailable(),
                product.getIsPopular(),
                product.getIsNew(),
                product.getSortOrder(),
                allergensOf(product),
                dietTagsOf(product),
                product.getCreatedAt(),
                product.getUpdatedAt()
                ,
                product.getUnitType(),
                product.getMinQuantity(),
                product.getQuantityStep()
        );
    }

    /**
     * Product'dan mijoz katalogi uchun qisqa kartochka yasaydi.
     * Narx hozir amal qiladigan narx bo'ladi, eski narx va taymer faqat chegirma amal qilsagina chiqadi.
     *
     * @param product bazadan olingan mahsulot
     * @param lang    til kodi ("ru" bo'lsa ruscha, boshqa hamma holatda o'zbekcha)
     * @return mijoz katalogiga qaytariladigan DTO
     */
    public PublicProductResponse toPublicResponse(Product product, String lang) {
        // Chegirma hozir amal qilyaptimi, bir marta aniqlab olamiz
        boolean discount = product.isDiscountActive();
        return new PublicProductResponse(
                product.getId(),
                localized(product.getNameUz(), product.getNameRu(), lang),
                product.getSlug(),
                product.getCategory().getSlug(),
                product.getEffectivePrice(),
                discount ? product.getOldPrice() : null,
                discount ? product.getDiscountEndsAt() : null,
                product.getWeightLabel(),
                product.getImageUrl(),
                product.getPrepTimeMinutes(),
                product.getIsAvailable(),
                product.getIsPopular(),
                product.getIsNew(),
                allergensOf(product),
                dietTagsOf(product)
                ,
                product.getUnitType(),
                product.getMinQuantity(),
                product.getQuantityStep()
        );
    }

    /**
     * Product'dan mijoz saytidagi mahsulot sahifasi uchun to'liq ma'lumot yasaydi.
     *
     * @param product bazadan olingan mahsulot
     * @param lang    til kodi ("ru" bo'lsa ruscha, boshqa hamma holatda o'zbekcha)
     * @return mahsulot sahifasi uchun DTO
     */
    public PublicProductDetailResponse toPublicDetailResponse(Product product, String lang) {
        // Chegirma hozir amal qilyaptimi, bir marta aniqlab olamiz
        boolean discount = product.isDiscountActive();
        Category category = product.getCategory();
        return new PublicProductDetailResponse(
                product.getId(),
                category.getId(),
                localized(category.getNameUz(), category.getNameRu(), lang),
                category.getSlug(),
                localized(product.getNameUz(), product.getNameRu(), lang),
                product.getSlug(),
                localized(product.getDescriptionUz(), product.getDescriptionRu(), lang),
                product.getEffectivePrice(),
                discount ? product.getOldPrice() : null,
                discount ? product.getDiscountEndsAt() : null,
                product.getWeightLabel(),
                product.getImageUrl(),
                imageUrlsOf(product),
                localized(product.getIngredientsUz(), product.getIngredientsRu(), lang),
                product.getCalories(),
                product.getShelfLifeHours(),
                product.getPrepTimeMinutes(),
                product.getIsAvailable(),
                product.getIsPopular(),
                product.getIsNew(),
                allergensOf(product),
                dietTagsOf(product)
                ,
                product.getUnitType(),
                product.getMinQuantity(),
                product.getQuantityStep()
        );
    }

    /**
     * Yordamchi metod: so'ralgan tilga mos matnni tanlaydi.
     * Til "ru" bo'lsa va ruscha matn to'ldirilgan bo'lsa ruscha, aks holda o'zbekcha qaytadi
     * (ruscha tavsif yozilmagan bo'lsa ham mijoz bo'sh joy ko'rmaydi).
     *
     * @param uz   o'zbekcha matn
     * @param ru   ruscha matn
     * @param lang til kodi
     * @return tanlangan matn
     */
    private String localized(String uz, String ru, String lang) {
        // Ruscha so'ralgan va ruscha matn bo'sh emas bo'lsa
        if ("ru".equalsIgnoreCase(lang) && ru != null && !ru.isBlank()) {
            return ru;
        }
        return uz;
    }

    /**
     * Yordamchi metod: mahsulotning qo'shimcha rasmlari manzillarini oddiy ro'yxatga aylantiradi.
     *
     * @param product mahsulot
     * @return rasm manzillari ro'yxati (tartib bo'yicha)
     */
    private List<String> imageUrlsOf(Product product) {
        return product.getImages().stream().map(ProductImage::getImageUrl).toList();
    }

    /**
     * Yordamchi metod: allergenlarni bazadan bog'langan to'plamdan alohida tartiblangan nusxaga ko'chiradi.
     *
     * @param product mahsulot
     * @return allergenlar to'plami (enum tartibida)
     */
    private Set<Allergen> allergensOf(Product product) {
        Set<Allergen> result = EnumSet.noneOf(Allergen.class);
        result.addAll(product.getAllergens());
        return result;
    }

    /**
     * Yordamchi metod: parhez belgilarini alohida tartiblangan nusxaga ko'chiradi.
     *
     * @param product mahsulot
     * @return parhez belgilari to'plami (enum tartibida)
     */
    private Set<DietTag> dietTagsOf(Product product) {
        Set<DietTag> result = EnumSet.noneOf(DietTag.class);
        result.addAll(product.getDietTags());
        return result;
    }
}