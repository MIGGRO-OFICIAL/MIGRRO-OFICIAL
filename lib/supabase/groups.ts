<<<<<<< HEAD
// Serviços para Grupos/Comunidades
import { supabase } from '../supabase';

export const groupsService = {
  /**
   * Listar grupos
   */
  async list(options?: {
    countryId?: string;
    cityId?: string;
    isPrivate?: boolean;
    limit?: number;
  }) {
    try {
      let query = supabase
        .from('groups')
        .select(`
          *,
          country:countries(name, flag_emoji),
          city:cities(name),
          created_by_profile:profiles!groups_created_by_fkey(id, name, avatar_url)
        `)
        .order('members_count', { ascending: false });

      if (options?.countryId) {
        query = query.eq('country_id', options.countryId);
      }

      if (options?.cityId) {
        query = query.eq('city_id', options.cityId);
      }

      if (options?.isPrivate !== undefined) {
        query = query.eq('is_private', options.isPrivate);
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
   * Obter grupo por ID
   */
  async getById(groupId: string) {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          country:countries(*),
          city:cities(*),
          created_by_profile:profiles!groups_created_by_fkey(*),
          members:group_members(
            user:profiles!group_members_user_id_fkey(id, name, avatar_url, username)
          )
        `)
        .eq('id', groupId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Criar grupo
   */
  async create(group: {
    name: string;
    description: string;
    image_url?: string;
    cover_image_url?: string;
    country_id?: string;
    city_id?: string;
    is_private?: boolean;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('groups')
        .insert({
          created_by: user.id,
          ...group,
        })
        .select()
        .single();

      if (error) throw error;

      // Adicionar criador como admin do grupo
      await supabase
        .from('group_members')
        .insert({
          group_id: data.id,
          user_id: user.id,
          role: 'admin',
        });

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Entrar em grupo
   */
  async joinGroup(groupId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se já é membro
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        return { data: { joined: true }, error: null };
      }

      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member',
        });

      if (error) throw error;

      return { data: { joined: true }, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Sair do grupo
   */
  async leaveGroup(groupId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Decrementar contador de membros
      await supabase.rpc('decrement', {
        table_name: 'groups',
        column_name: 'members_count',
        id: groupId,
      });

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  /**
   * Verificar se usuário é membro do grupo
   */
  async isMember(groupId: string, userId?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) return { data: false, error: null };

      const { data, error } = await supabase
        .from('group_members')
        .select('id, role')
        .eq('group_id', groupId)
        .eq('user_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return { data: !!data, role: data?.role, error: null };
    } catch (error: any) {
      return { data: false, error: null };
    }
  },
};
=======
// Serviços para Grupos/Comunidades
import { supabase } from '../supabase';

export const groupsService = {
  /**
   * Listar grupos
   */
  async list(options?: {
    countryId?: string;
    cityId?: string;
    isPrivate?: boolean;
    limit?: number;
  }) {
    try {
      let query = supabase
        .from('groups')
        .select(`
          *,
          country:countries(name, flag_emoji),
          city:cities(name),
          created_by_profile:profiles!groups_created_by_fkey(id, name, avatar_url)
        `)
        .order('members_count', { ascending: false });

      if (options?.countryId) {
        query = query.eq('country_id', options.countryId);
      }

      if (options?.cityId) {
        query = query.eq('city_id', options.cityId);
      }

      if (options?.isPrivate !== undefined) {
        query = query.eq('is_private', options.isPrivate);
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
   * Obter grupo por ID
   */
  async getById(groupId: string) {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          country:countries(*),
          city:cities(*),
          created_by_profile:profiles!groups_created_by_fkey(*),
          members:group_members(
            user:profiles!group_members_user_id_fkey(id, name, avatar_url, username)
          )
        `)
        .eq('id', groupId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Criar grupo
   */
  async create(group: {
    name: string;
    description: string;
    image_url?: string;
    cover_image_url?: string;
    country_id?: string;
    city_id?: string;
    is_private?: boolean;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('groups')
        .insert({
          created_by: user.id,
          ...group,
        })
        .select()
        .single();

      if (error) throw error;

      // Adicionar criador como admin do grupo
      await supabase
        .from('group_members')
        .insert({
          group_id: data.id,
          user_id: user.id,
          role: 'admin',
        });

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Entrar em grupo
   */
  async joinGroup(groupId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se já é membro
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        return { data: { joined: true }, error: null };
      }

      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member',
        });

      if (error) throw error;

      return { data: { joined: true }, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Sair do grupo
   */
  async leaveGroup(groupId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Decrementar contador de membros
      await supabase.rpc('decrement', {
        table_name: 'groups',
        column_name: 'members_count',
        id: groupId,
      });

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  /**
   * Verificar se usuário é membro do grupo
   */
  async isMember(groupId: string, userId?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) return { data: false, error: null };

      const { data, error } = await supabase
        .from('group_members')
        .select('id, role')
        .eq('group_id', groupId)
        .eq('user_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return { data: !!data, role: data?.role, error: null };
    } catch (error: any) {
      return { data: false, error: null };
    }
  },
};
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
