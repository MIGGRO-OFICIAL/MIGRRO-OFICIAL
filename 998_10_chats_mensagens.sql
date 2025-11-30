-- ============================================================================
-- MIGGRO - PARTE 10: CHATS E MENSAGENS (VERSÃO IDEMPOTENTE)
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
    v_message_texts TEXT[] := ARRAY[
        'Olá! Como posso ajudar?',
        'Obrigado pela ajuda!',
        'Podemos marcar para amanhã?',
        'Perfeito! Combinado então.',
        'Qual o horário que te convém?',
        'Entendido! Até logo.',
        'Muito obrigado!',
        'Vou verificar e te aviso.',
        'Tudo certo!',
        'Pode contar comigo!'
    ];
    v_user_ids UUID[];
    v_user1_id UUID;
    v_user2_id UUID;
    v_conversation_id UUID;
    v_i INTEGER;
    v_j INTEGER;
    v_existing_conversation_id UUID;
BEGIN
    -- Buscar IDs de usuários (precisa de pelo menos 2)
    SELECT array_agg(id) INTO v_user_ids FROM profiles LIMIT 12;
    
    IF array_length(v_user_ids, 1) IS NULL OR array_length(v_user_ids, 1) < 2 THEN
        RAISE NOTICE '⚠️ Precisa de pelo menos 2 usuários! Execute 998_03_perfis.sql primeiro.';
        RETURN;
    END IF;
    
    -- Verificar se existe tabela 'conversations' ou 'chats'
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
        -- Usar conversations (estrutura padrão)
        FOR v_i IN 1..20 LOOP
            v_user1_id := v_user_ids[((floor(random() * array_length(v_user_ids, 1))::INTEGER)) + 1];
            v_user2_id := v_user_ids[((floor(random() * array_length(v_user_ids, 1))::INTEGER)) + 1];
            
            WHILE v_user1_id = v_user2_id LOOP
                v_user2_id := v_user_ids[((floor(random() * array_length(v_user_ids, 1))::INTEGER)) + 1];
            END LOOP;
            
            -- Verificar se já existe conversa entre esses dois usuários
            SELECT id INTO v_existing_conversation_id
            FROM conversations
            WHERE (participant_1_id = LEAST(v_user1_id, v_user2_id) AND participant_2_id = GREATEST(v_user1_id, v_user2_id))
               OR (participant_1_id = GREATEST(v_user1_id, v_user2_id) AND participant_2_id = LEAST(v_user1_id, v_user2_id))
            LIMIT 1;
            
            IF v_existing_conversation_id IS NULL THEN
                v_conversation_id := uuid_generate_v4();
                
                INSERT INTO conversations (id, participant_1_id, participant_2_id, last_message_at, created_at, updated_at)
                VALUES (
                    v_conversation_id,
                    LEAST(v_user1_id, v_user2_id),  -- Sempre menor primeiro para evitar duplicatas
                    GREATEST(v_user1_id, v_user2_id),
                    NOW() - (random() * interval '15 days'),
                    NOW() - (random() * interval '30 days'),
                    NOW() - (random() * interval '15 days')
                )
                ON CONFLICT (participant_1_id, participant_2_id) DO NOTHING
                RETURNING id INTO v_conversation_id;
            ELSE
                v_conversation_id := v_existing_conversation_id;
            END IF;
            
            -- Criar mensagens para esta conversa (3 a 9 mensagens)
            IF v_conversation_id IS NOT NULL THEN
                FOR v_j IN 1..(3 + floor(random() * 6)::INTEGER) LOOP
                    INSERT INTO messages (
                        id, conversation_id, sender_id, text, is_read,
                        created_at
                    ) VALUES (
                        uuid_generate_v4(),
                        v_conversation_id,
                        CASE WHEN v_j % 2 = 0 THEN v_user1_id ELSE v_user2_id END,
                        v_message_texts[((floor(random() * array_length(v_message_texts, 1))::INTEGER)) + 1],
                        random() > 0.3,
                        NOW() - (random() * interval '10 days') + (v_j * interval '1 hour')
                    )
                    ON CONFLICT DO NOTHING;
                END LOOP;
                
                -- Atualizar last_message_at da conversa
                UPDATE conversations
                SET last_message_at = NOW() - (random() * interval '15 days'),
                    updated_at = NOW()
                WHERE id = v_conversation_id;
            END IF;
        END LOOP;
        
        RAISE NOTICE '✅ Conversas e mensagens criadas!';
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chats') THEN
        -- Usar chats (estrutura alternativa)
        FOR v_i IN 1..20 LOOP
            v_user1_id := v_user_ids[((floor(random() * array_length(v_user_ids, 1))::INTEGER)) + 1];
            v_user2_id := v_user_ids[((floor(random() * array_length(v_user_ids, 1))::INTEGER)) + 1];
            
            WHILE v_user1_id = v_user2_id LOOP
                v_user2_id := v_user_ids[((floor(random() * array_length(v_user_ids, 1))::INTEGER)) + 1];
            END LOOP;
            
            v_conversation_id := uuid_generate_v4();
            
            INSERT INTO chats (id, user1_id, user2_id, last_message_at, created_at)
            VALUES (
                v_conversation_id,
                v_user1_id,
                v_user2_id,
                NOW() - (random() * interval '15 days'),
                NOW() - (random() * interval '30 days')
            )
            ON CONFLICT DO NOTHING
            RETURNING id INTO v_conversation_id;
            
            -- Criar mensagens
            IF v_conversation_id IS NOT NULL THEN
                FOR v_j IN 1..(3 + floor(random() * 6)::INTEGER) LOOP
                    INSERT INTO messages (
                        id, chat_id, sender_id, content, is_read,
                        created_at
                    ) VALUES (
                        uuid_generate_v4(),
                        v_conversation_id,
                        CASE WHEN v_j % 2 = 0 THEN v_user1_id ELSE v_user2_id END,
                        v_message_texts[((floor(random() * array_length(v_message_texts, 1))::INTEGER)) + 1],
                        random() > 0.3,
                        NOW() - (random() * interval '10 days') + (v_j * interval '1 hour')
                    )
                    ON CONFLICT DO NOTHING;
                END LOOP;
            END IF;
        END LOOP;
        
        RAISE NOTICE '✅ Chats e mensagens criados!';
    ELSE
        RAISE NOTICE '⚠️ Tabela de conversas/chats não encontrada!';
    END IF;
END $$;
