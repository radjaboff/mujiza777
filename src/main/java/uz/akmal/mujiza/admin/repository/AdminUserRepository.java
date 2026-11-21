package uz.akmal.mujiza.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.akmal.mujiza.admin.entity.AdminUser;
import uz.akmal.mujiza.admin.enums.AdminRole;

import java.util.Optional;

/**
 * AdminUser jadvali bilan ishlaydigan qatlam (bazadan o'qish va yozish).
 */
public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {

    /**
     * Kirish nomi bo'yicha foydalanuvchini topadi (login paytida ishlatiladi).
     * Kirish nomlari bazada kichik harflarda saqlanadi, shuning uchun qidirishdan oldin ham kichik harfga o'tkaziladi.
     *
     * @param username kirish nomi
     * @return foydalanuvchi yoki bo'sh Optional
     */
    Optional<AdminUser> findByUsername(String username);

    /**
     * Shu kirish nomi bilan foydalanuvchi borligini tekshiradi
     * (yangi xodim qo'shishda va birinchi adminni yaratishda ishlatiladi).
     *
     * @param username kirish nomi
     * @return bor bo'lsa true
     */
    boolean existsByUsername(String username);

    /**
     * Berilgan rolli faol foydalanuvchilar sonini sanaydi (oxirgi faol ADMIN o'chirilib ketmasligi uchun).
     *
     * @param role rol
     * @return faol foydalanuvchilar soni
     */
    long countByRoleAndIsActiveTrue(AdminRole role);
}