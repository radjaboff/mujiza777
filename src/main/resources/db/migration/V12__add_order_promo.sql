-- Buyurtmaga qo'llangan promo kod va u bergan chegirma
ALTER TABLE orders
    -- Qo'llangan promo kod (KATTA harflarda), kod ishlatilmagan bo'lsa bo'sh
    ADD COLUMN promo_code      VARCHAR(30),
    -- Promo kod bergan chegirma, so'mda (kod bo'lmasa 0)
    ADD COLUMN discount_amount BIGINT NOT NULL DEFAULT 0;

-- Chegirma manfiy bo'lishi mumkin emas
ALTER TABLE orders
    ADD CONSTRAINT chk_orders_discount_nonneg CHECK (discount_amount >= 0);