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
                gen_random_uuid(),
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
                gen_random_uuid(),
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
