package uz.akmal.mujiza.catalog.service;

import uz.akmal.mujiza.catalog.dto.CategoryRequest;
import uz.akmal.mujiza.catalog.dto.CategoryResponse;
import uz.akmal.mujiza.catalog.dto.PublicCategoryResponse;

import java.util.List;

/**
 * Kategoriyalar bilan ishlash qoidalari (biznes mantiq) ro'yxati.
 * Controller faqat shu interfeysni biladi, amalda ishlovchi klass esa CategoryServiceImpl.
 */
public interface CategoryService {

    /**
     * Admin panel uchun: o'chirilmagan barcha kategoriyalar (yashirinlari ham), tartib bo'yicha.
     *
     * @return kategoriyalar ro'yxati
     */
    List<CategoryResponse> getAll();

    /**
     * Admin panel uchun: bitta kategoriyani id bo'yicha oladi.
     *
     * @param id kategoriyaning raqami
     * @return kategoriya ma'lumoti (topilmasa ResourceNotFoundException)
     */
    CategoryResponse getById(Long id);

    /**
     * Yangi kategoriya yaratadi. Slug berilmasa nomdan avtomatik yasaladi va takrorlanmasligi ta'minlanadi.
     *
     * @param request admin yuborgan ma'lumot
     * @return yaratilgan kategoriya
     */
    CategoryResponse create(CategoryRequest request);

    /**
     * Mavjud kategoriyani tahrirlaydi.
     *
     * @param id      tahrirlanayotgan kategoriyaning raqami
     * @param request yangi ma'lumot
     * @return yangilangan kategoriya
     */
    CategoryResponse update(Long id, CategoryRequest request);

    /**
     * Kategoriyani o'chiradi (soft delete): bazadan o'chmaydi, faqat o'chirilgan deb belgilanadi.
     *
     * @param id o'chiriladigan kategoriyaning raqami
     */
    void delete(Long id);

    /**
     * Mijoz sayti uchun: faqat faol kategoriyalar, nomi so'ralgan tilda.
     *
     * @param lang til kodi ("uz" yoki "ru")
     * @return mijozga ko'rinadigan kategoriyalar
     */
    List<PublicCategoryResponse> getPublicAll(String lang);
}