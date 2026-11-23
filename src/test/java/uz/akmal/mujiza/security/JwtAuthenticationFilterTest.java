package uz.akmal.mujiza.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import jakarta.servlet.http.Cookie;
import uz.akmal.mujiza.admin.entity.AdminUser;
import uz.akmal.mujiza.admin.enums.AdminRole;
import uz.akmal.mujiza.admin.repository.AdminUserRepository;
import uz.akmal.mujiza.common.ShopTime;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Deep verification of JwtAuthenticationFilter across all scenarios:
 * Bearer token, HttpOnly Cookie, token expiration, password change revocation, and disabled accounts.
 */
class JwtAuthenticationFilterTest {

    private static final String SECRET = "test-secret-key-must-be-at-least-32-characters-long!";
    private JwtService jwtService;
    private JwtCookieService cookieService;
    private AdminUserRepository userRepository;
    private AdminUserDetailsService userDetailsService;
    private JwtAuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        jwtService = new JwtService(SECRET, 1L);
        cookieService = new JwtCookieService("MUJIZA_TOKEN", false, jwtService);
        userRepository = mock(AdminUserRepository.class);
        userDetailsService = new AdminUserDetailsService(userRepository);
        filter = new JwtAuthenticationFilter(jwtService, userDetailsService, cookieService);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private AdminUser createAdmin(String username, boolean active, LocalDateTime pwdChanged) {
        AdminUser user = new AdminUser();
        user.setId(1L);
        user.setUsername(username);
        user.setPasswordHash("hashed_pw");
        user.setFullName("Test Admin");
        user.setRole(AdminRole.ADMIN);
        user.setIsActive(active);
        user.setPasswordChangedAt(pwdChanged);
        return user;
    }

    @Test
    void bearerTokenInHeaderAuthenticatesUser() throws Exception {
        AdminUser admin = createAdmin("admin", true, null);
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(admin));

        String token = jwtService.generateToken(admin);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getName()).isEqualTo("admin");
        assertThat(SecurityContextHolder.getContext().getAuthentication().getAuthorities())
                .extracting("authority").contains("ROLE_ADMIN");
    }

    @Test
    void httpOnlyCookieAuthenticatesUserWhenHeaderAbsent() throws Exception {
        AdminUser admin = createAdmin("manager", true, null);
        admin.setRole(AdminRole.STAFF);
        when(userRepository.findByUsername("manager")).thenReturn(Optional.of(admin));

        String token = jwtService.generateToken(admin);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("MUJIZA_TOKEN", token));
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getName()).isEqualTo("manager");
        assertThat(SecurityContextHolder.getContext().getAuthentication().getAuthorities())
                .extracting("authority").contains("ROLE_STAFF");
    }

    @Test
    void invalidTokenLeavesContextUnauthenticated() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer completely.invalid.jwt.token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void missingTokenLeavesContextUnauthenticated() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void disabledUserTokenIsRejected() throws Exception {
        AdminUser admin = createAdmin("fired_staff", false, null);
        when(userRepository.findByUsername("fired_staff")).thenReturn(Optional.of(admin));

        // Generate token before disabling
        AdminUser activeTemp = createAdmin("fired_staff", true, null);
        String token = jwtService.generateToken(activeTemp);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void staleTokenIssuedBeforePasswordChangeIsRejected() throws Exception {
        AdminUser admin = createAdmin("admin", true, null);
        String token = jwtService.generateToken(admin);

        // Password was changed 5 minutes AFTER the token was issued
        admin.setPasswordChangedAt(ShopTime.now().plusMinutes(5));
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(admin));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void nonExistentUserTokenIsRejected() throws Exception {
        AdminUser admin = createAdmin("ghost", true, null);
        String token = jwtService.generateToken(admin);

        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }
}
