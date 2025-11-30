// Serviço de Busca
import { supabase } from '../supabase';

export const searchService = {
  /**
   * Busca geral (posts, serviços, usuários)
   */
  async search(query: string, options?: {
    types?: ('posts' | 'services' | 'users')[];
    limit?: number;
  }) {
    const types = options?.types || ['posts', 'services', 'users'];
    const limit = options?.limit || 10;

    const results: {
      posts?: any[];
      services?: any[];
      users?: any[];
    } = {};

    try {
      // Buscar posts
      if (types.includes('posts')) {
        const { data: posts, error: postsError } = await supabase
          .from('posts')
          .select(`
            *,
            author:profiles!posts_author_id_fkey(id, name, avatar_url, username)
          `)
          .eq('is_deleted', false)
          .or(`content.ilike.%${query}%,tags.cs.{${query}}`)
          .order('created_at', { ascending: false })
          .limit(limit);
<<<<<<< HEAD

=======
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
        // Se não encontrou com tags.cs, tentar busca mais simples
        if (!postsError && (!posts || posts.length === 0)) {
          const { data: postsAlt } = await supabase
            .from('posts')
            .select(`
              *,
              author:profiles!posts_author_id_fkey(id, name, avatar_url, username)
            `)
            .eq('is_deleted', false)
            .ilike('content', `%${query}%`)
            .order('created_at', { ascending: false })
            .limit(limit);
          
          if (postsAlt) {
            results.posts = postsAlt;
          }
        } else if (!postsError && posts) {
          results.posts = posts;
<<<<<<< HEAD
        }
      }
=======
        }}
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2

      // Buscar serviços
      if (types.includes('services')) {
        const { data: services, error: servicesError } = await supabase
          .from('service_listings')
          .select(`
            *,
            provider:profiles!service_listings_provider_id_fkey(id, name, avatar_url, username),
            category:service_categories!service_listings_category_id_fkey(id, name, name_pt)
          `)
          .eq('is_active', true)
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (!servicesError) {
          results.services = services || [];
        }
      }

      // Buscar usuários
      if (types.includes('users')) {
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id, name, username, avatar_url, bio, location, trust_score, verification_status')
          .or(`name.ilike.%${query}%,username.ilike.%${query}%,bio.ilike.%${query}%`)
          .order('trust_score', { ascending: false })
          .limit(limit);

        if (!usersError) {
          results.users = users || [];
        }
      }

      return { data: results, error: null };
<<<<<<< HEAD
    } catch (error: any) {
      return { data: null, error };
=======
	    } catch (error: any) {
	      return { data: null, error };
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
    }
  },

  /**
   * Buscar apenas posts
   */
  async searchPosts(query: string, limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(id, name, avatar_url, username)
        `)
        .eq('is_deleted', false)
        .or(`content.ilike.%${query}%,tags.cs.{${query}}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data, error: null };
<<<<<<< HEAD
    } catch (error: any) {
      return { data: null, error };
=======
	    } catch (error: any) {
	      return { data: null, error };
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
    }
  },

  /**
   * Buscar apenas serviços
   */
  async searchServices(query: string, limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from('service_listings')
        .select(`
          *,
          provider:profiles!service_listings_provider_id_fkey(id, name, avatar_url, username),
          category:service_categories!service_listings_category_id_fkey(id, name, name_pt)
        `)
        .eq('is_active', true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data, error: null };
<<<<<<< HEAD
    } catch (error: any) {
      return { data: null, error };
=======
	    } catch (error: any) {
	      return { data: null, error };
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
    }
  },

  /**
   * Buscar apenas usuários
   */
  async searchUsers(query: string, limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url, bio, location, trust_score, verification_status')
        .or(`name.ilike.%${query}%,username.ilike.%${query}%,bio.ilike.%${query}%`)
        .order('trust_score', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data, error: null };
<<<<<<< HEAD
    } catch (error: any) {
      return { data: null, error };
=======
	    } catch (error: any) {
	      return { data: null, error };
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
    }
  },
};
