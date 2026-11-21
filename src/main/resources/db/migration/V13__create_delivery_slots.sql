-- Yetkazish/olib ketish vaqt oynalari (masalan, 14:00-16:00)
CREATE TABLE delivery_slots (
                                id         BIGSERIAL PRIMARY KEY,
    -- Oynaning boshlanish va tugash soati
                                start_time TIME      NOT NULL,
                                end_time   TIME      NOT NULL,
    -- Bir sanada shu oynaga eng ko'pi bilan nechta buyurtma qabul qilinadi
                                capacity   INT       NOT NULL,
    -- Qo'lda yoqish/o'chirish
                                is_active  BOOLEAN   NOT NULL DEFAULT TRUE,
    -- O'chirilganmi (soft delete)
                                is_deleted BOOLEAN   NOT NULL DEFAULT FALSE,
                                created_at TIMESTAMP NOT NULL,
                                updated_at TIMESTAMP NOT NULL,
                                CONSTRAINT chk_delivery_slot_time CHECK (end_time > start_time),
                                CONSTRAINT chk_delivery_slot_capacity CHECK (capacity > 0)
);

-- Buyurtmaga tanlangan sana va oyna (oyna vaqti buyurtma paytidagi nusxa sifatida ham saqlanadi)
ALTER TABLE orders
    ADD COLUMN scheduled_date DATE,
    ADD COLUMN slot_id        BIGINT REFERENCES delivery_slots (id),
    ADD COLUMN slot_start     TIME,
    ADD COLUMN slot_end       TIME;

-- Oyna bandligini tez sanash uchun
CREATE INDEX idx_orders_slot_date ON orders (slot_id, scheduled_date);