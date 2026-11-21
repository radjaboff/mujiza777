-- Do'kon filiallari (olib ketish va aloqa uchun)
CREATE TABLE branches (
    -- Noyob raqam, PostgreSQL o'zi oshirib beradi
                          id                  BIGSERIAL PRIMARY KEY,
    -- Filial nomi o'zbek va rus tillarida
                          name_uz             VARCHAR(150)     NOT NULL,
                          name_ru             VARCHAR(150)     NOT NULL,
    -- Manzil o'zbek va rus tillarida
                          address_uz          VARCHAR(300)     NOT NULL,
                          address_ru          VARCHAR(300)     NOT NULL,
    -- Telefon raqami, +998901234567 ko'rinishida
                          phone               VARCHAR(20)      NOT NULL,
    -- Ish vaqti matn ko'rinishida, masalan "09:00 - 22:00" (ixtiyoriy)
                          work_hours          VARCHAR(100),
    -- Xaritadagi joylashuvi: kenglik va uzunlik (ixtiyoriy)
                          latitude            DOUBLE PRECISION,
                          longitude           DOUBLE PRECISION,
    -- Filial rasmi (ixtiyoriy)
                          image_url           VARCHAR(500),
    -- Shu filialdan mahsulotni olib ketish mumkinmi
                          is_pickup_available BOOLEAN          NOT NULL DEFAULT TRUE,
    -- Saytda ko'rinadimi
                          is_active           BOOLEAN          NOT NULL DEFAULT TRUE,
    -- Saytda ko'rsatish tartibi (kichik raqam birinchi)
                          sort_order          INT              NOT NULL DEFAULT 0,
    -- O'chirilganmi (soft delete)
                          is_deleted          BOOLEAN          NOT NULL DEFAULT FALSE,
    -- Yaratilgan va o'zgartirilgan vaqtlar (BaseEntity to'ldiradi)
                          created_at          TIMESTAMP        NOT NULL,
                          updated_at          TIMESTAMP        NOT NULL
);