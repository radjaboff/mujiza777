package uz.akmal.mujiza.order.service;

import uz.akmal.mujiza.cake.dto.CakeOrderCreateRequest;
import uz.akmal.mujiza.common.PageResponse;
import uz.akmal.mujiza.order.dto.*;

import java.util.UUID;

/**
 * Buyurtmalar bilan ishlash qoidalari (biznes mantiq) ro'yxati.
 * Controller faqat shu interfeysni biladi, amalda ishlovchi klass esa OrderServiceImpl.
 * Keyingi qadamlarda admin ro'yxati, holatni o'zgartirish va kuzatish metodlari shu yerga qo'shiladi.
 */
public interface OrderService {

    /**
     * Mijozning yangi buyurtmasini qabul qiladi: tekshiradi, narxni hisoblaydi va saqlaydi.
     *
     * @param request mijoz yuborgan buyurtma ma'lumoti
     * @param lang    javob tili ("uz" yoki "ru")
     * @return yaratilgan buyurtma (raqami, kuzatuv kaliti, summalari bilan)
     */
    PublicOrderResponse create(OrderCreateRequest request, String lang, UUID idempotencyKey);


    /**
     * Admin panel uchun: buyurtmalar ro'yxati (filtr va sahifalash bilan), eng yangisi birinchi.
     *
     * @param filter filtr shartlari (holat, tur, qidiruv, sana)
     * @param page   sahifa raqami (0 dan boshlanadi)
     * @param size   bir sahifadagi buyurtmalar soni
     * @return sahifalangan buyurtmalar (qisqa ma'lumot)
     */
    PageResponse<OrderListItemResponse> getAll(OrderFilter filter, int page, int size);

    /**
     * Admin panel uchun: bitta buyurtmaning to'liq ma'lumoti (mahsulotlar va holatlar tarixi bilan).
     *
     * @param id buyurtmaning raqami
     * @return buyurtma (topilmasa ResourceNotFoundException)
     */
    OrderResponse getById(Long id);

    /**
     * Buyurtma holatini o'zgartiradi. Faqat ruxsat etilgan o'tishlar mumkin (sakrab bo'lmaydi),
     * bekor qilishda sabab majburiy.
     *
     * @param id        buyurtmaning raqami
     * @param request   yangi holat va izoh
     * @param changedBy o'zgartirgan admin yoki xodimning kirish nomi (tarixga yoziladi)
     * @return yangilangan buyurtma
     */
    OrderResponse updateStatus(Long id, OrderStatusUpdateRequest request, String changedBy);




    /**
     * Mijoz uchun: kuzatuv kaliti bo'yicha buyurtma holatini va tarixini qaytaradi.
     *
     * @param trackingToken buyurtma berilganda olingan kuzatuv kaliti
     * @param lang          javob tili ("uz" yoki "ru")
     * @return buyurtma ma'lumoti (topilmasa ResourceNotFoundException)
     */
    PublicOrderResponse track(String trackingToken, String lang);

    /**
     * Mijoz buyurtmani o'zi bekor qiladi. Faqat do'kon hali tasdiqlamagan buyurtmani bekor qilish mumkin.
     *
     * @param trackingToken buyurtmaning kuzatuv kaliti
     * @param request       bekor qilish sababi (null bo'lishi mumkin)
     * @param lang          javob tili ("uz" yoki "ru")
     * @return bekor qilingan buyurtma
     */
    PublicOrderResponse cancelByCustomer(String trackingToken, CustomerCancelRequest request, String lang);

    /**
     * Kuzatuv kaliti mavjudligini tekshiradi (real vaqt ulanishini ochishdan oldin).
     *
     * @param trackingToken buyurtmaning kuzatuv kaliti
     * @throws uz.akmal.mujiza.common.exception.ResourceNotFoundException kalit topilmasa
     */
    void verifyTrackingToken(String trackingToken);


    /**
     * Mijozning tort buyurtmasini qabul qiladi: tanlovni tekshiradi, narxni serverda hisoblaydi, vaqtni band qiladi
     * va buyurtmani "PRICE_PENDING" (narx tasdiqlanishi kutilmoqda) holatida saqlaydi.
     *
     * @param request mijoz yuborgan tort buyurtmasi
     * @param lang    javob tili ("uz" yoki "ru")
     * @return yaratilgan buyurtma
     */
    PublicOrderResponse createCakeOrder(CakeOrderCreateRequest request, String lang, UUID idempotencyKey);

    /**
     * Admin tort narxini tasdiqlaydi: yakuniy narxni belgilaydi (yoki hisoblanganini qoldiradi), yetkazish narxini
     * qayta hisoblaydi va buyurtmani "CONFIRMED" holatiga o'tkazadi.
     *
     * @param id        buyurtmaning raqami
     * @param request   yakuniy narx va izoh
     * @param changedBy tasdiqlagan adminning kirish nomi (tarixga yoziladi)
     * @return yangilangan buyurtma
     */
    OrderResponse confirmCakePrice(Long id, ConfirmPriceRequest request, String changedBy);

}
