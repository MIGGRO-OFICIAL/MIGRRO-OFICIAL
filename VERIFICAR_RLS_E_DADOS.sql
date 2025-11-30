-- ============================================================================
-- VERIFICAÇÃO COMPLETA: RLS e Dados Mock
-- Execute no SQL Editor do Supabase
-- ============================================================================

-- ============================================================================
-- PARTE 1: Verificar se dados existem
-- ============================================================================

SELECT 
    'posts' as tabela,
    COUNT(*) as total,
    COUNT(CASE WHEN is_deleted = false THEN 1 END) as nao_deletados,
    COUNT(CASE WHEN group_id IS NULL THEN 1 END) as posts_gerais
FROM posts

UNION ALL

SELECT 
    'service_listings' as tabela,
    COUNT(*) as total,
    COUNT(CASE WHEN is_active = true THEN 1 END) as ativos,
    0 as nao_deletados
FROM service_listings

UNION ALL

SELECT 
    'groups' as tabela,
    COUNT(*) as total,
    COUNT(CASE WHEN is_private = false THEN 1 END) as grupos_publicos,
    0 as nao_deletados
FROM groups

UNION ALL

SELECT 
    'profiles' as tabela,
    COUNT(*) as total,
    COUNT(CASE WHEN email != 'rafaelmilfont@gmail.com' THEN 1 END) as mock_profiles,
    0 as nao_deletados
FROM profiles

ORDER BY tabela;

-- ============================================================================
-- PARTE 2: Verificar Políticas RLS
-- ============================================================================

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN 'Tem condição'
        ELSE 'Sem condição'
    END as tem_condicao
FROM pg_policies
WHERE tablename IN ('posts', 'service_listings', 'groups', 'profiles', 'comments', 'post_likes')
ORDER BY tablename, policyname;

-- ============================================================================
-- PARTE 3: Testar Query como Usuário Autenticado
-- ============================================================================

-- Esta query simula o que o frontend faz
-- Execute como o usuário logado (rafaelmilfont@gmail.com)

SELECT 
    p.id,
    p.content,
    p.created_at,
    author.name as author_name,
    author.username as author_username
FROM posts p
LEFT JOIN profiles author ON p.author_id = author.id
WHERE p.is_deleted = false
  AND p.group_id IS NULL  -- Apenas posts gerais (não de grupos)
ORDER BY p.created_at DESC
LIMIT 10;

-- ============================================================================
-- PARTE 4: Verificar se há problemas de Foreign Keys
-- ============================================================================

-- Verificar posts sem autor válido
SELECT 
    COUNT(*) as posts_sem_autor_valido
FROM posts p
LEFT JOIN profiles pr ON p.author_id = pr.id
WHERE pr.id IS NULL;

-- Verificar serviços sem provider válido
SELECT 
    COUNT(*) as servicos_sem_provider_valido
FROM service_listings sl
LEFT JOIN profiles pr ON sl.provider_id = pr.id
WHERE pr.id IS NULL;

-- Verificar grupos sem criador válido
SELECT 
    COUNT(*) as grupos_sem_criador_valido
FROM groups g
LEFT JOIN profiles pr ON g.created_by = pr.id
WHERE pr.id IS NULL;

-- ============================================================================
-- PARTE 5: Verificar RLS Habilitado/Desabilitado
-- ============================================================================

SELECT 
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('posts', 'service_listings', 'groups', 'profiles', 'comments', 'post_likes')
ORDER BY tablename;
