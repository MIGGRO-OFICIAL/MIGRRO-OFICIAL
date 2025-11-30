
import React from 'react';
import { Home, MessageCircle, HeartHandshake, Sparkles, Users } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  // Hide bottom nav if in Admin mode
  if (currentView === ViewState.ADMIN) {
    return null;
  }

  const navItems = [
    { view: ViewState.HOME, icon: Home, label: 'Início' },
    { view: ViewState.FEED, icon: MessageCircle, label: 'Feed' },
    { view: ViewState.AI_GUIDE, icon: Sparkles, label: 'Guia AI', special: true },
    { view: ViewState.GROUPS, icon: Users, label: 'Grupos' },
    { view: ViewState.SERVICES, icon: HeartHandshake, label: 'Ajuda' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50 shadow-lg">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          const Icon = item.icon;
          
          if (item.special) {
            return (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className={`relative -top-5 flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 ${
                  isActive 
                    ? 'bg-miggro-teal text-white ring-4 ring-brand-100' 
                    : 'bg-gradient-to-tr from-miggro-teal to-brand-300 text-white'
                }`}
              >
                <Icon size={24} />
              </button>
            );
          }

          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex flex-col items-center justify-center w-16 space-y-1 transition-colors ${
                isActive ? 'text-miggro-teal' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
