package uz.akmal.mujiza.order.service.impl;

import org.junit.jupiter.api.Test;
import uz.akmal.mujiza.common.exception.BusinessException;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.CALLS_REAL_METHODS;
import static org.mockito.Mockito.mock;

/**
 * Tort sanasi JVM zonasi emas, Toshkent soati bo'yicha tekshiriladi.
 */
class CakeDateClockTest {

    @Test
    void rejectsTheUtcDayThatIsAlreadyYesterdayInTashkent() {
        OrderServiceImpl service = mock(OrderServiceImpl.class, CALLS_REAL_METHODS);
        service.clock = Clock.fixed(Instant.parse("2026-11-06T20:00:00Z"), ZoneId.of("Asia/Tashkent"));

        assertThatThrownBy(() -> service.validateCakeDateWithoutSlot(LocalDate.of(2026, 11, 6), 0))
                .isInstanceOf(BusinessException.class);
        assertThatCode(() -> service.validateCakeDateWithoutSlot(LocalDate.of(2026, 11, 7), 0))
                .doesNotThrowAnyException();
    }
}
