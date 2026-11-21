-- Mahsulotga o'lchov turi qo'shamiz: PIECE (dona) yoki KG (kilogramm).
-- Hamma mavjud mahsulot hozircha dona hisoblanadi, kg bo'yicha sotiladiganlarni admin keyin o'zgartiradi.
ALTER TABLE products
    ADD COLUMN unit_type     VARCHAR(10)    NOT NULL DEFAULT 'PIECE',
    -- Eng kam buyurtma miqdori (dona uchun 1, kg uchun odatda 0.5)
    ADD COLUMN min_quantity  NUMERIC(10, 3) NOT NULL DEFAULT 1,
    -- Miqdor qadami: masalan 0.5 bo'lsa, 0.5, 1, 1.5... buyurtma qilinadi
    ADD COLUMN quantity_step NUMERIC(10, 3) NOT NULL DEFAULT 1;

ALTER TABLE products
    ADD CONSTRAINT chk_products_quantity_rules CHECK (min_quantity > 0 AND quantity_step > 0);

-- Buyurtma qatorida miqdor endi kasr son bo'lishi mumkin (1.5 kg), o'lchov turi esa buyurtma paytidagi nusxa sifatida saqlanadi
ALTER TABLE order_items
ALTER COLUMN quantity TYPE NUMERIC(10, 3) USING quantity::NUMERIC(10, 3),
    ADD COLUMN unit_type VARCHAR(10) NOT NULL DEFAULT 'PIECE';
