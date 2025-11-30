-- ============================================================================
-- PARTE 5: SERVIÇOS (MARKETPLACE)
-- ============================================================================

DO $$
DECLARE
    v_service_titles TEXT[] := ARRAY[
        'Consultoria Jurídica para Imigração',
        'Tradução de Documentos PT-ES-FR',
        'Aulas de Português para Estrangeiros',
        'Ajuda com Documentação de Visto',
        'Serviço de Transporte Particular',
        'Consultoria Imobiliária',
        'Aulas de Culinária Brasileira',
        'Assistência para Abertura de Conta Bancária',
        'Tradução Simultânea',
        'Orientação para Validação de Diploma',
        'Serviço de Babá',
        'Limpeza Residencial',
        'Reformas e Reparos',
        'Aulas de Espanhol',
        'Consultoria Financeira para Imigrantes'
    ];
    v_service_descriptions TEXT[] := ARRAY[
        'Ajuda completa com processos de imigração, vistos e documentação legal.',
        'Traduções juramentadas e simples. Rápido e confiável.',
        'Aulas particulares ou em grupo. Método eficaz e personalizado.',
        'Oriento todo o processo de visto. Mais de 100 casos de sucesso!',
        'Transporte seguro e pontual. Conheço bem a cidade.',
        'Encontre o imóvel perfeito. Acompanhamento completo.',
        'Aprenda receitas autênticas brasileiras. Aulas práticas!',
        'Ajuda completa para abrir conta em bancos portugueses.',
        'Tradução simultânea para reuniões e eventos.',
        'Guia completo para validar seu diploma no exterior.',
        'Babá experiente e confiável. Referências disponíveis.',
        'Limpeza profissional. Preços justos.',
        'Reformas, pintura, elétrica. Orçamento sem compromisso.',
        'Aulas de espanhol para todos os níveis.',
        'Ajuda com finanças, investimentos e planejamento.'
    ];
    v_prices DECIMAL[] := ARRAY[50.00, 25.00, 30.00, 80.00, 15.00, 100.00, 40.00, 60.00, 45.00, 70.00, 12.00, 20.00, 35.00, 28.00, 55.00];
    v_category_ids UUID[];
    v_provider_ids UUID[];
    v_category_id UUID;
    v_provider_id UUID;
    v_i INTEGER;
BEGIN
    SELECT array_agg(id) INTO v_category_ids FROM service_categories LIMIT 8;
    SELECT array_agg(id) INTO v_provider_ids FROM profiles WHERE role IN ('helper', 'admin') LIMIT 8;
    
    IF array_length(v_provider_ids, 1) IS NULL OR array_length(v_provider_ids, 1) = 0 THEN
        RAISE NOTICE '⚠️ Nenhum provedor encontrado. Execute a parte 3 primeiro!';
        RETURN;
    END IF;
    
    -- Criar 30 serviços
    FOR v_i IN 1..30 LOOP
        v_category_id := v_category_ids[((v_i - 1) % array_length(v_category_ids, 1)) + 1];
        v_provider_id := v_provider_ids[((v_i - 1) % array_length(v_provider_ids, 1)) + 1];
        
        INSERT INTO service_listings (
            id, provider_id, category_id, title, description,
            price, currency, is_active, is_verified,
            rating, reviews_count,
            created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            v_provider_id,
            v_category_id,
            v_service_titles[((v_i - 1) % array_length(v_service_titles, 1)) + 1],
            v_service_descriptions[((v_i - 1) % array_length(v_service_descriptions, 1)) + 1],
            v_prices[((v_i - 1) % array_length(v_prices, 1)) + 1],
            'EUR',
            TRUE,
            CASE WHEN random() > 0.3 THEN TRUE ELSE FALSE END,
            (3.5 + random() * 1.5)::DECIMAL(3,2),  -- Rating entre 3.5 e 5.0
            floor(random() * 25)::INTEGER,
            NOW() - (random() * interval '120 days'),
            NOW() - (random() * interval '30 days')
        );
    END LOOP;
    
    RAISE NOTICE '✅ 30 serviços criados!';
END $$;
