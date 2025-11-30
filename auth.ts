// Serviços de Autenticação com Supabase
import { supabase } from '../supabase';
import { User } from '../../types';

/**
 * Autenticação de usuários
 */
export const authService = {
  /**
   * Cadastro de novo usuário
   */
  async signUp(email: string, password: string, name: string) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (authError) throw authError;

      // Criar perfil após cadastro
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email,
            name,
            username: email.split('@')[0], // Username baseado no email
          });

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
          // Não falha o cadastro se o perfil não for criado (pode ser criado depois)
        }
      }

      return { data: authData, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Login
   */
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Logout
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error: any) {
      return { error };
    }
  },

  /**
   * Obter usuário atual
   */
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return { data: null, error: null };

      // Buscar perfil completo
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      return { data: profile, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Obter sessão atual
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return { data: session, error };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Observar mudanças de autenticação
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },
};
