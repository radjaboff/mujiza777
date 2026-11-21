# Mujiza 777 — Onlayn platforma: Backend Texnik Topshiriq (TZ v2.0)

**Muallif:** Akmal  
**Sana:** 2026-11-05  
**Holat:** 2-versiya (Loyiha amaliyoti va barcha yangi imkoniyatlar asosida to‘liq yangilangan)  
**Texnologik stek:** Java 17+, Spring Boot 3.x, Spring Data JPA, PostgreSQL (Flyway V1–V18), Spring Security (JWT / HttpOnly Cookie), SSE (Server-Sent Events), Telegram Bot API, OpenPDF, Apache POI (Excel export), Bucket4j (Rate Limiting), Caffeine Cache.

---

## 1. Loyiha maqsadi va vazifasi

Qarshi shahridagi eng mashhur va yetakchi qandolat uyi **«Mo‘jiza 777»** uchun zamonaviy, xavfsiz va yuqori yuklamalarga chidamli onlayn savdo platformasining backend tizimini ta'minlash:
* Mijozlar veb-sayt orqali ro‘yxatdan o‘tmasdan (mehmon sifatida) 200 dan ortiq mahsulotlarni ko‘radi, savatga qo‘shadi, olib ketish yoki kuryerlik yetkazish orqali buyurtma beradi;
* **Sotish birliklari:** Mahsulotlarni ham **Dona (PIECE)**, ham **Kilogramm (KG)** bo‘yicha aniq narxlash, minimal miqdor (`minQuantity`) va qadam (`quantityStep`) tizimi;
* **Real vaqtda kuzatuv:** Server-Sent Events (SSE) texnologiyasi orqali buyurtma holatini jonli yangilash va filialdan olib ketish uchun 4 xonali xavfsiz PIN-kod (`pickupCode`);
* **Interaktiv tort konstruktori:** Mijoz o‘z xohishiga ko‘ra tort shakli, vazni, qatlam ta'mi, kremi, bezagi va namunaviy suratini yuklab buyurtma berishi, serverda narx hisoblanishi va admin tomonidan tasdiqlanishi (`PRICE_PENDING`);
* **Yetkazish vaqt oynalari (Delivery Slots):** Har bir 2 soatlik oraliq uchun kunlik sig‘imni nazorat qilish va pessimizm qulflash (pessimistic lock) orqali kuryerlik yuklamasini taqsimlash;
* **Promokodlar va aksiyalar:** Foizli va qat'iy summali promokodlar, birinchi buyurtma cheklovi, foydalanish soni nazorati;
* **To‘y va marosimlar keyteringi:** Katta tadbirlar uchun so‘rov qoldirish va admin boshqaruvi;
* **Sodiqlik va qayta buyurtma:** Mijozning oldingi buyurtmalari tarixi va bir bosishda qayta buyurtma qilish (Reorder);
* **Admin panel va Telegram Bot:** Do‘kon xodimlari uchun to‘liq analitika, Excel hisobotlar, tovushli yangi buyurtma signallari va Telegram inline tugmalar orqali tezkor boshqaruv.

---

## 2. Raqobat tahlili va bizning ustunlik

«Mo‘jiza 777» platformasi O‘zbekiston qandolat bozoridagi yetakchi tarmoqlar (Axmad.uz va SafiaBakery.uz)ning eng kuchli tomonlarini birlashtirib, ularda mavjud bo‘lmagan yangi yechimlarni taqdim etadi:

