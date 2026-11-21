-- Keytering so'rovlari (to'y, tadbir uchun katta buyurtmalar)
CREATE TABLE catering_requests (
                                   id          BIGSERIAL PRIMARY KEY,
    -- So'rov yuborgan odamning ismi va telefoni
                                   name        VARCHAR(100)  NOT NULL,
                                   phone       VARCHAR(20)   NOT NULL,
    -- Tadbir turi (to'y, tug'ilgan kun, korporativ va h.k.), sanasi, mehmonlar soni
                                   event_type  VARCHAR(100)  NOT NULL,
                                   event_date  DATE          NOT NULL,
                                   guest_count INT           NOT NULL,
    -- Taxminiy byudjet, so'mda (ixtiyoriy)
                                   budget      BIGINT,
    -- Qo'shimcha istaklar (ixtiyoriy)
                                   comment     VARCHAR(1000),
    -- Holati: NEW, CONTACTED, DONE, REJECTED
                                   status      VARCHAR(20)   NOT NULL,
    -- Admin izohi (mijozga ko'rinmaydi)
                                   admin_note  VARCHAR(500),
                                   created_at  TIMESTAMP     NOT NULL,
                                   updated_at  TIMESTAMP     NOT NULL,
                                   CONSTRAINT chk_catering_guests CHECK (guest_count > 0)
);
CREATE INDEX idx_catering_status ON catering_requests (status);
CREATE INDEX idx_catering_created_at ON catering_requests (created_at);