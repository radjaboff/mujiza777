package uz.akmal.mujiza.order.service.impl;

import org.junit.jupiter.api.Test;
import uz.akmal.mujiza.common.RateLimiter;

import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Concurrency test verifying thread-safety and race condition prevention
 * under simultaneous rapid requests (simulating parallel checkouts / burst orders).
 */
class ParallelOrderCreationConcurrencyTest {

    @Test
    void concurrentCheckoutAttemptsAreStrictlyRateLimited() throws InterruptedException {
        // Rate limiter allows 5 requests per 10 seconds per IP/Phone
        RateLimiter rateLimiter = new RateLimiter();
        String testPhone = "+998901234567";

        int threadsCount = 20;
        ExecutorService executor = Executors.newFixedThreadPool(threadsCount);
        CountDownLatch startSignal = new CountDownLatch(1);
        CountDownLatch doneSignal = new CountDownLatch(threadsCount);

        AtomicInteger allowedCount = new AtomicInteger(0);
        AtomicInteger rejectedCount = new AtomicInteger(0);

        for (int i = 0; i < threadsCount; i++) {
            executor.submit(() -> {
                try {
                    startSignal.await(); // Guarantee all threads trigger at the exact same millisecond
                    if (rateLimiter.tryAcquire(testPhone, 5, java.time.Duration.ofSeconds(10))) {
                        allowedCount.incrementAndGet();
                    } else {
                        rejectedCount.incrementAndGet();
                    }
                } catch (InterruptedException ignored) {
                    Thread.currentThread().interrupt();
                } finally {
                    doneSignal.countDown();
                }
            });
        }

        startSignal.countDown(); // Fire all 20 threads simultaneously
        boolean finished = doneSignal.await(5, TimeUnit.SECONDS);
        executor.shutdown();

        assertThat(finished).isTrue();
        // Exactly 5 allowed, exactly 15 rejected under extreme burst
        assertThat(allowedCount.get()).isEqualTo(5);
        assertThat(rejectedCount.get()).isEqualTo(15);
    }
}
