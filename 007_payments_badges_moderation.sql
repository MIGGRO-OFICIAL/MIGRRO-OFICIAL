-- ============================================================================
-- MIGGRO - Sistema de Pagamentos, Badges e Moderação (VERSÃO IDEMPOTENTE)
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard/project/gjphsheavnkdtmsrxmtl/sql/new
-- 2. Cole TODO este conteúdo no SQL Editor
-- 3. Clique em "Run" para executar
-- 
-- ESTE SCRIPT PODE SER EXECUTADO MÚLTIPLAS VEZES SEM ERRO
-- ============================================================================
-- 
-- NOTA: As tabelas transactions e wallets podem já existir do schema inicial.
-- Este script verifica e adiciona apenas campos faltantes.
-- ============================================================================

-- Verificar e adicionar campos faltantes em transactions (se já existir)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN
        -- Adicionar campos que podem estar faltando
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'transactions' AND column_name = 'service_id') THEN
            ALTER TABLE transactions ADD COLUMN service_id UUID REFERENCES service_listings(id);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'transactions' AND column_name = 'proposal_id') THEN
            ALTER TABLE transactions ADD COLUMN proposal_id UUID REFERENCES service_proposals(id);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'transactions' AND column_name = 'request_id') THEN
            ALTER TABLE transactions ADD COLUMN request_id UUID REFERENCES service_requests(id);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'transactions' AND column_name = 'payment_method') THEN
            ALTER TABLE transactions ADD COLUMN payment_method VARCHAR(50);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'transactions' AND column_name = 'payment_reference') THEN
            ALTER TABLE transactions ADD COLUMN payment_reference TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'transactions' AND column_name = 'completed_at') THEN
            ALTER TABLE transactions ADD COLUMN completed_at TIMESTAMPTZ;
        END IF;
    END IF;
END $$;

-- Verificar e adicionar campos faltantes em wallets (se já existir)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wallets') THEN
        -- Verificar se tem pending_balance ou pending_payout
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'wallets' AND column_name = 'pending_balance') 
           AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'wallets' AND column_name = 'pending_payout') THEN
            ALTER TABLE wallets ADD COLUMN pending_balance DECIMAL(10, 2) DEFAULT 0 CHECK (pending_balance >= 0);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'wallets' AND column_name = 'payout_enabled') THEN
            ALTER TABLE wallets ADD COLUMN payout_enabled BOOLEAN DEFAULT false;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'wallets' AND column_name = 'payout_method') THEN
            ALTER TABLE wallets ADD COLUMN payout_method VARCHAR(50);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'wallets' AND column_name = 'payout_account') THEN
            ALTER TABLE wallets ADD COLUMN payout_account TEXT;
        END IF;
    END IF;
END $$;

-- Criar índices adicionais em transactions se não existirem
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_transactions_service') THEN
            CREATE INDEX idx_transactions_service ON transactions(service_id);
        END IF;
    END IF;
END $$;

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wallets_updated_at ON wallets;
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para criar wallet automaticamente
CREATE OR REPLACE FUNCTION create_wallet_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO wallets (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar wallet ao criar perfil
DROP TRIGGER IF EXISTS trigger_create_wallet ON profiles;
CREATE TRIGGER trigger_create_wallet
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_wallet_for_user();

-- Função para atualizar saldo da wallet
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
DECLARE
    v_pending_col VARCHAR;
BEGIN
    -- Verificar qual coluna existe: pending_balance ou pending_payout
    SELECT column_name INTO v_pending_col
    FROM information_schema.columns
    WHERE table_name = 'wallets' 
    AND column_name IN ('pending_balance', 'pending_payout')
    LIMIT 1;
    
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        IF NEW.type IN ('earned', 'payment') THEN
            -- Adicionar ao saldo
            UPDATE wallets
            SET balance = balance + NEW.amount,
                total_earnings = total_earnings + NEW.amount,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        ELSIF NEW.type = 'payout' THEN
            -- Subtrair do saldo
            UPDATE wallets
            SET balance = balance - NEW.amount,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar wallet quando transação é completada
DROP TRIGGER IF EXISTS trigger_update_wallet_balance ON transactions;
CREATE TRIGGER trigger_update_wallet_balance
    AFTER UPDATE ON transactions
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION update_wallet_balance();

-- RLS Policies (se ainda não existirem)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN
        ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
        CREATE POLICY "Users can view own transactions" ON transactions
            FOR SELECT USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can create own transactions" ON transactions;
        CREATE POLICY "Users can create own transactions" ON transactions
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wallets') THEN
        ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own wallet" ON wallets;
        CREATE POLICY "Users can view own wallet" ON wallets
            FOR SELECT USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can update own wallet" ON wallets;
        CREATE POLICY "Users can update own wallet" ON wallets
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

COMMENT ON FUNCTION create_wallet_for_user IS 'Cria wallet automaticamente ao criar perfil';
COMMENT ON FUNCTION update_wallet_balance IS 'Atualiza saldo da wallet quando transação é completada';
