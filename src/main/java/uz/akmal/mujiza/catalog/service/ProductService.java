package uz.akmal.mujiza.catalog.service;

import uz.akmal.mujiza.catalog.dto.ProductFilter;
import uz.akmal.mujiza.catalog.dto.ProductRequest;
import uz.akmal.mujiza.catalog.dto.ProductResponse;
import uz.akmal.mujiza.catalog.dto.PublicProductDetailResponse;
import uz.akmal.mujiza.catalog.dto.PublicProductResponse;
import uz.akmal.mujiza.common.PageResponse;

import java.util.List;

/**
 * Mahsulotlar bilan ishlash qoidalari (biznes mantiq) ro'yxati.
 * Controller faqat shu interfeysni biladi, amalda ishlovchi klass esa ProductServiceImpl.
 */
public interface ProductService {

    /**
     * Admin panel uchun: o'chirilmagan mahsulotlar ro'yxati (filtr va sahifalash bilan).
     *
     * @param filter filtr shartlari (kategoriya, qidiruv, narx va hokazo)
     * @param page   sahifa raqami (0 dan boshlanadi)
     * @param size   bir sahifadagi mahsulotlar soni
     * @param sort   saralash turi: "price_asc", "price_desc", "newest"; boshqa qiymatda standart tartib
     * @return sahifalangan mahsulotlar
     */
    PageResponse<ProductResponse> getAll(ProductFilter filter, int page, int size, String sort);

    /**
     * Admin panel uchun: bitta mahsulotni id bo'yicha oladi.
     *
     * @param id mahsulotning raqami
     * @return mahsulot ma'lumoti (topilmasa ResourceNotFoundException)
     */
    ProductResponse getById(Long id);

    /**
     * Yangi mahsulot yaratadi. Slug berilmasa nomdan avtomatik yasaladi.
     *
     * @param request admin yuborgan ma'lumot
     * @return yaratilgan mahsulot
     */
    ProductResponse create(ProductRequest request);

    /**
     * Mavjud mahsulotni tahrirlaydi.
     *
     * @param id      tahrirlanayotgan mahsulotning raqami
     * @param request yangi ma'lumot
     * @return yangilangan mahsulot
     */
    ProductResponse update(Long id, ProductRequest request);

    /**
     * Mahsulotni o'chiradi (soft delete): bazadan o'chmaydi, faqat o'chirilgan deb belgilanadi.
     *
     * @param id o'chiriladigan mahsulotning raqami
     */
    void delete(Long id);

    /**
     * Mahsulotni tezkor "mavjud" yoki "mavjud emas" qiladi (admin bir tugma bilan).
     *
     * @param id        mahsulotning raqami
     * @param available true: sotuvda bor, false: mavjud emas
     * @return yangilangan mahsulot
     */
    ProductResponse updateAvailability(Long id, boolean available);

    /**
     * Mijoz sayti uchun: katalog ro'yxati (faqat ko'rinadigan mahsulotlar, filtr va sahifalash bilan).
     *
     * @param filter filtr shartlari
     * @param page   sahifa raqami (0 dan boshlanadi)
     * @param size   bir sahifadagi mahsulotlar soni
     * @param sort   saralash turi
     * @param lang   til kodi ("uz" yoki "ru")
     * @return sahifalangan mahsulot kartochkalari
     */
    PageResponse<PublicProductResponse> getPublicAll(ProductFilter filter, int page, int size, String sort, String lang);

    /**
     * Mijoz sayti uchun: mahsulot sahifasi (slug bo'yicha).
     *
     * @param slug mahsulotning URL uchun qisqa nomi
     * @param lang til kodi ("uz" yoki "ru")
     * @return mahsulotning to'liq ma'lumoti (topilmasa ResourceNotFoundException)
     */
    PublicProductDetailResponse getPublicBySlug(String slug, String lang);


    /**
     * Mijoz sayti uchun: "Birga olinadi" tavsiyalari. Avval shu mahsulot bilan oxirgi 90 kunda birga buyurtma
     * qilinganlar, yetmasa shu kategoriyadagi va umumiy mashhur mahsulotlar (hammasi sotuvda bor, ko'rinadigan).
     *
     * @param slug  asosiy mahsulotning slug'i
     * @param lang  til kodi ("uz" yoki "ru")
     * @param limit eng ko'p nechta tavsiya (1 dan 12 gacha)
     * @return tavsiyalar (bo'sh bo'lishi mumkin)
     */
    List<PublicProductResponse> getPublicRecommendations(String slug, String lang, int limit);
}