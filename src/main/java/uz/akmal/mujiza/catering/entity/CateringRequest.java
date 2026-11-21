package uz.akmal.mujiza.catering.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import uz.akmal.mujiza.catering.enums.CateringStatus;
import uz.akmal.mujiza.common.BaseEntity;

import java.time.LocalDate;

/**
 * Keytering so'rovi (to'y va tadbirlar uchun katta buyurtma). Bazadagi "catering_requests" jadvaliga mos keladi.
 */
@Entity
@Table(name = "catering_requests")
@Getter
@Setter
public class CateringRequest extends BaseEntity {

    /** So'rov yuborgan odamning ismi. */
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    /** Telefon raqami, +998901234567 ko'rinishida. */
    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    /** Tadbir turi (to'y, tug'ilgan kun, korporativ va h.k.). */
    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    /** Tadbir sanasi. */
    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    /** Mehmonlar soni. */
    @Column(name = "guest_count", nullable = false)
    private Integer guestCount;

    /** Taxminiy byudjet, so'mda (ixtiyoriy). */
    @Column(name = "budget")
    private Long budget;

    /** Qo'shimcha istaklar (ixtiyoriy). */
    @Column(name = "comment", length = 1000)
    private String comment;

    /** So'rovning holati. */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CateringStatus status = CateringStatus.NEW;

    /** Admin izohi (mijozga ko'rinmaydi). */
    @Column(name = "admin_note", length = 500)
    private String adminNote;
}