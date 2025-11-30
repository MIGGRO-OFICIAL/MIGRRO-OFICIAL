<<<<<<< HEAD
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
=======
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
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
