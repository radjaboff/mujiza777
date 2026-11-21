package uz.akmal.mujiza.shop.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import uz.akmal.mujiza.common.BaseEntity;
import uz.akmal.mujiza.shop.enums.SeasonTheme;

import java.time.LocalTime;

/**
 * Do'kon sozlamalari. Bazada faqat bitta qator (id = 1) bor, uni migratsiya yaratadi.
 * Yangi qator yaratilmaydi, faqat mavjudi yangilanadi.
 * Bazadagi "shop_settings" jadvaliga mos keladi.
 */
@Entity
@Table(name = "shop_settings")
@Getter
@Setter
public class ShopSettings extends BaseEntity {

    /** Sozlamalar qatorining yagona raqami (jadvalda doim 1). */
    public static final long SINGLE_ID = 1L;

    /** Do'konning asosiy telefon raqami, +998901234567 ko'rinishida. */
    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    /** Do'kon ochiladigan soat. */
    @Column(name = "open_time", nullable = false)
    private LocalTime openTime;

    /** Do'kon yopiladigan soat (ochilish soatidan kichik bo'lsa, tungi ish vaqti hisoblanadi). */
    @Column(name = "close_time", nullable = false)
    private LocalTime closeTime;

    /** Onlayn buyurtma hozir qabul qilinyaptimi (false bo'lsa, saytda buyurtma berib bo'lmaydi). */
    @Column(name = "accepting_orders", nullable = false)
    private Boolean acceptingOrders = true;

    /** Yetkazib berish xizmati yoqilganmi (false bo'lsa, faqat olib ketish mumkin). */
    @Column(name = "delivery_enabled", nullable = false)
    private Boolean deliveryEnabled = true;

    /** Yetkazib berish narxi, so'mda. */
    @Column(name = "delivery_fee", nullable = false)
    private Long deliveryFee = 0L;

    /** Shu summadan yuqori buyurtmada yetkazib berish bepul. null bo'lsa, hech qachon bepul emas. */
    @Column(name = "free_delivery_from")
    private Long freeDeliveryFrom;

    /** Minimal buyurtma summasi, so'mda. 0 bo'lsa cheklov yo'q. */
    @Column(name = "min_order_amount", nullable = false)
    private Long minOrderAmount = 0L;

    /** Tortga eng kamida necha soat oldin buyurtma berish kerak. */
    @Column(name = "cake_min_advance_hours", nullable = false)
    private Integer cakeMinAdvanceHours = 24;

    /** Telegram sahifasi manzili (ixtiyoriy). */
    @Column(name = "telegram_url", length = 300)
    private String telegramUrl;

    /** Instagram sahifasi manzili (ixtiyoriy). */
    @Column(name = "instagram_url", length = 300)
    private String instagramUrl;



    /** Saytning mavsumiy rang mavzusi. Standart: DEFAULT (oddiy ko'rinish). */
    @Enumerated(EnumType.STRING)
    @Column(name = "season_theme", nullable = false, length = 20)
    private SeasonTheme seasonTheme = SeasonTheme.DEFAULT;
}