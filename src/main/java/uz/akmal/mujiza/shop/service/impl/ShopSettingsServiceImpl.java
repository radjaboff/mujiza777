package uz.akmal.mujiza.shop.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.akmal.mujiza.audit.service.AuditService;
import uz.akmal.mujiza.config.CacheConfig;
import uz.akmal.mujiza.shop.dto.PublicShopSettingsResponse;
import uz.akmal.mujiza.shop.dto.ShopSettingsRequest;
import uz.akmal.mujiza.shop.dto.ShopSettingsResponse;
import uz.akmal.mujiza.shop.entity.ShopSettings;
import uz.akmal.mujiza.shop.mapper.ShopSettingsMapper;
import uz.akmal.mujiza.shop.repository.ShopSettingsRepository;
import uz.akmal.mujiza.shop.service.ShopSettingsService;

import java.time.LocalTime;
import java.time.ZoneId;

/**
 * Do'kon sozlamalari bilan ishlash qoidalarining amaldagi ijrosi.
 *
 * @Service: Spring bu klassni "biznes mantiq qatlami" sifatida taniydi.
 * @RequiredArgsConstructor (Lombok): final maydonlar uchun konstruktor yaratadi.
 * @Slf4j (Lombok): log yozish uchun "log" o'zgaruvchisini yaratadi.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ShopSettingsServiceImpl implements ShopSettingsService {

    /**
     * Do'kon joylashgan vaqt zonasi: "hozir ochiqmi" hisobi shu zona bo'yicha qilinadi.
     */
    private static final ZoneId SHOP_ZONE = ZoneId.of("Asia/Tashkent");

    /**
     * Bazadan sozlamalarni o'qish va yozish uchun.
     */
    private final ShopSettingsRepository shopSettingsRepository;

    /**
     * Entity va DTO'ni bir-biriga aylantirish uchun.
     */
    private final ShopSettingsMapper shopSettingsMapper;

    /**
     * Muhim o'zgarishlarni tarixga yozish uchun.
     */
    private final AuditService auditService;

    /**
     * {@inheritDoc}
     * readOnly = true: faqat o'qiladi, baza tezroq ishlaydi.
     */
    @Override
    @Transactional(readOnly = true)
    public ShopSettingsResponse get() {
        return shopSettingsMapper.toResponse(load());
    }

    /**
     * {@inheritDoc}
     * @Transactional: ichidagi barcha ishlar bitta tranzaksiya, xato bo'lsa hammasi bekor qilinadi.
     */
    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(cacheNames = CacheConfig.CAKE_CONFIG, allEntries = true),
            @CacheEvict(cacheNames = CacheConfig.SHOP_SETTINGS, allEntries = true)
    })
    public ShopSettingsResponse update(ShopSettingsRequest request) {
        // Mavjud yagona qatorni topamiz va yangi qiymatlarni ko'chiramiz
        ShopSettings settings = load();
        shopSettingsMapper.applyRequest(settings, request);
        ShopSettings saved = shopSettingsRepository.save(settings);
        log.info("Do'kon sozlamalari yangilandi");
        auditService.log("SETTINGS_UPDATED", "SETTINGS", ShopSettings.SINGLE_ID, "Do'kon sozlamalari yangilandi");
        return shopSettingsMapper.toResponse(saved);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = CacheConfig.SHOP_SETTINGS, key = "'public'")
    public PublicShopSettingsResponse getPublic() {
        ShopSettings settings = load();
        // Hozirgi vaqtni Toshkent vaqti bo'yicha olamiz va do'kon ochiq-yopiqligini hisoblaymiz
        boolean openNow = isOpenAt(settings, LocalTime.now(SHOP_ZONE));
        return shopSettingsMapper.toPublicResponse(settings, openNow);
    }

    /**
     * Yordamchi metod: sozlamalar qatorini bazadan oladi.
     * Qator migratsiya orqali yaratilgan, shuning uchun u bo'lmasa, bu dastur xatosi (admin xatosi emas).
     *
     * @return sozlamalar
     */
    private ShopSettings load() {
        return shopSettingsRepository.findById(ShopSettings.SINGLE_ID)
                .orElseThrow(() -> new IllegalStateException(
                        "Do'kon sozlamalari bazada topilmadi (V6 migratsiyasini tekshiring)"));
    }

    /**
     * Yordamchi metod: berilgan vaqtda do'kon ochiqmi, shuni aytadi.
     * Uch holat:
     * 1) Ochilish va yopilish soati bir xil bo'lsa: do'kon sutkasiga 24 soat ochiq.
     * 2) Oddiy kun (masalan, 09:00 dan 22:00 gacha): ochilishdan keyin va yopilishdan oldin.
     * 3) Tungi ish vaqti (masalan, 20:00 dan 02:00 gacha): ochilishdan keyin YOKI yopilishdan oldin.
     *
     * @param settings do'kon sozlamalari
     * @param now      tekshiriladigan vaqt
     * @return ochiq bo'lsa true
     */
    private boolean isOpenAt(ShopSettings settings, LocalTime now) {
        LocalTime open = settings.getOpenTime();
        LocalTime close = settings.getCloseTime();
        // 24 soat ochiq
        if (open.equals(close)) {
            return true;
        }
        // Oddiy kun ichidagi ish vaqti
        if (open.isBefore(close)) {
            return !now.isBefore(open) && now.isBefore(close);
        }
        // Tungi ish vaqti: yarim tundan oshib o'tadi
        return !now.isBefore(open) || now.isBefore(close);
    }
}