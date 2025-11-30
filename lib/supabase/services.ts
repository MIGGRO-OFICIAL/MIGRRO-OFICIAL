// Serviços para Marketplace
import { supabase } from '../supabase';
import { ServiceListing, ServiceRequest, ServiceProposal } from '../../types';

export const servicesService = {
  /**
   * Listar serviços disponíveis
   */
  async listServices(options?: {
    categoryId?: string;
    countryId?: string;
    cityId?: string;
    limit?: number;
  }) {
    try {
      let query = supabase
        .from('service_listings')
        .select(`
          *,
          provider:profiles!service_listings_provider_id_fkey(id, name, avatar_url, username, trust_score),
          category:service_categories!service_listings_category_id_fkey(id, name, name_pt, icon)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (options?.categoryId) {
        query = query.eq('category_id', options.categoryId);
      }

      if (options?.countryId) {
        query = query.eq('country_id', options.countryId);
      }

      if (options?.cityId) {
        query = query.eq('city_id', options.cityId);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Obter serviço por ID
   */
  async getServiceById(serviceId: string) {
    try {
      const { data, error } = await supabase
        .from('service_listings')
        .select(`
          *,
          provider:profiles!service_listings_provider_id_fkey(*),
          category:service_categories!service_listings_category_id_fkey(*)
        `)
        .eq('id', serviceId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Criar listagem de serviço
   */
  async createService(service: {
    category_id: string;
    title: string;
    description: string;
    price: number;
    currency: 'EUR' | 'BRL' | 'USD' | 'RAIZ';
    accepts_raiz_coins?: boolean;
    country_id?: string;
    city_id?: string;
    image_urls?: string[];
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('service_listings')
        .insert({
          provider_id: user.id,
          ...service,
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
   * Listar pedidos de serviço (marketplace reverso)
   */
  async listRequests(options?: {
    status?: 'open' | 'in_progress' | 'closed';
    countryId?: string;
    limit?: number;
    userId?: string; // Se fornecido, busca apenas pedidos do usuário
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from('service_requests')
        .select(`
          *,
          author:profiles!service_requests_author_id_fkey(id, name, avatar_url, username),
          category:service_categories!service_requests_category_id_fkey(id, name, name_pt)
        `)
        .order('created_at', { ascending: false });

      // Se userId fornecido ou se não especificado, buscar apenas do usuário atual
      if (options?.userId || (user && !options?.status && !options?.countryId)) {
        const targetUserId = options?.userId || user.id;
        query = query.eq('author_id', targetUserId);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.countryId) {
        query = query.eq('country_id', options.countryId);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Criar pedido de serviço
   */
  async createRequest(request: {
    title: string;
    description: string;
    category_id?: string;
    budget_min?: number;
    budget_max?: number;
    currency?: string;
    urgency?: 'low' | 'medium' | 'high';
    country_id?: string;
    city_id?: string;
    image_urls?: string[];
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('service_requests')
        .insert({
          author_id: user.id,
          ...request,
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
   * Criar proposta para um pedido
   */
  async createProposal(requestId: string, proposal: {
    price: number;
    currency: 'EUR' | 'BRL' | 'USD' | 'RAIZ';
    description: string;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('service_proposals')
        .insert({
          request_id: requestId,
          provider_id: user.id,
          ...proposal,
        })
        .select(`
          *,
          provider:profiles!service_proposals_provider_id_fkey(id, name, avatar_url, username, trust_score, verification_status)
        `)
        .single();

      if (error) throw error;

      // Atualizar contador de propostas manualmente
      const { data: request } = await supabase
        .from('service_requests')
        .select('proposals_count')
        .eq('id', requestId)
        .single();

      if (request) {
        await supabase
          .from('service_requests')
          .update({ proposals_count: (request.proposals_count || 0) + 1 })
          .eq('id', requestId);
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Listar propostas de um pedido
   */
  async listProposals(requestId: string) {
    try {
      const { data, error } = await supabase
        .from('service_proposals')
        .select(`
          *,
          provider:profiles!service_proposals_provider_id_fkey(id, name, avatar_url, username, trust_score, verification_status, is_premium)
        `)
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Aceitar proposta
   */
  async acceptProposal(proposalId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar proposta e pedido
      const { data: proposal, error: propError } = await supabase
        .from('service_proposals')
        .select('request_id, provider_id')
        .eq('id', proposalId)
        .single();

      if (propError) throw propError;

      // Verificar se o usuário é o autor do pedido
      const { data: request, error: reqError } = await supabase
        .from('service_requests')
        .select('author_id')
        .eq('id', proposal.request_id)
        .single();

      if (reqError) throw reqError;

      if (request.author_id !== user.id) {
        throw new Error('Apenas o autor do pedido pode aceitar propostas');
      }

      // Atualizar proposta para aceita
      const { data: updatedProposal, error: updateError } = await supabase
        .from('service_proposals')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', proposalId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Atualizar pedido para in_progress
      await supabase
        .from('service_requests')
        .update({ 
          status: 'in_progress',
        })
        .eq('id', proposal.request_id);

      // Rejeitar outras propostas
      await supabase
        .from('service_proposals')
        .update({ status: 'rejected' })
        .eq('request_id', proposal.request_id)
        .neq('id', proposalId);

      return { data: updatedProposal, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Rejeitar proposta
   */
  async rejectProposal(proposalId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('service_proposals')
        .update({ status: 'rejected' })
        .eq('id', proposalId);

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },
};