| Imkoniyat | axmad.uz | safiabakery.uz | Mo‘jiza 777 (Backend v2.0) |
|---|---|---|---|
| **Saytdan to‘g‘ridan-to‘g‘ri savat va buyurtma** | Bor | Yo‘q (faqat ilova) | **Bor (mehmon rejimida, tezkor)** |
| **Sotish birliklari (Dona va KG)** | Qisman | Qisman | **To‘liq (`unitType: PIECE \| KG`, `minQuantity`, `quantityStep`)** |
| **Ko‘p fotosuratli galereya** | 1 ta rasm | 1–2 ta rasm | **Asosiy rasm + `imageUrls` (razrez, bezak, qadoq)** |
| **Olib ketish va Yetkazish tanlovi** | Bor | Cheklangan | **Bor (filiallar tanlovi + Yandex/GPS koordinatalar)** |
| **Interaktiv tort konstruktori** | Yo‘q | Faqat maqolalar | **Bor (`CakeBuilder`: jonli narx, namuna rasm, admin tasdig‘i)** |
| **Jonli buyurtma kuzatuvi (Tracking)** | Yo‘q | Yo‘q | **Bor (SSE stream + 4 xonali PIN + status timeline)** |
| **Vaqt oynalari (Delivery Slots)** | Yo‘q | Yo‘q | **Bor (kunlik sig‘im nazorati, DB qulflash)** |
| **Sovg‘a rejimi (Gift Mode)** | Yo‘q | Yo‘q | **Bor (tabriknoma, anonimlik, kuryer maxfiyligi)** |
| **Promokodlar tizimi** | Yo‘q | Faqat ilovada | **Bor (foizli, qat'iy summa, atomik hisob)** |
| **Mavsumiy bayram mavzulari** | Yo‘q | Yo‘q | **Bor (`DEFAULT`, `NAVRUZ`, `HAYIT`, `MARCH_8`, `NEW_YEAR`)** |
| **Telegram Bot boshqaruvi** | Yo‘q | Qisman | **Bor (Inline tugmalar: Qabul qilish, Tayyor, Bekor)** |
| **Mijoz qayta buyurtmasi (Reorder)** | Yo‘q | Qisman | **Bor (Tarixdagi buyurtmalarni bir bosishda savatga yuklash)** |

---

## 3. Foydalanuvchilar va rollar

1. **Mijoz (Mehmon / Guest):**
   * Ro‘yxatdan o‘tmasdan (parolsiz) mahsulotlarni ko‘radi va buyurtma beradi;
   * Buyurtma berilgach, noyob tasodifiy xavfsiz `trackingToken` (UUID) orqali o‘z buyurtmasini real vaqtda kuzatadi;
   * `NEW` yoki `PRICE_PENDING` holatida buyurtmani o‘zi bekor qila oladi;
   * Oldingi bergan buyurtmalarini brauzerida saqlab, bir bosishda qayta savatga yuklay oladi (Reorder).
2. **Admin (Do‘kon egasi):**
   * Barcha ma'lumotlar, mahsulotlar, narxlar, filiallar, sozlamalar, xodimlar boshqaruvi, audit log va analitika hisobotlariga to‘liq huquqqa ega.
3. **Xodim (Staff):**
   * Buyurtmalar ro‘yxati, statuslarni o‘zgartirish, tort narxlarini tasdiqlash, mahsulot mavjudligini o‘zgartirish, keytering so‘rovlarini qayta ishlash huquqi (tizim sozlamalariga kira olmaydi).
4. **Kuryer (Courier):**
   * Faqat o‘ziga biriktirilgan yetkazish buyurtmalari bilan ishlaydi (Telegram bot orqali holatni `DELIVERING` va `COMPLETED` ga o‘tkazadi).

---

## 4. Loyihaning to‘liq imkoniyatlari (A va B darajalari)

### 4.1. A daraja (Amaldagi ishlab chiqilgan to‘liq imkoniyatlar)
1. **Dona va KG bo‘yicha sotish tizimi:**
   * Donalik shirinliklar (makaron, kruassan, pirojniy, eyler): butun sonlarda (`1, 2, 3 dona`), minimal miqdor `1`, qadam `1`.
   * Og‘irlikdagi shirinliklar (medovik, chizkeyk, biskvit, paxlava): kasr sonlarda (`0.5 kg, 1.0 kg, 1.5 kg...`), minimal miqdor `0.5`, qadam `0.5`.
2. **Jonli buyurtma kuzatuvi (SSE Stream):**
   * Har bir buyurtmaga maxfiy UUID token biriktiriladi (`/order/{token}`).
   * Server-Sent Events orqali brauzer server bilan doimiy aloqada bo‘ladi va status o‘zgarganda (masalan, oshxona tortni pishirib `READY` qilganda) sahifa soniya ichida jonli yangilanadi.
   * Do‘kondan olib ketish uchun 4 xonali tasodifiy `pickupCode` ko‘rsatiladi.
3. **Interaktiv Tort Konstruktori:**
   * Mijoz tort turini (biskvit, shokoladli, qizil baxmal...), vaznini (1 kg dan 10 kg gacha), qatlam ta'mini, kremini va maxsus bezaklarini tanlaydi;
   * Jonli narx serverda hisoblanadi:
     $$\text{Narx} = (P_{kg} + \sum a_i) \cdot W + \sum b_j$$
     Bu yerda $P_{kg}$ — asosiy kg narxi, $a_i$ — 1 kg ga qo‘shimchalar, $W$ — vazn, $b_j$ — qat'iy xizmatlar (yozuv, fotosurat).
   * Namunaviy rasm yuklanadi (`POST /api/public/files/cake-reference`);
   * Buyurtma `PRICE_PENDING` holatida tushadi va admin yakuniy narxni tasdiqlagach `CONFIRMED` holatiga o‘tadi.
4. **Yetkazib berish vaqt oynalari (Delivery Slots):**
   * Mijoz yetkazish sanasi va 2 soatlik oraliqni tanlaydi (masalan, `14:00 – 16:00`).
   * Har bir oraliqning o‘z sig‘imi (`capacity`) bor. Bo‘sh joy qolmaganda oraliq `FULL` deb belgilanadi.
   * Agar savatdagi mahsulot tayyorlanishi 120 daqiqa talab qilsa, yaqin oraliqlar avtomatik `TOO_SOON` belgisi bilan bloklanadi.
5. **Promokodlar tizimi:**
   * Foizli (`PERCENT`) yoki aniq summali (`FIXED`) promokodlar;
   * Minimal buyurtma summasi (`minOrderAmount`), maksimal chegirma chegarasi (`maxDiscountAmount`), foydalanishlar soni (`maxUses`), faqat birinchi buyurtma cheklovi (`firstOrderOnly`);
   * Kodni tekshirish uchun alohida xavfsiz endpoint: `POST /api/public/promo/validate`.
6. **Sovg‘a rejimi (Gift Mode):**
   * Boshqa inson nomiga sovg‘a qilib buyurtma berish;
   * Qabul qiluvchi ismi, telefoni, tabriknoma matni (300 belgiga qadar);
   * Anonim sovg‘a opsiyasi: kuryer va chekda buyurtmachi ismi mutlaqo ko‘rsatilmaydi.
7. **To‘y va marosimlar keyteringi:**
   * Katta tadbirlar uchun ariza qoldirish formasi: tadbir turi, sana, mehmonlar soni, byudjet va istaklar;
   * Admin panelda status oqimi: `NEW` → `CONTACTED` → `DONE` / `REJECTED`.
8. **Aqlli tavsiyalar («Birga olinadi»):**
   * Oxirgi 90 kunlik buyurtmalar tahlili asosida tanlangan mahsulot bilan birga eng ko‘p xarid qilingan shirinliklar tavsiya etiladi.
9. **Tarkib, KBJU va Allergenlar:**
   * Kaloriya (100g ga), saqlash muddati (soatlarda), allergen belgilari (yong‘oq, sut, tuxum, gluten, soya, kunjut) va parhez belgilari (shakarsiz, glutensiz, halol).
10. **Telegram Bot integratsiyasi:**
    * Yangi buyurtma tushganda do‘kon Telegram guruhiga barcha tafsilotlar (mijoz, telefon, mahsulotlar birligi bilan, manzil/filial) boradi;
    * Inline tugmalar: «✅ Qabul qilish», «🎂 Tayyor», «❌ Bekor qilish».

### 4.2. B daraja (Keyingi bosqich kengaytmalari)
* Onlayn to‘lov shlyuzlari (Click, Payme, Uzum Bank);
* Mijoz shaxsiy kabineti (SMS OTP orqali kirish);
* Sodiqlik ballari va keshbek tizimi;
* Muhim sanalar (tug‘ilgan kun, yillik) bo‘yicha avtomatik Telegram eslatmalari.

---

## 5. Ma'lumotlar bazasi va Entity arxitekturasi (Flyway V1–V18)

Barcha jadvallar `BaseEntity` (`createdAt`, `updatedAt`) orqali audit qilinadi. Migratsiyalar Flyway orqali qat'iy versiyalangan.

### 5.1. Katalog va Mahsulotlar (V1, V2, V3, V8)

#### `Category`
```sql
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name_uz VARCHAR(255) NOT NULL,
    name_ru VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    image_url VARCHAR(500),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

#### `Product` (Dona va KG tizimi bilan)
```sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT REFERENCES categories(id),
    name_uz VARCHAR(255) NOT NULL,
    name_ru VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description_uz TEXT,
    description_ru TEXT,
    price BIGINT NOT NULL,                        -- 1 dona yoki 1 kg narxi (so'mda)
    old_price BIGINT,                             -- Eski narx (chegirma bo'lsa)
    discount_ends_at TIMESTAMP,                   -- Chegirma tugash taymeri
    unit_type VARCHAR(20) DEFAULT 'PIECE' NOT NULL, -- Enum: 'PIECE' | 'KG'
    min_quantity NUMERIC(10,2) DEFAULT 1 NOT NULL, -- kg: 0.5, dona: 1
    quantity_step NUMERIC(10,2) DEFAULT 1 NOT NULL,-- kg: 0.5, dona: 1
    weight_label VARCHAR(100),                    -- Yordamchi matn: '1 kg', '6 dona'
    image_url VARCHAR(500),                       -- Asosiy fotosurat
    prep_time_minutes INT DEFAULT 0,              -- 0 = "Hozir tayyor", >0 = daqiqa
    is_available BOOLEAN DEFAULT TRUE NOT NULL,
    is_popular BOOLEAN DEFAULT FALSE NOT NULL,
    is_new BOOLEAN DEFAULT FALSE NOT NULL,
    sort_order INT DEFAULT 0,
    ingredients_uz TEXT,
    ingredients_ru TEXT,
    calories INT,                                 -- 100 grammda kkal
    shelf_life_hours INT,                         -- Saqlash muddati soatlarda
    allergens VARCHAR(255)[],                     -- NUTS, MILK, GLUTEN, EGG, SOY...
    diet_tags VARCHAR(255)[],                     -- SUGAR_FREE, GLUTEN_FREE, VEGAN...
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

#### `ProductImage` (Ko‘p fotosuratli galereya)
```sql
CREATE TABLE product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    sort_order INT DEFAULT 0
);
```

---

### 5.2. Filiallar va Sozlamalar (V5, V6, V10)

#### `Branch` (Filiallar)
```sql
CREATE TABLE branches (
    id BIGSERIAL PRIMARY KEY,
    name_uz VARCHAR(255) NOT NULL,
    name_ru VARCHAR(255) NOT NULL,
    address_uz VARCHAR(500) NOT NULL,
    address_ru VARCHAR(500) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    work_hours VARCHAR(100),
    latitude NUMERIC(10,6),
    longitude NUMERIC(10,6),
    image_url VARCHAR(500),
    images TEXT[],                                -- Avto-slayder galereyasi
    is_pickup_available BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

#### `ShopSettings` (Do‘kon sozlamalari, Singleton)
```sql
CREATE TABLE shop_settings (
    id BIGSERIAL PRIMARY KEY,
    phone VARCHAR(50) NOT NULL,
    open_time TIME NOT NULL,                      -- '09:00:00'
    close_time TIME NOT NULL,                     -- '22:00:00'
    accepting_orders BOOLEAN DEFAULT TRUE,        -- Onlayn savdo yoqilgan/o'chiq
    delivery_enabled BOOLEAN DEFAULT TRUE,        -- Yetkazib berish xizmati
    delivery_fee BIGINT DEFAULT 15000 NOT NULL,
    free_delivery_from BIGINT DEFAULT 150000,
    min_order_amount BIGINT DEFAULT 40000,
    cake_min_advance_hours INT DEFAULT 24,
    season_theme VARCHAR(50) DEFAULT 'DEFAULT',   -- DEFAULT, NAVRUZ, HAYIT, MARCH_8, NEW_YEAR
    telegram_url VARCHAR(255),
    instagram_url VARCHAR(255),
    updated_at TIMESTAMP NOT NULL
);
```

---

### 5.3. Buyurtmalar, Sovg‘a va Olib Ketish PIN-kodi (V7, V12, V13, V14)

#### `CustomerOrder`
```sql
CREATE TABLE customer_orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,     -- 'MJ-1042'
    tracking_token VARCHAR(64) UNIQUE NOT NULL,   -- UUID
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,          -- '+998901234567'
    order_type VARCHAR(20) NOT NULL,              -- 'PICKUP' | 'DELIVERY'
    delivery_address VARCHAR(500),
    latitude NUMERIC(10,6),
    longitude NUMERIC(10,6),
    branch_id BIGINT REFERENCES branches(id),
    payment_method VARCHAR(20) NOT NULL,          -- 'CASH' | 'CARD'
    comment TEXT,
    status VARCHAR(30) NOT NULL,                  -- NEW, PRICE_PENDING, CONFIRMED, PREPARING, READY, DELIVERING, COMPLETED, CANCELLED
    items_total BIGINT NOT NULL,
    delivery_fee BIGINT NOT NULL,
    discount_amount BIGINT DEFAULT 0 NOT NULL,
    total_amount BIGINT NOT NULL,
    pickup_code VARCHAR(10),                      -- 4 xonali tasodifiy PIN (masalan: '4729')
    estimated_ready_at TIMESTAMP,
    cancel_reason TEXT,
    -- Sovg'a maydonlari:
    is_gift BOOLEAN DEFAULT FALSE,
    is_anonymous_gift BOOLEAN DEFAULT FALSE,
    recipient_name VARCHAR(100),
    recipient_phone VARCHAR(20),
    gift_message TEXT,
    -- Vaqt oynasi maydonlari:
    scheduled_date DATE,
    slot_id BIGINT REFERENCES delivery_slots(id),
    -- Promokod:
    promo_code_id BIGINT REFERENCES promo_codes(id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

#### `OrderItem` (Narx qotirish va Birliklar)
```sql
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES customer_orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id),
    product_name_at_order VARCHAR(255) NOT NULL,
    unit_type VARCHAR(20) NOT NULL,               -- 'PIECE' | 'KG'
    quantity NUMERIC(10,2) NOT NULL,              -- 1.5 kg yoki 2 dona
    unit_price_at_order BIGINT NOT NULL,          -- Sotib olingan paytdagi narx
    line_total BIGINT NOT NULL                    -- quantity * unit_price_at_order
);
```

---

### 5.4. Promokodlar, Vaqt Oynalari va Tort Konstruktori (V11, V15, V16, V17, V18)

#### `PromoCode`
```sql
CREATE TABLE promo_codes (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,             -- 'MUJIZA15', 'BEPUL777'
    description VARCHAR(255),
    discount_type VARCHAR(20) NOT NULL,           -- 'PERCENT' | 'FIXED'
    discount_value BIGINT NOT NULL,
    max_discount_amount BIGINT,                   -- Foizli chegirma uchun chegara
    min_order_amount BIGINT DEFAULT 0,
    max_uses INT,
    used_count INT DEFAULT 0 NOT NULL,
    first_order_only BOOLEAN DEFAULT FALSE,
    valid_from TIMESTAMP,
    valid_to TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL
);
```

#### `DeliverySlot`
```sql
CREATE TABLE delivery_slots (
    id BIGSERIAL PRIMARY KEY,
    start_time TIME NOT NULL,                     -- '10:00:00'
    end_time TIME NOT NULL,                       -- '12:00:00'
    capacity INT DEFAULT 10 NOT NULL,             -- Bir vaqtdagi buyurtma sig'imi
    is_active BOOLEAN DEFAULT TRUE
);
```

#### `CakeType`, `CakeOptionGroup`, `CakeOption`, `CakeRequest`
```sql
CREATE TABLE cake_types (
    id BIGSERIAL PRIMARY KEY,
    name_uz VARCHAR(255) NOT NULL,
    name_ru VARCHAR(255) NOT NULL,
    image_url VARCHAR(500),
    base_price_per_kg BIGINT NOT NULL,
    min_weight_kg NUMERIC(4,2) DEFAULT 1.0 NOT NULL,
    max_weight_kg NUMERIC(4,2) DEFAULT 10.0 NOT NULL,
    weight_step NUMERIC(4,2) DEFAULT 0.5 NOT NULL,
    servings_per_kg INT DEFAULT 6,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE cake_option_groups (
    id BIGSERIAL PRIMARY KEY,
    name_uz VARCHAR(255) NOT NULL,
    name_ru VARCHAR(255) NOT NULL,
    kind VARCHAR(30) NOT NULL,                    -- 'FLAVOR' | 'CREAM' | 'DECOR' | 'EXTRA'
    is_required BOOLEAN DEFAULT FALSE,
    max_choices INT DEFAULT 1,
    sort_order INT DEFAULT 0
);

CREATE TABLE cake_options (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES cake_option_groups(id) ON DELETE CASCADE,
    name_uz VARCHAR(255) NOT NULL,
    name_ru VARCHAR(255) NOT NULL,
    image_url VARCHAR(500),
    price_type VARCHAR(20) NOT NULL,              -- 'PER_KG' | 'FIXED'
    price_value BIGINT NOT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE cake_requests (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT UNIQUE REFERENCES customer_orders(id) ON DELETE CASCADE,
    cake_type_id BIGINT REFERENCES cake_types(id),
    weight_kg NUMERIC(4,2) NOT NULL,
    inscription VARCHAR(100),
    reference_image_url VARCHAR(500),
    calculated_price BIGINT NOT NULL,
    final_price BIGINT,
    price_confirmed BOOLEAN DEFAULT FALSE,
    price_note TEXT
);
```

#### `CateringRequest`
```sql
CREATE TABLE catering_requests (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    event_type VARCHAR(100) NOT NULL,             -- 'To''y', 'Yubiley', 'Marosim'...
    event_date DATE NOT NULL,
    guest_count INT,
    budget VARCHAR(100),
    comment TEXT,
    status VARCHAR(20) DEFAULT 'NEW',             -- 'NEW' | 'CONTACTED' | 'DONE' | 'REJECTED'
    admin_note TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

#### `AuditLog` (Xavfsizlik jurnali)
```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor VARCHAR(100) NOT NULL,                  -- Foydalanuvchi logini yoki 'SYSTEM'
    action VARCHAR(50) NOT NULL,                  -- 'CREATE', 'UPDATE', 'STATUS_CHANGE'...
    entity_type VARCHAR(50) NOT NULL,             -- 'ORDER', 'PRODUCT', 'SETTINGS'...
    entity_id BIGINT,
    details TEXT,
    created_at TIMESTAMP NOT NULL
);
```

---

## 6. REST API Spetsifikatsiyasi

### 6.1. Ochiq API (Mijoz uchun — Login talab etilmaydi)

| Metod va URL | Parametrlar | Vazifasi va Javob |
|---|---|---|
| `GET /api/public/categories` | `lang=uz\|ru` | Faol toifalar ro‘yxati (`Category[]`) |
| `GET /api/public/products` | `categorySlug, search, minPrice, maxPrice, excludeAllergens, diets, popular, isNew, discounted, available, sort, page, size, lang` | Sahifalangan mahsulotlar (`Page<ProductCard>`) |
| `GET /api/public/products/{slug}` | `lang` | Mahsulot to‘liq sahifasi (galereya, KBJU, tarkib) |
| `GET /api/public/products/{slug}/recommendations` | `lang, limit` | «Birga olinadi» aqlli tavsiyalari |
| `GET /api/public/branches` | `lang` | Filiallar ro‘yxati (avto-slayder suratlari, telefon, xarita) |
| `GET /api/public/settings` | `lang` | Do‘kon ochiqligi (`isOpenNow`), ish vaqti, mavsumiy mavzu, yetkazish narxi |
| `GET /api/public/banners` | `lang` | Bosh sahifa slayderi (`Promotion[]`) |
| `GET /api/public/promotions` | `lang` | Faol aksiyalar, promokodlar va sovg‘alar |
| `GET /api/public/delivery/slots` | `date, prepMinutes` | Bo‘sh vaqt oynalari (`DeliverySlot[]`) |
| `POST /api/public/promo/validate` | `body: { code, itemsTotal, customerPhone }` | Promokodni tekshirish va chegirmani hisoblash |
| `POST /api/public/orders` | `body: OrderCreateRequest, lang` | **Yangi buyurtma yaratish** (201 Created + Order) |
| `GET /api/public/orders/track/{token}` | `lang` | **Jonli buyurtma holati** (stepper, PIN-kod, tarkib) |
| `POST /api/public/orders/track/{token}/cancel` | `body: { reason }` | Mijoz tomonidan bekor qilish (faqat NEW holatda) |
| `GET /api/public/orders/track/{token}/stream` | — | **SSE (Server-Sent Events)** real vaqt status oqimi |
| `GET /api/public/cake-builder/config` | `lang` | Tort konstruktori shakllari, qatlamlari, narxlari |
| `POST /api/public/cake-builder/price` | `body: { cakeTypeId, weightKg, optionIds }` | Serverda jonli tort narxini hisoblash |
| `POST /api/public/files/cake-reference` | `multipart/form-data: file` | Namuna tort rasmini yuklash (≤ 5 MB, WebP/JPG) |
| `POST /api/public/cake-orders` | `body: CakeOrderCreateRequest, lang` | Konstruktor orqali buyurtma berish (`PRICE_PENDING`) |
| `POST /api/public/catering-requests` | `body: CateringRequestCreate` | To‘y va marosim keytering arizasini qoldirish |

### 6.2. Admin API (Login talab qilinadi: `ADMIN` yoki `STAFF`)

| Metod va URL | Ruxsat | Vazifasi |
|---|---|---|
| `POST /api/admin/auth/login` | Ochiq | Admin login (`MUJIZA_TOKEN` HttpOnly cookie) |
| `POST /api/admin/auth/logout` | Autentifikatsiya | Chiqish (cookie tozalanadi) |
| `GET /api/admin/auth/me` | Autentifikatsiya | Joriy admin profili va roli |
| `POST /api/admin/auth/change-password` | Autentifikatsiya | Parolni o‘zgartirish |
| `CRUD /api/admin/categories` | ADMIN, STAFF | Toifalarni boshqarish |
| `CRUD /api/admin/products` | ADMIN, STAFF | Mahsulotlar to‘liq CRUD (KG/dona, galereya, KBJU, allergenlar) |
| `PATCH /api/admin/products/{id}/availability` | ADMIN, STAFF | Bir tugma bilan "Mavjud emas" holatiga o‘tkazish |
| `POST /api/admin/files/upload?folder=...` | ADMIN, STAFF | Rasm yuklash (PRODUCTS, CATEGORIES, BRANCHES, BANNERS) |
| `GET /api/admin/orders` | ADMIN, STAFF | Buyurtmalar ro‘yxati (filtrlar, sana, status) |
| `GET /api/admin/orders/{id}` | ADMIN, STAFF | Buyurtma tafsilotlari, chek va xarita |
| `PATCH /api/admin/orders/{id}/status` | ADMIN, STAFF | Buyurtma statusini o‘zgartirish (`status, note`) |
| `PATCH /api/admin/orders/{id}/confirm-price` | ADMIN, STAFF | Tort so‘rovining yakuniy narxini tasdiqlash |
| `GET /api/admin/orders/export` | ADMIN | Buyurtmalarni Excel (.xlsx) formatida yuklab olish |
| `CRUD /api/admin/branches` | ADMIN | Filiallarni boshqarish (koordinatalar, fotosuratlar) |
| `CRUD /api/admin/promotions` | ADMIN, STAFF | Aksiyalar va yangiliklarni boshqarish |
| `CRUD /api/admin/promo-codes` | ADMIN | Promokodlar boshqaruvi (foiz, limitlar) |
| `CRUD /api/admin/delivery-slots` | ADMIN | Vaqt oynalari va sig‘im sozlamalari |
| `CRUD /api/admin/cake/types` | ADMIN | Tort turlari va 1 kg asosiy narxlari |
| `CRUD /api/admin/cake/options` | ADMIN | Qatlam ta'mlari, kremlar va bezaklar narxlari |
| `GET /api/admin/catering-requests` | ADMIN, STAFF | Keytering arizalarini ko‘rish va qayta ishlash |
| `GET/PUT /api/admin/settings` | ADMIN | Asosiy do‘kon sozlamalari va mavsumiy mavzu |
| `GET /api/admin/analytics/summary` | ADMIN | Savdo aylanmasi, o‘rtacha chek, buyurtmalar statistikasi |
| `GET /api/admin/analytics/daily, /hourly` | ADMIN | Kunlik va soatlik tushum grafiklari |
| `GET /api/admin/analytics/top-products` | ADMIN | Eng ko‘p sotilgan Top-10 mahsulotlar |
| `GET /api/admin/audit-log` | ADMIN | O‘zgarishlar tarixi jurnali |
| `CRUD /api/admin/staff` | ADMIN | Xodimlar hisoblari va rollari |

---

## 7. Qat'iy Biznes Qoidalari

1. **Narx faqat Serverda hisoblanadi:**
   * Frontend savatdan hech qachon narx yubormaydi (`OrderCreateRequest` faqat `productId` va `quantity` yuboradi).
   * Barcha narxlar, chegirmalar va yakuniy summa server tranzaksiyasida hisoblanadi.
2. **Dona va KG (UnitType) qat'iy nazorati:**
   * `unitType = 'KG'` bo‘lsa: `minQuantity` (masalan 0.5 kg), `quantityStep` (0.5 kg). Kasr sonlarga ruxsat beriladi.
   * `unitType = 'PIECE'` bo‘lsa: `minQuantity = 1`, `quantityStep = 1`. Kasr sonlar qat'iyan taqiqlanadi (400 Bad Request).
3. **Statuslar oqimi (State Machine):**
   * Oddiy buyurtma: `NEW` → `CONFIRMED` → `PREPARING` → `READY` → `DELIVERING` (faqat yetkazishda) → `COMPLETED`.
   * Tort buyurtmasi: `PRICE_PENDING` → `CONFIRMED` → `PREPARING` → `READY` → `DELIVERING` → `COMPLETED`.
   * Istalgan faol bosqichda `CANCELLED` bo‘lishi mumkin (sababi bilan). Teskari sakrash taqiqlanadi (409 Conflict).
4. **Olib ketish PIN-kodi:**
   * Har bir `PICKUP` buyurtmaga 4 xonali tasodifiy raqamli `pickupCode` generatsiya qilinadi. Filial kassasida mijoz shu kod orqali navbatsiz qabul qilib oladi.
5. **Vaqt oynalari va Pessimistik qulflash:**
   * Bir vaqtning o‘zida bitta vaqt oralig‘iga so‘rovlar tushganda sig‘im (`capacity`) buzilmasligi uchun DB darajasida pessimistik lock qo‘llanadi.
6. **Promokod qo‘llash qoidasi:**
   * Bitta buyurtmada bitta promokod; chegirma faqat mahsulotlar summasiga qo‘llanadi (yetkazishga emas); foydalanishlar soni atomik tarzda oshiriladi.
7. **Sovg‘a maxfiyligi:**
   * Anonim sovg‘a tanlanganda kuryerga beriladigan qog‘oz chekda va xabarlarda buyurtmachi ismi ko‘rsatilmaydi.
8. **Mijoz tomonidan bekor qilish:**
   * Mijoz faqat `NEW` yoki `PRICE_PENDING` holatida buyurtmani o‘zi bekor qila oladi. Buyurtma oshxonada tayyorlanishni boshlagach (`PREPARING`), bekor qilish faqat do‘kon bilan telefon orqali amalga oshiriladi.
9. **Telegram Bot xabarnomalari:**
   * Yangi buyurtma kelishi bilan do‘kon Telegram guruhiga darhol ovozli bildirishnoma boradi: raqami, mijoz ismi, telefon, mahsulotlar ro‘yxati (KG va dona bilan), yetkazish manzili yoki filiali. Inline tugmalar orqali administrator kompyuterga kirmasdan buyurtmani tasdiqlay oladi.
10. **Spam va Rate Limiting:**
    * Bitta IP yoki telefon raqamidan daqiqasiga 5 tadan ortiq buyurtma yoki promokod tekshiruvi kelsa, 429 Too Many Requests bilan cheklanadi (Bucket4j).

---

## 8. Texnik va xavfsizlik talablari

* **Baza migratsiyalari:** Flyway orqali (ddl-auto=validate), barcha jadvallar va maydonlar V1–V18 skriptlarida mustahkamlangan.
* **Xavfsizlik:** Spring Security, JWT tokeni `HttpOnly` cookie orqali uzatiladi (JavaScript o‘g‘irlashidan himoyalangan).
* **Keshlash:** Mahsulotlar katalogi va sozlamalar Caffeine keshida saqlanadi, admin tahrirlaganda kesh avtomatik yuviladi.
* **Chek chiqarish:** OpenPDF orqali 80 mm termoprinter uchun qulay kvitansiya generatsiyasi.
* **Analitika eksporti:** Apache POI orqali buyurtmalar arxivini bir zumda Excel (.xlsx) formatida yuklab olish.
* **Testlar:** JUnit 5, Mockito va Testcontainers (PostgreSQL) orqali asosiy biznes mantiqlar sinovdan o‘tkazilgan.
