<<<<<<< HEAD
// Serviço de Analytics para Dashboard do Prestador
import { supabase } from '../supabase';

export const analyticsService = {
  /**
   * Registrar visualização de serviço
   */
  async trackServiceView(serviceId: string, referrer: 'search' | 'feed' | 'direct' | 'marketplace' | 'profile' = 'direct') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const viewerId = user?.id || null;

      const { data, error } = await supabase.rpc('track_service_view', {
        p_service_id: serviceId,
        p_viewer_id: viewerId,
        p_referrer: referrer,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Registrar visualização de perfil
   */
  async trackProfileView(profileId: string, referrer: 'search' | 'feed' | 'direct' | 'profile' = 'direct') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const viewerId = user?.id || null;

      const { data, error } = await supabase.rpc('track_profile_view', {
        p_profile_id: profileId,
        p_viewer_id: viewerId,
        p_referrer: referrer,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Registrar clique em "Entrar em Contato"
   */
  async trackServiceClick(serviceId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar provider do serviço
      const { data: service } = await supabase
        .from('service_listings')
        .select('provider_id')
        .eq('id', serviceId)
        .single();

      if (!service) {
        throw new Error('Serviço não encontrado');
      }

      // Atualizar contador de cliques
      await supabase
        .from('service_listings')
        .update({ total_clicks: supabase.raw('total_clicks + 1') })
        .eq('id', serviceId);

      // Registrar no analytics
      await supabase
        .from('provider_analytics')
        .insert({
          provider_id: service.provider_id,
          service_id: serviceId,
          metric_type: 'click',
          metric_value: 1,
          date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  /**
   * Obter analytics do prestador
   */
  async getProviderAnalytics(providerId: string, options?: {
    startDate?: string;
    endDate?: string;
    serviceId?: string;
    metricType?: string;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== providerId) {
        throw new Error('Não autorizado');
      }

      let query = supabase
        .from('provider_analytics')
        .select('*')
        .eq('provider_id', providerId)
        .order('date', { ascending: false });

      if (options?.startDate) {
        query = query.gte('date', options.startDate);
      }

      if (options?.endDate) {
        query = query.lte('date', options.endDate);
      }

      if (options?.serviceId) {
        query = query.eq('service_id', options.serviceId);
      }

      if (options?.metricType) {
        query = query.eq('metric_type', options.metricType);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Obter estatísticas agregadas do prestador
   */
  async getProviderStats(providerId: string, period: 'day' | 'week' | 'month' | 'year' = 'month') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== providerId) {
        throw new Error('Não autorizado');
      }

      // Calcular datas
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'day':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Buscar analytics agregados
      const { data: analytics, error: analyticsError } = await supabase
        .from('provider_analytics')
        .select('metric_type, metric_value, date')
        .eq('provider_id', providerId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (analyticsError) throw analyticsError;

      // Agregar dados
      const stats = {
        totalViews: 0,
        totalClicks: 0,
        totalConversions: 0,
        totalProposalsSent: 0,
        totalProposalsAccepted: 0,
        totalMessages: 0,
        totalReviews: 0,
      };

      analytics?.forEach((item) => {
        switch (item.metric_type) {
          case 'view':
            stats.totalViews += item.metric_value || 0;
            break;
          case 'click':
            stats.totalClicks += item.metric_value || 0;
            break;
          case 'conversion':
            stats.totalConversions += item.metric_value || 0;
            break;
          case 'proposal_sent':
            stats.totalProposalsSent += item.metric_value || 0;
            break;
          case 'proposal_accepted':
            stats.totalProposalsAccepted += item.metric_value || 0;
            break;
          case 'message_sent':
            stats.totalMessages += item.metric_value || 0;
            break;
          case 'review_received':
            stats.totalReviews += item.metric_value || 0;
            break;
        }
      });

      // Calcular taxa de conversão
      const conversionRate = stats.totalViews > 0
        ? (stats.totalConversions / stats.totalViews) * 100
        : 0;

      // Calcular taxa de aceitação de propostas
      const proposalAcceptanceRate = stats.totalProposalsSent > 0
        ? (stats.totalProposalsAccepted / stats.totalProposalsSent) * 100
        : 0;

      return {
        data: {
          ...stats,
          conversionRate: Math.round(conversionRate * 100) / 100,
          proposalAcceptanceRate: Math.round(proposalAcceptanceRate * 100) / 100,
        },
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Obter visualizações de serviços
   */
  async getServiceViews(serviceId: string, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('service_views')
        .select(`
          *,
          viewer:profiles!service_views_viewer_id_fkey(id, name, avatar_url)
        `)
        .eq('service_id', serviceId)
        .order('viewed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Obter visualizações de perfil
   */
  async getProfileViews(profileId: string, limit = 50) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== profileId) {
        throw new Error('Não autorizado');
      }

      const { data, error } = await supabase
        .from('profile_views')
        .select(`
          *,
          viewer:profiles!profile_views_viewer_id_fkey(id, name, avatar_url)
        `)
        .eq('profile_id', profileId)
        .order('viewed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },
};
=======
// Serviço de Analytics para Dashboard do Prestador
import { supabase } from '../supabase';

export const analyticsService = {
  /**
   * Registrar visualização de serviço
   */
  async trackServiceView(serviceId: string, referrer: 'search' | 'feed' | 'direct' | 'marketplace' | 'profile' = 'direct') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const viewerId = user?.id || null;

      const { data, error } = await supabase.rpc('track_service_view', {
        p_service_id: serviceId,
        p_viewer_id: viewerId,
        p_referrer: referrer,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Registrar visualização de perfil
   */
  async trackProfileView(profileId: string, referrer: 'search' | 'feed' | 'direct' | 'profile' = 'direct') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const viewerId = user?.id || null;

      const { data, error } = await supabase.rpc('track_profile_view', {
        p_profile_id: profileId,
        p_viewer_id: viewerId,
        p_referrer: referrer,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Registrar clique em "Entrar em Contato"
   */
  async trackServiceClick(serviceId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar provider do serviço
      const { data: service } = await supabase
        .from('service_listings')
        .select('provider_id')
        .eq('id', serviceId)
        .single();

      if (!service) {
        throw new Error('Serviço não encontrado');
      }

      // Atualizar contador de cliques
      await supabase
        .from('service_listings')
        .update({ total_clicks: supabase.raw('total_clicks + 1') })
        .eq('id', serviceId);

      // Registrar no analytics
      await supabase
        .from('provider_analytics')
        .insert({
          provider_id: service.provider_id,
          service_id: serviceId,
          metric_type: 'click',
          metric_value: 1,
          date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  /**
   * Obter analytics do prestador
   */
  async getProviderAnalytics(providerId: string, options?: {
    startDate?: string;
    endDate?: string;
    serviceId?: string;
    metricType?: string;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== providerId) {
        throw new Error('Não autorizado');
      }

      let query = supabase
        .from('provider_analytics')
        .select('*')
        .eq('provider_id', providerId)
        .order('date', { ascending: false });

      if (options?.startDate) {
        query = query.gte('date', options.startDate);
      }

      if (options?.endDate) {
        query = query.lte('date', options.endDate);
      }

      if (options?.serviceId) {
        query = query.eq('service_id', options.serviceId);
      }

      if (options?.metricType) {
        query = query.eq('metric_type', options.metricType);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Obter estatísticas agregadas do prestador
   */
  async getProviderStats(providerId: string, period: 'day' | 'week' | 'month' | 'year' = 'month') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== providerId) {
        throw new Error('Não autorizado');
      }

      // Calcular datas
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'day':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Buscar analytics agregados
      const { data: analytics, error: analyticsError } = await supabase
        .from('provider_analytics')
        .select('metric_type, metric_value, date')
        .eq('provider_id', providerId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (analyticsError) throw analyticsError;

      // Agregar dados
      const stats = {
        totalViews: 0,
        totalClicks: 0,
        totalConversions: 0,
        totalProposalsSent: 0,
        totalProposalsAccepted: 0,
        totalMessages: 0,
        totalReviews: 0,
      };

      analytics?.forEach((item) => {
        switch (item.metric_type) {
          case 'view':
            stats.totalViews += item.metric_value || 0;
            break;
          case 'click':
            stats.totalClicks += item.metric_value || 0;
            break;
          case 'conversion':
            stats.totalConversions += item.metric_value || 0;
            break;
          case 'proposal_sent':
            stats.totalProposalsSent += item.metric_value || 0;
            break;
          case 'proposal_accepted':
            stats.totalProposalsAccepted += item.metric_value || 0;
            break;
          case 'message_sent':
            stats.totalMessages += item.metric_value || 0;
            break;
          case 'review_received':
            stats.totalReviews += item.metric_value || 0;
            break;
        }
      });

      // Calcular taxa de conversão
      const conversionRate = stats.totalViews > 0
        ? (stats.totalConversions / stats.totalViews) * 100
        : 0;

      // Calcular taxa de aceitação de propostas
      const proposalAcceptanceRate = stats.totalProposalsSent > 0
        ? (stats.totalProposalsAccepted / stats.totalProposalsSent) * 100
        : 0;

      return {
        data: {
          ...stats,
          conversionRate: Math.round(conversionRate * 100) / 100,
          proposalAcceptanceRate: Math.round(proposalAcceptanceRate * 100) / 100,
        },
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Obter visualizações de serviços
   */
  async getServiceViews(serviceId: string, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('service_views')
        .select(`
          *,
          viewer:profiles!service_views_viewer_id_fkey(id, name, avatar_url)
        `)
        .eq('service_id', serviceId)
        .order('viewed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Obter visualizações de perfil
   */
  async getProfileViews(profileId: string, limit = 50) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== profileId) {
        throw new Error('Não autorizado');
      }

      const { data, error } = await supabase
        .from('profile_views')
        .select(`
          *,
          viewer:profiles!profile_views_viewer_id_fkey(id, name, avatar_url)
        `)
        .eq('profile_id', profileId)
        .order('viewed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },
};
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
