package uz.akmal.mujiza.marketing.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import uz.akmal.mujiza.marketing.entity.PromoCode;

import java.util.List;
import java.util.Optional;

/**
 * PromoCode jadvali bilan ishlaydigan qatlam (bazadan o'qish va yozish).
 * Soft delete bor, shuning uchun hamma metod o'chirilgan kodlarni o'tkazib yuboradi.
 */
public interface PromoCodeRepository extends JpaRepository<PromoCode, Long> {

    /**
     * Admin panel uchun: o'chirilmagan barcha kodlar, eng yangisi birinchi.
     *
     * @return kodlar ro'yxati
     */
    List<PromoCode> findAllByIsDeletedFalseOrderByIdDesc();

    /**
     * id bo'yicha bitta o'chirilmagan kodni topadi.
     *
     * @param id kodning raqami
     * @return kod yoki bo'sh Optional
     */
    Optional<PromoCode> findByIdAndIsDeletedFalse(Long id);

    /**
     * Kod matni bo'yicha o'chirilmagan kodni topadi (kod KATTA harflarda berilishi kerak).
     *
     * @param code kod matni
     * @return kod yoki bo'sh Optional
     */
    Optional<PromoCode> findByCodeAndIsDeletedFalse(String code);

    /**
     * Kod matni bo'yicha topadi va bazada BLOKLAB oladi: bir vaqtda ikki mijoz oxirgi qolgan foydalanishni
     * ishlatib yubormasligi uchun (ikkinchisi birinchisi tugashini kutadi va yangilangan sonni ko'radi).
     *
     * @param code kod matni (KATTA harflarda)
     * @return kod yoki bo'sh Optional
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from PromoCode p where p.code = :code and p.isDeleted = false")
    Optional<PromoCode> findByCodeForUpdate(@Param("code") String code);

    /**
     * Shu matn bilan o'chirilmagan kod borligini tekshiradi (yangi kod yaratishda takrorlanmasligi uchun).
     *
     * @param code kod matni (KATTA harflarda)
     * @return bor bo'lsa true
     */
    boolean existsByCodeAndIsDeletedFalse(String code);
}