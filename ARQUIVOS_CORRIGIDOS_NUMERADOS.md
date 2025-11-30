# 📋 Arquivos Corrigidos - Versões Numeradas

## ⚠️ IMPORTANTE
Copie e cole cada arquivo no GitHub na ordem numerada. Todos os arquivos estão **SEM CONFLITOS** e prontos para uso.

---

## 1️⃣ lib/supabase/payments.ts

```typescript
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
```

---

## 2️⃣ lib/supabase/chat.ts

```typescript
// Serviços para Chat e Mensagens
import { supabase } from '../supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export const chatService = {
  /**
   * Listar conversas do usuário
   */
  async listConversations() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_1:profiles!conversations_participant_1_id_fkey(id, name, avatar_url, username),
          participant_2:profiles!conversations_participant_2_id_fkey(id, name, avatar_url, username)
        `)
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;

      // Formatar para o formato esperado pelo frontend
      const formatted = data?.map(conv => {
        const otherParticipant = conv.participant_1_id === user.id 
          ? conv.participant_2 
          : conv.participant_1;
        
        const unreadCount = conv.participant_1_id === user.id
          ? conv.participant_1_unread_count
          : conv.participant_2_unread_count;

        return {
          id: conv.id,
          participantId: otherParticipant.id,
          participantName: otherParticipant.name,
          participantAvatar: otherParticipant.avatar_url || '',
          lastMessage: conv.last_message_text || '',
          lastMessageTime: conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
          unreadCount: unreadCount || 0,
        };
      });

      return { data: formatted, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Obter ou criar conversa
   */
  async getOrCreateConversation(otherUserId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Tentar encontrar conversa existente
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(participant_1_id.eq.${user.id},participant_2_id.eq.${otherUserId}),and(participant_1_id.eq.${otherUserId},participant_2_id.eq.${user.id})`)
        .single();

      if (existing) {
        return { data: existing, error: null };
      }

      // Criar nova conversa
      const participant1 = user.id < otherUserId ? user.id : otherUserId;
      const participant2 = user.id < otherUserId ? otherUserId : user.id;

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participant_1_id: participant1,
          participant_2_id: participant2,
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Listar mensagens de uma conversa
   */
  async listMessages(conversationId: string, limit = 50) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se é participante
      const { data: conversation } = await supabase
        .from('conversations')
        .select('participant_1_id, participant_2_id')
        .eq('id', conversationId)
        .single();

      if (!conversation || (conversation.participant_1_id !== user.id && conversation.participant_2_id !== user.id)) {
        throw new Error('Não autorizado');
      }

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Formatar mensagens
      const formatted = data?.reverse().map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        text: msg.text,
        timestamp: new Date(msg.created_at),
        isMe: msg.sender_id === user.id,
        imageUrl: msg.image_url,
        fileUrl: msg.file_url,
        fileName: msg.file_name,
      }));

      return { data: formatted, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Enviar mensagem
   */
  async sendMessage(conversationId: string, text: string, imageUrl?: string, fileUrl?: string, fileName?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Criar mensagem
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          text,
          image_url: imageUrl,
          file_url: fileUrl,
          file_name: fileName,
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Atualizar conversa
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const { data: conversation } = await supabase
        .from('conversations')
        .select('participant_1_id, participant_2_id')
        .eq('id', conversationId)
        .single();

      if (conversation) {
        const isParticipant1 = conversation.participant_1_id === currentUser.id;
        
        await supabase
          .from('conversations')
          .update({
            last_message_text: text,
            last_message_at: new Date().toISOString(),
            ...(isParticipant1 
              ? { participant_2_unread_count: supabase.raw('participant_2_unread_count + 1') }
              : { participant_1_unread_count: supabase.raw('participant_1_unread_count + 1') }
            ),
          })
          .eq('id', conversationId);
      }

      return { data: message, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Marcar mensagens como lidas
   */
  async markAsRead(conversationId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: conversation } = await supabase
        .from('conversations')
        .select('participant_1_id, participant_2_id')
        .eq('id', conversationId)
        .single();

      if (!conversation) throw new Error('Conversa não encontrada');

      const isParticipant1 = conversation.participant_1_id === user.id;
      const updateField = isParticipant1 ? 'participant_1_unread_count' : 'participant_2_unread_count';

      await supabase
        .from('conversations')
        .update({ [updateField]: 0 })
        .eq('id', conversationId);

      // Marcar mensagens como lidas
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  /**
   * Inscrever-se em atualizações de mensagens em tempo real
   */
  subscribeToMessages(conversationId: string, callback: (message: any) => void): RealtimeChannel {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return channel;
  },

  /**
   * Inscrever-se em atualizações de conversas
   */
  subscribeToConversations(userId: string, callback: (conversation: any) => void): RealtimeChannel {
    const channel = supabase
      .channel(`conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `participant_1_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `participant_2_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return channel;
  },

  /**
   * Desinscrever-se de um canal
   */
  unsubscribe(channel: RealtimeChannel) {
    supabase.removeChannel(channel);
  },
};
```

---

## 3️⃣ lib/supabase/admin.ts

```typescript
// Serviços para Área Admin
import { supabase } from '../supabase';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number; // MAU - Monthly Active Users
  mrr: number; // Monthly Recurring Revenue
  adRevenue: number; // Receita de Ads
  creatorFund: number; // Creator Fund (50% da receita de ads)
  growthRate: number; // Taxa de crescimento (%)
  activeCampaigns: number;
}

