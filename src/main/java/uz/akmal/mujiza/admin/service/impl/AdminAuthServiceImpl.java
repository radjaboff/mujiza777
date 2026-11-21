package uz.akmal.mujiza.admin.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.akmal.mujiza.admin.dto.AdminProfileResponse;
import uz.akmal.mujiza.admin.dto.ChangePasswordRequest;
import uz.akmal.mujiza.admin.dto.LoginRequest;
import uz.akmal.mujiza.admin.dto.LoginResult;
import uz.akmal.mujiza.admin.entity.AdminUser;
import uz.akmal.mujiza.admin.repository.AdminUserRepository;
import uz.akmal.mujiza.admin.service.AdminAuthService;
import uz.akmal.mujiza.common.exception.BusinessException;
import uz.akmal.mujiza.common.ShopTime;
import uz.akmal.mujiza.security.JwtService;

import java.time.LocalDateTime;
import java.util.Locale;

/**
 * Admin panelga kirish qoidalarining amaldagi ijrosi.
 */
@Slf4j
@Service
public class AdminAuthServiceImpl implements AdminAuthService {

    /**
     * Kirish xatosi xabari. Login noto'g'rimi yoki parolmi, buni ataylab aytmaymiz:
     * aks holda hujumchi qaysi login mavjudligini bilib oladi.
     */
    private static final String BAD_CREDENTIALS = "Login yoki parol noto'g'ri";

    /**
     * Bazadan adminlarni o'qish va yozish uchun.
     */
    private final AdminUserRepository adminUserRepository;

    /**
     * Parolni tekshiruvchi (BCrypt).
     */
    private final PasswordEncoder passwordEncoder;

    /**
     * Token yasovchi.
     */
    private final JwtService jwtService;

    /**
     * Soxta parol shifri: bunday login yo'q bo'lganda ham parol tekshirish ishini bajaramiz,
     * shunda javob vaqtiga qarab login mavjudligini bilib bo'lmaydi.
     */
    private final String dummyHash;

    /**
     * Konstruktor: kerakli obyektlarni oladi va soxta shifrni tayyorlaydi.
     *
     * @param adminUserRepository adminlar bilan ishlash
     * @param passwordEncoder     parol shifrlovchi
     * @param jwtService          token yasovchi
     */
    public AdminAuthServiceImpl(AdminUserRepository adminUserRepository,
                                PasswordEncoder passwordEncoder,
                                JwtService jwtService) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.dummyHash = passwordEncoder.encode("dummy-password-for-timing");
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public LoginResult login(LoginRequest request) {
        // Loginni tozalaymiz va kichik harfga o'tkazamiz (bazada shunday saqlanadi)
        String username = request.username().trim().toLowerCase(Locale.ROOT);
        AdminUser user = adminUserRepository.findByUsername(username).orElse(null);

        // Foydalanuvchi bo'lmasa ham parol tekshirish ishini bajaramiz (vaqt bir xil bo'lishi uchun)
        String hash = user != null ? user.getPasswordHash() : dummyHash;
        boolean passwordOk = passwordEncoder.matches(request.password(), hash);

        // Foydalanuvchi yo'q, parol noto'g'ri yoki hisob o'chirilgan bo'lsa, bir xil xabar beramiz
        if (user == null || !passwordOk || !Boolean.TRUE.equals(user.getIsActive())) {
            log.warn("Kirish urinishi muvaffaqiyatsiz: login={}", username);
            throw new BusinessException(BAD_CREDENTIALS, HttpStatus.UNAUTHORIZED);
        }

        // Oxirgi kirish vaqtini yozib qo'yamiz
        user.setLastLoginAt(ShopTime.now());
        adminUserRepository.save(user);
        log.info("Admin tizimga kirdi: login={}", username);

        AdminProfileResponse profile = new AdminProfileResponse(
                user.getUsername(), user.getFullName(), user.getRole());
        return new LoginResult(profile, jwtService.generateToken(user));
    }




    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public AdminProfileResponse getProfile(String username) {
        // Foydalanuvchini topamiz; topilmasa yoki faol bo'lmasa, kirish talab qilinadi
        AdminUser user = adminUserRepository.findByUsername(username)
                .filter(found -> Boolean.TRUE.equals(found.getIsActive()))
                .orElseThrow(() -> new BusinessException("Tizimga kirish talab qilinadi", HttpStatus.UNAUTHORIZED));
        return new AdminProfileResponse(user.getUsername(), user.getFullName(), user.getRole());
    }

    /**
     * {@inheritDoc}
     * Eslatma: joriy parol noto'g'ri bo'lsa 400 qaytadi (401 emas), chunki 401 frontendni login sahifasiga qaytarib yuboradi.
     */
    @Override
    @Transactional
    public String changePassword(String username, ChangePasswordRequest request) {
        AdminUser user = adminUserRepository.findByUsername(username)
                .filter(found -> Boolean.TRUE.equals(found.getIsActive()))
                .orElseThrow(() -> new BusinessException("Tizimga kirish talab qilinadi", HttpStatus.UNAUTHORIZED));
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BusinessException("Joriy parol noto'g'ri");
        }
        if (request.currentPassword().equals(request.newPassword())) {
            throw new BusinessException("Yangi parol joriy paroldan farq qilishi kerak");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.markPasswordChanged();
        adminUserRepository.save(user);
        log.info("Foydalanuvchi parolini almashtirdi: login={}", username);
        return jwtService.generateToken(user);
    }

}
