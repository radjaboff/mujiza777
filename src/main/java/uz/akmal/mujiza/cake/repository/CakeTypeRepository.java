package uz.akmal.mujiza.cake.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import uz.akmal.mujiza.cake.entity.CakeType;

import java.util.List;
import java.util.Optional;

/**
 * CakeType jadvali bilan ishlaydigan qatlam. Soft delete bor, o'chirilganlar o'tkazib yuboriladi.
 */
public interface CakeTypeRepository extends JpaRepository<CakeType, Long> {

    /**
     * Admin uchun: o'chirilmagan barcha turlar, tartib bo'yicha.
     *
     * @return turlar ro'yxati
     */
    List<CakeType> findAllByIsDeletedFalseOrderBySortOrderAscIdAsc();

    /**
     * Mijoz uchun: faqat faol va o'chirilmagan turlar, tartib bo'yicha.
     *
     * @return turlar ro'yxati
     */
    List<CakeType> findAllByIsDeletedFalseAndIsActiveTrueOrderBySortOrderAscIdAsc();

    /**
     * id bo'yicha o'chirilmagan turni topadi.
     *
     * @param id turning raqami
     * @return tur yoki bo'sh Optional
     */
    Optional<CakeType> findByIdAndIsDeletedFalse(Long id);

    /**
     * Katalogdagi tort turlari rasmlari (o'chirilganlar ham, tiklashda fayl yo'qolib qolmasligi uchun).
     *
     * @return bo'sh bo'lmagan manzillar
     */
    @Query("select t.imageUrl from CakeType t where t.imageUrl is not null")
    List<String> findImageUrls();
}