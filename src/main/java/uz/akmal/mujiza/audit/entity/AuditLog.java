package uz.akmal.mujiza.audit.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import uz.akmal.mujiza.common.BaseEntity;

/**
 * O'zgarishlar tarixi yozuvi: kim, qachon (createdAt), nimani o'zgartirdi. Bazadagi "audit_log" jadvaliga mos keladi.
 */
@Entity
@Table(name = "audit_log")
@Getter
@Setter
public class AuditLog extends BaseEntity {

    /** Amalni bajargan foydalanuvchi ("system" yoki "telegram:@..." ham bo'lishi mumkin). */
    @Column(name = "actor", nullable = false, length = 50)
    private String actor;

    /** Amal kodi, masalan PRODUCT_UPDATED. */
    @Column(name = "action", nullable = false, length = 40)
    private String action;

    /** Nima o'zgargani: PRODUCT, ORDER, PROMO_CODE, SETTINGS, STAFF. */
    @Column(name = "entity_type", nullable = false, length = 30)
    private String entityType;

    /** O'zgargan yozuvning raqami (bo'lmasligi mumkin). */
    @Column(name = "entity_id")
    private Long entityId;

    /** Qisqa tafsilot (maxfiy ma'lumot yozilmaydi). */
    @Column(name = "details", length = 500)
    private String details;
}