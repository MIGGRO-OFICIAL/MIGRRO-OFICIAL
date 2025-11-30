-- ============================================================================
-- MIGGRO - TODAS AS MIGRATIONS RESTANTES DE DADOS MOCK (VERSÃO IDEMPOTENTE)
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
-- Este arquivo contém as seguintes migrations em sequência:
-- - 998_06: Likes e Comentários
-- - 998_07: Seguidores
-- - 998_08: Reviews
-- - 998_11: Notificações
-- - 998_12: Badges para Usuários
-- - 998_14: Campanhas de Ads e Creator Payouts
-- - 998_15: Dados Finais (Wallets, Transactions, Ad Impressions)
-- ============================================================================

-- ============================================================================
-- PARTE 6: LIKES E COMENTÁRIOS
-- ============================================================================

-- LIKES EM POSTS
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

-- COMENTÁRIOS
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
    
    IF array_length(v_post_ids, 1) IS NULL OR array_length(v_user_ids, 1) IS NULL THEN
        RAISE NOTICE '⚠️ Execute as partes anteriores primeiro!';
        RETURN;
    END IF;
    
    -- Criar 200 comentários
    FOR v_i IN 1..200 LOOP
        v_post_id := v_post_ids[((floor(random() * array_length(v_post_ids, 1))::INTEGER)) + 1];
        v_user_id := v_user_ids[((floor(random() * array_length(v_user_ids, 1))::INTEGER)) + 1];
        
        INSERT INTO comments (
            id, post_id, author_id, content, likes_count,
            created_at, updated_at
        ) VALUES (
            uuid_generate_v4(),
            v_post_id,
            v_user_id,
            v_comments[((floor(random() * array_length(v_comments, 1))::INTEGER)) + 1],
            floor(random() * 10)::INTEGER,
            (SELECT created_at FROM posts WHERE id = v_post_id) + (random() * interval '5 days'),
            NOW()
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
    
    -- Atualizar contadores de comentários
    UPDATE posts p
    SET comments_count = (
        SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND (c.is_deleted = FALSE OR c.is_deleted IS NULL)
    );
    
    RAISE NOTICE '✅ Likes e comentários criados!';
END $$;

-- ============================================================================
-- PARTE 7: SEGUIDORES (FOLLOWS)
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

DO $$ BEGIN RAISE NOTICE '✅ Seguidores criados!'; END $$;

-- ============================================================================
-- PARTE 8: REVIEWS
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
    
    IF array_length(v_service_ids, 1) IS NULL OR array_length(v_reviewer_ids, 1) IS NULL THEN
        RAISE NOTICE '⚠️ Execute as partes anteriores primeiro!';
        RETURN;
    END IF;
    
    -- Criar 40 reviews
    FOR v_i IN 1..40 LOOP
        v_service_id := v_service_ids[((floor(random() * array_length(v_service_ids, 1))::INTEGER)) + 1];
        v_reviewer_id := v_reviewer_ids[((floor(random() * array_length(v_reviewer_ids, 1))::INTEGER)) + 1];
        
        INSERT INTO service_reviews (
            id, service_listing_id, reviewer_id, reviewee_id, rating, comment,
            context, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(),
            v_service_id,
            v_reviewer_id,
            (SELECT provider_id FROM service_listings WHERE id = v_service_id),
            (4 + floor(random() * 2))::INTEGER,  -- Rating 4 ou 5
            v_review_texts[((floor(random() * array_length(v_review_texts, 1))::INTEGER)) + 1],
            'service_listing'::VARCHAR,
            NOW() - (random() * interval '90 days'),
            NOW()
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
    
    -- Atualizar ratings dos serviços
    UPDATE service_listings sl
    SET 
        rating = (
            SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0)
            FROM service_reviews r
            WHERE r.service_listing_id = sl.id
        ),
        reviews_count = (
            SELECT COUNT(*)
            FROM service_reviews r
            WHERE r.service_listing_id = sl.id
        );
    
    RAISE NOTICE '✅ 40 reviews criados!';
END $$;

-- ============================================================================
-- PARTE 11: NOTIFICAÇÕES
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
    v_use_message BOOLEAN;
BEGIN
    SELECT array_agg(id) INTO v_user_ids FROM profiles LIMIT 12;
    
    IF array_length(v_user_ids, 1) IS NULL THEN
        RAISE NOTICE '⚠️ Execute a parte 3 primeiro!';
        RETURN;
    END IF;
    
    -- Verificar qual coluna usar (message ou body)
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'message'
    ) INTO v_use_message;
    
    -- Criar 100 notificações
    FOR v_i IN 1..100 LOOP
        v_user_id := v_user_ids[((floor(random() * array_length(v_user_ids, 1))::INTEGER)) + 1];
        
        IF v_use_message THEN
            INSERT INTO notifications (
                id, user_id, type, title, message, is_read,
                created_at
            ) VALUES (
                uuid_generate_v4(),
                v_user_id,
                v_notification_types[((floor(random() * array_length(v_notification_types, 1))::INTEGER)) + 1]::VARCHAR,
                'Nova notificação',
                'Você tem uma nova atualização!',
                random() > 0.4,
                NOW() - (random() * interval '30 days')
            )
            ON CONFLICT DO NOTHING;
        ELSE
            INSERT INTO notifications (
                id, user_id, type, title, body, is_read,
                created_at
            ) VALUES (
                uuid_generate_v4(),
                v_user_id,
                v_notification_types[((floor(random() * array_length(v_notification_types, 1))::INTEGER)) + 1]::VARCHAR,
                'Nova notificação',
                'Você tem uma nova atualização!',
                random() > 0.4,
                NOW() - (random() * interval '30 days')
            )
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ 100 notificações criadas!';
END $$;

