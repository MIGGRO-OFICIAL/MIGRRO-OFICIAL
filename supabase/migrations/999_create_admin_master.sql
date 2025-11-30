-- ============================================================================
-- MIGGRO - Criar Admin Master
-- Email: rafaelmilfont@gmail.com
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Primeiro, certifique-se de que o usuário existe no Supabase Auth
--    - Acesse: Supabase Dashboard > Authentication > Users
--    - Se não existir, crie manualmente ou faça login uma vez no app
-- 2. Depois, execute este script no SQL Editor do Supabase
-- ============================================================================

DO $$
DECLARE
    v_user_id UUID;
    v_email TEXT := 'rafaelmilfont@gmail.com';
    v_name TEXT := 'Rafael Milfont';
    v_username TEXT := 'rafaelmilfont';
BEGIN
    -- Buscar o ID do usuário no auth.users pelo email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_email;

    -- Se o usuário não existir no auth.users, criar um aviso
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não encontrado no auth.users. Por favor, crie o usuário primeiro no Supabase Dashboard > Authentication > Users, ou faça login uma vez no app.';
    END IF;

    -- Verificar se o perfil já existe
    IF EXISTS (SELECT 1 FROM profiles WHERE id = v_user_id) THEN
        -- Atualizar perfil existente para admin
        UPDATE profiles
        SET 
            role = 'admin',
            email = v_email,
            name = COALESCE(name, v_name),
            username = COALESCE(username, v_username),
            verification_status = 'verified',
            trust_score = 100,
            is_premium = TRUE,
            updated_at = NOW()
        WHERE id = v_user_id;

        RAISE NOTICE 'Perfil atualizado para ADMIN: % (ID: %)', v_email, v_user_id;
    ELSE
        -- Criar novo perfil como admin
        INSERT INTO profiles (
            id,
            email,
            name,
            username,
            role,
            verification_status,
            trust_score,
            is_premium,
            raiz_coins,
            created_at,
            updated_at
        ) VALUES (
            v_user_id,
            v_email,
            v_name,
            v_username,
            'admin',
            'verified',
            100,
            TRUE,
            1000, -- Coins iniciais para admin
            NOW(),
            NOW()
        );

        RAISE NOTICE 'Perfil ADMIN criado com sucesso: % (ID: %)', v_email, v_user_id;
    END IF;

    -- Verificar se foi criado/atualizado corretamente
    IF EXISTS (SELECT 1 FROM profiles WHERE id = v_user_id AND role = 'admin') THEN
        RAISE NOTICE '✅ Admin Master criado/atualizado com sucesso!';
        RAISE NOTICE 'Email: %', v_email;
        RAISE NOTICE 'Role: admin';
        RAISE NOTICE 'Trust Score: 100';
        RAISE NOTICE 'Premium: TRUE';
    ELSE
        RAISE EXCEPTION 'Erro ao criar/atualizar perfil admin';
    END IF;
END $$;

-- Verificação final
SELECT 
    id,
    email,
    name,
    username,
    role,
    verification_status,
    trust_score,
    is_premium,
    raiz_coins,
    created_at
FROM profiles
WHERE email = 'rafaelmilfont@gmail.com';
