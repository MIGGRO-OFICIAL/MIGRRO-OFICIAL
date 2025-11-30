-- ============================================================================
-- MIGGRO - Dados Mock para Demonstração ao Investidor
-- ============================================================================
-- 
-- Este script popula o sistema com dados realistas para demonstração
-- Execute no SQL Editor do Supabase após todas as migrations
-- ============================================================================

-- Limpar dados existentes (CUIDADO: isso apaga tudo!)
-- Descomente apenas se quiser resetar completamente
/*
TRUNCATE TABLE ad_impressions CASCADE;
TRUNCATE TABLE creator_payouts CASCADE;
TRUNCATE TABLE ad_campaigns CASCADE;
TRUNCATE TABLE moderation_actions CASCADE;
TRUNCATE TABLE reports CASCADE;
TRUNCATE TABLE service_proposals CASCADE;
TRUNCATE TABLE service_requests CASCADE;
TRUNCATE TABLE service_listings CASCADE;
TRUNCATE TABLE group_members CASCADE;
TRUNCATE TABLE group_posts CASCADE;
TRUNCATE TABLE groups CASCADE;
TRUNCATE TABLE comment_likes CASCADE;
TRUNCATE TABLE comments CASCADE;
TRUNCATE TABLE post_likes CASCADE;
TRUNCATE TABLE posts CASCADE;
TRUNCATE TABLE follows CASCADE;
TRUNCATE TABLE user_badges CASCADE;
TRUNCATE TABLE verification_steps CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE reviews CASCADE;
TRUNCATE TABLE chats CASCADE;
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE profiles CASCADE;
*/

-- ============================================================================
-- 1. PAÍSES E CIDADES (se não existirem)
-- ============================================================================

-- Primeiro, inserir países (usando código como chave única)
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
    
    -- Agora inserir cidades usando os IDs corretos (apenas se os países existirem)
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
END $$;

-- ============================================================================
-- 2. CATEGORIAS DE SERVIÇOS (se não existirem)
-- ============================================================================

INSERT INTO service_categories (id, name, name_pt, name_en, name_es, icon, color, sort_order) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Legal', 'Jurídico', 'Legal', 'Legal', 'Scale', 'blue', 1),
('770e8400-e29b-41d4-a716-446655440002', 'Housing', 'Moradia', 'Housing', 'Vivienda', 'Home', 'green', 2),
('770e8400-e29b-41d4-a716-446655440003', 'Education', 'Educação', 'Education', 'Educación', 'GraduationCap', 'purple', 3),
('770e8400-e29b-41d4-a716-446655440004', 'Healthcare', 'Saúde', 'Healthcare', 'Salud', 'Heart', 'red', 4),
('770e8400-e29b-41d4-a716-446655440005', 'Translation', 'Tradução', 'Translation', 'Traducción', 'Languages', 'orange', 5),
('770e8400-e29b-41d4-a716-446655440006', 'Transport', 'Transporte', 'Transport', 'Transporte', 'Car', 'yellow', 6),
('770e8400-e29b-41d4-a716-446655440007', 'Food', 'Alimentação', 'Food', 'Alimentación', 'Utensils', 'pink', 7),
('770e8400-e29b-41d4-a716-446655440008', 'Finance', 'Financeiro', 'Finance', 'Finanzas', 'Wallet', 'teal', 8)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. BADGES (se não existirem)
-- ============================================================================

INSERT INTO badges (id, name, name_pt, description, icon, color, rarity) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'First Steps', 'Primeiros Passos', 'Completou o cadastro inicial', 'Baby', 'blue', 'common'),
('880e8400-e29b-41d4-a716-446655440002', 'Helper', 'Ajudante', 'Ajudou 10 pessoas', 'HandHeart', 'green', 'rare'),
('880e8400-e29b-41d4-a716-446655440003', 'Verified', 'Verificado', 'Perfil verificado', 'BadgeCheck', 'purple', 'epic'),
('880e8400-e29b-41d4-a716-446655440004', 'Community Leader', 'Líder da Comunidade', 'Mais de 100 seguidores', 'Crown', 'gold', 'legendary'),
('880e8400-e29b-41d4-a716-446655440005', 'Top Contributor', 'Top Contribuidor', 'Mais de 50 posts', 'Star', 'orange', 'epic')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. PERFIS DE USUÁRIOS MOCK
-- ============================================================================
-- IMPORTANTE: A tabela profiles tem foreign key para auth.users
-- Vamos apenas atualizar o perfil do admin e criar perfis para usuários existentes
-- OU criar usuários mock no auth.users primeiro (requer permissões especiais)