-- ============================================================================
-- PARTE 12: BADGES PARA USUÁRIOS
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

DO $$ BEGIN RAISE NOTICE '✅ Badges atribuídos aos usuários!'; END $$;

-- ============================================================================
-- PARTE 14: CAMPANHAS DE ADS E CREATOR PAYOUTS (ADMIN)
-- ============================================================================

-- CAMPANHAS DE ADS
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
)
ON CONFLICT DO NOTHING;

-- CREATOR PAYOUTS
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
LIMIT 5
ON CONFLICT DO NOTHING;

DO $$ BEGIN RAISE NOTICE '✅ Campanhas de ads e creator payouts criados!'; END $$;

-- ============================================================================
-- PARTE 15: DADOS FINAIS (WALLETS, TRANSACTIONS, AD IMPRESSIONS)
-- ============================================================================

-- WALLETS (Carteiras dos prestadores)
-- Tenta usar pending_balance primeiro, se não existir usa pending_payout
DO $$
BEGIN
    -- Verificar qual coluna existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wallets' AND column_name = 'pending_balance'
    ) THEN
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
            total_earnings = EXCLUDED.total_earnings,
            updated_at = NOW();
    ELSE
        INSERT INTO wallets (
            id, user_id, balance, pending_payout, total_earnings,
            currency, created_at, updated_at
        )
        SELECT 
            uuid_generate_v4(),
            p.id,
            (random() * 500)::DECIMAL(10,2),
            (random() * 100)::DECIMAL(10,2),
            (random() * 2000)::DECIMAL(10,2),
            'EUR',
            NOW() - (random() * interval '90 days'),
            NOW()
        FROM profiles p
        WHERE p.role IN ('helper', 'admin')
        ON CONFLICT (user_id) DO UPDATE SET
            balance = EXCLUDED.balance,
            pending_payout = EXCLUDED.pending_payout,
            total_earnings = EXCLUDED.total_earnings,
            updated_at = NOW();
    END IF;
    
    RAISE NOTICE '✅ Wallets criadas!';
END $$;

