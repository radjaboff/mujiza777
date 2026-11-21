package uz.akmal.mujiza.catalog.dto;

import uz.akmal.mujiza.catalog.enums.Allergen;
import uz.akmal.mujiza.catalog.enums.DietTag;

import java.util.Set;

/**
 * Mahsulotlar ro'yxatini filtrlash shartlari (URL parametrlaridan to'ldiriladi).
 * Hamma maydon ixtiyoriy: yuborilmagan (null) shart hisobga olinmaydi.
 * Masalan: /api/public/products?categorySlug=tortlar&maxPrice=300000&excludeAllergens=NUTS
 *
 * @param categoryId       faqat shu kategoriyadagi mahsulotlar (raqami bo'yicha, admin uchun qulay)
 * @param categorySlug     faqat shu kategoriyadagi mahsulotlar (slug bo'yicha, mijoz sayti uchun)
 * @param search           nomi bo'yicha qidiruv matni (o'zbekcha yoki ruscha nomdan qidiriladi)
 * @param minPrice         eng kam narx, so'mda
 * @param maxPrice         eng ko'p narx, so'mda
 * @param excludeAllergens shu allergenlari BO'LMAGAN mahsulotlar (masalan, NUTS: yong'oqsiz)
 * @param diets            shu parhez belgilarining HAMMASI bor mahsulotlar (masalan, SUGAR_FREE)
 * @param popular          true bo'lsa faqat "Mashhur" mahsulotlar
 * @param isNew            true bo'lsa faqat "Yangi" mahsulotlar
 * @param discounted       true bo'lsa faqat hozir chegirmada turgan mahsulotlar
 * @param available        true yoki false: sotuvda bor yoki yo'q mahsulotlar (admin uchun foydali)
 */
public record ProductFilter(
        Long categoryId,
        String categorySlug,
        String search,
        Long minPrice,
        Long maxPrice,
        Set<Allergen> excludeAllergens,
        Set<DietTag> diets,
        Boolean popular,
        Boolean isNew,
        Boolean discounted,
        Boolean available
) {
}