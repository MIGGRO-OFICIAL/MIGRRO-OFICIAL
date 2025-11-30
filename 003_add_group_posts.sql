-- ============================================================================
-- MIGGRO - Adicionar suporte a posts em grupos (VERSÃO IDEMPOTENTE)
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard/project/gjphsheavnkdtmsrxmtl/sql/new
-- 2. Cole TODO este conteúdo no SQL Editor
-- 3. Clique em "Run" para executar
-- 
-- ESTE SCRIPT PODE SER EXECUTADO MÚLTIPLAS VEZES SEM ERRO
-- ============================================================================

-- Adicionar coluna group_id na tabela posts (opcional, NULL = post geral)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'group_id'
    ) THEN
        ALTER TABLE posts 
        ADD COLUMN group_id UUID REFERENCES groups(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Criar índice para busca rápida de posts por grupo
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_group') THEN
        CREATE INDEX idx_posts_group ON posts(group_id) WHERE group_id IS NOT NULL;
    END IF;
END $$;

COMMENT ON COLUMN posts.group_id IS 'ID do grupo ao qual o post pertence. NULL = post no feed geral';
