package uz.akmal.mujiza.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger (OpenAPI) hujjatining umumiy ma'lumotlarini sozlaydi.
 * Hujjat sahifasining tepasida ko'rinadigan nom, tavsif va aloqa ma'lumotlari shu yerdan olinadi.
 *
 * @Configuration: bu klassda Spring uchun sozlama (@Bean) metodlari borligini bildiradi.
 */
@Configuration
public class OpenApiConfig {

    /**
     * Swagger hujjatining bosh ma'lumotini yaratadi va Spring'ga beradi.
     * Spring bu metodni ishga tushganda o'zi chaqiradi (@Bean).
     *
     * @return API haqida umumiy ma'lumot (nom, versiya, tavsif, aloqa)
     */
    @Bean
    public OpenAPI mujizaOpenApi() {
        return new OpenAPI().info(
                new Info()
                        // Hujjat sahifasining sarlavhasi
                        .title("Mujiza 777 API")
                        // API versiyasi, o'zgarishlar bo'lganda oshirib boriladi
                        .version("1.0")
                        // Qisqacha tavsif: bu API nima uchun kerak
                        .description("Mujiza 777 shirinlik do'koni onlayn platformasi uchun backend API")
                        // Savol bo'lsa kimga murojaat qilish
                        .contact(new Contact().name("Akmal Rajabov"))
        );
    }
}