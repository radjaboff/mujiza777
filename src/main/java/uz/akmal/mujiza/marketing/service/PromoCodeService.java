package uz.akmal.mujiza.marketing.service;

import uz.akmal.mujiza.marketing.dto.PromoApplication;
import uz.akmal.mujiza.marketing.dto.PromoCodeRequest;
import uz.akmal.mujiza.marketing.dto.PromoCodeResponse;
import uz.akmal.mujiza.marketing.dto.PromoValidateRequest;
import uz.akmal.mujiza.marketing.dto.PromoValidateResponse;

import java.util.List;

/**
 * Promo kodlar bilan ishlash qoidalari (biznes mantiq) ro'yxati.
 * Controller faqat shu interfeysni biladi, amalda ishlovchi klass esa PromoCodeServiceImpl.
 */
public interface PromoCodeService {

    /**
     * Admin panel uchun: o'chirilmagan barcha promo kodlar.
     *
     * @return kodlar ro'yxati
     */
    List<PromoCodeResponse> getAll();

    /**
     * Admin panel uchun: bitta kodni id bo'yicha oladi.
     *
     * @param id kodning raqami
     * @return kod ma'lumoti (topilmasa ResourceNotFoundException)
     */
    PromoCodeResponse getById(Long id);

    /**
     * Yangi promo kod yaratadi.
     *
     * @param request admin yuborgan ma'lumot
     * @return yaratilgan kod
     */
    PromoCodeResponse create(PromoCodeRequest request);

    /**
     * Mavjud promo kodni tahrirlaydi. Kod matnini o'zgartirib bo'lmaydi (yangi kod yaratiladi).
     *
     * @param id      tahrirlanayotgan kodning raqami
     * @param request yangi ma'lumot
     * @return yangilangan kod
     */
    PromoCodeResponse update(Long id, PromoCodeRequest request);

    /**
     * Promo kodni o'chiradi (soft delete): bazadan o'chmaydi, faqat o'chirilgan deb belgilanadi.
     *
     * @param id o'chiriladigan kodning raqami
     */
    void delete(Long id);

    /**
     * Mijoz uchun: kod berilgan summada ishlaydimi va qancha chegirma beradi, shuni aytadi.
     * Faqat oldindan ko'rish: hech narsani o'zgartirmaydi (foydalanish soni oshmaydi).
     * Kod yaroqsiz bo'lsa ham xato tashlanmaydi: javobda valid = false va sabab keladi.
     *
     * @param request kod, mahsulotlar summasi va (ixtiyoriy) telefon
     * @return tekshiruv natijasi
     */
    PromoValidateResponse validate(PromoValidateRequest request);

    /**
     * Buyurtma yaratilayotganda kodni haqiqatan qo'llaydi: bazada bloklab, hamma shartni qayta tekshiradi,
     * foydalanish sonini 1 ga oshiradi va chegirmani qaytaradi. Buyurtma tranzaksiyasi ichida chaqirilishi kerak:
     * buyurtma saqlanmasa, foydalanish soni ham orqaga qaytadi.
     *
     * @param code          mijoz kiritgan kod
     * @param itemsTotal    buyurtmadagi mahsulotlarning haqiqiy summasi, so'mda
     * @param customerPhone mijozning telefon raqami ("birinchi buyurtma" sharti uchun)
     * @return qo'llangan kod va chegirma summasi (kod yaroqsiz bo'lsa BusinessException)
     */
    PromoApplication apply(String code, long itemsTotal, String customerPhone);


    /**
     * Buyurtma bekor qilinganda promo kodning foydalanish sonini 1 ga kamaytiradi (kod yana ishlatilishi mumkin bo'ladi).
     * Kod topilmasa (masalan, keyin o'chirilgan bo'lsa) jim o'tkazadi.
     *
     * @param code buyurtmaga qo'llangan kod
     */
    void release(String code);
}