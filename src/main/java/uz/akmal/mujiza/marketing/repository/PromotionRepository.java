package uz.akmal.mujiza.marketing.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import uz.akmal.mujiza.marketing.entity.Promotion;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Promotion jadvali bilan ishlaydigan qatlam (bazadan o'qish va yozish).
 * Soft delete bor, shuning uchun hamma metod o'chirilgan aksiyalarni o'tkazib yuboradi.
 */
public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    /**
     * Mijozga ko'rinadigan aksiya sharti: o'chirilmagan, yoqilgan va hozirgi vaqt ko'rinish oralig'ida.
     * Boshlanish yoki tugash vaqti bo'sh bo'lsa, o'sha tomondan cheklov yo'q.
     */
    String VISIBLE = "p.isDeleted = false and p.isActive = true "
            + "and (p.activeFrom is null or p.activeFrom <= :now) "
            + "and (p.activeTo is null or p.activeTo > :now)";

    /**
     * Admin panel uchun: o'chirilmagan BARCHA aksiyalar (hali boshlanmagan va tugaganlari ham), tartib bo'yicha.
     *
     * @return aksiyalar ro'yxati
     */
    List<Promotion> findAllByIsDeletedFalseOrderBySortOrderAscIdDesc();

    /**
     * id bo'yicha bitta o'chirilmagan aksiyani topadi.
     *
     * @param id aksiyaning raqami
     * @return aksiya yoki bo'sh Optional
     */
    Optional<Promotion> findByIdAndIsDeletedFalse(Long id);

    /**
     * Mijoz sayti uchun: hozir ko'rinadigan barcha aksiyalar.
     *
     * @param now hozirgi vaqt
     * @return aksiyalar ro'yxati, tartib bo'yicha
     */
    @Query("select p from Promotion p where " + VISIBLE + " order by p.sortOrder asc, p.id desc")
    List<Promotion> findVisible(@Param("now") LocalDateTime now);

    /**
     * Mijoz sayti uchun: hozir ko'rinadigan va bosh sahifada ko'rsatiladigan aksiyalar (bannerlar).
     *
     * @param now hozirgi vaqt
     * @return bannerlar ro'yxati, tartib bo'yicha
     */
    @Query("select p from Promotion p where " + VISIBLE + " and p.showOnHome = true "
            + "order by p.sortOrder asc, p.id desc")
    List<Promotion> findVisibleOnHome(@Param("now") LocalDateTime now);

    /**
     * Mijoz sayti uchun: slug bo'yicha hozir ko'rinadigan bitta aksiya.
     *
     * @param slug aksiyaning URL uchun qisqa nomi
     * @param now  hozirgi vaqt
     * @return aksiya yoki bo'sh Optional
     */
    @Query("select p from Promotion p where " + VISIBLE + " and p.slug = :slug")
    Optional<Promotion> findVisibleBySlug(@Param("slug") String slug, @Param("now") LocalDateTime now);

    /**
     * Shu slug bilan o'chirilmagan aksiya borligini tekshiradi (yangi aksiyada takrorlanmasligi uchun).
     *
     * @param slug tekshiriladigan slug
     * @return bor bo'lsa true
     */
    boolean existsBySlugAndIsDeletedFalse(String slug);

    /**
     * Xuddi yuqoridagidek, lekin bitta aksiyani hisobga olmaydi (tahrirlashda o'zining slug'i bilan to'qnashmaslik uchun).
     *
     * @param slug tekshiriladigan slug
     * @param id   hisobga olinmaydigan aksiyaning raqami
     * @return boshqa aksiyada shu slug bor bo'lsa true
     */
    boolean existsBySlugAndIsDeletedFalseAndIdNot(String slug, Long id);
}