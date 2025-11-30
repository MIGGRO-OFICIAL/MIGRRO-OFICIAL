-- ============================================================================
-- PARTE 1: PAÍSES E CIDADES
-- ============================================================================

DO $$
DECLARE
    v_country_pt_id UUID;
    v_country_es_id UUID;
    v_country_fr_id UUID;
    v_country_br_id UUID;
    v_country_de_id UUID;
BEGIN
    -- Inserir ou obter IDs dos países
    INSERT INTO countries (code, name, name_pt, flag_emoji, currency_code, currency_symbol, timezone)
    VALUES ('PT', 'Portugal', 'Portugal', '🇵🇹', 'EUR', '€', 'Europe/Lisbon')
    ON CONFLICT (code) DO NOTHING;
    
    SELECT id INTO v_country_pt_id FROM countries WHERE code = 'PT';
    
    INSERT INTO countries (code, name, name_pt, flag_emoji, currency_code, currency_symbol, timezone)
    VALUES ('ES', 'Spain', 'Espanha', '🇪🇸', 'EUR', '€', 'Europe/Madrid')
    ON CONFLICT (code) DO NOTHING;
    
    SELECT id INTO v_country_es_id FROM countries WHERE code = 'ES';
    
    INSERT INTO countries (code, name, name_pt, flag_emoji, currency_code, currency_symbol, timezone)
    VALUES ('FR', 'France', 'França', '🇫🇷', 'EUR', '€', 'Europe/Paris')
    ON CONFLICT (code) DO NOTHING;
    
    SELECT id INTO v_country_fr_id FROM countries WHERE code = 'FR';
    
    INSERT INTO countries (code, name, name_pt, flag_emoji, currency_code, currency_symbol, timezone)
    VALUES ('BR', 'Brazil', 'Brasil', '🇧🇷', 'BRL', 'R$', 'America/Sao_Paulo')
    ON CONFLICT (code) DO NOTHING;
    
    SELECT id INTO v_country_br_id FROM countries WHERE code = 'BR';
    
    INSERT INTO countries (code, name, name_pt, flag_emoji, currency_code, currency_symbol, timezone)
    VALUES ('DE', 'Germany', 'Alemanha', '🇩🇪', 'EUR', '€', 'Europe/Berlin')
    ON CONFLICT (code) DO NOTHING;
    
    SELECT id INTO v_country_de_id FROM countries WHERE code = 'DE';
    
    -- Inserir cidades
    IF v_country_pt_id IS NOT NULL THEN
        INSERT INTO cities (country_id, name, name_pt, state_province, latitude, longitude, population)
        VALUES 
            (v_country_pt_id, 'Lisbon', 'Lisboa', 'Lisboa', 38.7223, -9.1393, 547733),
            (v_country_pt_id, 'Porto', 'Porto', 'Porto', 41.1579, -8.6291, 237591)
        ON CONFLICT (country_id, name, state_province) DO NOTHING;
    END IF;
    
    IF v_country_es_id IS NOT NULL THEN
        INSERT INTO cities (country_id, name, name_pt, state_province, latitude, longitude, population)
        VALUES 
            (v_country_es_id, 'Madrid', 'Madrid', 'Madrid', 40.4168, -3.7038, 3223334),
            (v_country_es_id, 'Barcelona', 'Barcelona', 'Cataluña', 41.3851, 2.1734, 1636762)
        ON CONFLICT (country_id, name, state_province) DO NOTHING;
    END IF;
    
    IF v_country_fr_id IS NOT NULL THEN
        INSERT INTO cities (country_id, name, name_pt, state_province, latitude, longitude, population)
        VALUES 
            (v_country_fr_id, 'Paris', 'Paris', 'Île-de-France', 48.8566, 2.3522, 2161000)
        ON CONFLICT (country_id, name, state_province) DO NOTHING;
    END IF;
    
    IF v_country_de_id IS NOT NULL THEN
        INSERT INTO cities (country_id, name, name_pt, state_province, latitude, longitude, population)
        VALUES 
            (v_country_de_id, 'Berlin', 'Berlim', 'Berlin', 52.5200, 13.4050, 3669491)
        ON CONFLICT (country_id, name, state_province) DO NOTHING;
    END IF;
    
    RAISE NOTICE '✅ Países e cidades criados!';
END $$;
