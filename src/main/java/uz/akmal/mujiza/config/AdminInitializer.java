package uz.akmal.mujiza.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import uz.akmal.mujiza.admin.entity.AdminUser;
import uz.akmal.mujiza.admin.enums.AdminRole;
import uz.akmal.mujiza.admin.repository.AdminUserRepository;

import java.util.Locale;

/**
 * Loyiha birinchi marta ishga tushganda birinchi adminni yaratadi.
 * Baza bo'sh bo'lsagina ishlaydi: adminlar bor bo'lsa hech narsa qilmaydi.
 * Login va parol faylga yozilmaydi, ADMIN_USERNAME va ADMIN_PASSWORD o'zgaruvchilaridan olinadi.
 *
 * ApplicationRunner: Spring to'liq ishga tushgandan keyin bir marta avtomatik chaqiradi.
 */
@Slf4j
@Component
public class AdminInitializer implements ApplicationRunner {

    /**
     * Parolning eng kam uzunligi.
     */
    private static final int MIN_PASSWORD_LENGTH = 10;

    /**
     * Bazadan adminlarni o'qish va yozish uchun.
     */
    private final AdminUserRepository adminUserRepository;

    /**
     * Parolni shifrlash uchun.
     */
    private final PasswordEncoder passwordEncoder;

    /**
     * Birinchi adminning kirish nomi (ADMIN_USERNAME).
     */
    private final String username;

    /**
     * Birinchi adminning paroli (ADMIN_PASSWORD).
     */
    private final String password;

    /**
     * Birinchi adminning to'liq ismi (ADMIN_FULL_NAME).
     */
    private final String fullName;

    /**
     * Konstruktor.
     *
     * @param adminUserRepository adminlar bilan ishlash
     * @param passwordEncoder     parol shifrlovchi
     * @param username            sozlamadagi login
     * @param password            sozlamadagi parol
     * @param fullName            sozlamadagi to'liq ism
     */
    public AdminInitializer(AdminUserRepository adminUserRepository,
                            PasswordEncoder passwordEncoder,
                            @Value("${app.admin.username:}") String username,
                            @Value("${app.admin.password:}") String password,
                            @Value("${app.admin.full-name:Administrator}") String fullName) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.username = username;
        this.password = password;
        this.fullName = fullName;
    }

    /**
     * Loyiha ishga tushganda chaqiriladi: adminlar yo'q bo'lsa, birinchisini yaratadi.
     *
     * @param args ishga tushirish argumentlari (ishlatilmaydi)
     */
    @Override
    public void run(ApplicationArguments args) {



        // Adminlar allaqachon bor bo'lsa, qiladigan ish yo'q
        if (adminUserRepository.count() > 0) {
            return;
        }
        // Login yoki parol berilmagan bo'lsa, ogohlantiramiz (loyiha ishlayveradi, lekin kirib bo'lmaydi)
        if (username.isBlank() || password.isBlank()) {
            log.warn("Admin yo'q va ADMIN_USERNAME / ADMIN_PASSWORD berilmagan: tizimga kirib bo'lmaydi");
            return;
        }
        // Zaif parol bilan ishga tushmaymiz
        if (password.length() < MIN_PASSWORD_LENGTH) {
            throw new IllegalStateException(
                    "ADMIN_PASSWORD kamida " + MIN_PASSWORD_LENGTH + " belgidan iborat bo'lishi kerak");
        }

        AdminUser admin = new AdminUser();
        // Login doim kichik harflarda saqlanadi
        admin.setUsername(username.trim().toLowerCase(Locale.ROOT));
        // Parol shifrlangan holda saqlanadi, asl parol hech qayerga yozilmaydi
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setFullName(fullName);
        admin.setRole(AdminRole.ADMIN);
        adminUserRepository.save(admin);
        log.info("Birinchi admin yaratildi: login={}", admin.getUsername());
    }
}