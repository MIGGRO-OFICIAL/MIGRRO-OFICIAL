-- ============================================================================
-- PARTE 10: CHATS E MENSAGENS
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
    v_conversation_id UUID;
    v_i INTEGER;
    v_j INTEGER;
BEGIN
    SELECT array_agg(id) INTO v_user_ids FROM profiles LIMIT 12;
    
    IF array_length(v_user_ids, 1) IS NULL OR array_length(v_user_ids, 1) < 2 THEN
        RAISE NOTICE '⚠️ Precisa de pelo menos 2 usuários!';
        RETURN;
    END IF;
    
    -- Verificar se existe tabela 'conversations' ou 'chats'
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
        -- Usar conversations (estrutura mais antiga)
        FOR v_i IN 1..20 LOOP
            v_user1_id := v_user_ids[((floor(random() * array_length(v_user_ids, 1))::INTEGER)) + 1];
            v_user2_id := v_user_ids[((floor(random() * array_length(v_user_ids, 1))::INTEGER)) + 1];
            
            WHILE v_user1_id = v_user2_id LOOP
                v_user2_id := v_user_ids[((floor(random() * array_length(v_user_ids, 1))::INTEGER)) + 1];
            END LOOP;
            
            v_conversation_id := gen_random_uuid();
            
            INSERT INTO conversations (id, participant_1_id, participant_2_id, last_message_at)
            VALUES (
                v_conversation_id,
                LEAST(v_user1_id, v_user2_id),  -- Sempre menor primeiro para evitar duplicatas
                GREATEST(v_user1_id, v_user2_id),
                NOW() - (random() * interval '15 days')
            )
            ON CONFLICT (participant_1_id, participant_2_id) DO NOTHING;
            
            FOR v_j IN 1..(3 + floor(random() * 6)::INTEGER) LOOP
                INSERT INTO messages (
                    id, conversation_id, sender_id, text, is_read,
                    created_at
                ) VALUES (
                    gen_random_uuid(),
                    v_conversation_id,
                    CASE WHEN v_j % 2 = 0 THEN v_user1_id ELSE v_user2_id END,
                    v_message_texts[((floor(random() * array_length(v_message_texts, 1))::INTEGER)) + 1],
                    random() > 0.3,
                    NOW() - (random() * interval '10 days') + (v_j * interval '1 hour')
                )
                ON CONFLICT DO NOTHING;
            END LOOP;
        END LOOP;
        
        RAISE NOTICE '✅ 20 conversas com mensagens criadas!';
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chats') THEN
        -- Usar chats (estrutura mais nova)
        FOR v_i IN 1..20 LOOP
            v_user1_id := v_user_ids[((floor(random() * array_length(v_user_ids, 1))::INTEGER)) + 1];
            v_user2_id := v_user_ids[((floor(random() * array_length(v_user_ids, 1))::INTEGER)) + 1];
            
            WHILE v_user1_id = v_user2_id LOOP
                v_user2_id := v_user_ids[((floor(random() * array_length(v_user_ids, 1))::INTEGER)) + 1];
            END LOOP;
            
            v_conversation_id := gen_random_uuid();
            
            INSERT INTO chats (id, user1_id, user2_id, last_message_at, created_at)
            VALUES (
                v_conversation_id,
                v_user1_id,
                v_user2_id,
                NOW() - (random() * interval '15 days'),
                NOW() - (random() * interval '30 days')
            )
            ON CONFLICT DO NOTHING;
            
            FOR v_j IN 1..(3 + floor(random() * 6)::INTEGER) LOOP
                INSERT INTO messages (
                    id, chat_id, sender_id, content, is_read,
                    created_at
                ) VALUES (
                    gen_random_uuid(),
                    v_conversation_id,
                    CASE WHEN v_j % 2 = 0 THEN v_user1_id ELSE v_user2_id END,
                    v_message_texts[((floor(random() * array_length(v_message_texts, 1))::INTEGER)) + 1],
                    random() > 0.3,
                    NOW() - (random() * interval '10 days') + (v_j * interval '1 hour')
                )
                ON CONFLICT DO NOTHING;
            END LOOP;
        END LOOP;
        
        RAISE NOTICE '✅ 20 chats com mensagens criados!';
    ELSE
        RAISE NOTICE '⚠️ Tabela de conversas/chats não encontrada!';
    END IF;
END $$;
