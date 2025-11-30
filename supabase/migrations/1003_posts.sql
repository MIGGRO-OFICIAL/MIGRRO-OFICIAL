-- ============================================================================
-- PARTE 4: POSTS
-- ============================================================================

-- Nota: No Supabase, use gen_random_uuid() em vez de uuid_generate_v4()
-- gen_random_uuid() é nativo do PostgreSQL e não requer extensões

DO $$
DECLARE
    v_post_contents TEXT[] := ARRAY[
        'Acabei de chegar em Lisboa! Alguém tem dicas sobre onde encontrar apartamentos acessíveis? 🏠',
        'Dica importante: Sempre verifiquem a documentação antes de assinar contratos de trabalho! 📋',
        'Evento gratuito de português para imigrantes neste sábado às 14h. Quem vem? 📚',
        'Consegui meu visto de trabalho! Compartilhando todo o processo no meu perfil. ✨',
        'Atenção: Nova lei de imigração em Portugal. Resumo completo nos comentários! ⚖️',
        'Preciso de ajuda com tradução de documentos. Alguém conhece um tradutor confiável?',
        'Dica de ouro: Crie uma conta bancária nos primeiros dias. Facilita muito! 💳',
        'Compartilhando minha experiência: Como conseguir o NIF em 1 dia! 🇵🇹',
        'Grupo de apoio para mães imigrantes em Barcelona. Vamos nos ajudar! 👶',
        'Aviso importante sobre golpes de aluguel. Fiquem atentos! 🚨',
        'Workshop gratuito: Como montar seu currículo no padrão europeu. 📝',
        'Encontrei um restaurante brasileiro incrível em Paris! Quem quer conhecer? 🍽️',
        'Dúvida: Preciso validar meu diploma? Como funciona? 🎓',
        'Compartilhando recursos gratuitos para aprender espanhol online! 🇪🇸',
        'Evento: Encontro de brasileiros em Berlim no próximo domingo! 🎉',
        'Como conseguir seguro de saúde na Alemanha? Guia completo! 🏥',
        'Preciso de ajuda urgente com documentação. Alguém pode me orientar?',
        'Compartilhando apps essenciais para imigrantes na Europa! 📱',
        'História inspiradora: Como consegui meu primeiro emprego em Portugal! 💼',
        'Dica: Use o transporte público! É muito mais barato que Uber. 🚇'
    ];
    v_post_types TEXT[] := ARRAY['general', 'help_request', 'event', 'service_promo', 'general'];
    v_tags TEXT[][] := ARRAY[
        ARRAY['lisboa', 'moradia', 'ajuda'],
        ARRAY['dica', 'trabalho', 'documentação'],
        ARRAY['evento', 'português', 'educação'],
        ARRAY['visto', 'sucesso', 'compartilhando'],
        ARRAY['lei', 'imigração', 'portugal'],
        ARRAY['ajuda', 'tradução', 'documentos'],
        ARRAY['banco', 'dica', 'financeiro'],
        ARRAY['nif', 'documentação', 'portugal'],
        ARRAY['grupo', 'apoio', 'barcelona'],
        ARRAY['alerta', 'golpe', 'aluguel'],
        ARRAY['workshop', 'currículo', 'emprego'],
        ARRAY['restaurante', 'paris', 'comunidade'],
        ARRAY['diploma', 'validação', 'educação'],
        ARRAY['espanhol', 'aprendizado', 'recursos'],
        ARRAY['evento', 'berlim', 'comunidade'],
        ARRAY['transporte', 'dica', 'economia'],
        ARRAY['saúde', 'alemania', 'guia'],
        ARRAY['urgente', 'ajuda', 'documentação'],
        ARRAY['apps', 'ferramentas', 'imigração'],
        ARRAY['emprego', 'portugal', 'inspiração']
    ];
    v_user_ids UUID[];
    v_i INTEGER;
    v_author_id UUID;
    v_likes_count INTEGER;
    v_comments_count INTEGER;
BEGIN
    -- Buscar IDs de usuários
    SELECT array_agg(id) INTO v_user_ids FROM profiles LIMIT 12;
    
    IF array_length(v_user_ids, 1) IS NULL OR array_length(v_user_ids, 1) = 0 THEN
        RAISE NOTICE '⚠️ Nenhum usuário encontrado. Execute a parte 3 primeiro!';
        RETURN;
    END IF;
    
    -- Criar 50 posts
    FOR v_i IN 1..50 LOOP
        v_author_id := v_user_ids[((v_i - 1) % array_length(v_user_ids, 1)) + 1];
        v_likes_count := floor(random() * 150)::INTEGER;
        v_comments_count := floor(random() * 30)::INTEGER;
        
        INSERT INTO posts (
            id, author_id, content, post_type, tags,
            likes_count, comments_count, shares_count, views_count,
            city_id, country_id,
            created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            v_author_id,
            v_post_contents[((v_i - 1) % array_length(v_post_contents, 1)) + 1],
            v_post_types[((v_i - 1) % array_length(v_post_types, 1)) + 1]::VARCHAR,
            v_tags[((v_i - 1) % array_length(v_tags, 1)) + 1]::TEXT[],
            v_likes_count,
            v_comments_count,
            floor(random() * 20)::INTEGER,
            floor(random() * 500)::INTEGER + v_likes_count,
            (SELECT id FROM cities ORDER BY random() LIMIT 1),
            (SELECT id FROM countries ORDER BY random() LIMIT 1),
            NOW() - (random() * interval '60 days'),
            NOW() - (random() * interval '30 days')
        );
    END LOOP;
    
    RAISE NOTICE '✅ 50 posts criados!';
END $$;