export interface AdCampaign {
  id: string;
  sponsor_name: string;
  title: string;
  status: 'active' | 'paused' | 'pending' | 'completed';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatorPayout {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_avatar?: string;
  views: number;
  verified_helps: number;
  estimated_payout: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  paid_at?: string;
}

export const adminService = {
  /**
   * Obter estatísticas do dashboard
   */
  async getStats(): Promise<{ data: AdminStats | null; error: any }> {
    try {
      // Total de usuários
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('is_banned', false);

      if (usersError) throw usersError;

      // Usuários ativos (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeUsers, error: activeError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('is_banned', false)
        .gte('last_active_at', thirtyDaysAgo.toISOString());

      if (activeError) throw activeError;

      // MRR - Monthly Recurring Revenue (de assinaturas premium)
      const { data: premiumUsers, error: premiumError } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_premium', true)
        .gte('premium_until', new Date().toISOString());

      if (premiumError) throw premiumError;
      
      // Assumindo preço de premium de €9.99/mês
      const mrr = (premiumUsers?.length || 0) * 9.99;

      // Receita de Ads (buscar de ad_campaigns ou transactions)
      const { data: adTransactions, error: adError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'earned')
        .eq('context', 'ad_revenue')
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      if (adError) throw adError;
      
      const adRevenue = adTransactions?.reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;

      // Creator Fund (50% da receita de ads)
      const creatorFund = adRevenue * 0.5;

      // Taxa de crescimento (comparar com mês anterior)
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const { count: lastMonthUsers, error: growthError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('is_banned', false)
        .lte('created_at', lastMonth.toISOString());

      if (growthError) throw growthError;

      const growthRate = lastMonthUsers && lastMonthUsers > 0
        ? ((totalUsers - lastMonthUsers) / lastMonthUsers) * 100
        : 0;

      // Campanhas ativas
      const { count: activeCampaigns, error: campaignsError } = await supabase
        .from('ad_campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (campaignsError) {
        // Se a tabela não existir, retornar 0
        console.warn('Tabela ad_campaigns não encontrada:', campaignsError);
      }

      const stats: AdminStats = {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        mrr: mrr,
        adRevenue: adRevenue,
        creatorFund: creatorFund,
        growthRate: Math.round(growthRate * 10) / 10, // Arredondar para 1 decimal
        activeCampaigns: activeCampaigns || 0,
      };

      return { data: stats, error: null };
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas:', error);
      return { data: null, error };
    }
  },

  /**
   * Listar campanhas de ads
   */
  async listCampaigns(): Promise<{ data: AdCampaign[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      // Se a tabela não existir, retornar array vazio
      if (error?.code === '42P01') {
        console.warn('Tabela ad_campaigns não existe ainda');
        return { data: [], error: null };
      }
      return { data: null, error };
    }
  },

  /**
   * Criar campanha de ad
   */
  async createCampaign(campaign: {
    sponsor_name: string;
    title: string;
    budget: number;
    start_date: string;
    end_date?: string;
  }): Promise<{ data: AdCampaign | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .insert({
          ...campaign,
          status: 'pending',
          spent: 0,
          impressions: 0,
          clicks: 0,
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Atualizar status de campanha
   */
  async updateCampaignStatus(
    campaignId: string,
    status: 'active' | 'paused' | 'pending' | 'completed'
  ): Promise<{ data: AdCampaign | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .update({ status })
        .eq('id', campaignId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Listar top creators para repasse
   */
  async getTopCreators(limit = 10): Promise<{ data: CreatorPayout[] | null; error: any }> {
    try {
      // Buscar creators com mais visualizações e ajudas verificadas
      // Isso requer uma query mais complexa que agrega dados de posts, views, etc.
      
      // Por enquanto, buscar perfis com mais seguidores e verificação
      const { data: creators, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          avatar_url,
          subscriber_count,
          trust_score,
          verification_status
        `)
        .eq('role', 'helper')
        .eq('is_active', true)
        .eq('is_banned', false)
        .order('subscriber_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Transformar em formato de payout
      const payouts: CreatorPayout[] = (creators || []).map((creator) => ({
        id: creator.id,
        creator_id: creator.id,
        creator_name: creator.name,
        creator_avatar: creator.avatar_url || undefined,
        views: creator.subscriber_count * 10, // Estimativa: 10 views por subscriber
        verified_helps: Math.floor(creator.subscriber_count * 0.3), // Estimativa
        estimated_payout: (creator.subscriber_count * 10 * 0.01), // €0.01 por view
        status: 'pending' as const,
      }));

      return { data: payouts, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Processar pagamentos pendentes
   */
  async processPayouts(payoutIds: string[]): Promise<{ data: any; error: any }> {
    try {
      // Atualizar status dos payouts para 'approved'
      const { data, error } = await supabase
        .from('creator_payouts')
        .update({ 
          status: 'approved',
          paid_at: new Date().toISOString(),
        })
        .in('id', payoutIds)
        .select();

      if (error) {
        // Se a tabela não existir, criar transações diretamente
        if (error.code === '42P01') {
          console.warn('Tabela creator_payouts não existe ainda');
          // Criar transações de payout
          // TODO: Implementar quando tabela for criada
        }
        throw error;
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Listar solicitações de verificação de prestadores
   */
  async getVerificationRequests(): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          avatar_url,
          email,
          verification_status,
          trust_score,
          role,
          service_listings:service_listings(
            id,
            title,
            category_id,
            price,
            currency,
            is_verified
          )
        `)
        .eq('role', 'helper')
        .in('verification_status', ['pending', 'unverified'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Aprovar/rejeitar verificação de prestador
   */
  async updateVerificationStatus(
    userId: string,
    status: 'verified' | 'rejected',
    serviceIds?: string[]
  ): Promise<{ data: any; error: any }> {
    try {
      // Atualizar status do perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ verification_status: status })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Se aprovado, verificar serviços também
      if (status === 'verified' && serviceIds && serviceIds.length > 0) {
        const { error: servicesError } = await supabase
          .from('service_listings')
          .update({ is_verified: true })
          .in('id', serviceIds);

        if (servicesError) throw servicesError;
      }

      return { data: { success: true }, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Banir/desbanir usuário
   */
  async banUser(userId: string, ban: boolean, reason?: string): Promise<{ data: any; error: any }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_banned: ban,
          is_active: !ban,
          ban_reason: reason,
          banned_at: ban ? new Date().toISOString() : null,
        })
        .eq('id', userId);

      if (error) throw error;

      return { data: { success: true }, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },
};
```

---

## 4️⃣ lib/supabase/badges.ts

```typescript
// Serviço de Badges e Conquistas
import { supabase } from '../supabase';

export interface Badge {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  category?: string;
  requirements?: any;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  is_featured: boolean;
  badge?: Badge;
}

export const badgesService = {
  /**
   * Listar todos os badges disponíveis
   */
  async listBadges(): Promise<{ data: Badge[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Obter badges de um usuário
   */
  async getUserBadges(userId: string): Promise<{ data: UserBadge[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Adicionar badge a um usuário (apenas para sistema/admin)
   */
  async awardBadge(
    userId: string,
    badgeId: string,
    isFeatured: boolean = false
  ): Promise<{ data: UserBadge | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: badgeId,
          is_featured: isFeatured,
        })
        .select(`
          *,
          badge:badges(*)
        `)
        .single();

      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Verificar e conceder badges automaticamente baseado em critérios
   */
  async checkAndAwardBadges(userId: string): Promise<{ data: UserBadge[] | null; error: any }> {
    try {
      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        return { data: null, error: profileError };
      }

      // Buscar badges disponíveis
      const { data: badges, error: badgesError } = await this.listBadges();
      if (badgesError || !badges) {
        return { data: null, error: badgesError };
      }

      // Buscar badges já conquistados
      const { data: userBadges, error: userBadgesError } = await this.getUserBadges(userId);
      const earnedBadgeIds = userBadges?.map(ub => ub.badge_id) || [];

      const newlyAwarded: UserBadge[] = [];

      // Verificar cada badge
      for (const badge of badges) {
        if (earnedBadgeIds.includes(badge.id)) continue;

        let shouldAward = false;

        // Verificar requisitos
        if (badge.requirements) {
          // Exemplo: Badge de "Primeiro Serviço"
          if (badge.requirements.type === 'first_service') {
            const { count } = await supabase
              .from('service_listings')
              .select('*', { count: 'exact', head: true })
              .eq('provider_id', userId);
            shouldAward = (count || 0) >= 1;
          }

          // Exemplo: Badge de "10 Reviews"
          if (badge.requirements.type === 'reviews_count') {
            const { count } = await supabase
              .from('service_reviews')
              .select('*', { count: 'exact', head: true })
              .eq('reviewee_id', userId);
            shouldAward = (count || 0) >= (badge.requirements.threshold || 10);
          }

          // Exemplo: Badge de "Trust Score Alto"
          if (badge.requirements.type === 'trust_score') {
            shouldAward = (profile.trust_score || 0) >= (badge.requirements.threshold || 80);
          }

          // Exemplo: Badge de "Verificado"
          if (badge.requirements.type === 'verified') {
            const verifiedSteps = profile.verification_steps?.filter(
              (step: any) => step.status === 'verified'
            ) || [];
            shouldAward = verifiedSteps.length >= (badge.requirements.min_steps || 2);
          }
        }

        if (shouldAward) {
          const { data: newBadge, error: awardError } = await this.awardBadge(
            userId,
            badge.id,
            false
          );
          if (!awardError && newBadge) {
            newlyAwarded.push(newBadge);
          }
        }
      }

      return { data: newlyAwarded, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Destacar badge no perfil
   */
  async toggleFeatured(
    userId: string,
    badgeId: string,
    isFeatured: boolean
  ): Promise<{ data: UserBadge | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .update({ is_featured: isFeatured })
        .eq('user_id', userId)
        .eq('badge_id', badgeId)
        .select()
        .single();

      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  },
};
```

---

## 5️⃣ components/CreateReviewModal.tsx

```typescript
import React, { useState } from 'react';
import { X, Star, Loader2 } from 'lucide-react';
import { reviewsService } from '../lib/supabase/reviews';
import { useAuth } from '../contexts/AuthContext';

interface CreateReviewModalProps {
  serviceId: string;
  serviceTitle: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateReviewModal: React.FC<CreateReviewModalProps> = ({
  serviceId,
  serviceTitle,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [serviceCompleted, setServiceCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Por favor, selecione uma avaliação');
      return;
    }

    if (!comment.trim()) {
      setError('Por favor, escreva um comentário');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: reviewError } = await reviewsService.createReview(serviceId, {
        rating,
        comment: comment.trim(),
        serviceCompleted,
      });

      if (reviewError) {
        setError(reviewError.message || 'Erro ao criar avaliação');
      } else {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Avaliar Serviço</h2>
            <p className="text-xs text-gray-500 mt-1">{serviceTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avaliação *
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    size={32}
                    className={`transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  {rating === 1 && 'Péssimo'}
                  {rating === 2 && 'Ruim'}
                  {rating === 3 && 'Regular'}
                  {rating === 4 && 'Bom'}
                  {rating === 5 && 'Excelente'}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentário *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miggro-teal focus:outline-none resize-none"
              placeholder="Compartilhe sua experiência com este serviço..."
            />
          </div>

          {/* Service Completed */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="serviceCompleted"
              checked={serviceCompleted}
              onChange={(e) => setServiceCompleted(e.target.checked)}
              className="w-4 h-4 text-miggro-teal border-gray-300 rounded focus:ring-miggro-teal"
            />
            <label htmlFor="serviceCompleted" className="text-sm text-gray-700">
              Confirmei que o serviço foi concluído
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-500 font-medium text-sm hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || !comment.trim() || loading}
            className={`px-6 py-2 bg-miggro-teal text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
              !loading ? 'hover:bg-teal-700' : ''
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Enviando...
              </>
            ) : (
              'Enviar Avaliação'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateReviewModal;
```

---

## ✅ Status dos Arquivos

Todos os arquivos acima estão **LIMPOS** e **SEM CONFLITOS**. Copie e cole cada um no GitHub na ordem numerada.
