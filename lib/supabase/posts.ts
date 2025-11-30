// Serviços para Posts
import { supabase } from '../supabase';
import { Post } from '../../types';

export const postsService = {
  /**
   * Listar posts (feed)
   */
  async list(options?: {
    countryId?: string;
    groupId?: string; // Se fornecido, lista apenas posts do grupo
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(id, name, avatar_url, username),
          group:groups!posts_group_id_fkey(id, name, image_url)
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      // Se groupId fornecido, filtrar por grupo; caso contrário, apenas posts gerais (group_id IS NULL)
      if (options?.groupId) {
        query = query.eq('group_id', options.groupId);
      } else if (options?.groupId === undefined) {
        // Por padrão, mostrar apenas posts gerais (não de grupos)
        query = query.is('group_id', null);
      }

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
    group_id?: string; // ID do grupo, se o post for em um grupo
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Se group_id fornecido, verificar se o usuário é membro do grupo
      if (post.group_id) {
        const { data: membership, error: membershipError } = await supabase
          .from('group_members')
          .select('id')
          .eq('group_id', post.group_id)
          .eq('user_id', user.id)
          .single();

        if (membershipError || !membership) {
          throw new Error('Você precisa ser membro do grupo para postar nele');
        }
      }

      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          ...post,
        })
        .select(`
          *,
          author:profiles!posts_author_id_fkey(id, name, avatar_url, username),
          group:groups!posts_group_id_fkey(id, name, image_url)
        `)
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

  /**
   * Verificar quais posts o usuário curtiu (batch - otimizado)
   */
  async getLikedPosts(postIds: string[]) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !postIds || postIds.length === 0) {
        return { data: [], error: null };
      }
<<<<<<< HEAD

      const { data, error } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      if (error) throw error;

      const likedPostIds = data?.map(like => like.post_id) || [];
      return { data: likedPostIds, error: null };
    } catch (error: any) {
      console.error('[postsService] Erro ao buscar posts curtidos:', error);
      return { data: [], error: null };
    }
  },

  /**
   * Listar comentários de um post
   */
  async listComments(postId: string) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles!comments_author_id_fkey(id, name, avatar_url, username)
        `)
        .eq('post_id', postId)
        .is('parent_comment_id', null) // Apenas comentários principais
        .order('created_at', { ascending: true });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Criar comentário
   */
  async createComment(postId: string, content: string, parentCommentId?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content,
          parent_comment_id: parentCommentId || null,
        })
        .select(`
          *,
          author:profiles!comments_author_id_fkey(id, name, avatar_url, username)
        `)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Deletar comentário
   */
  async deleteComment(commentId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', user.id); // Apenas o autor pode deletar

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  /**
   * Curtir/Descurtir comentário
   */
  async toggleCommentLike(commentId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se já curtiu
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Descurtir
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        if (error) throw error;
        return { data: { liked: false }, error: null };
      } else {
        // Curtir
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
          });

        if (error) throw error;
        return { data: { liked: true }, error: null };
      }
=======
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
    } catch (error: any) {
      return { data: null, error };
    }
  },
};
