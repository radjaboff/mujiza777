package uz.akmal.mujiza.marketing.service;

import uz.akmal.mujiza.marketing.dto.PromotionRequest;
import uz.akmal.mujiza.marketing.dto.PromotionResponse;
import uz.akmal.mujiza.marketing.dto.PublicPromotionResponse;

import java.util.List;

/**
 * Aksiyalar va yangiliklar bilan ishlash qoidalari (biznes mantiq) ro'yxati.
 * Controller faqat shu interfeysni biladi, amalda ishlovchi klass esa PromotionServiceImpl.
 */
public interface PromotionService {

    /**
     * Admin panel uchun: o'chirilmagan barcha aksiyalar (hali boshlanmagan va tugaganlari ham).
     *
     * @return aksiyalar ro'yxati
     */
    List<PromotionResponse> getAll();

    /**
     * Admin panel uchun: bitta aksiyani id bo'yicha oladi.
     *
     * @param id aksiyaning raqami
     * @return aksiya ma'lumoti (topilmasa ResourceNotFoundException)
     */
    PromotionResponse getById(Long id);

    /**
     * Yangi aksiya yaratadi. Slug berilmasa sarlavhadan avtomatik yasaladi.
     *
     * @param request admin yuborgan ma'lumot
     * @return yaratilgan aksiya
     */
    PromotionResponse create(PromotionRequest request);

    /**
     * Mavjud aksiyani tahrirlaydi.
     *
     * @param id      tahrirlanayotgan aksiyaning raqami
     * @param request yangi ma'lumot
     * @return yangilangan aksiya
     */
    PromotionResponse update(Long id, PromotionRequest request);

    /**
     * Aksiyani o'chiradi (soft delete): bazadan o'chmaydi, faqat o'chirilgan deb belgilanadi.
     *
     * @param id o'chiriladigan aksiyaning raqami
     */
    void delete(Long id);

    /**
     * Mijoz sayti uchun: hozir ko'rinadigan barcha aksiyalar, matnlar so'ralgan tilda.
     *
     * @param lang til kodi ("uz" yoki "ru")
     * @return aksiyalar ro'yxati
     */
    List<PublicPromotionResponse> getPublicAll(String lang);

    /**
     * Mijoz sayti uchun: bosh sahifadagi bannerlar (hozir ko'rinadigan va bosh sahifada ko'rsatiladigan aksiyalar).
     *
     * @param lang til kodi ("uz" yoki "ru")
     * @return bannerlar ro'yxati
     */
    List<PublicPromotionResponse> getPublicHome(String lang);

    /**
     * Mijoz sayti uchun: aksiya sahifasi (slug bo'yicha).
     *
     * @param slug aksiyaning URL uchun qisqa nomi
     * @param lang til kodi ("uz" yoki "ru")
     * @return aksiya (hozir ko'rinmasa yoki topilmasa ResourceNotFoundException)
     */
    PublicPromotionResponse getPublicBySlug(String slug, String lang);
}