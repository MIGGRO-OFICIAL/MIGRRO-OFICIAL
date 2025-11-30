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
            gen_random_uuid(),
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
