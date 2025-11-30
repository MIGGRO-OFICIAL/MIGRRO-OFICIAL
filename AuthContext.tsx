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
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await loadUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
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
    const { error } = await authService.signIn(email, password);
    if (!error) {
      await loadUser();
    }
    return { error };
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
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