DO $$
DECLARE
    -- IDs de usuários que já existem no auth.users (ou serão criados)
    -- Começamos apenas com o admin que já existe
    v_admin_id UUID;
    v_existing_user_ids UUID[];
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
    v_user_id UUID;
BEGIN
    -- Buscar ID do admin (que já existe no auth.users)
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'rafaelmilfont@gmail.com';
    
    -- Buscar todos os IDs de usuários existentes no auth.users
    SELECT array_agg(id) INTO v_existing_user_ids FROM auth.users;
    
    -- Se não houver usuários, criar array vazio
    IF v_existing_user_ids IS NULL THEN
        v_existing_user_ids := ARRAY[]::UUID[];
    END IF;
    
    -- Adicionar o admin se não estiver na lista
    IF v_admin_id IS NOT NULL AND NOT (v_admin_id = ANY(v_existing_user_ids)) THEN
        v_existing_user_ids := array_append(v_existing_user_ids, v_admin_id);
    END IF;
    
    -- Buscar IDs reais de cidades e países
    SELECT array_agg(id) INTO v_city_ids FROM cities LIMIT 10;
    SELECT array_agg(id) INTO v_country_ids FROM countries LIMIT 10;
    
    -- Se não houver cidades/países, usar NULL
    IF v_city_ids IS NULL THEN
        v_city_ids := ARRAY[]::UUID[];
    END IF;
    IF v_country_ids IS NULL THEN
        v_country_ids := ARRAY[]::UUID[];
    END IF;
    
    -- Atualizar/criar perfil apenas para usuários que existem no auth.users
    -- Começamos com o admin
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
            is_premium = EXCLUDED.is_premium;
    END IF;
    
    -- Para outros usuários existentes, criar/atualizar perfis
    -- Limitamos a 11 perfis adicionais (total 12 incluindo admin)
    FOR v_i IN 1..LEAST(array_length(v_existing_user_ids, 1), 12) LOOP
        v_user_id := v_existing_user_ids[v_i];
        
        -- Pular o admin (já foi processado)
        IF v_user_id = v_admin_id THEN
            CONTINUE;
        END IF;
        
        -- Usar índices modulares para arrays de dados
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
            CASE 
                WHEN array_length(v_city_ids, 1) > 0 
                THEN v_city_ids[((v_i - 1) % array_length(v_city_ids, 1)) + 1]
                ELSE NULL
            END,
            CASE 
                WHEN array_length(v_country_ids, 1) > 0 
                THEN v_country_ids[((v_i - 1) % array_length(v_country_ids, 1)) + 1]
                ELSE NULL
            END,
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
            is_premium = EXCLUDED.is_premium;
    END LOOP;
    
    RAISE NOTICE 'Perfis criados/atualizados: %', array_length(v_existing_user_ids, 1);
END $$;

-- ============================================================================
-- 5. BADGES PARA USUÁRIOS
-- ============================================================================

INSERT INTO user_badges (user_id, badge_id, earned_at)
SELECT 
    p.id,
    b.id,
    NOW() - (random() * interval '90 days')
FROM profiles p
CROSS JOIN badges b
WHERE random() > 0.6  -- 40% dos usuários têm cada badge
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. POSTS
-- ============================================================================

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
        'Dica: Use o transporte público! É muito mais barato que Uber. 🚇',
        'Como conseguir seguro de saúde na Alemanha? Guia completo! 🏥',
        'Preciso de ajuda urgente com documentação. Alguém pode me orientar?',
        'Compartilhando apps essenciais para imigrantes na Europa! 📱',
        'História inspiradora: Como consegui meu primeiro emprego em Portugal! 💼'
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
    v_post_id UUID;
    v_i INTEGER;
    v_author_id UUID;
    v_likes_count INTEGER;
    v_comments_count INTEGER;
