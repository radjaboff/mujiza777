-- Promo kodlar (chegirma kodlari)
CREATE TABLE promo_codes (
                             id                  BIGSERIAL PRIMARY KEY,
    -- Kodning o'zi, doim KATTA harflarda saqlanadi (NAVROZ10)
                             code                VARCHAR(30)  NOT NULL,
    -- Admin uchun izoh (mijozga ko'rinmaydi), ixtiyoriy
                             description         VARCHAR(200),
    -- Chegirma turi: PERCENT (foiz) yoki FIXED (aniq summa)
                             discount_type       VARCHAR(10)  NOT NULL,
    -- Chegirma qiymati: foizda (1-100) yoki so'mda
                             discount_value      BIGINT       NOT NULL,
    -- Foizli kod uchun eng ko'p chegirma summasi, so'mda (ixtiyoriy)
                             max_discount_amount BIGINT,
    -- Kod ishlashi uchun mahsulotlarning minimal summasi, so'mda (0 bo'lsa cheklov yo'q)
                             min_order_amount    BIGINT       NOT NULL DEFAULT 0,
    -- Kodni eng ko'pi bilan necha marta ishlatish mumkin (bo'sh bo'lsa, cheksiz)
                             max_uses            INT,
    -- Hozirgacha necha marta ishlatilgan
                             used_count          INT          NOT NULL DEFAULT 0,
    -- Faqat birinchi buyurtma uchunmi (shu telefondan hali buyurtma bo'lmagan mijoz)
                             first_order_only    BOOLEAN      NOT NULL DEFAULT FALSE,
    -- Amal qilish muddati (bo'sh bo'lsa, cheklov yo'q)
                             valid_from          TIMESTAMP,
                             valid_to            TIMESTAMP,
    -- Qo'lda yoqish/o'chirish
                             is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    -- O'chirilganmi (soft delete)
                             is_deleted          BOOLEAN      NOT NULL DEFAULT FALSE,
                             created_at          TIMESTAMP    NOT NULL,
                             updated_at          TIMESTAMP    NOT NULL,
                             CONSTRAINT chk_promo_value_positive CHECK (discount_value > 0),
    -- Foiz 100 dan oshmasligi kerak
                             CONSTRAINT chk_promo_percent_range CHECK (discount_type <> 'PERCENT' OR discount_value <= 100),
                             CONSTRAINT chk_promo_used_count CHECK (used_count >= 0),
                             CONSTRAINT chk_promo_period CHECK (valid_from IS NULL OR valid_to IS NULL OR valid_to > valid_from)
);

-- Kod o'chirilmagan kodlar orasida takrorlanmasligi kerak
CREATE UNIQUE INDEX uq_promo_codes_code_active ON promo_codes (code) WHERE is_deleted = FALSE;