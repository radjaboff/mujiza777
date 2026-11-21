package uz.akmal.mujiza.cake.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import uz.akmal.mujiza.cake.entity.CakeOption;
import uz.akmal.mujiza.cake.enums.CakeOptionKind;

import java.util.List;
import java.util.Optional;

/**
 * CakeOption jadvali bilan ishlaydigan qatlam. Soft delete bor, o'chirilganlar o'tkazib yuboriladi.
 */
public interface CakeOptionRepository extends JpaRepository<CakeOption, Long> {

    /**
     * Admin uchun: o'chirilmagan barcha variantlar, guruh va tartib bo'yicha.
     *
     * @return variantlar ro'yxati
     */
    List<CakeOption> findAllByIsDeletedFalseOrderByKindAscSortOrderAscIdAsc();

    /**
     * Admin uchun: bitta guruhdagi o'chirilmagan variantlar, tartib bo'yicha.
     *
     * @param kind guruh
     * @return variantlar ro'yxati
     */
    List<CakeOption> findAllByKindAndIsDeletedFalseOrderBySortOrderAscIdAsc(CakeOptionKind kind);

    /**
     * Mijoz uchun: faqat faol va o'chirilmagan variantlar, tartib bo'yicha.
     *
     * @return variantlar ro'yxati
     */
    List<CakeOption> findAllByIsDeletedFalseAndIsActiveTrueOrderBySortOrderAscIdAsc();

    /**
     * id bo'yicha o'chirilmagan variantni topadi.
     *
     * @param id variantning raqami
     * @return variant yoki bo'sh Optional
     */
    Optional<CakeOption> findByIdAndIsDeletedFalse(Long id);

    /**
     * Katalogdagi tort variantlari rasmlari (o'chirilganlar ham).
     *
     * @return bo'sh bo'lmagan manzillar
     */
    @Query("select o.imageUrl from CakeOption o where o.imageUrl is not null")
    List<String> findImageUrls();
}