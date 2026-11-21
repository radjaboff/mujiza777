package uz.akmal.mujiza.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

/**
 * Diskka saqlangan rasmlarni brauzerga berish sozlamasi.
 * "/uploads/products/abc.png" so'rovi kelganda, rasm diskdagi uploads papkasidan olinadi.
 * Faqat local saqlash yoqilgan bo'lsa ishlaydi (bulutda rasmlar o'z manzilida turadi).
 *
 * @Configuration: bu klassda Spring uchun sozlamalar borligini bildiradi.
 * @ConditionalOnProperty: faqat sozlamada "local" tanlangan bo'lsagina ishga tushadi.
 */
@Configuration
@ConditionalOnProperty(name = "app.storage.type", havingValue = "local", matchIfMissing = true)
public class LocalStorageWebConfig implements WebMvcConfigurer {

    /**
     * Rasmlar saqlanadigan asosiy papkaning to'liq yo'li (LocalFileStorageService bilan bir xil sozlama).
     */
    private final Path rootDir;

    /**
     * Konstruktor: sozlamadagi yo'lni to'liq yo'lga aylantiradi.
     *
     * @param storagePath sozlamadagi papka yo'li (app.storage.local.path), standart "./uploads"
     */
    public LocalStorageWebConfig(@Value("${app.storage.local.path:./uploads}") String storagePath) {
        this.rootDir = Paths.get(storagePath).toAbsolutePath().normalize();
    }

    /**
     * "/uploads/**" manzillarini diskdagi papkaga bog'laydi.
     * Fayl nomlari tasodifiy (UUID) va o'zgarmaydi, shuning uchun brauzer ularni 30 kun saqlab turishi mumkin,
     * bu saytni tezlashtiradi.
     *
     * @param registry statik resurslarni ro'yxatdan o'tkazuvchi
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Papka manzili oxiri "/" bilan tugashi shart, aks holda Spring uni papka deb tanimaydi
        String location = rootDir.toUri().toString();
        if (!location.endsWith("/")) {
            location = location + "/";
        }
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location)
                .setCacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic());
    }
}