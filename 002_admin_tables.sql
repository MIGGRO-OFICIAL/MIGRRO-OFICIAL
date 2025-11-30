-- ============================================================================
-- MIGGRO - Tabelas para Área Admin (VERSÃO IDEMPOTENTE)
-- Campanhas de Ads, Creator Payouts, Moderação
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard/project/gjphsheavnkdtmsrxmtl/sql/new
-- 2. Cole TODO este conteúdo no SQL Editor
-- 3. Clique em "Run" para executar
-- 
-- ESTE SCRIPT PODE SER EXECUTADO MÚLTIPLAS VEZES SEM ERRO
-- ============================================================================

-- Tabela de Campanhas de Ads
CREATE TABLE IF NOT EXISTS ad_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Informações do Patrocinador
    sponsor_name VARCHAR(200) NOT NULL,
    sponsor_email VARCHAR(255),
    sponsor_phone VARCHAR(20),
    
    -- Detalhes da Campanha
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'completed', 'cancelled')),
    
    -- Orçamento
    budget DECIMAL(10, 2) NOT NULL CHECK (budget > 0),
    spent DECIMAL(10, 2) DEFAULT 0 CHECK (spent >= 0),
    
    -- Métricas
    impressions INTEGER DEFAULT 0 CHECK (impressions >= 0),
    clicks INTEGER DEFAULT 0 CHECK (clicks >= 0),
    
    -- Datas
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    
    -- Configurações
    target_countries UUID[], -- Array de country_ids
    target_cities UUID[], -- Array de city_ids
    target_categories UUID[], -- Array de service_category_ids
    
    -- Mídia
    banner_image_url TEXT,
    video_url TEXT,
    landing_page_url TEXT,
    
    -- Tracking
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ad_campaigns_status') THEN
        CREATE INDEX idx_ad_campaigns_status ON ad_campaigns(status);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ad_campaigns_dates') THEN
        CREATE INDEX idx_ad_campaigns_dates ON ad_campaigns(start_date, end_date);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ad_campaigns_created') THEN
        CREATE INDEX idx_ad_campaigns_created ON ad_campaigns(created_at DESC);
    END IF;
END $$;

