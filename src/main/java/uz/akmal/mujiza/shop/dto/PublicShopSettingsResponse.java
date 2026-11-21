package uz.akmal.mujiza.shop.dto;

import uz.akmal.mujiza.shop.enums.SeasonTheme;

import java.time.LocalTime;

/**
 * Mijoz saytiga qaytariladigan ochiq sozlamalar (sayt tepasi, footer, savat va buyurtma sahifasi uchun).
 *
 * @param phone               do'kon telefon raqami
 * @param openTime            ochilish soati
 * @param closeTime           yopilish soati
 * @param isOpenNow           do'kon HOZIR ochiqmi (server Toshkent vaqti bo'yicha hisoblaydi)
 * @param acceptingOrders     onlayn buyurtma qabul qilinyaptimi (false bo'lsa, buyurtma tugmasi o'chiriladi)
 * @param deliveryEnabled     yetkazib berish yoqilganmi
 * @param deliveryFee         yetkazib berish narxi, so'mda
 * @param freeDeliveryFrom    bepul yetkazish chegarasi (yo'q bo'lsa null)
 * @param minOrderAmount      minimal buyurtma summasi
 * @param cakeMinAdvanceHours tortga oldindan buyurtma muddati, soatlarda
 * @param telegramUrl         Telegram sahifasi manzili
 * @param instagramUrl        Instagram sahifasi manzili
 * @param seasonTheme         sayt mavsumiy mavzusi (frontend ranglarni shunga qarab o'zgartiradi)
 */
public record PublicShopSettingsResponse(
        String phone,
        LocalTime openTime,
        LocalTime closeTime,
        Boolean isOpenNow,
        Boolean acceptingOrders,
        Boolean deliveryEnabled,
        Long deliveryFee,
        Long freeDeliveryFrom,
        Long minOrderAmount,
        Integer cakeMinAdvanceHours,
        String telegramUrl,
        String instagramUrl,
        SeasonTheme seasonTheme
) {
}