package uz.akmal.mujiza.catalog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import uz.akmal.mujiza.catalog.entity.Product;

import java.util.Optional;

/**
 * Product jadvali bilan ishlaydigan qatlam (bazadan o'qish va yozish).
 *
 * JpaRepository: tayyor metodlarni beradi (save, findById, findAll va hokazo).
 * JpaSpecificationExecutor: dinamik filtrlar bilan qidirish imkonini beradi
 * (kategoriya, narx, allergen, qidiruv matni kabi shartlarni xohlagancha birlashtirish).
 * Bunday qidiruv shartlarini keyingi qadamda ProductSpecifications klassida yozamiz.
 *
 * Eslatma: soft delete bor, shuning uchun hamma metod "IsDeletedFalse" bilan
 * o'chirilgan mahsulotlarni o'tkazib yuboradi.
 */
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    /**
     * id bo'yicha bitta o'chirilmagan mahsulotni topadi.
     * Optional: topilmasa bo'sh qaytadi (xatosiz), uni service'da tekshiramiz.
     *
     * @param id mahsulotning raqami
     * @return mahsulot yoki bo'sh Optional
     */
    Optional<Product> findByIdAndIsDeletedFalse(Long id);

    /**
     * slug bo'yicha bitta o'chirilmagan mahsulotni topadi
     * (mijoz sayti /mahsulot/napoleon-torti manzilini ochganda ishlatiladi).
     *
     * @param slug mahsulotning URL uchun qisqa nomi
     * @return mahsulot yoki bo'sh Optional
     */
    Optional<Product> findBySlugAndIsDeletedFalse(String slug);

    /**
     * Shu slug bilan o'chirilmagan mahsulot borligini tekshiradi.
     * Yangi mahsulot yaratishda slug takrorlanmasligi uchun ishlatiladi.
     *
     * @param slug tekshiriladigan slug
     * @return bor bo'lsa true
     */
    boolean existsBySlugAndIsDeletedFalse(String slug);

    /**
     * Xuddi yuqoridagidek, lekin bitta mahsulotni hisobga olmaydi.
     * Mahsulotni tahrirlaganda o'zining slug'i bilan to'qnashmaslik uchun kerak.
     *
     * @param slug tekshiriladigan slug
     * @param id   hisobga olinmaydigan (tahrirlanayotgan) mahsulotning raqami
     * @return boshqa mahsulotda shu slug bor bo'lsa true
     */
    boolean existsBySlugAndIsDeletedFalseAndIdNot(String slug, Long id);

    /**
     * Kategoriyada o'chirilmagan mahsulot bor-yo'qligini tekshiradi.
     * Mahsuloti bor kategoriyani o'chirishga yo'l qo'ymaslik uchun ishlatiladi.
     *
     * @param categoryId kategoriyaning raqami
     * @return kategoriyada kamida bitta mahsulot bo'lsa true
     */
    boolean existsByCategoryIdAndIsDeletedFalse(Long categoryId);
}