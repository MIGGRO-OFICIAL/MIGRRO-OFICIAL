-- Migration: Adicionar suporte a posts em grupos
-- Data: 2025-11-29

-- Adicionar coluna group_id na tabela posts (opcional, NULL = post geral)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id) ON DELETE CASCADE;

-- Criar índice para busca rápida de posts por grupo
CREATE INDEX IF NOT EXISTS idx_posts_group ON posts(group_id) WHERE group_id IS NOT NULL;

-- Atualizar RLS para permitir que membros do grupo vejam posts do grupo
-- (As políticas existentes já cobrem isso, mas vamos garantir)

COMMENT ON COLUMN posts.group_id IS 'ID do grupo ao qual o post pertence. NULL = post no feed geral';
<<<<<<< HEAD
=======
=======
-- Migration: Adicionar suporte a posts em grupos
-- Data: 2025-11-29

-- Adicionar coluna group_id na tabela posts (opcional, NULL = post geral)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id) ON DELETE CASCADE;

-- Criar índice para busca rápida de posts por grupo
CREATE INDEX IF NOT EXISTS idx_posts_group ON posts(group_id) WHERE group_id IS NOT NULL;

-- Atualizar RLS para permitir que membros do grupo vejam posts do grupo
-- (As políticas existentes já cobrem isso, mas vamos garantir)

COMMENT ON COLUMN posts.group_id IS 'ID do grupo ao qual o post pertence. NULL = post no feed geral';
>>>>>>> origin/main
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
