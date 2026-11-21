-- Do'kon sozlamalari: jadvalda faqat BITTA qator bo'ladi (id = 1)
CREATE TABLE shop_settings (
    -- Doim 1 (quyidagi cheklov boshqa qiymatga yo'l qo'ymaydi)
                               id                     BIGINT PRIMARY KEY,
    -- Do'konning asosiy telefon raqami, +998901234567 ko'rinishida
                               phone                  VARCHAR(20) NOT NULL,
    -- Ish vaqti: ochilish va yopilish soati
                               open_time              TIME        NOT NULL,
                               close_time             TIME        NOT NULL,
    -- Onlayn buyurtma hozir qabul qilinyaptimi (bayramda vaqtincha o'chirib qo'yish uchun)
                               accepting_orders       BOOLEAN     NOT NULL DEFAULT TRUE,
    -- Yetkazib berish xizmati yoqilganmi
                               delivery_enabled       BOOLEAN     NOT NULL DEFAULT TRUE,
    -- Yetkazib berish narxi, so'mda
                               delivery_fee           BIGINT      NOT NULL DEFAULT 0,
    -- Shu summadan yuqori buyurtmada yetkazib berish bepul (bo'sh bo'lsa, hech qachon bepul emas)
                               free_delivery_from     BIGINT,
    -- Minimal buyurtma summasi, so'mda (0 bo'lsa cheklov yo'q)
                               min_order_amount       BIGINT      NOT NULL DEFAULT 0,
    -- Tortga eng kamida necha soat oldin buyurtma berish kerak
                               cake_min_advance_hours INT         NOT NULL DEFAULT 24,
    -- Telegram va Instagram sahifalari manzillari (ixtiyoriy)
                               telegram_url           VARCHAR(300),
                               instagram_url          VARCHAR(300),
    -- Yaratilgan va o'zgartirilgan vaqtlar (BaseEntity to'ldiradi)
                               created_at             TIMESTAMP   NOT NULL,
                               updated_at             TIMESTAMP   NOT NULL,
    -- Faqat id = 1 bo'lgan qator bo'lishi mumkin
                               CONSTRAINT chk_shop_settings_single_row CHECK (id = 1)
);

-- Boshlang'ich qiymatlar. Telefon, ish vaqti va narxlar VAQTINCHA, admin paneldan haqiqiylariga o'zgartiriladi.
INSERT INTO shop_settings (id, phone, open_time, close_time, created_at, updated_at)
VALUES (1, '+998000000000', '09:00', '22:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);