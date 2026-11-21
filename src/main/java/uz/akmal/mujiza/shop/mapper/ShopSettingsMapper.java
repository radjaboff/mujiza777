package uz.akmal.mujiza.shop.mapper;

import org.springframework.stereotype.Component;
import uz.akmal.mujiza.shop.dto.PublicShopSettingsResponse;
import uz.akmal.mujiza.shop.dto.ShopSettingsRequest;
import uz.akmal.mujiza.shop.dto.ShopSettingsResponse;
import uz.akmal.mujiza.shop.entity.ShopSettings;

/**
 * ShopSettings entity bilan DTO'larni bir-biriga aylantiradi.
 */
@Component
public class ShopSettingsMapper {

    /**
     * Admin yuborgan ma'lumotni mavjud sozlamalarga ko'chiradi.
     * Hamma maydon almashtiriladi (bo'sh qoldirilgan ixtiyoriy maydonlar tozalanadi).
     *
     * @param settings yangilanadigan sozlamalar
     * @param request  admin yuborgan yangi ma'lumot
     */
    public void applyRequest(ShopSettings settings, ShopSettingsRequest request) {
        settings.setPhone(request.phone());
        settings.setOpenTime(request.openTime());
        settings.setCloseTime(request.closeTime());
        settings.setAcceptingOrders(request.acceptingOrders());
        settings.setDeliveryEnabled(request.deliveryEnabled());
        settings.setDeliveryFee(request.deliveryFee());
        settings.setFreeDeliveryFrom(request.freeDeliveryFrom());
        settings.setMinOrderAmount(request.minOrderAmount());
        settings.setCakeMinAdvanceHours(request.cakeMinAdvanceHours());
        settings.setTelegramUrl(request.telegramUrl());
        settings.setInstagramUrl(request.instagramUrl());
        // Mavzu yuborilmasa (null), hozirgisi o'zgarmaydi
        if (request.seasonTheme() != null) {
            settings.setSeasonTheme(request.seasonTheme());
        }
    }

    /**
     * Sozlamalardan admin panel uchun javob yasaydi.
     *
     * @param settings bazadan olingan sozlamalar
     * @return admin panelga qaytariladigan DTO
     */
    public ShopSettingsResponse toResponse(ShopSettings settings) {
        return new ShopSettingsResponse(
                settings.getPhone(),
                settings.getOpenTime(),
                settings.getCloseTime(),
                settings.getAcceptingOrders(),
                settings.getDeliveryEnabled(),
                settings.getDeliveryFee(),
                settings.getFreeDeliveryFrom(),
                settings.getMinOrderAmount(),
                settings.getCakeMinAdvanceHours(),
                settings.getTelegramUrl(),
                settings.getInstagramUrl(),
                settings.getUpdatedAt(),
                settings.getSeasonTheme()
        );
    }

    /**
     * Sozlamalardan mijoz sayti uchun javob yasaydi.
     *
     * @param settings  bazadan olingan sozlamalar
     * @param isOpenNow do'kon hozir ochiqmi (Service hisoblab beradi)
     * @return mijoz saytiga qaytariladigan DTO
     */
    public PublicShopSettingsResponse toPublicResponse(ShopSettings settings, boolean isOpenNow) {
        return new PublicShopSettingsResponse(
                settings.getPhone(),
                settings.getOpenTime(),
                settings.getCloseTime(),
                isOpenNow,
                settings.getAcceptingOrders(),
                settings.getDeliveryEnabled(),
                settings.getDeliveryFee(),
                settings.getFreeDeliveryFrom(),
                settings.getMinOrderAmount(),
                settings.getCakeMinAdvanceHours(),
                settings.getTelegramUrl(),
                settings.getInstagramUrl(),
                settings.getSeasonTheme()
        );
    }
}