-- ============================================================================
-- MIGGRO - PARTE 13: PEDIDOS E PROPOSTAS DE SERVIÇO (VERSÃO IDEMPOTENTE)
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard/project/gjphsheavnkdtmsrxmtl/sql/new
-- 2. Cole TODO este conteúdo no SQL Editor
-- 3. Clique em "Run" para executar
-- 
-- ESTE SCRIPT PODE SER EXECUTADO MÚLTIPLAS VEZES SEM ERRO
-- ============================================================================

DO $$
DECLARE
    v_request_titles TEXT[] := ARRAY[
        'Preciso de tradução urgente de documentos',
        'Busco apartamento em Lisboa',
        'Quero aulas de português',
        'Preciso de ajuda com visto',
        'Busco motorista para aeroporto',
        'Preciso de consultoria jurídica',
        'Quero aprender a cozinhar pratos brasileiros',
        'Preciso de ajuda para abrir conta bancária',
        'Busco professor particular de espanhol',
        'Preciso de ajuda com documentos de trabalho'
    ];
    v_request_descriptions TEXT[] := ARRAY[
        'Preciso traduzir documentos urgentemente para apresentar na embaixada.',
        'Estou procurando um apartamento de 2 quartos em Lisboa, preferencialmente no centro.',
        'Quero aprender português para me comunicar melhor no dia a dia.',
        'Preciso de orientação sobre como obter visto de trabalho.',
        'Preciso de transporte do aeroporto para o hotel no dia da chegada.',
        'Tenho dúvidas sobre questões legais relacionadas à imigração.',
        'Adoraria aprender a fazer pratos típicos brasileiros.',
        'Preciso de ajuda para entender como abrir conta bancária aqui.',
        'Quero melhorar meu espanhol com aulas particulares.',
        'Preciso de ajuda para organizar meus documentos de trabalho.'
    ];
    v_provider_ids UUID[];
    v_client_ids UUID[];
    v_category_ids UUID[];
    v_city_ids UUID[];
    v_country_ids UUID[];
    v_provider_id UUID;
    v_client_id UUID;
    v_category_id UUID;
    v_city_id UUID;
    v_country_id UUID;
    v_budget_min DECIMAL(10,2);
    v_budget_max DECIMAL(10,2);
    v_i INTEGER;
    v_request_id UUID;
BEGIN
    -- Buscar IDs necessários
    SELECT array_agg(id) INTO v_provider_ids FROM profiles WHERE role IN ('helper', 'admin') LIMIT 8;
    SELECT array_agg(id) INTO v_client_ids FROM profiles WHERE role = 'imigrant' LIMIT 5;
    SELECT array_agg(id) INTO v_category_ids FROM service_categories LIMIT 8;
    SELECT array_agg(id) INTO v_city_ids FROM cities LIMIT 6;
    SELECT array_agg(id) INTO v_country_ids FROM countries LIMIT 5;
    
    IF array_length(v_client_ids, 1) IS NULL OR array_length(v_category_ids, 1) IS NULL THEN
        RAISE NOTICE '⚠️ Execute as partes anteriores primeiro! Precisa de usuários e categorias.';
        RETURN;
    END IF;
    
    -- Criar 25 pedidos
    FOR v_i IN 1..25 LOOP
        v_client_id := v_client_ids[((floor(random() * array_length(v_client_ids, 1))::INTEGER)) + 1];
        v_category_id := v_category_ids[((floor(random() * array_length(v_category_ids, 1))::INTEGER)) + 1];
        v_city_id := v_city_ids[((floor(random() * array_length(v_city_ids, 1))::INTEGER)) + 1];
        v_country_id := v_country_ids[((floor(random() * array_length(v_country_ids, 1))::INTEGER)) + 1];
        v_budget_min := (50 + random() * 150)::DECIMAL(10,2);
        v_budget_max := v_budget_min + (random() * 100)::DECIMAL(10,2);
        
        INSERT INTO service_requests (
            id, author_id, category_id, title, description,
            status, budget_min, budget_max, currency,
            city_id, country_id,
            created_at, updated_at
        ) VALUES (
            uuid_generate_v4(),
            v_client_id,
            v_category_id,
            v_request_titles[((floor(random() * array_length(v_request_titles, 1))::INTEGER)) + 1],
            v_request_descriptions[((floor(random() * array_length(v_request_descriptions, 1))::INTEGER)) + 1],
            (ARRAY['open', 'in_progress', 'completed', 'cancelled'])[floor(random() * 4)::INTEGER + 1]::VARCHAR,
            v_budget_min,
            v_budget_max,
            'EUR',
            v_city_id,
            v_country_id,
            NOW() - (random() * interval '60 days'),
            NOW() - (random() * interval '30 days')
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
    
    -- Criar propostas (usando category_id para encontrar providers)
    INSERT INTO service_proposals (id, request_id, provider_id, description, price, currency, status, created_at, updated_at)
    SELECT 
        uuid_generate_v4(),
        sr.id,
        sl.provider_id,
        'Posso ajudar com isso! Tenho experiência e referências.',
        COALESCE(sr.budget_min, sr.budget_max, 100) * (0.8 + random() * 0.4),  -- Preço entre 80% e 120% do orçamento
        sr.currency,
        (ARRAY['pending', 'accepted', 'rejected'])[floor(random() * 3)::INTEGER + 1]::VARCHAR,
        sr.created_at + (random() * interval '2 days'),
        sr.created_at + (random() * interval '3 days')
    FROM service_requests sr
    JOIN service_listings sl ON sr.category_id = sl.category_id
    WHERE random() > 0.5  -- 50% dos pedidos têm propostas
    LIMIT 15
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '✅ Pedidos e propostas criados!';
END $$;
