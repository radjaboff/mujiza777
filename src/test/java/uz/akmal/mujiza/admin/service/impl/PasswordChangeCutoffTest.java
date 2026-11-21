package uz.akmal.mujiza.admin.service.impl;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import uz.akmal.mujiza.admin.dto.ChangePasswordRequest;
import uz.akmal.mujiza.admin.dto.StaffUpdateRequest;
import uz.akmal.mujiza.admin.entity.AdminUser;
import uz.akmal.mujiza.admin.enums.AdminRole;
import uz.akmal.mujiza.admin.repository.AdminUserRepository;
import uz.akmal.mujiza.audit.service.AuditService;
import uz.akmal.mujiza.security.JwtService;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Parol almashtirish eski tokenni kesadi. Xodim parolini admin almashtirsa ham shu vaqt yoziladi.
 */
@ExtendWith(MockitoExtension.class)
class PasswordChangeCutoffTest {

    @Mock
    private AdminUserRepository repository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuditService auditService;

    @Test
    void ownPasswordChangeMarksTheCutoffAndReturnsANewToken() {
        AdminUser user = active("owner");
        when(repository.findByUsername("owner")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("old-password", "hash")).thenReturn(true);
        when(passwordEncoder.encode(any())).thenAnswer(invocation -> "hash-" + invocation.getArgument(0));
        when(jwtService.generateToken(user)).thenReturn("fresh-token");
        AdminAuthServiceImpl service = new AdminAuthServiceImpl(repository, passwordEncoder, jwtService);

        String token = service.changePassword("owner", new ChangePasswordRequest("old-password", "new-password"));

        assertThat(token).isEqualTo("fresh-token");
        assertThat(user.getPasswordChangedAt()).isNotNull();
        assertThat(user.getPasswordHash()).isEqualTo("hash-new-password");
    }

    @Test
    void staffPasswordResetMarksTheCutoff() {
        AdminUser user = active("cashier");
        user.setRole(AdminRole.STAFF);
        when(repository.findById(4L)).thenReturn(Optional.of(user));
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(passwordEncoder.encode(any())).thenReturn("new-hash");
        AdminStaffServiceImpl service = new AdminStaffServiceImpl(repository, passwordEncoder, auditService);

        service.update(4L, new StaffUpdateRequest(null, null, null, "new-password"), "owner");

        ArgumentCaptor<AdminUser> saved = ArgumentCaptor.forClass(AdminUser.class);
        verify(repository).save(saved.capture());
        assertThat(saved.getValue().getPasswordChangedAt()).isNotNull();
    }

    @Test
    void staffUpdateWithoutPasswordDoesNotCutOffTokens() {
        AdminUser user = active("cashier");
        user.setRole(AdminRole.STAFF);
        when(repository.findById(4L)).thenReturn(Optional.of(user));
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        AdminStaffServiceImpl service = new AdminStaffServiceImpl(repository, passwordEncoder, auditService);

        service.update(4L, new StaffUpdateRequest("Kassa", null, null, null), "owner");

        assertThat(user.getPasswordChangedAt()).isNull();
    }

    private static AdminUser active(String username) {
        AdminUser user = new AdminUser();
        user.setUsername(username);
        user.setPasswordHash("hash");
        user.setFullName("Owner");
        user.setRole(AdminRole.ADMIN);
        user.setIsActive(true);
        return user;
    }
}
