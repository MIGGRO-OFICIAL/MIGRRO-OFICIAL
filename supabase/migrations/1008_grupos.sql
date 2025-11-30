-- ============================================================================
-- PARTE 9: GRUPOS
-- ============================================================================

DO $$
DECLARE
    v_group_names TEXT[] := ARRAY[
        'Brasileiros em Lisboa',
        'Imigrantes em Barcelona',
        'Comunidade Portuguesa em Paris',
        'Brasileiros em Berlim',
        'Ajuda Mútua - Imigração',
        'Dicas de Moradia',
        'Trabalho e Emprego',
        'Educação e Cursos'
    ];
    v_group_descriptions TEXT[] := ARRAY[
        'Grupo para brasileiros que moram ou querem morar em Lisboa. Compartilhe experiências!',
        'Comunidade de imigrantes em Barcelona. Vamos nos ajudar!',
        'Brasileiros e portugueses em Paris. Encontros e networking.',
        'Comunidade brasileira em Berlim. Eventos e apoio mútuo.',
        'Grupo de ajuda mútua para questões de imigração.',
        'Dicas, ofertas e discussões sobre moradia.',
        'Oportunidades de trabalho e dicas de emprego.',
        'Cursos, educação e desenvolvimento profissional.'
    ];
    v_creator_ids UUID[];
    v_city_ids UUID[];
    v_country_ids UUID[];
    v_creator_id UUID;
    v_city_id UUID;
    v_country_id UUID;
    v_i INTEGER;
BEGIN
    SELECT array_agg(id) INTO v_creator_ids FROM profiles LIMIT 8;
    SELECT array_agg(id) INTO v_city_ids FROM cities LIMIT 6;
    SELECT array_agg(id) INTO v_country_ids FROM countries LIMIT 5;
    
    IF array_length(v_creator_ids, 1) IS NULL THEN
        RAISE NOTICE '⚠️ Execute a parte 3 primeiro!';
        RETURN;
    END IF;
    
    -- Criar 8 grupos
    FOR v_i IN 1..8 LOOP
        v_creator_id := v_creator_ids[((v_i - 1) % array_length(v_creator_ids, 1)) + 1];
        v_city_id := v_city_ids[((v_i - 1) % array_length(v_city_ids, 1)) + 1];
        v_country_id := v_country_ids[((v_i - 1) % array_length(v_country_ids, 1)) + 1];
        
        INSERT INTO groups (
            id, name, description, city_id, country_id,
            members_count, is_private, created_by,
            created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            v_group_names[v_i],
            v_group_descriptions[v_i],
            v_city_id,
            v_country_id,
            floor(random() * 200)::INTEGER + 50,
            FALSE,  -- is_private = FALSE significa público
            v_creator_id,
            NOW() - (random() * interval '180 days'),
            NOW() - (random() * interval '30 days')
        );
    END LOOP;
    
    -- Adicionar membros aos grupos
    INSERT INTO group_members (group_id, user_id, role, joined_at)
    SELECT 
        g.id,
        u.id,
        CASE 
            WHEN random() > 0.9 THEN 'admin'::VARCHAR
            WHEN random() > 0.8 THEN 'moderator'::VARCHAR
            ELSE 'member'::VARCHAR
        END,
        g.created_at + (random() * interval '30 days')
    FROM groups g
    CROSS JOIN profiles u
    WHERE random() > 0.6  -- 40% dos usuários estão em cada grupo
    LIMIT 200
    ON CONFLICT DO NOTHING;
    
    -- Atualizar contadores de membros
    UPDATE groups g
    SET members_count = (
        SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id
    );
    
    RAISE NOTICE '✅ 8 grupos criados com membros!';
END $$;