-- TRANSACTIONS (Transações financeiras)
-- Verifica qual estrutura de transactions existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'service_id'
    ) THEN
        -- Estrutura da migration 007 (tem service_id)
        INSERT INTO transactions (
            id, user_id, type, amount, currency, status,
            service_id, payment_method, description, created_at
        )
        SELECT 
            uuid_generate_v4(),
            sr.author_id,
            'payment'::VARCHAR,
            COALESCE(
                sr.budget_min,
                sr.budget_max,
                (COALESCE(sr.budget_min, 0) + COALESCE(sr.budget_max, 0)) / 2,
                100.00
            ),
            sr.currency,
            'completed'::VARCHAR,
            NULL,  -- service_requests não tem service_id direto
            (ARRAY['stripe', 'paypal', 'wallet'])[floor(random() * 3)::INTEGER + 1]::VARCHAR,
            'Pagamento por serviço contratado.',
            sr.created_at + interval '1 day'
        FROM service_requests sr
        WHERE sr.status = 'completed'
        AND (sr.budget_min IS NOT NULL OR sr.budget_max IS NOT NULL)
        LIMIT 10
        ON CONFLICT DO NOTHING;
    ELSE
        -- Estrutura da migration 001 (usa reference_id)
        INSERT INTO transactions (
            id, user_id, type, amount, currency, status,
            context, reference_id, reference_type, description, created_at
        )
        SELECT 
            uuid_generate_v4(),
            sr.author_id,
            'spent'::VARCHAR,
            COALESCE(
                sr.budget_min,
                sr.budget_max,
                (COALESCE(sr.budget_min, 0) + COALESCE(sr.budget_max, 0)) / 2,
                100.00
            ),
            sr.currency,
            'completed'::VARCHAR,
            'service_payment'::VARCHAR,
            sr.category_id,  -- service_requests não tem service_id, usa category_id como referência
            'service_request'::VARCHAR,
            'Pagamento por serviço contratado.',
            sr.created_at + interval '1 day'
        FROM service_requests sr
        WHERE sr.status = 'completed'
        AND (sr.budget_min IS NOT NULL OR sr.budget_max IS NOT NULL)
        LIMIT 10
        ON CONFLICT DO NOTHING;
    END IF;
    
    RAISE NOTICE '✅ Transações criadas!';
END $$;

-- AD IMPRESSIONS
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
LIMIT 200
ON CONFLICT DO NOTHING;

-- RESUMO FINAL
DO $$
DECLARE
    v_users_count INTEGER;
    v_posts_count INTEGER;
    v_services_count INTEGER;
    v_groups_count INTEGER;
    v_reviews_count INTEGER;
    v_requests_count INTEGER;
    v_chats_count INTEGER;
    v_notifications_count INTEGER;
    v_campaigns_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_users_count FROM profiles;
    SELECT COUNT(*) INTO v_posts_count FROM posts;
    SELECT COUNT(*) INTO v_services_count FROM service_listings;
    SELECT COUNT(*) INTO v_groups_count FROM groups;
    SELECT COUNT(*) INTO v_reviews_count FROM service_reviews;
    SELECT COUNT(*) INTO v_requests_count FROM service_requests;
    -- Verificar se existe chats ou conversations
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chats') THEN
        SELECT COUNT(*) INTO v_chats_count FROM chats;
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
        SELECT COUNT(*) INTO v_chats_count FROM conversations;
    ELSE
        v_chats_count := 0;
    END IF;
    SELECT COUNT(*) INTO v_notifications_count FROM notifications;
    SELECT COUNT(*) INTO v_campaigns_count FROM ad_campaigns;
    
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ DADOS MOCK COMPLETOS CRIADOS COM SUCESSO!';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '👥 Usuários: %', v_users_count;
    RAISE NOTICE '📝 Posts: %', v_posts_count;
    RAISE NOTICE '🛠️ Serviços: %', v_services_count;
    RAISE NOTICE '👥 Grupos: %', v_groups_count;
    RAISE NOTICE '⭐ Reviews: %', v_reviews_count;
    RAISE NOTICE '📋 Pedidos: %', v_requests_count;
    RAISE NOTICE '💬 Chats: %', v_chats_count;
    RAISE NOTICE '🔔 Notificações: %', v_notifications_count;
    RAISE NOTICE '📢 Campanhas Ads: %', v_campaigns_count;
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SISTEMA PRONTO PARA DEMONSTRAÇÃO AO INVESTIDOR!';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;
