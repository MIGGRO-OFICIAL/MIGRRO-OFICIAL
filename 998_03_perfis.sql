-- ============================================================================
-- MIGGRO - PARTE 3: PERFIS DE USUÁRIOS (VERSÃO IDEMPOTENTE)
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard/project/gjphsheavnkdtmsrxmtl/sql/new
-- 2. Cole TODO este conteúdo no SQL Editor
-- 3. Clique em "Run" para executar
-- 
-- ESTE SCRIPT PODE SER EXECUTADO MÚLTIPLAS VEZES SEM ERRO
-- ============================================================================
-- 
-- IMPORTANTE: Este script atualiza apenas perfis de usuários que já existem no auth.users
-- Para criar novos usuários, use o Supabase Auth primeiro
-- ============================================================================

DO $$
DECLARE
    v_admin_id UUID;
    v_existing_user_ids UUID[];
    v_user_id UUID;
    v_city_ids UUID[];
    v_country_ids UUID[];
    v_names TEXT[] := ARRAY[
        'Rafael Milfont', 'Maria Silva', 'João Santos', 'Ana Costa', 'Carlos Oliveira',
        'Sofia Ferreira', 'Pedro Alves', 'Laura Martins', 'Miguel Rodrigues', 'Beatriz Lima',
        'Ricardo Sousa', 'Isabel Gomes'
    ];
    v_emails TEXT[] := ARRAY[
        'rafaelmilfont@gmail.com', 'maria.silva@email.com', 'joao.santos@email.com',
        'ana.costa@email.com', 'carlos.oliveira@email.com', 'sofia.ferreira@email.com',
        'pedro.alves@email.com', 'laura.martins@email.com', 'miguel.rodrigues@email.com',
        'beatriz.lima@email.com', 'ricardo.sousa@email.com', 'isabel.gomes@email.com'
    ];
    v_usernames TEXT[] := ARRAY[
        'rafaelmilfont', 'mariasilva', 'joaosantos', 'anacosta', 'carlosoliveira',
        'sofiaferreira', 'pedroalves', 'lauramartins', 'miguelrodrigues', 'beatrizlima',
        'ricardosousa', 'isabelgomes'
    ];
    v_bios TEXT[] := ARRAY[
        'Fundador do MIGGRO. Ajudando imigrantes a encontrar seu lugar no mundo.',
        'Imigrante brasileira em Lisboa. Adoro ajudar outros imigrantes!',
        'Advogado especializado em imigração. Mais de 10 anos de experiência.',
        'Professora de português para estrangeiros. Vamos aprender juntos!',
        'Tradutor profissional PT-ES-FR. Traduções rápidas e precisas.',
        'Agente imobiliário em Barcelona. Encontre seu lar na Espanha!',
        'Chef brasileiro em Paris. Receitas autênticas e dicas culinárias.',
        'Enfermeira em Berlim. Ajuda com documentação de saúde na Alemanha.',
        'Motorista particular em Lisboa. Transporte seguro e confiável.',
        'Consultora financeira. Ajuda com bancos, contas e investimentos.',
        'Designer gráfico freelancer. Logos, flyers e identidade visual.',
        'Influencer de imigração. Compartilhando minha jornada!'
    ];
    v_roles TEXT[] := ARRAY['admin', 'imigrant', 'helper', 'helper', 'helper', 'imigrant', 'helper', 'helper', 'helper', 'helper', 'imigrant', 'imigrant'];
    v_trust_scores INTEGER[] := ARRAY[100, 85, 95, 90, 88, 75, 92, 87, 80, 89, 70, 82];
    v_verification_statuses TEXT[] := ARRAY['verified', 'verified', 'verified', 'verified', 'verified', 'pending', 'verified', 'verified', 'pending', 'verified', 'unverified', 'pending'];
    v_raiz_coins INTEGER[] := ARRAY[1000, 450, 800, 600, 550, 200, 700, 500, 300, 650, 150, 400];
    v_followers INTEGER[] := ARRAY[1250, 320, 890, 540, 420, 180, 670, 380, 250, 510, 120, 290];
    v_following INTEGER[] := ARRAY[150, 85, 120, 95, 78, 45, 110, 72, 38, 88, 25, 65];
    v_i INTEGER;
