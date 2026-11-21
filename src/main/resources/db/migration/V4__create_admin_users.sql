-- Admin panelga kiruvchi foydalanuvchilar (do'kon egasi, xodimlar, kuryerlar)
CREATE TABLE admin_users (
    -- Noyob raqam, PostgreSQL o'zi oshirib beradi
                             id            BIGSERIAL PRIMARY KEY,
    -- Kirish nomi (login), doim kichik harflarda saqlanadi
                             username      VARCHAR(50)  NOT NULL,
    -- Parolning BCrypt bilan shifrlangan ko'rinishi (asl parol hech qayerda saqlanmaydi)
                             password_hash VARCHAR(100) NOT NULL,
    -- To'liq ismi (panelda ko'rsatish uchun)
                             full_name     VARCHAR(150) NOT NULL,
    -- Roli: ADMIN, STAFF yoki COURIER
                             role          VARCHAR(20)  NOT NULL,
    -- Faolmi (false bo'lsa tizimga kira olmaydi, lekin yozuvi saqlanadi)
                             is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    -- Oxirgi marta tizimga kirgan vaqti (ixtiyoriy)
                             last_login_at TIMESTAMP,
    -- Yaratilgan va o'zgartirilgan vaqtlar (BaseEntity to'ldiradi)
                             created_at    TIMESTAMP    NOT NULL,
                             updated_at    TIMESTAMP    NOT NULL
);

-- Kirish nomi takrorlanmasligi kerak
CREATE UNIQUE INDEX uq_admin_users_username ON admin_users (username);