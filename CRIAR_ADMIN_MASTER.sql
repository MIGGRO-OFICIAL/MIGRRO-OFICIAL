-- ============================================================================
-- MIGGRO - Criar Admin Master
-- Email: rafaelmilfont@gmail.com
-- ============================================================================
-- 
-- ⚠️ IMPORTANTE: Execute este script no SQL Editor do Supabase
-- 
-- PRÉ-REQUISITO:
-- O usuário rafaelmilfont@gmail.com precisa existir no Supabase Auth
-- Se não existir:
--   1. Acesse: Supabase Dashboard > Authentication > Users
--   2. Clique em "Add User" e crie o usuário com o email acima
--   3. OU faça login uma vez no app com esse email
-- ============================================================================

-- Opção 1: Se o usuário JÁ EXISTE no auth.users (mais comum)
-- Atualiza o perfil existente para admin
UPDATE profiles 
SET 
    role = 'admin',
    verification_status = 'verified',
    trust_score = 100,
    is_premium = TRUE,
    raiz_coins = 1000,
    updated_at = NOW()
WHERE email = 'rafaelmilfont@gmail.com';

-- Verificar se foi atualizado
SELECT 
    id,
    email,
    name,
    username,
    role,
    verification_status,
    trust_score,
    is_premium,
    raiz_coins
FROM profiles
WHERE email = 'rafaelmilfont@gmail.com';

-- ============================================================================
-- Se o UPDATE acima não encontrou nenhuma linha (0 rows affected),
-- significa que o perfil não existe ainda. Nesse caso:
-- ============================================================================

-- Opção 2: Criar perfil admin (execute apenas se o UPDATE acima retornou 0 linhas)
-- Primeiro, obtenha o ID do usuário:
-- SELECT id FROM auth.users WHERE email = 'rafaelmilfont@gmail.com';
-- 
-- Depois, substitua 'USER_ID_AQUI' pelo ID retornado e execute:
/*
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
    'USER_ID_AQUI', -- Substitua pelo ID do auth.users
    'rafaelmilfont@gmail.com',
    'Rafael Milfont',
    'rafaelmilfont',
    'admin',
    'verified',
    100,
    TRUE,
    1000,
    NOW(),
    NOW()
);
*/
