-- Aksiyalar va yangiliklar (bosh sahifa bannerlari ham shu jadvaldan olinadi)
CREATE TABLE promotions (
                            id               BIGSERIAL PRIMARY KEY,
    -- Sarlavha o'zbek va rus tillarida
                            title_uz         VARCHAR(200) NOT NULL,
                            title_ru         VARCHAR(200) NOT NULL,
    -- URL uchun qisqa nom (aksiya sahifasi manzilida ko'rinadi, Google uchun ham foydali)
                            slug             VARCHAR(230) NOT NULL,
    -- Qisqa tavsif (kartochkada ko'rinadi), ixtiyoriy
                            summary_uz       VARCHAR(300),
                            summary_ru       VARCHAR(300),
    -- To'liq matn (aksiya sahifasida ko'rinadi), ixtiyoriy
                            description_uz   TEXT,
                            description_ru   TEXT,
    -- Rasm kompyuter uchun va telefon uchun (telefon rasmi bo'lmasa, kompyuterniki ishlatiladi), ixtiyoriy
                            image_url        VARCHAR(500),
                            mobile_image_url VARCHAR(500),
    -- Bosilganda qayerga olib borishi: sayt ichidagi yo'l (/katalog/tortlar) yoki to'liq manzil, ixtiyoriy
                            link_url         VARCHAR(500),
    -- Bosh sahifadagi katta bannerlarda ko'rsatilsinmi
                            show_on_home     BOOLEAN      NOT NULL DEFAULT FALSE,
    -- Qachondan qachongacha ko'rinishi (bo'sh bo'lsa, cheklov yo'q)
                            active_from      TIMESTAMP,
                            active_to        TIMESTAMP,
    -- Ko'rsatish tartibi (kichik raqam birinchi)
                            sort_order       INT          NOT NULL DEFAULT 0,
    -- Qo'lda yoqish/o'chirish (false bo'lsa, vaqtidan qat'i nazar ko'rinmaydi)
                            is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    -- O'chirilganmi (soft delete)
                            is_deleted       BOOLEAN      NOT NULL DEFAULT FALSE,
                            created_at       TIMESTAMP    NOT NULL,
                            updated_at       TIMESTAMP    NOT NULL,
    -- Tugash vaqti boshlanish vaqtidan keyin bo'lishi kerak
                            CONSTRAINT chk_promotions_period CHECK (active_from IS NULL OR active_to IS NULL OR active_to > active_from)
);

-- slug o'chirilmagan aksiyalar orasida takrorlanmasligi kerak
CREATE UNIQUE INDEX uq_promotions_slug_active ON promotions (slug) WHERE is_deleted = FALSE;
-- Mijoz sayti ro'yxatini tez olish uchun
CREATE INDEX idx_promotions_visibility ON promotions (is_deleted, is_active, show_on_home);