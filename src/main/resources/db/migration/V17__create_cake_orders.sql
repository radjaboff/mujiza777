-- Buyurtma tort buyurtmasimi (admin ro'yxatida ajratib ko'rsatish uchun)
ALTER TABLE orders
    ADD COLUMN is_cake_order BOOLEAN NOT NULL DEFAULT FALSE;

-- Tort buyurtmasining tafsilotlari (har bir tort buyurtmasiga bitta qator)
CREATE TABLE cake_requests (
                               id                  BIGSERIAL PRIMARY KEY,
    -- Qaysi buyurtmaga tegishli (buyurtma o'chirilsa, bu ham o'chadi)
                               order_id            BIGINT        NOT NULL UNIQUE REFERENCES orders (id) ON DELETE CASCADE,
    -- Tanlangan tort turi va uning nomining buyurtma paytidagi nusxasi
                               cake_type_id        BIGINT REFERENCES cake_types (id),
                               type_name_uz        VARCHAR(150)  NOT NULL,
                               type_name_ru        VARCHAR(150)  NOT NULL,
    -- Vazn, kg da
                               weight_kg           NUMERIC(6, 2) NOT NULL,
    -- Tortga yoziladigan yozuv (ixtiyoriy)
                               inscription         VARCHAR(100),
    -- Mijoz yuklagan namuna rasm manzili (ixtiyoriy)
                               reference_image_url VARCHAR(500),
    -- Server hisoblagan narx, so'mda
                               calculated_price    BIGINT        NOT NULL,
    -- Do'kon tasdiqlagan yakuniy narx (tasdiqlangunga qadar bo'sh)
                               final_price         BIGINT,
    -- Narx haqida izoh (mijozga ham ko'rinadi)
                               admin_note          VARCHAR(300),
                               created_at          TIMESTAMP     NOT NULL,
                               updated_at          TIMESTAMP     NOT NULL
);

-- Tanlangan variantlar (nom va narx buyurtma paytidagi nusxa sifatida saqlanadi)
CREATE TABLE cake_request_options (
                                      id              BIGSERIAL PRIMARY KEY,
                                      cake_request_id BIGINT       NOT NULL REFERENCES cake_requests (id) ON DELETE CASCADE,
                                      kind            VARCHAR(10)  NOT NULL,
                                      name_uz         VARCHAR(150) NOT NULL,
                                      name_ru         VARCHAR(150) NOT NULL,
                                      price_type      VARCHAR(10)  NOT NULL,
                                      price_value     BIGINT       NOT NULL,
    -- Shu variantning shu tortdagi summasi, so'mda
                                      amount          BIGINT       NOT NULL,
                                      created_at      TIMESTAMP    NOT NULL,
                                      updated_at      TIMESTAMP    NOT NULL
);
CREATE INDEX idx_cake_request_options_request ON cake_request_options (cake_request_id);