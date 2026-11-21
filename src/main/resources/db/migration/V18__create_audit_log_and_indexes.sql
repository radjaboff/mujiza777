-- "Birga olinadi" tavsiyalari uchun: buyurtma qatorlarini mahsulot bo'yicha tez topish
CREATE INDEX idx_order_items_product ON order_items (product_id);

-- O'zgarishlar tarixi: kim, qachon, nimani o'zgartirdi
CREATE TABLE audit_log (
                           id          BIGSERIAL PRIMARY KEY,
    -- Amalni bajargan foydalanuvchining kirish nomi ("system" yoki "telegram:@..." ham bo'lishi mumkin)
                           actor       VARCHAR(50)  NOT NULL,
    -- Amal kodi, masalan PRODUCT_UPDATED
                           action      VARCHAR(40)  NOT NULL,
    -- Nima o'zgargani: PRODUCT, ORDER, PROMO_CODE, SETTINGS, STAFF
                           entity_type VARCHAR(30)  NOT NULL,
                           entity_id   BIGINT,
    -- Qisqa tafsilot (parollar va maxfiy ma'lumot hech qachon yozilmaydi)
                           details     VARCHAR(500),
                           created_at  TIMESTAMP    NOT NULL,
                           updated_at  TIMESTAMP    NOT NULL
);
CREATE INDEX idx_audit_log_created_at ON audit_log (created_at);
CREATE INDEX idx_audit_log_entity ON audit_log (entity_type, entity_id);