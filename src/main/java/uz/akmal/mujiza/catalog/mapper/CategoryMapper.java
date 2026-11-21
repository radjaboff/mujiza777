package uz.akmal.mujiza.catalog.mapper;

import org.springframework.stereotype.Component;
import uz.akmal.mujiza.catalog.dto.CategoryRequest;
import uz.akmal.mujiza.catalog.dto.CategoryResponse;
import uz.akmal.mujiza.catalog.dto.PublicCategoryResponse;
import uz.akmal.mujiza.catalog.entity.Category;

/**
 * Category entity bilan DTO'larni bir-biriga aylantiradi.
 * Controller va Service'da aylantirish kodi takrorlanmasligi uchun hammasi shu yerda.
 *
 * @Component: Spring bu klassdan o'zi bitta obyekt yaratadi va kerakli joyga (Service'ga) beradi.
 */
@Component
public class CategoryMapper {

    /**
     * Admin yuborgan ma'lumotdan YANGI Category obyektini yasaydi.
     * Eslatma: slug bu yerda o'rnatilmaydi, uni Service avtomatik yasaydi va takrorlanmasligini tekshiradi.
     *
     * @param request admin yuborgan ma'lumot
     * @return yangi (hali bazaga saqlanmagan) Category
     */
    public Category toEntity(CategoryRequest request) {
        // Bo'sh Category yaratamiz (standart qiymatlar: sortOrder = 0, isActive = true, isDeleted = false)
        Category category = new Category();
        // Request'dagi maydonlarni unga ko'chiramiz
        applyRequest(category, request);
        return category;
    }

    /**
     * Admin yuborgan ma'lumotni MAVJUD Category'ga ko'chiradi (tahrirlash uchun).
     * Slug'ga tegmaydi (uni Service hal qiladi). id, vaqtlar va isDeleted ham o'zgarmaydi.
     *
     * @param category tahrirlanayotgan mavjud kategoriya
     * @param request  admin yuborgan yangi ma'lumot
     */
    public void applyRequest(Category category, CategoryRequest request) {
        // Ikkala tildagi nom majburiy, doim yangilanadi
        category.setNameUz(request.nameUz());
        category.setNameRu(request.nameRu());
        // Rasm manzili: null kelsa rasm olib tashlanadi
        category.setImageUrl(request.imageUrl());
        // Tartib raqami va faollik: yuborilmagan (null) bo'lsa eski qiymat saqlanadi
        if (request.sortOrder() != null) {
            category.setSortOrder(request.sortOrder());
        }
        if (request.isActive() != null) {
            category.setIsActive(request.isActive());
        }
    }

    /**
     * Category'dan admin panel uchun to'liq javob yasaydi (ikkala til, vaqtlar bilan).
     *
     * @param category bazadan olingan kategoriya
     * @return admin panelga qaytariladigan DTO
     */
    public CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getNameUz(),
                category.getNameRu(),
                category.getSlug(),
                category.getImageUrl(),
                category.getSortOrder(),
                category.getIsActive(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }

    /**
     * Category'dan mijoz sayti uchun qisqa javob yasaydi (nom bitta, so'ralgan tilda).
     *
     * @param category bazadan olingan kategoriya
     * @param lang     til kodi: "ru" bo'lsa ruscha nom, boshqa hamma holatda o'zbekcha nom
     * @return mijoz saytiga qaytariladigan DTO
     */
    public PublicCategoryResponse toPublicResponse(Category category, String lang) {
        // Til "ru" bo'lsa ruscha nomni olamiz, aks holda standart til sifatida o'zbekchani
        String name = "ru".equalsIgnoreCase(lang) ? category.getNameRu() : category.getNameUz();
        return new PublicCategoryResponse(
                category.getId(),
                name,
                category.getSlug(),
                category.getImageUrl()
        );
    }
}