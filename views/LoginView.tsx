import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ViewState } from '../types';

interface LoginViewProps {
  onLoginSuccess: () => void;
  onSwitchToSignup: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onSwitchToSignup }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('[LoginView] Tentando fazer login...');
      const { error } = await signIn(email.trim().toLowerCase(), password);
      
      if (error) {
        console.error('[LoginView] Erro no login:', error);
        const errorMessage = error.message || error.msg || 'Erro ao fazer login';
        setError(errorMessage);
        setLoading(false);
      } else {
        console.log('[LoginView] Login bem-sucedido, aguardando redirecionamento...');
        // Aguardar um pouco antes de chamar onLoginSuccess para garantir que o usuário foi carregado
        await new Promise(resolve => setTimeout(resolve, 300));
        onLoginSuccess();
        setLoading(false);
      }
    } catch (err: any) {
      console.error('[LoginView] Exceção no login:', err);
      setError(err.message || 'Erro inesperado');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-miggro-teal/10 to-miggro-orange/10 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-miggro-teal mb-2">Miggro</h1>
          <p className="text-gray-600">Bem-vindo de volta!</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miggro-teal focus:outline-none"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miggro-teal focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-miggro-teal text-white py-3 rounded-lg font-medium flex items-center justify-center hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Entrando...
              </>
            ) : (
              <>
                Entrar
                <ArrowRight className="ml-2" size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Não tem uma conta?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-miggro-teal font-medium hover:underline"
            >
              Criar conta
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
