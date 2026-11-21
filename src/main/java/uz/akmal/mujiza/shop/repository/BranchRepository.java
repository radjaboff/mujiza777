package uz.akmal.mujiza.shop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.akmal.mujiza.shop.entity.Branch;

import java.util.List;
import java.util.Optional;

/**
 * Branch jadvali bilan ishlaydigan qatlam (bazadan o'qish va yozish).
 * Soft delete bor, shuning uchun hamma metod o'chirilgan filiallarni o'tkazib yuboradi.
 */
public interface BranchRepository extends JpaRepository<Branch, Long> {

    /**
     * Admin panel uchun: o'chirilmagan BARCHA filiallar (yashirinlari ham), tartib bo'yicha.
     *
     * @return filiallar ro'yxati, sortOrder o'sish tartibida
     */
    List<Branch> findAllByIsDeletedFalseOrderBySortOrderAsc();

    /**
     * Mijoz sayti uchun: faqat o'chirilmagan VA faol filiallar, tartib bo'yicha.
     *
     * @return mijozga ko'rinadigan filiallar ro'yxati
     */
    List<Branch> findAllByIsDeletedFalseAndIsActiveTrueOrderBySortOrderAsc();

    /**
     * id bo'yicha bitta o'chirilmagan filialni topadi.
     *
     * @param id filialning raqami
     * @return filial yoki bo'sh Optional
     */
    Optional<Branch> findByIdAndIsDeletedFalse(Long id);
}