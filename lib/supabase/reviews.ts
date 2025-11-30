<<<<<<< HEAD
// Serviço de Reviews/Avaliações
import { supabase } from '../supabase';

export const reviewsService = {
  /**
   * Criar review de serviço
   */
  async createReview(serviceId: string, review: {
    rating: number; // 1-5
    comment: string;
    serviceCompleted: boolean;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se já existe review deste usuário para este serviço
      const { data: existing } = await supabase
        .from('service_reviews')
        .select('id')
        .eq('service_listing_id', serviceId)
        .eq('reviewer_id', user.id)
        .single();

      if (existing) {
        throw new Error('Você já avaliou este serviço');
      }

      // Buscar provider do serviço
      const { data: service } = await supabase
        .from('service_listings')
        .select('provider_id')
        .eq('id', serviceId)
        .single();

      if (!service) {
        throw new Error('Serviço não encontrado');
      }

      const { data, error } = await supabase
        .from('service_reviews')
        .insert({
          service_id: serviceId,
          reviewer_id: user.id,
          provider_id: service.provider_id,
          rating: review.rating,
          comment: review.comment,
          is_verified: review.serviceCompleted,
        })
        .select(`
          *,
          reviewer:profiles!service_reviews_reviewer_id_fkey(id, name, avatar_url, username)
        `)
        .single();

      if (error) throw error;

      // Atualizar rating médio do serviço
      await this.updateServiceRating(serviceId);

      // Atualizar trust score do provider
      await this.updateProviderTrustScore(service.provider_id);

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Listar reviews de um serviço
   */
  async listServiceReviews(serviceId: string, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('service_reviews')
        .select(`
          *,
          reviewer:profiles!service_reviews_reviewer_id_fkey(id, name, avatar_url, username)
        `)
        .eq('service_listing_id', serviceId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Listar reviews de um provider
   */
  async listProviderReviews(providerId: string, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('service_reviews')
        .select(`
          *,
          reviewer:profiles!service_reviews_reviewer_id_fkey(id, name, avatar_url, username),
          service:service_listings!service_reviews_service_listing_id_fkey(id, title)
        `)
        .eq('reviewee_id', providerId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Obter rating médio de um serviço
   */
  async getServiceRating(serviceId: string) {
    try {
      const { data, error } = await supabase
        .from('service_reviews')
        .select('rating')
        .eq('service_listing_id', serviceId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return { data: { average: 0, count: 0 }, error: null };
      }

      const sum = data.reduce((acc, review) => acc + review.rating, 0);
      const average = sum / data.length;

      return { data: { average, count: data.length }, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Atualizar rating médio do serviço
   */
  async updateServiceRating(serviceId: string) {
    try {
      const { data: ratingData, error: ratingError } = await this.getServiceRating(serviceId);
      if (ratingError) throw ratingError;

      if (ratingData) {
        await supabase
          .from('service_listings')
          .update({
            average_rating: ratingData.average,
            total_reviews: ratingData.count,
          })
          .eq('id', serviceId);
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  /**
   * Atualizar trust score do provider baseado em reviews
   */
  async updateProviderTrustScore(providerId: string) {
    try {
      // Buscar todas reviews do provider
      const { data: reviews, error: reviewsError } = await supabase
        .from('service_reviews')
        .select('rating')
        .eq('reviewee_id', providerId);

      if (reviewsError) throw reviewsError;

      if (!reviews || reviews.length === 0) {
        return { error: null };
      }

      // Calcular trust score baseado em:
      // - Rating médio (0-50 pontos)
      // - Total de reviews (0-30 pontos)
      // - Reviews verificadas (0-20 pontos)
      const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
      
      let trustScore = 0;
      trustScore += (averageRating / 5) * 50; // Até 50 pontos
      trustScore += Math.min((reviews.length / 20) * 30, 30); // Até 30 pontos
      // Se houver campo is_verified, adicionar pontos
      // trustScore += Math.min((verifiedCount / 10) * 20, 20); // Até 20 pontos

      // Atualizar trust score (limitar entre 0 e 100)
      trustScore = Math.min(Math.max(trustScore, 0), 100);

      await supabase
        .from('profiles')
        .update({ trust_score: Math.round(trustScore) })
        .eq('id', providerId);

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  /**
   * Deletar própria review
   */
  async deleteReview(reviewId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar review para obter service_listing_id e reviewee_id
      const { data: review } = await supabase
        .from('service_reviews')
        .select('service_listing_id, reviewee_id')
        .eq('id', reviewId)
        .eq('reviewer_id', user.id)
        .single();

      if (!review) {
        throw new Error('Review não encontrada ou não autorizado');
      }

      const { error } = await supabase
        .from('service_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('reviewer_id', user.id);

      if (error) throw error;

      // Atualizar ratings
      if (review.service_listing_id) {
        await this.updateServiceRating(review.service_listing_id);
      }
      if (review.reviewee_id) {
        await this.updateProviderTrustScore(review.reviewee_id);
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },
};
=======
// Serviço de Reviews/Avaliações
import { supabase } from '../supabase';

export const reviewsService = {
  /**
   * Criar review de serviço
   */
  async createReview(serviceId: string, review: {
    rating: number; // 1-5
    comment: string;
    serviceCompleted: boolean;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se já existe review deste usuário para este serviço
      const { data: existing } = await supabase
        .from('service_reviews')
        .select('id')
        .eq('service_listing_id', serviceId)
        .eq('reviewer_id', user.id)
        .single();

      if (existing) {
        throw new Error('Você já avaliou este serviço');
      }

      // Buscar provider do serviço
      const { data: service } = await supabase
        .from('service_listings')
        .select('provider_id')
        .eq('id', serviceId)
        .single();

      if (!service) {
        throw new Error('Serviço não encontrado');
      }

      const { data, error } = await supabase
        .from('service_reviews')
        .insert({
          service_id: serviceId,
          reviewer_id: user.id,
          provider_id: service.provider_id,
          rating: review.rating,
          comment: review.comment,
          is_verified: review.serviceCompleted,
        })
        .select(`
          *,
          reviewer:profiles!service_reviews_reviewer_id_fkey(id, name, avatar_url, username)
        `)
        .single();

      if (error) throw error;

      // Atualizar rating médio do serviço
      await this.updateServiceRating(serviceId);

      // Atualizar trust score do provider
      await this.updateProviderTrustScore(service.provider_id);

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Listar reviews de um serviço
   */
  async listServiceReviews(serviceId: string, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('service_reviews')
        .select(`
          *,
          reviewer:profiles!service_reviews_reviewer_id_fkey(id, name, avatar_url, username)
        `)
        .eq('service_listing_id', serviceId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Listar reviews de um provider
   */
  async listProviderReviews(providerId: string, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('service_reviews')
        .select(`
          *,
          reviewer:profiles!service_reviews_reviewer_id_fkey(id, name, avatar_url, username),
          service:service_listings!service_reviews_service_listing_id_fkey(id, title)
        `)
        .eq('reviewee_id', providerId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Obter rating médio de um serviço
   */
  async getServiceRating(serviceId: string) {
    try {
      const { data, error } = await supabase
        .from('service_reviews')
        .select('rating')
        .eq('service_listing_id', serviceId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return { data: { average: 0, count: 0 }, error: null };
      }

      const sum = data.reduce((acc, review) => acc + review.rating, 0);
      const average = sum / data.length;

      return { data: { average, count: data.length }, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Atualizar rating médio do serviço
   */
  async updateServiceRating(serviceId: string) {
    try {
      const { data: ratingData, error: ratingError } = await this.getServiceRating(serviceId);
      if (ratingError) throw ratingError;

      if (ratingData) {
        await supabase
          .from('service_listings')
          .update({
            average_rating: ratingData.average,
            total_reviews: ratingData.count,
          })
          .eq('id', serviceId);
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  /**
   * Atualizar trust score do provider baseado em reviews
   */
  async updateProviderTrustScore(providerId: string) {
    try {
      // Buscar todas reviews do provider
      const { data: reviews, error: reviewsError } = await supabase
        .from('service_reviews')
        .select('rating')
        .eq('reviewee_id', providerId);

      if (reviewsError) throw reviewsError;

      if (!reviews || reviews.length === 0) {
        return { error: null };
      }

      // Calcular trust score baseado em:
      // - Rating médio (0-50 pontos)
      // - Total de reviews (0-30 pontos)
      // - Reviews verificadas (0-20 pontos)
      const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
      
      let trustScore = 0;
      trustScore += (averageRating / 5) * 50; // Até 50 pontos
      trustScore += Math.min((reviews.length / 20) * 30, 30); // Até 30 pontos
      // Se houver campo is_verified, adicionar pontos
      // trustScore += Math.min((verifiedCount / 10) * 20, 20); // Até 20 pontos

      // Atualizar trust score (limitar entre 0 e 100)
      trustScore = Math.min(Math.max(trustScore, 0), 100);

      await supabase
        .from('profiles')
        .update({ trust_score: Math.round(trustScore) })
        .eq('id', providerId);

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  /**
   * Deletar própria review
   */
  async deleteReview(reviewId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar review para obter service_listing_id e reviewee_id
      const { data: review } = await supabase
        .from('service_reviews')
        .select('service_listing_id, reviewee_id')
        .eq('id', reviewId)
        .eq('reviewer_id', user.id)
        .single();

      if (!review) {
        throw new Error('Review não encontrada ou não autorizado');
      }

      const { error } = await supabase
        .from('service_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('reviewer_id', user.id);

      if (error) throw error;

      // Atualizar ratings
      if (review.service_listing_id) {
        await this.updateServiceRating(review.service_listing_id);
      }
      if (review.reviewee_id) {
        await this.updateProviderTrustScore(review.reviewee_id);
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },
};
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
