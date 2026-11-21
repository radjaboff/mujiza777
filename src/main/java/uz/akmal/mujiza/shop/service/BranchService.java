package uz.akmal.mujiza.shop.service;

import uz.akmal.mujiza.shop.dto.BranchRequest;
import uz.akmal.mujiza.shop.dto.BranchResponse;
import uz.akmal.mujiza.shop.dto.PublicBranchResponse;

import java.util.List;

/**
 * Filiallar bilan ishlash qoidalari (biznes mantiq) ro'yxati.
 * Controller faqat shu interfeysni biladi, amalda ishlovchi klass esa BranchServiceImpl.
 */
public interface BranchService {

    /**
     * Admin panel uchun: o'chirilmagan barcha filiallar (yashirinlari ham), tartib bo'yicha.
     *
     * @return filiallar ro'yxati
     */
    List<BranchResponse> getAll();

    /**
     * Admin panel uchun: bitta filialni id bo'yicha oladi.
     *
     * @param id filialning raqami
     * @return filial ma'lumoti (topilmasa ResourceNotFoundException)
     */
    BranchResponse getById(Long id);

    /**
     * Yangi filial yaratadi.
     *
     * @param request admin yuborgan ma'lumot
     * @return yaratilgan filial
     */
    BranchResponse create(BranchRequest request);

    /**
     * Mavjud filialni tahrirlaydi.
     *
     * @param id      tahrirlanayotgan filialning raqami
     * @param request yangi ma'lumot
     * @return yangilangan filial
     */
    BranchResponse update(Long id, BranchRequest request);

    /**
     * Filialni o'chiradi (soft delete): bazadan o'chmaydi, faqat o'chirilgan deb belgilanadi.
     * Shunda shu filialga bog'langan eski buyurtmalar buzilmaydi.
     *
     * @param id o'chiriladigan filialning raqami
     */
    void delete(Long id);

    /**
     * Mijoz sayti uchun: faqat faol filiallar, nom va manzil so'ralgan tilda.
     *
     * @param lang til kodi ("uz" yoki "ru")
     * @return mijozga ko'rinadigan filiallar
     */
    List<PublicBranchResponse> getPublicAll(String lang);
}