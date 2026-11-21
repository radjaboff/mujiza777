-- Sovg'a rejimi: buyurtma boshqa odamga sovg'a sifatida yuboriladi
ALTER TABLE orders
    ADD COLUMN is_gift           BOOLEAN NOT NULL DEFAULT FALSE,
    -- Anonim sovg'a: qabul qiluvchiga xaridor nomi aytilmaydi
    ADD COLUMN is_anonymous_gift BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN recipient_name    VARCHAR(100),
    ADD COLUMN recipient_phone   VARCHAR(20),
    -- Tabrik matni
    ADD COLUMN gift_message      VARCHAR(300);