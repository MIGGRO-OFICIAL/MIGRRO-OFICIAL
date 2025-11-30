// Serviços para Posts
import { supabase } from '../supabase';
import { Post } from '../../types';

export const postsService = {
  /**
   * Listar posts (feed)
   */
  async list(options?: {
    countryId?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(id, name, avatar_url, username)
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (options?.countryId) {
        query = query.eq('country_id', options.countryId);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Obter post por ID
   */
  async getById(postId: string) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(id, name, avatar_url, username)
        `)
        .eq('id', postId)
        .eq('is_deleted', false)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Criar novo post
   */
  async create(post: {
    content: string;
    post_type?: 'general' | 'help_request' | 'event';
    image_urls?: string[];
    video_url?: string;
    tags?: string[];
    country_id?: string;
    city_id?: string;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          ...post,
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
   * Atualizar post
   */
  async update(postId: string, updates: Partial<Post>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', postId)
        .eq('author_id', user.id) // Apenas o autor pode atualizar
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Deletar post (soft delete)
   */
  async delete(postId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('posts')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', postId)
        .eq('author_id', user.id);

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  /**
   * Curtir/Descurtir post
   */
  async toggleLike(postId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se já curtiu
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Descurtir
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        return { data: { liked: false }, error: null };
      } else {
        // Curtir
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id,
          });

        if (error) throw error;
        return { data: { liked: true }, error: null };
      }
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Verificar se usuário curtiu o post
   */
  async isLiked(postId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: false, error: null };

      const { data, error } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      return { data: !!data, error: null };
    } catch (error: any) {
      return { data: false, error: null };
    }
  },
};
