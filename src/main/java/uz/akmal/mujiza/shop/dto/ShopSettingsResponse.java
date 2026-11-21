package uz.akmal.mujiza.shop.dto;

import uz.akmal.mujiza.shop.enums.SeasonTheme;

import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Admin panelga qaytariladigan do'kon sozlamalari.
 *
 * @param phone               telefon raqami
 * @param openTime            ochilish soati
 * @param closeTime           yopilish soati
 * @param acceptingOrders     onlayn buyurtma qabul qilinyaptimi
 * @param deliveryEnabled     yetkazib berish yoqilganmi
 * @param deliveryFee         yetkazib berish narxi, so'mda
 * @param freeDeliveryFrom    bepul yetkazish chegarasi (yo'q bo'lsa null)
 * @param minOrderAmount      minimal buyurtma summasi
 * @param cakeMinAdvanceHours tortga oldindan buyurtma muddati, soatlarda
 * @param telegramUrl         Telegram sahifasi manzili
 * @param instagramUrl        Instagram sahifasi manzili
 * @param updatedAt           oxirgi o'zgartirilgan vaqt
 * @param seasonTheme         sayt mavsumiy mavzusi
 */
public record ShopSettingsResponse(
        String phone,
        LocalTime openTime,
        LocalTime closeTime,
        Boolean acceptingOrders,
        Boolean deliveryEnabled,
        Long deliveryFee,
        Long freeDeliveryFrom,
        Long minOrderAmount,
        Integer cakeMinAdvanceHours,
        String telegramUrl,
        String instagramUrl,
        LocalDateTime updatedAt,
        SeasonTheme seasonTheme
) {
}