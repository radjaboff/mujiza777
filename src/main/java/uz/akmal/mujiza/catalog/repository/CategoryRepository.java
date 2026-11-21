package uz.akmal.mujiza.catalog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.akmal.mujiza.catalog.entity.Category;

import java.util.List;
import java.util.Optional;

/**
 * Category jadvali bilan ishlaydigan qatlam (bazadan o'qish va yozish).
 * JpaRepository tayyor metodlarni beradi: save, findById, findAll, delete va hokazo.
 * Quyidagi qo'shimcha metodlarni Spring metod nomiga qarab o'zi SQL'ga aylantiradi,
 * biz SQL yozmaymiz.
 *
 * Eslatma: bizda soft delete bor, shuning uchun hamma metod "IsDeletedFalse" bilan
 * o'chirilgan kategoriyalarni o'tkazib yuboradi.
 */
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * Admin panel uchun: o'chirilmagan BARCHA kategoriyalar (faol va yashirinlari ham),
     * saytda ko'rsatish tartibi bo'yicha.
     *
     * @return o'chirilmagan kategoriyalar ro'yxati, sortOrder o'sish tartibida
     */
    List<Category> findAllByIsDeletedFalseOrderBySortOrderAsc();

    /**
     * Mijoz sayti uchun: faqat o'chirilmagan VA faol (ko'rinadigan) kategoriyalar,
     * saytda ko'rsatish tartibi bo'yicha.
     *
     * @return mijozga ko'rinadigan kategoriyalar ro'yxati
     */
    List<Category> findAllByIsDeletedFalseAndIsActiveTrueOrderBySortOrderAsc();

    /**
     * id bo'yicha bitta o'chirilmagan kategoriyani topadi.
     * Optional: topilmasa bo'sh qaytadi (xatosiz), uni service'da tekshiramiz.
     *
     * @param id kategoriyaning raqami
     * @return kategoriya yoki bo'sh Optional
     */
    Optional<Category> findByIdAndIsDeletedFalse(Long id);

    /**
     * slug bo'yicha bitta o'chirilmagan kategoriyani topadi
     * (mijoz sayti /katalog/tortlar manzilini ochganda ishlatiladi).
     *
     * @param slug kategoriyaning URL uchun qisqa nomi
     * @return kategoriya yoki bo'sh Optional
     */
    Optional<Category> findBySlugAndIsDeletedFalse(String slug);

    /**
     * Shu slug bilan o'chirilmagan kategoriya borligini tekshiradi.
     * Yangi kategoriya yaratishda slug takrorlanmasligi uchun ishlatiladi.
     *
     * @param slug tekshiriladigan slug
     * @return bor bo'lsa true
     */
    boolean existsBySlugAndIsDeletedFalse(String slug);

    /**
     * Xuddi yuqoridagidek, lekin bitta kategoriyani hisobga olmaydi.
     * Kategoriyani tahrirlaganda o'zining slug'i bilan to'qnashmaslik uchun kerak.
     *
     * @param slug tekshiriladigan slug
     * @param id   hisobga olinmaydigan (tahrirlanayotgan) kategoriyaning raqami
     * @return boshqa kategoriyada shu slug bor bo'lsa true
     */
    boolean existsBySlugAndIsDeletedFalseAndIdNot(String slug, Long id);
}