# Mujiza 777 — Onlayn platforma: Frontend Texnik Topshiriq (TZ v2.0)

**Muallif:** Akmal  
**Sana:** 2026-11-05  
**Holat:** 2-versiya (Amaldagi ishlab chiqilgan, mobil-optimallashtirilgan, Google SEO va barcha yangi imkoniyatlar bilan to‘liq sinovdan o‘tgan)  
**Texnologik stek:** Next.js 14 (App Router), React 18, TypeScript (strict), Tailwind CSS, Zustand, next-intl, openapi-fetch, Lucide React, Embla Carousel, Server-Sent Events (SSE).

---

## 0. Avval shuni o‘qing (Arxitektura va Asosiy Qoidalar)

Ushbu hujjat **«Mo‘jiza 777»** (Qarshi shahridagi mashhur shirinliklar va maxsus tortlar qandolat uyi) onlayn savdo platformasining frontend qismi uchun to‘liq, amaldagi texnik topshiriq hisoblanadi.

* **API manbasi (Haqiqat manbai):** Swagger `http://localhost:8081/swagger-ui.html`, OpenAPI JSON `http://localhost:8081/v3/api-docs`. TypeScript tiplari `src/lib/api/types.ts` da generatsiya qilingan.
* **Production Build Statusi:** Barcha **46 ta sahifa** (statik, dinamik yo‘llar, sitemap.xml, robots.txt) Next.js production builddan **0 ta xato bilan** to‘liq muvaffaqiyatli o‘tgan (`46/46`).
* **Ikki tilli muhit:** To‘liq o‘zbek (lotin) va rus tillarida (`/[lang]/...`), har bir matn tarjima fayllaridan (`messages/uz.json`, `messages/ru.json`) olinadi. Kodda qattiq yozilgan (hardcoded) matnlar yo‘q.
* **Mobil-First:** Sayt 360px dan boshlab to‘liq moslashtirilgan, barcha tugmalar barmoq bilan bosishga qulay (kamida 44px), footer oldidagi barcha bo‘shliqlar bartaraf etilgan.

---

## 1. Loyiha maqsadi va auditoriya

Qarshi va viloyatdagi mijozlar shirinliklar, pishiriqlar va buyurtma tortlarni veb-sayt orqali ko‘radi, savatga qo‘shadi, olib ketish yoki yetkazib berish bilan xarid qiladi va real vaqtda buyurtmasini kuzatadi. Do‘kon xodimlari va egasi alohida admin panel orqali mahsulot, narxlar, aksiyalar, filiallar va tushumlarni boshqaradi.
* **Namunalar:** Axmad.uz (savdo oqimi, filiallar) va SafiaBakery.uz (issiq, qaymoqli va nafis qandolat uslubi).
* **Bizning ustunlik:** Dona va KG bo‘yicha to‘liq hisob-kitob, ko‘p fotosuratli galereyalar, interaktiv tort konstruktori, real vaqtda SSE buyurtma kuzatuvi, 4 xonali olib ketish PIN-kodi, vaqt oynalari, sovg‘a jo‘natish, 1 bosishda qayta buyurtma (Reorder) va promokodlar.

---

## 2. Texnologik Stek

| Vazifa | Tanlov | Izohlar |
|---|---|---|
| **Framework** | Next.js 14+ (App Router) | Server Components sukut bo‘yicha, `use client` faqat interaktivlik uchun |
| **Til** | TypeScript (strict) | `any` taqiqlangan, to‘liq tiplangan |
| **Stillash** | Tailwind CSS | Zumrad (`#244B2B`), Oltin (`#D4AF37`), Tungi rejim (`dark:`) |
| **Til (i18n)** | `next-intl` | `/[lang]/...` yo‘llari, SSR tarjimalar |
| **Mijoz holati (State)** | Zustand + LocalStorage | `cart` (savat), `favorites` (sevimlilar), `my-orders` (buyurtmalar tarixi) |
| **Real vaqt aloqasi** | SSE (Server-Sent Events) | Buyurtmani jonli kuzatish (`/order/[token]`) |
| **Ikonkalar** | `lucide-react` | Yengil vektorli ikonkalar |
| **Slayder** | Embla Carousel | Bannerlar va mahsulot galereyalari |
| **Formalar** | `react-hook-form` + `zod` | Klient va server xatolarini moslash |
| **SEO & Indekslash** | Next.js Metadata + JSON-LD | Dynamic `sitemap.ts`, `robots.ts`, `Schema.org/Bakery` |

---

## 3. Muhit va API bilan ishlash qoidalari

### 3.1. Muhit o‘zgaruvchilari
* `API_INTERNAL_URL`: Server tomonidan backend'ga so‘rov (masalan: `http://localhost:8081`).
* `NEXT_PUBLIC_SITE_URL`: Saytning ochiq domeni (masalan: `https://mujiza777.uz`).
* `NEXT_PUBLIC_SSE_BASE_URL`: Dev rejimida SSE ulanishi uchun.

