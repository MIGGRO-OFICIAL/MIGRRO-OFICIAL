-- ============================================================================
-- MIGGRO - Adicionar colunas de rating em service_listings (VERSÃO IDEMPOTENTE)
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard/project/gjphsheavnkdtmsrxmtl/sql/new
-- 2. Cole TODO este conteúdo no SQL Editor
-- 3. Clique em "Run" para executar
-- 
-- ESTE SCRIPT PODE SER EXECUTADO MÚLTIPLAS VEZES SEM ERRO
-- ============================================================================

-- Adicionar colunas de rating se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'service_listings' AND column_name = 'average_rating'
    ) THEN
        ALTER TABLE service_listings 
        ADD COLUMN average_rating DECIMAL(3, 2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'service_listings' AND column_name = 'total_reviews'
    ) THEN
        ALTER TABLE service_listings 
        ADD COLUMN total_reviews INTEGER DEFAULT 0;
    END IF;
END $$;

-- Criar índices
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_service_listings_rating') THEN
        CREATE INDEX idx_service_listings_rating ON service_listings(average_rating DESC);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_service_listings_reviews') THEN
        CREATE INDEX idx_service_listings_reviews ON service_listings(total_reviews DESC);
    END IF;
END $$;

COMMENT ON COLUMN service_listings.average_rating IS 'Rating médio do serviço (0-5)';
COMMENT ON COLUMN service_listings.total_reviews IS 'Total de avaliações recebidas';
