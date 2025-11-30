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
            gen_random_uuid(),
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
    ELSE
        INSERT INTO wallets (
            id, user_id, balance, pending_payout, total_earnings,
            currency, created_at, updated_at
        )
        SELECT 
            gen_random_uuid(),
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
            total_earnings = EXCLUDED.total_earnings;
    END IF;
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
            gen_random_uuid(),
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
        LIMIT 10;
    ELSE
        -- Estrutura da migration 001 (usa reference_id)
        INSERT INTO transactions (
            id, user_id, type, amount, currency, status,
            context, reference_id, reference_type, description, created_at
        )
        SELECT 
            gen_random_uuid(),
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
        LIMIT 10;
    END IF;
END $$;

-- AD IMPRESSIONS
INSERT INTO ad_impressions (
    id, campaign_id, user_id, post_id, impression_type,
    country_id, city_id, device_type, created_at
)
SELECT 
    gen_random_uuid(),
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
