-- ============================================================================
-- MIGGRO - Schema Inicial do Banco de Dados (VERSÃO IDEMPOTENTE)
-- Estrutura moderna para Rede Social + Marketplace Multi-país
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard/project/gjphsheavnkdtmsrxmtl/sql/new
-- 2. Cole TODO este conteúdo no SQL Editor
-- 3. Clique em "Run" para executar
-- 
-- ESTE SCRIPT PODE SER EXECUTADO MÚLTIPLAS VEZES SEM ERRO
-- ============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca full-text
CREATE EXTENSION IF NOT EXISTS "postgis"; -- Para geolocalização (opcional, mas recomendado)

-- ============================================================================
-- 1. TABELAS DE CONFIGURAÇÃO E REFERÊNCIA
-- ============================================================================

-- Países e Localizações
CREATE TABLE IF NOT EXISTS countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(2) UNIQUE NOT NULL, -- ISO 3166-1 alpha-2 (BR, ES, PT, etc)
    name VARCHAR(100) NOT NULL,
    name_pt VARCHAR(100),
    flag_emoji VARCHAR(10),
    currency_code VARCHAR(3), -- EUR, BRL, USD
    currency_symbol VARCHAR(10), -- €, R$, $
    timezone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices apenas se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_countries_code') THEN
        CREATE INDEX idx_countries_code ON countries(code);
    END IF;
END $$;

