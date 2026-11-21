-- Sayt uchun mavsumiy rang mavzusi (DEFAULT = oddiy ko'rinish)
ALTER TABLE shop_settings
    ADD COLUMN season_theme VARCHAR(20) NOT NULL DEFAULT 'DEFAULT';