-- Migration: Sistema de Notificações
-- Data: 2025-11-29

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notifications (
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
    message TEXT NOT NULL,
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

-- Índices
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

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
-- Remover todas as versões existentes primeiro (pode haver múltiplas assinaturas)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT oid::regprocedure as func_name
        FROM pg_proc
        WHERE proname = 'create_notification'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_name || ' CASCADE';
    END LOOP;
END $$;

CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type VARCHAR,
    p_title VARCHAR,
    p_message TEXT,
    p_action_url TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_reference_type VARCHAR DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        action_url,
        reference_id,
        reference_type,
        metadata
    ) VALUES (
        p_user_id,
        p_type,
        p_title,
        p_message,
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
            '/services/requests/' || NEW.request_id,
            NEW.id,
            'proposal'
        );
        
        -- Notificar o cliente (opcional, já que ele aceitou)
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
<<<<<<< HEAD
=======
=======
-- Migration: Sistema de Notificações
-- Data: 2025-11-29

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notifications (
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
    message TEXT NOT NULL,
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

-- Índices
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

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
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type VARCHAR,
    p_title VARCHAR,
    p_message TEXT,
    p_action_url TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_reference_type VARCHAR DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        action_url,
        reference_id,
        reference_type,
        metadata
    ) VALUES (
        p_user_id,
        p_type,
        p_title,
        p_message,
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
            '/services/requests/' || NEW.request_id,
            NEW.id,
            'proposal'
        );
        
        -- Notificar o cliente (opcional, já que ele aceitou)
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
>>>>>>> origin/main
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
