package uz.akmal.mujiza.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * Keshlash sozlamalari: ko'p so'raladigan ochiq ma'lumotlar 30 soniya xotirada saqlanadi.
 * Admin ma'lumotni o'zgartirganda tegishli kesh @CacheEvict bilan darrov tozalanadi.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /** Mijoz uchun kategoriyalar ro'yxati keshi. */
    public static final String CATEGORIES = "publicCategories";

    /** Mijoz uchun filiallar ro'yxati keshi. */
    public static final String BRANCHES = "publicBranches";

    /** Mijoz uchun aksiyalar va bannerlar keshi. */
    public static final String PROMOTIONS = "publicPromotions";

    /** Mijoz uchun mahsulot sahifasi keshi. */
    public static final String PRODUCT_DETAIL = "publicProduct";

    /** Mijoz katalogidagi filtrlangan va sahifalangan mahsulot ro'yxatlari. */
    public static final String PUBLIC_PRODUCTS = "publicProducts";

    /** Mijoz uchun tort konstruktori sozlamalari keshi. */
    public static final String CAKE_CONFIG = "publicCakeConfig";

    /** Ochiq do'kon sozlamalari (telefon, ish vaqti, yetkazish). */
    public static final String SHOP_SETTINGS = "shopSettings";

    /**
     * Kesh boshqaruvchisi: yozilgandan 30 soniyadan keyin eskiradi, eng ko'pi bilan 2000 ta yozuv saqlanadi.
     *
     * @return Caffeine asosidagi kesh boshqaruvchisi
     */
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager();
        manager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofSeconds(30))
                .maximumSize(2000));
        return manager;
    }
}
