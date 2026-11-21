package uz.akmal.mujiza.common;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/** PostgreSQL transaction-scoped lock shared by create flows that enforce per-phone limits. */
@Service
@RequiredArgsConstructor
public class PhoneLockService {

    private final JdbcTemplate jdbcTemplate;

    /** Must be called inside the transaction that performs the subsequent count and insert. */
    @Transactional(propagation = Propagation.MANDATORY)
    public void lock(String phone) {
        jdbcTemplate.queryForObject(
                "WITH phone_lock AS MATERIALIZED " +
                        "(SELECT pg_advisory_xact_lock(hashtextextended(?, 0))) SELECT 1 FROM phone_lock",
                Integer.class,
                phone);
    }
}
