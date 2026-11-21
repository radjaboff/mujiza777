package uz.akmal.mujiza;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import uz.akmal.mujiza.common.PhoneLockService;

/** Runs explicitly in CI against PostgreSQL to verify production Flyway and advisory-lock SQL. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("prod")
class PostgresDeploymentSmokeIT {

    @Autowired
    private PhoneLockService phoneLockService;

    @Test
    @Transactional
    void productionSchemaAndTransactionAdvisoryLockAreUsable() {
        phoneLockService.lock("deployment-smoke-test");
    }
}
