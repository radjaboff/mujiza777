package uz.akmal.mujiza.audit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import uz.akmal.mujiza.audit.entity.AuditLog;

/**
 * AuditLog jadvali bilan ishlaydigan qatlam (JpaSpecificationExecutor: filtrlar bilan qidirish uchun).
 */
public interface AuditLogRepository extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {
}