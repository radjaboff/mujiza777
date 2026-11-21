package uz.akmal.mujiza.common;

import java.text.Normalizer;
import java.util.Locale;

/**
 * Matndan URL uchun qisqa nom (slug) yasaydigan yordamchi klass.
 * Misol: "Tug'ilgan kun tortlari" -> "tugilgan-kun-tortlari".
 * Faqat statik metod bor, shuning uchun obyekt yaratilmaydi.
 */
public final class SlugUtil {

    /**
     * Obyekt yaratishni taqiqlaydi (private konstruktor), klass faqat statik ishlatiladi.
     */
    private SlugUtil() {
    }

    /**
     * Matnni slug'ga aylantiradi: kichik harflar, lotin harflari va raqamlar, so'zlar orasida chiziqcha.
     * Apostroflar (o', g', tug'ilgan) shunchaki olib tashlanadi, aksentli harflar oddiyga almashtiriladi.
     * Lotin harfi yoki raqam umuman bo'lmasa (masalan, faqat kirill matn), bo'sh qator qaytadi.
     *
     * @param text asl matn (masalan, kategoriya nomi)
     * @return slug yoki bo'sh qator
     */
    public static String toSlug(String text) {
        // Matn yo'q bo'lsa, slug ham yo'q
        if (text == null) {
            return "";
        }
        // Barcha turdagi apostroflarni olib tashlaymiz (o', o‘, o’, ʻ, ʼ, `)
        String cleaned = text.replaceAll("[''‘’ʻʼ`]", "");
        // Aksentli harflarni asosiy harf va belgiga ajratamiz, keyin belgilarni o'chiramiz
        cleaned = Normalizer.normalize(cleaned, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        // Kichik harflarga o'tkazamiz
        cleaned = cleaned.toLowerCase(Locale.ROOT);
        // Lotin harfi va raqam bo'lmagan hamma belgi (bo'sh joy, tinish belgilari) bitta chiziqchaga almashadi
        cleaned = cleaned.replaceAll("[^a-z0-9]+", "-");
        // Boshi va oxiridagi ortiqcha chiziqchalarni olib tashlaymiz
        return cleaned.replaceAll("^-+|-+$", "");
    }
}