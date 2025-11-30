-- ============================================================================
-- CORRIGIR RLS - Permitir Leitura de Dados Mock
-- Execute no SQL Editor do Supabase
-- ============================================================================
-- 
-- PROBLEMA IDENTIFICADO:
-- RLS está habilitado em service_listings, service_requests e groups,
-- mas NÃO há políticas de SELECT criadas. Sem políticas, o acesso é negado!
-- 
-- SOLUÇÃO:
-- Criar políticas que permitam leitura para usuários autenticados
-- ============================================================================

-- ============================================================================
-- PARTE 1: Remover políticas antigas se existirem (idempotente)
-- ============================================================================

DROP POLICY IF EXISTS "Service listings are viewable by everyone" ON service_listings;
DROP POLICY IF EXISTS "Service requests are viewable by everyone" ON service_requests;
DROP POLICY IF EXISTS "Groups are viewable by everyone" ON groups;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
DROP POLICY IF EXISTS "Post likes are viewable by everyone" ON post_likes;
DROP POLICY IF EXISTS "Service proposals are viewable by everyone" ON service_proposals;
DROP POLICY IF EXISTS "Service reviews are viewable by everyone" ON service_reviews;
DROP POLICY IF EXISTS "Group members are viewable by everyone" ON group_members;
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON follows;
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;

-- ============================================================================
-- PARTE 2: Criar Políticas de SELECT (Leitura)
-- ============================================================================

-- Service Listings: Todos os usuários autenticados podem ver serviços ativos
CREATE POLICY "Service listings are viewable by everyone" ON service_listings
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Service Requests: Todos os usuários autenticados podem ver pedidos
CREATE POLICY "Service requests are viewable by everyone" ON service_requests
    FOR SELECT
    TO authenticated
    USING (true);  -- Ver todos os pedidos (pode ajustar depois se necessário)

-- Groups: Todos os usuários autenticados podem ver grupos
CREATE POLICY "Groups are viewable by everyone" ON groups
    FOR SELECT
    TO authenticated
    USING (true);  -- Ver todos os grupos (pode ajustar depois para filtrar privados se necessário)

-- Comments: Todos os usuários autenticados podem ver comentários não deletados
CREATE POLICY "Comments are viewable by everyone" ON comments
    FOR SELECT
    TO authenticated
    USING (is_deleted = false OR is_deleted IS NULL);

-- Post Likes: Todos os usuários autenticados podem ver likes
CREATE POLICY "Post likes are viewable by everyone" ON post_likes
    FOR SELECT
    TO authenticated
    USING (true);

-- Service Proposals: Todos os usuários autenticados podem ver propostas
CREATE POLICY "Service proposals are viewable by everyone" ON service_proposals
    FOR SELECT
    TO authenticated
    USING (true);

-- Service Reviews: Todos os usuários autenticados podem ver reviews
CREATE POLICY "Service reviews are viewable by everyone" ON service_reviews
    FOR SELECT
    TO authenticated
    USING (true);

-- Group Members: Todos os usuários autenticados podem ver membros de grupos
CREATE POLICY "Group members are viewable by everyone" ON group_members
    FOR SELECT
    TO authenticated
    USING (true);

-- Follows: Todos os usuários autenticados podem ver relacionamentos de follow
CREATE POLICY "Follows are viewable by everyone" ON follows
    FOR SELECT
    TO authenticated
    USING (true);

-- Conversations: Usuários podem ver conversas onde são participantes
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT
    TO authenticated
    USING (
        participant_1_id = auth.uid() OR 
        participant_2_id = auth.uid()
    );

-- ============================================================================
-- PARTE 3: Verificar se políticas foram criadas
-- ============================================================================

SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename IN ('posts', 'service_listings', 'service_requests', 'groups', 'comments', 'post_likes', 'service_proposals', 'service_reviews', 'group_members', 'follows', 'conversations')
ORDER BY tablename, policyname;

-- ============================================================================
-- PARTE 4: Testar Queries (simular o que o frontend faz)
-- ============================================================================

-- Testar query de posts (como o frontend faz)
SELECT 
    COUNT(*) as total_posts_visiveis
FROM posts
WHERE is_deleted = false
  AND group_id IS NULL;

-- Testar query de serviços (como o frontend faz)
SELECT 
    COUNT(*) as total_servicos_visiveis
FROM service_listings
WHERE is_active = true;

-- Testar query de grupos (como o frontend faz)
SELECT 
    COUNT(*) as total_grupos_visiveis
FROM groups;

-- ============================================================================
-- FIM
-- ============================================================================

-- Após executar, verifique se os dados aparecem na produção!
