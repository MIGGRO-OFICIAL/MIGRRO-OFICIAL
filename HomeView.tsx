
import React from 'react';
import { User } from '../types';
import { CheckCircle2, Circle, MapPin, ArrowRight, Sun, Calendar, Users, Crown, Shield } from 'lucide-react';
import Logo from '../components/Logo';

interface HomeViewProps {
  user: User;
}

const HomeView: React.FC<HomeViewProps> = ({ user }) => {
  const steps = [
    { id: 1, title: 'Chegada e Check-in', completed: true },
    { id: 2, title: 'Chip de Celular Espanhol', completed: true },
    { id: 3, title: 'Empadronamiento (Registro)', completed: false },
    { id: 4, title: 'Agendar TIE (Polícia)', completed: false },
    { id: 5, title: 'Abrir conta bancária', completed: false },
  ];

  const progress = Math.round((steps.filter(s => s.completed).length / steps.length) * 100);

  return (
    <div className="pb-24 pt-4 px-4 space-y-6 max-w-md mx-auto">
      {/* Header */}
      <header className="flex justify-between items-start">
        <div>
          <div className="flex items-center mb-1">
             <Logo className="h-6" showText={false} />
             <h1 className="text-xl font-bold text-gray-900 ml-2">Olá, {user.name.split(' ')[0]}!</h1>
          </div>
          <div className="flex items-center text-gray-500 text-sm pl-1">
            <MapPin size={14} className="mr-1" />
            {user.location}
            <span className="mx-2">•</span>
            <Sun size={14} className="mr-1 text-orange-500" />
            22°C
          </div>
        </div>
        {!user.isPremium && (
            <button className="bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center animate-pulse">
                <Crown size={12} className="mr-1" />
                Seja Premium
            </button>
        )}
      </header>

      {/* Onboarding Journey Card - Improved */}
      <div className="relative overflow-hidden bg-gradient-to-br from-miggro-teal to-brand-700 rounded-2xl p-5 text-white shadow-xl shadow-brand-200/50">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg flex items-center">
                <Shield size={18} className="mr-2 text-brand-200" />
                Jornada de Imigração
            </h2>
            <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-medium">{progress}%</span>
            </div>
            
            <div className="w-full bg-brand-900/40 rounded-full h-2.5 mb-5">
            <div 
                className="bg-emerald-300 h-2.5 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(110,231,183,0.5)]" 
                style={{ width: `${progress}%` }}
            ></div>
            </div>

            <div className="space-y-3.5">
            {steps.slice(0, 3).map((step) => (
                <div key={step.id} className="flex items-center text-sm group cursor-pointer">
                {step.completed ? (
                    <CheckCircle2 size={18} className="text-emerald-300 mr-3 flex-shrink-0" />
                ) : (
                    <Circle size={18} className="text-brand-200/50 mr-3 flex-shrink-0 group-hover:text-white transition-colors" />
                )}
                <span className={step.completed ? 'opacity-70 line-through decoration-brand-400/50' : 'font-medium'}>
                    {step.title}
                </span>
                </div>
            ))}
            </div>
            
            <button className="mt-5 w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center transition-all">
                Continuar Check-list <ArrowRight size={16} className="ml-2" />
            </button>
        </div>
      </div>

      {/* Quick Actions / Categories */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-miggro-teal/30 hover:shadow-md transition-all cursor-pointer group">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Calendar size={20} className="text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-800">Eventos</h3>
          <p className="text-xs text-gray-500 mt-1">3 encontros perto de você</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-miggro-teal/30 hover:shadow-md transition-all cursor-pointer group">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Users size={20} className="text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-800">Mentoria</h3>
          <p className="text-xs text-gray-500 mt-1">Fale com um veterano</p>
        </div>
      </div>

      {/* Premium Teaser / Monetization */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4 text-white flex items-center justify-between shadow-lg">
        <div>
            <h4 className="font-bold text-amber-400 text-sm mb-1 flex items-center">
                <Crown size={14} className="mr-1" /> Miggro Premium
            </h4>
            <p className="text-xs text-gray-300 max-w-[200px]">
                Descontos em advogados, suporte prioritário e eventos exclusivos.
            </p>
        </div>
        <button className="bg-white text-gray-900 text-xs font-bold px-3 py-2 rounded-lg hover:bg-amber-50 transition-colors">
            Ver Planos
        </button>
      </div>

      {/* Daily Tip */}
      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start space-x-3">
        <span className="text-2xl">💡</span>
        <div>
          <h4 className="font-bold text-indigo-900 text-sm">Dica do Dia</h4>
          <p className="text-indigo-800 text-xs mt-1 leading-relaxed">
            Para o cartão de transporte em Madrid, você precisa de agendamento presencial se não tiver o TIE definitivo. O abono jovem custa apenas 20€!
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
