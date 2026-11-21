package uz.akmal.mujiza.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Parol almashtirilgandan oldin berilgan token rad etiladi. Null vaqt sessiyani uzmaydi.
 */
class AdminPrincipalTest {

    private static final ZoneId SHOP = ZoneId.of("Asia/Tashkent");

    @Test
    void tokenIssuedBeforePasswordChangeIsRejected() {
        LocalDateTime changedAt = LocalDateTime.of(2026, 11, 6, 15, 0, 30);
        var principal = principal(changedAt);
        Instant issued = changedAt.minusSeconds(5).atZone(SHOP).toInstant();

        assertThat(principal.rejectsIssuedAt(issued)).isTrue();
    }

    @Test
    void tokenIssuedInTheSameSecondIsKept() {
        LocalDateTime changedAt = LocalDateTime.of(2026, 11, 6, 15, 0, 30, 800_000_000);
        var principal = principal(changedAt);
        Instant issued = changedAt.atZone(SHOP).toInstant();

        assertThat(principal.rejectsIssuedAt(issued)).isFalse();
    }

    @Test
    void unchangedPasswordKeepsExistingTokens() {
        var principal = principal(null);

        assertThat(principal.rejectsIssuedAt(Instant.parse("2020-01-01T00:00:00Z"))).isFalse();
    }

    private static AdminUserDetailsService.AdminPrincipal principal(LocalDateTime changedAt) {
        User user = (User) User.withUsername("admin").password("hash").roles("ADMIN").build();
        return new AdminUserDetailsService.AdminPrincipal(user, changedAt);
    }
}
