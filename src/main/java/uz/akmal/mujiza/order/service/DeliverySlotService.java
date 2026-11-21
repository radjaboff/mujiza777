package uz.akmal.mujiza.order.service;

import uz.akmal.mujiza.order.dto.DeliverySlotRequest;
import uz.akmal.mujiza.order.dto.DeliverySlotResponse;
import uz.akmal.mujiza.order.dto.PublicDeliverySlotResponse;
import uz.akmal.mujiza.order.dto.SlotReservation;

import java.time.LocalDate;
import java.util.List;

/**
 * Vaqt oynalari bilan ishlash qoidalari. Controller va OrderService faqat shu interfeysni biladi.
 */
public interface DeliverySlotService {

    /**
     * Admin uchun: o'chirilmagan barcha oynalar.
     *
     * @return oynalar ro'yxati
     */
    List<DeliverySlotResponse> getAll();

    /**
     * Yangi oyna yaratadi.
     *
     * @param request admin yuborgan ma'lumot
     * @return yaratilgan oyna
     */
    DeliverySlotResponse create(DeliverySlotRequest request);

    /**
     * Mavjud oynani tahrirlaydi.
     *
     * @param id      oynaning raqami
     * @param request yangi ma'lumot
     * @return yangilangan oyna
     */
    DeliverySlotResponse update(Long id, DeliverySlotRequest request);

    /**
     * Oynani o'chiradi (soft delete). Eski buyurtmalardagi vaqt nusxasi o'zgarmaydi.
     *
     * @param id oynaning raqami
     */
    void delete(Long id);

    /**
     * Mijoz uchun: berilgan sanadagi faol oynalar, har birining bo'shligi bilan.
     *
     * @param date        sana (bugundan 14 kun ichida)
     * @param prepMinutes savatdagi mahsulotlarning eng uzoq tayyorlanish vaqti, daqiqalarda (yaqin oynalarni o'chirish uchun)
     * @return oynalar ro'yxati
     */
    List<PublicDeliverySlotResponse> getPublicSlots(LocalDate date, int prepMinutes);

    /**
     * Faol oyna mavjudmi (bor bo'lsa, yetkazishda oyna tanlash majburiy).
     *
     * @return bor bo'lsa true
     */
    boolean hasActiveSlots();

    /**
     * Buyurtma yaratilayotganda joyni band qiladi: oynani bloklaydi, sana, tayyorlanish vaqti va sig'imni qayta
     * tekshiradi. Buyurtma tranzaksiyasi ichida chaqirilishi kerak.
     *
     * @param slotId      tanlangan oyna
     * @param date        tanlangan sana
     * @param prepMinutes buyurtmadagi eng uzoq tayyorlanish vaqti, daqiqalarda
     * @return band qilingan oyna ma'lumoti (yaroqsiz bo'lsa BusinessException)
     */
    SlotReservation reserve(Long slotId, LocalDate date, int prepMinutes);
}