BEGIN
    -- Buscar IDs de usuários
    SELECT array_agg(id) INTO v_user_ids FROM profiles LIMIT 12;
    
    -- Criar 50 posts
    FOR v_i IN 1..50 LOOP
        -- Se não houver usuários, pular
        IF array_length(v_user_ids, 1) IS NULL OR array_length(v_user_ids, 1) = 0 THEN
            EXIT;
        END IF;
        v_author_id := v_user_ids[((v_i - 1) % array_length(v_user_ids, 1)) + 1];
        v_likes_count := floor(random() * 150)::INTEGER;
        v_comments_count := floor(random() * 30)::INTEGER;
        
        INSERT INTO posts (
            id, author_id, content, post_type, tags,
            likes_count, comments_count, shares_count, views_count,
            city_id, country_id,
            created_at, updated_at
        ) VALUES (
            uuid_generate_v4(),
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
END $$;

-- ============================================================================
-- 7. LIKES EM POSTS
-- ============================================================================

INSERT INTO post_likes (post_id, user_id, created_at)
SELECT 
    p.id,
    u.id,
    p.created_at + (random() * interval '7 days')
FROM posts p
CROSS JOIN profiles u
WHERE random() > 0.85  -- 15% de chance de cada usuário curtir cada post
  AND p.author_id != u.id  -- Não curtir próprios posts
LIMIT 500
ON CONFLICT DO NOTHING;

-- Atualizar contadores de likes
UPDATE posts p
SET likes_count = (
    SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id
);

-- ============================================================================
-- 8. COMENTÁRIOS
-- ============================================================================

DO $$
DECLARE
    v_comments TEXT[] := ARRAY[
        'Ótima dica! Obrigado por compartilhar!',
        'Isso me ajudou muito! 🙏',
        'Alguém mais passou por isso?',
        'Excelente informação!',
        'Vou tentar isso também!',
        'Muito útil, obrigada!',
        'Compartilhando com meus amigos!',
        'Isso resolveu meu problema!',
        'Mais detalhes, por favor!',
        'Obrigado pela ajuda!',
        'Funcionou perfeitamente!',
        'Vou recomendar!',
        'Muito esclarecedor!',
        'Preciso de mais informações sobre isso.',
        'Alguém pode me ajudar também?'
    ];
    v_post_ids UUID[];
    v_user_ids UUID[];
    v_post_id UUID;
    v_user_id UUID;
    v_i INTEGER;
BEGIN
    SELECT array_agg(id) INTO v_post_ids FROM posts LIMIT 50;
    SELECT array_agg(id) INTO v_user_ids FROM profiles LIMIT 12;
    
    -- Criar 200 comentários
    FOR v_i IN 1..200 LOOP
        v_post_id := v_post_ids[(floor(random() * array_length(v_post_ids, 1))::INTEGER) + 1];
        v_user_id := v_user_ids[(floor(random() * array_length(v_user_ids, 1))::INTEGER) + 1];
        
        INSERT INTO comments (
            id, post_id, author_id, content, likes_count,
            created_at, updated_at
        ) VALUES (
            uuid_generate_v4(),
            v_post_id,
            v_user_id,
            v_comments[(floor(random() * array_length(v_comments, 1))::INTEGER) + 1],
            floor(random() * 10)::INTEGER,
            (SELECT created_at FROM posts WHERE id = v_post_id) + (random() * interval '5 days'),
            NOW()
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- Atualizar contadores de comentários
UPDATE posts p
SET comments_count = (
    SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.is_deleted = FALSE
);

-- ============================================================================
-- 9. SEGUIDORES (FOLLOWS)
-- ============================================================================

INSERT INTO follows (follower_id, following_id, created_at)
SELECT 
    u1.id,
    u2.id,
    NOW() - (random() * interval '90 days')
FROM profiles u1
CROSS JOIN profiles u2
WHERE u1.id != u2.id
  AND random() > 0.7  -- 30% de chance de seguir
LIMIT 150
ON CONFLICT DO NOTHING;

-- Atualizar contadores de seguidores
UPDATE profiles p
SET 
    followers_count = (SELECT COUNT(*) FROM follows f WHERE f.following_id = p.id),
    following_count = (SELECT COUNT(*) FROM follows f WHERE f.follower_id = p.id);

-- ============================================================================
-- 10. SERVIÇOS (MARKETPLACE)
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
    
    -- Criar 30 serviços
    FOR v_i IN 1..30 LOOP
        v_category_id := v_category_ids[(v_i % array_length(v_category_ids, 1)) + 1];
        v_provider_id := v_provider_ids[(v_i % array_length(v_provider_ids, 1)) + 1];
        
        INSERT INTO service_listings (
            id, provider_id, category_id, title, description,
            price_per_hour, currency, is_active, is_verified,
            rating_average, review_count, view_count,
            created_at, updated_at
        ) VALUES (
            uuid_generate_v4(),
            v_provider_id,
            v_category_id,
            v_service_titles[(v_i % array_length(v_service_titles, 1)) + 1],
            v_service_descriptions[(v_i % array_length(v_service_descriptions, 1)) + 1],
            v_prices[(v_i % array_length(v_prices, 1)) + 1],
            'EUR',
            TRUE,
            CASE WHEN random() > 0.3 THEN TRUE ELSE FALSE END,
            (3.5 + random() * 1.5)::DECIMAL(3,2),  -- Rating entre 3.5 e 5.0
            floor(random() * 25)::INTEGER,
            floor(random() * 200)::INTEGER,
            NOW() - (random() * interval '120 days'),
            NOW() - (random() * interval '30 days')
        );
    END LOOP;
END $$;

-- ============================================================================
-- 11. PEDIDOS DE SERVIÇO (SERVICE REQUESTS)
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
        'Preciso de ajuda para abrir conta bancária'
    ];
    v_provider_ids UUID[];
    v_client_ids UUID[];
    v_service_ids UUID[];
    v_provider_id UUID;
    v_client_id UUID;
    v_service_id UUID;
    v_i INTEGER;
BEGIN
    SELECT array_agg(id) INTO v_provider_ids FROM profiles WHERE role IN ('helper', 'admin') LIMIT 8;
    SELECT array_agg(id) INTO v_client_ids FROM profiles WHERE role = 'imigrant' LIMIT 5;
    SELECT array_agg(id) INTO v_service_ids FROM service_listings LIMIT 30;
    
    -- Criar 25 pedidos
    FOR v_i IN 1..25 LOOP
        v_provider_id := v_provider_ids[(floor(random() * array_length(v_provider_ids, 1))::INTEGER) + 1];
        v_client_id := v_client_ids[(floor(random() * array_length(v_client_ids, 1))::INTEGER) + 1];
        v_service_id := v_service_ids[(floor(random() * array_length(v_service_ids, 1))::INTEGER) + 1];
        
        INSERT INTO service_requests (
            id, author_id, service_id, title, description,
            status, budget, currency,
            created_at, updated_at
        ) VALUES (
            uuid_generate_v4(),
            v_client_id,
            v_service_id,
            v_request_titles[(v_i % array_length(v_request_titles, 1)) + 1],
            'Descrição detalhada do que preciso. Por favor, entre em contato!',
            (ARRAY['open', 'in_progress', 'completed', 'cancelled'])[floor(random() * 4)::INTEGER + 1]::VARCHAR,
            (50 + random() * 200)::DECIMAL(10,2),
            'EUR',
            NOW() - (random() * interval '60 days'),
            NOW() - (random() * interval '20 days')
        );
    END LOOP;
END $$;

-- ============================================================================
-- 12. PROPOSTAS DE SERVIÇO
-- ============================================================================

INSERT INTO service_proposals (id, request_id, provider_id, message, price, currency, status, created_at)
SELECT 
    uuid_generate_v4(),
    sr.id,
    sl.provider_id,
    'Posso ajudar com isso! Tenho experiência e referências.',
    sr.budget * (0.8 + random() * 0.4),  -- Preço entre 80% e 120% do orçamento
    sr.currency,
    (ARRAY['pending', 'accepted', 'rejected'])[floor(random() * 3)::INTEGER + 1]::VARCHAR,
    sr.created_at + (random() * interval '2 days')
FROM service_requests sr
JOIN service_listings sl ON sr.service_id = sl.id
WHERE random() > 0.5  -- 50% dos pedidos têm propostas
LIMIT 15;

-- ============================================================================
-- 13. REVIEWS
-- ============================================================================

DO $$
DECLARE
    v_review_texts TEXT[] := ARRAY[
        'Excelente serviço! Muito profissional e atencioso.',
        'Recomendo! Resolveu meu problema rapidamente.',
        'Ótima experiência. Voltarei a contratar!',
        'Muito satisfeito com o trabalho realizado.',
        'Profissional competente e preço justo.',
        'Superou minhas expectativas!',
        'Serviço de qualidade. Recomendo!',
        'Atendimento excelente e resultado perfeito.'
    ];
    v_service_ids UUID[];
    v_reviewer_ids UUID[];
    v_service_id UUID;
    v_reviewer_id UUID;
    v_i INTEGER;
BEGIN
    SELECT array_agg(id) INTO v_service_ids FROM service_listings LIMIT 30;
    SELECT array_agg(id) INTO v_reviewer_ids FROM profiles LIMIT 12;
    
    -- Criar 40 reviews
    FOR v_i IN 1..40 LOOP
        v_service_id := v_service_ids[(floor(random() * array_length(v_service_ids, 1))::INTEGER) + 1];
        v_reviewer_id := v_reviewer_ids[(floor(random() * array_length(v_reviewer_ids, 1))::INTEGER) + 1];
        
        INSERT INTO reviews (
            id, service_id, reviewer_id, rating, comment,
            created_at, updated_at
        ) VALUES (
            uuid_generate_v4(),
            v_service_id,
            v_reviewer_id,
            (4 + floor(random() * 2))::INTEGER,  -- Rating 4 ou 5
            v_review_texts[(floor(random() * array_length(v_review_texts, 1))::INTEGER) + 1],
            NOW() - (random() * interval '90 days'),
            NOW()
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- Atualizar ratings dos serviços
UPDATE service_listings sl
SET 
    rating_average = (
        SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0)
        FROM reviews r
        WHERE r.service_id = sl.id
    ),
    review_count = (
        SELECT COUNT(*)
        FROM reviews r
        WHERE r.service_id = sl.id
    );

-- ============================================================================
-- 14. GRUPOS
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
    
    -- Criar 8 grupos
    FOR v_i IN 1..8 LOOP
        v_creator_id := v_creator_ids[(v_i % array_length(v_creator_ids, 1)) + 1];
        v_city_id := v_city_ids[(v_i % array_length(v_city_ids, 1)) + 1];
        v_country_id := v_country_ids[(v_i % array_length(v_country_ids, 1)) + 1];
        
        INSERT INTO groups (
            id, name, description, city_id, country_id,
            member_count, is_public, created_by,
            created_at, updated_at
        ) VALUES (
            uuid_generate_v4(),
            v_group_names[v_i],
            v_group_descriptions[v_i],
            v_city_id,
            v_country_id,
            floor(random() * 200)::INTEGER + 50,
            TRUE,
            v_creator_id,
            NOW() - (random() * interval '180 days'),
            NOW() - (random() * interval '30 days')
        );
    END LOOP;
END $$;

-- ============================================================================
-- 15. MEMBROS DE GRUPOS
-- ============================================================================

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
SET member_count = (
    SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id
);

-- ============================================================================
-- 16. POSTS EM GRUPOS
-- ============================================================================

INSERT INTO group_posts (group_id, post_id, created_at)
SELECT 
    g.id,
    p.id,
    p.created_at
FROM groups g
CROSS JOIN posts p
WHERE random() > 0.7  -- 30% dos posts estão em grupos
LIMIT 20
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 17. NOTIFICAÇÕES
-- ============================================================================

DO $$
DECLARE
    v_notification_types TEXT[] := ARRAY[
        'new_follower', 'post_like', 'post_comment', 'new_message',
        'proposal_accepted', 'new_proposal', 'review_received'
    ];
    v_user_ids UUID[];
    v_user_id UUID;
    v_i INTEGER;
BEGIN
    SELECT array_agg(id) INTO v_user_ids FROM profiles LIMIT 12;
    
    -- Criar 100 notificações
    FOR v_i IN 1..100 LOOP
        v_user_id := v_user_ids[(floor(random() * array_length(v_user_ids, 1))::INTEGER) + 1];
        
        INSERT INTO notifications (
            id, user_id, type, title, message, is_read,
            created_at
        ) VALUES (
            uuid_generate_v4(),
            v_user_id,
            v_notification_types[(floor(random() * array_length(v_notification_types, 1))::INTEGER) + 1]::VARCHAR,
            'Nova notificação',
            'Você tem uma nova atualização!',
            random() > 0.4,  -- 60% não lidas
            NOW() - (random() * interval '30 days')
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- ============================================================================
-- 18. CHATS E MENSAGENS
-- ============================================================================

DO $$
DECLARE
    v_message_texts TEXT[] := ARRAY[
        'Olá! Como posso ajudar?',
        'Obrigado pela ajuda!',
        'Podemos marcar para amanhã?',
        'Perfeito! Combinado então.',
        'Qual o horário que te convém?',
        'Entendido! Até logo.',
        'Muito obrigado!',
        'Vou verificar e te aviso.'
    ];
    v_user_ids UUID[];
    v_user1_id UUID;
    v_user2_id UUID;
    v_chat_id UUID;
    v_i INTEGER;
    v_j INTEGER;
BEGIN
    SELECT array_agg(id) INTO v_user_ids FROM profiles LIMIT 12;
    
    -- Criar 20 chats
    FOR v_i IN 1..20 LOOP
        v_user1_id := v_user_ids[(floor(random() * array_length(v_user_ids, 1))::INTEGER) + 1];
        v_user2_id := v_user_ids[(floor(random() * array_length(v_user_ids, 1))::INTEGER) + 1];
        
        -- Garantir que são usuários diferentes
        WHILE v_user1_id = v_user2_id LOOP
            v_user2_id := v_user_ids[(floor(random() * array_length(v_user_ids, 1))::INTEGER) + 1];
        END LOOP;
        
        v_chat_id := uuid_generate_v4();
        
        INSERT INTO chats (id, user1_id, user2_id, last_message_at, created_at)
        VALUES (
            v_chat_id,
            v_user1_id,
            v_user2_id,
            NOW() - (random() * interval '15 days'),
            NOW() - (random() * interval '30 days')
        )
        ON CONFLICT DO NOTHING;
        
        -- Criar 3-8 mensagens por chat
        FOR v_j IN 1..(3 + floor(random() * 6)::INTEGER) LOOP
            INSERT INTO messages (
                id, chat_id, sender_id, content, is_read,
                created_at
            ) VALUES (
                uuid_generate_v4(),
                v_chat_id,
                CASE WHEN v_j % 2 = 0 THEN v_user1_id ELSE v_user2_id END,
                v_message_texts[(floor(random() * array_length(v_message_texts, 1))::INTEGER) + 1],
                random() > 0.3,
                NOW() - (random() * interval '10 days') + (v_j * interval '1 hour')
            )
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- ============================================================================
-- 19. CAMPANHAS DE ADS (ADMIN)
-- ============================================================================

INSERT INTO ad_campaigns (
    id, sponsor_name, sponsor_email, title, description,
    status, budget, spent, impressions, clicks,
    start_date, end_date, created_by, created_at, updated_at
) VALUES
(
    uuid_generate_v4(),
    'Banco Português',
    'marketing@bancopt.com',
    'Conta para Imigrantes',
    'Abra sua conta sem complicação!',
    'active',
    5000.00,
    3200.50,
    45000,
    1200,
    NOW() - interval '30 days',
    NOW() + interval '30 days',
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    NOW() - interval '30 days',
    NOW()
),
(
    uuid_generate_v4(),
    'Escola de Idiomas',
    'contato@escolaidiomas.pt',
    'Aprenda Português',
    'Cursos intensivos para imigrantes',
    'active',
    3000.00,
    1800.00,
    28000,
    850,
    NOW() - interval '20 days',
    NOW() + interval '40 days',
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    NOW() - interval '20 days',
    NOW()
),
(
    uuid_generate_v4(),
    'Agência Imobiliária',
    'vendas@imobiliaria.pt',
    'Encontre seu Lar',
    'Apartamentos para imigrantes',
    'paused',
    2000.00,
    1500.00,
    15000,
    400,
    NOW() - interval '15 days',
    NOW() + interval '15 days',
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    NOW() - interval '15 days',
    NOW()
);

-- ============================================================================
-- 20. CREATOR PAYOUTS (ADMIN)
-- ============================================================================

INSERT INTO creator_payouts (
    id, creator_id, period_start, period_end,
    total_views, verified_helps, ad_impressions,
    estimated_payout, final_payout, currency, status,
    created_at, updated_at
)
SELECT 
    uuid_generate_v4(),
    p.id,
    NOW() - interval '30 days',
    NOW(),
    floor(random() * 5000)::INTEGER + 1000,
    floor(random() * 50)::INTEGER + 10,
    floor(random() * 10000)::INTEGER + 2000,
    (100 + random() * 400)::DECIMAL(10,2),
    (100 + random() * 400)::DECIMAL(10,2),
    'EUR',
    (ARRAY['pending', 'approved', 'paid'])[floor(random() * 3)::INTEGER + 1]::VARCHAR,
    NOW() - interval '5 days',
    NOW()
FROM profiles p
WHERE p.followers_count > 100
LIMIT 5;

-- ============================================================================
-- 21. AD IMPRESSIONS (Tracking de visualizações de ads)
-- ============================================================================

INSERT INTO ad_impressions (
    id, campaign_id, user_id, post_id, impression_type,
    country_id, city_id, device_type, created_at
)
SELECT 
    uuid_generate_v4(),
    ac.id,
    p.id,
    (SELECT id FROM posts ORDER BY random() LIMIT 1),
    (ARRAY['view', 'click'])[floor(random() * 2)::INTEGER + 1]::VARCHAR,
    (SELECT id FROM countries ORDER BY random() LIMIT 1),
    (SELECT id FROM cities ORDER BY random() LIMIT 1),
    (ARRAY['mobile', 'desktop', 'tablet'])[floor(random() * 3)::INTEGER + 1]::VARCHAR,
    ac.start_date + (random() * (NOW() - ac.start_date))
FROM ad_campaigns ac
CROSS JOIN profiles p
WHERE random() > 0.7  -- 30% dos usuários viram cada ad
LIMIT 200;

-- ============================================================================
-- 22. REPORTS (Denúncias)
-- ============================================================================

INSERT INTO reports (
    id, reporter_id, target_type, target_id, reason, description,
    status, created_at
)
SELECT 
    uuid_generate_v4(),
    u1.id,
    'post'::VARCHAR,
    p.id,
    (ARRAY['spam', 'inappropriate', 'harassment', 'other'])[floor(random() * 4)::INTEGER + 1]::VARCHAR,
    'Conteúdo reportado para moderação.',
    (ARRAY['pending', 'reviewing', 'resolved', 'dismissed'])[floor(random() * 4)::INTEGER + 1]::VARCHAR,
    NOW() - (random() * interval '20 days')
FROM profiles u1
CROSS JOIN posts p
WHERE u1.id != p.author_id
  AND random() > 0.95  -- 5% de chance de reportar
LIMIT 10
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 23. MODERATION ACTIONS (Ações de moderação)
-- ============================================================================

INSERT INTO moderation_actions (
    id, action_type, target_type, target_id, moderator_id,
    reason, severity, status, created_at
)
SELECT 
    uuid_generate_v4(),
    'post_hide'::VARCHAR,
    'post'::VARCHAR,
    p.id,
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    'Conteúdo removido por violação das diretrizes.',
    (ARRAY['low', 'medium', 'high'])[floor(random() * 3)::INTEGER + 1]::VARCHAR,
    'active'::VARCHAR,
    NOW() - (random() * interval '10 days')
FROM posts p
WHERE random() > 0.98  -- 2% dos posts foram moderados
LIMIT 3
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 24. TRANSACTIONS (Transações financeiras)
-- ============================================================================

INSERT INTO transactions (
    id, user_id, type, amount, currency, status,
    service_id, payment_method, description, created_at, completed_at
)
SELECT 
    uuid_generate_v4(),
    sr.author_id,
    'payment'::VARCHAR,
    sr.budget,
    sr.currency,
    'completed'::VARCHAR,
    sr.service_id,
    (ARRAY['stripe', 'paypal', 'wallet'])[floor(random() * 3)::INTEGER + 1]::VARCHAR,
    'Pagamento por serviço contratado.',
    sr.created_at + interval '1 day',
    sr.created_at + interval '2 days'
FROM service_requests sr
WHERE sr.status = 'completed'
LIMIT 10;

-- ============================================================================
-- 25. WALLETS (Carteiras dos usuários)
-- ============================================================================

INSERT INTO wallets (
    id, user_id, balance, pending_balance, total_earnings,
    currency, payout_enabled, created_at, updated_at
)
SELECT 
    uuid_generate_v4(),
    p.id,
    (random() * 500)::DECIMAL(10,2),
    (random() * 100)::DECIMAL(10,2),
    (random() * 2000)::DECIMAL(10,2),
    'EUR',
    CASE WHEN p.role IN ('helper', 'admin') THEN TRUE ELSE FALSE END,
    NOW() - (random() * interval '90 days'),
    NOW()
FROM profiles p
WHERE p.role IN ('helper', 'admin')
ON CONFLICT (user_id) DO UPDATE SET
    balance = EXCLUDED.balance,
    pending_balance = EXCLUDED.pending_balance,
    total_earnings = EXCLUDED.total_earnings;

-- ============================================================================
-- RESUMO FINAL
-- ============================================================================

DO $$
DECLARE
    v_users_count INTEGER;
    v_posts_count INTEGER;
    v_services_count INTEGER;
    v_groups_count INTEGER;
    v_reviews_count INTEGER;
    v_requests_count INTEGER;
    v_proposals_count INTEGER;
    v_chats_count INTEGER;
    v_notifications_count INTEGER;
    v_campaigns_count INTEGER;
    v_transactions_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_users_count FROM profiles;
    SELECT COUNT(*) INTO v_posts_count FROM posts;
    SELECT COUNT(*) INTO v_services_count FROM service_listings;
    SELECT COUNT(*) INTO v_groups_count FROM groups;
    SELECT COUNT(*) INTO v_reviews_count FROM reviews;
    SELECT COUNT(*) INTO v_requests_count FROM service_requests;
    SELECT COUNT(*) INTO v_proposals_count FROM service_proposals;
    SELECT COUNT(*) INTO v_chats_count FROM chats;
    SELECT COUNT(*) INTO v_notifications_count FROM notifications;
    SELECT COUNT(*) INTO v_campaigns_count FROM ad_campaigns;
    SELECT COUNT(*) INTO v_transactions_count FROM transactions;
    
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ DADOS MOCK CRIADOS COM SUCESSO!';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '👥 Usuários: %', v_users_count;
    RAISE NOTICE '📝 Posts: %', v_posts_count;
    RAISE NOTICE '💬 Comentários: ~200';
    RAISE NOTICE '👍 Likes: ~500';
    RAISE NOTICE '🛠️ Serviços: %', v_services_count;
    RAISE NOTICE '📋 Pedidos: %', v_requests_count;
    RAISE NOTICE '💼 Propostas: %', v_proposals_count;
    RAISE NOTICE '⭐ Reviews: %', v_reviews_count;
    RAISE NOTICE '👥 Grupos: %', v_groups_count;
    RAISE NOTICE '💬 Chats: %', v_chats_count;
    RAISE NOTICE '🔔 Notificações: %', v_notifications_count;
    RAISE NOTICE '📢 Campanhas Ads: %', v_campaigns_count;
    RAISE NOTICE '💰 Transações: %', v_transactions_count;
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SISTEMA PRONTO PARA DEMONSTRAÇÃO AO INVESTIDOR!';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;
