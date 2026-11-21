package uz.akmal.mujiza.order.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import uz.akmal.mujiza.common.BaseEntity;

import java.time.LocalTime;

/**
 * Vaqt oynasi (masalan, 14:00-16:00) va unga qabul qilinadigan buyurtmalar sig'imi.
 * Bazadagi "delivery_slots" jadvaliga mos keladi.
 */
@Entity
@Table(name = "delivery_slots")
@Getter
@Setter
public class DeliverySlot extends BaseEntity {

    /** Oyna boshlanadigan soat. */
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    /** Oyna tugaydigan soat (boshlanishdan keyin bo'lishi kerak). */
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    /** Bir sanada shu oynaga eng ko'pi bilan nechta buyurtma qabul qilinadi. */
    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    /** Mijozlarga ko'rinadimi (false bo'lsa yashiriladi). Standart true. */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    /** O'chirilganmi (soft delete). Standart false. */
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;
}