// Contexto de Autenticação
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { authService } from '../lib/supabase/auth';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  email: string;
  name: string;
  username?: string;
  avatar_url?: string;
  role: 'imigrant' | 'helper' | 'admin';
  raiz_coins: number;
  trust_score: number;
  country_id?: string;
  city_id?: string;
  is_premium: boolean;
}

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar usuário ao montar
  useEffect(() => {
    loadUser();

    // Observar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Auth state change:', event, session ? 'com sessão' : 'sem sessão');
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('[AuthContext] Usuário autenticado, carregando perfil...');
        // Aguardar um pouco para garantir que a sessão está disponível
        await new Promise(resolve => setTimeout(resolve, 100));
        await loadUser();
      } else if (event === 'SIGNED_OUT') {
        console.log('[AuthContext] Usuário deslogado');
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const { data, error } = await authService.getCurrentUser();
      
      if (error) {
        console.error('Erro ao carregar usuário:', error);
        setUser(null);
      } else {
        setUser(data as Profile | null);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await authService.signUp(email, password, name);
    if (!error) {
      await loadUser();
    }
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Iniciando signIn...');
      setLoading(true);
      
      const { data, error } = await authService.signIn(email, password);
      
      if (error) {
        console.error('[AuthContext] Erro no signIn:', error);
        setLoading(false);
        return { error };
      }

      if (!data || !data.session) {
        console.error('[AuthContext] Login sem sessão');
        setLoading(false);
        return { error: { message: 'Login falhou: sessão não criada' } };
      }

      console.log('[AuthContext] Login bem-sucedido, aguardando carregamento do usuário...');
      
      // Aguardar um pouco para garantir que a sessão está estabelecida
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Carregar usuário
      await loadUser();
      
      console.log('[AuthContext] Usuário carregado após login');
      setLoading(false);
      
      return { error: null };
    } catch (error: any) {
      console.error('[AuthContext] Exceção no signIn:', error);
      setLoading(false);
      return { error: error || { message: 'Erro inesperado ao fazer login' } };
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthContext: Iniciando signOut...');
      const { error } = await authService.signOut();
      if (error) {
        console.error('Erro no signOut do authService:', error);
      }
      setUser(null);
      console.log('AuthContext: signOut concluído, user setado como null');
    } catch (error) {
      console.error('Erro no signOut do AuthContext:', error);
      setUser(null); // Garantir que o user seja null mesmo com erro
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
