package uz.akmal.mujiza.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import uz.akmal.mujiza.admin.entity.AdminUser;
import uz.akmal.mujiza.admin.repository.AdminUserRepository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Collection;
import java.util.Locale;

/**
 * Spring Security uchun foydalanuvchini bazadan topib beradigan xizmat.
 * Foydalanuvchining roli "ROLE_ADMIN", "ROLE_STAFF" ko'rinishida beriladi,
 * o'chirilgan (faol bo'lmagan) hisob "disabled" deb belgilanadi.
 */
@Service
@RequiredArgsConstructor
public class AdminUserDetailsService implements UserDetailsService {

    /**
     * Bazadan adminlarni o'qish uchun.
     */
    private final AdminUserRepository adminUserRepository;

    /**
     * Kirish nomi bo'yicha foydalanuvchini topadi.
     *
     * @param username kirish nomi
     * @return Spring Security tushunadigan foydalanuvchi ma'lumoti
     * @throws UsernameNotFoundException foydalanuvchi topilmasa
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AdminUser user = adminUserRepository.findByUsername(username.toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new UsernameNotFoundException("Foydalanuvchi topilmadi"));
        UserDetails delegate = org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPasswordHash())
                // roles("ADMIN") avtomatik "ROLE_ADMIN" qiladi
                .roles(user.getRole().name())
                .disabled(!Boolean.TRUE.equals(user.getIsActive()))
                .build();
        return new AdminPrincipal(delegate, user.getPasswordChangedAt());
    }

    /**
     * Bazadagi foydalanuvchi va uning parol o'zgarish vaqti. Filtr token berilgan vaqtni shu bilan solishtiradi.
     */
    static final class AdminPrincipal implements UserDetails {

        private static final ZoneId SHOP_ZONE = ZoneId.of("Asia/Tashkent");

        private final UserDetails delegate;
        private final LocalDateTime passwordChangedAt;

        AdminPrincipal(UserDetails delegate, LocalDateTime passwordChangedAt) {
            this.delegate = delegate;
            this.passwordChangedAt = passwordChangedAt;
        }

        /**
         * Token parol almashtirilishidan oldin berilgan bo'lsa true. Null vaqt eski sessiyalarni uzmaydi.
         * Taqqoslash soniya aniqlikda: yangi cookie o'sha soniyada ham qabul qilinadi.
         */
        boolean rejectsIssuedAt(Instant issuedAt) {
            if (passwordChangedAt == null || issuedAt == null) {
                return false;
            }
            Instant changed = passwordChangedAt.atZone(SHOP_ZONE).toInstant().truncatedTo(ChronoUnit.SECONDS);
            return issuedAt.truncatedTo(ChronoUnit.SECONDS).isBefore(changed);
        }

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return delegate.getAuthorities();
        }

        @Override
        public String getPassword() {
            return delegate.getPassword();
        }

        @Override
        public String getUsername() {
            return delegate.getUsername();
        }

        @Override
        public boolean isAccountNonExpired() {
            return delegate.isAccountNonExpired();
        }

        @Override
        public boolean isAccountNonLocked() {
            return delegate.isAccountNonLocked();
        }

        @Override
        public boolean isCredentialsNonExpired() {
            return delegate.isCredentialsNonExpired();
        }

        @Override
        public boolean isEnabled() {
            return delegate.isEnabled();
        }
    }
}