-- Cidades
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    name_pt VARCHAR(100),
    state_province VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    population INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(country_id, name, state_province)
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_cities_country') THEN
        CREATE INDEX idx_cities_country ON cities(country_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_cities_name') THEN
        CREATE INDEX idx_cities_name ON cities USING gin(name gin_trgm_ops);
    END IF;
END $$;

-- Categorias de Serviços
CREATE TABLE IF NOT EXISTS service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    name_pt VARCHAR(50),
    name_en VARCHAR(50),
    name_es VARCHAR(50),
    icon VARCHAR(50), -- Nome do ícone (lucide-react)
    color VARCHAR(20), -- Cor do tema
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. TABELAS DE USUÁRIOS E AUTENTICAÇÃO
-- ============================================================================

-- Perfis de Usuário (estende auth.users do Supabase)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    location VARCHAR(100), -- Cidade, País
    city_id UUID REFERENCES cities(id),
    country_id UUID REFERENCES countries(id),
    phone VARCHAR(20),
    phone_verified BOOLEAN DEFAULT FALSE,
    
    -- Roles
    role VARCHAR(20) DEFAULT 'imigrant' CHECK (role IN ('imigrant', 'helper', 'admin', 'moderator')),
    
    -- Gamificação
    raiz_coins INTEGER DEFAULT 0 CHECK (raiz_coins >= 0),
    total_coins_earned INTEGER DEFAULT 0,
    total_coins_spent INTEGER DEFAULT 0,
    
    -- Trust & Safety
    trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
    verification_status VARCHAR(20) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
    
    -- Social
    subscriber_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    
    -- Premium
    is_premium BOOLEAN DEFAULT FALSE,
    premium_until TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    
    -- Metadata
    last_seen_at TIMESTAMPTZ,
    join_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_username') THEN
        CREATE INDEX idx_profiles_username ON profiles(username);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_email') THEN
        CREATE INDEX idx_profiles_email ON profiles(email);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_country') THEN
        CREATE INDEX idx_profiles_country ON profiles(country_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_role') THEN
        CREATE INDEX idx_profiles_role ON profiles(role);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_trust_score') THEN
        CREATE INDEX idx_profiles_trust_score ON profiles(trust_score DESC);
    END IF;
END $$;

-- Badges/Conquistas
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    name_pt VARCHAR(50),
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges dos Usuários
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_badges_user') THEN
        CREATE INDEX idx_user_badges_user ON user_badges(user_id);
    END IF;
END $$;

-- Passos de Verificação
CREATE TABLE IF NOT EXISTS verification_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    step_type VARCHAR(20) NOT NULL CHECK (step_type IN ('email', 'phone', 'document', 'face', 'address')),
    status VARCHAR(20) DEFAULT 'unsubmitted' CHECK (status IN ('unsubmitted', 'pending', 'verified', 'rejected')),
    points INTEGER DEFAULT 0,
    verified_at TIMESTAMPTZ,
    rejected_reason TEXT,
    metadata JSONB, -- Dados adicionais do processo
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, step_type)
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_verification_steps_user') THEN
        CREATE INDEX idx_verification_steps_user ON verification_steps(user_id);
    END IF;
END $$;

-- ============================================================================
-- 3. REDE SOCIAL - POSTS E INTERAÇÕES
-- ============================================================================

-- Posts
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    post_type VARCHAR(20) DEFAULT 'general' CHECK (post_type IN ('general', 'help_request', 'event', 'service_promo')),
    
    -- Mídia
    image_urls TEXT[], -- Array de URLs de imagens
    video_url TEXT, -- URL do YouTube/Vimeo
    video_thumbnail TEXT,
    
    -- Localização
    location VARCHAR(100),
    city_id UUID REFERENCES cities(id),
    country_id UUID REFERENCES countries(id),
    
    -- Tags
    tags TEXT[],
    
    -- Engajamento
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    
    -- Status
    is_pinned BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    -- Moderação
    moderation_status VARCHAR(20) DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_author') THEN
        CREATE INDEX idx_posts_author ON posts(author_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_country') THEN
        CREATE INDEX idx_posts_country ON posts(country_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_type') THEN
        CREATE INDEX idx_posts_type ON posts(post_type);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_created') THEN
        CREATE INDEX idx_posts_created ON posts(created_at DESC);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_tags') THEN
        CREATE INDEX idx_posts_tags ON posts USING gin(tags);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_content_search') THEN
        CREATE INDEX idx_posts_content_search ON posts USING gin(to_tsvector('portuguese', content));
    END IF;
END $$;

-- Likes em Posts
CREATE TABLE IF NOT EXISTS post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_post_likes_post') THEN
        CREATE INDEX idx_post_likes_post ON post_likes(post_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_post_likes_user') THEN
        CREATE INDEX idx_post_likes_user ON post_likes(user_id);
    END IF;
END $$;

-- Comentários
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- Para respostas
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comments_post') THEN
        CREATE INDEX idx_comments_post ON comments(post_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comments_author') THEN
        CREATE INDEX idx_comments_author ON comments(author_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comments_parent') THEN
        CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
    END IF;
END $$;

-- Likes em Comentários
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- Seguidores/Seguindo
CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_follows_follower') THEN
        CREATE INDEX idx_follows_follower ON follows(follower_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_follows_following') THEN
        CREATE INDEX idx_follows_following ON follows(following_id);
    END IF;
END $$;

-- ============================================================================
-- 4. GRUPOS E COMUNIDADES
-- ============================================================================

-- Grupos
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT,
    cover_image_url TEXT,
    
    -- Localização
    country_id UUID REFERENCES countries(id),
    city_id UUID REFERENCES cities(id),
    
    -- Configurações
    is_private BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Estatísticas
    members_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    safety_rating DECIMAL(3, 2) DEFAULT 0 CHECK (safety_rating >= 0 AND safety_rating <= 5),
    reviews_count INTEGER DEFAULT 0,
    
    -- Moderação
    created_by UUID NOT NULL REFERENCES profiles(id),
    moderators UUID[], -- Array de user IDs
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_groups_country') THEN
        CREATE INDEX idx_groups_country ON groups(country_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_groups_name_search') THEN
        CREATE INDEX idx_groups_name_search ON groups USING gin(to_tsvector('portuguese', name));
    END IF;
END $$;

-- Membros de Grupos
CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_group_members_group') THEN
        CREATE INDEX idx_group_members_group ON group_members(group_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_group_members_user') THEN
        CREATE INDEX idx_group_members_user ON group_members(user_id);
    END IF;
END $$;

-- ============================================================================
-- 5. MARKETPLACE - SERVIÇOS E PROPOSTAS
-- ============================================================================

-- Listagens de Serviços
CREATE TABLE IF NOT EXISTS service_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES service_categories(id),
    
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    
    -- Preço
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    currency VARCHAR(3) DEFAULT 'EUR' CHECK (currency IN ('EUR', 'BRL', 'USD', 'RAIZ')),
    accepts_raiz_coins BOOLEAN DEFAULT FALSE,
    
    -- Localização
    country_id UUID REFERENCES countries(id),
    city_id UUID REFERENCES cities(id),
    service_area VARCHAR(100), -- "Toda Madrid", "Centro", etc
    
    -- Avaliações
    rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    reviews_count INTEGER DEFAULT 0,
    
    -- Status
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Imagens
    image_urls TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_service_listings_provider') THEN
        CREATE INDEX idx_service_listings_provider ON service_listings(provider_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_service_listings_category') THEN
        CREATE INDEX idx_service_listings_category ON service_listings(category_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_service_listings_country') THEN
        CREATE INDEX idx_service_listings_country ON service_listings(country_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_service_listings_active') THEN
        CREATE INDEX idx_service_listings_active ON service_listings(is_active, created_at DESC);
    END IF;
END $$;

-- Pedidos de Serviço (Marketplace Reverso)
CREATE TABLE IF NOT EXISTS service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES service_categories(id),
    
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    
    -- Orçamento
    budget_min DECIMAL(10, 2),
    budget_max DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'EUR',
    accepts_raiz_coins BOOLEAN DEFAULT FALSE,
    
    -- Urgência
    urgency VARCHAR(20) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
    
    -- Localização
    country_id UUID REFERENCES countries(id),
    city_id UUID REFERENCES cities(id),
    
    -- Status
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed', 'completed', 'cancelled')),
    
    -- Imagens
    image_urls TEXT[],
    
    -- Estatísticas
    proposals_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_service_requests_author') THEN
        CREATE INDEX idx_service_requests_author ON service_requests(author_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_service_requests_status') THEN
        CREATE INDEX idx_service_requests_status ON service_requests(status, created_at DESC);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_service_requests_country') THEN
        CREATE INDEX idx_service_requests_country ON service_requests(country_id);
    END IF;
END $$;

-- Propostas para Pedidos
CREATE TABLE IF NOT EXISTS service_proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    description TEXT NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    
    -- Desbloqueio (estilo Airbnb)
    is_unlocked BOOLEAN DEFAULT FALSE, -- Premium users não precisam desbloquear
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_service_proposals_request') THEN
        CREATE INDEX idx_service_proposals_request ON service_proposals(request_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_service_proposals_provider') THEN
        CREATE INDEX idx_service_proposals_provider ON service_proposals(provider_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_service_proposals_status') THEN
        CREATE INDEX idx_service_proposals_status ON service_proposals(status);
    END IF;
END $$;

-- ============================================================================
-- 6. AVALIAÇÕES E REVIEWS
-- ============================================================================

-- Reviews de Serviços
CREATE TABLE IF NOT EXISTS service_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_listing_id UUID REFERENCES service_listings(id) ON DELETE CASCADE,
    service_request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- Quem está sendo avaliado
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    
    -- Contexto
    context VARCHAR(20) CHECK (context IN ('service_listing', 'service_request', 'group', 'general')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_service_reviews_reviewee') THEN
        CREATE INDEX idx_service_reviews_reviewee ON service_reviews(reviewee_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_service_reviews_listing') THEN
        CREATE INDEX idx_service_reviews_listing ON service_reviews(service_listing_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_service_reviews_request') THEN
        CREATE INDEX idx_service_reviews_request ON service_reviews(service_request_id);
    END IF;
END $$;

-- ============================================================================
-- 7. CHAT E MENSAGENS
-- ============================================================================

-- Conversas
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    participant_2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    last_message_text TEXT,
    last_message_at TIMESTAMPTZ,
    
    -- Status de leitura
    participant_1_unread_count INTEGER DEFAULT 0,
    participant_2_unread_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(participant_1_id, participant_2_id),
    CHECK (participant_1_id != participant_2_id)
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_conversations_p1') THEN
        CREATE INDEX idx_conversations_p1 ON conversations(participant_1_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_conversations_p2') THEN
        CREATE INDEX idx_conversations_p2 ON conversations(participant_2_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_conversations_last_message') THEN
        CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC NULLS LAST);
    END IF;
END $$;

-- Mensagens
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    text TEXT NOT NULL,
    
    -- Mídia
    image_url TEXT,
    file_url TEXT,
    file_name VARCHAR(255),
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_conversation') THEN
        CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_sender') THEN
        CREATE INDEX idx_messages_sender ON messages(sender_id);
    END IF;
END $$;

-- ============================================================================
-- 8. GAMIFICAÇÃO E FINANCEIRO
-- ============================================================================

-- Carteira Digital
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    
    balance DECIMAL(10, 2) DEFAULT 0 CHECK (balance >= 0), -- Saldo disponível
    pending_payout DECIMAL(10, 2) DEFAULT 0 CHECK (pending_payout >= 0), -- Aguardando saque
    total_earnings DECIMAL(10, 2) DEFAULT 0 CHECK (total_earnings >= 0), -- Total ganho
    
    currency VARCHAR(3) DEFAULT 'EUR',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_wallets_user') THEN
        CREATE INDEX idx_wallets_user ON wallets(user_id);
    END IF;
END $$;

-- Transações
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
    
    type VARCHAR(20) NOT NULL CHECK (type IN ('earned', 'spent', 'payout', 'refund', 'transfer')),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    
    -- Contexto
    context VARCHAR(50), -- 'service_payment', 'raiz_coins_purchase', etc
    reference_id UUID, -- ID da referência (service_listing_id, etc)
    reference_type VARCHAR(50), -- Tipo da referência
    
    description TEXT,
    
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_transactions_user') THEN
        CREATE INDEX idx_transactions_user ON transactions(user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_transactions_type') THEN
        CREATE INDEX idx_transactions_type ON transactions(type);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_transactions_created') THEN
        CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
    END IF;
END $$;

-- ============================================================================
-- 9. NOTIFICAÇÕES
-- ============================================================================

-- Notificações
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    type VARCHAR(50) NOT NULL, -- 'new_message', 'new_follower', 'post_like', etc
    title VARCHAR(200) NOT NULL,
    body TEXT,
    
    -- Referência
    reference_id UUID,
    reference_type VARCHAR(50),
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    -- Ação
    action_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_user') THEN
        CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_unread') THEN
        CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
    END IF;
END $$;

-- ============================================================================
-- 10. FUNÇÕES E TRIGGERS
-- ============================================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em tabelas com updated_at (DROP IF EXISTS antes de criar)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_listings_updated_at ON service_listings;
CREATE TRIGGER update_service_listings_updated_at BEFORE UPDATE ON service_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar contadores de likes
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_post_likes_count_trigger ON post_likes;
CREATE TRIGGER update_post_likes_count_trigger
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Função para atualizar contadores de comentários
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_post_comments_count_trigger ON comments;
CREATE TRIGGER update_post_comments_count_trigger
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Função para atualizar contadores de seguidores
CREATE OR REPLACE FUNCTION update_followers_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
        UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE profiles SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
        UPDATE profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_followers_count_trigger ON follows;
CREATE TRIGGER update_followers_count_trigger
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW EXECUTE FUNCTION update_followers_count();

-- ============================================================================
-- 11. DADOS INICIAIS (SEEDS)
-- ============================================================================

-- Inserir países principais
INSERT INTO countries (code, name, name_pt, flag_emoji, currency_code, currency_symbol, timezone) VALUES
('BR', 'Brazil', 'Brasil', '🇧🇷', 'BRL', 'R$', 'America/Sao_Paulo'),
('ES', 'Spain', 'Espanha', '🇪🇸', 'EUR', '€', 'Europe/Madrid'),
('PT', 'Portugal', 'Portugal', '🇵🇹', 'EUR', '€', 'Europe/Lisbon'),
('US', 'United States', 'Estados Unidos', '🇺🇸', 'USD', '$', 'America/New_York'),
('FR', 'France', 'França', '🇫🇷', 'EUR', '€', 'Europe/Paris'),
('IT', 'Italy', 'Itália', '🇮🇹', 'EUR', '€', 'Europe/Rome'),
('DE', 'Germany', 'Alemanha', '🇩🇪', 'EUR', '€', 'Europe/Berlin'),
('GB', 'United Kingdom', 'Reino Unido', '🇬🇧', 'GBP', '£', 'Europe/London')
ON CONFLICT (code) DO NOTHING;

-- Inserir categorias de serviços
INSERT INTO service_categories (name, name_pt, name_en, name_es, icon, color, sort_order) VALUES
('Housing', 'Moradia', 'Housing', 'Vivienda', 'Home', 'blue', 1),
('Bureaucracy', 'Burocracia', 'Bureaucracy', 'Burocracia', 'FileText', 'purple', 2),
('Language', 'Idioma', 'Language', 'Idioma', 'Languages', 'green', 3),
('Social', 'Social', 'Social', 'Social', 'Users', 'orange', 4),
('Jobs', 'Empregos', 'Jobs', 'Trabajos', 'Briefcase', 'red', 5),
('Legal', 'Jurídico', 'Legal', 'Legal', 'Scale', 'indigo', 6),
('Health', 'Saúde', 'Health', 'Salud', 'Heart', 'pink', 7),
('Education', 'Educação', 'Education', 'Educación', 'GraduationCap', 'yellow', 8)
ON CONFLICT DO NOTHING;

-- Inserir badges iniciais
INSERT INTO badges (name, name_pt, description, icon, color, rarity) VALUES
('Recém-chegada', 'Recém-chegada', 'Novo membro da comunidade', 'Sparkles', 'blue', 'common'),
('Verificado', 'Verificado', 'Perfil verificado', 'ShieldCheck', 'green', 'rare'),
('Top Helper', 'Top Helper', 'Ajudou mais de 50 pessoas', 'Award', 'gold', 'epic'),
('Especialista', 'Especialista', 'Especialista em sua área', 'Star', 'purple', 'rare'),
('Fundador', 'Fundador', 'Membro desde o início', 'Crown', 'orange', 'legendary')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 12. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (DROP IF EXISTS antes de criar)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
CREATE POLICY "Posts are viewable by everyone" ON posts
    FOR SELECT USING (is_deleted = FALSE);

DROP POLICY IF EXISTS "Users can create posts" ON posts;
CREATE POLICY "Users can create posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts" ON posts
    FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can view own conversations" ON messages;
CREATE POLICY "Users can view own conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE id = messages.conversation_id
            AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can send messages in own conversations" ON messages;
CREATE POLICY "Users can send messages in own conversations" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE id = messages.conversation_id
            AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
        )
        AND sender_id = auth.uid()
    );

DROP POLICY IF EXISTS "Users can view own wallet" ON wallets;
CREATE POLICY "Users can view own wallet" ON wallets
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================
