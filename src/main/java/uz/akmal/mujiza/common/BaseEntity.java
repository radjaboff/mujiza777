package uz.akmal.mujiza.common;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Barcha entity'lar uchun umumiy asos klass.
 * Har bir jadvalda takrorlanadigan id, createdAt va updatedAt maydonlari shu yerda turadi,
 * shunda har bir entity'da ularni qayta yozib o'tirmaymiz.
 *
 * @MappedSuperclass: bu klassning o'zi alohida jadval bo'lmaydi,
 * uning maydonlari uni meros qilib olgan entity'larning jadvaliga qo'shiladi.
 * @Getter, @Setter (Lombok): har bir maydon uchun getXxx() va setXxx() metodlarini avtomatik yaratadi.
 */
@MappedSuperclass
@Getter
@Setter
public abstract class BaseEntity {

    /**
     * Yozuvning noyob raqami (primary key).
     * IDENTITY: raqamni PostgreSQL o'zi avtomatik oshirib beradi (1, 2, 3...),
     * biz uni qo'lda bermaymiz.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Yozuv yaratilgan vaqt.
     * updatable = false: yozuv bir marta saqlangach bu vaqt boshqa o'zgarmaydi.
     * nullable = false: bazada bu ustun bo'sh bo'la olmaydi.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Yozuv oxirgi marta o'zgartirilgan vaqt.
     * Har safar yozuv yangilanganda avtomatik yangilanadi.
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Yangi yozuv bazaga birinchi marta saqlanishidan oldin avtomatik ishga tushadi (@PrePersist).
     * Yaratilgan va yangilangan vaqtlarni hozirgi vaqtga o'rnatadi.
     */
    @PrePersist
    protected void onCreate() {
        // Hozirgi vaqtni bir marta olamiz, shunda ikkala maydon aynan bir xil bo'ladi
        LocalDateTime now = ShopTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    /**
     * Mavjud yozuv yangilanishidan oldin avtomatik ishga tushadi (@PreUpdate).
     * Faqat "oxirgi o'zgartirilgan vaqt"ni yangilaydi, yaratilgan vaqt o'zgarmaydi.
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = ShopTime.now();
    }
}