BEGIN
    -- Buscar ID do admin
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'rafaelmilfont@gmail.com' LIMIT 1;
    
    -- Buscar todos os IDs de usuários existentes
    SELECT array_agg(id) INTO v_existing_user_ids FROM auth.users;
    
    IF v_existing_user_ids IS NULL THEN
        v_existing_user_ids := ARRAY[]::UUID[];
    END IF;
    
    IF v_admin_id IS NOT NULL AND NOT (v_admin_id = ANY(v_existing_user_ids)) THEN
        v_existing_user_ids := array_append(v_existing_user_ids, v_admin_id);
    END IF;
    
    -- Buscar IDs de cidades e países
    SELECT array_agg(id) INTO v_city_ids FROM cities LIMIT 10;
    SELECT array_agg(id) INTO v_country_ids FROM countries LIMIT 10;
    
    IF v_city_ids IS NULL THEN v_city_ids := ARRAY[]::UUID[]; END IF;
    IF v_country_ids IS NULL THEN v_country_ids := ARRAY[]::UUID[]; END IF;
    
    -- Atualizar/criar perfil do admin
    IF v_admin_id IS NOT NULL THEN
        INSERT INTO profiles (
            id, email, name, username, bio, city_id, country_id,
            role, trust_score, verification_status, raiz_coins,
            followers_count, following_count, is_premium,
            created_at, updated_at
        ) VALUES (
            v_admin_id,
            'rafaelmilfont@gmail.com',
            'Rafael Milfont',
            'rafaelmilfont',
            'Fundador do MIGGRO. Ajudando imigrantes a encontrar seu lugar no mundo.',
            CASE WHEN array_length(v_city_ids, 1) > 0 THEN v_city_ids[1] ELSE NULL END,
            CASE WHEN array_length(v_country_ids, 1) > 0 THEN v_country_ids[1] ELSE NULL END,
            'admin'::VARCHAR,
            100,
            'verified'::VARCHAR,
            1000,
            1250,
            150,
            TRUE,
            NOW() - interval '180 days',
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            username = EXCLUDED.username,
            bio = EXCLUDED.bio,
            role = EXCLUDED.role,
            trust_score = EXCLUDED.trust_score,
            verification_status = EXCLUDED.verification_status,
            raiz_coins = EXCLUDED.raiz_coins,
            followers_count = EXCLUDED.followers_count,
            following_count = EXCLUDED.following_count,
            is_premium = EXCLUDED.is_premium,
            updated_at = NOW();
    END IF;
    
    -- Para outros usuários existentes (máximo 12)
    FOR v_i IN 1..LEAST(array_length(v_existing_user_ids, 1), 12) LOOP
        v_user_id := v_existing_user_ids[v_i];
        
        IF v_user_id = v_admin_id THEN
            CONTINUE;
        END IF;
        
        INSERT INTO profiles (
            id, email, name, username, bio, city_id, country_id,
            role, trust_score, verification_status, raiz_coins,
            followers_count, following_count, is_premium,
            created_at, updated_at
        ) VALUES (
            v_user_id,
            COALESCE((SELECT email FROM auth.users WHERE id = v_user_id), v_emails[((v_i - 1) % array_length(v_emails, 1)) + 1]),
            v_names[((v_i - 1) % array_length(v_names, 1)) + 1],
            v_usernames[((v_i - 1) % array_length(v_usernames, 1)) + 1],
            v_bios[((v_i - 1) % array_length(v_bios, 1)) + 1],
            CASE WHEN array_length(v_city_ids, 1) > 0 THEN v_city_ids[((v_i - 1) % array_length(v_city_ids, 1)) + 1] ELSE NULL END,
            CASE WHEN array_length(v_country_ids, 1) > 0 THEN v_country_ids[((v_i - 1) % array_length(v_country_ids, 1)) + 1] ELSE NULL END,
            v_roles[((v_i - 1) % array_length(v_roles, 1)) + 1]::VARCHAR,
            v_trust_scores[((v_i - 1) % array_length(v_trust_scores, 1)) + 1],
            v_verification_statuses[((v_i - 1) % array_length(v_verification_statuses, 1)) + 1]::VARCHAR,
            v_raiz_coins[((v_i - 1) % array_length(v_raiz_coins, 1)) + 1],
            v_followers[((v_i - 1) % array_length(v_followers, 1)) + 1],
            v_following[((v_i - 1) % array_length(v_following, 1)) + 1],
            CASE WHEN v_i <= 4 THEN TRUE ELSE FALSE END,
            NOW() - (random() * interval '180 days'),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            username = EXCLUDED.username,
            bio = EXCLUDED.bio,
            role = EXCLUDED.role,
            trust_score = EXCLUDED.trust_score,
            verification_status = EXCLUDED.verification_status,
            raiz_coins = EXCLUDED.raiz_coins,
            followers_count = EXCLUDED.followers_count,
            following_count = EXCLUDED.following_count,
            is_premium = EXCLUDED.is_premium,
            updated_at = NOW();
    END LOOP;
    
    RAISE NOTICE '✅ Perfis criados/atualizados: %', array_length(v_existing_user_ids, 1);
END $$;
