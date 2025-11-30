// Serviços de Autenticação com Supabase
import { supabase } from '../supabase';
import { User } from '../../types';

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
      if (authData?.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          email,
          name,
          username: email.split('@')[0],
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
      console.log('[authService] Iniciando login para:', email);
      
      // Validar entrada
      if (!email || !password) {
        return { data: null, error: { message: 'Email e senha são obrigatórios' } };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

<<<<<<< HEAD
      if (error) {
        console.error('[authService] Erro no login:', error);
        return { data: null, error };
      }

      if (!data.session) {
        console.error('[authService] Login bem-sucedido mas sem sessão');
        return { data: null, error: { message: 'Login falhou: sessão não criada' } };
      }

      console.log('[authService] Login bem-sucedido, sessão criada');
      
      // Aguardar um pouco para garantir que a sessão está estabelecida
      await new Promise(resolve => setTimeout(resolve, 100));

      return { data, error: null };
    } catch (error: any) {
      console.error('[authService] Exceção no login:', error);
      return { data: null, error: error || { message: 'Erro inesperado ao fazer login' } };
=======
      return { data, error };
    } catch (error: any) {
      return { data: null, error };
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
    }
  },

  /**
   * Logout
   */
  async signOut() {
    try {
      console.log('[authService] Iniciando logout...');
      
      // Limpar localStorage do Supabase
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Limpar sessionStorage
      sessionStorage.clear();
      
      // Fazer signOut no Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[authService] Erro no signOut:', error);
      } else {
        console.log('[authService] Logout concluído com sucesso');
      }
      
      return { error };
    } catch (error: any) {
<<<<<<< HEAD
      console.error('[authService] Exceção no logout:', error);
=======
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
      return { error };
    }
  },

  /**
   * Obter usuário atual
   */
  async getCurrentUser() {
    try {
<<<<<<< HEAD
      console.log('[authService] Carregando usuário atual...');
      
      // Primeiro verificar se há sessão
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[authService] Erro ao obter sessão:', sessionError);
        return { data: null, error: sessionError };
      }

      if (!session) {
        console.log('[authService] Nenhuma sessão encontrada');
        return { data: null, error: null };
      }

      // Obter usuário da sessão
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('[authService] Erro ao obter usuário:', userError);
        return { data: null, error: userError };
      }

      if (!user) {
        console.log('[authService] Nenhum usuário encontrado na sessão');
        return { data: null, error: null };
      }

      console.log('[authService] Usuário encontrado:', user.id);

      // Buscar perfil
      const { data: profile, error: profileError } = await supabase
=======
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return { data: null, error: null };

      const { data: profile, error } = await supabase
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('[authService] Erro ao buscar perfil:', profileError);
        // Se o perfil não existe, ainda retornamos o usuário básico
        return { 
          data: {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
            role: 'imigrant' as const,
            raiz_coins: 0,
            trust_score: 0,
            is_premium: false,
          }, 
          error: null 
        };
      }

      console.log('[authService] Perfil carregado com sucesso');
      return { data: profile, error: null };
    } catch (error: any) {
<<<<<<< HEAD
      console.error('[authService] Exceção ao carregar usuário:', error);
=======
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
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
