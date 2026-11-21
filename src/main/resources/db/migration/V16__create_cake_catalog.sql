-- Tort turlari (yumaloq, to'rtburchak, yurak va h.k.)
CREATE TABLE cake_types (
                            id                BIGSERIAL PRIMARY KEY,
                            name_uz           VARCHAR(150)  NOT NULL,
                            name_ru           VARCHAR(150)  NOT NULL,
                            image_url         VARCHAR(500),
    -- 1 kg uchun asosiy narx, so'mda
                            base_price_per_kg BIGINT        NOT NULL,
    -- Vazn chegaralari va qadami, kg da (masalan, 1 dan 5 gacha, 0.5 qadam bilan)
                            min_weight_kg     NUMERIC(6, 2) NOT NULL,
                            max_weight_kg     NUMERIC(6, 2) NOT NULL,
                            weight_step       NUMERIC(6, 2) NOT NULL,
    -- 1 kg tortdan taxminan nechta kishiga porsiya chiqadi (ixtiyoriy, mijozga ko'rsatish uchun)
                            servings_per_kg   INT,
                            sort_order        INT           NOT NULL DEFAULT 0,
                            is_active         BOOLEAN       NOT NULL DEFAULT TRUE,
                            is_deleted        BOOLEAN       NOT NULL DEFAULT FALSE,
                            created_at        TIMESTAMP     NOT NULL,
                            updated_at        TIMESTAMP     NOT NULL,
                            CONSTRAINT chk_cake_type_price CHECK (base_price_per_kg > 0),
                            CONSTRAINT chk_cake_type_weight CHECK (min_weight_kg > 0 AND max_weight_kg >= min_weight_kg AND weight_step > 0)
);

-- Tort variantlari: qatlam ta'mi, krem, bezak, qo'shimcha xizmatlar
CREATE TABLE cake_options (
                              id          BIGSERIAL PRIMARY KEY,
    -- Guruhi: FLAVOR (qatlam ta'mi), CREAM (krem), DECOR (bezak), EXTRA (qo'shimcha)
                              kind        VARCHAR(10)  NOT NULL,
                              name_uz     VARCHAR(150) NOT NULL,
                              name_ru     VARCHAR(150) NOT NULL,
                              image_url   VARCHAR(500),
    -- Narx turi: PER_KG (har 1 kg uchun qo'shimcha) yoki FIXED (aniq summa)
                              price_type  VARCHAR(10)  NOT NULL,
    -- Qo'shimcha narx, so'mda (0 bo'lsa, bepul variant)
                              price_value BIGINT       NOT NULL DEFAULT 0,
                              sort_order  INT          NOT NULL DEFAULT 0,
                              is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
                              is_deleted  BOOLEAN      NOT NULL DEFAULT FALSE,
                              created_at  TIMESTAMP    NOT NULL,
                              updated_at  TIMESTAMP    NOT NULL,
                              CONSTRAINT chk_cake_option_price CHECK (price_value >= 0)
);
CREATE INDEX idx_cake_options_kind ON cake_options (kind);