DROP TRIGGER IF EXISTS update_ad_campaigns_updated_at ON ad_campaigns;
CREATE TRIGGER update_ad_campaigns_updated_at BEFORE UPDATE ON ad_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabela de Creator Payouts (Repasse para Creators)
CREATE TABLE IF NOT EXISTS creator_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Período do repasse
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Métricas do período
    total_views INTEGER DEFAULT 0,
    verified_helps INTEGER DEFAULT 0, -- Ajudas verificadas (reviews positivos)
    ad_impressions INTEGER DEFAULT 0, -- Impressões de ads em posts do creator
    
    -- Cálculo do repasse
    estimated_payout DECIMAL(10, 2) DEFAULT 0 CHECK (estimated_payout >= 0),
    final_payout DECIMAL(10, 2) DEFAULT 0 CHECK (final_payout >= 0),
    currency VARCHAR(3) DEFAULT 'EUR',
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected', 'cancelled')),
    
    -- Informações de pagamento
    payment_method VARCHAR(50), -- 'stripe', 'paypal', 'bank_transfer'
    payment_reference TEXT, -- ID da transação externa
    paid_at TIMESTAMPTZ,
    
    -- Observações
    notes TEXT,
    rejection_reason TEXT,
    
    -- Tracking
    processed_by UUID REFERENCES profiles(id), -- Admin que processou
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_creator_payouts_creator') THEN
        CREATE INDEX idx_creator_payouts_creator ON creator_payouts(creator_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_creator_payouts_status') THEN
        CREATE INDEX idx_creator_payouts_status ON creator_payouts(status);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_creator_payouts_period') THEN
        CREATE INDEX idx_creator_payouts_period ON creator_payouts(period_start, period_end);
    END IF;
END $$;

DROP TRIGGER IF EXISTS update_creator_payouts_updated_at ON creator_payouts;
CREATE TRIGGER update_creator_payouts_updated_at BEFORE UPDATE ON creator_payouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabela de Ad Impressions (Tracking de visualizações de ads)
CREATE TABLE IF NOT EXISTS ad_impressions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Usuário que viu o ad
    post_id UUID REFERENCES posts(id) ON DELETE SET NULL, -- Post onde o ad apareceu
    
    -- Tipo de interação
    impression_type VARCHAR(20) DEFAULT 'view' CHECK (impression_type IN ('view', 'click', 'conversion')),
    
    -- Localização
    country_id UUID REFERENCES countries(id),
    city_id UUID REFERENCES cities(id),
    
    -- Device info (opcional)
    device_type VARCHAR(20), -- 'mobile', 'desktop', 'tablet'
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ad_impressions_campaign') THEN
        CREATE INDEX idx_ad_impressions_campaign ON ad_impressions(campaign_id, created_at DESC);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ad_impressions_user') THEN
        CREATE INDEX idx_ad_impressions_user ON ad_impressions(user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ad_impressions_type') THEN
        CREATE INDEX idx_ad_impressions_type ON ad_impressions(impression_type);
    END IF;
END $$;

-- Função para atualizar métricas de campanha automaticamente
CREATE OR REPLACE FUNCTION update_campaign_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Atualizar contadores da campanha
        IF NEW.impression_type = 'view' THEN
            UPDATE ad_campaigns 
            SET impressions = impressions + 1,
                updated_at = NOW()
            WHERE id = NEW.campaign_id;
        ELSIF NEW.impression_type = 'click' THEN
            UPDATE ad_campaigns 
            SET clicks = clicks + 1,
                updated_at = NOW()
            WHERE id = NEW.campaign_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_campaign_metrics_trigger ON ad_impressions;
CREATE TRIGGER update_campaign_metrics_trigger
    AFTER INSERT ON ad_impressions
    FOR EACH ROW EXECUTE FUNCTION update_campaign_metrics();

-- Tabela de Moderação (Reports, Flags, etc.)
CREATE TABLE IF NOT EXISTS moderation_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Tipo de ação
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN (
        'user_ban', 'user_unban', 'post_delete', 'post_hide', 
        'comment_delete', 'service_remove', 'verification_approve', 
        'verification_reject', 'content_warning'
    )),
    
    -- Referência
    target_type VARCHAR(50) NOT NULL, -- 'user', 'post', 'comment', 'service'
    target_id UUID NOT NULL,
    
    -- Quem executou
    moderator_id UUID NOT NULL REFERENCES profiles(id),
    
    -- Motivo
    reason TEXT,
    severity VARCHAR(20) DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'reversed', 'expired')),
    
    -- Reversão
    reversed_by UUID REFERENCES profiles(id),
    reversed_at TIMESTAMPTZ,
    reversal_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_moderation_actions_target') THEN
        CREATE INDEX idx_moderation_actions_target ON moderation_actions(target_type, target_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_moderation_actions_moderator') THEN
        CREATE INDEX idx_moderation_actions_moderator ON moderation_actions(moderator_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_moderation_actions_created') THEN
        CREATE INDEX idx_moderation_actions_created ON moderation_actions(created_at DESC);
    END IF;
END $$;

-- Tabela de Reports (Denúncias de usuários)
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Quem reportou
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- O que foi reportado
    target_type VARCHAR(50) NOT NULL, -- 'user', 'post', 'comment', 'service', 'group'
    target_id UUID NOT NULL,
    
    -- Motivo
    reason VARCHAR(100) NOT NULL, -- 'spam', 'harassment', 'scam', 'inappropriate', 'other'
    description TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
    
    -- Resolução
    resolved_by UUID REFERENCES profiles(id),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reports_target') THEN
        CREATE INDEX idx_reports_target ON reports(target_type, target_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reports_status') THEN
        CREATE INDEX idx_reports_status ON reports(status);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reports_created') THEN
        CREATE INDEX idx_reports_created ON reports(created_at DESC);
    END IF;
END $$;

-- Adicionar campos faltantes na tabela profiles (se não existirem)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'banned_at') THEN
        ALTER TABLE profiles ADD COLUMN banned_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'last_active_at') THEN
        ALTER TABLE profiles ADD COLUMN last_active_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- RLS para tabelas de admin
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (admin pode ver tudo)
DROP POLICY IF EXISTS "Admins can view all campaigns" ON ad_campaigns;
CREATE POLICY "Admins can view all campaigns" ON ad_campaigns
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

DROP POLICY IF EXISTS "Admins can manage campaigns" ON ad_campaigns;
CREATE POLICY "Admins can manage campaigns" ON ad_campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Creators can view own payouts" ON creator_payouts;
CREATE POLICY "Creators can view own payouts" ON creator_payouts
    FOR SELECT USING (creator_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all payouts" ON creator_payouts;
CREATE POLICY "Admins can view all payouts" ON creator_payouts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

DROP POLICY IF EXISTS "Admins can manage payouts" ON creator_payouts;
CREATE POLICY "Admins can manage payouts" ON creator_payouts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Users can create reports" ON reports;
CREATE POLICY "Users can create reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Admins can view all reports" ON reports;
CREATE POLICY "Admins can view all reports" ON reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

DROP POLICY IF EXISTS "Admins can resolve reports" ON reports;
CREATE POLICY "Admins can resolve reports" ON reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );
