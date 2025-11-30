// Serviço de Moderação de Conteúdo
import { supabase } from '../supabase';

export interface Report {
  id: string;
  reporter_id: string;
  report_type: 'post' | 'service' | 'user' | 'comment' | 'group' | 'message';
  reported_id: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed' | 'escalated';
  action_taken?: string;
  action_notes?: string;
  moderated_by?: string;
  moderated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ModerationAction {
  id: string;
  target_type: 'post' | 'service' | 'user' | 'comment' | 'group' | 'message';
  target_id: string;
  action: 'warn' | 'hide' | 'remove' | 'ban' | 'suspend';
  reason?: string;
  duration_days?: number;
  moderator_id: string;
  report_id?: string;
  status: 'active' | 'reversed' | 'expired';
  created_at: string;
  expires_at?: string;
  reversed_at?: string;
  reversed_by?: string;
}

export const moderationService = {
  /**
   * Criar denúncia
   */
  async createReport(
    reporterId: string,
    report: {
      report_type: Report['report_type'];
      reported_id: string;
      reason: string;
      description?: string;
    }
  ): Promise<{ data: Report | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert({
          reporter_id: reporterId,
          report_type: report.report_type,
          reported_id: report.reported_id,
          reason: report.reason,
          description: report.description,
          status: 'pending',
        })
        .select()
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Listar denúncias (apenas admins)
   */
  async listReports(options?: {
    status?: Report['status'];
    report_type?: Report['report_type'];
    limit?: number;
    offset?: number;
  }): Promise<{ data: Report[] | null; error: any }> {
    try {
      let query = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.report_type) {
        query = query.eq('report_type', options.report_type);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Obter denúncias do usuário
   */
  async getUserReports(userId: string): Promise<{ data: Report[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('reporter_id', userId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Atualizar status da denúncia (apenas admins)
   */
  async updateReportStatus(
    reportId: string,
    status: Report['status'],
    actionTaken?: string,
    actionNotes?: string,
    moderatorId?: string
  ): Promise<{ data: Report | null; error: any }> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (actionTaken) {
        updateData.action_taken = actionTaken;
      }

      if (actionNotes) {
        updateData.action_notes = actionNotes;
      }

      if (moderatorId) {
        updateData.moderated_by = moderatorId;
        updateData.moderated_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', reportId)
        .select()
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Criar ação de moderação (apenas admins)
   */
  async createModerationAction(
    moderatorId: string,
    action: {
      target_type: ModerationAction['target_type'];
      target_id: string;
      action: ModerationAction['action'];
      reason?: string;
      duration_days?: number;
      report_id?: string;
    }
  ): Promise<{ data: ModerationAction | null; error: any }> {
    try {
      const expiresAt = action.duration_days
        ? new Date(Date.now() + action.duration_days * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error } = await supabase
        .from('moderation_actions')
        .insert({
          target_type: action.target_type,
          target_id: action.target_id,
          action: action.action,
          reason: action.reason,
          duration_days: action.duration_days,
          moderator_id: moderatorId,
          report_id: action.report_id,
          status: 'active',
          expires_at: expiresAt,
        })
        .select()
        .single();

      // Aplicar ação no item
      if (!error && data) {
        await this.applyModerationAction(data);
      }

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Aplicar ação de moderação no item
   */
  async applyModerationAction(action: ModerationAction): Promise<void> {
    try {
      if (action.action === 'remove' || action.action === 'hide') {
        // Remover ou ocultar o item
        if (action.target_type === 'post') {
          await supabase
            .from('posts')
            .update({ is_hidden: action.action === 'hide' })
            .eq('id', action.target_id);
        } else if (action.target_type === 'service') {
          await supabase
            .from('service_listings')
            .update({ is_active: false })
            .eq('id', action.target_id);
        } else if (action.target_type === 'comment') {
          await supabase
            .from('comments')
            .update({ is_hidden: action.action === 'hide' })
            .eq('id', action.target_id);
        }
      } else if (action.action === 'ban' || action.action === 'suspend') {
        // Banir ou suspender usuário
        if (action.target_type === 'user') {
          await supabase
            .from('profiles')
            .update({
              is_banned: action.action === 'ban',
              banned_until: action.expires_at || null,
            })
            .eq('id', action.target_id);
        }
      }
    } catch (err) {
      console.error('Error applying moderation action:', err);
    }
  },

  /**
   * Listar ações de moderação ativas
   */
  async listActiveActions(
    targetType?: ModerationAction['target_type'],
    targetId?: string
  ): Promise<{ data: ModerationAction[] | null; error: any }> {
    try {
      let query = supabase
        .from('moderation_actions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (targetType) {
        query = query.eq('target_type', targetType);
      }

      if (targetId) {
        query = query.eq('target_id', targetId);
      }

      const { data, error } = await query;

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },
};
<<<<<<< HEAD
=======
=======
// Serviço de Moderação de Conteúdo
import { supabase } from '../supabase';

export interface Report {
  id: string;
  reporter_id: string;
  report_type: 'post' | 'service' | 'user' | 'comment' | 'group' | 'message';
  reported_id: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed' | 'escalated';
  action_taken?: string;
  action_notes?: string;
  moderated_by?: string;
  moderated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ModerationAction {
  id: string;
  target_type: 'post' | 'service' | 'user' | 'comment' | 'group' | 'message';
  target_id: string;
  action: 'warn' | 'hide' | 'remove' | 'ban' | 'suspend';
  reason?: string;
  duration_days?: number;
  moderator_id: string;
  report_id?: string;
  status: 'active' | 'reversed' | 'expired';
  created_at: string;
  expires_at?: string;
  reversed_at?: string;
  reversed_by?: string;
}

export const moderationService = {
  /**
   * Criar denúncia
   */
  async createReport(
    reporterId: string,
    report: {
      report_type: Report['report_type'];
      reported_id: string;
      reason: string;
      description?: string;
    }
  ): Promise<{ data: Report | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert({
          reporter_id: reporterId,
          report_type: report.report_type,
          reported_id: report.reported_id,
          reason: report.reason,
          description: report.description,
          status: 'pending',
        })
        .select()
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Listar denúncias (apenas admins)
   */
  async listReports(options?: {
    status?: Report['status'];
    report_type?: Report['report_type'];
    limit?: number;
    offset?: number;
  }): Promise<{ data: Report[] | null; error: any }> {
    try {
      let query = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.report_type) {
        query = query.eq('report_type', options.report_type);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Obter denúncias do usuário
   */
  async getUserReports(userId: string): Promise<{ data: Report[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('reporter_id', userId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Atualizar status da denúncia (apenas admins)
   */
  async updateReportStatus(
    reportId: string,
    status: Report['status'],
    actionTaken?: string,
    actionNotes?: string,
    moderatorId?: string
  ): Promise<{ data: Report | null; error: any }> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (actionTaken) {
        updateData.action_taken = actionTaken;
      }

      if (actionNotes) {
        updateData.action_notes = actionNotes;
      }

      if (moderatorId) {
        updateData.moderated_by = moderatorId;
        updateData.moderated_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', reportId)
        .select()
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Criar ação de moderação (apenas admins)
   */
  async createModerationAction(
    moderatorId: string,
    action: {
      target_type: ModerationAction['target_type'];
      target_id: string;
      action: ModerationAction['action'];
      reason?: string;
      duration_days?: number;
      report_id?: string;
    }
  ): Promise<{ data: ModerationAction | null; error: any }> {
    try {
      const expiresAt = action.duration_days
        ? new Date(Date.now() + action.duration_days * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error } = await supabase
        .from('moderation_actions')
        .insert({
          target_type: action.target_type,
          target_id: action.target_id,
          action: action.action,
          reason: action.reason,
          duration_days: action.duration_days,
          moderator_id: moderatorId,
          report_id: action.report_id,
          status: 'active',
          expires_at: expiresAt,
        })
        .select()
        .single();

      // Aplicar ação no item
      if (!error && data) {
        await this.applyModerationAction(data);
      }

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Aplicar ação de moderação no item
   */
  async applyModerationAction(action: ModerationAction): Promise<void> {
    try {
      if (action.action === 'remove' || action.action === 'hide') {
        // Remover ou ocultar o item
        if (action.target_type === 'post') {
          await supabase
            .from('posts')
            .update({ is_hidden: action.action === 'hide' })
            .eq('id', action.target_id);
        } else if (action.target_type === 'service') {
          await supabase
            .from('service_listings')
            .update({ is_active: false })
            .eq('id', action.target_id);
        } else if (action.target_type === 'comment') {
          await supabase
            .from('comments')
            .update({ is_hidden: action.action === 'hide' })
            .eq('id', action.target_id);
        }
      } else if (action.action === 'ban' || action.action === 'suspend') {
        // Banir ou suspender usuário
        if (action.target_type === 'user') {
          await supabase
            .from('profiles')
            .update({
              is_banned: action.action === 'ban',
              banned_until: action.expires_at || null,
            })
            .eq('id', action.target_id);
        }
      }
    } catch (err) {
      console.error('Error applying moderation action:', err);
    }
  },

  /**
   * Listar ações de moderação ativas
   */
  async listActiveActions(
    targetType?: ModerationAction['target_type'],
    targetId?: string
  ): Promise<{ data: ModerationAction[] | null; error: any }> {
    try {
      let query = supabase
        .from('moderation_actions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (targetType) {
        query = query.eq('target_type', targetType);
      }

      if (targetId) {
        query = query.eq('target_id', targetId);
      }

      const { data, error } = await query;

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },
};
>>>>>>> origin/main
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