### 3.2. Proksi (Rewrites)
`next.config.mjs` ichida `/api/:path*` va `/uploads/:path*` so‘rovlari `API_INTERNAL_URL` ga yo‘naltiriladi. Brauzer faqat o‘z domeniga murojaat qiladi, CORS va cookie muammolari bartaraf etilgan.

### 3.3. Autentifikatsiya (Admin panel)
* Kirish: `POST /api/admin/auth/login`. Muvaffaqiyatli bo‘lsa server `MUJIZA_TOKEN` nomli `HttpOnly` cookie beradi (12 soat amal qiladi). JavaScript uni o‘qimaydi.
* Admin so‘rovlarida `credentials: 'include'` majburiy.
* 401 kelsa → `/admin/login` ga yo‘naltiriladi.

### 3.4. Ma'lumot formatlari
* **Pul:** Butun so‘m (`360 000 so‘m`, ruscha `360 000 сум`).
* **Miqdor:** Dona uchun butun son (`2 dona`), kilogramm uchun kasr son (`1.5 kg`).
* **Vaqt:** Toshkent vaqti (UTC+5).
* **Rasmlar:** `next/image` orqali WebP formatda va aniq nisbat (aspect-ratio) bilan yuklanadi.

---

## 4. Barcha 46 ta Sahifa Yo‘nalishlari (Routing Catalog)

