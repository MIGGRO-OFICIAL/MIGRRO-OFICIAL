<<<<<<< HEAD
// Serviço de Pagamentos e Carteira
import { supabase } from '../supabase';

export interface Transaction {
  id: string;
  user_id: string;
  type: 'payment' | 'payout' | 'refund' | 'commission' | 'bonus';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  service_id?: string;
  proposal_id?: string;
  request_id?: string;
  payment_method?: string;
  payment_reference?: string;
  description?: string;
  metadata?: any;
  created_at: string;
  completed_at?: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  pending_balance: number;
  total_earnings: number;
  currency: string;
  payout_enabled: boolean;
  payout_method?: string;
  payout_account?: string;
  created_at: string;
  updated_at: string;
}

export const paymentsService = {
  /**
   * Obter carteira do usuário
   */
  async getWallet(userId: string): Promise<{ data: Wallet | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Se não existe, criar
      if (error && error.code === 'PGRST116') {
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({ user_id: userId })
          .select()
          .single();

        return { data: newWallet, error: createError };
      }

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Listar transações do usuário
   */
  async listTransactions(
    userId: string,
    options?: {
      type?: Transaction['type'];
      status?: Transaction['status'];
      limit?: number;
      offset?: number;
    }
  ): Promise<{ data: Transaction[] | null; error: any }> {
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options?.type) {
        query = query.eq('type', options.type);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Criar transação
   */
  async createTransaction(
    userId: string,
    transaction: {
      type: Transaction['type'];
      amount: number;
      currency?: string;
      service_id?: string;
      proposal_id?: string;
      request_id?: string;
      payment_method?: string;
      description?: string;
      metadata?: any;
    }
  ): Promise<{ data: Transaction | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: transaction.type,
          amount: transaction.amount,
          currency: transaction.currency || 'EUR',
          service_id: transaction.service_id,
          proposal_id: transaction.proposal_id,
          request_id: transaction.request_id,
          payment_method: transaction.payment_method,
          description: transaction.description,
          metadata: transaction.metadata,
          status: 'pending',
        })
        .select()
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Processar pagamento (simulado - integrar com gateway real depois)
   */
  async processPayment(
    transactionId: string,
    paymentData: {
      payment_method: string;
      payment_reference: string;
    }
  ): Promise<{ data: Transaction | null; error: any }> {
    try {
      // Atualizar transação com dados do pagamento
      const { data, error } = await supabase
        .from('transactions')
        .update({
          payment_method: paymentData.payment_method,
          payment_reference: paymentData.payment_reference,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', transactionId)
        .select()
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Solicitar saque
   */
  async requestPayout(
    userId: string,
    amount: number,
    payoutMethod: string,
    payoutAccount: string
  ): Promise<{ data: Transaction | null; error: any }> {
    try {
      // Verificar saldo
      const { data: wallet, error: walletError } = await this.getWallet(userId);
      if (walletError || !wallet) {
        return { data: null, error: { message: 'Wallet not found' } };
      }

      if (wallet.balance < amount) {
        return { data: null, error: { message: 'Insufficient balance' } };
      }

      // Criar transação de saque
      const { data, error } = await this.createTransaction(userId, {
        type: 'payout',
        amount: amount,
        payment_method: payoutMethod,
        description: `Saque para ${payoutMethod}`,
        metadata: { payout_account: payoutAccount },
      });

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },
};
=======
// Serviço de Pagamentos e Carteira
import { supabase } from '../supabase';

export interface Transaction {
  id: string;
  user_id: string;
  type: 'payment' | 'payout' | 'refund' | 'commission' | 'bonus';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  service_id?: string;
  proposal_id?: string;
  request_id?: string;
  payment_method?: string;
  payment_reference?: string;
  description?: string;
  metadata?: any;
  created_at: string;
  completed_at?: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  pending_balance: number;
  total_earnings: number;
  currency: string;
  payout_enabled: boolean;
  payout_method?: string;
  payout_account?: string;
  created_at: string;
  updated_at: string;
}

export const paymentsService = {
  /**
   * Obter carteira do usuário
   */
  async getWallet(userId: string): Promise<{ data: Wallet | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Se não existe, criar
      if (error && error.code === 'PGRST116') {
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({ user_id: userId })
          .select()
          .single();

        return { data: newWallet, error: createError };
      }

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Listar transações do usuário
   */
  async listTransactions(
    userId: string,
    options?: {
      type?: Transaction['type'];
      status?: Transaction['status'];
      limit?: number;
      offset?: number;
    }
  ): Promise<{ data: Transaction[] | null; error: any }> {
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options?.type) {
        query = query.eq('type', options.type);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Criar transação
   */
  async createTransaction(
    userId: string,
    transaction: {
      type: Transaction['type'];
      amount: number;
      currency?: string;
      service_id?: string;
      proposal_id?: string;
      request_id?: string;
      payment_method?: string;
      description?: string;
      metadata?: any;
    }
  ): Promise<{ data: Transaction | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: transaction.type,
          amount: transaction.amount,
          currency: transaction.currency || 'EUR',
          service_id: transaction.service_id,
          proposal_id: transaction.proposal_id,
          request_id: transaction.request_id,
          payment_method: transaction.payment_method,
          description: transaction.description,
          metadata: transaction.metadata,
          status: 'pending',
        })
        .select()
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Processar pagamento (simulado - integrar com gateway real depois)
   */
  async processPayment(
    transactionId: string,
    paymentData: {
      payment_method: string;
      payment_reference: string;
    }
  ): Promise<{ data: Transaction | null; error: any }> {
    try {
      // Atualizar transação com dados do pagamento
      const { data, error } = await supabase
        .from('transactions')
        .update({
          payment_method: paymentData.payment_method,
          payment_reference: paymentData.payment_reference,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', transactionId)
        .select()
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Solicitar saque
   */
  async requestPayout(
    userId: string,
    amount: number,
    payoutMethod: string,
    payoutAccount: string
  ): Promise<{ data: Transaction | null; error: any }> {
    try {
      // Verificar saldo
      const { data: wallet, error: walletError } = await this.getWallet(userId);
      if (walletError || !wallet) {
        return { data: null, error: { message: 'Wallet not found' } };
      }

      if (wallet.balance < amount) {
        return { data: null, error: { message: 'Insufficient balance' } };
      }

      // Criar transação de saque
      const { data, error } = await this.createTransaction(userId, {
        type: 'payout',
        amount: amount,
        payment_method: payoutMethod,
        description: `Saque para ${payoutMethod}`,
        metadata: { payout_account: payoutAccount },
      });

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },
};
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
