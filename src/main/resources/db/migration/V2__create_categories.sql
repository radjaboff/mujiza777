-- Kategoriyalar jadvali (tortlar, konfetlar, pishiriqlar va hokazo)
CREATE TABLE categories (
    -- Noyob raqam, PostgreSQL o'zi 1, 2, 3... deb oshirib beradi
                            id         BIGSERIAL PRIMARY KEY,
    -- Kategoriya nomi o'zbek tilida (majburiy)
                            name_uz    VARCHAR(150) NOT NULL,
    -- Kategoriya nomi rus tilida (majburiy)
                            name_ru    VARCHAR(150) NOT NULL,
    -- URL uchun qisqa nom, masalan "tortlar" (sayt manzilida ko'rinadi: /katalog/tortlar)
                            slug       VARCHAR(180) NOT NULL,
    -- Kategoriya rasmining manzili (ixtiyoriy)
                            image_url  VARCHAR(500),
    -- Saytda ko'rsatish tartibi: kichik raqam birinchi chiqadi
                            sort_order INT          NOT NULL DEFAULT 0,
    -- Saytda ko'rinadimi (false bo'lsa mijozlardan yashiriladi)
                            is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
    -- O'chirilganmi (soft delete: yozuv bazadan o'chmaydi, faqat belgilanadi)
                            is_deleted BOOLEAN      NOT NULL DEFAULT FALSE,
    -- Yaratilgan vaqt (BaseEntity to'ldiradi)
                            created_at TIMESTAMP    NOT NULL,
    -- Oxirgi o'zgartirilgan vaqt (BaseEntity to'ldiradi)
                            updated_at TIMESTAMP    NOT NULL
);

-- slug faqat o'chirilmagan kategoriyalar orasida takrorlanmasligi kerak.
-- Shunda o'chirilgan "tortlar" dan keyin yangi "tortlar" kategoriyasini yaratish mumkin bo'ladi.
CREATE UNIQUE INDEX uq_categories_slug_active ON categories (slug) WHERE is_deleted = FALSE;