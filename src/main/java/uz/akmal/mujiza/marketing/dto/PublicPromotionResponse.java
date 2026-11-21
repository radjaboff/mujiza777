package uz.akmal.mujiza.marketing.dto;

import java.time.LocalDateTime;

/**
 * Mijoz saytiga qaytariladigan aksiya ma'lumoti (matnlar so'ralgan tilda).
 * Ro'yxatda, bosh sahifa bannerida va aksiya sahifasida bir xil shakl ishlatiladi.
 *
 * @param id             aksiyaning noyob raqami
 * @param title          sarlavha so'ralgan tilda
 * @param slug           URL uchun qisqa nom
 * @param summary        qisqa tavsif so'ralgan tilda
 * @param description    to'liq matn so'ralgan tilda
 * @param imageUrl       kompyuter uchun rasm
 * @param mobileImageUrl telefon uchun rasm (yo'q bo'lsa kompyuter rasmi qaytadi)
 * @param linkUrl        bosilganda olib boradigan manzil
 * @param activeTo       tugash vaqti (qolgan vaqt taymeri uchun), cheksiz bo'lsa null
 */
public record PublicPromotionResponse(
        Long id,
        String title,
        String slug,
        String summary,
        String description,
        String imageUrl,
        String mobileImageUrl,
        String linkUrl,
        LocalDateTime activeTo
) {
}