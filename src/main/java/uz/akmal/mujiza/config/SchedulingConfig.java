package uz.akmal.mujiza.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Rejalashtirilgan vazifalarni (@Scheduled) yoqadi.
 * Hozir ulanishlarga "tirikman" belgisini yuborish uchun kerak, keyinroq bayram eslatmalari uchun ham ishlatiladi.
 */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}