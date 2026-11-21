package uz.akmal.mujiza.admin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import uz.akmal.mujiza.admin.enums.AdminRole;
import uz.akmal.mujiza.common.BaseEntity;

import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * Admin panelga kiruvchi foydalanuvchi (do'kon egasi, xodim yoki kuryer).
 * Bazadagi "admin_users" jadvaliga mos keladi.
 * id, createdAt va updatedAt maydonlari BaseEntity'dan meros bo'lib keladi.
 */
@Entity
@Table(name = "admin_users")
@Getter
@Setter
public class AdminUser extends BaseEntity {

    /**
     * Kirish nomi (login). Doim kichik harflarda saqlanadi va takrorlanmaydi.
     */
    @Column(name = "username", nullable = false, length = 50)
    private String username;

    /**
     * Parolning BCrypt bilan shifrlangan ko'rinishi.
     * Asl parol hech qayerda saqlanmaydi, shuning uchun baza o'g'irlansa ham parollarni bilib bo'lmaydi.
     */
    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    /**
     * To'liq ismi (admin panelda "Salom, Akmal" kabi ko'rsatish uchun).
     */
    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    /**
     * Roli: nima qila olishini belgilaydi (ADMIN, STAFF, COURIER).
     * EnumType.STRING: bazada raqam emas, matn ("ADMIN") saqlanadi.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private AdminRole role;

    /**
     * Faolmi. false bo'lsa foydalanuvchi tizimga kira olmaydi (lekin yozuvi o'chmaydi).
     * Standart qiymati true.
     */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    /**
     * Oxirgi marta tizimga kirgan vaqti. Hali kirmagan bo'lsa null.
     */
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    /**
     * Parol oxirgi marta almashtirilgan vaqt (Toshkent). Null bo'lsa, eski tokenlar amal qiladi.
     * Shu vaqtdan oldin berilgan token qabul qilinmaydi.
     */
    @Column(name = "password_changed_at")
    private LocalDateTime passwordChangedAt;

    /**
     * Parol almashtirilganini belgilaydi. Shu zahotdan oldingi tokenlar yaroqsiz bo'ladi.
     */
    public void markPasswordChanged() {
        this.passwordChangedAt = LocalDateTime.now(ZoneId.of("Asia/Tashkent"));
    }
}