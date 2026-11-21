package uz.akmal.mujiza.shop.service;

import uz.akmal.mujiza.shop.dto.PublicShopSettingsResponse;
import uz.akmal.mujiza.shop.dto.ShopSettingsRequest;
import uz.akmal.mujiza.shop.dto.ShopSettingsResponse;

/**
 * Do'kon sozlamalari bilan ishlash qoidalari.
 * Sozlamalar bitta qator bo'lgani uchun yaratish yoki o'chirish yo'q, faqat o'qish va yangilash.
 */
public interface ShopSettingsService {

    /**
     * Admin panel uchun: barcha sozlamalarni qaytaradi.
     *
     * @return joriy sozlamalar
     */
    ShopSettingsResponse get();

    /**
     * Sozlamalarni yangilaydi (hamma maydon to'liq almashtiriladi).
     *
     * @param request admin yuborgan yangi sozlamalar
     * @return yangilangan sozlamalar
     */
    ShopSettingsResponse update(ShopSettingsRequest request);

    /**
     * Mijoz sayti uchun: ochiq sozlamalar va "do'kon hozir ochiqmi" holati.
     *
     * @return mijozga ko'rinadigan sozlamalar
     */
    PublicShopSettingsResponse getPublic();
}