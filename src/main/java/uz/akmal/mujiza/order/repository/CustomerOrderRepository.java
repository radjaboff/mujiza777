package uz.akmal.mujiza.order.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import uz.akmal.mujiza.order.entity.CustomerOrder;
import uz.akmal.mujiza.order.enums.OrderStatus;

import java.time.LocalDate;
import java.util.Optional;

/**
 * Buyurtmalar bilan ishlaydigan qatlam (bazadan o'qish va yozish).
 * JpaSpecificationExecutor: admin ro'yxatida holat, sana, telefon kabi filtrlarni birlashtirish uchun.
 */
public interface CustomerOrderRepository
        extends JpaRepository<CustomerOrder, Long>, JpaSpecificationExecutor<CustomerOrder> {

    /**
     * Kuzatuv kaliti (token) bo'yicha buyurtmani topadi (mijoz kuzatuv sahifasi uchun).
     *
     * @param trackingToken tasodifiy kuzatuv kaliti
     * @return buyurtma yoki bo'sh Optional
     */
    Optional<CustomerOrder> findByTrackingToken(String trackingToken);

    Optional<CustomerOrder> findByIdempotencyKey(String idempotencyKey);

    /**
     * Bazadagi hisoblagichdan (order_number_seq) keyingi buyurtma raqamini oladi: 1001, 1002, ...
     * Hisoblagich bir vaqtda kelgan buyurtmalarga ham takrorlanmaydigan raqam beradi.
     *
     * @return keyingi raqam
     */
    @Query(value = "SELECT nextval('order_number_seq')", nativeQuery = true)
    Long nextOrderNumber();


    /**
     * Berilgan telefon raqamidan, berilgan holatda nechta buyurtma borligini sanaydi.
     * Spamdan himoya uchun: bitta raqamdan ko'p "yangi" (hali ko'rilmagan) buyurtma yuborilishini cheklaymiz.
     *
     * @param customerPhone mijozning telefon raqami
     * @param status        sanaladigan holat
     * @return buyurtmalar soni
     */
    long countByCustomerPhoneAndStatus(String customerPhone, OrderStatus status);


    /**
     * Buyurtmani id bo'yicha topadi va bazada BLOKLAB oladi (tranzaksiya tugaguncha boshqa hech kim o'zgartira olmaydi).
     * Holatni o'zgartirishda ikki xodim bir vaqtda bosib yuborsa, ikkinchisi birinchisi tugashini kutadi
     * va yangilangan holatni ko'radi.
     *
     * @param id buyurtmaning raqami
     * @return buyurtma yoki bo'sh Optional
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from CustomerOrder o where o.id = :id")
    Optional<CustomerOrder> findByIdForUpdate(@Param("id") Long id);



    /**
     * Kuzatuv kaliti bo'yicha buyurtmani topadi va bazada BLOKLAB oladi (mijoz bekor qilayotganda
     * admin bir vaqtda holatni o'zgartirib yubormasligi uchun).
     *
     * @param trackingToken tasodifiy kuzatuv kaliti
     * @return buyurtma yoki bo'sh Optional
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from CustomerOrder o where o.trackingToken = :token")
    Optional<CustomerOrder> findByTrackingTokenForUpdate(@Param("token") String trackingToken);



    /**
     * Shu kuzatuv kaliti bilan buyurtma borligini tekshiradi (butun buyurtmani yuklamasdan).
     *
     * @param trackingToken kuzatuv kaliti
     * @return bor bo'lsa true
     */
    boolean existsByTrackingToken(String trackingToken);





    /**
     * Shu telefon raqamidan, berilgan holatdan BOSHQA holatdagi buyurtma borligini tekshiradi.
     * Promo kodning "faqat birinchi buyurtma" sharti uchun: bekor qilingan buyurtmalar hisobga olinmaydi.
     *
     * @param customerPhone mijozning telefon raqami
     * @param status        hisobga olinmaydigan holat (CANCELLED)
     * @return shunday buyurtma bor bo'lsa true
     */
    boolean existsByCustomerPhoneAndStatusNot(String customerPhone, OrderStatus status);





    /**
     * Berilgan oyna va sanada, berilgan holatdan BOSHQA holatdagi buyurtmalar sonini sanaydi
     * (bekor qilinganlar joyni band qilmaydi).
     *
     * @param slotId        oynaning raqami
     * @param scheduledDate sana
     * @param status        hisobga olinmaydigan holat (CANCELLED)
     * @return band joylar soni
     */
    long countBySlotIdAndScheduledDateAndStatusNot(Long slotId, LocalDate scheduledDate, OrderStatus status);

    /** Returns capacity usage for all requested slots in one grouped query. */
    @Query("select o.slotId as slotId, count(o.id) as taken from CustomerOrder o " +
            "where o.slotId in :slotIds and o.scheduledDate = :date and o.status <> :cancelled " +
            "group by o.slotId")
    java.util.List<SlotUsage> countSlotUsage(@Param("slotIds") java.util.Collection<Long> slotIds,
                                             @Param("date") LocalDate date,
                                             @Param("cancelled") OrderStatus cancelled);

    interface SlotUsage {
        Long getSlotId();
        Long getTaken();
    }
}