| Sahifa Yo‘li | Turi | Vazifasi va Imkoniyatlari |
|---|---|---|
| `/[lang]` | SSR | Bosh sahifa (Hero slayder, toifalar karuseli, vitrinalar, filiallar) |
| `/[lang]/catalog` | SSR + Client | To‘liq katalog (2 ustunli vitrina, toifa chiplari, filtrlash) |
| `/[lang]/catalog/[categorySlug]` | SSR + Client | Muayyan toifa mahsulotlari (Tortlar, Bento, Ruletlar...) |
| `/[lang]/product/[slug]` | SSR | Mahsulot ichki sahifasi (2–3 ta fotosuratli galereya, KBJU, sticky bar) |
| `/[lang]/cart` | Client | Savat (miqdor stepperi, bepul yetkazish progress bari, sticky bar) |
| `/[lang]/checkout` | Client | Rasmiylashtirish (aloqa, GPS geolokatsiya, filial, vaqt oynasi, sovg‘a, promokod) |
| `/[lang]/order/[token]` | Client + SSE | Jonli buyurtma kuzatuvi (stepper, 4 xonali PIN, SSE oqimi) |
| `/[lang]/orders` | Client | Mening buyurtmalarim (filtr tablari, nishonlar, 🔁 **Reorder** tugmasi) |
| `/[lang]/favorites` | Client | Sevimli shirinliklar (LocalStorage) |
| `/[lang]/promotions` | SSR | Aksiyalar va yangiliklar (📋 Promokodni 1 bosishda nusxalash, taymer) |
| `/[lang]/promotions/[slug]`| SSR | Aksiya to‘liq sahifasi |
| `/[lang]/branches` | SSR | Filiallar (avto-slayder galereyasi, Yandex xarita, telefon, ish vaqti) |
| `/[lang]/cake-builder` | Client | Interaktiv tort konstruktori (shakl, vazn, ta'm, krem, bezak, fotosurat) |
| `/[lang]/catering` | Client | To‘y va marosimlar keytering arizasi formasi |
| `/[lang]/about` | SSG | Biz haqimizda (tarix, falsafa, qandolat ustalari) |
| `/[lang]/delivery-payment` | SSG | Yetkazib berish shartlari va to‘lov usullari |
| `/[lang]/privacy` | SSG | Maxfiylik siyosati |
| `/[lang]/offer` | SSG | Ommaviy oferta shartnomasi |
| `/robots.txt` | Static Dynamic| Qidiruv tizimlari indekslash qoidalari |
| `/sitemap.xml` | Dynamic XML | Barcha sahifalar, toifalar va mahsulotlar xaritasi |
| `/admin/login` | Client | Admin va xodimlar kirish sahifasi |
| `/admin/orders` | Client | Buyurtmalar boshqaruvi (jonli ro‘yxat, tovushli signal, statuslar, chek) |
| `/admin/orders/[id]` | Client | Buyurtma to‘liq tafsilotlari, chek chop etish, narx tasdiqlash |
| `/admin/products` | Client | Mahsulotlar katalogi (tezkor mavjudlik tugmasi, narxlar) |
| `/admin/products/new` | Client | Yangi mahsulot qo‘shish (KG/dona, rasm yuklash, galereya, KBJU) |
| `/admin/products/[id]` | Client | Mahsulotni tahrirlash |
| `/admin/categories` | Client | Toifalarni boshqarish |
| `/admin/branches` | Client | Filiallarni boshqarish |
| `/admin/promotions` | Client | Aksiyalar va bannerlar boshqaruvi |
| `/admin/promo-codes` | Client | Promokodlar boshqaruvi |
| `/admin/delivery-slots`| Client | Yetkazish vaqt oynalari va kunlik sig‘im |
| `/admin/cake/types` | Client | Tort konstruktori turlari va bazaviy narxlari |
| `/admin/cake/options` | Client | Qatlam ta'mlari, kremlar va bezaklar narxlari |
| `/admin/catering` | Client | Keytering arizalarini ko‘rish va qayta ishlash |
| `/admin/analytics` | Client | Analitika va dashboard (tushum, buyurtmalar, grafiklar, Excel export) |
| `/admin/staff` | Client | Xodimlar va rollarni boshqarish |
| `/admin/audit-log` | Client | Tizim o‘zgarishlari jurnali |
| `/admin/settings` | Client | Do‘kon asosiy sozlamalari va mavsumiy bayram mavzusi |

---

## 5. Senior Darajadagi Mobil UI/UX Yechimlari

### 5.1. Bo‘shliqlarni yo‘qotish (Zero Blank Space)
* Katalog (`/catalog`) va Filiallar (`/branches`) sahifalarida avval kuzatilgan 256 piksellik bo‘shliqlar to‘liq to‘g‘rilandi: sahifa o‘rami `pb-4 sm:pb-10`, ichki konteyner `pb-2 sm:pb-4`. Sahifa pastki footerga silliq va chiroyli ulanadi.

### 5.2. Dona va KG (UnitType) Stepperlari
* `unitType = 'KG'` bo‘lgan mahsulotlar: 0.5 kg qadam bilan (`0.5 kg`, `1.0 kg`, `1.5 kg`, `2.0 kg`...).
* `unitType = 'PIECE'` bo‘lgan mahsulotlar: 1 dona qadam bilan (`1 dona`, `2 dona`, `3 dona`...).
* Savatda ham, mahsulot sahifasida ham xaridor aniq miqdorni ko‘radi.

### 5.3. Mahsulot sahifasidagi Ko‘p Fotosuratli Galereya
* Har bir mahsulot uchun kamida 2–3 ta sifatli fotosurat (tashqi ko‘rinishi, ichki razrezi, chiroyli qadog‘i);
* `📸 1 / 3` indikatori, chap/o‘ng boshqaruv va miniatyuralar (thumbnails) orqali almashish.

### 5.4. Mening Buyurtmalarim va Qayta Buyurtma (Reorder)
* `/orders` sahifasida mijozning barcha buyurtmalari alohida kartochkalarda ko‘rinadi.
* **🔁 Qayta buyurtma (Reorder):** Mijoz bir bosishda avvalgi buyurtmasidagi barcha shirinliklarni yana savatga yuklaydi va to‘g‘ridan-to‘g‘ri savatga o‘tadi.

### 5.5. Aksiyalarda Promokodni 1 Bosishda Nusxalash
* `/promotions` sahifasida har bir aksiya uchun maxsus nishon (`MUJIZA15`, `BEPUL777`...).
* Tugma bosilishi bilan kod buferga nusxalanadi va animatsiya bilan *«NUSXALANDI!»* yozuviga aylanadi.

### 5.6. Filiallarda Avto-Slayder va Yandex Xarita
* Har bir filial uchun 2–3 ta fotosuratli silliq avto-slayder;
* Interaktiv Yandex/Google xarita, geolokatsiya koordinatalari, to‘liq ish vaqti va to‘g‘ridan-to‘g‘ri qo‘ng‘iroq qilish (`tel:`) tugmasi.

---

## 6. Google SEO va Qidiruv Natijalarida 1-O‘rinni Egallash

1. **Dinamik `sitemap.xml`:** 46 ta yo‘l, barcha toifalar va mahsulotlar avtomatik yangilanadi.
2. **Dinamik `robots.txt`:** Googlebot va YandexBot uchun to‘liq ochiq, shaxsiy buyurtma tokenlari va admin panel yopiq.
3. **`Schema.org/Bakery` Mikroformat (JSON-LD):**
   * Google robotiga «Mo‘jiza 777» Qarshi shahridagi qandolat uyi ekanligi, ish vaqti, manzili va ijtimoiy sahifalari aniq ko‘rsatilgan.
4. **Kalit So‘zlar (Keywords):**
   * *«mujiza 777», «mojiza 777», «qarshi shirinliklar», «qarshida tort buyurtma qilish», «qarshi shahar eng zo‘r tortlar», «safia bakery qarshi», «shirinliklar yetkazib berish qarshi»*.

---

## 7. Xulosa

Frontend tizimi xalqaro premium standartlar (Safia Bakery va Axmad) darajasida ishlab chiqilgan bo‘lib, barcha qismlari sinovdan o‘tgan va to‘liq ishga tushirishga (Production Launch) tayyor.
