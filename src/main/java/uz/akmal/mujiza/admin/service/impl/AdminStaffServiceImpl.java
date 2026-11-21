package uz.akmal.mujiza.admin.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.akmal.mujiza.admin.dto.StaffCreateRequest;
import uz.akmal.mujiza.admin.dto.StaffResponse;
import uz.akmal.mujiza.admin.dto.StaffUpdateRequest;
import uz.akmal.mujiza.admin.entity.AdminUser;
import uz.akmal.mujiza.admin.enums.AdminRole;
import uz.akmal.mujiza.admin.repository.AdminUserRepository;
import uz.akmal.mujiza.admin.service.AdminStaffService;
import uz.akmal.mujiza.audit.service.AuditService;
import uz.akmal.mujiza.common.exception.BusinessException;
import uz.akmal.mujiza.common.exception.ResourceNotFoundException;

import java.util.List;
import java.util.Locale;

/**
 * Xodimlar bilan ishlash qoidalarining amaldagi ijrosi.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminStaffServiceImpl implements AdminStaffService {

    /**
     * Xodimlarni o'qish va yozish uchun.
     */
    private final AdminUserRepository repository;

    /**
     * Parolni shifrlash uchun (BCrypt).
     */
    private final PasswordEncoder passwordEncoder;

    /**
     * Muhim o'zgarishlarni tarixga yozish uchun.
     */
    private final AuditService auditService;

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public List<StaffResponse> getAll() {
        return repository.findAll(Sort.by("id")).stream().map(this::toResponse).toList();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public StaffResponse create(StaffCreateRequest request) {
        // Login kichik harflarda saqlanadi va takrorlanmasligi kerak
        String username = request.username().trim().toLowerCase(Locale.ROOT);
        if (repository.existsByUsername(username)) {
            throw new BusinessException("Bu login band: " + username, HttpStatus.CONFLICT);
        }
        AdminUser user = new AdminUser();
        user.setUsername(username);
        // Parol shifrlangan holda saqlanadi, asl parol hech qayerga yozilmaydi
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName().trim());
        user.setRole(request.role());
        user.setIsActive(true);
        AdminUser saved = repository.save(user);
        log.info("Xodim yaratildi: login={}, rol={}", saved.getUsername(), saved.getRole());
        auditService.log("STAFF_CREATED", "STAFF", saved.getId(), saved.getUsername() + " (" + saved.getRole() + ")");
        return toResponse(saved);
    }

    /**
     * {@inheritDoc}
     * Qoidalar: admin o'zini faolsizlantira yoki rolini o'zgartira olmaydi; tizimda kamida bitta faol ADMIN qolishi kerak.
     */
    @Override
    @Transactional
    public StaffResponse update(Long id, StaffUpdateRequest request, String actor) {
        AdminUser user = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Xodim", id));

        // Yangi qiymatlar (yuborilmagan maydonlar eskisicha qoladi)
        boolean newActive = request.isActive() != null ? request.isActive() : Boolean.TRUE.equals(user.getIsActive());
        AdminRole newRole = request.role() != null ? request.role() : user.getRole();

        // O'zini cheklash: o'zini faolsizlantirib yoki rolini o'zgartirib qo'ysa, tizimdan chiqib qolishi mumkin
        boolean self = user.getUsername().equals(actor);
        if (self && (!newActive || newRole != user.getRole())) {
            throw new BusinessException("O'zingizni faolsizlantirib yoki rolingizni o'zgartirib bo'lmaydi");
        }
        // Kamida bitta faol ADMIN qolishi kerak
        boolean losesAdmin = user.getRole() == AdminRole.ADMIN && Boolean.TRUE.equals(user.getIsActive())
                && (newRole != AdminRole.ADMIN || !newActive);
        if (losesAdmin && repository.countByRoleAndIsActiveTrue(AdminRole.ADMIN) <= 1) {
            throw new BusinessException("Tizimda kamida bitta faol ADMIN qolishi kerak");
        }

        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName().trim());
        }
        user.setRole(newRole);
        user.setIsActive(newActive);
        boolean passwordChanged = request.newPassword() != null && !request.newPassword().isBlank();
        if (passwordChanged) {
            user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
            user.markPasswordChanged();
        }
        AdminUser saved = repository.save(user);
        log.info("Xodim yangilandi: login={}, rol={}, faol={}", saved.getUsername(), saved.getRole(), saved.getIsActive());
        // Tarixga parolning o'zi emas, faqat o'zgargani yoziladi
        auditService.log("STAFF_UPDATED", "STAFF", saved.getId(), saved.getUsername() + ", rol " + saved.getRole()
                + ", faol " + saved.getIsActive() + (passwordChanged ? ", parol o'zgartirildi" : ""));
        return toResponse(saved);
    }

    /**
     * Yordamchi metod: xodimdan javob yasaydi (parolsiz).
     *
     * @param user xodim
     * @return javob DTO'si
     */
    private StaffResponse toResponse(AdminUser user) {
        return new StaffResponse(user.getId(), user.getUsername(), user.getFullName(), user.getRole(),
                user.getIsActive(), user.getLastLoginAt(), user.getCreatedAt());
    }
}