package uz.akmal.mujiza.order.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import uz.akmal.mujiza.order.entity.DeliverySlot;

import java.util.List;
import java.util.Optional;

/**
 * DeliverySlot jadvali bilan ishlaydigan qatlam. Soft delete bor, o'chirilgan oynalar o'tkazib yuboriladi.
 */
public interface DeliverySlotRepository extends JpaRepository<DeliverySlot, Long> {

    /**
     * Admin uchun: o'chirilmagan barcha oynalar, boshlanish vaqti bo'yicha.
     *
     * @return oynalar ro'yxati
     */
    List<DeliverySlot> findAllByIsDeletedFalseOrderByStartTimeAsc();

    /**
     * Mijoz uchun: faqat faol va o'chirilmagan oynalar, boshlanish vaqti bo'yicha.
     *
     * @return oynalar ro'yxati
     */
    List<DeliverySlot> findAllByIsDeletedFalseAndIsActiveTrueOrderByStartTimeAsc();

    /**
     * id bo'yicha o'chirilmagan oynani topadi.
     *
     * @param id oynaning raqami
     * @return oyna yoki bo'sh Optional
     */
    Optional<DeliverySlot> findByIdAndIsDeletedFalse(Long id);

    /**
     * Kamida bitta faol oyna borligini tekshiradi (bor bo'lsa, yetkazishda oyna tanlash majburiy).
     *
     * @return bor bo'lsa true
     */
    boolean existsByIsDeletedFalseAndIsActiveTrue();

    /**
     * Oynani topadi va bazada BLOKLAB oladi: ikki mijoz bir vaqtda oxirgi qolgan joyni olib qo'ymasligi uchun
     * (ikkinchisi birinchisi tugashini kutadi va yangi bandlikni ko'radi).
     *
     * @param id oynaning raqami
     * @return oyna yoki bo'sh Optional
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from DeliverySlot s where s.id = :id and s.isDeleted = false")
    Optional<DeliverySlot> findByIdForUpdate(@Param("id") Long id);
}