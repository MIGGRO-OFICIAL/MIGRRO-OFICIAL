<<<<<<< HEAD
// Serviço de Notificações
import { supabase } from '../supabase';

export const notificationsService = {
  /**
   * Listar notificações do usuário
   */
  async list(options?: {
    limit?: number;
    unreadOnly?: boolean;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (options?.unreadOnly) {
        query = query.eq('is_read', false);
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
   * Marcar notificação como lida
   */
  async markAsRead(notificationId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  /**
   * Marcar todas como lidas
   */
  async markAllAsRead() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  /**
   * Contar notificações não lidas
   */
  async getUnreadCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      return { data: count || 0, error: null };
    } catch (error: any) {
      return { data: 0, error };
    }
  },

  /**
   * Criar notificação (usando função do banco)
   */
  async create(notification: {
    userId: string;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    referenceId?: string;
    referenceType?: string;
    metadata?: any;
  }) {
    try {
      const { data, error } = await supabase.rpc('create_notification', {
        p_user_id: notification.userId,
        p_type: notification.type,
        p_title: notification.title,
        p_message: notification.message,
        p_action_url: notification.actionUrl || null,
        p_reference_id: notification.referenceId || null,
        p_reference_type: notification.referenceType || null,
        p_metadata: notification.metadata || null,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Deletar notificação
   */
  async delete(notificationId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },
};
=======
// Serviço de Notificações
import { supabase } from '../supabase';

export const notificationsService = {
  /**
   * Listar notificações do usuário
   */
  async list(options?: {
    limit?: number;
    unreadOnly?: boolean;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (options?.unreadOnly) {
        query = query.eq('is_read', false);
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
   * Marcar notificação como lida
   */
  async markAsRead(notificationId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  /**
   * Marcar todas como lidas
   */
  async markAllAsRead() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  /**
   * Contar notificações não lidas
   */
  async getUnreadCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      return { data: count || 0, error: null };
    } catch (error: any) {
      return { data: 0, error };
    }
  },

  /**
   * Criar notificação (usando função do banco)
   */
  async create(notification: {
    userId: string;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    referenceId?: string;
    referenceType?: string;
    metadata?: any;
  }) {
    try {
      const { data, error } = await supabase.rpc('create_notification', {
        p_user_id: notification.userId,
        p_type: notification.type,
        p_title: notification.title,
        p_message: notification.message,
        p_action_url: notification.actionUrl || null,
        p_reference_id: notification.referenceId || null,
        p_reference_type: notification.referenceType || null,
        p_metadata: notification.metadata || null,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Deletar notificação
   */
  async delete(notificationId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },
};
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
