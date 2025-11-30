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
            gen_random_uuid(),
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
        SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.is_deleted = FALSE
    );
    
    RAISE NOTICE '✅ Likes e comentários criados!';
END $$;
