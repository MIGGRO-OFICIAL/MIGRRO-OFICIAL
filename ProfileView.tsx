
import React from 'react';
import { User, ViewState } from '../types';
import { Lock, Edit, CreditCard, ChevronRight, Shield, CheckCircle2 } from 'lucide-react';
import TrustBadge from '../components/TrustBadge';

interface ProfileViewProps {
  user: User;
  setView: (view: ViewState) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, setView }) => {
  const completedSteps = user.verificationSteps.filter(s => s.status === 'verified').length;
  const totalSteps = user.verificationSteps.length;
  const progress = (completedSteps / totalSteps) * 100;

  return (
    <div className="h-full bg-gray-50 overflow-y-auto pb-24 max-w-md mx-auto animate-in fade-in duration-300">
        <div className="bg-white p-6 pb-8 border-b border-gray-200 rounded-b-3xl shadow-sm">
            <div className="flex flex-col items-center">
                <div className="relative">
                    <img src={user.avatar} alt="Profile" className="w-24 h-24 rounded-full mb-4 border-4 border-white shadow-lg" />
                    <div className="absolute bottom-4 right-0">
                        <TrustBadge score={user.trustScore} size="sm" />
                    </div>
                </div>
                
                <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                <p className="text-sm mt-1 font-medium text-brand-600 bg-brand-50 px-3 py-1 rounded-full">{user.role === 'admin' ? 'Administrador' : user.role === 'helper' ? 'Helper Verificado' : 'Membro da Comunidade'}</p>
                <p className="text-sm mt-3 text-gray-500 italic text-center max-w-xs">"{user.bio}"</p>
            </div>

            {/* Trust Score Gamification */}
            <div className="mt-8 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-gray-800 text-sm flex items-center">
                        <Shield size={16} className="mr-2 text-brand-600" />
                        Nível de Segurança
                    </h3>
                    <span className="text-xs font-bold text-gray-500">{completedSteps}/{totalSteps} etapas</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div className="bg-brand-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                </div>
                
                {progress < 100 ? (
                     <button 
                        onClick={() => setView(ViewState.VERIFICATION)}
                        className="w-full bg-brand-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-brand-700 transition-colors flex items-center justify-center"
                     >
                        Aumentar minha confiança (+Pontos)
                     </button>
                ) : (
                    <div className="text-center text-xs text-green-600 font-bold flex items-center justify-center">
                        <CheckCircle2 size={14} className="mr-1" /> Perfil 100% Verificado
                    </div>
                )}
            </div>
        </div>

        <div className="p-4 space-y-3">
            <button className="w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium shadow-sm hover:bg-gray-50 flex items-center justify-between group transition-all">
                <span className="flex items-center"><Edit size={18} className="mr-3 text-gray-400 group-hover:text-brand-500" /> Editar Perfil</span>
                <ChevronRight size={18} className="text-gray-300" />
            </button>
            <button className="w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium shadow-sm hover:bg-gray-50 flex items-center justify-between group transition-all">
                <span className="flex items-center"><CreditCard size={18} className="mr-3 text-gray-400 group-hover:text-brand-500" /> Minhas MiggroCoins</span>
                <span className="font-bold text-brand-600">{user.raizCoins} MG</span>
            </button>
            
            <button 
                onClick={() => setView(ViewState.ADMIN)}
                className="w-full mt-6 bg-gray-800 text-gray-200 py-3 px-4 rounded-xl font-medium shadow-sm hover:bg-gray-900 flex items-center justify-center transition-colors"
            >
                <Lock size={16} className="mr-2" />
                Painel Administrativo
            </button>
        </div>
        
        <p className="text-center text-xs mt-8 text-gray-300">Miggro MVP v1.3 • ID: {user.id}</p>
    </div>
  );
};

export default ProfileView;
