-- Tort konstruktori uchun boshlang'ich turlar va variantlarni kiritish
-- Agar bazada hali ma'lumot bo'lmasa, do'kon ishga tushishi bilanoq mijozlar tort yasashi mumkin bo'ladi.

-- 1. Tort shakllari (cake_types)
INSERT INTO cake_types (name_uz, name_ru, image_url, base_price_per_kg, min_weight_kg, max_weight_kg, weight_step, servings_per_kg, sort_order, is_active, is_deleted, created_at, updated_at)
VALUES
('Dumaloq (Klassik)', 'Круглый (Классический)', '/images/cake-round.webp', 140000, 1.50, 10.00, 0.50, 6, 1, TRUE, FALSE, NOW(), NOW()),
('Yurak shaklidagi (Romantik)', 'В форме сердца (Романтический)', '/images/cake-heart.webp', 160000, 1.50, 6.00, 0.50, 6, 2, TRUE, FALSE, NOW(), NOW()),
('To''rtburchak (Bayramona)', 'Прямоугольный (Праздничный)', '/images/cake-square.webp', 150000, 2.00, 15.00, 0.50, 6, 3, TRUE, FALSE, NOW(), NOW()),
('Ko''p yarusli (To''y va Tantana)', 'Многоярусный (Свадебный)', '/images/cake-tiered.webp', 180000, 4.00, 25.00, 1.00, 6, 4, TRUE, FALSE, NOW(), NOW());

-- 2. Biskvit ta'mlari (FLAVOR)
INSERT INTO cake_options (kind, name_uz, name_ru, image_url, price_type, price_value, sort_order, is_active, is_deleted, created_at, updated_at)
VALUES
('FLAVOR', 'Klassik vanilli biskvit', 'Классический ванильный бисквит', NULL, 'FIXED', 0, 1, TRUE, FALSE, NOW(), NOW()),
('FLAVOR', 'Shokoladli boy biskvit', 'Насыщенный шоколадный бисквит', NULL, 'PER_KG', 10000, 2, TRUE, FALSE, NOW(), NOW()),
('FLAVOR', 'Qizil baxmal (Red Velvet)', 'Красный бархат (Red Velvet)', NULL, 'PER_KG', 15000, 3, TRUE, FALSE, NOW(), NOW()),
('FLAVOR', 'Snikers (Yong''oq va karamel)', 'Сникерс (Орехи и карамель)', NULL, 'PER_KG', 20000, 4, TRUE, FALSE, NOW(), NOW());

-- 3. Krem turlari (CREAM)
INSERT INTO cake_options (kind, name_uz, name_ru, image_url, price_type, price_value, sort_order, is_active, is_deleted, created_at, updated_at)
VALUES
('CREAM', 'Krem-chiz (Yengil pishloqli)', 'Крем-чиз (Нежный сливочный сыр)', NULL, 'FIXED', 0, 1, TRUE, FALSE, NOW(), NOW()),
('CREAM', 'Shokoladli ganash', 'Шоколадный ганаш', NULL, 'PER_KG', 15000, 2, TRUE, FALSE, NOW(), NOW()),
('CREAM', 'Plombir (Yumshoq qaymoqli)', 'Пломбир (Сливочно-пломбирный)', NULL, 'PER_KG', 10000, 3, TRUE, FALSE, NOW(), NOW());

-- 4. Bezak va mevalar (DECOR)
INSERT INTO cake_options (kind, name_uz, name_ru, image_url, price_type, price_value, sort_order, is_active, is_deleted, created_at, updated_at)
VALUES
('DECOR', 'Klassik nafis krem bezaklari', 'Классический крем-декор', NULL, 'FIXED', 0, 1, TRUE, FALSE, NOW(), NOW()),
('DECOR', 'Yangi mavsumiy rezavor mevalar', 'Свежие сезонные ягоды', NULL, 'FIXED', 35000, 2, TRUE, FALSE, NOW(), NOW()),
('DECOR', 'Shokoladli podtyok va shirinliklar', 'Шоколадные подтёки и сладости', NULL, 'FIXED', 25000, 3, TRUE, FALSE, NOW(), NOW()),
('DECOR', 'Oltin chang va hashamatli shokolad', 'Золотая пыльца и премиум декор', NULL, 'FIXED', 30000, 4, TRUE, FALSE, NOW(), NOW());

-- 5. Qo'shimcha xizmatlar (EXTRA)
INSERT INTO cake_options (kind, name_uz, name_ru, image_url, price_type, price_value, sort_order, is_active, is_deleted, created_at, updated_at)
VALUES
('EXTRA', 'Shaxsiy tabrik yozuvi (Shokoladda)', 'Индивидуальная поздравительная надпись', NULL, 'FIXED', 0, 1, TRUE, FALSE, NOW(), NOW()),
('EXTRA', 'Bayramona shamchalar to''plami', 'Праздничный набор свечей', NULL, 'FIXED', 15000, 2, TRUE, FALSE, NOW(), NOW()),
('EXTRA', 'Sovg''abop hashamatli quti va lenta', 'Подарочная премиум коробка с атласной лентой', NULL, 'FIXED', 25000, 3, TRUE, FALSE, NOW(), NOW());
