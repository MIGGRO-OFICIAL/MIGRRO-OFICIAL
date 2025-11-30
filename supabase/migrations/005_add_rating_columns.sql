-- Migration: Adicionar colunas de rating em service_listings
-- Data: 2025-11-29

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
CREATE INDEX IF NOT EXISTS idx_service_listings_rating ON service_listings(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_service_listings_reviews ON service_listings(total_reviews DESC);

COMMENT ON COLUMN service_listings.average_rating IS 'Rating médio do serviço (0-5)';
COMMENT ON COLUMN service_listings.total_reviews IS 'Total de avaliações recebidas';
<<<<<<< HEAD
=======
=======
-- Migration: Adicionar colunas de rating em service_listings
-- Data: 2025-11-29

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
CREATE INDEX IF NOT EXISTS idx_service_listings_rating ON service_listings(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_service_listings_reviews ON service_listings(total_reviews DESC);

COMMENT ON COLUMN service_listings.average_rating IS 'Rating médio do serviço (0-5)';
COMMENT ON COLUMN service_listings.total_reviews IS 'Total de avaliações recebidas';
>>>>>>> origin/main
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
