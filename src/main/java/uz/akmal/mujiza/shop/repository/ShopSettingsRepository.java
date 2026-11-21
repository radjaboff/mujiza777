package uz.akmal.mujiza.shop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.akmal.mujiza.shop.entity.ShopSettings;

/**
 * ShopSettings jadvali bilan ishlaydigan qatlam.
 * Jadvalda bitta qator bor, uni id = ShopSettings.SINGLE_ID bilan olamiz (findById).
 */
public interface ShopSettingsRepository extends JpaRepository<ShopSettings, Long> {
}