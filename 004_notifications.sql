-- ============================================================================
-- MIGGRO - Sistema de Notificações (VERSÃO IDEMPOTENTE)
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard/project/gjphsheavnkdtmsrxmtl/sql/new
-- 2. Cole TODO este conteúdo no SQL Editor
-- 3. Clique em "Run" para executar
-- 
-- ESTE SCRIPT PODE SER EXECUTADO MÚLTIPLAS VEZES SEM ERRO
-- ============================================================================

-- Verificar se a tabela notifications já existe (pode ter sido criada no schema inicial)
DO $$ 
BEGIN
    -- Se a tabela não existir, criar
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        CREATE TABLE notifications (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            
            -- Tipo de notificação
            type VARCHAR(50) NOT NULL CHECK (type IN (
                'new_message',
                'new_proposal',
                'proposal_accepted',
                'proposal_rejected',
                'new_comment',
                'new_like',
                'new_follower',
                'service_viewed',
                'review_received',
                'admin_action'
            )),
            
            -- Dados da notificação
            title VARCHAR(200) NOT NULL,
            message TEXT,
            body TEXT, -- Alguns schemas usam 'body' em vez de 'message'
            action_url TEXT, -- URL para onde a notificação leva
            
            -- Referências (opcionais)
            reference_id UUID, -- ID do post, serviço, proposta, etc.
            reference_type VARCHAR(50), -- 'post', 'service', 'proposal', etc.
            
            -- Status
            is_read BOOLEAN DEFAULT FALSE,
            read_at TIMESTAMPTZ,
            
            -- Metadata
            metadata JSONB, -- Dados adicionais
            
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    ELSE
        -- Se já existe, adicionar colunas que podem estar faltando
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'notifications' AND column_name = 'message') THEN
            ALTER TABLE notifications ADD COLUMN message TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'notifications' AND column_name = 'body') THEN
            ALTER TABLE notifications ADD COLUMN body TEXT;
        END IF;
    END IF;
END $$;

-- Índices
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_user') THEN
        CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_read') THEN
        CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_created') THEN
        CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_type') THEN
        CREATE INDEX idx_notifications_type ON notifications(type);
    END IF;
END $$;

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver apenas suas próprias notificações
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Política: sistema pode criar notificações (via service role)
DROP POLICY IF EXISTS "Service can create notifications" ON notifications;
CREATE POLICY "Service can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- Política: usuários podem atualizar suas próprias notificações (marcar como lida)
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Função para criar notificação
-- Remover TODAS as versões existentes primeiro (usando CASCADE para remover dependências)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Buscar todas as funções create_notification e removê-las
    FOR r IN 
        SELECT proname, oidvectortypes(proargtypes) as argtypes
        FROM pg_proc 
        WHERE proname = 'create_notification'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS create_notification(' || r.argtypes || ') CASCADE';
    END LOOP;
END $$;

-- Criar função com assinatura completa
CREATE FUNCTION create_notification(
    p_user_id UUID,
    p_type VARCHAR,
    p_title VARCHAR,
    p_message TEXT DEFAULT NULL,
    p_body TEXT DEFAULT NULL,
    p_action_url TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_reference_type VARCHAR DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
    v_message_text TEXT;
BEGIN
    -- Usar message ou body, dependendo do que está disponível
    v_message_text := COALESCE(p_message, p_body);
    
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        body,
        action_url,
        reference_id,
        reference_type,
        metadata
    ) VALUES (
        p_user_id,
        p_type,
        p_title,
        v_message_text,
        v_message_text,
        p_action_url,
        p_reference_id,
        p_reference_type,
        p_metadata
    ) RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para notificar quando proposta é aceita
CREATE OR REPLACE FUNCTION notify_proposal_accepted()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        -- Notificar o prestador
        PERFORM create_notification(
            NEW.provider_id,
            'proposal_accepted',
            'Proposta Aceita!',
            'Sua proposta foi aceita pelo cliente.',
            NULL,
            '/services/requests/' || NEW.request_id,
            NEW.id,
            'proposal'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_proposal_accepted ON service_proposals;
CREATE TRIGGER trigger_notify_proposal_accepted
    AFTER UPDATE ON service_proposals
    FOR EACH ROW
    EXECUTE FUNCTION notify_proposal_accepted();

-- Trigger para notificar quando nova proposta é criada
CREATE OR REPLACE FUNCTION notify_new_proposal()
RETURNS TRIGGER AS $$
DECLARE
    v_request_title TEXT;
BEGIN
    -- Buscar título do pedido
    SELECT title INTO v_request_title
    FROM service_requests
    WHERE id = NEW.request_id;
    
    -- Notificar o autor do pedido
    PERFORM create_notification(
        (SELECT author_id FROM service_requests WHERE id = NEW.request_id),
        'new_proposal',
        'Nova Proposta Recebida',
        'Você recebeu uma nova proposta para: ' || COALESCE(v_request_title, 'seu pedido'),
        NULL,
        '/services/requests/' || NEW.request_id,
        NEW.id,
        'proposal'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_new_proposal ON service_proposals;
CREATE TRIGGER trigger_notify_new_proposal
    AFTER INSERT ON service_proposals
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_proposal();

COMMENT ON TABLE notifications IS 'Sistema de notificações para usuários';
COMMENT ON FUNCTION create_notification IS 'Função helper para criar notificações';
