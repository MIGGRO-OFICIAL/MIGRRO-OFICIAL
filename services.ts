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
  }) {
    try {
      let query = supabase
        .from('service_requests')
        .select(`
          *,
          author:profiles!service_requests_author_id_fkey(id, name, avatar_url, username),
          category:service_categories!service_requests_category_id_fkey(id, name, name_pt)
        `)
        .order('created_at', { ascending: false });

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
        .select()
        .single();

      if (error) throw error;

      // Atualizar contador de propostas
      await supabase.rpc('increment', {
        table_name: 'service_requests',
        column_name: 'proposals_count',
        id: requestId,
      });

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },
};
