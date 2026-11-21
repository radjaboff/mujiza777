-- Buyurtma raqamlari uchun hisoblagich: 1001, 1002, 1003... (buyurtmalar soni tashqaridan bilinmasligi uchun 1001 dan boshlanadi)
CREATE SEQUENCE order_number_seq START WITH 1001 INCREMENT BY 1;

-- Buyurtmalar jadvali ("order" so'zi SQL'da zaxiralangan, shuning uchun orders)
CREATE TABLE orders (
                        id                 BIGSERIAL PRIMARY KEY,
    -- Mijozga ko'rinadigan raqam, masalan MJ-1001
                        order_number       VARCHAR(20)      NOT NULL,
    -- Buyurtmani kuzatish uchun taxmin qilib bo'lmaydigan tasodifiy kalit (UUID)
                        tracking_token     VARCHAR(36)      NOT NULL,
    -- Mijoz ismi va telefoni (+998901234567)
                        customer_name      VARCHAR(100)     NOT NULL,
                        customer_phone     VARCHAR(20)      NOT NULL,
    -- Buyurtma turi: PICKUP (olib ketish) yoki DELIVERY (yetkazib berish)
                        order_type         VARCHAR(20)      NOT NULL,
    -- Olib ketish bo'lsa: qaysi filialdan (yetkazib berishda bo'sh)
                        branch_id          BIGINT REFERENCES branches (id),
    -- Yetkazib berish bo'lsa: manzil va xaritadagi joy (olib ketishda bo'sh)
                        delivery_address   VARCHAR(300),
                        latitude           DOUBLE PRECISION,
                        longitude          DOUBLE PRECISION,
    -- To'lov usuli: CASH (naqd) yoki CARD (kartada, kuryerga yoki do'konda)
                        payment_method     VARCHAR(20)      NOT NULL,
    -- Mijozning izohi (ixtiyoriy)
                        comment            VARCHAR(500),
    -- Holati: NEW, PRICE_PENDING, CONFIRMED, PREPARING, READY, DELIVERING, COMPLETED, CANCELLED
                        status             VARCHAR(20)      NOT NULL,
    -- Mahsulotlar summasi, yetkazib berish narxi va jami, so'mda
                        items_total        BIGINT           NOT NULL,
                        delivery_fee       BIGINT           NOT NULL DEFAULT 0,
                        total_amount       BIGINT           NOT NULL,
    -- Olib ketishda do'konda ko'rsatiladigan 4 xonali kod
                        pickup_code        VARCHAR(4),
    -- Taxminiy tayyor bo'lish vaqti
                        estimated_ready_at TIMESTAMP,
    -- Bekor qilingan bo'lsa sababi
                        cancel_reason      VARCHAR(300),
                        created_at         TIMESTAMP        NOT NULL,
                        updated_at         TIMESTAMP        NOT NULL
);

CREATE UNIQUE INDEX uq_orders_number ON orders (order_number);
CREATE UNIQUE INDEX uq_orders_tracking_token ON orders (tracking_token);
-- Admin ro'yxatida holat, sana va telefon bo'yicha tez qidirish uchun
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_created_at ON orders (created_at);
CREATE INDEX idx_orders_customer_phone ON orders (customer_phone);

-- Buyurtmadagi mahsulotlar (har bir qator bitta mahsulot)
CREATE TABLE order_items (
                             id              BIGSERIAL PRIMARY KEY,
    -- Qaysi buyurtmaga tegishli
                             order_id        BIGINT       NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    -- Qaysi mahsulot
                             product_id      BIGINT       NOT NULL REFERENCES products (id),
    -- Mahsulot nomining buyurtma paytidagi nusxasi (keyin nom o'zgarsa ham eski buyurtma o'zgarmaydi)
                             product_name_uz VARCHAR(200) NOT NULL,
                             product_name_ru VARCHAR(200) NOT NULL,
    -- Soni
                             quantity        INT          NOT NULL CHECK (quantity > 0),
    -- Buyurtma paytidagi bitta mahsulot narxi (keyin narx o'zgarsa ham eski buyurtma o'zgarmaydi)
                             unit_price      BIGINT       NOT NULL,
    -- Shu qatorning summasi: narx * soni
                             line_total      BIGINT       NOT NULL,
                             created_at      TIMESTAMP    NOT NULL,
                             updated_at      TIMESTAMP    NOT NULL
);
CREATE INDEX idx_order_items_order ON order_items (order_id);

-- Buyurtma holatlari tarixi (kuzatuv sahifasi va audit uchun)
CREATE TABLE order_status_history (
                                      id         BIGSERIAL PRIMARY KEY,
                                      order_id   BIGINT       NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    -- Qaysi holatga o'tgani
                                      status     VARCHAR(20)  NOT NULL,
    -- Kim o'zgartirgani: admin logini, "customer" yoki "system"
                                      changed_by VARCHAR(50)  NOT NULL,
    -- Izoh (masalan, bekor qilish sababi), ixtiyoriy
                                      note       VARCHAR(300),
    -- created_at: o'zgarish vaqti
                                      created_at TIMESTAMP    NOT NULL,
                                      updated_at TIMESTAMP    NOT NULL
);
CREATE INDEX idx_order_status_history_order ON order_status_history (order_id);