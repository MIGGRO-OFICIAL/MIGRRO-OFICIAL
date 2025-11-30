<<<<<<< HEAD
// Serviços para Usuários/Perfis
import { supabase } from '../supabase';

export const usersService = {
  /**
   * Obter perfil completo do usuário
   */
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          country:countries(*),
          city:cities(*),
          badges:user_badges(
            badge:badges(*)
          )
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Atualizar perfil
   */
  async updateProfile(userId: string, updates: {
    name?: string;
    username?: string;
    bio?: string;
    avatar_url?: string;
    location?: string;
    city_id?: string;
    country_id?: string;
    phone?: string;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== userId) {
        throw new Error('Não autorizado');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Buscar usuários
   */
  async searchUsers(query: string, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url, role, trust_score, is_premium')
        .or(`name.ilike.%${query}%,username.ilike.%${query}%`)
        .eq('is_active', true)
        .eq('is_banned', false)
        .limit(limit);

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Obter perfil público
   */
  async getPublicProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          username,
          avatar_url,
          bio,
          location,
          role,
          raiz_coins,
          trust_score,
          verification_status,
          subscriber_count,
          following_count,
          followers_count,
          is_premium,
          join_date,
          country:countries(name, flag_emoji),
          city:cities(name),
          badges:user_badges(
            badge:badges(*)
          )
        `)
        .eq('id', userId)
        .eq('is_active', true)
        .eq('is_banned', false)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Seguir/Deixar de seguir usuário
   */
  async toggleFollow(userId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      if (user.id === userId) throw new Error('Não pode seguir a si mesmo');

      // Verificar se já segue
      const { data: existingFollow } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      if (existingFollow) {
        // Deixar de seguir
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        if (error) throw error;
        return { data: { following: false }, error: null };
      } else {
        // Seguir
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: userId,
          });

        if (error) throw error;
        return { data: { following: true }, error: null };
      }
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Verificar se está seguindo
   */
  async isFollowing(userId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: false, error: null };

      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      return { data: !!data, error: null };
    } catch (error: any) {
      return { data: false, error: null };
    }
  },
};
=======
// Serviços para Usuários/Perfis
import { supabase } from '../supabase';

export const usersService = {
  /**
   * Obter perfil completo do usuário
   */
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          country:countries(*),
          city:cities(*),
          badges:user_badges(
            badge:badges(*)
          )
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Atualizar perfil
   */
  async updateProfile(userId: string, updates: {
    name?: string;
    username?: string;
    bio?: string;
    avatar_url?: string;
    location?: string;
    city_id?: string;
    country_id?: string;
    phone?: string;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== userId) {
        throw new Error('Não autorizado');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Buscar usuários
   */
  async searchUsers(query: string, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url, role, trust_score, is_premium')
        .or(`name.ilike.%${query}%,username.ilike.%${query}%`)
        .eq('is_active', true)
        .eq('is_banned', false)
        .limit(limit);

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Obter perfil público
   */
  async getPublicProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          username,
          avatar_url,
          bio,
          location,
          role,
          raiz_coins,
          trust_score,
          verification_status,
          subscriber_count,
          following_count,
          followers_count,
          is_premium,
          join_date,
          country:countries(name, flag_emoji),
          city:cities(name),
          badges:user_badges(
            badge:badges(*)
          )
        `)
        .eq('id', userId)
        .eq('is_active', true)
        .eq('is_banned', false)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Seguir/Deixar de seguir usuário
   */
  async toggleFollow(userId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      if (user.id === userId) throw new Error('Não pode seguir a si mesmo');

      // Verificar se já segue
      const { data: existingFollow } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      if (existingFollow) {
        // Deixar de seguir
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        if (error) throw error;
        return { data: { following: false }, error: null };
      } else {
        // Seguir
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: userId,
          });

        if (error) throw error;
        return { data: { following: true }, error: null };
      }
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Verificar se está seguindo
   */
  async isFollowing(userId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: false, error: null };

      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      return { data: !!data, error: null };
    } catch (error: any) {
      return { data: false, error: null };
    }
  },
};
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
