-- Mahsulotlar jadvali (tort, pishiriq, konfet va hokazo)
CREATE TABLE products (
    -- Noyob raqam, PostgreSQL o'zi oshirib beradi
                          id                 BIGSERIAL PRIMARY KEY,
    -- Qaysi kategoriyaga tegishli (categories jadvaliga bog'langan)
                          category_id        BIGINT        NOT NULL REFERENCES categories (id),
    -- Mahsulot nomi o'zbek va rus tillarida
                          name_uz            VARCHAR(200)  NOT NULL,
                          name_ru            VARCHAR(200)  NOT NULL,
    -- URL uchun qisqa nom (masalan, "napoleon-torti")
                          slug               VARCHAR(230)  NOT NULL,
    -- Tavsif o'zbek va rus tillarida (ixtiyoriy, uzun matn)
                          description_uz     TEXT,
                          description_ru     TEXT,
    -- Hozirgi sotuv narxi, so'mda (butun son). Aksiya bo'lsa, shu chegirmali narx.
                          price              BIGINT        NOT NULL,
    -- Chegirmadan oldingi odatiy narx (ixtiyoriy). Saytda eski narx chizilgan holda ko'rsatiladi.
                          old_price          BIGINT,
    -- Chegirma qachon tugaydi (ixtiyoriy). Shundan keyin narx old_price ga qaytadi.
                          discount_ends_at   TIMESTAMP,
    -- Vazn yoki o'lcham yozuvi, masalan "1 kg", "6 dona", "500 g"
                          weight_label       VARCHAR(50),
    -- Asosiy rasm manzili (ixtiyoriy)
                          image_url          VARCHAR(500),
    -- Tarkib o'zbek va rus tillarida (ixtiyoriy)
                          ingredients_uz     TEXT,
                          ingredients_ru     TEXT,
    -- Kaloriya, 100 grammga (ixtiyoriy)
                          calories           INT,
    -- Saqlash muddati, soatlarda (ixtiyoriy). Masalan, 72 soat.
                          shelf_life_hours   INT,
    -- Tayyorlanish vaqti, daqiqalarda. 0 bo'lsa hozir tayyor.
                          prep_time_minutes  INT           NOT NULL DEFAULT 0,
    -- Hozir sotuvda bormi (false bo'lsa "mavjud emas" belgisi chiqadi, buyurtma qilib bo'lmaydi)
                          is_available       BOOLEAN       NOT NULL DEFAULT TRUE,
    -- Mashhur mahsulotlar blokida ko'rsatilsinmi
                          is_popular         BOOLEAN       NOT NULL DEFAULT FALSE,
    -- Yangi mahsulotlar blokida ko'rsatilsinmi
                          is_new             BOOLEAN       NOT NULL DEFAULT FALSE,
    -- Katalogda ko'rsatish tartibi (kichik raqam birinchi)
                          sort_order         INT           NOT NULL DEFAULT 0,
    -- O'chirilganmi (soft delete)
                          is_deleted         BOOLEAN       NOT NULL DEFAULT FALSE,
    -- Yaratilgan va o'zgartirilgan vaqtlar (BaseEntity to'ldiradi)
                          created_at         TIMESTAMP     NOT NULL,
                          updated_at         TIMESTAMP     NOT NULL
);

-- slug o'chirilmagan mahsulotlar orasida takrorlanmasligi kerak
CREATE UNIQUE INDEX uq_products_slug_active ON products (slug) WHERE is_deleted = FALSE;
-- Kategoriya bo'yicha mahsulotlarni tez topish uchun
CREATE INDEX idx_products_category ON products (category_id);
-- Katalogni ko'rsatishda eng ko'p ishlatiladigan filtr uchun
CREATE INDEX idx_products_visible ON products (is_deleted, is_available);

-- Mahsulotning qo'shimcha rasmlari (galereya)
CREATE TABLE product_images (
                                id         BIGSERIAL PRIMARY KEY,
    -- Qaysi mahsulotga tegishli (mahsulot o'chirilsa, rasmlari ham o'chadi)
                                product_id BIGINT       NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    -- Rasm manzili
                                image_url  VARCHAR(500) NOT NULL,
    -- Galereyada ko'rsatish tartibi
                                sort_order INT          NOT NULL DEFAULT 0,
                                created_at TIMESTAMP    NOT NULL,
                                updated_at TIMESTAMP    NOT NULL
);
CREATE INDEX idx_product_images_product ON product_images (product_id);

-- Mahsulotdagi allergenlar (bir mahsulotda bir nechta bo'lishi mumkin)
CREATE TABLE product_allergens (
                                   product_id BIGINT      NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    -- Allergen turi: NUTS, MILK, GLUTEN, EGG va hokazo
                                   allergen   VARCHAR(30) NOT NULL,
    -- Bir mahsulotga bir allergen faqat bir marta yoziladi
                                   PRIMARY KEY (product_id, allergen)
);

-- Mahsulotning parhez belgilari (shakarsiz va hokazo)
CREATE TABLE product_diet_tags (
                                   product_id BIGINT      NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    -- Belgi turi: SUGAR_FREE va hokazo
                                   diet_tag   VARCHAR(30) NOT NULL,
                                   PRIMARY KEY (product_id, diet_tag)
);