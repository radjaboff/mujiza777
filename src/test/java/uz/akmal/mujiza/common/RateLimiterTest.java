package uz.akmal.mujiza.common;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import uz.akmal.mujiza.common.exception.BusinessException;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * RateLimiter: so'rovlarni cheklash qoidalari.
 */
class RateLimiterTest {

    @Test
    void allowsUpToLimitThenRejects() {
        RateLimiter limiter = new RateLimiter();
        assertThat(limiter.tryAcquire("a", 2, Duration.ofSeconds(10))).isTrue();
        assertThat(limiter.tryAcquire("a", 2, Duration.ofSeconds(10))).isTrue();
        assertThat(limiter.tryAcquire("a", 2, Duration.ofSeconds(10))).isFalse();
    }

    @Test
    void keysAreIndependent() {
        RateLimiter limiter = new RateLimiter();
        assertThat(limiter.tryAcquire("a", 1, Duration.ofSeconds(10))).isTrue();
        assertThat(limiter.tryAcquire("b", 1, Duration.ofSeconds(10))).isTrue();
    }

    @Test
    void allowsAgainAfterWindowPasses() throws InterruptedException {
        RateLimiter limiter = new RateLimiter();
        assertThat(limiter.tryAcquire("w", 1, Duration.ofMillis(50))).isTrue();
        assertThat(limiter.tryAcquire("w", 1, Duration.ofMillis(50))).isFalse();
        Thread.sleep(120);
        assertThat(limiter.tryAcquire("w", 1, Duration.ofMillis(50))).isTrue();
    }

    @Test
    void acquireOrThrowGives429WhenLimitReached() {
        RateLimiter limiter = new RateLimiter();
        limiter.acquireOrThrow("t", 1, Duration.ofSeconds(10));
        assertThatThrownBy(() -> limiter.acquireOrThrow("t", 1, Duration.ofSeconds(10)))
                .isInstanceOfSatisfying(BusinessException.class,
                        e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS));
    }
}